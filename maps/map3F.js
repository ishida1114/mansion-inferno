// maps/map3F.js - 3階マップデータ・ゴミ屋敷＆真田ボスイベント制御（完全版）

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, openShopUI, openCombatUI, openInquisitionUI, openBossPuzzleUI, playFloorTransition 
} from '../ui.js';
import { ENEMIES, evaluateSanadaPuzzle } from '../enemies.js';

// 3階スタート位置 (エレベーター降り口: x: 2, y: 5, 南向き)
export const playerStart3F = { x: 2, y: 5, dir: 2 };

// 1: 壁 / 0: 通路 / 7: エレベーター / 2: 査問扉（住人/悪魔） / 3: 3Fボス部屋（真田） / 4: 4F非常階段
export const map3F = [
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 1, 3, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1], 
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], 
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 1, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  
];

// 3階ランダムエンカウント処理（walk時呼び出し）
export function check3FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 3) return;
    if (Math.random() < 0.12) { // エンカウント率12%
        const demonKeys = ['DEVIL4_3F', 'DEVIL5_3F', 'DEVIL6_3F'];
        const chosenKey = demonKeys[Math.floor(Math.random() * demonKeys.length)];
        const demonData = ENEMIES[chosenKey];
        onEncounter({ ...demonData });
    }
}

// 3階イベントハンドラー
export function handleEvent3F(targetCell, gameState, context) {
    // 7: エレベーター（1Fへ戻る）
    if (targetCell === 7) {
        return {
            run: (onComplete) => {
                showMessageDialog("【エレベーター】\n1階の拠点へ降りますか？", () => {
                    gameState.lastTransitMethod = 'elevator';
                    playFloorTransition(1, () => {
                        context.changeFloor(1);
                        onComplete();
                    });
                });
            }
        };
    }

    // 4: 非常階段（4Fへの扉）
    if (targetCell === 4) {
        if (!gameState.flags || !gameState.flags.cleared3F) {
            return {
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n大量の腐敗ゴミと激しい毒気が階段を塞いでいる……！\nフロアボスの『真田』を討滅しなければ先へ進めない！", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    gameState.lastTransitMethod = 'stair';
                    playFloorTransition(4, () => {
                        context.changeFloor(4);
                        onComplete();
                    });
                }
            };
        }
    }

    // 2: 部屋（査問イベント）
    if (targetCell === 2) {
        return {
            run: (onComplete) => start3FRoomInquisition(gameState, context, onComplete)
        };
    }

    // 3: 3Fボス部屋（ゴミ屋敷の狂人・真田）
    if (targetCell === 3) {
        if (gameState.flags && gameState.flags.cleared3F) {
            return {
                run: (onComplete) => showMessageDialog("【最奥の部屋】\n真田は討滅され、部屋を覆っていた毒気とゴミは静まり返っている……。", onComplete)
            };
        } else {
            return {
                run: (onComplete) => startSanadaBossSequence(gameState, context, onComplete)
            };
        }
    }

    return null;
}

// 3F 部屋の査問イベント処理
function start3FRoomInquisition(gameState, context, onComplete) {
    const isHuman = Math.random() < 0.5; // 50%で人間 / 悪魔
    
    if (isHuman) {
        const humanEntity = {
            type: "human",
            name: "助けを求める住人",
            faceImage: "assets/images/human1.png"
        };
        openInquisitionUI(humanEntity, gameState, (res) => {
            if (res === "finish") {
                // 3F住人保護時の証言ヒントを保存
                if (!gameState.bossHints) gameState.bossHints = [];
                gameState.bossHints.push("【3F住人の証言】真田の魔方陣は4マスの合計を「18」にする。左右の腕には小さい数字から順にカードを配置する。");
            }
            onComplete();
        }, context);
    } else {
        const demonEntity = {
            type: "demon",
            name: "腐敗の悪魔",
            faceImage: "assets/images/demon/demon4.png",
            realImage: "assets/images/demon/demon4.png",
            weakness: 8 // 聖香が弱点
        };
        openInquisitionUI(demonEntity, gameState, (res) => {
            onComplete();
        }, context);
    }
}

// 3F ボス真田シーケンス（動画再生 ➔ 魔方陣パズル ➔ 戦闘/勝利）
function startSanadaBossSequence(gameState, context, onComplete) {
    playVideo("assets/videos/3f-sanada.mp4", () => {
        const puzzleConfig = {
            title: "【3Fボス解読】ゴミ屋敷の狂人・真田",
            subTitle: "毒ガスを放つ鼻口と足元の腐敗ゴミを浄化せよ",
            bossName: "真田",
            slots: [
                { id: '1', label: '上：毒ガス口', gridPos: 'grid-area: 1 / 2;' },
                { id: '3', label: '左：悪臭の腕', gridPos: 'grid-area: 2 / 1;' },
                { id: '5', label: '右：不浄の腕', gridPos: 'grid-area: 2 / 3;' },
                { id: '7', label: '下：腐敗ゴミ', gridPos: 'grid-area: 3 / 2;' }
            ]
        };

        openBossPuzzleUI(puzzleConfig, gameState, (placedSlots) => {
            const evalResult = evaluateSanadaPuzzle(placedSlots);

            if (evalResult.result === 'PERFECT') {
                // 100%合致特効撃破
                const reward = gameState.calculateRewards ? gameState.calculateRewards(200, 800) : { exp: 200, money: 800 };
                gameState.player.money += reward.money;
                const isLvUp = gameState.gainExp(reward.exp);
                
                if (!gameState.flags) gameState.flags = {};
                gameState.flags.cleared3F = true;
                if (gameState.saveGame) gameState.saveGame();

                const capNotice = reward.isCapped ? "\n※レベル上限超過により獲得量減衰" : "";
                showMessageDialog(`${evalResult.message}\n\n【3Fフロアボス全滅！】\n真田の怨霊を浄化し、3階の悪臭が消え去った！\n（💰${reward.money} 獲得 / ${reward.exp} EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}${capNotice}`, onComplete);

            } else if (evalResult.result === 'PARTIAL') {
                // 一部合致：敵HP50%で戦闘へ
                showMessageDialog(`${evalResult.message}\n弱点を突いてダメージを与えた！ 真田（HP50%）との戦闘に入る！`, () => {
                    const sanadaEnemy = {
                        name: ENEMIES.SANADA_3F.name,
                        image: "assets/images/demon/demon5.png",
                        hp: Math.floor(ENEMIES.SANADA_3F.hp * 0.5),
                        atk: ENEMIES.SANADA_3F.atk,
                        def: ENEMIES.SANADA_3F.def,
                        weakness: [8, 6]
                    };
                    openCombatUI(sanadaEnemy, gameState, (combatRes) => {
                        if (combatRes === 'win') {
                            gameState.flags.cleared3F = true;
                            if (gameState.saveGame) gameState.saveGame();
                        }
                        onComplete();
                    }, context);
                });

            } else {
                // 不正解：敵HP100%で通常戦闘
                showMessageDialog(`${evalResult.message}\n魔方陣が解除できず、真田が襲いかかってきた！`, () => {
                    const sanadaEnemy = {
                        name: ENEMIES.SANADA_3F.name,
                        image: "assets/images/demon/demon5.png",
                        hp: ENEMIES.SANADA_3F.hp,
                        atk: ENEMIES.SANADA_3F.atk,
                        def: ENEMIES.SANADA_3F.def,
                        weakness: [8, 6]
                    };
                    openCombatUI(sanadaEnemy, gameState, (combatRes) => {
                        if (combatRes === 'win') {
                            gameState.flags.cleared3F = true;
                            if (gameState.saveGame) gameState.saveGame();
                        }
                        onComplete();
                    }, context);
                });
            }
        });
    });
}