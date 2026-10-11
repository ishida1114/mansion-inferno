// maps/map3F.js - 真田戦立ち絵ダイアログ＆戦闘画像（3f-sanada.jpg）適用版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, openShopUI, openCombatUI, openInquisitionUI, openBossPuzzleUI, playFloorTransition 
} from '../ui.js';
import { ENEMIES, evaluateSanadaPuzzle } from '../enemies.js';

export const playerStart3F = { x: 5, y: 9, dir: 0 };

export const map3F = [
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1],
    [1, 3, 1, 0, 0, 0, 0, 0, 1, 2, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 2, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 7, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function check3FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 3) return;
    if (Math.random() < 0.15) {
        const demonKeys = ['DEVIL4_3F', 'DEVIL5_3F', 'DEVIL6_3F'];
        const chosenKey = demonKeys[Math.floor(Math.random() * demonKeys.length)];
        const demonData = ENEMIES[chosenKey];
        onEncounter({ ...demonData });
    }
}

export function handleEvent3F(targetCell, gameState, context) {
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

    if (targetCell === 4) {
        if (!gameState.flags || !gameState.flags.cleared3F) {
            return {
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n山積みの不法投棄ゴミと劇物が階段を塞いでいる！\nフロアボスの『真田』を倒さなければ先へ進めない！", onComplete)
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

    if (targetCell === 2) {
        return {
            run: (onComplete) => start3FRoomInquisition(gameState, context, onComplete)
        };
    }

    if (targetCell === 3) {
        if (gameState.flags && gameState.flags.cleared3F) {
            return {
                run: (onComplete) => showMessageDialog("【最奥の部屋】\n真田は討滅され、毒気と腐敗ゴミは静まり返っている……。", onComplete)
            };
        }
        
        if (!gameState.flags || !gameState.flags.hasSanadaRoomKey) {
            return {
                run: (onComplete) => showMessageDialog("【真田の部屋の前】\n頑丈な鎖と粗大ゴミの山で固く封鎖されている！\n無理やりこじ開けるには『鉄のバール』が必要だ……。\n（※3Fの部屋に捕らわれている住人を救出しよう）", onComplete)
            };
        }

        return {
            run: (onComplete) => startSanadaBossSequence(gameState, context, onComplete)
        };
    }

    return null;
}

function start3FRoomInquisition(gameState, context, onComplete) {
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
                gameState.flags.hasSanadaRoomKey = true;

                if (!gameState.bossHints) gameState.bossHints = [];
                gameState.bossHints.push("【3F住人の証言】真田の魔方陣は4マスの合計を「18」にする。左右の腕には小さい数字から順にカードを配置する。");

                showMessageDialog("【住人からアイテム獲得】\n救出した住人から『鉄のバール』を受け取った！\nこれで真田の部屋を塞ぐ粗大ゴミを撤去できる！", onComplete);
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
            weakness: 8
        };
        openInquisitionUI(entity, gameState, (res) => {
            onComplete();
        }, context);
    }
}

function startSanadaBossSequence(gameState, context, onComplete) {
    showMessageDialog("【真田の部屋前】\n手に入れた『鉄のバール』で粗大ゴミと鎖を叩き壊した！\n重い扉が開く……！", () => {
        // ★ 3f-sanada.jpg を使用したボス会話ダイアログ演出
        showConversationDialog("assets/images/demon/3f-sanada.jpg", "【ゴミ屋敷の狂人・真田】\n「ヒヒヒ……オレのゴミ山を荒らす奴は誰だぁ！？ 腐敗と悪臭の中で死ねぇ！！」", () => {
            const puzzleConfig = {
                title: "【3Fボス解読】ゴミ屋敷の狂人・真田",
                subTitle: "毒ガスを放つ口と足元の腐敗ゴミを浄化せよ",
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
                    const reward = gameState.calculateRewards ? gameState.calculateRewards(200, 800) : { exp: 200, money: 800 };
                    gameState.player.money += reward.money;
                    const isLvUp = gameState.gainExp(reward.exp);
                    
                    if (!gameState.flags) gameState.flags = {};
                    gameState.flags.cleared3F = true;
                    if (gameState.saveGame) gameState.saveGame();

                    const capNotice = reward.isCapped ? "\n※レベル上限超過により獲得量減衰" : "";
                    showMessageDialog(`${evalResult.message}\n\n【3Fフロアボス全滅！】\n真田の怨霊を浄化し、3階の悪臭が消え去った！\n（💰${reward.money} 獲得 / ${reward.exp} EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}${capNotice}`, onComplete);

                } else if (evalResult.result === 'PARTIAL') {
                    showMessageDialog(`${evalResult.message}\n弱点を突いてダメージを与えた！ 真田（HP50%）との戦闘に入る！`, () => {
                        const sanadaEnemy = {
                            name: ENEMIES.SANADA_3F.name,
                            image: "assets/images/demon/3f-sanada.jpg",
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
                    showMessageDialog(`${evalResult.message}\n魔方陣が解除できず、真田が襲いかかってきた！`, () => {
                        const sanadaEnemy = {
                            name: ENEMIES.SANADA_3F.name,
                            image: "assets/images/demon/3f-sanada.jpg",
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
    });
}