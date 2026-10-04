// appUI.js
import { gameState } from './gameState.js';
import { applyChromaKey, showMessageDialog } from './ui.js';

let isMenuOpen = false;
const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

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
        const overlay = document.createElement("div");
        overlay.id = "app-overlay"; overlay.className = "app-overlay";
        overlay.innerHTML = `
            <div class="smartphone">
                <div class="app-header">
                    <div>Lv.<span>${gameState.level}</span></div>
                    <div>HP: <span>${gameState.hp}</span>/${gameState.maxHp}</div>
                    <div>SIN: <span>${gameState.sin}</span></div>
                    <div>💰: <span>${gameState.money}</span></div>
                </div>
                <div id="app-content" class="app-content"></div>
                <div class="app-footer"><div class="app-home-btn" id="app-home-trigger"></div></div>
            </div>
            <div style="position: absolute; bottom: 20px; color: #888; font-family: ${HORROR_FONT};">▼ [ESC] キーで閉じる</div>
        `;
        document.body.appendChild(overlay);
        document.getElementById("app-home-trigger").onclick = renderAppHome;
        renderAppHome(); 
        return true;
    }
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
    if (img) img.onload = () => applyChromaKey(img);

    document.querySelectorAll(".card-item").forEach(item => {
        item.onclick = () => {
            const card = item.getAttribute("data-card");
            gameState.equippedCards[0] = card;
            renderLoadout();
        };
    });
}