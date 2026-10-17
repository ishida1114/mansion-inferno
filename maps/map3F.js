// maps/map3F.js - エレベーター(3)統一・真田部屋(8)修正・構文エラー修正版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openBossPuzzleUI, openCombatUI, openInquisitionUI 
} from '../ui.js';
import { ENEMIES, evaluateSanadaPuzzle } from '../enemies.js';

export const playerStart3F = { x: 5, y: 8, dir: 0 };

// 1: 壁 / 0: 通路 
// 4: 4Fへの上り階段 / 8: 真田の部屋 / 2: 住人の部屋 / 3: エレベーター
export const map3F = [
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1], 
    [1, 8, 1, 0, 0, 0, 0, 0, 1, 2, 1], 
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 2, 0, 1, 0, 1, 0, 0, 0, 1], 
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 3, 1, 1, 1, 0, 1], 
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
    // 3: エレベーター（行き先選択メニュー：上が5F、下が1Fに配置）
    if (targetCell === 3) {
        return { 
            run: (onComplete) => {
                const evModal = document.createElement("div");
                evModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-family: monospace;";
                
                let html = `<h2 style="color: #66ccff; margin-bottom: 20px;">【エレベーター】</h2>`;
                
                // ★ 上が上の階、下が1階（下の階）になるよう並び順を修正
                const is5FUnlocked = gameState.flags && gameState.flags.cleared4F;
                html += `<button class="ev-btn" data-floor="5" style="width: 240px; padding: 15px; margin: 5px; background: ${is5FUnlocked ? '#222' : '#111'}; color: ${is5FUnlocked ? '#fff' : '#666'}; border: 1px solid ${is5FUnlocked ? '#666' : '#333'}; font-size: 1.1em; cursor: pointer;">5F (精神科病棟) ${is5FUnlocked ? '' : '🔒'}</button>`;
                html += `<button class="ev-btn" data-floor="3" style="width: 240px; padding: 15px; margin: 5px; background: #004400; color: #00ff66; border: 1px solid #00ff66; font-size: 1.1em; cursor: pointer;">3F (現在地)</button>`;
                html += `<button class="ev-btn" data-floor="1" style="width: 240px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.1em; cursor: pointer;">1F (エントランス)</button>`;
                html += `<button id="ev-cancel" style="width: 240px; padding: 15px; margin-top: 20px; background: #440000; color: #ff6666; border: 1px solid #ff3333; cursor: pointer;">閉じる</button>`;
                evModal.innerHTML = html;
                document.body.appendChild(evModal);

                document.getElementById("ev-cancel").onclick = () => { evModal.remove(); onComplete(); };
                
                evModal.querySelectorAll(".ev-btn").forEach(btn => {
                    btn.onclick = () => {
                        const f = parseInt(btn.getAttribute("data-floor"), 10);
                        
                        // ★ 5Fへのフライング防止制限
                        if (f === 5 && (!gameState.flags || !gameState.flags.cleared4F)) {
                            alert("【ロック中】4階の異変を解決するまで、5階へ昇ることはできない！");
                            return;
                        }

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

    // 8: ボス部屋（真田：ストッパー確認付き）
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
        
        // ★ ストッパー：突入前の確認ウィンドウ
        return {
            run: (onComplete) => {
                const confirmModal = document.createElement("div");
                confirmModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3500; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: monospace; padding: 20px; box-sizing: border-box;";
                confirmModal.innerHTML = `
                    <div style="background: #110505; border: 2px solid #ff3333; padding: 25px; border-radius: 8px; max-width: 440px; text-align: center; color: #eee; box-shadow: 0 0 25px red;">
                        <h3 style="color: #ff3333; margin-top: 0;">【最奥の部屋：真田の巣窟】</h3>
                        <p style="font-size: 0.95em; line-height: 1.6; color: #ccc;">ドアの隙間から強烈な悪臭と毒気が漏れ出している……！<br>バールで粗大ゴミをこじ開けて中に入りますか？</p>
                        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                            <button id="btn-enter-sanada" style="background: #660000; color: #ffdd66; border: 1px solid #ff3333; padding: 10px 20px; font-weight: bold; cursor: pointer; border-radius: 4px;">▶ 突入する（ボス戦）</button>
                            <button id="btn-cancel-sanada" style="background: #222; color: #aaa; border: 1px solid #555; padding: 10px 20px; cursor: pointer; border-radius: 4px;">引き返す（準備する）</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(confirmModal);

                document.getElementById("btn-cancel-sanada").onclick = () => {
                    confirmModal.remove();
                    onComplete();
                };

                document.getElementById("btn-enter-sanada").onclick = () => {
                    confirmModal.remove();
                    startSanadaBossSequence(gameState, context, onComplete);
                };
            }
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

    // ★ 部屋ごとに手に入るメモを差別化（2部屋とも探索する意味を持たせる）
    const grantSanadaItemAndHint = (messageTitle, callback) => {
        if (!gameState.flags) gameState.flags = {};
        if (!gameState.bossHints) gameState.bossHints = [];

        if (!gameState.flags.hasSanadaRoomKey) {
            gameState.flags.hasSanadaRoomKey = true;
            gameState.bossHints.push("【3Fメモ①】真田の魔方陣は4マスの合計を「18」にする。");
            showMessageDialog(`${messageTitle}\n『鉄のバール』と『真田攻略メモ①』を手に入れた！\n（※真田の魔方陣は4マスの合計を「18」にする！）\nこれで真田の部屋を塞ぐ粗大ゴミを撤去できる！`, callback);
        } else if (!gameState.flags.hasSanadaHint2) {
            gameState.flags.hasSanadaHint2 = true;
            gameState.bossHints.push("【3Fメモ②】真田の腕は左から小さい順に配置する。毒気の口には聖炎(6)や聖香(8)が有効。");
            showMessageDialog(`${messageTitle}\n『真田攻略メモ②』を手に入れた！\n（※左右の腕には小さい数字から順にカードを配置する！ 口の弱点は【聖炎(6)】と【聖香(8)】だ！）`, callback);
        } else {
            callback();
        }
    };

    const isRealHuman = Math.random() < 0.5;

    if (isRealHuman) {
        const entity = {
            type: "human",
            name: "怯えるマンション住民", // ネタバレ防止に統一
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
            name: "怯えるマンション住民", // ネタバレ防止に統一
            trueName: "ゴミに潜む悪魔",   // 戦闘時に使用
            faceImage: "assets/images/human1.png",
            realImage: "assets/images/demon/demon4.png",
            weakness: 8,
            rewardExp: 80,
            rewardMoney: 200
        };
        openInquisitionUI(entity, gameState, (res) => {
            if (res === "combat_win" || res === "kill_human") {
                gameState.clearedRooms[roomKey] = true;
                grantSanadaItemAndHint("【悪魔を討滅した】\n悪魔が溜め込んでいた荷物の中から……", onComplete);
            } else if (res === "demon_ambush") {
                gameState.player.hp = Math.max(1, gameState.player.hp - 10);
                const demonEnemy = {
                    name: entity.trueName || "ゴミに潜む悪魔",
                    image: entity.realImage,
                    hp: 30, atk: 10, def: 1,
                    weakness: [entity.weakness],
                    rewardExp: 80, rewardMoney: 200
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
                subTitle: "毒ガスを放つ口と足元の腐敗ゴミを浄化せよ（合計18）",
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
                        // ★ 構文エラー修復済み箇所
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
                            weakness: [8, 6],
                            rewardExp: 200,
                            rewardMoney: 800,
                            isBoss: true
                        };

                        openCombatUI(sanadaEnemy, gameState, (combatRes) => {
                            if (combatRes === 'win') {
                                if (!gameState.flags) gameState.flags = {};
                                gameState.flags.cleared3F = true;
                                if (gameState.saveGame) gameState.saveGame();

                                gameState.player.x = 3;
                                gameState.player.y = 1;
                                gameState.player.dir = 1;

                                showMessageDialog(`【3Fフロアボス討滅！】\n真田の怨霊を浄化した！だがここには父親の姿がない……。\n主人公「マジか、まだ上に行かないとダメなのか……」\n※非常階段の障害物が消え、4階へ進めるようになりました！`, onComplete);
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