// ui.js - 会話・査問・ショップ・通常戦闘UI・クロマキー処理完全版
import { gameState } from './gameState.js';
import { itemDefinitions } from './items.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

// ★ 緑背景（クロマキー）自動透過処理
export function applyChromaKey(imgElement) {
    if (!imgElement || imgElement.naturalWidth === 0) return;
    try {
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.naturalWidth; 
        canvas.height = imgElement.naturalHeight;
        const cctx = canvas.getContext("2d"); 
        cctx.drawImage(imgElement, 0, 0);
        const imgData = cctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            // 緑色成分（G）が強いピクセルを透過
            if (g > 55 && g > r * 1.05 && g > b * 1.05) {
                data[i + 3] = 0;
            }
        }
        cctx.putImageData(imgData, 0, 0); 
        imgElement.src = canvas.toDataURL();
    } catch(e) {}
}

export function showMessageDialog(text, onClosed) {
    const msgDiv = document.createElement("div");
    msgDiv.style.cssText = `position: fixed; bottom: 8%; left: 5%; width: 90%; max-width: 560px; margin: 0 auto; padding: 20px; background-color: rgba(10, 0, 0, 0.92); color: #dddddd; border: 2px solid #550000; border-radius: 6px; z-index: 2000; font-family: ${HORROR_FONT}; font-size: 1.1em; line-height: 1.7; white-space: pre-wrap; box-shadow: 0 0 20px rgba(0,0,0,0.8); box-sizing: border-box;`;
    msgDiv.innerText = text;
    msgDiv.innerHTML += `<div style="margin-top: 12px; text-align: right; color: #888888; font-size: 0.8em;">▼ タップ または [ SPACE ] で閉じる</div>`;
    document.body.appendChild(msgDiv);

    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler); 
            msgDiv.onclick = null; 
            msgDiv.remove(); 
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { msgDiv.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

export function showConversationDialog(imageSrc, text, onClosed) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; bottom: 3%; left: 5%; width: 90%; max-width: 560px; display: flex; flex-direction: column; align-items: center; z-index: 2000; box-sizing: border-box;";
    const imgDiv = document.createElement("img");
    imgDiv.src = imageSrc; 
    imgDiv.style.cssText = "max-height: 220px; border-radius: 8px; margin-bottom: 10px; align-self: flex-start;";
    
    if (imgDiv.complete) applyChromaKey(imgDiv); 
    else imgDiv.onload = () => applyChromaKey(imgDiv);
    imgDiv.onerror = () => imgDiv.style.display = 'none';

    const msgDiv = document.createElement("div");
    msgDiv.style.cssText = `width: 100%; padding: 18px; background: rgba(10, 0, 0, 0.92); color: #dddddd; border: 2px solid #550000; border-radius: 6px; font-family: ${HORROR_FONT}; font-size: 1.05em; line-height: 1.6; white-space: pre-wrap; box-shadow: 0 0 20px rgba(0,0,0,0.8); box-sizing: border-box;`;
    msgDiv.innerText = text;
    msgDiv.innerHTML += `<div style="margin-top: 10px; text-align: right; color: #888888; font-size: 0.8em;">▼ タップ または [ SPACE ] で閉じる</div>`;

    overlay.appendChild(imgDiv); 
    overlay.appendChild(msgDiv); 
    document.body.appendChild(overlay);

    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler); 
            overlay.onclick = null; 
            overlay.remove(); 
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { overlay.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

// アイテム獲得モーダル（緑背景画像も自動透過）
export function showItemAcquiredModal(imagePath, itemTitle, detailText, onClosed) {
    const modal = document.createElement("div");
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.88); z-index: 2500; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: ${HORROR_FONT}; padding: 20px; box-sizing: border-box;`;
    
    const imgEl = document.createElement("img");
    imgEl.id = "modal-item-img";
    imgEl.src = imagePath;
    imgEl.style.cssText = "max-height: 200px; max-width: 80%; border-radius: 6px; margin-bottom: 15px;";
    imgEl.onerror = () => { imgEl.style.display = 'none'; };
    if (imgEl.complete) applyChromaKey(imgEl);
    else imgEl.onload = () => applyChromaKey(imgEl);

    modal.innerHTML = `<div style="color: #ff3333; font-size: 1.6em; margin-bottom: 15px; text-shadow: 0 0 10px red; letter-spacing: 2px;">― アイテム獲得 ―</div>`;
    modal.appendChild(imgEl);
    modal.innerHTML += `
        <div style="color: #ffdd66; font-size: 1.3em; font-weight: bold; margin-bottom: 8px;">${itemTitle}</div>
        <div style="color: #cccccc; font-size: 1em; margin-bottom: 25px; text-align: center; white-space: pre-wrap; line-height: 1.5;">${detailText}</div>
        <div style="color: #888; font-size: 0.85em;">タップ または [ SPACE ] で閉じる</div>
    `;
    document.body.appendChild(modal);

    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler); 
            modal.onclick = null; 
            modal.remove(); 
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { modal.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

// 階段暗転演出
export function playFloorTransition(targetFloor, onComplete) {
    const fadeDiv = document.createElement("div");
    fadeDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: black; z-index: 4000; transition: opacity 0.5s ease; opacity: 0; display: flex; justify-content: center; align-items: center; color: #ff3333; font-family: ${HORROR_FONT}; font-size: 1.6em;`;
    document.body.appendChild(fadeDiv);
    setTimeout(() => { fadeDiv.style.opacity = "1"; fadeDiv.innerText = targetFloor === 2 ? "2階へ登っている..." : "1階へ下りている..."; }, 10);
    setTimeout(() => { if (onComplete) onComplete(); setTimeout(() => { fadeDiv.style.opacity = "0"; setTimeout(() => fadeDiv.remove(), 500); }, 800); }, 600);
}

export function playVideo(src, onEnded) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.95); z-index: 2500; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box;";

    const video = document.createElement("video");
    video.src = src;
    video.style.cssText = "width: 100%; max-width: 540px; border: 3px solid #550000; box-shadow: 0 0 30px rgba(255, 0, 0, 0.5); background-color: black;";
    video.controls = false; video.autoplay = true; video.playsInline = true; video.muted = true;

    overlay.appendChild(video);
    document.body.appendChild(overlay);

    const finish = () => {
        if (overlay.parentNode) overlay.remove();
        if (onEnded) onEnded();
    };

    video.onended = finish;
    video.onerror = () => finish();
    overlay.onclick = () => { video.pause(); finish(); };
    video.play().catch(err => finish());
}

export function openShopUI(onClosed) {
    const shopDiv = document.createElement("div");
    shopDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2800; overflow: hidden; font-family: ${HORROR_FONT}; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box;`; 
    shopDiv.innerHTML = `
        <video src="assets/videos/CVS.mp4" autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.35; filter: blur(2px);"></video>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle, rgba(20,0,0,0.7) 0%, rgba(0,0,0,0.95) 90%);"></div>
        <div style="position: relative; z-index: 10; width: 100%; max-width: 540px; height: 90%; background: rgba(10, 5, 5, 0.92); border: 2px solid #770000; box-shadow: 0 0 30px rgba(255, 0, 0, 0.4); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 12px 15px; border-bottom: 2px solid #550000; background: linear-gradient(180deg, #2a0000, #0a0000); display: flex; justify-content: space-between; align-items: center;">
                <div><h2 style="color: #ff3333; margin: 0; font-size: 1.5em;">悪魔の無人レジ</h2></div>
                <div style="font-size: 1.05em; color: #ffdd66; font-weight: bold;">💰 <span id="shop-money">${gameState.player?.money || 0}</span> <span style="color:#ff4444; font-size:0.8em;">(罪:${gameState.player?.sin || 0})</span></div>
            </div>
            <div id="shop-content" style="flex: 1; overflow-y: auto; padding: 12px; box-sizing: border-box;"></div>
            <div style="padding: 10px; text-align: center; border-top: 1px solid #440000; background: #050505;"><button id="closeBtn" style="background: transparent; color: #aaa; border: 1px solid #555; padding: 8px 25px; cursor: pointer; border-radius: 4px;">立ち去る</button></div>
        </div>
    `;
    document.body.appendChild(shopDiv);

    let html = "";
    Object.values(itemDefinitions).forEach(item => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(20, 10, 10, 0.85); padding: 10px 12px; margin-bottom: 8px; border: 1px solid #441111; border-radius: 6px;">
                <div style="flex: 1;"><div style="color: #ffdd66; font-weight: bold;">${item.name}</div><div style="font-size: 0.8em; color: #bbb;">${item.description || ''}</div></div>
                <div style="text-align: right;"><div style="color: #ffdd66; font-weight: bold; margin-bottom: 4px;">💰 ${item.price}</div><button class="buy-item-btn" data-id="${item.id}" data-price="${item.price}" style="background: linear-gradient(180deg, #440000, #110000); color: #fff; border: 1px solid #ff3333; padding: 5px 10px; cursor: pointer; border-radius: 4px;">購入</button></div>
            </div>`;
    });
    document.getElementById("shop-content").innerHTML = html;

    document.querySelectorAll(".buy-item-btn").forEach(btn => {
        btn.onclick = () => {
            const price = parseInt(btn.getAttribute("data-price"));
            if (gameState.player.money >= price) {
                gameState.player.money -= price; 
                document.getElementById("shop-money").innerText = gameState.player.money;
                btn.style.background = "#006600"; btn.innerText = "完了！"; 
                setTimeout(() => { btn.style.background = ""; btn.innerText = "購入"; }, 500);
            } else {
                btn.innerText = "資金不足"; 
                setTimeout(() => { btn.innerText = "購入"; }, 800);
            }
        };
    });
    document.getElementById("closeBtn").onclick = () => { shopDiv.remove(); if (onClosed) onClosed(); };
}

// ★ 通常戦闘画面（主人公HPリアルタイム表示 ＆ 攻撃条件の厳密制御）
export function openCombatUI(enemy, gameState, onResult) {
    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.92); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;

    let enemyHp = enemy.hp || 30;

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 10px 0; text-shadow: 0 0 10px red;">【通常戦闘】</h2>
        <img id="combat-enemy-img" src="${enemy.image}" style="max-height: 200px; border-radius: 8px; margin-bottom: 10px;">
        <div style="color: #ffdd66; font-size: 1.2em; font-weight: bold;">${enemy.name}</div>
        
        <div style="display: flex; gap: 20px; font-size: 1.05em; margin: 10px 0 15px 0; background: rgba(0,0,0,0.6); padding: 6px 16px; border-radius: 6px; border: 1px solid #333;">
            <span id="player-hp-text" style="color: #00ff66; font-weight: bold;">主人公HP: ${gameState.player.hp} /${gameState.player.maxHp}</span>
            <span id="enemy-hp-text" style="color: #ff4444; font-weight: bold;">敵HP: ${enemyHp}</span>
        </div>

        <div id="combat-log" style="width: 100%; max-width: 450px; height: 85px; background: rgba(0,0,0,0.8); border: 1px solid #550000; padding: 10px; margin-bottom: 15px; color: #ccc; font-size: 0.9em; line-height: 1.5; white-space: pre-wrap; overflow-y: auto;">悪魔が目の前に立ち塞がった！ どうする？</div>

        <div style="display: flex; gap: 10px; width: 100%; max-width: 450px;">
            <button id="btn-attack" style="flex: 1; background: #440000; color: #fff; border: 1px solid #ff3333; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 4px; font-weight: bold;">Vox Sacra (射撃)</button>
            <button id="btn-escape" style="flex: 1; background: #111; color: #aaa; border: 1px solid #555; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 4px;">逃げる</button>
        </div>
    `;
    document.body.appendChild(ui);

    const enemyImg = document.getElementById("combat-enemy-img");
    if (enemyImg) {
        if (enemyImg.complete) applyChromaKey(enemyImg);
        else enemyImg.onload = () => applyChromaKey(enemyImg);
    }

    const log = document.getElementById("combat-log");
    const playerHpText = document.getElementById("player-hp-text");
    const enemyHpText = document.getElementById("enemy-hp-text");

    document.getElementById("btn-attack").onclick = () => {
        const hasGun = gameState.player.hasModelGun;
        const equippedCards = gameState.equippedCards || [];
        const equippedPower = equippedCards.reduce((a, b) => a + b, 0);

        // 1. モデルガン未所持チェック（素手攻撃禁止）
        if (!hasGun) {
            log.innerText = "【攻撃不能！】\nモデルガンを持っていない！ 素手では悪魔に一切のダメージを与えられない！";
        }
        // 2. ラミナ未装填チェック（弾が出ない）
        else if (equippedPower === 0) {
            log.innerText = "【装填エラー！】\nモデルガンにラミナ（カード）が装填されていない！\n弾が出ず、ダメージを与えられない！";
        } 
        // 3. 正常な射撃成功
        else {
            const damage = equippedPower * 10;
            enemyHp = Math.max(0, enemyHp - damage);
            enemyHpText.innerText = `敵HP: ${enemyHp}`;

            if (enemyHp <= 0) {
                log.innerText = `Vox Sacra（聖なる声）の射撃！ 悪魔に ${damage} ダメージ！\n${enemy.name} を撃退した！`;
                setTimeout(() => {
                    ui.remove();
                    gameState.player.money += 150;
                    showMessageDialog(`【勝利】\n${enemy.name} を倒した！（💰150 獲得）`, () => {
                        if (onResult) onResult("win");
                    });
                }, 800);
                return;
            } else {
                log.innerText = `Vox Sacraの射撃！ 悪魔に ${damage} ダメージ！`;
            }
        }

        // 敵の反撃ターン
        const damageTaken = 10;
        gameState.player.hp = Math.max(0, gameState.player.hp - damageTaken);
        playerHpText.innerText = `主人公HP: ${gameState.player.hp} /${gameState.player.maxHp}`;
        log.innerText += `\n悪魔の反撃！ 主人公は ${damageTaken} ダメージを受けた！`;

        // 全滅死に戻り処理
        if (gameState.player.hp <= 0) {
            setTimeout(() => {
                ui.remove();
                showMessageDialog("【体力が尽きた……】\n意識を失い、1階のコンビニへ連れ戻された……。", () => {
                    gameState.player.hp = gameState.player.maxHp;
                    if (onResult) onResult("defeat");
                });
            }, 1000);
        }
    };

    document.getElementById("btn-escape").onclick = () => {
        ui.remove();
        showMessageDialog("【逃走成功】\n間一髪で悪魔から逃げ切った！", () => {
            if (onResult) onResult("escape");
        });
    };
}

export function openInquisitionUI(entity, gameState, onResult) {
    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.95); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;
    
    let visualHTML = `<img id="inq-entity-img" src="${entity.image}" style="max-height: 180px; border-radius: 8px;" onerror="this.style.display='none'">`;

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 10px 0; text-shadow: 0 0 8px red;">【査問】住人との対面</h2>
        ${visualHTML}
        <div style="color: #ddd; font-size: 1.1em; margin-top: 5px; font-weight: bold;">${entity.name}</div>
        
        <div id="inq-log" style="width: 100%; max-width: 500px; height: 110px; background: rgba(0,0,0,0.85); border: 1px solid #550000; padding: 10px; margin: 12px 0; color: #ccc; font-size: 0.9em; line-height: 1.5; overflow-y: auto; white-space: pre-wrap;">（住人と対面した。1枚目のラミナカードを提示して様子を見よう……）</div>

        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
            <div id="slot1" style="width: 60px; height: 80px; border: 2px dashed #666; display: flex; flex-direction:column; justify-content: center; align-items: center; color: #888; font-size: 0.75em; background: #111;">1枚目</div>
            <div id="slot2" style="width: 60px; height: 80px; border: 2px dashed #666; display: flex; flex-direction:column; justify-content: center; align-items: center;