// debug.js - 開発テスト用デバッグコントローラー（全デバッグ機能集約＆8F御堂直前対応 完全版）

export function initDebug(gameState, context) {
    // グローバルに関数を公開
    window.openDebugModal = () => toggleDebugModal(gameState, context);

    // ★ スマホ用デバッグボタン（画面左上に自己生成）
    if (!document.getElementById("btn-mobile-debug")) {
        const debugBtn = document.createElement("button");
        debugBtn.id = "btn-mobile-debug";
        debugBtn.innerText = "🛠️";
        debugBtn.title = "デバッグメニュー";
        debugBtn.style.cssText = `
            position: fixed; top: 10px; left: 10px; z-index: 2500;
            background: rgba(15, 15, 20, 0.75); border: 1px solid #774444;
            color: #ffdd66; font-size: 18px; padding: 6px 10px; border-radius: 8px;
            cursor: pointer; user-select: none; -webkit-user-select: none;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        `;
        document.body.appendChild(debugBtn);
    }

    // PC：F2キーでデバッグメニュー開閉
    window.addEventListener("keydown", (e) => {
        if (e.key === "F2") {
            e.preventDefault();
            toggleDebugModal(gameState, context);
        }
    });

    // スマホ：「🛠️」ボタンをタップした時
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (target && (target.id === "btn-mobile-debug" || target.closest("#btn-mobile-debug"))) {
            e.preventDefault();
            e.stopPropagation();
            toggleDebugModal(gameState, context);
        }
    }, true);
}

function toggleDebugModal(gameState, context) {
    const existing = document.getElementById("debug-modal-overlay");
    if (existing) {
        existing.remove();
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "debug-modal-overlay";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.75); z-index: 9999;
        display: flex; justify-content: center; align-items: center;
        font-family: monospace;
    `;

    const panel = document.createElement("div");
    panel.style.cssText = `
        background: #0a150a; border: 2px solid #00ff66; border-radius: 8px;
        padding: 20px; width: 440px; max-height: 85vh; overflow-y: auto;
        color: #00ff66; box-shadow: 0 0 25px rgba(0, 255, 100, 0.4); box-sizing: border-box;
    `;

    // 1F〜8Fのワープボタン生成
    let warpButtonsHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(floor => `
        <button class="debug-btn-warp" data-floor="${floor}" style="background:${floor === 8 ? '#550000' : '#003311'}; color:${floor === 8 ? '#ffdd66' : '#00ff66'}; border:1px solid ${floor === 8 ? '#ff3333' : '#00aa44'}; padding:8px 4px; cursor:pointer; font-weight:${floor === 8 ? 'bold' : 'normal'}; border-radius:4px;">
            ${floor}F
        </button>
    `).join('');

    // ★ 8F(御堂直前)ボタンを追加
    warpButtonsHTML += `
        <button class="debug-btn-warp" data-floor="8_boss" style="background:linear-gradient(180deg,#660066,#220022); color:#ffdd66; border:1px solid #cc00cc; padding:8px 4px; cursor:pointer; font-weight:bold; border-radius:4px; box-shadow:0 0 6px magenta; grid-column: span 4;">
            8F (御堂直前・中ボス討伐済)
        </button>
    `;

    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #00ff66; padding-bottom:8px; margin-bottom:12px;">
            <strong style="font-size:1.1em;">[ DEBUG CONSOLE (F2 / 🛠️) ]</strong>
            <button id="debug-close-btn" style="background:#220000; color:#ff4444; border:1px solid #ff4444; cursor:pointer; padding:4px 10px; font-weight:bold; border-radius:4px;">✕</button>
        </div>
        
        <div style="margin-bottom: 14px;">
            <div style="font-weight:bold; margin-bottom:6px; color:#aaffaa;">■ フロア直行ワープ（フラグ全セット済）</div>
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                ${warpButtonsHTML}
            </div>
        </div>

        <div style="margin-bottom: 14px;">
            <div style="font-weight:bold; margin-bottom:6px; color:#aaffaa;">■ プレイヤー強化・育成</div>
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                <button id="debug-lv15" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:8px; cursor:pointer; border-radius:4px;">Lv.15にする (4F用)</button>
                <button id="debug-lv25" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:8px; cursor:pointer; border-radius:4px;">Lv.25にする (6F用)</button>
                <button id="debug-lv35" style="background:#443300; color:#ffdd66; border:1px solid #ffaa00; padding:8px; cursor:pointer; border-radius:4px; font-weight:bold;">Lv.35にする (8F用)</button>
                <button id="debug-heal" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:8px; cursor:pointer; border-radius:4px;">HP全回復</button>
                <button id="debug-money" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:8px; cursor:pointer; border-radius:4px; grid-column: span 2;">所持金 +10,000 💰</button>
            </div>
        </div>

        <div>
            <div style="font-weight:bold; margin-bottom:6px; color:#aaffaa;">■ フラグ・装備</div>
            <div style="display:grid; grid-template-columns: 1fr; gap: 6px;">
                <button id="debug-give-all-cards" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:8px; cursor:pointer; border-radius:4px;">全ラミナカード (1〜9) ＆ モデルガン付与</button>
                <button id="debug-give-keys" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:8px; cursor:pointer; border-radius:4px;">主要な鍵 (2F鍵/EV鍵) 付与</button>
            </div>
        </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    document.getElementById("debug-close-btn").onclick = () => overlay.remove();

    panel.querySelectorAll(".debug-btn-warp").forEach(btn => {
        btn.onclick = () => {
            const rawFloor = btn.dataset.floor;
            const isMidoDirect = (rawFloor === "8_boss");
            const targetFloor = isMidoDirect ? 8 : parseInt(rawFloor, 10);

            setupFloorDebugState(rawFloor, gameState);

            if (context && context.changeFloor) {
                context.changeFloor(targetFloor);

                // 御堂直前の場合は扉の目の前に着地
                if (isMidoDirect) {
                    gameState.player.x = 3;
                    gameState.player.y = 2;
                    gameState.player.dir = 0;
                }

                overlay.remove();
                if (context.redraw) context.redraw();
            }
        };
    });

    const applyLevel = (targetLv) => {
        if (gameState.player) {
            gameState.player.level = targetLv;
            gameState.player.maxHp = 20 + (targetLv - 1) * 7; 
            gameState.player.hp = gameState.player.maxHp;
            gameState.player.atk = 5 + (targetLv - 1) * 2;
            gameState.player.def = Math.floor((targetLv - 1) * 0.8);
            gameState.player.agi = 5 + Math.floor((targetLv - 1) * 0.5);
            
            if (targetLv >= 15) {
                gameState.unlockedSlots = 3;
            } else if (targetLv >= 5) {
                gameState.unlockedSlots = 2;
            } else {
                gameState.unlockedSlots = 1;
            }
        }
        if (context && context.redraw) context.redraw();
    };

    document.getElementById("debug-lv15").onclick = () => { applyLevel(15); alert("Lv.15に設定しました"); };
    document.getElementById("debug-lv25").onclick = () => { applyLevel(25); alert("Lv.25に設定しました"); };
    document.getElementById("debug-lv35").onclick = () => { applyLevel(35); alert("Lv.35に設定しました"); };
    document.getElementById("debug-heal").onclick = () => {
        if (gameState.player) gameState.player.hp = gameState.player.maxHp || 100;
        if (context && context.redraw) context.redraw();
        alert("HPを全回復しました");
    };
    document.getElementById("debug-money").onclick = () => {
        if (gameState.player) gameState.player.money = (gameState.player.money || 0) + 10000;
        if (context && context.redraw) context.redraw();
        alert("所持金を +10,000 追加しました");
    };
    document.getElementById("debug-give-all-cards").onclick = () => {
        gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
        gameState.hasExorcistInherited = true;
        gameState.hasModelGun = true;
        if (gameState.player) gameState.player.hasModelGun = true;
        if (!gameState.equippedCards || gameState.equippedCards.length === 0) gameState.equippedCards = [1, 2, 3];
        if (gameState.updateEquippedCards) gameState.updateEquippedCards();
        alert("全カード＆武器を付与しました");
    };
    document.getElementById("debug-give-keys").onclick = () => {
        gameState.hasKey2F = true;
        gameState.hasElevatorKey = true;
        if (!gameState.flags) gameState.flags = {};
        gameState.flags.hasKey2F = true;
        gameState.flags.hasElevatorKey = true;
        alert("鍵を付与しました");
    };
}

// フロア直行時の自動セットアップ
function setupFloorDebugState(rawFloor, gameState) {
    if (!gameState.flags) gameState.flags = {};
    const isMidoDirect = (rawFloor === "8_boss");
    const floor = isMidoDirect ? 8 : parseInt(rawFloor, 10);

    gameState.lastTransitMethod = 'stair';
    gameState.hasExorcistInherited = true;
    gameState.hasModelGun = true;
    if (gameState.player) gameState.player.hasModelGun = true;
    gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
    if (!gameState.equippedCards || gameState.equippedCards.length === 0) gameState.equippedCards = [1, 2, 3];
    
    if (floor >= 2) {
        if (gameState.player) gameState.player.level = Math.max(gameState.player.level, 5);
        gameState.hasKey2F = true;
    }
    if (floor >= 3) {
        if (gameState.player) gameState.player.level = Math.max(gameState.player.level, 10);
        gameState.hasElevatorKey = true;
        gameState.flags.cleared2F = true;
        gameState.flags.hasSanadaRoomKey = true;
    }
    if (floor >= 4) {
        if (gameState.player) gameState.player.level = Math.max(gameState.player.level, 15);
        gameState.flags.cleared3F = true;
    }
    if (floor >= 5) {
        if (gameState.player) gameState.player.level = Math.max(gameState.player.level, 20);
        gameState.flags.cleared4F = true;
    }
    if (floor >= 6) {
        if (gameState.player) gameState.player.level = Math.max(gameState.player.level, 25);
        gameState.flags.cleared5F = true;
        gameState.isHirunumaDefeated = true;
    }
    if (floor >= 7) {
        if (gameState.player) gameState.player.level = Math.max(gameState.player.level, 30);
        gameState.flags.cleared6F = true;
        gameState.flags.hasCat = true;
    }
    if (floor >= 8) {
        if (gameState.player) gameState.player.level = Math.max(gameState.player.level, 35);
        gameState.flags.cleared6F = true;
        gameState.flags.cleared7F = true;
        gameState.flags.hasCat = true;
        gameState.flags.isCatTrapped = false;
        gameState.flags.unlocked7FElevator = true;

        // 御堂直前なら中ボス撃破済みに設定
        if (isMidoDirect) {
            gameState.flags.clearedCerberus = true;
            gameState.flags.clearedGozuMezu = true;
        }
    }
    
    if (gameState.player) {
        const targetLv = gameState.player.level;
        gameState.player.maxHp = 20 + (targetLv - 1) * 7;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.atk = 5 + (targetLv - 1) * 2;
        gameState.player.def = Math.floor((targetLv - 1) * 0.8);
        gameState.player.agi = 5 + Math.floor((targetLv - 1) * 0.5);

        if (targetLv >= 15) gameState.unlockedSlots = 3;
        else if (targetLv >= 5) gameState.unlockedSlots = 2;
        else gameState.unlockedSlots = 1;
    }
    
    if (gameState.updateEquippedCards) gameState.updateEquippedCards();
}