// ui.js
import { gameState } from './gameState.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

// クロマキー（緑透過）
export function applyChromaKey(imgElement) {
    if (!imgElement || !imgElement.complete || imgElement.naturalWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = imgElement.naturalWidth; canvas.height = imgElement.naturalHeight;
    const cctx = canvas.getContext("2d"); cctx.drawImage(imgElement, 0, 0);
    const imgData = cctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (g > 80 && g > r * 1.25 && g > b * 1.25) data[i + 3] = 0; 
    }
    cctx.putImageData(imgData, 0, 0);
    imgElement.src = canvas.toDataURL();
}

// テキストダイアログ
export function showMessageDialog(text, onClosed) {
    const msgDiv = document.createElement("div");
    msgDiv.style.cssText = `position: absolute; bottom: 12%; left: 10%; width: 80%; padding: 25px 30px; background-color: rgba(10, 0, 0, 0.92); color: #dddddd; border: 2px solid #550000; border-radius: 4px; z-index: 2000; font-family: ${HORROR_FONT}; font-size: 1.2em; line-height: 1.8; white-space: pre-wrap; box-shadow: 0 0 20px rgba(0,0,0,0.8);`;
    msgDiv.innerText = text;
    msgDiv.innerHTML += `<div style="margin-top: 15px; text-align: right; color: #888888; font-size: 0.85em;">▼ クリックまたは [ SPACE ] で閉じる</div>`;
    document.body.appendChild(msgDiv);

    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler);
            msgDiv.onclick = null; msgDiv.remove();
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { msgDiv.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

// 立ち絵付き会話ダイアログ
export function showConversationDialog(imageSrc, text, onClosed) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: absolute; bottom: 5%; left: 5%; width: 90%; display: flex; align-items: flex-end; z-index: 2000;";
    const imgDiv = document.createElement("img");
    imgDiv.src = imageSrc; imgDiv.style.cssText = "max-height: 320px; margin-right: 20px; border-radius: 8px;";
    imgDiv.onload = () => applyChromaKey(imgDiv);
    imgDiv.onerror = () => imgDiv.style.display = 'none';

    const msgDiv = document.createElement("div");
    msgDiv.style.cssText = `flex: 1; padding: 20px 25px; background: rgba(10, 0, 0, 0.92); color: #dddddd; border: 2px solid #550000; border-radius: 4px; font-family: ${HORROR_FONT}; font-size: 1.2em; line-height: 1.8; white-space: pre-wrap; box-shadow: 0 0 20px rgba(0,0,0,0.8);`;
    msgDiv.innerText = text;
    msgDiv.innerHTML += `<div style="margin-top: 10px; text-align: right; color: #888888; font-size: 0.85em;">▼ クリックまたは [ SPACE ] で閉じる</div>`;

    overlay.appendChild(imgDiv); overlay.appendChild(msgDiv); document.body.appendChild(overlay);

    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler);
            overlay.onclick = null; overlay.remove();
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { overlay.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

// アイテム獲得モーダル
export function showItemAcquiredModal(imagePath, itemTitle, detailText, onClosed) {
    const modal = document.createElement("div");
    modal.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.88); z-index: 2500; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: ${HORROR_FONT};`;
    modal.innerHTML = `
        <div style="color: #ff3333; font-size: 1.8em; margin-bottom: 15px; text-shadow: 0 0 10px red; letter-spacing: 3px;">― アイテム獲得 ―</div>
        <img src="${imagePath}" style="max-height: 240px; border-radius: 6px; margin-bottom: 15px;" onload="applyChromaKey(this)" onerror="this.style.display='none'">
        <div style="color: #ffdd66; font-size: 1.5em; font-weight: bold; margin-bottom: 8px;">${itemTitle}</div>
        <div style="color: #cccccc; font-size: 1.1em; margin-bottom: 25px; text-align: center; white-space: pre-wrap;">${detailText}</div>
        <div style="color: #888; font-size: 0.9em;">[ SPACE ] キー または クリックで閉じる</div>
    `;
    document.body.appendChild(modal);

    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler);
            modal.onclick = null; modal.remove();
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { modal.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

// 暗転・階層切り替え演出
export function playFloorTransition(targetFloor, onComplete) {
    const fadeDiv = document.createElement("div");
    fadeDiv.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; z-index: 2000; transition: opacity 0.5s ease; opacity: 0; display: flex; justify-content: center; align-items: center; color: #ff3333; font-family: ${HORROR_FONT}; font-size: 1.8em;`;
    document.body.appendChild(fadeDiv);

    setTimeout(() => {
        fadeDiv.style.opacity = "1";
        fadeDiv.innerText = targetFloor === 2 ? "2階へ登っている..." : "1階へ下りている...";
    }, 10);

    setTimeout(() => {
        if (onComplete) onComplete();
        setTimeout(() => {
            fadeDiv.style.opacity = "0";
            setTimeout(() => fadeDiv.remove(), 500);
        }, 800);
    }, 600);
}

// 動画再生
export function playVideo(src, onEnded) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); z-index: 1800; display: flex; justify-content: center; align-items: center;";
    document.body.appendChild(overlay);

    const video = document.createElement("video");
    video.src = src; video.style.cssText = "width: 60%; max-width: 600px; border: 4px solid #550000; box-shadow: 0 0 30px rgba(255, 0, 0, 0.4); background-color: black;";
    video.controls = false; video.autoplay = true;
    overlay.appendChild(video);

    video.onended = () => { overlay.remove(); if (onEnded) onEnded(); };
    overlay.onclick = () => { video.pause(); video.onended(); };
}

// コンビニショップUI
export function openShopUI(onClosed) {
    const shopDiv = document.createElement("div");
    shopDiv.style.cssText = `position: absolute; top: 10%; left: 10%; width: 80%; height: 80%; background-color: rgba(10, 0, 0, 0.95); color: #ccc; border: 2px solid #550000; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: ${HORROR_FONT};`; 
    shopDiv.innerHTML = `
        <h2 style="color: #ff3333; margin-bottom: 20px; font-size: 2.5em; text-shadow: 2px 2px 10px black; letter-spacing: 5px;">悪魔の無人レジ</h2>
        <p style="margin-bottom: 50px; font-size: 1.2em; color: #aaa;">青白い画面に不気味な文字が羅列されている...</p>
        <div style="display: flex; gap: 30px; margin-bottom: 50px;">
            <button id="buyBtn" style="background: #111; color: #ddd; border: 1px solid #555; padding: 15px 40px; font-size: 1.3em; cursor: pointer; font-family: ${HORROR_FONT};">供物（アイテム）を買う</button>
            <button id="sinBtn" style="background: #111; color: #ff3333; border: 1px solid #770000; padding: 15px 40px; font-size: 1.3em; cursor: pointer; font-family: ${HORROR_FONT};">罪を清算する</button>
        </div>
        <button id="closeBtn" style="background: transparent; color: #777; border: none; font-size: 1.1em; cursor: pointer; font-family: ${HORROR_FONT}; text-decoration: underline;">立ち去る</button>
    `;
    document.body.appendChild(shopDiv);

    document.getElementById("buyBtn").onclick = () => alert("【アイテム画面】※後日実装予定");
    document.getElementById("sinBtn").onclick = () => alert("【罪の清算】※後日実装予定");
    document.getElementById("closeBtn").onclick = () => {
        shopDiv.remove();
        if (onClosed) onClosed();
    };
}

// デバッグメニュー (F2)
export function openDebugMenu(onAction) {
    if (document.getElementById("debug-modal")) {
        document.getElementById("debug-modal").remove(); return;
    }
    const debugDiv = document.createElement("div"); debugDiv.id = "debug-modal"; debugDiv.className = "debug-modal";
    debugDiv.innerHTML = `
        <h3 style="margin:0; border-bottom:1px solid #00ff00; padding-bottom:5px;">[DEBUG MENU] テスト用コマンド</h3>
        <button class="debug-btn" id="dbg-all-clear">① 一括イベントクリア（全開放＆アイテム取得）</button>
        <button class="debug-btn" id="dbg-warp-2f">② 2階（2F）へ直接ワープ</button>
        <button class="debug-btn" id="dbg-warp-1f">③ 1階（1F）へ直接ワープ</button>
        <button class="debug-btn" id="dbg-lv15">④ レベル15にする（使い魔解禁テスト用）</button>
        <button class="debug-btn" id="dbg-close" style="background:#550000; color:#fff; border-color:#ff0000;">閉じる [F2]</button>
    `;
    document.body.appendChild(debugDiv);

    document.getElementById("dbg-all-clear").onclick = () => {
        gameState.hasExorcistInherited = true; gameState.hasKey2F = true; gameState.hasModelGun = true; gameState.hasMetGrandma = true;
        if (!gameState.cards.includes("1Card.png")) gameState.cards.push("1Card.png");
        alert("【デバッグ】全アイテム取得状態にしました！");
        debugDiv.remove(); if (onAction) onAction();
    };
    document.getElementById("dbg-warp-2f").onclick = () => {
        gameState.hasKey2F = true; debugDiv.remove();
        if (onAction) onAction("warp2F");
    };
    document.getElementById("dbg-warp-1f").onclick = () => {
        debugDiv.remove(); if (onAction) onAction("warp1F");
    };
    document.getElementById("dbg-lv15").onclick = () => {
        gameState.level = 15; gameState.familiarSync = 100;
        alert("【デバッグ】レベルを15に設定しました！"); debugDiv.remove();
    };
    document.getElementById("dbg-close").onclick = () => debugDiv.remove();
}