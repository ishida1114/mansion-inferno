// maps/map4F.js - 4階マップデータ＆リナ進入イベント制御

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, openShopUI, openCombatUI, openInquisitionUI, openBossPuzzleUI, playFloorTransition 
} from '../ui.js';
import { ENEMIES, evaluateRinaPuzzle } from '../enemies.js';

export const playerStart4F = { x: 5, y: 9, dir: 0 };

// 1: 壁 / 0: 通路 / 7: エレベーター / 2: 査問部屋扉 / 3: ボス部屋（リナ） / 4: 5F非常階段
export const map4F = [
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1], // y=0: 北端に5F非常階段 (4)
    [1, 3, 1, 0, 0, 0, 0, 0, 1, 2, 1], // y=1: (1,1)にボス部屋 (3)、(9,1)に査問扉 (2)
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 2, 0, 1, 0, 1, 0, 0, 0, 1], // y=3: (2,3)に査問扉 (2)
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 7, 1, 1, 1, 0, 1], // y=9: (5,9)にエレベーター (7)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function check4FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 4) return;
    if (Math.random() < 0.15) {
        const demonKeys = ['DEVIL7_4F', 'DEVIL8_4F', 'DEVIL9_4F'];
        const chosenKey = demonKeys[Math.floor(Math.random() * demonKeys.length)];
        const demonData = ENEMIES[chosenKey] || ENEMIES['DEVIL4_3F'];
        onEncounter({ ...demonData });
    }
}

export function handleEvent4F(targetCell, gameState, context) {
    // 7: エレベーター（1Fへ）
    if (targetCell === 7) {
        return {
            run: (onComplete) => {
                showMessageDialog("【エレベーター】\n1階の拠点（コンビニ）へ降りますか？", () => {
                    gameState.lastTransitMethod = 'elevator';
                    playFloorTransition(1, () => {
                        context.changeFloor(1);
                        onComplete();
                    });
                });
            }
        };
    }

    // 4: 非常階段（5Fへ）
    if (targetCell === 4) {
        if (!gameState.flags || !gameState.flags.cleared4F) {
            return {
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n甘い桃色の霧と太い肉の蔦が階段を塞いでいる！\nフロアボスの『リナ』を倒さなければ先へ進めない！", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    gameState.lastTransitMethod = 'stair';
                    playFloorTransition(5, () => {
                        context.changeFloor(5);
                        onComplete();
                    });
                }
            };
        }
    }

    // 2: 査問部屋
    if (targetCell === 2) {
        return {
            run: (onComplete) => start4FRoomInquisition(gameState, context, onComplete)
        };
    }

    // 3: 4Fボス部屋（リナ）
    if (targetCell === 3) {
        if (gameState.flags && gameState.flags.cleared4F) {
            return {
                run: (onComplete) => showMessageDialog("【最奥の部屋】\nリナの悪霊は浄化され、甘ったるい香気は静まり返っている……。", onComplete)
            };
        }
        
        return {
            run: (onComplete) => startRinaBossSequence(gameState, context, onComplete)
        };
    }

    return null;
}

function start4FRoomInquisition(gameState, context, onComplete) {
    const isRealHuman = Math.random() < 0.5;

    if (isRealHuman) {
        const entity = {
            type: "human",
            name: "マンションの住人",
            faceImage: "assets/images/human1.png"
        };
        openInquisitionUI(entity, gameState, (res) => {
            if (res === "finish") {
                if (!gameState.flags) gameState.flags = {};
                gameState.flags.hasRinaRoomKey = true;

                if (!gameState.bossHints) gameState.bossHints = [];
                gameState.bossHints.push("【4F住人の証言】リナの誘惑を破るには、中央に『聖書(5)』を配置して精神攻撃を遮断すること。");

                showMessageDialog("【住人を救出】\n住人を救出した！ リナ攻略のヒントを入手した！", onComplete);
            } else {
                onComplete();
            }
        }, context);
    } else {
        const entity = {
            type: "demon",
            name: "マンションの住人",
            faceImage: "assets/images/human1.png",
            realImage: "assets/images/demon/demon4.png",
            weakness: 2
        };
        openInquisitionUI(entity, gameState, (res) => {
            onComplete();
        }, context);
    }
}

function startRinaBossSequence(gameState, context, onComplete) {
    showConversationDialog("assets/images/demon/rina.png", "【色欲・リナ】\n「ねえ……本当に私を攻撃するつもり？ 助けてくれるって言ったじゃない……ふふっ♡」", () => {
        const puzzleConfig = {
            title: "【4Fボス解読】色欲のパパ活女子・リナ",
            subTitle: "甘い誘惑と精神攻撃を断ち切れ",
            bossName: "リナ",
            slots: [
                { id: '1', label: '上：惑わしの瞳', gridPos: 'grid-area: 1 / 2;' },
                { id: '3', label: '左：色香の腕', gridPos: 'grid-area: 2 / 1;' },
                { id: '5', label: '右：誘惑の腕', gridPos: 'grid-area: 2 / 3;' },
                { id: '7', label: '下：執着の足', gridPos: 'grid-area: 3 / 2;' }
            ]
        };

        openBossPuzzleUI(puzzleConfig, gameState, (placedSlots) => {
            const evalResult = evaluateRinaPuzzle ? evaluateRinaPuzzle(placedSlots) : { result: 'FAIL', correctCount: 0 };

            playVideo("assets/videos/magic-circle.mp4", () => {
                const floor = 4;
                const targetLevel = floor * 4; // 4F適正レベル = 16
                const playerLevel = gameState.player.level;

                let hpRatio = 1.0;
                let resultMsg = "";

                if (evalResult.result === 'PERFECT') {
                    if (playerLevel >= targetLevel) {
                        hpRatio = 0.2;
                        resultMsg = `【完全正解！】適正レベル(Lv.${targetLevel})到達！\n陣が眩く輝き、リナの体力を 8割削減 した！`;
                    } else {
                        hpRatio = 0.5;
                        resultMsg = `【完全正解！】魔方陣の解読に成功！\n聖なる光が吹き荒れ、リナの体力を 半減 させた！`;
                    }
                } else if (evalResult.result === 'PARTIAL') {
                    const reductionRate = Math.min(evalResult.correctCount * 0.1, 0.3);
                    hpRatio = 1.0 - reductionRate;
                    resultMsg = `【部分正解】${evalResult.correctCount}箇所の弱点が合致！\nリナの体力を ${Math.round(reductionRate * 100)}% 削減した！`;
                } else {
                    hpRatio = 1.0;
                    resultMsg = `【解読失敗】不完全な陣だ！ ダメージを与えられなかった！`;
                }

                const baseHp = ENEMIES.RINA_4F ? ENEMIES.RINA_4F.hp : 150;
                const startHp = Math.max(1, Math.floor(baseHp * hpRatio));

                showMessageDialog(`${resultMsg}\nリナとの決戦に入る！`, () => {
                    const rinaEnemy = {
                        name: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.name : "色欲のパパ活女子・リナ",
                        image: "assets/images/demon/rina.png",
                        hp: startHp,
                        maxHp: baseHp,
                        atk: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.atk : 22,
                        def: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.def : 4,
                        weakness: [2, 5]
                    };

                    openCombatUI(rinaEnemy, gameState, (combatRes) => {
                        if (combatRes === 'win') {
                            if (!gameState.flags) gameState.flags = {};
                            gameState.flags.cleared4F = true;
                            if (gameState.saveGame) gameState.saveGame();

                            const reward = gameState.calculateRewards ? gameState.calculateRewards(300, 1200) : { exp: 300, money: 1200 };
                            gameState.player.money += reward.money;
                            const isLvUp = gameState.gainExp(reward.exp);
                            
                            const capNotice = reward.isCapped ? "\n※レベル上限超過により獲得量減衰" : "";
                            showMessageDialog(`【4Fフロアボス討滅！】\nリナの怨霊を浄化し、甘い桃色の霧が消え去った！\n（💰${reward.money} 獲得 / ${reward.exp} EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}${capNotice}`, onComplete);
                        } else {
                            onComplete();
                        }
                    }, context);
                });
            });
        });
    });
}