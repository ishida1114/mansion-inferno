// ui.js - 会話・ステップ式査問・ショップ・クロマキー処理完全版
import { gameState } from './gameState.js';
import { itemDefinitions } from './items.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";

// ★ 緑背景（クロマキー）自動透過関数
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
            // 緑色判定してAlpha(透明度)をゼロ化
            if (g > 70 && g > r * 1.15 && g > b * 1.15) data[i + 3] = 0;
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
    video.onerror = () => { console.warn(`動画読み込みスキップ: ${src}`); finish(); };
    overlay.onclick = () => { video.pause(); finish(); };
    video.play().catch(err => { console.warn("自動再生制限スキップ:", err); finish(); });
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

// ★ ドアを開けた時のステップ式査問（インクイジション）システム復元版
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

    // 画像の緑背景透過を即時実行
    const entityImg = document.getElementById("inq-entity-img");
    if (entityImg) {
        if (entityImg.complete) applyChromaKey(entityImg);
        else entityImg.onload = () => applyChromaKey(entityImg);
    }

    let step = 1; // 1: 1枚目選択, 2: 2枚目選択, 3: 最終決断
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

    // 提示ボタンの処理（ステップ進行）
    showBtn.onclick = () => {
        if (step === 1) {
            if (!selected[0]) { alert("1枚目のカードを選択してください。"); return; }
            
            // 1枚目提示の反応
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

            // 2枚目提示の反応 ➔ 最終決断へ
            if (entity.type === "human") {
                log.innerText = `【2枚目: カード${selected[1]}を提示】\n【${entity.name}】\n「しつこいですね！ 宗教の勧誘なら警察を呼びますよ！」\n（完全に人間特有の嫌悪反応だ。【撃つ】か【保護する】か決めよう）`;
            } else {
                const isWeak1 = entity.weaknesses && entity.weaknesses.includes(parseInt(selected[0]));
                const isWeak2 = entity.weaknesses && entity.weaknesses.includes(parseInt(selected[1]));

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

    // 銃で撃つ
    shootBtn.onclick = () => {
        ui.remove();
        if (entity.type === "human") {
            gameState.player.sin += 30; // 人間誤射ペナルティ
            showMessageDialog(`【人間誤射！】\n怯えていた無抵抗の人間を撃ち抜いてしまった……！\n（罪(SIN)が 30 増加した！ 現在の罪:${gameState.player.sin}）`, () => {
                onResult("finish");
            });
        } else {
            showMessageDialog(`【正解！ 悪魔撃退】\n正体を見破られた悪魔は悲鳴を上げて消滅した！`, () => {
                onResult("combat_win");
            });
        }
    };

    // 保護する
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

export function openDebugMenu(onAction) {
    if (document.getElementById("debug-modal")) { document.getElementById("debug-modal").remove(); return; }
    const debugDiv = document.createElement("div"); 
    debugDiv.id = "debug-modal"; 
    debugDiv.className = "debug-modal";
    debugDiv.innerHTML = `<h3 style="margin:0; border-bottom:1px solid #00ff00; padding-bottom:5px;">[DEBUG MENU]</h3><button class="debug-btn" id="dbg-all-clear">① 一括イベントクリア</button><button class="debug-btn" id="dbg-warp-2f">② 2階ワープ</button><button class="debug-btn" id="dbg-warp-1f">③ 1階ワープ</button><button class="debug-btn" id="dbg-lv15">④ Lv15</button><button class="debug-btn" id="dbg-money">⑤ お金+1000</button><button class="debug-btn" id="dbg-close" style="background:#550000; color:#fff; border-color:#ff0000;">閉じる [F2]</button>`;
    document.body.appendChild(debugDiv);

    document.getElementById("dbg-all-clear").onclick = () => {
        gameState.hasExorcistInherited = true; gameState.hasKey2F = true; gameState.hasModelGun = true; gameState.hasMetGrandma = true;
        gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
        alert("全解放！"); debugDiv.remove(); if (onAction) onAction();
    };
    document.getElementById("dbg-warp-2f").onclick = () => { gameState.hasKey2F = true; debugDiv.remove(); if (onAction) onAction("warp2F"); };
    document.getElementById("dbg-warp-1f").onclick = () => { debugDiv.remove(); if (onAction) onAction("warp1F"); };
    document.getElementById("dbg-lv15").onclick = () => { gameState.player.level = 15; alert("Lv15！"); debugDiv.remove(); };
    document.getElementById("dbg-money").onclick = () => { gameState.player.money += 1000; alert("お金+1000！"); debugDiv.remove(); };
    document.getElementById("dbg-close").onclick = () => debugDiv.remove();
}