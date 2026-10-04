// ui.js
import { gameState } from './gameState.js';
import { itemDefinitions } from './items.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

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
            if (g > 60 && g > r * 1.15 && g > b * 1.15) {
                data[i + 3] = 0;
            }
        }
        cctx.putImageData(imgData, 0, 0);
        imgElement.src = canvas.toDataURL();
    } catch(e) {
        console.warn("クロマキー処理スキップ (CORS/DataURL制限):", e);
    }
}

// テキストダイアログ（スマホはみ出し防止版）
export function showMessageDialog(text, onClosed) {
    const msgDiv = document.createElement("div");
    msgDiv.style.cssText = `
        position: fixed; bottom: 8%; left: 5%; width: 90%; max-width: 560px; margin: 0 auto;
        padding: 20px; background-color: rgba(10, 0, 0, 0.92); color: #dddddd; 
        border: 2px solid #550000; border-radius: 6px; z-index: 2000; 
        font-family: ${HORROR_FONT}; font-size: 1.1em; line-height: 1.7; 
        white-space: pre-wrap; box-shadow: 0 0 20px rgba(0,0,0,0.8); box-sizing: border-box;
    `;
    msgDiv.innerText = text;
    msgDiv.innerHTML += `<div style="margin-top: 12px; text-align: right; color: #888888; font-size: 0.8em;">▼ タップ または [ SPACE ] で閉じる</div>`;
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

// 立ち絵会話ダイアログ（スマホ最適化版）
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

export function showItemAcquiredModal(imagePath, itemTitle, detailText, onClosed) {
    const modal = document.createElement("div");
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.88); z-index: 2500; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: ${HORROR_FONT}; padding: 20px; box-sizing: border-box;`;
    modal.innerHTML = `
        <div style="color: #ff3333; font-size: 1.6em; margin-bottom: 15px; text-shadow: 0 0 10px red; letter-spacing: 2px;">― アイテム獲得 ―</div>
        <img id="modal-item-img" src="${imagePath}" style="max-height: 200px; max-width: 80%; border-radius: 6px; margin-bottom: 15px;" onerror="this.style.display='none'">
        <div style="color: #ffdd66; font-size: 1.3em; font-weight: bold; margin-bottom: 8px;">${itemTitle}</div>
        <div style="color: #cccccc; font-size: 1em; margin-bottom: 25px; text-align: center; white-space: pre-wrap; line-height: 1.5;">${detailText}</div>
        <div style="color: #888; font-size: 0.85em;">タップ または [ SPACE ] で閉じる</div>
    `;
    document.body.appendChild(modal);

    const img = document.getElementById("modal-item-img");
    if (img) {
        if (img.complete) applyChromaKey(img);
        else img.onload = () => applyChromaKey(img);
    }

    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler);
            modal.onclick = null; modal.remove();
            if (onClosed) onClosed();
        }
    };
    setTimeout(() => { modal.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

export function playFloorTransition(targetFloor, onComplete) {
    const fadeDiv = document.createElement("div");
    fadeDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: black; z-index: 2000; transition: opacity 0.5s ease; opacity: 0; display: flex; justify-content: center; align-items: center; color: #ff3333; font-family: ${HORROR_FONT}; font-size: 1.6em;`;
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

export function playVideo(src, onEnded) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.85); z-index: 1800; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box;";
    document.body.appendChild(overlay);

    const video = document.createElement("video");
    video.src = src; video.style.cssText = "width: 100%; max-width: 500px; border: 3px solid #550000; box-shadow: 0 0 30px rgba(255, 0, 0, 0.4); background-color: black;";
    video.controls = false; video.autoplay = true; video.playsInline = true;
    overlay.appendChild(video);

    video.onended = () => { overlay.remove(); if (onEnded) onEnded(); };
    overlay.onclick = () => { video.pause(); video.onended(); };
}

export function openShopUI(onClosed) {
    const shopDiv = document.createElement("div");
    shopDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2800; overflow: hidden; font-family: ${HORROR_FONT}; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box;`; 

    shopDiv.innerHTML = `
        <video src="assets/videos/CVS.mp4" autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.35; filter: blur(2px);"></video>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle, rgba(20,0,0,0.7) 0%, rgba(0,0,0,0.95) 90%);"></div>

        <div style="position: relative; z-index: 10; width: 100%; max-width: 540px; height: 90%; background: rgba(10, 5, 5, 0.92); border: 2px solid #770000; box-shadow: 0 0 30px rgba(255, 0, 0, 0.4); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden;">
            
            <div style="padding: 12px 15px; border-bottom: 2px solid #550000; background: linear-gradient(180deg, #2a0000, #0a0000); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="color: #ff3333; margin: 0; font-size: 1.5em; text-shadow: 0 0 10px red;">悪魔の無人レジ</h2>
                    <div style="color: #888; font-size: 0.75em;">自動精算端末 4号機</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.05em; color: #ffdd66; font-weight: bold;">💰 <span id="shop-money">${gameState.money}</span> <span style="color:#ff4444; font-size:0.8em; margin-left:4px;">(SIN:${gameState.sin})</span></div>
                </div>
            </div>

            <div style="display: flex; border-bottom: 1px solid #440000; background: #050505;">
                <button id="tab-buy" style="flex: 1; background: #220000; color: #ffdd66; border: none; padding: 10px; font-family: inherit; font-size: 0.95em; cursor: pointer; border-bottom: 2px solid #ffdd66;">供物を買う</button>
                <button id="tab-sin" style="flex: 1; background: #111; color: #888; border: none; padding: 10px; font-family: inherit; font-size: 0.95em; cursor: pointer;">罪を清算する</button>
            </div>

            <div id="shop-content" style="flex: 1; overflow-y: auto; padding: 12px; box-sizing: border-box;"></div>

            <div style="padding: 10px; text-align: center; border-top: 1px solid #440000; background: #050505;">
                <button id="closeBtn" style="background: transparent; color: #aaa; border: 1px solid #555; padding: 8px 25px; font-size: 0.95em; cursor: pointer; font-family: inherit; border-radius: 4px;">立ち去る</button>
            </div>
        </div>
    `;
    document.body.appendChild(shopDiv);

    let activeTab = "buy";

    function renderShopContent() {
        const contentDiv = document.getElementById("shop-content");
        if (!contentDiv) return;

        if (activeTab === "buy") {
            let html = "";
            Object.values(itemDefinitions).forEach(item => {
                const count = gameState.inventory[item.id] || 0;
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(20, 10, 10, 0.85); padding: 10px 12px; margin-bottom: 8px; border: 1px solid #441111; border-radius: 6px;">
                        <div style="flex: 1; padding-right: 10px;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="font-size: 1.05em; color: #ffdd66; font-weight: bold;">${item.name}</span>
                                <span style="font-size: 0.75em; background: #330000; color: #ff8888; padding: 1px 4px; border-radius: 3px;">所持:${count}</span>
                            </div>
                            <div style="font-size: 0.8em; color: #bbb; margin-top: 3px; line-height: 1.3;">${item.desc}</div>
                        </div>
                        <div style="text-align: right; min-width: 75px;">
                            <div style="color: #ffdd66; font-size: 1em; font-weight: bold; margin-bottom: 4px;">💰 ${item.price}</div>
                            <button class="buy-item-btn" data-id="${item.id}" data-price="${item.price}" style="background: linear-gradient(180deg, #440000, #110000); color: #fff; border: 1px solid #ff3333; padding: 5px 10px; cursor: pointer; border-radius: 4px; font-family: inherit; font-size: 0.85em;">購入</button>
                        </div>
                    </div>
                `;
            });
            contentDiv.innerHTML = html;

            document.querySelectorAll(".buy-item-btn").forEach(btn => {
                btn.onclick = () => {
                    const itemId = btn.getAttribute("data-id");
                    const price = parseInt(btn.getAttribute("data-price"));

                    if (gameState.money >= price) {
                        gameState.money -= price;
                        if (!gameState.inventory[itemId]) gameState.inventory[itemId] = 0;
                        gameState.inventory[itemId]++;
                        document.getElementById("shop-money").innerText = gameState.money;
                        
                        btn.style.background = "#006600";
                        btn.innerText = "完了！";
                        setTimeout(() => renderShopContent(), 400);
                    } else {
                        btn.innerText = "資金不足";
                        setTimeout(() => renderShopContent(), 800);
                    }
                };
            });
        } else {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 15px 5px;">
                    <div style="font-size: 1.2em; color: #ff4444; margin-bottom: 10px;">― 罪の代償と浄化 ―</div>
                    <p style="color: #ccc; font-size: 0.85em; line-height: 1.6; margin-bottom: 20px;">
                        誤って人間を撃ち、積み重なった狂気（SIN）を清算します。<br>
                        <span style="color: #ffaa88;">※現在の罪（SIN）: <strong>${gameState.sin}</strong></span>
                    </p>
                    <div style="background: rgba(20,0,0,0.8); border: 1px solid #550000; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 1em; color: #ffdd66; margin-bottom: 6px;">罪の免除（SIN -5）</div>
                        <div style="color: #aaa; font-size: 0.8em; margin-bottom: 12px;">必要資金: 💰 200</div>
                        <button id="clean-sin-btn" style="background: #330000; color: #ff8888; border: 1px solid #ff4444; padding: 8px 20px; font-size: 0.9em; cursor: pointer; border-radius: 4px;">200 💰 を払って清算</button>
                    </div>
                </div>
            `;
            const cleanBtn = document.getElementById("clean-sin-btn");
            if (cleanBtn) {
                cleanBtn.onclick = () => {
                    if (gameState.sin <= 0) {
                        alert("現在、清算すべき罪はありません。");
                        return;
                    }
                    if (gameState.money >= 200) {
                        gameState.money -= 200;
                        gameState.sin = Math.max(0, gameState.sin - 5);
                        document.getElementById("shop-money").innerText = gameState.money;
                        alert("罪が和らいだ気がする……（SIN-5）");
                        renderShopContent();
                    } else {
                        alert("資金が足りません。");
                    }
                };
            }
        }
    }

    const tabBuy = document.getElementById("tab-buy");
    const tabSin = document.getElementById("tab-sin");

    tabBuy.onclick = () => {
        activeTab = "buy";
        tabBuy.style.background = "#220000"; tabBuy.style.color = "#ffdd66"; tabBuy.style.borderBottom = "2px solid #ffdd66";
        tabSin.style.background = "#111"; tabSin.style.color = "#888"; tabSin.style.borderBottom = "none";
        renderShopContent();
    };

    tabSin.onclick = () => {
        activeTab = "sin";
        tabSin.style.background = "#220000"; tabSin.style.color = "#ffdd66"; tabSin.style.borderBottom = "2px solid #ffdd66";
        tabBuy.style.background = "#111"; tabBuy.style.color = "#888"; tabBuy.style.borderBottom = "none";
        renderShopContent();
    };

    renderShopContent();

    const closeHandler = () => {
        window.removeEventListener("keydown", keyHandler);
        shopDiv.remove();
        if (onClosed) onClosed();
    };
    
    document.getElementById("closeBtn").onclick = closeHandler;
    const keyHandler = (e) => { if (e.key === "Escape") closeHandler(); };
    window.addEventListener("keydown", keyHandler);
}

export function openDebugMenu(onAction) {
    if (document.getElementById("debug-modal")) {
        document.getElementById("debug-modal").remove(); return;
    }
    const debugDiv = document.createElement("div"); debugDiv.id = "debug-modal"; debugDiv.className = "debug-modal";
    debugDiv.innerHTML = `
        <h3 style="margin:0; border-bottom:1px solid #00ff00; padding-bottom:5px;">[DEBUG MENU]</h3>
        <button class="debug-btn" id="dbg-all-clear">① 一括イベントクリア</button>
        <button class="debug-btn" id="dbg-warp-2f">② 2階（2F）ワープ</button>
        <button class="debug-btn" id="dbg-warp-1f">③ 1階（1F）ワープ</button>
        <button class="debug-btn" id="dbg-lv15">④ レベル15にする</button>
        <button class="debug-btn" id="dbg-money">⑤ お金+1000</button>
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
    document.getElementById("dbg-money").onclick = () => {
        gameState.money += 1000;
        alert("【デバッグ】所持金を+1000しました！"); debugDiv.remove();
    };
    document.getElementById("dbg-close").onclick = () => debugDiv.remove();
}