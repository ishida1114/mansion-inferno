// combat.js
import { applyChromaKey } from './ui.js';

let currentEnemy = null;
let combatCallback = null;
let isHumanInspection = false; 
let isProcessingTurn = false;

export function startCombat(enemyData, gameState, isInspection = false, onFinished) {
    currentEnemy = JSON.parse(JSON.stringify(enemyData)); 
    combatCallback = onFinished;
    isHumanInspection = isInspection;
    isProcessingTurn = false;

    const overlay = document.createElement("div");
    overlay.id = "combat-overlay";
    overlay.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(5, 0, 0, 0.95); z-index: 3500;
        display: flex; flex-direction: column; align-items: center; justify-content: space-between;
        padding: 20px; box-sizing: border-box; font-family: 'Shippori Mincho', serif;
    `;

    overlay.innerHTML = `
        <div style="text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="color: #ff3333; font-size: 1.4em; text-shadow: 0 0 8px red; margin-bottom: 10px;">
                <span style="color: #888; font-size: 0.8em; margin-right: 5px;">Lv.${currentEnemy.level}</span>
                ${currentEnemy.name}
            </div>
            <img id="combat-enemy-img" src="${currentEnemy.image}" style="max-height: 220px; border-radius: 8px;" onerror="this.style.display='none'">
        </div>

        <div id="combat-log" style="width: 90%; height: 80px; background: rgba(0,0,0,0.8); border: 2px solid #550000; border-radius: 6px; padding: 12px; color: #ddd; font-size: 1.05em; line-height: 1.5; margin-bottom: 15px; overflow-y: auto; white-space: pre-wrap;">
${currentEnemy.name} が立ちはだかった！
        </div>

        <div style="width: 90%; display: flex; gap: 15px; align-items: center;">
            <div style="background: #111; border: 1px solid #444; padding: 10px 15px; border-radius: 6px; color: #aaa; font-size: 0.9em; min-width: 120px;">
                <div>HP: <span id="combat-hp" style="color:#ffdd66;">${gameState.hp}</span> / ${gameState.maxHp}</div>
                <div>AGI: ${gameState.agi}</div>
                <div>DEF: ${gameState.def}</div>
            </div>

            <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <button id="cmd-attack" style="background: #220000; color: #ffdd66; border: 1px solid #770000; padding: 12px; font-size: 1em; cursor: pointer; border-radius: 4px; font-family: inherit;">Vox Sacra（銃撃）</button>
                <button id="cmd-item" style="background: #111; color: #ccc; border: 1px solid #444; padding: 12px; font-size: 1em; cursor: pointer; border-radius: 4px; font-family: inherit;">アイテム</button>
                <button id="cmd-escape" style="background: #111; color: #ccc; border: 1px solid #444; padding: 12px; font-size: 1em; cursor: pointer; border-radius: 4px; font-family: inherit; ${isHumanInspection ? 'display:none;' : ''}">逃げる</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const img = document.getElementById("combat-enemy-img");
    if (img) {
        if (img.complete) applyChromaKey(img);
        else img.onload = () => applyChromaKey(img);
    }

    document.getElementById("cmd-attack").onclick = () => playerTurnAttack(gameState);
    document.getElementById("cmd-item").onclick = () => {
        if (isProcessingTurn) return;
        appendLog("アイテム画面は未実装です。");
    };
    if (!isHumanInspection) {
        document.getElementById("cmd-escape").onclick = () => playerTurnEscape(gameState);
    }
}

function appendLog(text) {
    const logDiv = document.getElementById("combat-log");
    if (logDiv) logDiv.innerText = text;
}

function playerTurnAttack(gameState) {
    if (isProcessingTurn) return;
    isProcessingTurn = true;

    if (!gameState.hasModelGun) {
        appendLog("モデルガンを所持していない！\nVox Sacra（銃撃）の手段がない！");
        setTimeout(() => enemyTurn(gameState), 1200);
        return;
    }

    let basePower = 0;
    let isWeaknessHit = false;

    if (gameState.equippedCards.length === 0) {
        basePower = 5; 
    } else {
        gameState.equippedCards.forEach(cardName => {
            const numMatch = cardName.match(/\d+/);
            const cardNum = numMatch ? parseInt(numMatch[0]) : 1;
            basePower += cardNum;
            if (cardName === currentEnemy.weakness) isWeaknessHit = true;
        });
    }

    if (isWeaknessHit) basePower *= 2;
    const damage = Math.max(1, basePower - currentEnemy.def);
    currentEnemy.hp -= damage;

    let logText = `【Vox Sacra】聖なる銃声が ${currentEnemy.name} を穿つ！\n${damage} のダメージを与えた！`;
    if (isWeaknessHit) logText += "（弱点特攻！！）";
    appendLog(logText);

    if (currentEnemy.hp <= 0) {
        setTimeout(() => {
            appendLog(`${currentEnemy.name} を退治した！\n経験値 ${currentEnemy.exp} と 💰${currentEnemy.money} を獲得！`);
            gameState.exp += currentEnemy.exp;
            gameState.money += currentEnemy.money;
            
            if (gameState.exp >= gameState.level) {
                gameState.level += 1;
                gameState.maxHp += 5; // ★ レベルアップHP増加も控えめ（+5）
                gameState.hp = gameState.maxHp;
                gameState.def += 1;
                gameState.agi += 1;
            }
            setTimeout(() => finishCombat("victory"), 1500);
        }, 1200);
    } else {
        setTimeout(() => enemyTurn(gameState), 1200);
    }
}

// ★ 逃走率を大幅ダウン ＆ 失敗時は追撃確定
function playerTurnEscape(gameState) {
    if (isProcessingTurn) return;
    isProcessingTurn = true;

    // 逃走成功率：約 25% (AGI依存で微増)
    const escapeRate = Math.min(0.5, (gameState.agi / currentEnemy.agi) * 0.25);
    if (Math.random() < escapeRate) {
        appendLog("無事に逃げ切ることに成功した！");
        setTimeout(() => finishCombat("escaped"), 1200);
    } else {
        appendLog("逃走に失敗してしまった！ 背後を突かれる！");
        setTimeout(() => enemyTurn(gameState), 1200);
    }
}

function enemyTurn(gameState) {
    if (currentEnemy.hp <= 0) return;

    // 回避判定
    const dodgeRate = Math.min(0.5, Math.max(0.05, (gameState.agi - currentEnemy.agi) * 0.02 + 0.05));
    if (Math.random() < dodgeRate) {
        appendLog(`${currentEnemy.name} の攻撃！\n間一髪で身をかわした！（回避成功）`);
        isProcessingTurn = false;
        return;
    }

    const action = currentEnemy.actions[Math.floor(Math.random() * currentEnemy.actions.length)];
    let damage = 0;

    if (action.type === "physical") {
        damage = Math.max(1, currentEnemy.atk - gameState.def);
    } else {
        damage = Math.max(1, Math.floor(currentEnemy.satk - (gameState.def / 2)));
    }

    gameState.hp -= damage;
    if (gameState.hp < 0) gameState.hp = 0;

    const hpElem = document.getElementById("combat-hp");
    if (hpElem) hpElem.innerText = gameState.hp;

    appendLog(`${currentEnemy.name} の ${action.name}\n主人公は ${damage} のダメージを受けた！`);

    if (gameState.hp <= 0) {
        setTimeout(() => {
            appendLog("意識が遠のいていく……主人公は倒れた。");
            setTimeout(() => finishCombat("died"), 1800);
        }, 1200);
    } else {
        isProcessingTurn = false;
    }
}

function finishCombat(result) {
    const overlay = document.getElementById("combat-overlay");
    if (overlay) overlay.remove();
    if (combatCallback) combatCallback(result);
}