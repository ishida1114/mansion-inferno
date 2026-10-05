// ui.js
import { gameState } from './gameState.js';
import { itemDefinitions } from './items.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

export function applyChromaKey(imgElement) {
    if (!imgElement || imgElement.naturalWidth === 0) return;
    try {
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.naturalWidth; canvas.height = imgElement.naturalHeight;
        const cctx = canvas.getContext("2d"); cctx.drawImage(imgElement, 0, 0);
        const imgData = cctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (g > 60 && g > r * 1.15 && g > b * 1.15) data[i + 3] = 0;
        }
        cctx.putImageData(imgData, 0, 0); imgElement.src = canvas.toDataURL();
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
            window.removeEventListener("keydown", closeHandler); msgDiv.onclick = null; msgDiv.remove(); if (onClosed) onClosed();
        }
    };
    setTimeout(() => { msgDiv.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

export function showConversationDialog(imageSrc, text, onClosed) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; bottom: 3%; left: 5%; width: 90%; max-width: 560px; display: flex; flex-direction: column; align-items: center; z-index: 2000; box-sizing: border-box;";
    const imgDiv = document.createElement("img");
    imgDiv.src = imageSrc; imgDiv.style.cssText = "max-height: 220px; border-radius: 8px; margin-bottom: 10px; align-self: flex-start;";
    if (imgDiv.complete) applyChromaKey(imgDiv); else imgDiv.onload = () => applyChromaKey(imgDiv);
    imgDiv.onerror = () => imgDiv.style.display = 'none';

    const msgDiv = document.createElement("div");
    msgDiv.style.cssText = `width: 100%; padding: 18px; background: rgba(10, 0, 0, 0.92); color: #dddddd; border: 2px solid #550000; border-radius: 6px; font-family: ${HORROR_FONT}; font-size: 1.05em; line-height: 1.6; white-space: pre-wrap; box-shadow: 0 0 20px rgba(0,0,0,0.8); box-sizing: border-box;`;
    msgDiv.innerText = text;
    msgDiv.innerHTML += `<div style="margin-top: 10px; text-align: right; color: #888888; font-size: 0.8em;">▼ タップ または [ SPACE ] で閉じる</div>`;

    overlay.appendChild(imgDiv); overlay.appendChild(msgDiv); document.body.appendChild(overlay);
    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler); overlay.onclick = null; overlay.remove(); if (onClosed) onClosed();
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
    const closeHandler = (e) => {
        if (e.type === "click" || e.key === " " || e.key === "Enter") {
            window.removeEventListener("keydown", closeHandler); modal.onclick = null; modal.remove(); if (onClosed) onClosed();
        }
    };
    setTimeout(() => { modal.onclick = closeHandler; window.addEventListener("keydown", closeHandler); }, 150);
}

export function playFloorTransition(targetFloor, onComplete) {
    const fadeDiv = document.createElement("div");
    fadeDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: black; z-index: 2000; transition: opacity 0.5s ease; opacity: 0; display: flex; justify-content: center; align-items: center; color: #ff3333; font-family: ${HORROR_FONT}; font-size: 1.6em;`;
    document.body.appendChild(fadeDiv);
    setTimeout(() => { fadeDiv.style.opacity = "1"; fadeDiv.innerText = targetFloor === 2 ? "2階へ登っている..." : "1階へ下りている..."; }, 10);
    setTimeout(() => { if (onComplete) onComplete(); setTimeout(() => { fadeDiv.style.opacity = "0"; setTimeout(() => fadeDiv.remove(), 500); }, 800); }, 600);
}

export function playVideo(src, onEnded) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.85); z-index: 1800; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box;";
    const video = document.createElement("video");
    video.src = src; video.style.cssText = "width: 100%; max-width: 500px; border: 3px solid #550000; box-shadow: 0 0 30px rgba(255, 0, 0, 0.4); background-color: black;";
    video.controls = false; video.autoplay = true; video.playsInline = true;
    overlay.appendChild(video); document.body.appendChild(overlay);
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
                <div><h2 style="color: #ff3333; margin: 0; font-size: 1.5em;">悪魔の無人レジ</h2></div>
                <div style="font-size: 1.05em; color: #ffdd66; font-weight: bold;">💰 <span id="shop-money">${gameState.money}</span> <span style="color:#ff4444; font-size:0.8em;">(SIN:${gameState.sin})</span></div>
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
                <div style="flex: 1;"><div style="color: #ffdd66; font-weight: bold;">${item.name}</div><div style="font-size: 0.8em; color: #bbb;">${item.desc}</div></div>
                <div style="text-align: right;"><div style="color: #ffdd66; font-weight: bold; margin-bottom: 4px;">💰 ${item.price}</div><button class="buy-item-btn" data-id="${item.id}" data-price="${item.price}" style="background: linear-gradient(180deg, #440000, #110000); color: #fff; border: 1px solid #ff3333; padding: 5px 10px; cursor: pointer; border-radius: 4px;">購入</button></div>
            </div>`;
    });
    document.getElementById("shop-content").innerHTML = html;

    document.querySelectorAll(".buy-item-btn").forEach(btn => {
        btn.onclick = () => {
            const price = parseInt(btn.getAttribute("data-price"));
            if (gameState.money >= price) {
                gameState.money -= price; document.getElementById("shop-money").innerText = gameState.money;
                btn.style.background = "#006600"; btn.innerText = "完了！"; setTimeout(() => { btn.style.background = ""; btn.innerText = "購入"; }, 500);
            } else {
                btn.innerText = "資金不足"; setTimeout(() => { btn.innerText = "購入"; }, 800);
            }
        };
    });
    document.getElementById("closeBtn").onclick = () => { shopDiv.remove(); if (onClosed) onClosed(); };
}

// ★ 通常部屋用：査問（インクイジション）システム
export function openInquisitionUI(entity, gameState, onResult) {
    const ui = document.createElement("div");
    ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.95); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 15px; font-family: ${HORROR_FONT}; box-sizing: border-box;`;
    
    let visualHTML = entity.image && entity.image.endsWith(".mp4") 
        ? `<video src="${entity.image}" autoplay loop muted playsinline style="max-height: 180px; border-radius: 8px; box-shadow: 0 0 20px red;"></video>`
        : `<img src="${entity.image}" style="max-height: 180px; border-radius: 8px;" onerror="this.style.display='none'">`;

    ui.innerHTML = `
        <h2 style="color: #ff3333; margin: 0 0 10px 0; text-shadow: 0 0 8px red;">査問（正体の見極め）</h2>
        ${visualHTML}
        <div style="color: #ddd; font-size: 1.1em; margin-top: 5px;">${entity.name}</div>
        
        <div id="inq-log" style="width: 100%; max-width: 500px; height: 100px; background: rgba(0,0,0,0.8); border: 1px solid #550000; padding: 10px; margin: 15px 0; color: #ccc; font-size: 0.95em; line-height: 1.5; overflow-y: auto; white-space: pre-wrap;">（疑わしい相手だ。ラミナを2枚突きつけて、反応を探ろう……）</div>

        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div id="slot1" style="width: 60px; height: 85px; border: 2px dashed #666; display: flex; justify-content: center; align-items: center; color: #888; font-size: 0.8em; background: #111;">未選択</div>
            <div id="slot2" style="width: 60px; height: 85px; border: 2px dashed #666; display: flex; justify-content: center; align-items: center; color: #888; font-size: 0.8em; background: #111;">未選択</div>
        </div>

        <div style="width: 100%; max-width: 500px; display: flex; gap: 5px; overflow-x: auto; padding-bottom: 10px; border-bottom: 1px solid #333;" id="inq-cards"></div>

        <div style="display: flex; gap: 10px; margin-top: 15px; width: 100%; max-width: 500px;">
            <button id="btn-show" style="flex: 1; background: #220000; color: #ffdd66; border: 1px solid #ff3333; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 4px;">提示する</button>
            <button id="btn-shoot" style="display: none; flex: 1; background: #440000; color: #fff; border: 1px solid #ff0000; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 4px; box-shadow: 0 0 10px red;">銃で撃つ</button>
            <button id="btn-leave" style="flex: 1; background: #111; color: #aaa; border: 1px solid #555; padding: 12px; font-family: inherit; cursor: pointer; border-radius: 4px;">立ち去る</button>
        </div>
    `;
    document.body.appendChild(ui);

    let selected = [];
    const cardsDiv = document.getElementById("inq-cards");
    
    gameState.cards.forEach(card => {
        const num = card.match(/\d+/)[0];
        const cDiv = document.createElement("div");
        cDiv.style.cssText = "min-width: 45px; height: 65px; border: 1px solid #555; background: #000; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #fff; font-weight: bold;";
        cDiv.innerHTML = `<img src="assets/images/cards/${card}" style="max-width:100%; max-height:100%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display:none; font-size:1.5em;">${num}</div>`;
        
        cDiv.onclick = () => {
            if (selected.length < 2 && !selected.includes(num)) {
                selected.push(num); updateSlots();
            }
        };
        cardsDiv.appendChild(cDiv);
    });

    function updateSlots() {
        document.getElementById("slot1").innerHTML = selected[0] ? `<div style="font-size:2em; color:#fff;">${selected[0]}</div>` : "未選択";
        document.getElementById("slot2").innerHTML = selected[1] ? `<div style="font-size:2em; color:#fff;">${selected[1]}</div>` : "未選択";
    }

    document.getElementById("slot1").onclick = () => { selected.shift(); updateSlots(); };
    document.getElementById("slot2").onclick = () => { if(selected.length > 1) selected.pop(); updateSlots(); };

    // 提示ボタン押下時（誤差に応じた反応）
    document.getElementById("btn-show").onclick = () => {
        if (selected.length < 2) { alert("ラミナを2枚選んでください。"); return; }
        
        const log = document.getElementById("inq-log");
        
        if (entity.type === "human") {
            log.innerText = `【${entity.name}】\n「な、なんですかその紙切れは？ 宗教の勧誘なら帰ってください！」\n\n（ひどく怪訝な顔をしている。ただの怯えた人間だろうか…？）`;
        } else {
            const c1 = parseInt(selected[0]), c2 = parseInt(selected[1]);
            const w1 = entity.weaknesses[0], w2 = entity.weaknesses[1];
            const diffA = Math.abs(c1 - w1) + Math.abs(c2 - w2);
            const diffB = Math.abs(c1 - w2) + Math.abs(c2 - w1);
            const distance = Math.min(diffA, diffB);

            if (distance === 0) {
                log.innerText = `【${entity.name}】\n「ギャアアアッ！？ や、やめろォォォッ！！」\n\n（激しい苦痛に顔を歪ませ、肌の下でどす黒い影が蠢いている！ まちがいない、こいつは悪魔だ！！）`;
            } else if (distance <= 2) {
                log.innerText = `【${entity.name}】\n「チッ……ッ！」\n\n（一瞬、顔が醜く歪んだ。かなり嫌がっているようだ……！ もう少しで正体を暴けそうだ）`;
            } else if (distance <= 4) {
                log.innerText = `【${entity.name}】\n「……なんですか、それは。不愉快ですね」\n\n（少し眉をひそめた。わずかに効果があるのだろうか？）`;
            } else {
                log.innerText = `【${entity.name}】\n「な、なんですかその紙切れは？ 宗教の勧誘なら帰ってください！」\n\n（怪訝な顔をしている。見当違いの札だったのか、それともただの人間なのか…？）`;
            }
        }
        document.getElementById("btn-shoot").style.display = "block";
    };

    document.getElementById("btn-shoot").onclick = () => { ui.remove(); onResult(entity.type === "human" ? "kill_human" : "combat"); };
    document.getElementById("btn-leave").onclick = () => { ui.remove(); onResult("leave"); };
}

export function openDebugMenu(onAction) {
    if (document.getElementById("debug-modal")) { document.getElementById("debug-modal").remove(); return; }
    const debugDiv = document.createElement("div"); debugDiv.id = "debug-modal"; debugDiv.className = "debug-modal";
    debugDiv.innerHTML = `<h3 style="margin:0; border-bottom:1px solid #00ff00; padding-bottom:5px;">[DEBUG MENU]</h3><button class="debug-btn" id="dbg-all-clear">① 一括イベントクリア</button><button class="debug-btn" id="dbg-warp-2f">② 2階ワープ</button><button class="debug-btn" id="dbg-warp-1f">③ 1階ワープ</button><button class="debug-btn" id="dbg-lv15">④ Lv15</button><button class="debug-btn" id="dbg-money">⑤ お金+1000</button><button class="debug-btn" id="dbg-close" style="background:#550000; color:#fff; border-color:#ff0000;">閉じる [F2]</button>`;
    document.body.appendChild(debugDiv);
    document.getElementById("dbg-all-clear").onclick = () => {
        gameState.hasExorcistInherited = true; gameState.hasKey2F = true; gameState.hasModelGun = true; gameState.hasMetGrandma = true;
        gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
        alert("全解放！"); debugDiv.remove(); if (onAction) onAction();
    };
    document.getElementById("dbg-warp-2f").onclick = () => { gameState.hasKey2F = true; debugDiv.remove(); if (onAction) onAction("warp2F"); };
    document.getElementById("dbg-warp-1f").onclick = () => { debugDiv.remove(); if (onAction) onAction("warp1F"); };
    document.getElementById("dbg-lv15").onclick = () => { gameState.level = 15; gameState.familiarSync = 100; alert("Lv15！"); debugDiv.remove(); };
    document.getElementById("dbg-money").onclick = () => { gameState.money += 1000; alert("お金+1000！"); debugDiv.remove(); };
    document.getElementById("dbg-close").onclick = () => debugDiv.remove();
}