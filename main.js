// 1. 1階のマップ・初期位置・イベント処理をインポート
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';

// --- ホラー風フォントの読み込み ---
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- イベント状態管理 ---
let isEventPlaying = false; 

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
        alert(`【画像読み込みエラー】\n「${imageSources[key]}」が見つかりません！`);
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

// 台形マスク座標
const leftClips = {
    1: [{x:0, y:0}, {x:150, y:75}, {x:150, y:325}, {x:0, y:400}],
    2: [{x:150, y:75}, {x:220, y:135}, {x:220, y:265}, {x:150, y:325}],
    3: [{x:220, y:135}, {x:255, y:165}, {x:255, y:235}, {x:220, y:265}],
    4: [{x:255, y:165}, {x:275, y:180}, {x:275, y:220}, {x:255, y:235}]
};

const rightClips = {
    1: [{x:450, y:75}, {x:600, y:0}, {x:600, y:400}, {x:450, y:325}],
    2: [{x:380, y:135}, {x:450, y:75}, {x:450, y:325}, {x:380, y:265}],
    3: [{x:345, y:165}, {x:380, y:135}, {x:380, y:265}, {x:345, y:235}],
    4: [{x:325, y:180}, {x:345, y:165}, {x:345, y:235}, {x:325, y:220}]
};

const frontBounds = {
    4: { x: 275, y: 180, w: 50,  h: 40 },
    3: { x: 255, y: 165, w: 90,  h: 70 },
    2: { x: 220, y: 135, w: 160, h: 130 },
    1: { x: 150, y: 75,  w: 300, h: 250 }
};

const sideCornerSlots = {
    left: {
        1: { x: 0, y: 75, w: 150, h: 250 },
        2: { x: 150, y: 135, w: 70, h: 130 },
        3: { x: 220, y: 165, w: 35, h: 70 },
        4: { x: 255, y: 180, w: 20, h: 40 }
    },
    right: {
        1: { x: 450, y: 75, w: 150, h: 250 },
        2: { x: 380, y: 135, w: 70, h: 130 },
        3: { x: 345, y: 165, w: 35, h: 70 },
        4: { x: 325, y: 180, w: 20, h: 40 }
    }
};

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
        if (map1F[lY] && map1F[lY][lX] !== 0) {
            const imgKey = "left" + depth;
            if (images[imgKey] && images[imgKey].complete && images[imgKey].naturalWidth > 0) {
                const clip = leftClips[depth];
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(clip[0].x, clip[0].y);
                ctx.lineTo(clip[1].x, clip[1].y);
                ctx.lineTo(clip[2].x, clip[2].y);
                ctx.lineTo(clip[3].x, clip[3].y);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(images[imgKey], 0, 0, canvas.width, canvas.height);
                applyDepthShadow(clip, depth);
                ctx.restore();
            }
        } else {
            const lX_next = player.x + dx[player.dir] * depth + dx[leftDir];
            const lY_next = player.y + dy[player.dir] * depth + dy[leftDir];
            if (map1F[lY_next] && map1F[lY_next][lX_next] !== 0 && images.wall && images.wall.complete && images.wall.naturalWidth > 0) {
                const slot = sideCornerSlots.left[depth];
                ctx.drawImage(images.wall, slot.x, slot.y, slot.w, slot.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`;
                ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
            }
        }

        // --- 右側の描画 ---
        if (map1F[rY] && map1F[rY][rX] !== 0) {
            const imgKey = "right" + depth;
            if (images[imgKey] && images[imgKey].complete && images[imgKey].naturalWidth > 0) {
                const clip = rightClips[depth];
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(clip[0].x, clip[0].y);
                ctx.lineTo(clip[1].x, clip[1].y);
                ctx.lineTo(clip[2].x, clip[2].y);
                ctx.lineTo(clip[3].x, clip[3].y);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(images[imgKey], 0, 0, canvas.width, canvas.height);
                applyDepthShadow(clip, depth);
                ctx.restore();
            }
        } else {
            const rX_next = player.x + dx[player.dir] * depth + dx[rightDir];
            const rY_next = player.y + dy[player.dir] * depth + dy[rightDir];
            if (map1F[rY_next] && map1F[rY_next][rX_next] !== 0 && images.wall && images.wall.complete && images.wall.naturalWidth > 0) {
                const slot = sideCornerSlots.right[depth];
                ctx.drawImage(images.wall, slot.x, slot.y, slot.w, slot.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`;
                ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
            }
        }

        // --- 正面壁・扉の描画 ---
        if (map1F[fY] && map1F[fY][fX] !== 0) {
            const cellType = map1F[fY][fX];
            const b = frontBounds[depth];

            let targetImg = images.wall;
            // 4:非常階段, 2:通常扉, 3:コンビニ扉, 7:エレベーター
            if (cellType === 4 && images.stairDoor && images.stairDoor.complete) {
                targetImg = images.stairDoor;
            } else if ((cellType === 2 || cellType === 3 || cellType === 7) && images.door && images.door.complete) {
                targetImg = images.door;
            }

            if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
                ctx.drawImage(targetImg, b.x, b.y, b.w, b.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`;
                ctx.fillRect(b.x, b.y, b.w, b.h);
            }
        }
    }

    drawMiniMap();
    drawCompass();
    drawActionHint();
}

// --- 調べられる時のアクションヒント表示 ---
function drawActionHint() {
    const frontX = player.x + dx[player.dir];
    const frontY = player.y + dy[player.dir];
    const target = map1F[frontY] ? map1F[frontY][frontX] : 1;

    if ([3, 4, 5, 6, 7].includes(target)) {
        ctx.fillStyle = "rgba(15, 0, 0, 0.75)";
        ctx.fillRect(canvas.width / 2 - 90, canvas.height - 50, 180, 32);
        
        ctx.strokeStyle = "#550000";
        ctx.lineWidth = 1;
        ctx.strokeRect(canvas.width / 2 - 90, canvas.height - 50, 180, 32);

        ctx.fillStyle = "#ffdd66";
        ctx.font = `bold 16px ${HORROR_FONT}`;
        ctx.textAlign = "center";
        ctx.fillText("[ SPACE ] 調べる", canvas.width / 2, canvas.height - 28);
    }
}

// --- 背景・天井・床 ---
function drawEnvironment() {
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = "#140f0c";
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    [0, 100, 150, 220, 255].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(cx - x, cy);
        ctx.lineTo(0 - x * 2, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + x, cy);
        ctx.lineTo(canvas.width + x * 2, canvas.height);
        ctx.stroke();
    });
}

function applyDepthShadow(clip, depth) {
    const shadowAlpha = (depth - 1) * 0.22;
    if (shadowAlpha <= 0) return;

    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.moveTo(clip[0].x, clip[0].y);
    ctx.lineTo(clip[1].x, clip[1].y);
    ctx.lineTo(clip[2].x, clip[2].y);
    ctx.lineTo(clip[3].x, clip[3].y);
    ctx.closePath();
    ctx.fill();
}

function drawCompass() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(canvas.width - 90, 10, 80, 26);
    ctx.strokeStyle = "#555";
    ctx.strokeRect(canvas.width - 90, 10, 80, 26);

    ctx.fillStyle = "#ffdd66";
    ctx.font = `bold 14px ${HORROR_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(dirNames[player.dir], canvas.width - 50, 28);
}

function drawMiniMap() {
    const size = 8;
    const margin = 10;
    const mapW = map1F[0].length * size;
    const mapH = map1F.length * size;

    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(margin, margin, mapW + 6, mapH + 6);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin, mapW + 6, mapH + 6);

    for (let y = 0; y < map1F.length; y++) {
        for (let x = 0; x < map1F[y].length; x++) {
            const cell = map1F[y][x];
            if (cell !== 0) {
                ctx.fillStyle = cell === 1 ? "#555" : "#8a2be2";
                ctx.fillRect(margin + 3 + x * size, margin + 3 + y * size, size - 1, size - 1);
            }
        }
    }

    const px = margin + 3 + player.x * size + size / 2;
    const py = margin + 3 + player.y * size + size / 2;

    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(px, py, size / 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ff3333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + dx[player.dir] * (size + 2), py + dy[player.dir] * (size + 2));
    ctx.stroke();
}

// --- 調べる（interact）処理 ---
function interact() {
    if (isEventPlaying) return;

    const frontX = player.x + dx[player.dir];
    const frontY = player.y + dy[player.dir];
    const target = map1F[frontY] ? map1F[frontY][frontX] : 1;

    const action = handleEvent1F(target);

    if (action && action.type === "video") {
        playVideo(action.src, () => {
            if (action.next === "shop") openShopUI();
        });
    }
}

// --- ★動画再生関数の修正（サイズを小さくして枠を付ける） ---
function playVideo(src, onEnded) {
    isEventPlaying = true; 

    // 背景を暗くするオーバーレイレイヤー
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    overlay.style.zIndex = "999";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    document.body.appendChild(overlay);

    const video = document.createElement("video");
    video.src = src;
    
    // ★ 動画を枠で囲って適度なサイズに
    video.style.width = "60%"; // 画面幅の60%
    video.style.maxWidth = "600px"; // 最大でも600px
    video.style.border = "4px solid #550000"; // 赤黒い枠
    video.style.boxShadow = "0 0 30px rgba(255, 0, 0, 0.4)"; // ぼんやり光るエフェクト
    video.style.backgroundColor = "black";
    
    video.controls = false;
    video.autoplay = true;

    overlay.appendChild(video);

    // 終了処理
    video.onended = () => {
        overlay.remove();
        if (onEnded) onEnded();
    };

    // クリックでスキップ
    overlay.onclick = () => {
        video.pause();
        video.onended();
    };
}

// --- ショップUI表示関数 ---
function openShopUI() {
    isEventPlaying = true;

    const shopDiv = document.createElement("div");
    shopDiv.style.position = "absolute";
    shopDiv.style.top = "10%";
    shopDiv.style.left = "10%";
    shopDiv.style.width = "80%";
    shopDiv.style.height = "80%";
    shopDiv.style.backgroundColor = "rgba(10, 0, 0, 0.95)";
    shopDiv.style.color = "#ccc";
    shopDiv.style.border = "2px solid #550000";
    shopDiv.style.zIndex = "1000";
    shopDiv.style.display = "flex";
    shopDiv.style.flexDirection = "column";
    shopDiv.style.alignItems = "center";
    shopDiv.style.justifyContent = "center";
    shopDiv.style.fontFamily = HORROR_FONT; 

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
    btns.forEach(btn => {
        btn.onmouseover = () => btn.style.backgroundColor = "#330000";
        btn.onmouseout = () => btn.style.backgroundColor = "#111";
    });

    document.getElementById("buyBtn").onclick = () => alert("【アイテム画面】※後日実装予定");
    document.getElementById("sinBtn").onclick = () => alert("【罪の清算】※後日実装予定");

    document.getElementById("closeBtn").onclick = () => {
        shopDiv.remove();
        isEventPlaying = false; 
    };
}

// --- 移動処理 ---
function moveForward() {
    const nx = player.x + dx[player.dir];
    const ny = player.y + dy[player.dir];
    if (map1F[ny] && map1F[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
        draw();
    }
}

function moveBackward() {
    const nx = player.x - dx[player.dir];
    const ny = player.y - dy[player.dir];
    if (map1F[ny] && map1F[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
        draw();
    }
}

function turnLeft() {
    player.dir = (player.dir + 3) % 4;
    draw();
}

function turnRight() {
    player.dir = (player.dir + 1) % 4;
    draw();
}

// --- キー操作イベント ---
window.addEventListener("keydown", (e) => {
    if (isEventPlaying) return; 

    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") moveForward();
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") moveBackward();
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") turnLeft();
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") turnRight();
    if (e.key === " " || e.key === "Enter") interact();
});