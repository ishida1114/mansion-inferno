// ui.js - メッセージ中移動完全遮断＆自動クロマキー再適用版
import { gameState } from './gameState.js';
import { itemDefinitions } from './items.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

window.lastDialogCloseTime = 0;

export function applyChromaKey(element) {
    if (!element) return;
    element.style.filter = "url(#chroma-green-filter)";
}

// ★ 汎用ダイアログ作成用内部関数（全キー遮断＆クロマキー自動適用）
function createGuardedDialogContainer(contentHTML, onClosed) {
    let isClosing = false;

    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 3000; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 5%; box-sizing: border-box; background: rgba(0,0,0,0.3);";
    overlay.innerHTML = contentHTML;

    document.body.appendChild(overlay);

    // ダイアログ内の全画像にクロマキー（緑消し）を自動適用
    overlay.querySelectorAll("img").forEach(img => applyChromaKey(img));

    const handleClose = (e) => {
        // キーボード入力時は、メッセージ表示中あらゆるキーの移動イベント伝播を即座に完全ブロック！
        if (e.type === "keydown") {
            e.preventDefault();
            e.stopPropagation();

            // SPACE または Enter 以外のキーを押した場合は閉じる処理を行わず無視（移動もさせない）
            if (e.key !== " " && e.key !== "Enter" && e.key !== "Spacebar") {
                return;
            }
        }

        if (isClosing) return;
        isClosing = true;

        window.removeEventListener("keydown", handleClose, true);
        overlay.onclick = null;
        overlay.remove();

        window.lastDialogCloseTime = Date.now();

        if (onClosed) {
            setTimeout(() => {
                onClosed();
            }, 50);
        }
    };

    // キャプチャリングフェーズ(true)でキーボードイベントを最優先横取りして背景への移動入力を完全遮断
    window.addEventListener("keydown", handleClose, true);
    setTimeout(() => {
        overlay.onclick = handleClose;
    }, 150);
}

export function showMessageDialog(text, onClosed) {
    const html = `
        <div style="width: 90%; max-width: 560px; padding: 20px; background-color: rgba(10, 0, 0, 0.95); color: #dddddd; border: 2px solid #550000; border-radius: 6px; font-family: ${HORROR_FONT}; font-size: 1.1em; line-height: 1.7; white-space: pre-wrap; box-shadow: 0 0 20px rgba(0,0,0,0.9); box-sizing: border-box; pointer-events: auto;">
            ${text}
            <div style="margin-top: 12px; text-align: right; color: #888888; font-size: 0.8em;">▼ タップ または [ SPACE / Enter ] で閉じる</div>
        </div>
    `;
    createGuardedDialogContainer(html, onClosed);
}

export function showConversationDialog(imageSrc, text, onClosed) {
    const html = `
        <div style="width: 90%; max-width: 560px; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; pointer-events: auto;">
            <img src="${imageSrc}" style="max-height: 200px; border-radius: 8px; margin-bottom: 10px; align-self: flex-start; object-fit: contain;" onerror="this.style.display='none'">
            <div style="width: 100%; padding: 18px; background: rgba(10, 0, 0, 0.95); color: #dddddd; border: 2px solid #550000; border-radius: 6px; font-family: ${HORROR_FONT}; font-size: 1.05em; line-height: 1.6; white-space: pre-wrap; box-shadow: 0 0 20px rgba(0,0,0,0.9); box-sizing: border-box;">
                ${text}
                <div style="margin-top: 10px; text-align: right; color: #888888; font-size: 0.8em;">▼ タップ または [ SPACE / Enter ] で閉じる</div>
            </div>
        </div>
    `;
    createGuardedDialogContainer(html, onClosed);
}

export function showItemAcquiredModal(imagePath, itemTitle, detailText, onClosed) {
    const html = `
        <div style="width: 90%; max-width: 500px; padding: 25px; background-color: rgba(5, 0, 0, 0.95); border: 2px solid #ff3333; border-radius: 8px; text-align: center; font-family: ${HORROR_FONT}; box-shadow: 0 0 30px rgba(255,0,0,0.5); pointer-events: auto;">
            <div style="color: #ff3333; font-size: 1.4em; margin-bottom: 12px; text-shadow: 0 0 10px red;">― アイテム獲得 ―</div>
            <img src="${imagePath}" style="max-height: 160px; max-width: 80%; border-radius: 6px; margin-bottom: 15px;" onerror="this.style.display='none'">
            <div style="color: #ffdd66; font-size: 1.2em; font-weight: bold; margin-bottom: 8px;">${itemTitle}</div>
            <div style="color: #cccccc; font-size: 0.95em; margin-bottom: 20px; white-space: pre-wrap; line-height: 1.5;">${detailText}</div>
            <div style="color: #888; font-size: 0.8em;">タップ または [ SPACE / Enter ] で閉じる</div>
        </div>
    `;
    createGuardedDialogContainer(html, onClosed);
}

export function playFloorTransition(targetFloor, onComplete) {
    const fadeDiv = document.createElement("div");
    fadeDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: black; z-index: 4000; transition: opacity 0.5s ease; opacity: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #ff3333; font-family: ${HORROR_FONT}; font-size: 1.6em; gap: 15px;`;
    document.body.appendChild(fadeDiv);

    setTimeout(() => { 
        fadeDiv.style.opacity = "1"; 
        fadeDiv.innerHTML = `<div>ザッ…… ザッ……</div><div style="font-size: 0.8em; color: #aaa;">${targetFloor}階へ移動中...</div>`; 
    }, 10);

    setTimeout(() => { 
        if (onComplete) onComplete(); 
        setTimeout(() => { 
            fadeDiv.style.opacity = "0"; 
            setTimeout(() => {
                fadeDiv.remove();
                window.lastDialogCloseTime = Date.now();
            }, 500); 
        }, 800); 
    }, 1500);
}

export function playVideo(src, onEnded, buttonLabel = "▶ 映像を再生する") {
    const oldOverlay = document.getElementById("video-player-overlay");
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement("div");
    overlay.id = "video-player-overlay";
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; z-index: 3500; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; padding: 20px;";

    const video = document.createElement("video");
    video.src = src;
    video.style.cssText = "max-width: 100%; max-height: 80%; object-fit: contain; background-color: #000;";
    video.controls = false; 
    video.autoplay = true; 
    video.playsInline = true; 
    video.muted = true; 

    overlay.appendChild(video);

    const ctrlContainer = document.createElement("div");
    ctrlContainer.style.cssText = "display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; z-index: 3600;";

    const playBtn = document.createElement("button");
    playBtn.id = "video-start-btn";
    playBtn.style.cssText = `padding: 14px 28px; font-size: 1.2em; color: #ffdd66; background: linear-gradient(180deg, #880000, #330000); border: 2px solid #ff3333; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 0 20px red; font-family: ${HORROR_FONT};`;
    playBtn.innerText = buttonLabel;
    
    const errorMsg = document.createElement("div");
    errorMsg.style.cssText = `color: #ff6666; font-size: 0.9em; text-align: center; display: none; font-family: ${HORROR_FONT}; background: rgba(50,0,0,0.8); padding: 8px 12px; border-radius: 4px; border: 1px solid #aa0000;`;

    const skipBtn = document.createElement("button");
    skipBtn.style.cssText = "background: transparent; color: #888; border: 1px solid #444; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 0.8em; margin-top: 5px;";
    skipBtn.innerText = "スキップして進む";

    ctrlContainer.appendChild(playBtn);
    ctrlContainer.appendChild(errorMsg);
    ctrlContainer.appendChild(skipBtn);
    overlay.appendChild(ctrlContainer);

    document.body.appendChild(overlay);

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        if (overlay.parentNode) overlay.remove();
        window.lastDialogCloseTime = Date.now();
        if (onEnded) onEnded();
    };

    video.onended = finish;

    video.onerror = (e) => {
        console.error("Video load error for:", src, e);
        errorMsg.style.display = "block";
        errorMsg.innerText = `【動画のロード失敗】\nファイルパス: ${src}\n※ファイルが存在するか確認してください。`;
        playBtn.innerText = "▶ 再度再生を試みる";
    };

    let isPlaying = false;
    video.onplaying = () => {
        isPlaying = true;
        playBtn.style.display = "none";
        errorMsg.style.display = "none";
    };

    skipBtn.onclick = (e) => {
        e.stopPropagation();
        video.pause();
        finish();
    };

    playBtn.onclick = (e) => {
        e.stopPropagation();
        video.play().then(() => {
            isPlaying = true;
            playBtn.style.display = "none";
        }).catch(err => {
            console.warn("Manual play error:", err);
            errorMsg.style.display = "block";
            errorMsg.innerText = "ブラウザの権限により再生できませんでした。";
        });
    };

    const promise = video.play();
    if (promise !== undefined) {
        promise.then(() => {
            isPlaying = true;
            playBtn.style.display = "none";
        }).catch(err => {
            console.warn("Autoplay blocked:", err);
            isPlaying = false;
            playBtn.style.display = "block";
        });
    }
}

export function openShopUI(onClosed) {
    const shopDiv = document.createElement("div");
    shopDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2800; overflow: hidden; font-family: ${HORROR_FONT}; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box;`; 
    
    const updateShopHeader = () => {
        document.getElementById("shop-money").innerText = gameState.player.money;
        document.getElementById("shop-sin").innerText = gameState.player.sin;
        document.getElementById("purify-cost-text").innerText = `現在コスト: 💰 ${gameState.getPurifyCost()}`;
    };

    shopDiv.innerHTML = `
        <video src="assets/videos/CVS.mp4" autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.35; filter: blur(2px);"></video>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle, rgba(20,0,0,0.7) 0%, rgba(0,0,0,0.95) 90%);"></div>
        <div style="position: relative; z-index: 10; width: 100%; max-width: 540px; height: 90%; background: rgba(10, 5, 5, 0.92); border: 2px solid #770000; box-shadow: 0 0 30px rgba(255, 0, 0, 0.4); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 12px 15px; border-bottom: 2px solid #550000; background: linear-gradient(180deg, #2a0000, #0a0000); display: flex; justify-content: space-between; align-items: center;">
                <div><h2 style="color: #ff3333; margin: 0; font-size: 1.4em;">悪魔の無人レジ</h2></div>
                <div style="font-size: 0.95em; color: #ffdd66; font-weight: bold;">
                    💰 <span id="shop-money">${gameState.player.money}</span>
                    <span style="color:#ff4444; margin-left:8px;">(Sin: <span id="shop-sin">${gameState.player.sin}</span>)</span>
                </div>
            </div>

            <div id="sin-purify-bar" style="background: rgba(40,0,0,0.9); padding: 10px 15px; border-bottom: 1px solid #660000; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="color: #ffaaaa; font-weight: bold; font-size: 0.9em;">【罪(Sin)の浄化】</div>
                    <div id="purify-cost-text" style="color: #aaa; font-size: 0.78em;">現在コスト: 💰 ${gameState.getPurifyCost()}</div>
                </div>
                <button id="btn-purify-sin" style="background: linear-gradient(180deg, #660000, #220000); color: #ffdd66; border: 1px solid #ff3333; padding: 6px 12px; font-family: inherit; cursor: pointer; border-radius: 4px; font-size: 0.85em; font-weight: bold;">
                    罪を消す
                </button>
            </div>

            <div id="shop-content" style="flex: 1; overflow-y: auto; padding: 12px; box-sizing: border-box;"></div>
            <div style="padding: 10px; text-align: center; border-top: 1px solid #440000; background: #050505;"><button id="closeBtn" style="background: transparent; color: #aaa; border: 1px solid #555; padding: 8px 25px; cursor: pointer; border-radius: 4px;">立ち去る</button></div>
        </div>
    `;
    document.body.appendChild(shopDiv);

    const purifyBtn = document.getElementById("btn-purify-sin");
    purifyBtn.onclick = () => {
        if (gameState.player.sin <= 0) {
            alert("現在、背負っている罪(Sin)はありません。");
            return;
        }
        const cost = gameState.getPurifyCost();
        if (gameState.player.money < cost) {
            alert(`浄化費用（💰${cost}）が足りません！`);
            return;
        }

        if (gameState.purifySin()) {
            alert("悪魔の無人レジで罪(Sin)を清算しました。");
            updateShopHeader();
        }
    };

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
                updateShopHeader();

                if (item && item.type === "armor") {
                    gameState.equippedArmor = item.id;
                    gameState.player.def = Math.max(gameState.player.def, item.def || 1);
                    btn.disabled = true;
                    btn.style.background = "#333";
                    btn.style.color = "#aaa";
                    btn.style.border = "1px solid #555";
                    btn.innerText = "装備中";
                } else {
                    if (!gameState.inventory) gameState.inventory = { items: [] };
                    if (!gameState.inventory.items) gameState.inventory.items = [];
                    gameState.inventory.items.push({ ...item });

                    btn.style.background = "#006600"; btn.innerText = "完了！"; 
                    setTimeout(() => { btn.style.background = ""; btn.innerText = "購入"; }, 500);
                }
            } else {
                btn.innerText = "資金不足"; 
                setTimeout(() => { btn.innerText = "購入"; }, 800);
            }
        };
    });
    document.getElementById("closeBtn").onclick = () => { window.lastDialogCloseTime = Date.now(); shopDiv.remove(); if (onClosed) onClosed(); };
}

export function openCombatUI(enemy, gameState, onResult, context) {
    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.92); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;

    let enemyHp = enemy.hp || 30;
    const enemyAtk = enemy.atk || 8;
    const enemyDef = enemy.def || 0;
    const enemyWeakness = enemy.weakness || [1];
    let isGuarding = false;

    const visualHTML = `<img id="combat-enemy-img" src="${enemy.image}" style="max-height: 200px; border-radius: 8px; margin-bottom: 10px; object-fit: contain;">`;

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 10px 0; text-shadow: 0 0 10px red;">【戦闘】${enemy.name}</h2>
        ${visualHTML}
        <div style="color: #ffdd66; font-size: 1.2em; font-weight: bold;">${enemy.name}</div>
        
        <div style="display: flex; gap: 20px; font-size: 1.05em; margin: 10px 0 15px 0; background: rgba(0,0,0,0.6); padding: 6px 16px; border-radius: 6px; border: 1px solid #333;">
            <span id="player-hp-text" style="color: #00ff66; font-weight: bold;">主人公HP: ${gameState.player.hp} / ${gameState.player.maxHp}</span>
            <span id="enemy-hp-text" style="color: #ff4444; font-weight: bold;">敵HP: ${enemyHp}</span>
        </div>

        <div id="combat-log" style="width: 100%; max-width: 450px; height: 85px; background: rgba(0,0,0,0.8); border: 1px solid #550000; padding: 10px; margin-bottom: 15px; color: #ccc; font-size: 0.9em; line-height: 1.5; white-space: pre-wrap; overflow-y: auto;">悪魔が目の前に立ち塞がった！ どうする？</div>

        <div style="display: flex; gap: 10px; width: 100%; max-width: 450px;">
            <button id="btn-attack" style="flex: 1.2; background: #440000; color: #fff; border: 1px solid #ff3333; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 4px; font-weight: bold;">Vox Sacra (射撃)</button>
            <button id="btn-item" style="flex: 1; background: #002244; color: #66ccff; border: 1px solid #3388ff; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 4px; font-weight: bold;">道具</button>
            <button id="btn-escape" style="flex: 0.8; background: #111; color: #aaa; border: 1px solid #555; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 4px;">逃げる</button>
        </div>
    `;
    document.body.appendChild(ui);

    const enemyImg = document.getElementById("combat-enemy-img");
    applyChromaKey(enemyImg);

    const log = document.getElementById("combat-log");
    const playerHpText = document.getElementById("player-hp-text");
    const enemyHpText = document.getElementById("enemy-hp-text");
    const attackBtn = document.getElementById("btn-attack");
    const itemBtn = document.getElementById("btn-item");
    const escapeBtn = document.getElementById("btn-escape");

    const updateHpDisplay = () => {
        playerHpText.innerText = `主人公HP: ${gameState.player.hp} / ${gameState.player.maxHp}`;
    };

    const triggerDeathSequence = () => {
        attackBtn.disabled = true;
        itemBtn.disabled = true;
        escapeBtn.disabled = true;
        playerHpText.innerText = `主人公HP: 0 / ${gameState.player.maxHp}`;
        playerHpText.style.color = "#ff0000";
        log.innerText += "\n\n【敗北】主人公は力尽きて倒れた……！";

        setTimeout(() => {
            ui.remove();
            const respawnMsg = gameState.handlePlayerDeath();
            if (context && context.changeFloor) {
                context.changeFloor(1);
            }
            showMessageDialog(respawnMsg, () => {
                if (onResult) onResult("defeat");
            });
        }, 1500); 
    };

    const enemyTurn = (actionMessage) => {
        log.innerText = actionMessage;

        setTimeout(() => {
            const dodgeChance = (gameState.player.agi || 5) * 0.04;
            if (Math.random() < dodgeChance) {
                log.innerText += `\n素早い身こなし！ 悪魔の攻撃を回避した！`;
                attackBtn.disabled = false;
                itemBtn.disabled = false;
                escapeBtn.disabled = false;
            } else {
                let baseEnemyAtk = enemyAtk - (gameState.player.def || 0);
                if (isGuarding) {
                    baseEnemyAtk = Math.max(1, Math.floor(baseEnemyAtk * 0.5));
                    isGuarding = false;
                }
                const enemyRand = 0.85 + Math.random() * 0.3;
                const damageTaken = Math.max(1, Math.floor(baseEnemyAtk * enemyRand));

                gameState.player.hp = Math.max(0, gameState.player.hp - damageTaken);

                if (gameState.player.hp <= 0) {
                    triggerDeathSequence();
                } else {
                    updateHpDisplay();
                    log.innerText += `\n悪魔の反撃！ 主人公は ${damageTaken} ダメージを受けた！`;
                    attackBtn.disabled = false;
                    itemBtn.disabled = false;
                    escapeBtn.disabled = false;
                }
            }
        }, 1000);
    };

    attackBtn.onclick = () => {
        if (Date.now() - window.lastDialogCloseTime < 300) return;

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
        itemBtn.disabled = true;
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

            const shotMsg = `Vox Sacraの射撃！${isWeaknessHit ? '（弱点特効！）' : ''} 悪魔に ${netDamage} ダメージ！`;

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

            enemyTurn(shotMsg);
        }, 800);
    };

    itemBtn.onclick = () => {
        if (Date.now() - window.lastDialogCloseTime < 300) return;

        const itemsList = (gameState.inventory && gameState.inventory.items) ? gameState.inventory.items : [];
        if (itemsList.length === 0) {
            log.innerText = "【道具】使用できる持ち物がない！";
            return;
        }

        const itemModal = document.createElement("div");
        itemModal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3200; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;

        let listHTML = `<div style="color: #ffdd66; font-size: 1.2em; margin-bottom: 15px; font-weight: bold;">【所持品を選択】</div>`;
        listHTML += `<div style="width: 100%; max-width: 380px; max-height: 250px; overflow-y: auto; background: #111; border: 1px solid #555; border-radius: 6px; padding: 10px;">`;

        itemsList.forEach((itm, idx) => {
            listHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding: 8px 4px;">
                    <div><span style="color: #fff; font-weight: bold;">${itm.name}</span><div style="font-size:0.75em; color:#aaa;">${itm.description || ''}</div></div>
                    <button class="use-battle-item-btn" data-idx="${idx}" style="background: #004488; color: #fff; border: 1px solid #33aahh; padding: 5px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">使用</button>
                </div>
            `;
        });

        listHTML += `</div><button id="close-item-modal" style="margin-top: 15px; background: #333; color: #ccc; border: 1px solid #666; padding: 8px 20px; border-radius: 4px; cursor: pointer;">キャンセル</button>`;
        itemModal.innerHTML = listHTML;
        document.body.appendChild(itemModal);

        document.getElementById("close-item-modal").onclick = () => itemModal.remove();

        itemModal.querySelectorAll(".use-battle-item-btn").forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute("data-idx"));
                const usedItem = itemsList[idx];

                itemsList.splice(idx, 1);
                itemModal.remove();

                attackBtn.disabled = true;
                itemBtn.disabled = true;
                escapeBtn.disabled = true;

                if (usedItem.id === "energy_drink" || usedItem.healAmount) {
                    const heal = usedItem.healAmount || 15;
                    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + heal);
                    updateHpDisplay();
                    enemyTurn(`【道具使用】${usedItem.name} を飲んだ！\n主人公のHPが ${heal} 回復した！（現在HP: ${gameState.player.hp}）`);
                } else if (usedItem.id === "umbrella" || usedItem.guardEffect) {
                    isGuarding = true;
                    enemyTurn(`【道具使用】${usedItem.name} を構えて身構えた！\n次の敵の攻撃ダメージを軽減する！`);
                } else {
                    enemyTurn(`【道具使用】${usedItem.name} を使ったが、何も起きなかった……。`);
                }
            };
        });
    };

    escapeBtn.onclick = () => {
        if (Date.now() - window.lastDialogCloseTime < 300) return;

        attackBtn.disabled = true;
        itemBtn.disabled = true;
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

                    if (gameState.player.hp <= 0) {
                        triggerDeathSequence();
                    } else {
                        updateHpDisplay();
                        log.innerText += `\n背後から追撃！ 主人公は ${damageTaken} ダメージを受けた！`;
                        attackBtn.disabled = false;
                        itemBtn.disabled = false;
                        escapeBtn.disabled = false;
                    }
                }, 1000);
            }
        }, 1000);
    };
}

export function openInquisitionUI(entity, gameState, onResult, context) {
    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.95); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;
    
    let visualHTML = `<img id="inq-entity-img" src="${entity.faceImage || entity.image}" style="max-height: 180px; border-radius: 8px;" onerror="this.style.display='none'">`;

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 10px 0; text-shadow: 0 0 8px red;">【査問】住人との対面</h2>
        ${visualHTML}
        <div style="color: #ddd; font-size: 1.1em; margin-top: 5px; font-weight: bold;">${entity.name}</div>
        
        <div id="inq-log" style="width: 100%; max-width: 500px; height: 110px; background: rgba(0,0,0,0.85); border: 1px solid #550000; padding: 10px; margin: 12px 0; color: #ccc; font-size: 0.9em; line-height: 1.5; overflow-y: auto; white-space: pre-wrap;">（住人と対面した。ラミナカードを提示して相手の表情や仕草を伺おう……）</div>

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
        cDiv.innerHTML = `<img src="assets/images/cards/${num}card.png" style="max-width:100%; max-height:100%;" onerror="this.src='assets/images/cards/${num}Card.png';"><div style="display:none; font-size:1.2em;">${num}</div>`;
        
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

    function getReactionMessage(cardNum, entity) {
        if (entity.type === "human") {
            const humanMsg = [
                "「え…？ なんですかその紙切れは？ 宗教の勧誘ですか？」",
                "「気味が悪いカードですね……近付けないでください！」",
                "「何がしたいんですか？ 警察を呼びますよ！」"
            ];
            return humanMsg[Math.floor(Math.random() * humanMsg.length)];
        } else {
            const targetWeakness = entity.weakness || 3;
            const diff = Math.abs(parseInt(cardNum) - targetWeakness);
            const isLying = Math.random() < 0.25;
            const effectiveDiff = isLying ? (diff === 0 ? 4 : 0) : diff;

            if (effectiveDiff === 0) {
                return "「ぐぐっ……！？」\n相手の瞳が一瞬赤くうごめき、肌から不気味な煙が立ち上った！";
            } else if (effectiveDiff <= 2) {
                return "「……くっ……！」\n平然を装おうとしているが、不自然に口元を引きつらせて身体を硬直させた……。";
            } else {
                return "「……ハッ、何ですかそれ？ 馬鹿馬鹿しい。」\n不気味なほど余裕の笑みを浮かべて、せせら笑っている。";
            }
        }
    }

    showBtn.onclick = () => {
        if (step === 1) {
            if (!selected[0]) { alert("1枚目のカードを選択してください。"); return; }
            log.innerText = `【1枚目: カード${selected[0]}を提示】\n【${entity.name}】\n` + getReactionMessage(selected[0], entity);
            step = 2;
            showBtn.innerText = "2枚目を提示する";

        } else if (step === 2) {
            if (!selected[1]) { alert("2枚目のカードを選択してください。"); return; }

            log.innerText = `【2枚目: カード${selected[1]}を提示】\n【${entity.name}】\n` + getReactionMessage(selected[1], entity);

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
            const isWeaknessHit = selected.some(num => parseInt(num) === entity.weakness);

            if (isWeaknessHit) {
                gameState.player.money += 250;
                const isLvUp = gameState.gainExp(100);
                showMessageDialog(`【完全見破り成功！】\n悪魔の真の弱点（カード${entity.weakness}）を見抜き、聖なる弾丸で核を撃ち抜いた！\n戦闘を経ることなく一撃で討滅した！（💰250 獲得 / 100 EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}`, () => {
                    onResult("combat_win");
                });
            } else {
                showMessageDialog(`【見破り成功！ しかし弱点不一致】\n悪魔の正体を暴いたが、弱点属性を打ち抜けなかった！\n先制ダメージを与え、敵HP50%状態で戦闘に入る！`, () => {
                    const demonEnemy = {
                        name: entity.name,
                        image: entity.realImage,
                        hp: 15,
                        atk: 10,
                        def: 1,
                        weakness: [entity.weakness]
                    };
                    openCombatUI(demonEnemy, gameState, (res) => onResult(res === "win" ? "combat_win" : res), context);
                });
            }
        }
    };

    protectBtn.onclick = () => {
        ui.remove();
        if (entity.type === "human") {
            gameState.player.money += 300;
            
            const hintText = "「助けてくれてありがとうございます……！ これはお礼です！\nあ、そういえば2F奥の影山ですが……あいつの陣を破るには『4マスの合計をピッタリ10』にしないといけないらしいです！ 腕には小さい数字から順にカードを置いてみてください！」";
            if (!gameState.bossHints) gameState.bossHints = [];
            gameState.bossHints.push("【2F住人の証言】影山の魔方陣は4マスの合計を「10」にする。腕(左右)には小さい数字のカードから順に配置する。");

            showMessageDialog(`【人間を保護した】\n${hintText}\n（💰300 を獲得！ / スマホの悪魔手記にヒントが保存された！）`, () => {
                onResult("finish");
            });
        } else {
            showMessageDialog(`【痛恨の判断ミス！】\n悪魔を「保護」しようとして不用意に近づいてしまった！\n悪魔から確定の先制攻撃を受ける！`, () => {
                onResult("demon_ambush");
            });
        }
    };
}

export function openBossPuzzleUI(puzzleConfig, gameState, onSubmit) {
    const oldUI = document.getElementById("boss-puzzle-modal");
    if (oldUI) oldUI.remove();

    const ui = document.createElement("div");
    ui.id = "boss-puzzle-modal";
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.96); z-index: 3500; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 10px; font-family: ${HORROR_FONT}; box-sizing: border-box; overflow-y: auto;`;

    let slots = {};
    (puzzleConfig.slots || []).forEach(s => slots[s.id] = null);
    let activeSlotKey = puzzleConfig.slots && puzzleConfig.slots.length > 0 ? puzzleConfig.slots[0].id : null;

    let slotsHTML = "";
    puzzleConfig.slots.forEach(s => {
        slotsHTML += `<div id="${s.id}" class="boss-slot" style="${s.gridPos} background: #2a0000; border: 2px dashed #ff3333; display: flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; color:#ffdd66; font-size:0.75em;">${s.label}</div>`;
    });

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 4px 0; text-shadow: 0 0 10px red; font-size: 1.35em;">${puzzleConfig.title}</h2>
        <div style="color: #bbb; font-size: 0.8em; margin-bottom: 6px;">${puzzleConfig.subTitle}</div>

        <div style="display: grid; grid-template-columns: repeat(3, 62px); grid-template-rows: repeat(3, 75px); gap: 6px; margin-bottom: 8px; background: rgba(20,0,0,0.85); padding: 8px; border: 2px solid #550000; border-radius: 8px; position: relative;">
            <div style="grid-area: 2 / 2; background: #150000; border: 1px solid #440000; display:flex; justify-content:center; align-items:center; color:#ff3333; font-weight:bold; font-size:0.95em;">${puzzleConfig.bossName}</div>
            ${slotsHTML}
        </div>

        <div style="color: #aaa; font-size: 0.82em; margin-bottom: 6px;">選択中の対象: <span id="current-target-label" style="color:#ffdd66; font-weight:bold;">${puzzleConfig.slots[0].label}</span></div>

        <div style="width: 100%; max-width: 360px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 8px; background: rgba(0,0,0,0.85); border: 2px solid #550000; border-radius: 8px;" id="boss-cards"></div>

        <button id="btn-fire-vox" style="margin-top: 10px; width: 100%; max-width: 340px; background: linear-gradient(180deg, #660000, #220000); color: #ffdd66; border: 2px solid #ff3333; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 6px; font-weight: bold; font-size: 1.15em; box-shadow: 0 0 15px red;">Vox Sacra 発射！</button>
    `;
    document.body.appendChild(ui);

    puzzleConfig.slots.forEach(s => {
        document.getElementById(s.id).onclick = () => {
            activeSlotKey = s.id;
            document.getElementById("current-target-label").innerText = s.label;
        };
    });

    const cardNames = ["", "Ⅰ 聖水", "Ⅱ 鏡", "Ⅲ 浄化塩", "Ⅳ 十字架", "Ⅴ 聖書", "Ⅵ 聖炎", "Ⅶ 鐘", "Ⅷ 聖香", "Ⅸ 銀杭"];

    const renderCardGrid = () => {
        const cardsDiv = document.getElementById("boss-cards");
        cardsDiv.innerHTML = "";

        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => {
            const isUsed = Object.values(slots).includes(num);
            const cDiv = document.createElement("div");
            cDiv.style.cssText = `height: 95px; border: 2px solid ${isUsed ? '#333' : '#770000'}; background: ${isUsed ? '#050505' : '#111'}; opacity: ${isUsed ? '0.4' : '1'}; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: ${isUsed ? 'not-allowed' : 'pointer'}; color: #ffdd66; font-weight: bold; border-radius: 6px; padding: 4px; box-sizing: border-box;`;
            
            cDiv.innerHTML = `
                <img src="assets/images/cards/${num}card.png" style="max-height: 52px; max-width: 52px; object-fit: contain; margin-bottom: 3px;" onerror="this.src='assets/images/cards/${num}Card.png'; this.onerror=function(){ this.style.display='none'; };">
                <div style="font-size:0.85em; color:${isUsed ? '#666' : '#ffdd66'}; white-space:nowrap; font-weight:bold;">${isUsed ? '使用中' : cardNames[num]}</div>
            `;
            
            cDiv.onclick = () => {
                Object.keys(slots).forEach(k => {
                    if (slots[k] === num) {
                        slots[k] = null;
                        const sObj = puzzleConfig.slots.find(x => x.id === k);
                        document.getElementById(k).innerHTML = sObj ? sObj.label : k;
                    }
                });

                slots[activeSlotKey] = num;
                document.getElementById(activeSlotKey).innerHTML = `<div style="font-size:1.6em; font-weight:bold; color:#00ff66;">${num}</div>`;
                renderCardGrid();
            };
            cardsDiv.appendChild(cDiv);
        });
    };

    renderCardGrid();

    document.getElementById("btn-fire-vox").onclick = () => {
        const allSet = puzzleConfig.slots.every(s => slots[s.id] !== null);
        if (!allSet) {
            alert("すべてのマスにカードをセットしてください！");
            return;
        }

        ui.remove();
        if (onSubmit) onSubmit(slots);
    };
}