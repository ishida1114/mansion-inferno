// debug.js - 開発テスト用デバッグコントローラー（全機能保持＆ステータス完全連動版）

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
    const warpButtonsHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(floor => `
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
            <div style="font-weight:bold; margin-bottom:4px; color:#aaffaa;">■ フロアワープ</div>
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                ${warpButtonsHTML}
            </div>
        </div>

        <div style="margin-bottom: 12px;">
            <div style="font-weight:bold; margin-bottom:4px; color:#aaffaa;">■ プレイヤー強化・育成</div>
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                <button id="debug-lv15" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">Lv.15にする (4F想定)</button>
                <button id="debug-lv20" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">Lv.20にする (5F想定)</button>
                <button id="debug-heal" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">HP全回復</button>
                <button id="debug-money" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">所持金 +10,000</button>
            </div>
        </div>

        <div>
            <div style="font-weight:bold; margin-bottom:4px; color:#aaffaa;">■ フラグ・カード</div>
            <div style="display:grid; grid-template-columns: 1fr; gap: 6px;">
                <button id="debug-give-all-cards" style="background:#003311; color:#00ff66; border:1px solid #00aa44; padding:6px; cursor:pointer;">全ラミナカード (1〜9) 付与</button>
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
            if (context && context.changeFloor) {
                context.changeFloor(f);
                overlay.remove();
            }
        };
    });

    // レベル・ステータス一括更新ヘルパー
    const applyLevel = (targetLv) => {
        if (gameState.player) {
            gameState.player.level = targetLv;
            gameState.player.maxHp = 100 + (targetLv - 1) * 15;
            gameState.player.hp = gameState.player.maxHp;
            gameState.player.atk = 10 + (targetLv - 1) * 3;
            gameState.player.agi = 5 + Math.floor((targetLv - 1) * 1.5);
        }
        // 互換性保持
        gameState.playerLevel = targetLv;
        if (window.renderMap) window.renderMap();
    };

    document.getElementById("debug-lv15").onclick = () => {
        applyLevel(15);
        alert(`プレイヤーLvを 15 に設定しました（HP:${gameState.player.maxHp} に上昇・全回復）`);
    };

    document.getElementById("debug-lv20").onclick = () => {
        applyLevel(20);
        alert(`プレイヤーLvを 20 に設定しました（HP:${gameState.player.maxHp} に上昇・全回復）`);
    };

    document.getElementById("debug-heal").onclick = () => {
        if (gameState.player) {
            gameState.player.hp = gameState.player.maxHp || 100;
        }
        gameState.playerHp = gameState.playerMaxHp || 100;
        alert("HPを全回復しました");
    };

    document.getElementById("debug-money").onclick = () => {
        if (gameState.player) {
            gameState.player.money = (gameState.player.money || 0) + 10000;
        }
        gameState.money = (gameState.money || 0) + 10000;
        alert("所持金を +10,000 追加しました");
    };

    document.getElementById("debug-give-all-cards").onclick = () => {
        const fullCards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
        gameState.cards = fullCards;
        if (!gameState.equippedCards || gameState.equippedCards.length === 0) {
            gameState.equippedCards = [1, 2, 3];
        }
        alert("1〜9番の全ラミナカードを所持枠に追加しました");
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