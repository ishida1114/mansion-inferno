// combat.js - 戦闘開始・ボス魔方陣パズル連携・黒猫サポート制御完全版[cite: 2]

import { gameState } from './gameState.js';
import { openCombatUI, openBossPuzzleUI, playVideo } from './ui.js';

// 通常戦闘の開始ラッパー
export function startCombat(enemy, onWin, onDefeat) {
    openCombatUI(enemy, gameState, (result) => {
        if (result === "win" || result === "combat_win") {
            if (onWin) onWin();
        } else if (result === "defeat") {
            if (onDefeat) onDefeat();
        }
    });
}

// ボス戦（魔方陣パズル ➔ 戦闘）の開始ラッパー[cite: 2]
export function startBossCombat(bossEnemy, onWin, onDefeat, evaluatePuzzleFn) {
    // パズルが設定されているボスの場合[cite: 2]
    if (bossEnemy.puzzle && evaluatePuzzleFn) {
        const slotsConfig = bossEnemy.puzzle.openSlots.map(slotId => {
            const labels = {
                1: "① 上段",
                3: "② 左",
                5: "③ 右",
                7: "④ 下段"
            };
            const gridPositions = {
                1: "grid-area: 1 / 2;",
                3: "grid-area: 2 / 1;",
                5: "grid-area: 2 / 3;",
                7: "grid-area: 3 / 2;"
            };
            return {
                id: `slot_\${slotId}`,
                slotNum: slotId,
                label: labels[slotId] || `枠\${slotId}`,
                gridPos: gridPositions[slotId] || ""
            };
        });

        const puzzleConfig = {
            title: `【魔方陣解読】\${bossEnemy.name}`,
            subTitle: `退魔の札（ラミナ）を配置して急所を穿て！`,
            bossName: bossEnemy.name,
            slots: slotsConfig
        };

        openBossPuzzleUI(puzzleConfig, gameState, (placedSlots) => {
            // スロット入力を { 1: cardNum, 3: cardNum, ... } 形式に変換
            const cardsMap = {};
            Object.keys(placedSlots).forEach(k => {
                const num = parseInt(k.replace("slot_", ""), 10);
                cardsMap[num] = placedSlots[k];
            });

            const evalResult = evaluatePuzzleFn(cardsMap);
            
            // 魔法陣展開動画の再生[cite: 2]
            playVideo("assets/videos/magic-circle.mp4", () => {
                let hpMultiplier = 1.0;
                let evalMsg = "";
                const targetLevel = bossEnemy.baseLevel || 20;

                // ボスHP減衰計算公式[cite: 2]
                if (evalResult.result === 'PERFECT') {
                    if (gameState.player.level >= targetLevel) {
                        hpMultiplier = 0.2; // 8割削減 (残り20%)[cite: 2]
                        evalMsg = `【完全正解＆適正レベル以上！】\n強烈な退魔の光が炸裂！ ボスのHPを80%削り取った！`;
                    } else {
                        hpMultiplier = 0.5; // 半減 (残り50%)[cite: 2]
                        evalMsg = `【完全正解！】\n魔方陣が合致！ ボスのHPを半減させた！`;
                    }
                } else if (evalResult.result === 'PARTIAL') {
                    const reduction = Math.min(0.3, (evalResult.correctCount || 1) * 0.1);
                    hpMultiplier = 1.0 - reduction;
                    evalMsg = `【部分合致】\n一部の札が共鳴！ ボスのHPを \${Math.round(reduction * 100)}% 削った！`;
                } else {
                    hpMultiplier = 1.0;
                    evalMsg = `【不正解】\n札の波動が弾かれた！ ボスは無傷のままだ！`;
                }

                alert(evalMsg);

                const weakenedBoss = {
                    ...bossEnemy,
                    hp: Math.max(1, Math.floor(bossEnemy.hp * hpMultiplier)),
                    maxHp: bossEnemy.hp
                };

                openCombatUI(weakenedBoss, gameState, (combatRes) => {
                    if (combatRes === "win" || combatRes === "combat_win") {
                        if (onWin) onWin();
                    } else {
                        if (onDefeat) onDefeat();
                    }
                });
            }, "▶ 結界発動");
        });
    } else {
        // パズルなしボス（キメラ化父親など）
        startCombat(bossEnemy, onWin, onDefeat);
    }
}

// 既存の査問ロジック用クラス（保持）
export class CombatSystem {
    constructor(enemy, isInquisition = false, isHuman = false) {
        this.enemy = enemy;
        this.isInquisition = isInquisition;
        this.isHuman = isHuman;
        this.turn = 1;
        this.umbrellaBuffs = { def: 0, turns: 0, stunTurns: 0, damageMultiplier: 1 };
    }

    handleProtectOption() {
        if (this.isHuman) {
            gameState.player.money += 150;
            return {
                success: true,
                message: '住民を無事に1Fコンビニへ避難させた！ お礼に 150💰 を受け取った。'
            };
        } else {
            const firstAttackDamage = Math.max(1, this.enemy.atk - gameState.player.def);
            gameState.player.hp -= firstAttackDamage;
            return {
                success: false,
                message: `「ククク…間抜けめ！」正体を現した悪魔から【確定先制攻撃】を受け、\${firstAttackDamage} ダメージ！ 戦闘開始！`,
                forceEnemyFirstTurn: true
            };
        }
    }

    handleShootOption() {
        if (this.isHuman) {
            gameState.player.sin += 1;
            return {
                error: true,
                message: '無抵抗の人間を撃ち殺してしまった…！ 罪悪感が脳を苛む。（SIN +1）'
            };
        } else {
            return { error: false, message: '見事悪魔の正体を打ち抜いた！' };
        }
    }
}