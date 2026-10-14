// debug.js - 開発テスト用デバッグコントローラー（全機能保持＆ステータス・フラグ完全自動セット版）

export function initDebug(gameState, context) {
    // F2キーでデバッグメニューの開閉
    window.addEventListener("keydown", (e) => {
        if (e.key === "F2") {
            toggleDebugModal(gameState, context);
        }
    });
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
        background: rgba(0, 0, 0, 0.7); z-index: 9999;
        display: flex; justify-content: center; align-items: center;
        font-family: monospace;
    `;

    const panel = document.createElement("div");
    panel.style.cssText = `
        background: #0a150a; border: 2px solid #00ff66; border-radius: 8px;
        padding: 20px; width: 420px; max-height: 80vh; overflow-y: auto;
        color: #00ff66; box-shadow: 0 0 20px rgba(0, 255, 100, 0.4);
    `;

    // フロアワープボタンHTML生成
    const warpButtonsHTML = [1, 2, 3, 4, 5, 6, 7].map(floor => `
        <button class="debug-btn-warp" data-floor="${floor}" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">
            ${floor}F
        </button>
    `).join('');

    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #00ff66; padding-bottom:8px; margin-bottom:12px;">
            <strong style="font-size:1.1em;">[ DEBUG CONSOLE (F2) ]</strong>
            <button id="debug-close-btn" style="background:#220000; color:#ff4444; border:1px solid #ff4444; cursor:pointer; padding:2px 8px;">✕</button>
        </div>
        
        <div style="margin-bottom: 12px;">
            <div style="font-weight:bold; margin-bottom:4px; color:#aaffaa;">■ フロア直行ワープ（フラグ全セット済）</div>
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                ${warpButtonsHTML}
            </div>
        </div>

        <div style="margin-bottom: 12px;">
            <div style="font-weight:bold; margin-bottom:4px; color:#aaffaa;">■ プレイヤー強化・育成</div>
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                <button id="debug-lv15" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">Lv.15にする (4F想定)</button>
                <button id="debug-lv25" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">Lv.25にする (6F想定)</button>
                <button id="debug-heal" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">HP全回復</button>
                <button id="debug-money" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">所持金 +10,000</button>
            </div>
        </div>

        <div>
            <div style="font-weight:bold; margin-bottom:4px; color:#aaffaa;">■ フラグ・カード</div>
            <div style="display:grid; grid-template-columns: 1fr; gap: 6px;">
                <button id="debug-give-all-cards" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">全ラミナカード (1〜9) ＆銃 付与</button>
                <button id="debug-give-keys" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">主要な鍵 (2F鍵/EV鍵) 付与</button>
            </div>
        </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // 閉じるボタン
    document.getElementById("debug-close-btn").onclick = () => overlay.remove();

    // フロアワープ
    panel.querySelectorAll(".debug-btn-warp").forEach(btn => {
        btn.onclick = () => {
            const f = parseInt(btn.dataset.floor, 10);
            
            // ワープ前に必要なフラグ・カード・ステータスをフロアに合わせて自動設定する
            setupFloorDebugState(f, gameState);

            if (context && context.changeFloor) {
                context.changeFloor(f);
                overlay.remove();
                if (context.redraw) context.redraw();
            }
        };
    });

    // レベル・ステータス一括更新ヘルパー
    const applyLevel = (targetLv) => {
        if (gameState.player) {
            gameState.player.level = targetLv;
            // 基礎ステータスの再計算
            gameState.player.maxHp = 20 + (targetLv - 1) * 7; 
            gameState.player.hp = gameState.player.maxHp;
            gameState.player.atk = 5 + (targetLv - 1) * 2;
            gameState.player.def = Math.floor((targetLv - 1) * 0.8);
            gameState.player.agi = 5 + Math.floor((targetLv - 1) * 0.5);
            
            // ★ レベルに応じたポート（スロット）の強制解放
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

    document.getElementById("debug-lv15").onclick = () => {
        applyLevel(15);
        alert(`プレイヤーLvを 15 に設定しました（HP:${gameState.player.maxHp} に上昇・全回復・ポート3つ解放）`);
    };

    document.getElementById("debug-lv25").onclick = () => {
        applyLevel(25);
        alert(`プレイヤーLvを 25 に設定しました（HP:${gameState.player.maxHp} に上昇・全回復・ポート3つ解放）`);
    };

    document.getElementById("debug-heal").onclick = () => {
        if (gameState.player) {
            gameState.player.hp = gameState.player.maxHp || 100;
        }
        if (context && context.redraw) context.redraw();
        alert("HPを全回復しました");
    };

    document.getElementById("debug-money").onclick = () => {
        if (gameState.player) {
            gameState.player.money = (gameState.player.money || 0) + 10000;
        }
        if (context && context.redraw) context.redraw();
        alert("所持金を +10,000 追加しました");
    };

    document.getElementById("debug-give-all-cards").onclick = () => {
        const fullCards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
        gameState.cards = fullCards;
        gameState.hasExorcistInherited = true;
        gameState.hasModelGun = true;
        if (gameState.player) gameState.player.hasModelGun = true;
        if (!gameState.equippedCards || gameState.equippedCards.length === 0) {
            gameState.equippedCards = [1, 2, 3];
        }
        if (gameState.updateEquippedCards) gameState.updateEquippedCards();
        alert("全ラミナカード ＆ モデルガン ＆ スマホアプリ を付与しました");
    };

    document.getElementById("debug-give-keys").onclick = () => {
        gameState.hasKey2F = true;
        gameState.hasElevatorKey = true;
        if (!gameState.flags) gameState.flags = {};
        gameState.flags.hasKey2F = true;
        gameState.flags.hasElevatorKey = true;
        alert("2F非常階段の鍵 ＆ エレベーターキー を付与しました");
    };
}

// フロア直行時の自動フラグ・ステータスセットアップ関数
function setupFloorDebugState(floor, gameState) {
    if (!gameState.flags) gameState.flags = {};

    // 基本装備の自動付与（アプリ、銃、全カード）
    gameState.hasExorcistInherited = true;
    gameState.hasModelGun = true;
    if (gameState.player) gameState.player.hasModelGun = true;
    gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
    if (!gameState.equippedCards || gameState.equippedCards.length === 0) {
        gameState.equippedCards = [1, 2, 3]; // デフォルト装填
    }
    
    // ステータスとフラグのフロア別進行度設定
    if (floor >= 2) {
        if(gameState.player) gameState.player.level = Math.max(gameState.player.level, 5);
        gameState.hasKey2F = true;
    }
    if (floor >= 3) {
        if(gameState.player) gameState.player.level = Math.max(gameState.player.level, 10);
        gameState.hasElevatorKey = true;
        gameState.flags.cleared2F = true;
        gameState.flags.hasSanadaRoomKey = true;
    }
    if (floor >= 4) {
        if(gameState.player) gameState.player.level = Math.max(gameState.player.level, 15);
        gameState.flags.cleared3F = true;
        if (floor === 4) { // 4Fに着地した場合は4Fのイベントを未クリア状態にする
            gameState.flags.cleared4F = false;
            gameState.flags.hasBrandBag = false;   
            gameState.flags.hasChampagne = false;  
            gameState.flags.defeatedShineiA = false;
            gameState.flags.defeatedShineiB = false;
        }
    }
    if (floor >= 5) {
        if(gameState.player) gameState.player.level = Math.max(gameState.player.level, 20);
        gameState.flags.cleared4F = true;
        if (floor === 5) { // 5Fに着地した場合は5Fのイベントを未クリア状態にする
            gameState.flags.cleared5F = false;
            gameState.isHirunumaDefeated = false;
            gameState.flags.rabbitChaseStep = 0;
            gameState.hasKeyLab5F = false;
        }
    }
    if (floor >= 6) {
        if(gameState.player) gameState.player.level = Math.max(gameState.player.level, 25);
        gameState.flags.cleared5F = true;
        gameState.isHirunumaDefeated = true;
        if (floor === 6) { // 6Fに着地した場合は6Fのイベントを未クリア状態にする
            gameState.flags.cleared6F = false;
            gameState.flags.hasCat = false; // 黒猫はまだ救出していない状態
            gameState.flags.hasSilverShears = false;
            gameState.flags.cleared601 = false;
            gameState.flags.cleared602 = false;
        }
    }
    if (floor >= 7) {
        if(gameState.player) gameState.player.level = Math.max(gameState.player.level, 30);
        gameState.flags.cleared6F = true;
        gameState.flags.hasCat = true; // 6Fクリア済みなので黒猫は連れている
    }
    
    // 現在のレベルに基づいてステータス（HP/攻撃力等）を再計算
    if (gameState.player) {
        const targetLv = gameState.player.level;
        gameState.player.maxHp = 20 + (targetLv - 1) * 7;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.atk = 5 + (targetLv - 1) * 2;
        gameState.player.def = Math.floor((targetLv - 1) * 0.8);
        gameState.player.agi = 5 + Math.floor((targetLv - 1) * 0.5);

        // ★ フロアワープ時にもポート（スロット）を自動解放
        if (targetLv >= 15) {
            gameState.unlockedSlots = 3;
        } else if (targetLv >= 5) {
            gameState.unlockedSlots = 2;
        } else {
            gameState.unlockedSlots = 1;
        }
    }
    
    if (gameState.updateEquippedCards) {
        gameState.updateEquippedCards();
    }
}