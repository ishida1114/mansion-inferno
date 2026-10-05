// appUI.js
import { gameState } from './gameState.js';
import { applyChromaKey, showMessageDialog } from './ui.js';

let isMenuOpen = false;
const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

const appStyle = document.createElement("style");
appStyle.innerHTML = `
    .app-overlay { 
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background-color: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px); 
        z-index: 3000; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px;
    }
    .smartphone { 
        width: 360px; height: 700px; max-width: 90vw; max-height: 85vh; background-color: #0d0d12; 
        border: 4px solid #1a1a24; border-radius: 24px; 
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.9), 0 0 15px rgba(100, 0, 0, 0.5); 
        display: flex; flex-direction: column; overflow: hidden; 
        font-family: 'Shippori Mincho', serif; color: #ddd; position: relative; 
    }
    .app-header { background: linear-gradient(180deg, #220000, #000); padding: 8px 12px; font-size: 0.85em; display: flex; justify-content: space-between; border-bottom: 1px solid #550000; color: #aaa; }
    .app-header span { font-weight: bold; color: #ffdd66; }
    .app-content { flex: 1; padding: 20px; overflow-y: auto; position: relative; }
    .app-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .app-icon { background-color: #111; border: 1px solid #330000; border-radius: 12px; padding: 20px 10px; text-align: center; cursor: pointer; transition: all 0.2s ease; }
    .app-icon:hover { background-color: #2a0000; border-color: #ff3333; }
    .app-icon-emoji { font-size: 2em; margin-bottom: 10px; }
    .app-icon-title { font-size: 0.9em; color: #ccc; }
    .app-footer { height: 40px; border-top: 1px solid #333; display: flex; justify-content: center; align-items: center; background-color: #050505; }
    .app-home-btn { width: 60px; height: 6px; background-color: #555; border-radius: 3px; cursor: pointer; }
    .app-home-btn:hover { background-color: #aaa; }
    
    .sub-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #550000; padding-bottom: 10px; margin-bottom: 15px; }
    .back-btn { cursor: pointer; color: #888; font-size: 0.9em; transition: color 0.2s; padding: 5px; }
    .back-btn:hover { color: #fff; }
    .sub-title { font-size: 1.3em; color: #ff3333; text-shadow: 0 0 5px red; margin: 0; text-align: center; flex: 1; font-weight: bold; }
    .loadout-slot { background: #111; border: 2px dashed #440000; padding: 15px; text-align: center; margin-bottom: 10px; color: #666; }
    .equipped-slot { border: 2px solid #ffdd66; color: #ffdd66; background: #221a00; }
    .card-list { display: flex; gap: 10px; overflow-x: auto; padding-top: 10px; }
    .card-item { border: 1px solid #555; padding: 5px; cursor: pointer; background: #000; text-align: center; }
    .card-item:hover { border-color: #ff3333; }
    .card-item img { max-width: 60px; display: block; margin-bottom: 5px; }
`;
document.head.appendChild(appStyle);

export function toggleMenu() {
    if (isMenuOpen) {
        const overlay = document.getElementById("app-overlay");
        if (overlay) overlay.remove();
        isMenuOpen = false;
        return false;
    } else {
        if (!gameState.hasExorcistInherited) {
            showMessageDialog("【システム】\nまだ『悪魔辞典アプリ』を所持していません。");
            return false;
        }
        isMenuOpen = true;
        createAppOverlay();
        renderAppHome(); 
        return true;
    }
}

// チュートリアル用：直接ラミナ装填画面を開く
export function openAppToLoadout() {
    if (!isMenuOpen) {
        isMenuOpen = true;
        createAppOverlay();
    }
    renderLoadout();
}

function createAppOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "app-overlay"; 
    overlay.className = "app-overlay";
    
    overlay.innerHTML = `
        <div class="smartphone">
            <div class="app-header">
                <div>Lv.<span>${gameState.level}</span></div>
                <div>HP: <span>${gameState.hp}</span>/${gameState.maxHp}</div>
                <div>SIN: <span>${gameState.sin}</span></div>
                <div>💰: <span>${gameState.money}</span></div>
            </div>
            <div id="app-content" class="app-content"></div>
            <div class="app-footer"><div class="app-home-btn" id="app-home-trigger" title="ホームに戻る"></div></div>
        </div>
        <button id="app-close-btn" style="background: rgba(30,0,0,0.8); color: #fff; border: 1px solid #ff3333; padding: 8px 20px; border-radius: 20px; font-family: ${HORROR_FONT}; cursor: pointer;">閉じる [ESC]</button>
    `;
    document.body.appendChild(overlay);
    document.getElementById("app-home-trigger").onclick = renderAppHome;
    document.getElementById("app-close-btn").onclick = toggleMenu;
}

export function isAppMenuOpen() {
    return isMenuOpen;
}

export function renderAppHome() {
    const content = document.getElementById("app-content");
    if (!content) return;
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <img src="assets/images/DictionariumDaemonum.webp" style="max-width: 80%; opacity: 0.8;" onerror="this.style.display='none'">
        </div>
        <div style="background: #111; padding: 12px; border-radius: 8px; border: 1px solid #330000; margin-bottom: 20px; font-size: 0.9em;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #333; padding-bottom: 5px;">
                <span>EXP: <span style="color:#ffdd66;">${gameState.exp}</span></span>
                <span>SYNC: <span style="color:#00ffcc;">${gameState.familiarSync}%</span></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>DEF (頑丈さ): <span style="color:#fff;">${gameState.def}</span></span>
                <span>AGI (素速さ): <span style="color:#fff;">${gameState.agi}</span></span>
            </div>
        </div>
        <div class="app-grid">
            <div class="app-icon" id="btn-loadout"><div class="app-icon-emoji">🔫</div><div class="app-icon-title">ラミナ装填</div></div>
            <div class="app-icon" id="btn-notes"><div class="app-icon-emoji">📜</div><div class="app-icon-title">悪魔手記</div></div>
            <div class="app-icon" id="btn-items"><div class="app-icon-emoji">🎒</div><div class="app-icon-title">所持品</div></div>
            <div class="app-icon" id="btn-familiar"><div class="app-icon-emoji">👁️</div><div class="app-icon-title">使い魔</div></div>
            <div class="app-icon" id="btn-log"><div class="app-icon-emoji">📝</div><div class="app-icon-title">調査ログ</div></div>
            <div class="app-icon" id="btn-system"><div class="app-icon-emoji">💾</div><div class="app-icon-title">システム</div></div>
        </div>
    `;

    document.getElementById("btn-loadout").onclick = renderLoadout;
    document.getElementById("btn-notes").onclick = () => alert("未実装");
    document.getElementById("btn-items").onclick = () => alert("未実装");
    document.getElementById("btn-familiar").onclick = () => alert(`未実装 (同期率: ${gameState.familiarSync}%)`);
    document.getElementById("btn-log").onclick = () => alert("未実装");
    document.getElementById("btn-system").onclick = () => alert("未実装");
}

export function renderLoadout() {
    const content = document.getElementById("app-content");
    if (!content) return;
    if (!gameState.hasModelGun) {
        content.innerHTML = `
            <div class="sub-header"><div class="back-btn" id="btn-back">◀ 戻る</div><div class="sub-title">ラミナ装填</div><div style="width: 50px;"></div></div>
            <div style="text-align: center; color: #888; margin-top: 50px;">まだモデルガンを所持していません。</div>
        `;
        document.getElementById("btn-back").onclick = renderAppHome;
        return;
    }

    const slotCount = Math.floor((gameState.level - 1) / 5) + 1;
    let slotsHTML = "";
    for (let i = 0; i < slotCount; i++) {
        const equippedCard = gameState.equippedCards[i] ? gameState.equippedCards[i] : "空きスロット";
        slotsHTML += `<div class="${gameState.equippedCards[i] ? "loadout-slot equipped-slot" : "loadout-slot"}">SLOT ${i+1} : ${equippedCard}</div>`;
    }

    let cardsHTML = "";
    if (gameState.cards.length === 0) cardsHTML = "<div style='color: #555; text-align: center; margin-top: 20px;'>所持ラミナがありません。</div>";
    else {
        gameState.cards.forEach(card => {
            cardsHTML += `<div class="card-item" data-card="${card}"><img src="assets/images/cards/${card}" onerror="this.src=''"><div style="font-size: 0.7em;">装備</div></div>`;
        });
    }

    content.innerHTML = `
        <div class="sub-header"><div class="back-btn" id="btn-back">◀ 戻る</div><div class="sub-title">ラミナ装填</div><div style="width: 50px;"></div></div>
        <div style="text-align: center; margin-bottom: 15px;"><img id="modelgun-img" src="assets/images/modelgun.jpg" style="max-width: 90%; border-radius: 8px;" onerror="this.style.display='none'"></div>
        <div style="margin-bottom: 20px;">${slotsHTML}</div>
        <div style="border-top: 1px solid #333; padding-top: 10px;"><div style="font-size: 0.9em; color: #888; margin-bottom: 5px;">所持ラミナ (タップでSLOT1にセット)</div><div class="card-list">${cardsHTML}</div></div>
    `;

    document.getElementById("btn-back").onclick = renderAppHome;
    const img = document.getElementById("modelgun-img");
    if (img) {
        if (img.complete) applyChromaKey(img);
        else img.onload = () => applyChromaKey(img);
    }

    document.querySelectorAll(".card-item").forEach(item => {
        item.onclick = () => {
            const card = item.getAttribute("data-card");
            gameState.equippedCards[0] = card;
            renderLoadout();
        };
    });
}