// 1. 1階・2階のマップ・初期位置・イベント処理をインポート
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';
import { map2F, playerStart2F, handleEvent2F } from './maps/map2F.js';

// --- ホラー風フォントとアプリUI用スタイルの読み込み ---
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const appStyle = document.createElement("style");
appStyle.innerHTML = `
    .app-overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px);
        z-index: 3000; display: flex; justify-content: center; align-items: center;
    }
    .smartphone {
        width: 360px; height: 720px; background-color: #0d0d12;
        border: 4px solid #1a1a24; border-radius: 24px;
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.9), 0 0 15px rgba(100, 0, 0, 0.5);
        display: flex; flex-direction: column; overflow: hidden;
        font-family: 'Shippori Mincho', serif; color: #ddd; position: relative;
    }
    .app-header {
        background: linear-gradient(180deg, #220000, #000); padding: 8px 12px;
        font-size: 0.85em; display: flex; justify-content: space-between;
        border-bottom: 1px solid #550000; color: #aaa;
    }
    .app-header span { font-weight: bold; color: #ffdd66; }
    .app-content { flex: 1; padding: 20px; overflow-y: auto; position: relative; }
    .app-grid {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;
    }
    .app-icon {
        background-color: #111; border: 1px solid #330000; border-radius: 12px;
        padding: 20px 10px; text-align: center; cursor: pointer;
        transition: all 0.2s ease;
    }
    .app-icon:hover { background-color: #2a0000; border-color: #ff3333; }
    .app-icon-emoji { font-size: 2em; margin-bottom: 10px; }
    .app-icon-title { font-size: 0.9em; color: #ccc; }
    .app-footer {
        height: 50px; border-top: 1px solid #333; display: flex;
        justify-content: center; align-items: center; background-color: #050505;
    }
    .app-home-btn {
        width: 60px; height: 6px; background-color: #555; border-radius: 3px; cursor: pointer;
    }
    .app-home-btn:hover { background-color: #aaa; }
    
    /* サブ画面用スタイル */
    .sub-screen-title { font-size: 1.4em; color: #ff3333; margin-bottom: 20px; text-align: center; text-shadow: 0 0 5px red; border-bottom: 1px solid #550000; padding-bottom: 10px; }
    .loadout-slot { background: #111; border: 2px dashed #440000; padding: 15px; text-align: center; margin-bottom: 10px; color: #666; }
    .equipped-slot { border: 2px solid #ffdd66; color: #ffdd66; background: #221a00; }
    .card-list { display: flex; gap: 10px; overflow-x: auto; padding-top: 10px; }
    .card-item { border: 1px solid #555; padding: 5px; cursor: pointer; background: #000; text-align: center; }
    .card-item:hover { border-color: #ff3333; }
    .card-item img { max-width: 60px; display: block; margin-bottom: 5px; }
`;
document.head.appendChild(appStyle);

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- ゲームグローバル状態管理 ---
const gameState = {
    hasExorcistInherited: false, // エクソシストからの継承フラグ
    hasKey2F: false,             // 2F非常階段の鍵フラグ
    hasModelGun: false,          // モデルガン所持フラグ（2F用）
    cards: [],                   // 所持カードIDリスト
    equippedCards: [],           // 装填中のカードリスト
    level: 1,                    // 主人公のレベル
    hp: 100,                     // 現在HP
    maxHp: 100,                  // 最大HP
    sin: 0,                      // 罪（ペナルティ）ポイント
    familiarSync: 7              // 使い魔同期率(%)
};

// --- 階層データ管理 ---
let currentFloor = 1; // 1: 1階, 2: 2階
let currentMap = map1F;
let currentHandleEvent = handleEvent1F;

// --- イベント・メニュー状態管理 ---
let isEventPlaying = false; 
let isMenuOpen = false;

// --- 画像の読み込み処理 ---
const images = {};
const imageSources = {
    logo: "assets/images/akumanologo.png",
    door: "assets/images/door.png",
    wall: "assets/images/wall.png",
    stairDoor: "assets/images/stair_door.png",
    left1: "assets/images/leftwall1.png",
    left2: "assets/images/leftwall2.png",
    left3: "assets/images/leftwall3.png",
    left4: "assets/images/leftwall4.png",
    right1: "assets/images/rightwall1.png",
    right2: "assets/images/rightwall2.png",
    right3: "assets/images/rightwall3.png",
    right4: "assets/images/rightwall4.png"
};

let loadedCount = 0;
const totalImages = Object.keys(imageSources).length;

function checkAllLoaded() {
    loadedCount++;
    if (loadedCount === totalImages) {
        setTimeout(draw, 200); 
    }
}

for (let key in imageSources) {
    images[key] = new Image();
    images[key].onload = checkAllLoaded;
    images[key].onerror = () => {
        console.warn(`【画像読み込み警告】「${imageSources[key]}」が見つかりません（プレースホルダーを使用します）。`);
        checkAllLoaded();
    };
    images[key].src = imageSources[key];
}

// --- プレイヤー設定 ---
let player = {
    x: playerStart1F.x,
    y: playerStart1F.y,
    dir: playerStart1F.dir
};

const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];
const dirNames = ["北 (N)", "東 (E)", "南 (S)", "西 (W)"];
const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

// 描画関連の座標データ（省略せずに記載）
const leftClips = { 1: [{x:0, y:0}, {x:150, y:75}, {x:150, y:325}, {x:0, y:400}], 2: [{x:150, y:75}, {x:220, y:135}, {x:220, y:265}, {x:150, y:325}], 3: [{x:220, y:135}, {x:255, y:165}, {x:255, y:235}, {x:220, y:265}], 4: [{x:255, y:165}, {x:275, y:180}, {x:275, y:220}, {x:255, y:235}] };
const rightClips = { 1: [{x:450, y:75}, {x:600, y:0}, {x:600, y:400}, {x:450, y:325}], 2: [{x:380, y:135}, {x:450, y:75}, {x:450, y:325}, {x:380, y:265}], 3: [{x:345, y:165}, {x:380, y:135}, {x:380, y:265}, {x:345, y:235}], 4: [{x:325, y:180}, {x:345, y:165}, {x:345, y:235}, {x:325, y:220}] };
const frontBounds = { 4: { x: 275, y: 180, w: 50, h: 40 }, 3: { x: 255, y: 165, w: 90, h: 70 }, 2: { x: 220, y: 135, w: 160, h: 130 }, 1: { x: 150, y: 75, w: 300, h: 250 } };
const sideCornerSlots = { left: { 1: { x: 0, y: 75, w: 150, h: 250 }, 2: { x: 150, y: 135, w: 70, h: 130 }, 3: { x: 220, y: 165, w: 35, h: 70 }, 4: { x: 255, y: 180, w: 20, h: 40 } }, right: { 1: { x: 450, y: 75, w: 150, h: 250 }, 2: { x: 380, y: 135, w: 70, h: 130 }, 3: { x: 345, y: 165, w: 35, h: 70 }, 4: { x: 325, y: 180, w: 20, h: 40 } } };

// --- 描画メイン関数 ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEnvironment();

    const leftDir = (player.dir + 3) % 4;
    const rightDir = (player.dir + 1) % 4;

    for (let depth = 4; depth >= 1; depth--) {
        const forwardOffset = depth - 1;
        const fX = player.x + dx[player.dir] * depth;
        const fY = player.y + dy[player.dir] * depth;
        const lX = player.x + dx[player.dir] * forwardOffset + dx[leftDir];
        const lY = player.y + dy[player.dir] * forwardOffset + dy[leftDir];
        const rX = player.x + dx[player.dir] * forwardOffset + dx[rightDir];
        const rY = player.y + dy[player.dir] * forwardOffset + dy[rightDir];

        // --- 左側の描画 ---
        if (currentMap[lY] && currentMap[lY][lX] !== 0) {
            const imgKey = "left" + depth;
            if (images[imgKey] && images[imgKey].complete && images[imgKey].naturalWidth > 0) {
                const clip = leftClips[depth];
                ctx.save(); ctx.beginPath(); ctx.moveTo(clip[0].x, clip[0].y); ctx.lineTo(clip[1].x, clip[1].y); ctx.lineTo(clip[2].x, clip[2].y); ctx.lineTo(clip[3].x, clip[3].y); ctx.closePath(); ctx.clip();
                ctx.drawImage(images[imgKey], 0, 0, canvas.width, canvas.height);
                applyDepthShadow(clip, depth); ctx.restore();
            }
        } else {
            const lX_next = player.x + dx[player.dir] * depth + dx[leftDir];
            const lY_next = player.y + dy[player.dir] * depth + dy[leftDir];
            if (currentMap[lY_next] && currentMap[lY_next][lX_next] !== 0 && images.wall && images.wall.complete) {
                const slot = sideCornerSlots.left[depth];
                ctx.drawImage(images.wall, slot.x, slot.y, slot.w, slot.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`; ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
            }
        }

        // --- 右側の描画 ---
        if (currentMap[rY] && currentMap[rY][rX] !== 0) {
            const imgKey = "right" + depth;
            if (images[imgKey] && images[imgKey].complete && images[imgKey].naturalWidth > 0) {
                const clip = rightClips[depth];
                ctx.save(); ctx.beginPath(); ctx.moveTo(clip[0].x, clip[0].y); ctx.lineTo(clip[1].x, clip[1].y); ctx.lineTo(clip[2].x, clip[2].y); ctx.lineTo(clip[3].x, clip[3].y); ctx.closePath(); ctx.clip();
                ctx.drawImage(images[imgKey], 0, 0, canvas.width, canvas.height);
                applyDepthShadow(clip, depth); ctx.restore();
            }
        } else {
            const rX_next = player.x + dx[player.dir] * depth + dx[rightDir];
            const rY_next = player.y + dy[player.dir] * depth + dy[rightDir];
            if (currentMap[rY_next] && currentMap[rY_next][rX_next] !== 0 && images.wall && images.wall.complete) {
                const slot = sideCornerSlots.right[depth];
                ctx.drawImage(images.wall, slot.x, slot.y, slot.w, slot.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`; ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
            }
        }

        // --- 正面壁・扉の描画 ---
        if (currentMap[fY] && currentMap[fY][fX] !== 0) {
            const cellType = currentMap[fY][fX];
            const b = frontBounds[depth];
            let targetImg = images.wall;
            if (cellType === 4 && images.stairDoor && images.stairDoor.complete) targetImg = images.stairDoor;
            else if ((cellType === 2 || cellType === 3 || cellType === 7) && images.door && images.door.complete) targetImg = images.door;

            if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
                ctx.drawImage(targetImg, b.x, b.y, b.w, b.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`; ctx.fillRect(b.x, b.y, b.w, b.h);
            }
        }
    }

    drawMiniMap();
    drawCompass();
    drawActionHint();
    
    // UIのナビゲーション追加表示
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(10, canvas.height - 30, 160, 25);
    ctx.fillStyle = "#fff";
    ctx.font = `12px ${HORROR_FONT}`;
    ctx.textAlign = "left";
    ctx.fillText("[ ESC ] アプリを開く", 20, canvas.height - 13);
}

// （drawActionHint, drawEnvironment, applyDepthShadow, drawCompass, drawMiniMapは変更なしのため省略せず記述）
function drawActionHint() {
    const frontX = player.x + dx[player.dir];
    const frontY = player.y + dy[player.dir];
    const target = currentMap[frontY] ? currentMap[frontY][frontX] : 1;
    if ([2, 3, 4, 5, 6, 7].includes(target)) {
        ctx.fillStyle = "rgba(15, 0, 0, 0.75)"; ctx.fillRect(canvas.width / 2 - 90, canvas.height - 50, 180, 32);
        ctx.strokeStyle = "#550000"; ctx.lineWidth = 1; ctx.strokeRect(canvas.width / 2 - 90, canvas.height - 50, 180, 32);
        ctx.fillStyle = "#ffdd66"; ctx.font = `bold 16px ${HORROR_FONT}`; ctx.textAlign = "center"; ctx.fillText("[ SPACE ] 調べる", canvas.width / 2, canvas.height - 28);
    }
}
function drawEnvironment() {
    ctx.fillStyle = "#0a0a0c"; ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = "#140f0c"; ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"; ctx.lineWidth = 1;
    const cx = canvas.width / 2; const cy = canvas.height / 2;
    [0, 100, 150, 220, 255].forEach(x => {
        ctx.beginPath(); ctx.moveTo(cx - x, cy); ctx.lineTo(0 - x * 2, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + x, cy); ctx.lineTo(canvas.width + x * 2, canvas.height); ctx.stroke();
    });
}
function applyDepthShadow(clip, depth) {
    const shadowAlpha = (depth - 1) * 0.22;
    if (shadowAlpha <= 0) return;
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath(); ctx.moveTo(clip[0].x, clip[0].y); ctx.lineTo(clip[1].x, clip[1].y); ctx.lineTo(clip[2].x, clip[2].y); ctx.lineTo(clip[3].x, clip[3].y); ctx.closePath(); ctx.fill();
}
function drawCompass() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; ctx.fillRect(canvas.width - 90, 10, 80, 26);
    ctx.strokeStyle = "#555"; ctx.strokeRect(canvas.width - 90, 10, 80, 26);
    ctx.fillStyle = "#ffdd66"; ctx.font = `bold 14px ${HORROR_FONT}`; ctx.textAlign = "center"; ctx.fillText(`${currentFloor}F: ` + dirNames[player.dir], canvas.width - 50, 28);
}
function drawMiniMap() {
    const size = 8; const margin = 10;
    const mapW = currentMap[0].length * size; const mapH = currentMap.length * size;
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)"; ctx.fillRect(margin, margin, mapW + 6, mapH + 6);
    ctx.strokeStyle = "#444"; ctx.lineWidth = 1; ctx.strokeRect(margin, margin, mapW + 6, mapH + 6);
    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            const cell = currentMap[y][x];
            if (cell !== 0) {
                ctx.fillStyle = cell === 1 ? "#555" : "#8a2be2";
                ctx.fillRect(margin + 3 + x * size, margin + 3 + y * size, size - 1, size - 1);
            }
        }
    }
    const px = margin + 3 + player.x * size + size / 2; const py = margin + 3 + player.y * size + size / 2;
    ctx.fillStyle = "#ff3333"; ctx.beginPath(); ctx.arc(px, py, size / 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ff3333"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + dx[player.dir] * (size + 2), py + dy[player.dir] * (size + 2)); ctx.stroke();
}

// --- ★スマホUI（悪魔辞典アプリ）の管理 ---
function toggleMenu() {
    if (isEventPlaying) return; // イベント中は開けない
    
    if (isMenuOpen) {
        // メニューを閉じる
        const overlay = document.getElementById("app-overlay");
        if (overlay) overlay.remove();
        isMenuOpen = false;
    } else {
        // メニューを開く
        if (!gameState.hasExorcistInherited) {
            // アプリ未入手の場合
            showMessageDialog("【システム】\nまだ『悪魔辞典アプリ』を所持していません。\n1階を探索して手がかりを見つけてください。");
            return;
        }
        
        isMenuOpen = true;
        const overlay = document.createElement("div");
        overlay.id = "app-overlay";
        overlay.className = "app-overlay";
        
        // スマホ本体のコンテナ
        overlay.innerHTML = `
            <div class="smartphone">
                <div class="app-header">
                    <div>Lv.<span>${gameState.level}</span></div>
                    <div>HP: <span>${gameState.hp}</span>/${gameState.maxHp}</div>
                    <div>SIN: <span>${gameState.sin}</span></div>
                    <div>SYNC: <span>${gameState.familiarSync}%</span></div>
                </div>
                <div id="app-content" class="app-content">
                    <!-- コンテンツがここに描画される -->
                </div>
                <div class="app-footer">
                    <div class="app-home-btn" onclick="renderAppHome()"></div>
                </div>
            </div>
            <div style="position: absolute; bottom: 20px; color: #888; font-family: ${HORROR_FONT};">▼ [ESC] キーで閉じる</div>
        `;
        document.body.appendChild(overlay);
        renderAppHome(); // 初期画面（ホーム）を描画
    }
}

// アプリホーム画面の描画
window.renderAppHome = function() {
    const content = document.getElementById("app-content");
    if (!content) return;
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="assets/images/akumanologo.png" style="max-width: 80%; opacity: 0.8;" onerror="this.style.display='none'">
            <div style="color: #666; font-size: 0.8em; margin-top: 10px;">Ver 4.0.0 (禁忌版)</div>
        </div>
        <div class="app-grid">
            <div class="app-icon" onclick="renderLoadout()">
                <div class="app-icon-emoji">🔫</div>
                <div class="app-icon-title">ラミナ装填</div>
            </div>
            <div class="app-icon" onclick="alert('未実装: 遺言や敵の弱点ヒントが読める機能です')">
                <div class="app-icon-emoji">📜</div>
                <div class="app-icon-title">悪魔手記</div>
            </div>
            <div class="app-icon" onclick="alert('未実装: ドリンクや傘などのアイテム管理画面です')">
                <div class="app-icon-emoji">🎒</div>
                <div class="app-icon-title">所持品</div>
            </div>
            <div class="app-icon" onclick="alert('未実装: 現在の同期率は ${gameState.familiarSync}% です。Lv15で実体化します。')">
                <div class="app-icon-emoji">👁️</div>
                <div class="app-icon-title">使い魔</div>
            </div>
            <div class="app-icon" onclick="alert('未実装: ポストへの投函履歴や探索目標を確認できます')">
                <div class="app-icon-emoji">📝</div>
                <div class="app-icon-title">調査ログ</div>
            </div>
            <div class="app-icon" onclick="alert('未実装: セーブ＆ロード画面です')">
                <div class="app-icon-emoji">💾</div>
                <div class="app-icon-title">システム</div>
            </div>
        </div>
    `;
};

// ラミナ装填画面の描画
window.renderLoadout = function() {
    const content = document.getElementById("app-content");
    if (!content) return;
    
    // スロット数の計算（Lv1で1枠, Lv5で2枠...という想定）
    const slotCount = Math.floor((gameState.level - 1) / 5) + 1;
    let slotsHTML = "";
    
    for (let i = 0; i < slotCount; i++) {
        const equippedCard = gameState.equippedCards[i] ? gameState.equippedCards[i] : "空きスロット";
        const cssClass = gameState.equippedCards[i] ? "loadout-slot equipped-slot" : "loadout-slot";
        slotsHTML += `<div class="${cssClass}">SLOT ${i+1} : ${equippedCard}</div>`;
    }
    
    // 所持カードのHTML生成
    let cardsHTML = "";
    if (gameState.cards.length === 0) {
        cardsHTML = "<div style='color: #555; text-align: center; margin-top: 20px;'>所持しているラミナがありません。</div>";
    } else {
        gameState.cards.forEach(card => {
            cardsHTML += `
                <div class="card-item" onclick="equipCard('${card}')">
                    <img src="assets/images/cards/${card}" onerror="this.src=''">
                    <div style="font-size: 0.7em;">装備</div>
                </div>
            `;
        });
    }

    content.innerHTML = `
        <div class="sub-screen-title">ラミナ装填 (Loadout)</div>
        <div style="margin-bottom: 20px;">
            ${slotsHTML}
        </div>
        <div style="border-top: 1px solid #333; padding-top: 10px;">
            <div style="font-size: 0.9em; color: #888; margin-bottom: 5px;">所持ラミナ (タップでSLOT1にセット)</div>
            <div class="card-list">
                ${cardsHTML}
            </div>
        </div>
        <div style="margin-top: 30px; text-align: center;">
            <div style="font-size: 0.8em; color: #555;">※レベルが上がると装填枠（スロット）が増加します。</div>
        </div>
    `;
};

// カード装備処理（現状はスロット1に上書きするだけの簡易版）
window.equipCard = function(cardName) {
    gameState.equippedCards[0] = cardName;
    renderLoadout(); // 画面を再描画して反映
};

// --- 調べる（interact）処理 ---
function interact() {
    if (isEventPlaying || isMenuOpen) return;

    const frontX = player.x + dx[player.dir];
    const frontY = player.y + dy[player.dir];
    const target = currentMap[frontY] ? currentMap[frontY][frontX] : 1;
    const action = currentHandleEvent(target, gameState);

    if (action) {
        if (action.type === "video") {
            playVideo(action.src, () => {
                if (action.next === "shop") openShopUI();
                if (action.next === "message") showMessageDialog(action.text);
            });
        } else if (action.type === "message") {
            showMessageDialog(action.text);
        } else if (action.type === "changeFloor") {
            changeFloor(action.targetFloor);
        } else if (action.type === "exorcistSequence") {
            startExorcistSequence();
        }
    }
}

// （startExorcistSequence, showCardAcquiredModal, showMessageDialog, changeFloor, playVideo, openShopUI は変更なしのため省略せず記述）
function startExorcistSequence() {
    const introMsg = "【血の池】\nマンションの中庭に血の池が湧いて、池の底から無数の人ならざる者がこの世に出ようともがいているのが見える……";
    showMessageDialog(introMsg, () => {
        playVideo("assets/videos/BloodPond.mp4", () => {
            playVideo("assets/videos/exorcist.mp4", () => {
                const msg = "【瀕死のエクソシスト】\n「……気づいて……くださったのですね……。ワタシはもう……長くありません……」\n\n「ワタシのスマホ……『悪魔辞典アプリ』と、退魔の札『LAMINA EXORCISMI（ラミナ）』……そして使い魔と2階非常階段の鍵を……あなたに託します……」\n\n「9枚のラミナで悪魔を見極め……使い魔はLv.15であなたの助けに……」";
                showMessageDialog(msg, () => {
                    showCardAcquiredModal("1Card.png", "退魔の札『ラミナ』", "『悪魔辞典アプリ』『使い魔（Lv.15から）』『2F非常階段の鍵』を受け継いだ！", () => {
                        const deathMsg = "【衝撃の光景】\n話し終えた直後、血の池がどす黒く泡立ち始めた！\n\n無数の黒い腕が池から這い出し、エクソシストの体にまとわりつく……！\n\n絶叫とともに、エクソシストは血の池の底へと引きずり込まれ、完全に姿を消した。";
                        showMessageDialog(deathMsg, () => {
                            gameState.hasExorcistInherited = true;
                            gameState.hasKey2F = true;
                            gameState.cards.push("1Card.png"); // アプリ内で読み込めるように拡張子まで入れる
                        });
                    });
                });
            });
        });
    });
}
function showCardAcquiredModal(imageName, cardTitle, detailText, onClosed) {
    isEventPlaying = true;
    const modal = document.createElement("div");
    modal.style.position = "absolute"; modal.style.top = "0"; modal.style.left = "0"; modal.style.width = "100%"; modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.88)"; modal.style.zIndex = "2500"; modal.style.display = "flex"; modal.style.flexDirection = "column"; modal.style.alignItems = "center"; modal.style.justifyContent = "center"; modal.style.fontFamily = HORROR_FONT;
    modal.innerHTML = `
        <div style="color: #ff3333; font-size: 1.8em; margin-bottom: 15px; text-shadow: 0 0 10px red; letter-spacing: 3px;">― 遺志の継承 ―</div>
        <img src="assets/images/cards/${imageName}" style="max-height: 240px; border: 3px solid #770000; box-shadow: 0 0 25px rgba(255,0,0,0.5); margin-bottom: 15px; border-radius: 6px;">
        <div style="color: #ffdd66; font-size: 1.5em; font-weight: bold; margin-bottom: 8px;">${cardTitle}</div>
        <div style="color: #cccccc; font-size: 1.1em; margin-bottom: 25px; text-align: center; white-space: pre-wrap;">${detailText}</div>
        <div style="color: #888; font-size: 0.9em;">[ SPACE ] キー または クリックで閉じる</div>
    `;
    document.body.appendChild(modal);
    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler); modal.onclick = null; modal.remove(); isEventPlaying = false;
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { modal.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}
function showMessageDialog(text, onClosed) {
    isEventPlaying = true;
    const msgDiv = document.createElement("div");
    msgDiv.style.position = "absolute"; msgDiv.style.bottom = "12%"; msgDiv.style.left = "10%"; msgDiv.style.width = "80%"; msgDiv.style.padding = "25px 30px";
    msgDiv.style.backgroundColor = "rgba(10, 0, 0, 0.92)"; msgDiv.style.color = "#dddddd"; msgDiv.style.border = "2px solid #550000"; msgDiv.style.borderRadius = "4px"; msgDiv.style.zIndex = "2000"; msgDiv.style.fontFamily = HORROR_FONT; msgDiv.style.fontSize = "1.2em"; msgDiv.style.lineHeight = "1.8"; msgDiv.style.whiteSpace = "pre-wrap"; msgDiv.style.boxShadow = "0 0 20px rgba(0,0,0,0.8)";
    msgDiv.innerText = text;
    const closeHint = document.createElement("div"); closeHint.style.marginTop = "15px"; closeHint.style.textAlign = "right"; closeHint.style.color = "#888888"; closeHint.style.fontSize = "0.85em"; closeHint.innerText = "▼ クリックまたは [ SPACE ] で閉じる";
    msgDiv.appendChild(closeHint); document.body.appendChild(msgDiv);
    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler); msgDiv.onclick = null; msgDiv.remove(); isEventPlaying = false;
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { msgDiv.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}
function changeFloor(targetFloor) {
    isEventPlaying = true;
    const fadeDiv = document.createElement("div");
    fadeDiv.style.position = "absolute"; fadeDiv.style.top = "0"; fadeDiv.style.left = "0"; fadeDiv.style.width = "100%"; fadeDiv.style.height = "100%"; fadeDiv.style.backgroundColor = "black"; fadeDiv.style.zIndex = "2000"; fadeDiv.style.transition = "opacity 0.5s ease"; fadeDiv.style.opacity = "0"; fadeDiv.style.display = "flex"; fadeDiv.style.justifyContent = "center"; fadeDiv.style.alignItems = "center"; fadeDiv.style.color = "#ff3333"; fadeDiv.style.fontFamily = HORROR_FONT; fadeDiv.style.fontSize = "1.8em";
    document.body.appendChild(fadeDiv);
    setTimeout(() => { fadeDiv.style.opacity = "1"; fadeDiv.innerText = targetFloor === 2 ? "2階へ登っている..." : "1階へ下りている..."; }, 10);
    setTimeout(() => {
        currentFloor = targetFloor;
        if (currentFloor === 2) {
            currentMap = map2F; currentHandleEvent = handleEvent2F; player.x = playerStart2F.x; player.y = playerStart2F.y; player.dir = playerStart2F.dir;
        } else {
            currentMap = map1F; currentHandleEvent = handleEvent1F; player.x = 7; player.y = 1; player.dir = 2;
        }
        draw();
        setTimeout(() => { fadeDiv.style.opacity = "0"; setTimeout(() => { fadeDiv.remove(); isEventPlaying = false; }, 500); }, 800);
    }, 600);
}
function playVideo(src, onEnded) {
    isEventPlaying = true; 
    const overlay = document.createElement("div");
    overlay.style.position = "absolute"; overlay.style.top = "0"; overlay.style.left = "0"; overlay.style.width = "100%"; overlay.style.height = "100%"; overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; overlay.style.zIndex = "1800"; overlay.style.display = "flex"; overlay.style.justifyContent = "center"; overlay.style.alignItems = "center";
    document.body.appendChild(overlay);
    const video = document.createElement("video");
    video.src = src; video.style.width = "60%"; video.style.maxWidth = "600px"; video.style.border = "4px solid #550000"; video.style.boxShadow = "0 0 30px rgba(255, 0, 0, 0.4)"; video.style.backgroundColor = "black"; video.controls = false; video.autoplay = true;
    overlay.appendChild(video);
    video.onended = () => { overlay.remove(); if (onEnded) onEnded(); };
    overlay.onclick = () => { video.pause(); video.onended(); };
}
function openShopUI() {
    isEventPlaying = true;
    const shopDiv = document.createElement("div");
    shopDiv.style.position = "absolute"; shopDiv.style.top = "10%"; shopDiv.style.left = "10%"; shopDiv.style.width = "80%"; shopDiv.style.height = "80%"; shopDiv.style.backgroundColor = "rgba(10, 0, 0, 0.95)"; shopDiv.style.color = "#ccc"; shopDiv.style.border = "2px solid #550000"; shopDiv.style.zIndex = "1000"; shopDiv.style.display = "flex"; shopDiv.style.flexDirection = "column"; shopDiv.style.alignItems = "center"; shopDiv.style.justifyContent = "center"; shopDiv.style.fontFamily = HORROR_FONT; 
    shopDiv.innerHTML = `
        <h2 style="color: #ff3333; margin-bottom: 20px; font-size: 2.5em; text-shadow: 2px 2px 10px black; letter-spacing: 5px;">悪魔の無人レジ</h2>
        <p style="margin-bottom: 50px; font-size: 1.2em; color: #aaa;">青白い画面に不気味な文字が羅列されている...</p>
        <div style="display: flex; gap: 30px; margin-bottom: 50px;">
            <button id="buyBtn" style="background: #111; color: #ddd; border: 1px solid #555; padding: 15px 40px; font-size: 1.3em; cursor: pointer; font-family: ${HORROR_FONT}; transition: 0.2s;">供物（アイテム）を買う</button>
            <button id="sinBtn" style="background: #111; color: #ff3333; border: 1px solid #770000; padding: 15px 40px; font-size: 1.3em; cursor: pointer; font-family: ${HORROR_FONT}; transition: 0.2s;">罪を清算する</button>
        </div>
        <button id="closeBtn" style="background: transparent; color: #777; border: none; font-size: 1.1em; cursor: pointer; font-family: ${HORROR_FONT}; text-decoration: underline;">立ち去る</button>
    `;
    document.body.appendChild(shopDiv);
    const btns = [document.getElementById("buyBtn"), document.getElementById("sinBtn")];
    btns.forEach(btn => { btn.onmouseover = () => btn.style.backgroundColor = "#330000"; btn.onmouseout = () => btn.style.backgroundColor = "#111"; });
    document.getElementById("buyBtn").onclick = () => alert("【アイテム画面】※後日実装予定");
    document.getElementById("sinBtn").onclick = () => alert("【罪の清算】※後日実装予定");
    document.getElementById("closeBtn").onclick = () => { shopDiv.remove(); isEventPlaying = false; };
}

// --- 移動処理 ---
function moveForward() {
    const nx = player.x + dx[player.dir]; const ny = player.y + dy[player.dir];
    if (currentMap[ny] && currentMap[ny][nx] === 0) { player.x = nx; player.y = ny; draw(); }
}
function moveBackward() {
    const nx = player.x - dx[player.dir]; const ny = player.y - dy[player.dir];
    if (currentMap[ny] && currentMap[ny][nx] === 0) { player.x = nx; player.y = ny; draw(); }
}
function turnLeft() { player.dir = (player.dir + 3) % 4; draw(); }
function turnRight() { player.dir = (player.dir + 1) % 4; draw(); }

// --- キー操作イベント ---
window.addEventListener("keydown", (e) => {
    // 【ESCキーでメニュー開閉】
    if (e.key === "Escape") {
        toggleMenu();
        return;
    }

    if (isEventPlaying || isMenuOpen) return; // イベント中・メニュー中は移動や調べる操作を無効化

    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") moveForward();
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") moveBackward();
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") turnLeft();
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") turnRight();
    if (e.key === " " || e.key === "Enter") interact();
});