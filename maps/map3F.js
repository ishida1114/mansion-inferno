// maps/map3F.js - エレベーター(3)統一・真田部屋(8)修正・行き先選択メニュー対応版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openBossPuzzleUI, openCombatUI, openInquisitionUI 
} from '../ui.js';
import { ENEMIES, evaluateSanadaPuzzle } from '../enemies.js';

export const playerStart3F = { x: 5, y: 8, dir: 0 };

// ★ 修正：(1,1)のボス部屋を「8」に、(5,9)のエレベーターを「3」に変更
export const map3F = [
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1], // 4: 4Fへの上り階段
    [1, 8, 1, 0, 0, 0, 0, 0, 1, 2, 1], // 8: 真田の部屋 / 2: 住人の部屋
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 2, 0, 1, 0, 1, 0, 0, 0, 1], // 2: 住人の部屋
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 3, 1, 1, 1, 0, 1], // 3: エレベーター
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function check3FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 3) return;
    if (Math.random() < 0.15) {
        const demonKeys = ['DEVIL4_3F', 'DEVIL5_3F', 'DEVIL6_3F'];
        const chosenKey = demonKeys[Math.floor(Math.random() * demonKeys.length)];
        const demonData = ENEMIES[chosenKey] || ENEMIES['DEVIL4_3F'];
        onEncounter({ ...demonData });
    }
}

export function handleEvent3F(targetCell, gameState, context) {
    // ★ 3: エレベーター（行き先選択メニュー）
    if (targetCell === 3) {
        return { 
            run: (onComplete) => {
                const evModal = document.createElement("div");
                evModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-family: monospace;";
                
                let html = `<h2 style="color: #66ccff; margin-bottom: 20px;">【エレベーター】</h2>`;
                html += `<button class="ev-btn" data-floor="1" style="width: 220px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.1em; cursor: pointer;">1F (エントランス)</button>`;
                html += `<button class="ev-btn" data-floor="3" style="width: 220px; padding: 15px; margin: 5px; background: #004400; color: #00ff66; border: 1px solid #00ff66; font-size: 1.1em; cursor: pointer;">3F (現在地)</button>`;
                html += `<button class="ev-btn" data-floor="5" style="width: 220px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.1em; cursor: pointer;">5F (精神科病棟)</button>`;
                html += `<button id="ev-cancel" style="width: 220px; padding: 15px; margin-top: 20px; background: #440000; color: #ff6666; border: 1px solid #ff3333; cursor: pointer;">閉じる</button>`;
                evModal.innerHTML = html;
                document.body.appendChild(evModal);

                document.getElementById("ev-cancel").onclick = () => { evModal.remove(); onComplete(); };
                evModal.querySelectorAll(".ev-btn").forEach(btn => {
                    btn.onclick = () => {
                        const f = parseInt(btn.getAttribute("data-floor"), 10);
                        evModal.remove();
                        if (f === 3) {
                            onComplete();
                        } else {
                            gameState.lastTransitMethod = 'elevator';
                            playFloorTransition(f, () => {
                                context.changeFloor(f);
                                onComplete();
                            });
                        }
                    };
                });
            } 
        };
    }

    // 4: 非常階段（4Fへ登る）
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

    // 2: 住人の部屋
    if (targetCell === 2) {
        return {
            run: (onComplete) => start3FRoomInquisition(gameState, context, onComplete)
        };
    }

    // ★ 8: ボス部屋（真田）
    if (targetCell === 8) {
        if (gameState.flags && gameState.flags.cleared3F) {
            return {
                run: (onComplete) => showMessageDialog("【最奥の部屋】\n真田は討滅され、毒気と腐敗ゴミは静まり返っている……。", onComplete)
            };
        }

        if (!gameState.flags || !gameState.flags.hasSanadaRoomKey) {
            return {
                run: (onComplete) => showMessageDialog("【最奥の部屋】\n山積みの巨大な粗大ゴミで扉が固く塞がれている……！\n撤去するには強固な工具（バールなど）が必要そうだ。", onComplete)
            };
        }
        
        return {
            run: (onComplete) => startSanadaBossSequence(gameState, context, onComplete)
        };
    }

    return null;
}

function start3FRoomInquisition(gameState, context, onComplete) {
    const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
    const vec = dirVectors[gameState.player.dir];
    const frontX = gameState.player.x + vec.x;
    const frontY = gameState.player.y + vec.y;
    const roomKey = `3F_${frontX}_${frontY}`;

    if (!gameState.clearedRooms) gameState.clearedRooms = {};

    if (gameState.clearedRooms[roomKey]) {
        showMessageDialog("【住人の部屋】\nこの部屋にはもう誰もいない……。", onComplete);
        return;
    }

    const grantSanadaItemAndHint = (messageTitle, callback) => {
        if (!gameState.flags) gameState.flags = {};
        if (!gameState.flags.hasSanadaRoomKey) {
            gameState.flags.hasSanadaRoomKey = true;
            if (!gameState.bossHints) gameState.bossHints = [];
            gameState.bossHints.push("【3F攻略メモ】真田の魔方陣は4マスの合計を「18」にする。左右の腕には小さい数字から順にカードを配置する。");

            showMessageDialog(`${messageTitle}\n『鉄のバール』と『真田攻略メモ』を手に入れた！\nこれで真田の部屋を塞ぐ粗大ゴミを撤去できる！`, callback);
        } else {
            callback();
        }
    };

    const isRealHuman = Math.random() < 0.5;

    if (isRealHuman) {
        const entity = {
            type: "human",
            name: "マンションの住人",
            faceImage: "assets/images/human1.png"
        };
        openInquisitionUI(entity, gameState, (res) => {
            if (res === "finish" || res === "combat_win" || res === "kill_human") {
                gameState.clearedRooms[roomKey] = true;
                grantSanadaItemAndHint("【住人を保護した】", onComplete);
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
            if (res === "combat_win" || res === "kill_human") {
                gameState.clearedRooms[roomKey] = true;
                grantSanadaItemAndHint("【悪魔を討滅した】\n悪魔が溜め込んでいた荷物の中から……", onComplete);
            } else if (res === "demon_ambush") {
                gameState.player.hp = Math.max(1, gameState.player.hp - 10);
                const demonEnemy = {
                    name: entity.name,
                    image: entity.realImage,
                    hp: 30, atk: 10, def: 1,
                    weakness: [entity.weakness]
                };
                openCombatUI(demonEnemy, gameState, (cRes) => {
                    if (cRes === "win") {
                        gameState.clearedRooms[roomKey] = true;
                        grantSanadaItemAndHint("【悪魔を討滅した】\n悪魔が溜め込んでいた荷物の中から……", onComplete);
                    } else {
                        onComplete();
                    }
                }, context);
            } else {
                onComplete();
            }
        }, context);
    }
}

function startSanadaBossSequence(gameState, context, onComplete) {
    showConversationDialog("assets/images/demon/3f-sanada.jpg", "【ゴミ屋敷の狂人・真田】\n「え？ 2Fの中学生の父親？ 知らねえよ、食えんのかよ、うちのBBAが不味かったからな、お前で口直ししてやるよ」", () => {
        playVideo("assets/images/demon/3f-sanada.mp4", () => {
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

                const applyDamageAndCombat = () => {
                    const floor = 3;
                    const targetLevel = (floor - 1) * 5;
                    const playerLevel = gameState.player.level || 1;

                    let hpRatio = 1.0;
                    let resultMsg = "";

                    if (evalResult.result === 'PERFECT') {
                        if (playerLevel >= targetLevel) {
                            hpRatio = 0.2;
                            resultMsg = `【完全正解！】適正レベル(Lv.${targetLevel})到達！\n陣が眩く輝き、真田の体力を 8割削減 した！`;
                        } else {
                            hpRatio = 0.5;
                            resultMsg = `【完全正解！】魔方陣の解読に成功！\n聖なる光が吹き荒れ、真田の体力を 半減 させた！`;
                        }
                    } else if (evalResult.result === 'PARTIAL') {
                        const reductionRate = Math.min(evalResult.correctCount * 0.1, 0.3);
                        hpRatio = 1.0 - reductionRate;
                        resultMsg = `【部分正解】${evalResult.correctCount}箇所の弱点が合致！\n真田の体力を ${Math.round(reductionRate * 100)}% 削減した！`;
                    } else {
                        hpRatio = 1.0;
                        resultMsg = `【解読失敗】不完全な陣だ！ ダメージを与えられなかった！`;
                    }

                    const baseHp = ENEMIES.SANADA_3F ? ENEMIES.SANADA_3F.hp : 110;
                    const startHp = Math.max(1, Math.floor(baseHp * hpRatio));

                    showMessageDialog(`${resultMsg}\n真田との決戦に入る！`, () => {
                        const sanadaEnemy = {
                            name: ENEMIES.SANADA_3F ? ENEMIES.SANADA_3F.name : "ゴミ屋敷の狂人・真田",
                            image: "assets/images/demon/3f-sanada.jpg",
                            hp: startHp, maxHp: baseHp,
                            atk: ENEMIES.SANADA_3F ? ENEMIES.SANADA_3F.atk : 18,
                            def: ENEMIES.SANADA_3F ? ENEMIES.SANADA_3F.def : 3,
                            weakness: [8, 6]
                        };

                        openCombatUI(sanadaEnemy, gameState, (combatRes) => {
                            if (combatRes === 'win') {
                                if (!gameState.flags) gameState.flags = {};
                                gameState.flags.cleared3F = true;
                                if (gameState.saveGame) gameState.saveGame();

                                gameState.player.x = 3;
                                gameState.player.y = 1;
                                gameState.player.dir = 1;

                                const reward = gameState.calculateRewards ? gameState.calculateRewards(200, 800) : { exp: 200, money: 800 };
                                gameState.player.money += reward.money;
                                const isLvUp = gameState.gainExp(reward.exp);
                                
                                const capNotice = reward.isCapped ? "\n※レベル上限超過により獲得量減衰" : "";
                                showMessageDialog(`【3Fフロアボス討滅！】\n真田の怨霊を浄化し、3階の悪臭が消え去った！\n（💰${reward.money} 獲得 / ${reward.exp} EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}${capNotice}`, onComplete);
                            } else {
                                onComplete();
                            }
                        }, context);
                    });
                };

                if (evalResult.result === 'PERFECT') {
                    playVideo("assets/videos/magic-circle.mp4", applyDamageAndCombat);
                } else {
                    applyDamageAndCombat();
                }
            });
        });
    });
}