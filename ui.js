// ui.js - ノベル風レイアウト・音響（BGM/SE）・クロマキー維持＆7F-BGM動的連携・弱点看破＆常時表示・6F黒猫捕縛判定＆6Fクリア後「真の相棒」覚醒強化対応・戦闘中装填ボタン削除(3ボタン整理)・ボス逃走不可・黄色い傘2本制限・白化防止・査問正体分離＆銃撃SE・大型魔方陣パズル・戦闘1.2秒＆クリック送り(案A) 完全版

import { gameState } from './gameState.js';
import { itemDefinitions } from './items.js';
import { sound } from './sound.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";
const CARD_NAMES = ["", "Ⅰ 聖水", "Ⅱ 鏡", "Ⅲ 浄化塩", "Ⅳ 十字架", "Ⅴ 聖書", "Ⅵ 聖炎", "Ⅶ 鐘", "Ⅷ 聖香", "Ⅸ 銀杭"];

window.lastDialogCloseTime = 0;

// ★ 現在のフロアに応じたフィールドBGMを取得するヘルパー関数
function getFieldBGM(state) {
    const floor = state ? state.currentFloor : (gameState ? gameState.currentFloor : 1);
    return floor === 7 ? "assets/audio/bgm/7thfloor.mp3" : "assets/audio/bgm/field.mp3";
}

// ★ 戦闘用アニメーションスタイル（filterを触らずクロマキー透過を永久維持）
function ensureCombatStyles() {
    if (document.getElementById("combat-dynamic-style")) return;
    const style = document.createElement("style");
    style.id = "combat-dynamic-style";
    style.textContent = `
        @keyframes damagePopupFloat {
            0% { opacity: 0; transform: translate(-50%, 10px) scale(0.6); }
            20% { opacity: 1; transform: translate(-50%, -15px) scale(1.2); }
            75% { opacity: 1; transform: translate(-50%, -35px) scale(1.0); }
            100% { opacity: 0; transform: translate(-50%, -50px) scale(0.85); }
        }
        @keyframes enemyHurtShake {
            0% { transform: translate(0, 0); }
            20% { transform: translate(-8px, 4px) scale(0.98); }
            40% { transform: translate(8px, -4px) scale(1.02); }
            60% { transform: translate(-6px, 2px); }
            80% { transform: translate(6px, -2px); }
            100% { transform: translate(0, 0); }
        }
        @keyframes yellowUmbrellaFlash {
            0% { opacity: 0.9; }
            100% { opacity: 0; }
        }
        @keyframes combatPromptBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
        }
    `;
    document.head.appendChild(style);
}

export function applyChromaKey(element) {
    if (!element) return;
    element.style.filter = "url(#chroma-green-filter)";
}

function createGuardedDialogContainer(contentHTML, onClosed) {
    let isClosing = false;

    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 4000; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 5%; box-sizing: border-box; background: rgba(0,0,0,0.3);";
    overlay.innerHTML = contentHTML;

    document.body.appendChild(overlay);

    overlay.querySelectorAll("img").forEach(img => applyChromaKey(img));

    const handleClose = (e) => {
        if (e.type === "keydown") {
            e.preventDefault();
            e.stopPropagation();

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

    window.addEventListener("keydown", handleClose, true);
    setTimeout(() => {
        overlay.onclick = handleClose;
    }, 150);
}

export function showOpeningUI(onClosed) {
    const html = `
        <div style="width: 90%; max-width: 580px; max-height: 90vh; padding: 20px; background-color: rgba(5, 0, 0, 0.96); color: #dddddd; border: 2px solid #770000; border-radius: 8px; font-family: ${HORROR_FONT}; box-shadow: 0 0 30px rgba(255,0,0,0.5); display: flex; flex-direction: column; align-items: center; box-sizing: border-box; overflow-y: auto; pointer-events: auto;">
            <img src="assets/images/opening.webp" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 6px; margin-bottom: 15px; border: 1px solid #440000;" onerror="this.style.display='none'">
            <div style="font-size: 0.92em; line-height: 1.8; white-space: pre-wrap; color: #ccc; text-align: left; width: 100%; margin-bottom: 15px;">
新卒の就職活動は全滅した。
目標を見失い大学を卒業してからも定職には就かず、
家庭教師のアルバイトで日銭を稼ぐ日々。
「自分はどう生きるべきなのか」
日々悶々と過ごすなか、家庭教師の生徒から一本の電話が入った。

『先生……助けて！ マンションが……みんなおかしくなっちゃったんだ……！』

悲鳴とともに途切れた、教え子からのＳＯＳ。
駆けつけた先は、異様な静寂と黒い霧に包まれた8階建てのマンション。
そこはすでに人間の住処ではなく、凶悪な悪魔どもが支配する「地獄（インフェルノ）」と化していた。

特別な力なんてない。悪魔と戦う知識もない。
でも教え子を救うために踏み込んだ絶望の城。

――俺は、ただの素人だ。だが、あの子を見捨てるわけにはいかない。
            </div>
            <div style="color: #ffdd66; font-size: 0.85em; font-weight: bold; text-shadow: 0 0 5px red;">▼ タップ または [ SPACE / Enter ] で探索を開始する</div>
        </div>
    `;
    createGuardedDialogContainer(html, () => {
        sound.playBGM(getFieldBGM(gameState));
        if (onClosed) onClosed();
    });
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
        <div style="width: 100%; max-width: 800px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; position: relative; pointer-events: auto;">
            <img src="${imageSrc}" style="max-height: 55vh; max-width: 90%; object-fit: contain; margin-bottom: -15px; z-index: 1;" onerror="this.style.display='none'">
            <div style="width: 95%; max-width: 700px; padding: 20px 25px; background: rgba(10, 5, 5, 0.95); color: #eeeeee; border: 2px solid #880000; border-radius: 8px; font-family: ${HORROR_FONT}; font-size: 1.15em; line-height: 1.8; white-space: pre-wrap; box-shadow: 0 0 40px rgba(0,0,0,0.9); box-sizing: border-box; overflow-y: auto; max-height: 35vh; z-index: 2; position: relative;">
                ${text}
                <div style="margin-top: 15px; text-align: right; color: #ffaa00; font-size: 0.85em; font-weight: bold;">▼ タップ または [ SPACE / Enter ] で閉じる</div>
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
    fadeDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: black; z-index: 5000; transition: opacity 0.5s ease; opacity: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #ff3333; font-family: ${HORROR_FONT}; font-size: 1.6em; gap: 15px;`;
    document.body.appendChild(fadeDiv);

    setTimeout(() => { 
        fadeDiv.style.opacity = "1"; 
        fadeDiv.innerHTML = `<div>ザッ…… ザッ……</div><div style="font-size: 0.8em; color: #aaa;">${targetFloor}Fへ移動中...</div>`; 
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
    video.style.cssText = "max-width: 100%; max-height: 80%; object-fit: contain; background-color: #111;";
    video.controls = false; 
    video.autoplay = true; 
    video.playsInline = true; 
    video.muted = true; 

    applyChromaKey(video);
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
        errorMsg.style.display = "block";
        errorMsg.innerText = `【動画のロード失敗】\nファイルパス: ${src}\n※ファイルが存在するか確認してください。`;
        playBtn.innerText = "▶ 再度再生を試みる";
    };

    video.onplaying = () => {
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
            playBtn.style.display = "none";
        }).catch(err => {
            errorMsg.style.display = "block";
            errorMsg.innerText = "ブラウザの権限により再生できませんでした。";
        });
    };

    const promise = video.play();
    if (promise !== undefined) {
        promise.then(() => {
            playBtn.style.display = "none";
        }).catch(err => {
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
        if (item.type === "armor") {
            const currentStage = gameState.armorUnlockStage || 0;
            if (item.unlockStage > currentStage) {
                return;
            }
        }

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
            const price = parseInt(btn.getAttribute("data-price"), 10);
            const item = itemDefinitions[itemId];

            // ★ 黄色いビニール傘の所持上限チェック（最大2本）
            const isYellow = (itemId || '').includes('yellow') || (item.name || '').includes('黄');
            if (isYellow) {
                const currentYellowCount = (gameState.inventory?.items || []).filter(i => 
                    (i.id || '').includes('yellow') || (i.name || '').includes('黄')
                ).length;
                if (currentYellowCount >= 2) {
                    alert("【所持上限】黄色いビニール傘は最大2本までしか携帯できません！");
                    return;
                }
            }

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

                    btn.style.background = "#006600"; 
                    btn.innerText = "完了！"; 
                    setTimeout(() => { 
                        btn.style.background = "linear-gradient(180deg, #440000, #110000)"; 
                        btn.innerText = "購入"; 
                    }, 500);
                }
            } else {
                btn.innerText = "資金不足"; 
                setTimeout(() => { btn.innerText = "購入"; }, 800);
            }
        };
    });
    document.getElementById("closeBtn").onclick = () => { window.lastDialogCloseTime = Date.now(); shopDiv.remove(); if (onClosed) onClosed(); };
}

// ==========================================
// 戦闘UI制御（弱点看破・常時表示・6F黒猫捕縛判定＆6Fクリア後「真の相棒」覚醒強化対応・戦闘中装填ボタン削除(3ボタン整理)・ボス逃走不可・黄色い傘2本制限・白化防止・査問正体分離＆銃撃SE・大型魔方陣パズル・戦闘1.2秒＆クリック送り(案A) 完全版）
// ==========================================
export function openCombatUI(enemy, gameState, onResult, context) {
    ensureCombatStyles();

    sound.playSE("assets/audio/se/sentoukaisi.mp3");
    sound.playBGM("assets/audio/bgm/battle.mp3");

    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.92); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;

    let enemyHp = enemy.hp || 30;
    const enemyAtk = enemy.atk || 8;
    const enemyDef = enemy.def || 0;
    const enemyWeakness = Array.isArray(enemy.weakness) ? enemy.weakness : [enemy.weaknessCard || 1];
    
    let isGuarding = false;
    let isRedUmbrellaActive = false;
    let extraAgi = 0;
    let isEnemyCharging = false;
    let enemyStunTurns = 0;

    // ★ 黒猫（使い魔）同行＆6Fクリア後の「真の相棒」覚醒判定
    const isCatAccompanying = () => {
        if (!gameState.flags || !gameState.flags.hasCat) return false;
        if (gameState.flags.isCatTrapped) return false;
        if (gameState.currentFloor === 6 && !(gameState.flags.isCocoonCut || gameState.flags.cleared6F)) return false;
        return true;
    };
    const isCatAwakened = !!(gameState.flags && gameState.flags.cleared6F);

    // ★ クリック／SPACEキーで次の戦闘ステップへ進むための待機制御
    let activeAdvanceHandler = null;
    const clearAdvanceWait = () => {
        if (activeAdvanceHandler) {
            window.removeEventListener("keydown", activeAdvanceHandler, true);
            ui.onclick = null;
            activeAdvanceHandler = null;
        }
    };

    const closeCombatAndReturn = (resultStatus, onAfterClose) => {
        clearAdvanceWait();
        ui.remove();
        window.lastDialogCloseTime = Date.now();
        sound.playBGM(getFieldBGM(gameState));
        if (onAfterClose) onAfterClose();
        else if (onResult) onResult(resultStatus);
    };

    // ★ 弱点バッジ文字列生成ヘルパー
    const getWeaknessBadgeText = () => {
        const isDiscovered = gameState.isDemonDiscovered ? gameState.isDemonDiscovered(enemy.name) : false;
        if (isDiscovered) {
            const wNames = enemyWeakness.map(num => CARD_NAMES[num] || num).join(", ");
            return `<span style="color:#00ff66; font-size:0.85em; margin-left:8px; border:1px solid #00aa44; padding:2px 8px; border-radius:4px; background:rgba(0,40,0,0.6);">弱点: ${wNames}</span>`;
        } else {
            return `<span style="color:#888; font-size:0.85em; margin-left:8px; border:1px solid #555; padding:2px 8px; border-radius:4px; background:rgba(20,20,20,0.6);">弱点: ？？？</span>`;
        }
    };

    const visualHTML = `
        <div style="position: relative; display: inline-block; margin-bottom: 8px;">
            <img id="combat-enemy-img" src="${enemy.image}" style="max-height: 190px; border-radius: 8px; object-fit: contain; transition: transform 0.1s ease;">
            <div id="damage-popup-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible;"></div>
        </div>
    `;

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 8px 0; text-shadow: 0 0 10px red;">【戦闘】${enemy.name}</h2>
        ${visualHTML}
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
            <span style="color: #ffdd66; font-size: 1.15em; font-weight: bold;">${enemy.name}</span>
            <span id="enemy-weakness-badge">${getWeaknessBadgeText()}</span>
        </div>

        <div style="color: #aaa; font-size: 0.85em; margin-bottom: 6px;">装填中: <span id="current-loaded-cards" style="color:#ffdd66; font-weight:bold;">${(gameState.equippedCards || []).map(n => CARD_NAMES[n] || n).join(' / ') || 'なし'}</span></div>
        
        <div style="display: flex; gap: 20px; font-size: 1.05em; margin: 4px 0 10px 0; background: rgba(0,0,0,0.6); padding: 5px 16px; border-radius: 6px; border: 1px solid #333;">
            <span id="player-hp-text" style="color: #00ff66; font-weight: bold;">主人公HP: ${gameState.player.hp} / ${gameState.player.maxHp}</span>
            <span id="enemy-hp-text" style="color: #ff4444; font-weight: bold;">敵HP: ${enemyHp}</span>
        </div>

        <div id="combat-log" style="width: 100%; max-width: 480px; height: 112px; background: rgba(0,0,0,0.88); border: 1px solid #550000; padding: 10px 12px; margin-bottom: 12px; color: #ddd; font-size: 0.9em; line-height: 1.55; white-space: pre-wrap; overflow-y: auto; box-sizing: border-box;">悪魔が目の前に立ち塞がった！ どうする？</div>

        <div style="display: flex; gap: 10px; width: 100%; max-width: 480px;">
            <button id="btn-attack" style="flex: 1.4; background: #440000; color: #fff; border: 1px solid #ff3333; padding: 11px 6px; font-family: inherit; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 0.98em;">Vox Sacra (射撃)</button>
            <button id="btn-item" style="flex: 0.9; background: #002244; color: #66ccff; border: 1px solid #3388ff; padding: 11px 6px; font-family: inherit; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 0.95em;">道具</button>
            <button id="btn-escape" style="flex: 0.8; background: #111; color: #aaa; border: 1px solid #555; padding: 11px 6px; font-family: inherit; cursor: pointer; border-radius: 4px; font-size: 0.95em;">逃げる</button>
        </div>
    `;
    document.body.appendChild(ui);

    const enemyImg = document.getElementById("combat-enemy-img");
    const damageLayer = document.getElementById("damage-popup-layer");
    applyChromaKey(enemyImg);

    const log = document.getElementById("combat-log");
    const playerHpText = document.getElementById("player-hp-text");
    const enemyHpText = document.getElementById("enemy-hp-text");
    const attackBtn = document.getElementById("btn-attack");
    const itemBtn = document.getElementById("btn-item");
    const escapeBtn = document.getElementById("btn-escape");
    const weaknessBadge = document.getElementById("enemy-weakness-badge");

    // ★ ボス戦時は逃げるボタンをあらかじめ暗転
    if (enemy.isBoss) {
        escapeBtn.style.color = "#555";
        escapeBtn.style.border = "1px solid #333";
        escapeBtn.title = "強大な悪魔の前から逃げることはできない！";
    }

    const appendLog = (htmlText) => {
        log.innerHTML += (log.innerHTML ? "\n" : "") + htmlText;
        log.scrollTop = log.scrollHeight;
    };

    // ★ 案A：クリック／タップ／SPACE／Enter を待つ関数（▼点滅インジケーター付き）
    const waitForPlayerClick = (onNext) => {
        clearAdvanceWait();
        log.style.cursor = "pointer";
        log.style.borderColor = "#aa4400";
        appendLog(`<div style="margin-top: 6px; text-align: right; color: #ffdd66; font-size: 0.85em; font-weight: bold; animation: combatPromptBlink 1s infinite;">▼ タップ または [ SPACE / Enter ] で次へ</div>`);

        let advanced = false;
        const advance = (e) => {
            if (e && e.type === "keydown") {
                if (e.key !== " " && e.key !== "Enter" && e.key !== "Spacebar") return;
                e.preventDefault();
                e.stopPropagation();
            }
            if (advanced) return;
            advanced = true;

            clearAdvanceWait();
            log.style.cursor = "default";
            log.style.borderColor = "#550000";
            window.lastDialogCloseTime = Date.now();
            if (onNext) onNext();
        };

        activeAdvanceHandler = advance;
        setTimeout(() => {
            if (advanced) return;
            window.addEventListener("keydown", advance, true);
            ui.onclick = (e) => {
                // 有効なボタン以外のどこをタップしても進行可能
                if (e.target && e.target.tagName === "BUTTON" && !e.target.disabled) return;
                advance(e);
            };
        }, 150);
    };

    const setControlsDisabled = (disabled) => {
        attackBtn.disabled = disabled;
        itemBtn.disabled = disabled;
        escapeBtn.disabled = disabled;
    };

    // ★ 使い魔（黒猫）同行時：初見の敵の弱点を看破する演出（6F未救出時は発動しない／覚醒後は専用演出）
    const isAlreadyDiscovered = gameState.isDemonDiscovered ? gameState.isDemonDiscovered(enemy.name) : false;

    if (isCatAccompanying() && !isAlreadyDiscovered) {
        setControlsDisabled(true);
        log.innerText = "悪魔が目の前に立ち塞がった！";
        setTimeout(() => {
            sound.playSE("assets/audio/se/cat.mp3");
            const wNames = enemyWeakness.map(num => CARD_NAMES[num] || num).join(", ");
            if (isCatAwakened) {
                log.innerHTML = `<span style="color:#FFD700; font-weight:bold;">【真の相棒・黒猫の看破】\n黒猫が金色の瞳を輝かせて敵の核を瞬時に見抜いた！\n「……ニャッ！（弱点は【${wNames}】だ！ 悪魔辞典に記録した！）」</span>`;
            } else {
                log.innerHTML = `<span style="color:#E0B0FF; font-weight:bold;">【使い魔の看破】\n黒猫が喉を鳴らして敵の核を凝視した！\n「……フシューッ！（弱点は【${wNames}】だ！ 悪魔辞典に記録した！）」</span>`;
            }
            if (gameState.recordDemon) gameState.recordDemon(enemy);
            if (weaknessBadge) weaknessBadge.innerHTML = getWeaknessBadgeText();

            waitForPlayerClick(() => {
                log.innerText = "悪魔が目の前に立ち塞がった！ どうする？";
                setControlsDisabled(false);
            });
        }, 1200);
    }

    const showEnemyDamagePopup = (damageValue, isWeakness = false, prefix = "-") => {
        if (!damageLayer) return;

        if (enemyImg) {
            enemyImg.style.animation = "none";
            void enemyImg.offsetWidth;
            enemyImg.style.animation = "enemyHurtShake 0.4s ease-out";
        }

        const popup = document.createElement("div");
        popup.style.cssText = `
            position: absolute; left: 50%; top: 45%; transform: translate(-50%, -50%);
            font-family: ${HORROR_FONT}; font-size: ${isWeakness ? "2.5em" : "2.1em"}; font-weight: 900;
            color: ${isWeakness ? "#ffdd44" : "#ff3333"};
            text-shadow: 0 0 10px ${isWeakness ? "#ff6600" : "#ff0000"}, 0 0 20px #000, 2px 2px 0 #000;
            white-space: nowrap; pointer-events: none; z-index: 3100;
            animation: damagePopupFloat 0.85s ease-out forwards;
        `;
        popup.innerText = `${isWeakness ? '弱点！ ' : ''}${prefix}${damageValue}`;
        damageLayer.appendChild(popup);

        setTimeout(() => popup.remove(), 850);
    };

    const triggerScreenFlash = (color = "rgba(255, 255, 140, 0.85)") => {
        const flash = document.createElement("div");
        flash.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: ${color}; z-index: 3900; pointer-events: none; animation: yellowUmbrellaFlash 0.6s ease-out forwards;`;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 600);
    };

    const updateHpDisplay = () => {
        playerHpText.innerText = `主人公HP: ${gameState.player.hp} / ${gameState.player.maxHp}`;
    };

    const triggerVictorySequence = () => {
        closeCombatAndReturn("win", () => {
            const baseExp = enemy.rewardExp || (enemy.isBoss ? 100 : 50);
            const baseMoney = enemy.rewardMoney || (enemy.isBoss ? 300 : 150);
            const reward = gameState.calculateRewards ? gameState.calculateRewards(baseExp, baseMoney) : { exp: baseExp, money: baseMoney };
            
            gameState.player.money += reward.money;
            const isLvUp = gameState.gainExp(reward.exp);
            
            if (isLvUp) sound.playSE("assets/audio/se/levelup.mp3");

            const capNotice = reward.isCapped ? "\n※レベル上限超過により獲得量減衰" : "";
            showMessageDialog(`【勝利！】\n${enemy.name} を撃退した！（💰${reward.money} 獲得 / ${reward.exp} EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}${capNotice}`, () => {
                if (onResult) onResult("win");
            });
        });
    };

    const triggerDeathSequence = () => {
        setControlsDisabled(true);
        playerHpText.innerText = `主人公HP: 0 / ${gameState.player.maxHp}`;
        playerHpText.style.color = "#ff0000";
        log.innerHTML = "<span style='color:red; font-weight:bold;'>【敗北】主人公は力尽きて倒れた……！</span>";

        sound.playSE("assets/audio/se/zero.mp3");

        waitForPlayerClick(() => {
            closeCombatAndReturn("defeat", () => {
                const respawnMsg = gameState.handlePlayerDeath();
                if (context && context.changeFloor) {
                    context.changeFloor(1);
                }
                showMessageDialog(respawnMsg, () => {
                    if (onResult) onResult("defeat");
                });
            });
        });
    };

    const getRandomActionMsg = () => {
        if (enemy.actions && enemy.actions.length > 0) {
            return enemy.actions[Math.floor(Math.random() * enemy.actions.length)];
        }
        return "の容赦ない攻撃が襲いかかる！";
    };

    // ★ 敵のターン（結果を表示してクリック待ち）
    const executeEnemyTurn = () => {
        if (enemyStunTurns > 0) {
            enemyStunTurns--;
            log.innerHTML = `<span style="color:#ffdd66; font-weight:bold;">【行動不能】${enemy.name} は目を押さえて悶絶しており、攻撃できない！（チャンス！）</span>`;
            waitForPlayerClick(() => {
                log.innerText = "どうする？";
                setControlsDisabled(false);
            });
            return;
        }

        const currentFloor = gameState.currentFloor || 1;
        let actionType = "normal";
        let damageMultiplier = 1.0;
        let actionText = "";

        if (isEnemyCharging) {
            actionType = "charge_fire";
            damageMultiplier = 2.5;
            isEnemyCharging = false;
            actionText = `【解放撃】${enemy.name} の収束された破滅の一撃が炸裂する！`;
        } else {
            const roll = Math.random();
            const isKageyamaBoss = enemy.id === 'KAGEYAMA_2F' || enemy.name === 'ストーカー影山';
            const canUseCharge = (currentFloor >= 3) || isKageyamaBoss;

            if (canUseCharge) {
                let chargeRate = 0.20;
                let singleRate = 0.20;

                if (currentFloor >= 6) {
                    chargeRate = 0.30;
                    singleRate = 0.25;
                } else if (isKageyamaBoss) {
                    chargeRate = 0.25;
                    singleRate = 0.25;
                }

                if (roll < chargeRate) {
                    actionType = "charge_start";
                    isEnemyCharging = true;
                } else if (roll < chargeRate + singleRate) {
                    actionType = "single";
                    damageMultiplier = 1.25;
                    actionText = `【痛恨】${enemy.name} ${getRandomActionMsg()}`;
                } else {
                    actionType = "normal";
                    damageMultiplier = 1.0;
                    actionText = `${enemy.name} ${getRandomActionMsg()}`;
                }
            } else {
                if (roll < 0.75) {
                    actionType = "normal";
                    damageMultiplier = 1.0;
                    actionText = `${enemy.name} ${getRandomActionMsg()}`;
                } else {
                    actionType = "single";
                    damageMultiplier = 1.25;
                    actionText = `【痛恨】${enemy.name} ${getRandomActionMsg()}`;
                }
            }
        }

        if (actionType === "charge_start") {
            log.innerHTML = `<span style="color:#ff4444; font-weight:bold;">【予兆】${enemy.name} が禍々しい魔力を収束させている……！\n（※次のターン、威力が2.5倍に激増する！ 青い傘で防げ！）</span>`;
            waitForPlayerClick(() => {
                log.innerText = "どうする？";
                setControlsDisabled(false);
            });
            return;
        }

        const rawDodge = ((gameState.player.agi || 5) + extraAgi) * 0.04;
        const dodgeChance = Math.min(0.30, rawDodge);

        if (Math.random() < dodgeChance) {
            log.innerHTML = `素早い身のこなし！ 主人公は悪魔の攻撃を完全に回避した！`;
            waitForPlayerClick(() => {
                log.innerText = "どうする？";
                setControlsDisabled(false);
            });
            return;
        }

        let rawAtk = enemyAtk * damageMultiplier;
        let baseDamage = Math.max(1, rawAtk - (gameState.player.def || 0));

        let umbrellaApplied = false;
        if (isGuarding) {
            baseDamage = Math.max(1, Math.floor(baseDamage * 0.3));
            isGuarding = false;
            umbrellaApplied = true;
        }

        // ★ 覚醒後は援護発動率が 20% -> 35% にアップ
        const catSupportRate = isCatAwakened ? 0.35 : 0.20;
        let catAction = null;
        if (isCatAccompanying() && Math.random() < catSupportRate) {
            catAction = Math.random() < 0.5 ? "shield" : "claw";
        }

        let enemyTurnLines = [];

        if (catAction === "shield") {
            sound.playSE("assets/audio/se/cat.mp3");
            baseDamage = Math.max(1, Math.floor(baseDamage * 0.5));
            if (isCatAwakened) {
                enemyTurnLines.push(`<span style="color: #FFD700; font-weight: bold;">【真の相棒・黒猫の守護】黒猫が鋭く咆哮して前に躍り出て、主人公を庇った！（ダメージ半減！）</span>`);
            } else {
                enemyTurnLines.push(`<span style="color: #E0B0FF; font-weight: bold;">【使い魔の身代わり】黒猫が前に割り込み、主人公を庇った！（ダメージ半減！）</span>`);
            }
        }

        const randFactor = 0.85 + Math.random() * 0.3;
        const finalDamage = Math.max(1, Math.floor(baseDamage * randFactor));

        gameState.player.hp = Math.max(0, gameState.player.hp - finalDamage);

        let dmgNotice = `${actionText}\n主人公は ${finalDamage} ダメージを受けた！`;
        if (umbrellaApplied) dmgNotice += "（ビニール傘で70%カット！）";
        enemyTurnLines.push(dmgNotice);

        if (catAction === "claw") {
            sound.playSE("assets/audio/se/cat.mp3");
            // ★ 覚醒後は爪攻撃の倍率が Lv×3.5 -> Lv×5.5 に強化
            const catMult = isCatAwakened ? 5.5 : 3.5;
            const catDmg = Math.max(8, Math.floor((gameState.player.level || 1) * catMult));
            enemyHp = Math.max(0, enemyHp - catDmg);
            enemyHpText.innerText = `敵HP: ${enemyHp}`;
            showEnemyDamagePopup(catDmg, false, "🐾 -");
            if (isCatAwakened) {
                enemyTurnLines.push(`<span style="color: #FFD700; font-weight: bold;">【真の相棒・黒猫の烈爪】黒猫が閃光のように跳躍し、悪魔の急所を深く切り裂いた！ 敵に ${catDmg} ダメージ！</span>`);
            } else {
                enemyTurnLines.push(`<span style="color: #E0B0FF; font-weight: bold;">【使い魔の爪攻撃】黒猫が影から飛び出し、敵の顔面を切り裂いた！ 敵に ${catDmg} ダメージ！</span>`);
            }
        }

        updateHpDisplay();
        log.innerHTML = enemyTurnLines.join("\n");

        waitForPlayerClick(() => {
            if (gameState.player.hp <= 0) {
                triggerDeathSequence();
            } else if (enemyHp <= 0) {
                enemyHpText.innerText = `敵HP: 0`;
                log.innerHTML = `【討滅】黒猫の追撃が決定打となり、悪魔は霧散した！`;
                waitForPlayerClick(() => {
                    triggerVictorySequence();
                });
            } else {
                log.innerText = "どうする？";
                setControlsDisabled(false);
            }
        });
    };

    // ★ 射撃ボタン（1.2秒の溜め → ダメージ表示＆クリック待ち → 敵ターン）
    attackBtn.onclick = () => {
        if (Date.now() - window.lastDialogCloseTime < 300) return;

        const hasGun = gameState.player.hasModelGun || gameState.hasModelGun;
        const equippedCards = gameState.equippedCards || [];

        if (!hasGun) {
            log.innerText = "【攻撃不能！】\n武器を持っていない！ 素手では悪魔にダメージを与えられない！";
            return;
        } 
        if (equippedCards.length === 0) {
            log.innerText = "【装填エラー！】\nモデルガンにラミナ（カード）が装填されていない！ 弾が出ない！";
            return;
        }

        sound.playSE("assets/audio/se/gun.mp3");
        setControlsDisabled(true);

        log.innerText = "Vox Sacra……ラミナカードが神聖な言葉を弾丸に変える";

        setTimeout(() => {
            const levelAtk = 8 + ((gameState.player.level || 1) - 1) * 2;
            const cardSum = equippedCards.reduce((sum, num) => sum + num, 0);
            const cardAtk = cardSum * 2;
            let baseDamage = levelAtk + cardAtk;

            const isWeaknessHit = equippedCards.some(num => enemyWeakness.includes(num));
            if (isWeaknessHit) {
                baseDamage *= 2;
            }

            let isRedApplied = false;
            if (isRedUmbrellaActive) {
                baseDamage *= 3;
                isRedUmbrellaActive = false;
                isRedApplied = true;
            }

            const randomFactor = 0.85 + Math.random() * 0.3;
            const netDamage = Math.max(1, Math.floor((baseDamage - enemyDef) * randomFactor));

            enemyHp = Math.max(0, enemyHp - netDamage);
            showEnemyDamagePopup(netDamage, isWeaknessHit);

            let shotMsg = `Vox Sacraの射撃！${isWeaknessHit ? '【弱点特効2倍！】' : ''} 悪魔に ${netDamage} ダメージ！`;
            if (isRedApplied) {
                shotMsg = `【渾身の一撃】赤い傘の反動で威力が3倍に爆発！\n${shotMsg}`;
            }

            if (enemyHp <= 0) {
                enemyHpText.innerText = `敵HP: 0`;
                log.innerText = `${shotMsg}\n\n【討滅】${enemy.name} の体力を削りきった！`;
                
                waitForPlayerClick(() => {
                    triggerVictorySequence();
                });
                return;
            }

            enemyHpText.innerText = `敵HP: ${enemyHp}`;
            log.innerText = shotMsg;
            waitForPlayerClick(() => {
                executeEnemyTurn();
            });
        }, 1200);
    };

    // ★ 道具ボタン（クリック待ち対応）
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
                const idx = parseInt(btn.getAttribute("data-idx"), 10);
                const usedItem = itemsList[idx];

                itemsList.splice(idx, 1);
                itemModal.remove();
                setControlsDisabled(true);

                const itemId = (usedItem.id || "").toLowerCase();
                const itemName = usedItem.name || "";

                if (usedItem.healAmount || itemId === "energy_drink" || itemId === "bento" || itemId === "first_aid" || itemId === "mystery_supplement") {
                    const heal = usedItem.healAmount ? usedItem.healAmount : (itemId === "first_aid" ? 50 : 15);
                    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + heal);
                    updateHpDisplay();
                    log.innerText = `【道具使用】${usedItem.name} を使った！\n主人公のHPが ${heal} 回復した！（現在HP: ${gameState.player.hp}）`;
                    waitForPlayerClick(() => {
                        executeEnemyTurn();
                    });
                } 
                else if (itemId === "blue_umbrella" || itemId === "umbrella_blue" || usedItem.guardEffect || itemName.includes("青") || itemName.includes("ブルー")) {
                    isGuarding = true;
                    log.innerText = `【道具使用】${usedItem.name} を素早く開いた！\n次の敵の攻撃ダメージを 70% 軽減する！`;
                    waitForPlayerClick(() => {
                        executeEnemyTurn();
                    });
                } 
                else if (itemId === "red_umbrella" || itemId === "umbrella_red" || itemName.includes("赤") || itemName.includes("レッド")) {
                    isRedUmbrellaActive = true;
                    log.innerText = `【道具使用】${usedItem.name} を開いて構えた！\n力を限界まで蓄積した！ 次の銃撃威力が【3倍】に激増する！`;
                    waitForPlayerClick(() => {
                        executeEnemyTurn();
                    });
                } 
                else if (itemId === "yellow_umbrella" || itemId === "umbrella_yellow" || itemName.includes("黄") || itemName.includes("イエロー")) {
                    triggerScreenFlash("rgba(255, 255, 140, 0.85)");
                    if (enemyImg) {
                        enemyImg.style.opacity = "0.5";
                        setTimeout(() => { if (enemyImg) enemyImg.style.opacity = "1"; }, 800);
                    }
                    enemyStunTurns = 1;

                    log.innerHTML = `【道具使用】${usedItem.name} を勢いよく開いた！\n強烈な閃光が炸裂し、敵の目を完全に眩ませた！\n<span style="color:#ffdd66; font-weight:bold;">敵は目を押さえて悶絶している！ 隙だらけだ！（2回連続で攻撃可能！）</span>`;
                    waitForPlayerClick(() => {
                        log.innerText = "どうする？";
                        setControlsDisabled(false);
                    });
                } 
                else if (itemId === "clear_umbrella" || itemId === "umbrella_clear" || itemName.includes("透明") || itemName.includes("クリア")) {
                    extraAgi += 5;
                    log.innerText = `【道具使用】${usedItem.name} を纏った！\n身のこなしが軽くなり、回避率と逃走率が上昇した！`;
                    waitForPlayerClick(() => {
                        executeEnemyTurn();
                    });
                } 
                else {
                    log.innerText = `【道具使用】${usedItem.name} を使ったが、何も起きなかった……。`;
                    waitForPlayerClick(() => {
                        executeEnemyTurn();
                    });
                }
            };
        });
    };

    // ★ 逃げるボタン（1.2秒演出 → 失敗時はクリック待ち対応）
    escapeBtn.onclick = () => {
        if (Date.now() - window.lastDialogCloseTime < 300) return;

        // ★ ボス戦は逃走不可
        if (enemy.isBoss) {
            sound.playSE("assets/audio/se/zero.mp3");
            log.innerHTML = "<span style='color:#ff4444; font-weight:bold;'>【逃走不可！】\n強大な威圧感に気圧され、ボスの前から逃げ出すことはできない！</span>";
            return;
        }

        setControlsDisabled(true);
        log.innerText = "必死に背を向けて走り出した……！";

        setTimeout(() => {
            const escapeRate = 0.55 + (((gameState.player.agi || 5) + extraAgi) * 0.04);
            if (Math.random() < escapeRate) {
                closeCombatAndReturn("escape", () => {
                    showMessageDialog("【逃走成功】\n暗闇の中、なんとか悪魔を振り切った！", () => {
                        if (onResult) onResult("escape");
                    });
                });
            } else {
                const damageTaken = Math.max(1, Math.floor((enemyAtk - (gameState.player.def || 0)) * 1.2));
                gameState.player.hp = Math.max(0, gameState.player.hp - damageTaken);
                if (gameState.player.hp > 0) updateHpDisplay();

                log.innerText = `【逃走失敗！】\nしかし、悪魔に回り込まれた！\n背後から追撃！ 主人公は ${damageTaken} ダメージを受けた！`;
                waitForPlayerClick(() => {
                    if (gameState.player.hp <= 0) {
                        triggerDeathSequence();
                    } else {
                        log.innerText = "どうする？";
                        setControlsDisabled(false);
                    }
                });
            }
        }, 1200);
    };
}

// ==========================================
// 査問UI制御（擬態名と本来の悪魔名の完全分離＆見破り銃撃SE対応版）
// ==========================================
export function openInquisitionUI(entity, gameState, onResult, context) {
    // ★ 査問中は必ず住民として偽装表示し、正体がバレた後のみ本来の悪魔名(trueName)を使う
    const displayName = (entity.type === "demon" && !entity.trueName) ? "怯えるマンション住民" : entity.name;
    const actualDemonName = entity.trueName || (entity.name !== "怯えるマンション住民" ? entity.name : "擬態していた悪魔");

    const showTutorialIfNeeded = (callback) => {
        if (!gameState.flags) gameState.flags = {};
        if (!gameState.flags.seenInqTutorial) {
            gameState.flags.seenInqTutorial = true;
            showMessageDialog(
                "【査問（さもん）のルール】\n\n部屋の中に人間が隠れていることがあるが、悪魔が人間に擬態していることもある。\n\n『ラミナカード』を提示して相手の反応を伺い、悪魔か人間かを見極めて「撃つ」か「保護する」かを決定してください。\n\n※人間を誤って撃った場合、深い『罪(Sin)』を背負います。罪はエンディングに影響しますが、1Fコンビニでお金を支払うことで浄化可能です。", 
                callback
            );
        } else {
            callback();
        }
    };

    const initUI = () => {
        const ui = document.createElement("div");
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.95); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;
        
        let visualHTML = `<img id="inq-entity-img" src="${entity.faceImage || entity.image}" style="max-height: 180px; border-radius: 8px;" onerror="this.style.display='none'">`;

        ui.innerHTML = `
            <h2 style="color: #ff3333; margin: 0 0 10px 0; text-shadow: 0 0 8px red;">【査問】住人との対面</h2>
            ${visualHTML}
            <div style="color: #ddd; font-size: 1.1em; margin-top: 5px; font-weight: bold;">${displayName}</div>
            
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

        function getReactionMessage(cardNum, ent) {
            if (ent.type === "human") {
                const humanMsg = [
                    "「え…？ なんですかその紙切れは？ 宗教の勧誘ですか？」",
                    "「気味が悪いカードですね……近付けないでください！」",
                    "「何がしたいんですか？ 警察を呼びますよ！」",
                    "「やめてください！ 意味がわかりません！」"
                ];
                return humanMsg[Math.floor(Math.random() * humanMsg.length)];
            } else {
                const targetWeakness = ent.weakness || 3;
                const diff = Math.abs(parseInt(cardNum, 10) - targetWeakness);

                if (diff === 0) {
                    return "「ぐぐっ……！？ ぐあああっ！！」\n相手の瞳が一瞬赤くうごめき、肌から不気味な煙が立ち上った！";
                } else if (diff <= 2) {
                    return "「……くっ……！？」\n平然を装おうとしているが、不自然に口元を引きつらせて身体を硬直させた……。";
                } else {
                    const isDisguising = Math.random() < 0.6;
                    if (isDisguising) {
                        const bluffMsg = [
                            "「え…？ なんですかその紙切れは？ 宗教の勧誘ですか？」",
                            "「気味が悪いカードですね……近付けないでください！」",
                            "「何がしたいんですか？ 警察を呼びますよ！」"
                        ];
                        return bluffMsg[Math.floor(Math.random() * bluffMsg.length)] + "\n（怯えているようにも見えるが……どこか視線が蠢いている気もする）";
                    } else {
                        return "「……ハッ、何ですかそれ？ 馬鹿馬鹿しい。」\n不気味なほど余裕の笑みを浮かべて、せせら笑っている。";
                    }
                }
            }
        }

        showBtn.onclick = () => {
            if (step === 1) {
                if (!selected[0]) { alert("1枚目のカードを選択してください。"); return; }
                log.innerText = `【1枚目: カード${selected[0]}を提示】\n【${displayName}】\n` + getReactionMessage(selected[0], entity);
                step = 2;
                showBtn.innerText = "2枚目を提示する";
            } else if (step === 2) {
                if (!selected[1]) { alert("2枚目のカードを選択してください。"); return; }
                log.innerText = `【2枚目: カード${selected[1]}を提示】\n【${displayName}】\n` + getReactionMessage(selected[1], entity);
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
                // ★ 見破り成功時の銃撃SEを再生
                sound.playSE("assets/audio/se/gun.mp3");

                const isWeaknessHit = selected.some(num => parseInt(num, 10) === entity.weakness);

                if (isWeaknessHit) {
                    const baseExp = entity.rewardExp || 100;
                    const baseMoney = entity.rewardMoney || 250;
                    const reward = gameState.calculateRewards ? gameState.calculateRewards(baseExp, baseMoney) : { exp: baseExp, money: baseMoney };
                    gameState.player.money += reward.money;
                    const isLvUp = gameState.gainExp(reward.exp);
                    
                    if (isLvUp) {
                        setTimeout(() => sound.playSE("assets/audio/se/levelup.mp3"), 350);
                    }
                    
                    const capNotice = reward.isCapped ? "\n※レベル上限超過により獲得量減衰" : "";
                    showMessageDialog(`【完全見破り成功！】\n人間に擬態していた『${actualDemonName}』の真の弱点（カード${entity.weakness}）を見抜き、聖なる弾丸で核を撃ち抜いた！\n戦闘を経ることなく一撃で討滅した！（💰${reward.money} 獲得 / ${reward.exp} EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}${capNotice}`, () => {
                        onResult("combat_win");
                    });
                } else {
                    showMessageDialog(`【見破り成功！ しかし弱点不一致】\n悪魔の正体を暴いた！ 正体は『${actualDemonName}』だった！\n弱点属性を打ち抜けなかったが、先制ダメージを与え敵HP50%状態で戦闘に入る！`, () => {
                        const demonEnemy = {
                            name: actualDemonName,
                            image: entity.realImage,
                            hp: 15,
                            atk: 10,
                            def: 1,
                            weakness: [entity.weakness],
                            rewardExp: entity.rewardExp || 50,
                            rewardMoney: entity.rewardMoney || 150
                        };
                        openCombatUI(demonEnemy, gameState, (res) => onResult(res === "win" ? "combat_win" : res), context);
                    });
                }
            }
        };

        protectBtn.onclick = () => {
            ui.remove();
            if (entity.type === "human") {
                const reward = gameState.calculateRewards ? gameState.calculateRewards(0, 300) : { exp: 0, money: 300 };
                gameState.player.money += reward.money;
                const hintText = entity.dialogue || entity.message || "「助けてくれてありがとうございます……！ これはお礼です！」";
                const capNotice = reward.isCapped ? "\n※レベル上限超過により獲得量減衰" : "";
                showMessageDialog(`【人間を保護した】\n${hintText}\n（💰${reward.money} を獲得！）${capNotice}`, () => {
                    onResult("finish");
                });
            } else {
                showMessageDialog(`【痛恨の判断ミス！】\n悪魔を「保護」しようとして不用意に近づいてしまった！\n正体を現した『${actualDemonName}』から確定の先制攻撃を受ける！`, () => {
                    onResult("demon_ambush");
                });
            }
        };
    };

    showTutorialIfNeeded(initUI);
}

// ==========================================
// ボス魔方陣パズルUI制御（大型視認性・セットカード画像表示・選択枠ハイライト・自動カーソル送り対応版）
// ==========================================
export function openBossPuzzleUI(puzzleConfig, gameState, onSubmit) {
    const oldUI = document.getElementById("boss-puzzle-modal");
    if (oldUI) oldUI.remove();

    const ui = document.createElement("div");
    ui.id = "boss-puzzle-modal";
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.96); z-index: 3500; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px; font-family: ${HORROR_FONT}; box-sizing: border-box; overflow-y: auto;`;

    let slots = {};
    (puzzleConfig.slots || []).forEach(s => slots[s.id] = null);
    let activeSlotKey = puzzleConfig.slots && puzzleConfig.slots.length > 0 ? puzzleConfig.slots[0].id : null;

    const cardNames = ["", "Ⅰ 聖水", "Ⅱ 鏡", "Ⅲ 浄化塩", "Ⅳ 十字架", "Ⅴ 聖書", "Ⅵ 聖炎", "Ⅶ 鐘", "Ⅷ 聖香", "Ⅸ 銀杭"];

    ui.innerHTML = `
        <div style="width: 100%; max-width: 920px; display: flex; flex-direction: column; align-items: center; margin: auto;">
            <h2 style="color: #ff3333; margin: 0 0 4px 0; text-shadow: 0 0 12px red; font-size: 1.55em; text-align: center;">${puzzleConfig.title}</h2>
            <div style="color: #ccc; font-size: 0.92em; margin-bottom: 14px; text-align: center;">${puzzleConfig.subTitle}</div>

            <div style="width: 100%; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 22px; margin-bottom: 16px;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div id="boss-puzzle-grid" style="display: grid; grid-template-columns: repeat(3, 98px); grid-template-rows: repeat(3, 114px); gap: 8px; background: rgba(25,0,0,0.9); padding: 12px; border: 2px solid #770000; border-radius: 12px; box-shadow: 0 0 25px rgba(255,0,0,0.25);">
                        <div style="grid-area: 2 / 2; background: radial-gradient(circle, #330000, #120000); border: 2px solid #880000; border-radius: 8px; display:flex; justify-content:center; align-items:center; color:#ff4444; font-weight:bold; font-size:1.25em; text-shadow: 0 0 8px red; text-align:center; padding:4px;">${puzzleConfig.bossName}</div>
                    </div>
                    <div style="color: #bbb; font-size: 0.95em; margin-top: 8px;">選択中の対象: <span id="current-target-label" style="color:#ffdd66; font-weight:bold; font-size:1.05em;">${puzzleConfig.slots[0]?.label.replace(/<br>/g, ' ') || ''}</span></div>
                </div>

                <div style="width: 100%; max-width: 440px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 12px; background: rgba(12,4,4,0.92); border: 2px solid #660000; border-radius: 12px; box-shadow: 0 0 20px rgba(0,0,0,0.8);" id="boss-cards"></div>
            </div>

            <button id="btn-fire-vox" style="width: 100%; max-width: 440px; background: linear-gradient(180deg, #770000, #2a0000); color: #ffdd66; border: 2px solid #ff4444; padding: 14px; font-family: inherit; cursor: pointer; border-radius: 8px; font-weight: bold; font-size: 1.25em; letter-spacing: 0.08em; box-shadow: 0 0 18px rgba(255,0,0,0.6);">Vox Sacra 発射！</button>
        </div>
    `;
    document.body.appendChild(ui);

    const gridDiv = document.getElementById("boss-puzzle-grid");

    const renderSlots = () => {
        gridDiv.querySelectorAll(".boss-slot").forEach(el => el.remove());

        puzzleConfig.slots.forEach(s => {
            const isSelected = (activeSlotKey === s.id);
            const assignedNum = slots[s.id];
            const slotEl = document.createElement("div");
            slotEl.id = s.id;
            slotEl.className = "boss-slot";

            const borderStyle = isSelected
                ? "border: 2px solid #ffdd66; box-shadow: 0 0 14px rgba(255, 221, 102, 0.75); background: #381800;"
                : (assignedNum ? "border: 2px solid #00cc55; background: #0a2210;" : "border: 2px dashed #ff4444; background: #240404;");

            slotEl.style.cssText = `${s.gridPos} ${borderStyle} border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; color: #ffdd66; padding: 4px; box-sizing: border-box; transition: all 0.15s ease; text-align: center;`;

            if (assignedNum) {
                slotEl.innerHTML = `
                    <div style="font-size: 0.72em; color: #aaa; line-height: 1.1; margin-bottom: 2px;">${s.label.replace(/<br>/g, '')}</div>
                    <img src="assets/images/cards/${assignedNum}card.png" style="max-height: 58px; max-width: 58px; object-fit: contain; margin-bottom: 2px;" onerror="this.src='assets/images/cards/${assignedNum}Card.png'; this.onerror=function(){ this.style.display='none'; };">
                    <div style="font-size: 0.85em; font-weight: bold; color: #00ff66; white-space: nowrap;">${cardNames[assignedNum]}</div>
                `;
            } else {
                slotEl.innerHTML = `
                    <div style="font-size: 0.95em; font-weight: bold; line-height: 1.3; color: ${isSelected ? '#ffdd66' : '#ffaaaa'};">${s.label}</div>
                    <div style="font-size: 0.72em; color: ${isSelected ? '#ffdd66' : '#888'}; margin-top: 4px;">${isSelected ? '▼ 選択中' : 'タップ'}</div>
                `;
            }

            slotEl.onclick = () => {
                activeSlotKey = s.id;
                document.getElementById("current-target-label").innerText = s.label.replace(/<br>/g, ' ');
                renderSlots();
            };

            gridDiv.appendChild(slotEl);
        });
    };

    const renderCardGrid = () => {
        const cardsDiv = document.getElementById("boss-cards");
        cardsDiv.innerHTML = "";

        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => {
            const isUsed = Object.values(slots).includes(num);
            const cDiv = document.createElement("div");
            cDiv.style.cssText = `height: 122px; border: 2px solid ${isUsed ? '#333' : '#881111'}; background: ${isUsed ? '#080808' : '#160808'}; opacity: ${isUsed ? '0.45' : '1'}; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: ${isUsed ? 'not-allowed' : 'pointer'}; color: #ffdd66; font-weight: bold; border-radius: 8px; padding: 6px; box-sizing: border-box; transition: transform 0.1s ease, border-color 0.15s ease;`;
            
            cDiv.innerHTML = `
                <img src="assets/images/cards/${num}card.png" style="max-height: 78px; max-width: 78px; object-fit: contain; margin-bottom: 4px;" onerror="this.src='assets/images/cards/${num}Card.png'; this.onerror=function(){ this.style.display='none'; };">
                <div style="font-size: 0.95em; color: ${isUsed ? '#666' : '#ffdd66'}; white-space: nowrap; font-weight: bold;">${isUsed ? '使用中' : cardNames[num]}</div>
            `;
            
            cDiv.onclick = () => {
                Object.keys(slots).forEach(k => {
                    if (slots[k] === num) {
                        slots[k] = null;
                    }
                });

                slots[activeSlotKey] = num;

                const nextEmpty = puzzleConfig.slots.find(s => slots[s.id] === null);
                if (nextEmpty) {
                    activeSlotKey = nextEmpty.id;
                    document.getElementById("current-target-label").innerText = nextEmpty.label.replace(/<br>/g, ' ');
                }

                renderSlots();
                renderCardGrid();
            };
            cardsDiv.appendChild(cDiv);
        });
    };

    renderSlots();
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

// ==========================================
// エンディング用スタッフロール演出（キャラクター＆名場面スライド付き・3エンディング対応版）
// ==========================================
export function playEndingCredits(endingType, durationSeconds, onComplete) {
    // 既存のモーダル等があれば消去
    const oldOverlay = document.getElementById("ending-credits-overlay");
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement("div");
    overlay.id = "ending-credits-overlay";
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; z-index: 5000; color: #fff; font-family: ${HORROR_FONT}; display: flex; flex-direction: column; align-items: center; overflow: hidden;`;

    // アニメーション用のCSSを動的生成（translateY(-100%)で画像5枚分の高さがあっても最後まで綺麗に流れ切る）
    const style = document.createElement("style");
    style.textContent = `
        @keyframes creditRoll {
            0% { transform: translateY(100vh); }
            100% { transform: translateY(-100%); }
        }
        @keyframes fadeInBtn {
            0% { opacity: 0; pointer-events: none; transform: translateY(20px); }
            100% { opacity: 1; pointer-events: auto; transform: translateY(0); }
        }
    `;
    overlay.appendChild(style);

    let titleText = "NORMAL END - 贖罪の執行人";
    let titleColor = "#ffaa44";
    if (endingType === "TRUE") {
        titleText = "TRUE END - プロのエクソシスト";
        titleColor = "#ffdd66";
    } else if (endingType === "BAD") {
        titleText = "BAD END - 新・悪魔王誕生";
        titleColor = "#ff3333";
    }

    const imgCardStyle = "max-width: 82%; max-height: 240px; object-fit: contain; border-radius: 8px; border: 1px solid #551111; box-shadow: 0 0 25px rgba(180, 0, 0, 0.45); background: rgba(15, 5, 5, 0.7); padding: 6px;";

    const creditsContainer = document.createElement("div");
    creditsContainer.style.cssText = `width: 100%; max-width: 620px; padding: 0 20px 120px 20px; box-sizing: border-box; text-align: center; animation: creditRoll ${durationSeconds}s linear forwards;`;
    creditsContainer.innerHTML = `
        <h1 style="color: ${titleColor}; font-size: 2.2em; margin-bottom: 100px; text-shadow: 0 0 20px ${titleColor}; letter-spacing: 0.08em;">${titleText}</h1>

        <div style="margin-bottom: 45px;">
            <h3 style="color: #888; margin-bottom: 10px; font-weight: normal; font-size: 0.9em;">企画・プログラム</h3>
            <p style="font-size: 1.4em; margin: 0; font-weight: bold;">hiroyuki ishida</p>
        </div>

        <div style="margin-bottom: 85px;">
            <img src="assets/images/grandma.jpg" style="${imgCardStyle}" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 45px;">
            <h3 style="color: #888; margin-bottom: 10px; font-weight: normal; font-size: 0.9em;">シナリオ・演出</h3>
            <p style="font-size: 1.4em; margin: 0; font-weight: bold;">hiroyuki ishida</p>
        </div>

        <div style="margin-bottom: 85px;">
            <img src="assets/images/human5.jpg" style="${imgCardStyle}" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 45px;">
            <h3 style="color: #888; margin-bottom: 10px; font-weight: normal; font-size: 0.9em;">グラフィック</h3>
            <p style="font-size: 1.4em; margin: 0; font-weight: bold;">AI ＆ hiroyuki ishida</p>
        </div>

        <div style="margin-bottom: 85px;">
            <img src="assets/images/human1.png" style="${imgCardStyle}" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 45px;">
            <h3 style="color: #888; margin-bottom: 10px; font-weight: normal; font-size: 0.9em;">音楽・効果音</h3>
            <p style="font-size: 1.4em; margin: 0; font-weight: bold;">フリー素材各社様 & hiroyuki ishida</p>
        </div>

        <div style="margin-bottom: 85px;">
            <img src="assets/images/shinpu.jpg" style="${imgCardStyle}" onerror="this.style.display='none'">
        </div>

        <div style="margin-bottom: 45px;">
            <h3 style="color: #888; margin-bottom: 10px; font-weight: normal; font-size: 0.9em;">スペシャルサンクス</h3>
            <p style="font-size: 1.4em; margin: 0; font-weight: bold;">プレイしてくれたあなた</p>
        </div>

        <div style="margin-bottom: 140px;">
            <img src="assets/images/ketui.png" style="${imgCardStyle}" onerror="this.style.display='none'">
        </div>

        <h2 style="font-size: 2.1em; letter-spacing: 0.28em; margin: 0; color: #ffdd66; text-shadow: 0 0 15px rgba(255,0,0,0.6);">THANK YOU FOR PLAYING</h2>
    `;
    overlay.appendChild(creditsContainer);

    // クロマキー透過が必要な画像にも対応
    creditsContainer.querySelectorAll("img").forEach(img => applyChromaKey(img));

    // タイトルへ戻るボタン（初期は非表示）
    const endBtn = document.createElement("button");
    endBtn.innerText = "タイトル画面へ戻る";
    endBtn.style.cssText = `position: absolute; bottom: 10%; padding: 16px 38px; font-size: 1.15em; font-family: inherit; font-weight: bold; color: #fff; background: rgba(20,0,0,0.88); border: 1px solid #770000; border-radius: 8px; cursor: pointer; opacity: 0; pointer-events: none; box-shadow: 0 0 20px rgba(255,0,0,0.4);`;

    endBtn.onclick = () => {
        overlay.remove();
        if (onComplete) onComplete();
    };
    overlay.appendChild(endBtn);
    document.body.appendChild(overlay);

    // スタッフロールが流れ終わる頃（設定時間の約9割経過時）にボタンをフワッと表示
    setTimeout(() => {
        endBtn.style.animation = "fadeInBtn 2.5s ease-out forwards";
    }, (durationSeconds * 1000) * 0.9);
}