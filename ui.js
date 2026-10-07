// ui.js - 会話・査問・ショップ・戦闘UI・影山パズル完全版
import { gameState } from './gameState.js';
import { itemDefinitions } from './items.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

export function applyChromaKey(imgElement) {
    if (!imgElement) return;
    if (imgElement.dataset && imgElement.dataset.chromaKeyed === "true") return;

    const process = () => {
        if (!imgElement.naturalWidth || imgElement.naturalWidth === 0) return;
        if (imgElement.dataset && imgElement.dataset.chromaKeyed === "true") return;
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
                if (g > 40 && g > r * 1.02 && g > b * 1.02) {
                    data[i + 3] = 0;
                }
            }
            cctx.putImageData(imgData, 0, 0);
            if (imgElement.dataset) imgElement.dataset.chromaKeyed = "true";
            imgElement.src = canvas.toDataURL();
        } catch(e) {}
    };

    if (imgElement.complete && imgElement.naturalWidth > 0) {
        process();
    } else {
        imgElement.onload = process;
    }
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
    imgDiv.style.cssText = "max-height: 220px; border-radius: 8px; margin-bottom: 10px; align-self: flex-start;";
    
    imgDiv.onerror = () => imgDiv.style.display = 'none';
    imgDiv.onload = () => applyChromaKey(imgDiv);
    imgDiv.src = imageSrc;
    if (imgDiv.complete) applyChromaKey(imgDiv);

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

export function showItemAcquiredModal(imagePath, itemTitle, detailText, onClosed) {
    const modal = document.createElement("div");
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.88); z-index: 2500; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: ${HORROR_FONT}; padding: 20px; box-sizing: border-box;`;
    
    const imgEl = document.createElement("img");
    imgEl.id = "modal-item-img";
    imgEl.style.cssText = "max-height: 200px; max-width: 80%; border-radius: 6px; margin-bottom: 15px;";
    imgEl.onerror = () => { imgEl.style.display = 'none'; };
    imgEl.onload = () => applyChromaKey(imgEl);
    imgEl.src = imagePath;
    if (imgEl.complete) applyChromaKey(imgEl);

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

export function playFloorTransition(targetFloor, onComplete) {
    const fadeDiv = document.createElement("div");
    fadeDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: black; z-index: 4000; transition: opacity 0.5s ease; opacity: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #ff3333; font-family: ${HORROR_FONT}; font-size: 1.6em; gap: 15px;`;
    document.body.appendChild(fadeDiv);

    setTimeout(() => { 
        fadeDiv.style.opacity = "1"; 
        fadeDiv.innerHTML = `<div>ザッ…… ザッ……</div><div style="font-size: 0.8em; color: #aaa;">${targetFloor === 2 ? '2階へ登っている...' : '1階へ下りている...'}</div>`; 
    }, 10);

    setTimeout(() => { 
        if (onComplete) onComplete(); 
        setTimeout(() => { 
            fadeDiv.style.opacity = "0"; 
            setTimeout(() => fadeDiv.remove(), 500); 
        }, 800); 
    }, 1500);
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
                <div style="font-size: 1.05em; color: #ffdd66; font-weight: bold;">💰 <span id="shop-money">${gameState.player?.money || 0}</span> <span style="color:#00ff66; font-size:0.8em; margin-left:8px;">(DEF:+${gameState.player?.def || 0})</span></div>
            </div>
            <div id="shop-content" style="flex: 1; overflow-y: auto; padding: 12px; box-sizing: border-box;"></div>
            <div style="padding: 10px; text-align: center; border-top: 1px solid #440000; background: #050505;"><button id="closeBtn" style="background: transparent; color: #aaa; border: 1px solid #555; padding: 8px 25px; cursor: pointer; border-radius: 4px;">立ち去る</button></div>
        </div>
    `;
    document.body.appendChild(shopDiv);

    let html = "";
    Object.values(itemDefinitions).forEach(item => {
        const isEquippedArmor = item.type === "armor" && gameState.equippedArmor === item.id;
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(20, 10, 10, 0.85); padding: 10px 12px; margin-bottom: 8px; border: 1px solid #441111; border-radius: 6px;">
                <div style="flex: 1;"><div style="color: #ffdd66; font-weight: bold;">${item.name}</div><div style="font-size: 0.8em; color: #bbb;">${item.description || ''}</div></div>
                <div style="text-align: right;"><div style="color: #ffdd66; font-weight: bold; margin-bottom: 4px;">💰 ${item.price}</div>
                <button class="buy-item-btn" data-id="${item.id}" data-price="${item.price}" ${isEquippedArmor ? 'disabled style="background:#333; color:#aaa; border:1px solid #555;"' : 'style="background: linear-gradient(180deg, #440000, #110000); color: #fff; border: 1px solid #ff3333; padding: 5px 10px; cursor: pointer; border-radius: 4px;"'}>
                    ${isEquippedArmor ? '装備中' : '購入'}
                </button></div>
            </div>`;
    });
    document.getElementById("shop-content").innerHTML = html;

    document.querySelectorAll(".buy-item-btn").forEach(btn => {
        btn.onclick = () => {
            const itemId = btn.getAttribute("data-id");
            const price = parseInt(btn.getAttribute("data-price"));
            const item = itemDefinitions[itemId];

            if (gameState.player.money >= price) {
                gameState.player.money -= price; 
                document.getElementById("shop-money").innerText = gameState.player.money;

                if (item && item.type === "armor") {
                    gameState.equippedArmor = item.id;
                    gameState.player.def = Math.max(gameState.player.def, item.def || 1);
                    btn.disabled = true;
                    btn.style.background = "#333";
                    btn.style.color = "#aaa";
                    btn.style.border = "1px solid #555";
                    btn.innerText = "装備中";
                } else {
                    btn.style.background = "#006600"; btn.innerText = "完了！"; 
                    setTimeout(() => { btn.style.background = ""; btn.innerText = "購入"; }, 500);
                }
            } else {
                btn.innerText = "資金不足"; 
                setTimeout(() => { btn.innerText = "購入"; }, 800);
            }
        };
    });
    document.getElementById("closeBtn").onclick = () => { shopDiv.remove(); if (onClosed) onClosed(); };
}

export function openCombatUI(enemy, gameState, onResult) {
    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.92); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;

    let enemyHp = enemy.hp || 30;
    const enemyAtk = enemy.atk || 8;
    const enemyDef = enemy.def || 0;
    const enemyWeakness = enemy.weakness || [1];

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 10px 0; text-shadow: 0 0 10px red;">【通常戦闘】</h2>
        <img id="combat-enemy-img" src="${enemy.image}" style="max-height: 200px; border-radius: 8px; margin-bottom: 10px;">
        <div style="color: #ffdd66; font-size: 1.2em; font-weight: bold;">${enemy.name}</div>
        
        <div style="display: flex; gap: 20px; font-size: 1.05em; margin: 10px 0 15px 0; background: rgba(0,0,0,0.6); padding: 6px 16px; border-radius: 6px; border: 1px solid #333;">
            <span id="player-hp-text" style="color: #00ff66; font-weight: bold;">主人公HP: ${gameState.player.hp} / ${gameState.player.maxHp}</span>
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
    applyChromaKey(enemyImg);

    const log = document.getElementById("combat-log");
    const playerHpText = document.getElementById("player-hp-text");
    const enemyHpText = document.getElementById("enemy-hp-text");
    const attackBtn = document.getElementById("btn-attack");
    const escapeBtn = document.getElementById("btn-escape");

    attackBtn.onclick = () => {
        const hasGun = gameState.player.hasModelGun || gameState.hasModelGun;
        const equippedCards = gameState.equippedCards || [];

        if (!hasGun) {
            log.innerText = "【攻撃不能！】\nモデルガンを持っていない！ 素手では悪魔にダメージを与えられない！";
            return;
        } 
        if (equippedCards.length === 0) {
            log.innerText = "【装填エラー！】\nモデルガンにラミナ（カード）が装填されていない！ 弾が出ない！";
            return;
        }

        attackBtn.disabled = true;
        escapeBtn.disabled = true;

        log.innerText = "Vox Sacra（聖なる声）を放った……！";

        setTimeout(() => {
            let baseDamage = equippedCards.reduce((sum, num) => sum + num, 0) * 4;
            const isWeaknessHit = equippedCards.some(num => enemyWeakness.includes(num));
            if (isWeaknessHit) baseDamage *= 2;

            const randomFactor = 0.85 + Math.random() * 0.3;
            const netDamage = Math.max(1, Math.floor((baseDamage - enemyDef) * randomFactor));

            enemyHp = Math.max(0, enemyHp - netDamage);
            enemyHpText.innerText = `敵HP: ${enemyHp}`;

            log.innerText = `Vox Sacraの射撃！${isWeaknessHit ? '（弱点特効！）' : ''} 悪魔に ${netDamage} ダメージ！`;

            if (enemyHp <= 0) {
                setTimeout(() => {
                    ui.remove();
                    gameState.player.money += 150;
                    const isLvUp = gameState.gainExp(50);
                    showMessageDialog(`【勝利！】\n${enemy.name} を撃退した！（💰150 獲得 / 50 EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}`, () => {
                        if (onResult) onResult("win");
                    });
                }, 1000);
                return;
            }

            setTimeout(() => {
                const dodgeChance = (gameState.player.agi || 5) * 0.04;
                if (Math.random() < dodgeChance) {
                    log.innerText += `\n素早い身こなし！ 悪魔の攻撃を回避した！`;
                } else {
                    const baseEnemyAtk = enemyAtk - (gameState.player.def || 0);
                    const enemyRand = 0.85 + Math.random() * 0.3;
                    const damageTaken = Math.max(1, Math.floor(baseEnemyAtk * enemyRand));

                    gameState.player.hp = Math.max(0, gameState.player.hp - damageTaken);
                    playerHpText.innerText = `主人公HP: ${gameState.player.hp} / ${gameState.player.maxHp}`;
                    log.innerText += `\n悪魔の反撃！ 主人公は ${damageTaken} ダメージを受けた！`;
                }

                if (gameState.player.hp <= 0) {
                    setTimeout(() => {
                        ui.remove();
                        showMessageDialog("【体力が尽きた……】\n意識を失い、1階のコンビニへ連れ戻された……。", () => {
                            gameState.player.hp = gameState.player.maxHp;
                            if (onResult) onResult("defeat");
                        });
                    }, 1000);
                } else {
                    attackBtn.disabled = false;
                    escapeBtn.disabled = false;
                }
            }, 1000);
        }, 800);
    };

    escapeBtn.onclick = () => {
        attackBtn.disabled = true;
        escapeBtn.disabled = true;
        log.innerText = "必死に背を向けて走り出した……！";

        setTimeout(() => {
            const escapeRate = 0.55 + ((gameState.player.agi || 5) * 0.04);
            if (Math.random() < escapeRate) {
                ui.remove();
                showMessageDialog("【逃走成功】\n暗闇の中、なんとか悪魔を振り切った！", () => {
                    if (onResult) onResult("escape");
                });
            } else {
                log.innerText = "【逃走失敗！】\nしかし、悪魔に回り込まれた！";

                setTimeout(() => {
                    const damageTaken = Math.max(1, Math.floor((enemyAtk - (gameState.player.def || 0)) * 1.2));
                    gameState.player.hp = Math.max(0, gameState.player.hp - damageTaken);
                    playerHpText.innerText = `主人公HP: ${gameState.player.hp} / ${gameState.player.maxHp}`;
                    log.innerText += `\n背後から追撃！ 主人公は ${damageTaken} ダメージを受けた！`;

                    if (gameState.player.hp <= 0) {
                        setTimeout(() => {
                            ui.remove();
                            showMessageDialog("【体力が尽きた……】\n意識を失い、1階のコンビニへ連れ戻された……。", () => {
                                gameState.player.hp = gameState.player.maxHp;
                                if (onResult) onResult("defeat");
                            });
                        }, 1000);
                    } else {
                        attackBtn.disabled = false;
                        escapeBtn.disabled = false;
                    }
                }, 1000);
            }
        }, 1000);
    };
}

export function openInquisitionUI(entity, gameState, onResult) {
    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.95); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;
    
    let visualHTML = `<img id="inq-entity-img" src="${entity.faceImage || entity.image}" style="max-height: 180px; border-radius: 8px;" onerror="this.style.display='none'">`;

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 10px 0; text-shadow: 0 0 8px red;">【査問】住人との対面</h2>
        ${visualHTML}
        <div style="color: #ddd; font-size: 1.1em; margin-top: 5px; font-weight: bold;">${entity.name}</div>
        
        <div id="inq-log" style="width: 100%; max-width: 500px; height: 110px; background: rgba(0,0,0,0.85); border: 1px solid #550000; padding: 10px; margin: 12px 0; color: #ccc; font-size: 0.9em; line-height: 1.5; overflow-y: auto; white-space: pre-wrap;">（住人と対面した。1枚目のラミナカードを提示して様子を見よう……）</div>

        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
            <div id="slot1" style="width: 60px; height: 80px; border: 2px dashed #666; display: flex; flex-direction:column; justify-content: center; align-items: center; color: #888; font-size: 0.75em; background: #111;">1枚目</div>
            <div id="slot2" style="width: 60px; height: 80px; border: 2px dashed #666; display: flex; flex-direction:column; justify-content: center; align-items: center; color: #888; font-size: 0.75em; background: #111;">2枚目</div>
        </div>

        <div style="width: 100%; max-width: 500px; display: flex; gap: 5px; overflow-x: auto; padding-bottom: 8px; border-bottom: 1px solid #333;" id="inq-cards"></div>

        <div style="display: flex; gap: 10px; margin-top: 12px; width: 100%; max-width: 500px;">
            <button id="btn-show" style="flex: 1; background: #220000; color: #ffdd66; border: 1px solid #ff3333; padding: 10px; font-family: inherit; cursor: pointer; border-radius: 4px; font-weight:bold;">1枚目を提示する</button>
            <button id="btn-shoot" style="display: none; flex: 1; background: #440000; color: #fff; border: 1px solid #ff0000; padding: 10px; font-family: inherit; cursor: pointer; border-radius: 4px; font-weight:bold;">【銃で撃つ】</button>
            <button id="btn-protect" style="display: none; flex: 1; background: #004400; color: #00ff66; border: 1px solid #00ff66; padding: 10px; font-family: inherit; cursor: pointer; border-radius: 4px; font-weight:bold;">【保護する】</button>
        </div>
    `;
    document.body.appendChild(ui);

    const entityImg = document.getElementById("inq-entity-img");
    applyChromaKey(entityImg);

    let step = 1;
    let selected = [];
    const cardsDiv = document.getElementById("inq-cards");
    const cardsList = gameState.cards || ["1Card.png"];
    
    cardsList.forEach(card => {
        const numMatch = card.match(/\d+/);
        const num = numMatch ? numMatch[0] : "1";
        const cDiv = document.createElement("div");
        cDiv.style.cssText = "min-width: 45px; height: 60px; border: 1px solid #555; background: #000; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #fff; font-weight: bold;";
        cDiv.innerHTML = `<img src="assets/images/cards/${card}" style="max-width:100%; max-height:100%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display:none; font-size:1.2em;">${num}</div>`;
        
        cDiv.onclick = () => {
            if (step === 1) {
                selected = [num];
                updateSlots();
            } else if (step === 2) {
                if (selected.length < 2 && selected[0] !== num) {
                    selected[1] = num;
                    updateSlots();
                }
            }
        };
        cardsDiv.appendChild(cDiv);
    });

    function updateSlots() {
        document.getElementById("slot1").innerHTML = selected[0] ? `<div style="font-size:1.6em; color:#ffdd66;">${selected[0]}</div>` : "1枚目";
        document.getElementById("slot2").innerHTML = selected[1] ? `<div style="font-size:1.6em; color:#ffdd66;">${selected[1]}</div>` : "2枚目";
    }

    const showBtn = document.getElementById("btn-show");
    const shootBtn = document.getElementById("btn-shoot");
    const protectBtn = document.getElementById("btn-protect");
    const log = document.getElementById("inq-log");

    showBtn.onclick = () => {
        if (step === 1) {
            if (!selected[0]) { alert("1枚目のカードを選択してください。"); return; }
            
            if (entity.type === "human") {
                log.innerText = `【1枚目: カード${selected[0]}を提示】\n【${entity.name}】\n「え…？ なんですかその紙切れは？」\n（人間らしく困惑している。もう1枚提示して確認しよう）`;
            } else {
                const isWeak = entity.weaknesses && entity.weaknesses.includes(parseInt(selected[0]));
                if (isWeak) {
                    log.innerText = `【1枚目: カード${selected[0]}を提示】\n【${entity.name}】\n「チッ……う、うぐっ…！」\n（苦痛で顔が不自然に歪んだ！ 弱点にかなり近い反応だ！）`;
                } else {
                    log.innerText = `【1枚目: カード${selected[0]}を提示】\n【${entity.name}】\n「……ふん、何か用ですか？」\n（無反応に近い。別のカードを試してみよう）`;
                }
            }

            step = 2;
            showBtn.innerText = "2枚目を提示する";

        } else if (step === 2) {
            if (!selected[1]) { alert("2枚目のカードを選択してください。"); return; }

            if (entity.type === "human") {
                log.innerText = `【2枚目: カード${selected[1]}を提示】\n【${entity.name}】\n「しつこいですね！ 宗教の勧誘なら警察を呼びますよ！」\n（完全に人間特有の嫌悪反応だ。【撃つ】か【保護する】か決めよう）`;
            } else {
                const isWeak1 = entity.weaknesses && entity.weaknesses.includes(parseInt(selected[0]));
                const isWeak2 = entity.weaknesses && entity.weaknesses.includes(parseInt(selected[1]));

                if (entityImg && entity.realImage) {
                    entityImg.src = entity.realImage;
                    applyChromaKey(entityImg);
                }

                if (isWeak1 && isWeak2) {
                    log.innerText = `【2枚目: カード${selected[1]}を提示】\n【${entity.name}】\n「ギャアアアッ！？ や、やめろォォォッ！！」\n（完全に正体を暴いた！ 肌が焼け焦げ、悪魔の正体を露わにした！）`;
                } else if (isWeak1 || isWeak2) {
                    log.innerText = `【2枚目: カード${selected[1]}を提示】\n【${entity.name}】\n「ググ……調子に乗るなよ……人間が……！」\n（正体を隠しきれず、殺意をむき出しにしている！）`;
                } else {
                    log.innerText = `【2枚目: カード${selected[1]}を提示】\n【${entity.name}】\n「くだらん……」\n（見当違いの提示だったようだ……）`;
                }
            }

            step = 3;
            showBtn.style.display = "none";
            shootBtn.style.display = "block";
            protectBtn.style.display = "block";
        }
    };

    shootBtn.onclick = () => {
        ui.remove();
        if (entity.type === "human") {
            gameState.player.sin += 30;
            showMessageDialog(`【人間誤射！】\n怯えていた無抵抗の人間を撃ち抜いてしまった……！\n（罪(SIN)が 30 増加した！ 現在の罪:${gameState.player.sin}）`, () => {
                onResult("kill_human");
            });
        } else {
            gameState.player.money += 250;
            const isLvUp = gameState.gainExp(100);
            showMessageDialog(`【見破り成功！ 悪魔撃退】\n正体を完全に見破られた悪魔は悲鳴を上げて消滅した！\n（高額ボーナス: 💰250 獲得 / 100 EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}`, () => {
                onResult("combat_win");
            });
        }
    };

    protectBtn.onclick = () => {
        ui.remove();
        if (entity.type === "human") {
            gameState.player.money += 200;
            showMessageDialog(`【人間を保護した】\n「ありがとうございます……！ これ、お礼です！」\n無事に1階のコンビニへ避難させた。（💰200 を獲得！）`, () => {
                onResult("finish");
            });
        } else {
            showMessageDialog(`【痛恨の判断ミス！】\n悪魔を「保護」しようとして不用意に近づいてしまった！\n悪魔から確定の先制攻撃を受ける！`, () => {
                onResult("demon_ambush");
            });
        }
    };
}

// ★ 2Fボス影山「悪魔陣解読パズル（合計10）」＆「magic-circle.mp4」演出
export function openBossPuzzleUI(gameState, onResult) {
    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.95); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;

    let slots = { slot1: null, slot2: null, slot3: null, slot4: null };
    let activeSlotKey = "slot1";

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 5px 0; text-shadow: 0 0 10px red;">【フロアボス戦】覗き魔・影山</h2>
        <div style="color: #bbb; font-size: 0.85em; margin-bottom: 10px;">悪魔陣の4マスにカードを配置し、陣を破壊せよ！</div>

        <div style="display: grid; grid-template-columns: repeat(3, 65px); grid-template-rows: repeat(3, 85px); gap: 6px; margin-bottom: 12px; background: rgba(20,0,0,0.8); padding: 10px; border: 2px solid #550000; border-radius: 8px;">
            <div style="background: #111; border: 1px solid #333;"></div>
            <div id="slot1" class="boss-slot" style="background: #200; border: 2px dashed #ff3333; display: flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; color:#ffdd66; font-size:0.75em;">①顔<br>(上)</div>
            <div style="background: #111; border: 1px solid #333;"></div>

            <div id="slot2" class="boss-slot" style="background: #200; border: 2px dashed #ff3333; display: flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; color:#ffdd66; font-size:0.75em;">②左腕</div>
            <div style="background: #111; border: 1px solid #333; display:flex; justify-content:center; align-items:center; color:#ff3333; font-weight:bold;">影山</div>
            <div id="slot3" class="boss-slot" style="background: #200; border: 2px dashed #ff3333; display: flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; color:#ffdd66; font-size:0.75em;">③右腕</div>

            <div style="background: #111; border: 1px solid #333;"></div>
            <div id="slot4" class="boss-slot" style="background: #200; border: 2px dashed #ff3333; display: flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; color:#ffdd66; font-size:0.75em;">④足元<br>(下)</div>
            <div style="background: #111; border: 1px solid #333;"></div>
        </div>

        <div style="color: #aaa; font-size: 0.8em; margin-bottom: 8px;">選択中のマス: <span id="current-target-label" style="color:#ffdd66; font-weight:bold;">① 顔（上）</span></div>

        <div style="width: 100%; max-width: 480px; display: flex; gap: 5px; overflow-x: auto; padding-bottom: 8px; border-bottom: 1px solid #333;" id="boss-cards"></div>

        <button id="btn-fire-vox" style="margin-top: 15px; width: 100%; max-width: 320px; background: linear-gradient(180deg, #660000, #220000); color: #ffdd66; border: 2px solid #ff3333; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 6px; font-weight: bold; font-size: 1.1em;">Vox Sacra 発射！</button>
    `;
    document.body.appendChild(ui);

    const slotLabels = {
        slot1: "① 顔（上）",
        slot2: "② 左腕",
        slot3: "③ 右腕",
        slot4: "④ 足元（下）"
    };

    Object.keys(slotLabels).forEach(key => {
        document.getElementById(key).onclick = () => {
            activeSlotKey = key;
            document.getElementById("current-target-label").innerText = slotLabels[key];
        };
    });

    const cardsDiv = document.getElementById("boss-cards");
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => {
        const cDiv = document.createElement("div");
        cDiv.style.cssText = "min-width: 42px; height: 58px; border: 1px solid #555; background: #000; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #fff; font-weight: bold;";
        cDiv.innerHTML = `<img src="assets/images/cards/${num}Card.png" style="max-width:100%; max-height:100%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display:none; font-size:1.1em;">${num}</div>`;
        
        cDiv.onclick = () => {
            slots[activeSlotKey] = num;
            const targetEl = document.getElementById(activeSlotKey);
            targetEl.innerHTML = `<div style="font-size:1.5em; font-weight:bold; color:#00ff66;">${num}</div>`;
        };
        cardsDiv.appendChild(cDiv);
    });

    document.getElementById("btn-fire-vox").onclick = () => {
        if (!slots.slot1 || !slots.slot2 || !slots.slot3 || !slots.slot4) {
            alert("4つのマスすべてにカードをセットしてください！");
            return;
        }

        ui.remove();

        // 判定ロジック: ①顔=2, ④足=3, ②/③腕=1と4 (合計10)
        const isFaceCorrect = slots.slot1 === 2;
        const isFootCorrect = slots.slot4 === 3;
        const isArmsCorrect = (slots.slot2 === 1 && slots.slot3 === 4) || (slots.slot2 === 4 && slots.slot3 === 1);
        const isPerfect = isFaceCorrect && isFootCorrect && isArmsCorrect;

        if (isPerfect) {
            // ★ 正解時：magic-circle.mp4 アニメーション動画再生！
            playVideo("assets/videos/magic-circle.mp4", () => {
                const playerLevel = gameState.player.level;

                if (playerLevel >= 5) {
                    showMessageDialog("【完全解読成功！】\n4マスの真の魔方陣が完全共鳴を起こした！\n聖なる光が影山の肉体を粉々に打ち砕く！", () => {
                        onResult("win");
                    });
                } else if (playerLevel === 4) {
                    showMessageDialog("【完全解読成功！】\n魔方陣が作動！ 影山に壊滅的な大ダメージ（80%）を与えた！\n瀕死の影山との残弾戦に入る！", () => {
                        const bossEnemy = { name: "影山 (瀕死)", image: "assets/images/demon/demon1.png", hp: 24, atk: 12, def: 1 };
                        openCombatUI(bossEnemy, gameState, (res) => onResult(res));
                    });
                } else {
                    showMessageDialog("【完全解読成功！】\n魔方陣が作動！ しかし主人公の霊力が足りず仕留めきれない！\n影山に50%ダメージを与え、通常戦闘へ移行！", () => {
                        const bossEnemy = { name: "影山", image: "assets/images/demon/demon1.png", hp: 60, atk: 14, def: 2 };
                        openCombatUI(bossEnemy, gameState, (res) => onResult(res));
                    });
                }
            });
        } else {
            let matchCount = (isFaceCorrect ? 1 : 0) + (isFootCorrect ? 1 : 0) + (isArmsCorrect ? 2 : 0);
            let startHp = Math.max(30, 120 - (matchCount * 22));

            showMessageDialog(`【解読失敗……】\n魔方陣の一部が不発に終わった！（部分合致: ${matchCount}/4）\n影山が怒り狂って襲いかかってきた！`, () => {
                const bossEnemy = { name: "影山", image: "assets/images/demon/demon1.png", hp: startHp, atk: 12, def: 2 };
                openCombatUI(bossEnemy, gameState, (res) => onResult(res));
            });
        }
    };
}