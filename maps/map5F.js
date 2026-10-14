// maps/map5F.js - アリスの追いかけっこ・時計回り新マップ・完全版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, playFloorTransition, openCombatUI, openInquisitionUI, openBossPuzzleUI 
} from '../ui.js';
import { ENEMIES, evaluateHirunumaPuzzle } from '../enemies.js';

// 5階開始位置 (x: 7, y: 1, 南向きではなく、壁を背に東を向かせる)
export const playerStart5F = { x: 7, y: 1, dir: 1 };

// ★完全新規マップ（15x9）: 時計回りにフロアを一周させる構造
// 1: 壁 / 0: 通路
// 3: エレベーター(2,0) / 5: 4Fへ(7,0) / 4: 6Fへ(7,8)
// 2: イベント扉（看護師、覗き窓、トランプ、アリス、ウサギ、実験室）

// ★ 5Fマップ配列（エレベーターを階段の隣に移動）
export const map5F = [
    [1, 1, 1, 1, 1, 1, 3, 5, 1, 1, 1, 2, 1, 1, 1], // y=0 (3:エレベーター(6,0), 5:4F下り階段(7,0), 2:501号室ナース(11,0))
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=1 (Start:7,1。エレベーター前(6,1)を通路に)
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1], // y=2 
    [1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 2], // y=3 
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // y=4
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // y=5
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // y=6
    [1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 1], // y=7 
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1]  // y=8 
];

// マップ状態の同期（ロード時に破壊した扉を消去する）
function syncMapState(gameState) {
    if (!gameState.flags) gameState.flags = {};
    if (!gameState.flags.rabbitChaseStep) gameState.flags.rabbitChaseStep = 0;
    
    // 進行度に応じて通せんぼ扉を消去（通路[0]にする）
    if (gameState.flags.rabbitChaseStep >= 2) map5F[7][13] = 0; // トランプ撃破後
    if (gameState.flags.rabbitChaseStep >= 3) map5F[7][7] = 0;  // アリス撃破後
    if (gameState.flags.rabbitChaseStep >= 4) map5F[7][3] = 0;  // ウサギ撃破後（中央へ開通）
}

export function check5FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 5) return;
    syncMapState(gameState); // 歩くたびにマップ状態を保証
    
    if (Math.random() < 0.15) {
        const demonTypes = [
            { id: 'DEVIL10_5F', name: '徘徊するキメラ', image: 'assets/images/demon/demon10.png', hp: 200, atk: 32, def: 5, weakness: [4, 7], agi: 12 },
            { id: 'DEVIL11_5F', name: '失敗作の肉塊', image: 'assets/images/demon/demon11.png', hp: 240, atk: 35, def: 8, weakness: [1, 6], agi: 10 },
            { id: 'DEVIL12_5F', name: '狂気の実験体', image: 'assets/images/demon/demon12.png', hp: 170, atk: 42, def: 4, weakness: [9], agi: 16 }
        ];
        const chosenEnemy = demonTypes[Math.floor(Math.random() * demonTypes.length)];
        onEncounter({ ...chosenEnemy });
    }
}

export function handleEvent5F(targetCell, gameState, context) {
    syncMapState(gameState);
    
    // 3: エレベーター
    if (targetCell === 3) {
        return {
            run: (onComplete) => {
                const evModal = document.createElement("div");
                evModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-family: monospace;";
                
                let html = `<h2 style="color: #66ccff; margin-bottom: 20px;">【エレベーター】</h2>`;
                html += `<button class="ev-btn" data-floor="1" style="width: 200px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.2em; cursor: pointer;">1F (エントランス)</button>`;
                html += `<button class="ev-btn" data-floor="3" style="width: 200px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.2em; cursor: pointer;">3F (汚染フロア)</button>`;
                html += `<button class="ev-btn" data-floor="5" style="width: 200px; padding: 15px; margin: 5px; background: #004400; color: #00ff66; border: 1px solid #00ff66; font-size: 1.2em; cursor: pointer;">5F (現在地)</button>`;
                html += `<button id="ev-cancel" style="width: 200px; padding: 15px; margin-top: 20px; background: #440000; color: #ff6666; border: 1px solid #ff3333; cursor: pointer;">閉じる</button>`;
                evModal.innerHTML = html;
                document.body.appendChild(evModal);

                document.getElementById("ev-cancel").onclick = () => { evModal.remove(); onComplete(); };
                evModal.querySelectorAll(".ev-btn").forEach(btn => {
                    btn.onclick = () => {
                        const f = parseInt(btn.getAttribute("data-floor"), 10);
                        evModal.remove();
                        if (f === 5) {
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

    // 5: 北側の非常階段（4階へ降りる）
    if (targetCell === 5) {
        return {
            run: (onComplete) => {
                showMessageDialog("【非常階段】\n4階へ降りますか？", () => {
                    gameState.lastTransitMethod = 'stair_down';
                    playFloorTransition(4, () => {
                        context.changeFloor(4);
                        onComplete();
                    });
                });
            }
        };
    }

    // 4: 南側の非常階段（6階へ昇る）
    if (targetCell === 4) {
        if (!gameState.isHirunumaDefeated) {
            return {
                run: (onComplete) => showMessageDialog("【6階への非常階段】\n生体実験の醜悪な肉塊と蔦が階段を強固に塞いでいる……。\nフロアの元凶（ドクター蛭沼）を排除しなければ先へ進めない。", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    showMessageDialog("【非常階段】\n6階へ昇りますか？", () => {
                        gameState.lastTransitMethod = 'stair';
                        playFloorTransition(6, () => {
                            context.changeFloor(6);
                            onComplete();
                        });
                    });
                }
            };
        }
    }

    // 2: 各種イベント部屋（座標分岐）
    if (targetCell === 2) {
        const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
        const vec = dirVectors[gameState.player.dir];
        const frontX = gameState.player.x + vec.x;
        const frontY = gameState.player.y + vec.y;

        // X=11, Y=0: 501号室（看護師）
        if (frontX === 11 && frontY === 0) {
            return { run: (onComplete) => handleRoom501(gameState, context, onComplete) };
        }
        // X=14, Y=3: ウサギの覗き窓
        if (frontX === 14 && frontY === 3) {
            return { run: (onComplete) => handlePeekHole(gameState, context, onComplete) };
        }
        // X=13, Y=7: トランプキメラ（通せんぼ）
        if (frontX === 13 && frontY === 7) {
            return { run: (onComplete) => handleTrumpChimera(gameState, context, onComplete) };
        }
        // X=7, Y=7: アリス老婆（通せんぼ）
        if (frontX === 7 && frontY === 7) {
            return { run: (onComplete) => handleAliceGranny(gameState, context, onComplete) };
        }
        // X=3, Y=7: ウサギ助手決戦（行き止まり）
        if (frontX === 3 && frontY === 7) {
            return { run: (onComplete) => handleRabbitBoss(gameState, context, onComplete) };
        }
        // X=7, Y=3: 最奥実験室（父親・蛭沼）
        if (frontX === 7 && frontY === 3) {
            return { run: (onComplete) => handleBossLab54(gameState, context, onComplete) };
        }
    }

    return null;
}

// ----------------------------------------------------
// イベントサブルーチン
// ----------------------------------------------------

// ① 501号室（看護師）
function handleRoom501(gameState, context, onComplete) {
    if (gameState.hasRescued501) {
        showMessageDialog("【501号室 看護師】\n「先生、無事で……！ 奥で苦しんでいる人たちを早く助けてあげてください……！」", onComplete);
        return;
    }
    showConversationDialog(
        "assets/images/kangosi.png",
        "【震える看護師】\n「ひっ……！ 殺さないで！ 私はただの看護師です……！ 蛭沼先生に逆らったら実験台にされそうになって……！」\n\n（※この人物をどうする？）",
        () => {
            const entity = {
                type: "human",
                name: "震える看護師",
                faceImage: "assets/images/kangosi.png",
                dialogue: "「助けてくれてありがとう……！ あの医者、自分の頭脳を神だと思い込んでいて、右手の手術メスで生体を切り刻んでいるの。」\n\n「奴の【頭部（上段）に『聖書（5）』】、【凶器の腕（右）に『銀の杭（9）』】を打ち込めば動きを止められるはずよ！」"
            };
            openInquisitionUI(entity, gameState, (res) => {
                if (res === "finish" || res === "combat_win" || res === "kill_human") {
                    gameState.hasRescued501 = true;
                    onComplete();
                } else {
                    onComplete();
                }
            }, context);
        }
    );
}

// ② ウサギの覗き窓
function handlePeekHole(gameState, context, onComplete) {
    if (gameState.flags.rabbitChaseStep > 0) {
        showMessageDialog("【実験室】\n部屋の中はもぬけの殻だ。ウサギの頭をした男は奥へ逃げてしまった。", onComplete);
        return;
    }
    showMessageDialog("【覗き窓】\n窓から中を覗くと、白衣を着た「ウサギの頭部を持つ男」がメスを片手にブツブツ呟いている。\n\n……プレイヤーの気配に気づいたウサギが、ギョロッと目を剥いた！", () => {
        showConversationDialog(
            "assets/images/demon/5f-kimera.png",
            "【ウサギの助手】\n「ひぃっ、侵入者だ！ アリス！ トランプ共！ 侵入者をバラバラにしろ！」",
            () => {
                gameState.flags.rabbitChaseStep = 1;
                showMessageDialog("ウサギの助手は裏口から廊下へ逃走した！\n連動してセキュリティが解除され、南側通路の扉が開いた音がする……！", onComplete);
            }
        );
    });
}

// ③ トランプキメラ（13,7）
function handleTrumpChimera(gameState, context, onComplete) {
    if (gameState.flags.rabbitChaseStep === 0) {
        showMessageDialog("【強固な電子扉】\nロックがかかっている。どこかでセキュリティを解除する必要があるようだ。", onComplete);
        return;
    }
    showMessageDialog("【通路を塞ぐ肉塊】\n通路の先に、皮膚にトランプの絵柄を縫い付けられた異形のキメラが立ち塞がっている。", () => {
        showConversationDialog(
            "assets/images/demon/5f-kimera.png",
            "【ウサギの助手（奥からの声）】\n「そいつは人間と無機物のキメラを試してみたんだぴょーん、僕ちゃん天才でしょ？」",
            () => {
                const trumpEnemy = { 
                    name: 'トランプキメラ', image: 'assets/images/demon/trump.png', 
                    hp: 400, atk: 42, def: 15, weakness: [4], agi: 10 
                };
                openCombatUI(trumpEnemy, gameState, (res) => {
                    if (res === 'win' || res === 'combat_win') {
                        gameState.flags.rabbitChaseStep = 2;
                        map5F[7][13] = 0; // 通路を開放
                        showConversationDialog(
                            "assets/images/demon/5f-kimera.png",
                            "【ウサギの助手（奥からの声）】\n「あわわ、かわいそうでしょ、この外道」",
                            () => {
                                showMessageDialog("トランプキメラの死体を乗り越え、さらに奥へ進めるようになった！", onComplete);
                            }
                        );
                    } else {
                        onComplete();
                    }
                }, context);
            }
        );
    });
}

// ④ アリス老婆（7,7）
function handleAliceGranny(gameState, context, onComplete) {
    showMessageDialog("【大部屋の悪霊】\nフリルだらけの少女服を無理やり着せられた、顔中シワだらけの老婆悪魔が濃硫酸を撒き散らしている！", () => {
        showConversationDialog(
            "assets/images/demon/5f-kimera.png",
            "【ウサギの助手（さらに奥からの声）】\n「それ、女の子に老婆のアタマをつけてみたんだけど、変だよねぇ、ギャハハハハ」",
            () => {
                const aliceEnemy = { 
                    name: 'アリス服の老婆悪魔', image: 'assets/images/demon/alice.png', 
                    hp: 450, atk: 48, def: 12, weakness: [7], agi: 12 
                };
                openCombatUI(aliceEnemy, gameState, (res) => {
                    if (res === 'win' || res === 'combat_win') {
                        gameState.flags.rabbitChaseStep = 3;
                        map5F[7][7] = 0; // 通路を開放
                        showConversationDialog(
                            "assets/images/demon/5f-kimera.png",
                            "【ウサギの助手（焦った声）】\n「な、何だよお前、リナちゃんがくれた中年男と同じように鶏と合体させてやるぞ、お前は頭を鶏にしてやるからな」",
                            () => {
                                showMessageDialog("老婆の悪魔が黒い灰となって消え去り、西への通路が開けた！", onComplete);
                            }
                        );
                    } else {
                        onComplete();
                    }
                }, context);
            }
        );
    });
}

// ⑤ ウサギ助手決戦（3,7）
function handleRabbitBoss(gameState, context, onComplete) {
    showMessageDialog("【行き止まりの薬品庫】\nついに逃げ場を失ったウサギの助手を追い詰めた！", () => {
        showConversationDialog(
            "assets/images/demon/5f-kimera.png",
            "【ウサギの助手】\n「見てくださいよ、僕だって蛭沼のやつに改造されたんですよ、被害者ですよ、あいつ、『究極の医療を完成させて自分が神である証明をする』とかイカれてるんですよ、見逃してくださいよ……バカめ、スキを見せたな！」",
            () => {
                const rabbitEnemy = { 
                    name: 'キメラ化した助手', image: 'assets/images/demon/5f-kimera.png', 
                    hp: 420, atk: 55, def: 5, weakness: [2, 9], agi: 18 // 超高素早さ
                };
                openCombatUI(rabbitEnemy, gameState, (res) => {
                    if (res === 'win' || res === 'combat_win') {
                        gameState.flags.rabbitChaseStep = 4;
                        gameState.hasKeyLab5F = true;
                        map5F[7][3] = 0; // 中央への道を開放
                        showMessageDialog("ウサギの助手を討ち倒した！\n奴の懐から『最奥実験室の鍵』と『実験記録の切れ端』が落ちた。", () => {
                            showItemAcquiredModal(
                                "assets/images/cards/5Card.png",
                                "『最奥実験室の鍵』と『記録メモ』",
                                "【実験記録の切れ端】\n「……結界を崩す術式数値は4マスの合計で『20』。【真実を映す鏡（2）】と【神への権威を否定する十字架（4）】を埋め込めば陣は崩壊する……」",
                                onComplete
                            );
                        });
                    } else {
                        onComplete();
                    }
                }, context);
            }
        );
    });
}

// ⑥ 最奥実験室（父親 ➔ 蛭沼 連戦）
function handleBossLab54(gameState, context, onComplete) {
    if (gameState.isHirunumaDefeated) {
        showMessageDialog("【最奥実験室】\n狂気の生体実験装置は停止し、静寂が漂っている。", onComplete);
        return;
    }
    if (!gameState.hasKeyLab5F) {
        showMessageDialog("【最奥実験室の扉】\n分厚い防護扉が固く閉ざされている。\n解錠するには『最奥実験室の鍵』が必要のようだ。", onComplete);
        return;
    }

    showMessageDialog("【最奥実験室】\n扉を開けると、手術台の前に変わり果てた姿の男が鎖に繋がれていた……。", () => {
        showConversationDialog(
            "assets/images/demon/5f-father.png",
            "【キメラ化した父親】\n「息子ハ…息子ハ、ブジか…コロシテ…モウ、ダメダ…理性ガ…」",
            () => {
                const fatherEnemy = { 
                    name: 'キメラ化した父親', image: 'assets/images/demon/5f-father.png', 
                    hp: 480, atk: 50, def: 15, weakness: [3], agi: 14 
                };
                openCombatUI(fatherEnemy, gameState, (res) => {
                    if (res === 'win' || res === 'combat_win') {
                        gameState.isFatherRescued = true;
                        showMessageDialog("【父親の救出】\n異形の肉体が崩れ、人間の姿を取り戻した父親が気を失って倒れ込んだ。\n微かに息はある……助かったんだ！", () => {
                            playVideo("assets/images/demon/5f-hirunuma.mp4", () => {
                                showConversationDialog(
                                    "assets/images/demon/5f-hirunuma.png",
                                    "【ドクター蛭沼】\n「俺は選ばれた、生物を合体させて進化させることができるのだ、神だよ、お前も俺を神と称えよ」",
                                    () => {
                                        const puzzleConfig = {
                                            title: "【魔方陣術式】ドクター蛭沼の生体結界",
                                            subTitle: "看護師の助言と実験記録のヒントから、術式を崩すラミナカードを配置せよ",
                                            bossName: "蛭沼",
                                            slots: [
                                                { id: "slot-top", label: "頭部(上)", gridPos: "grid-area: 1 / 2;" },
                                                { id: "slot-right", label: "凶器(右)", gridPos: "grid-area: 2 / 3;" },
                                                { id: "slot-left", label: "左腕", gridPos: "grid-area: 2 / 1;" },
                                                { id: "slot-bottom", label: "心臓(下)", gridPos: "grid-area: 3 / 2;" }
                                            ]
                                        };

                                        openBossPuzzleUI(puzzleConfig, gameState, (slots) => {
                                            const getCardNum = (slotId) => {
                                                const cardStr = slots[slotId] || "";
                                                const num = parseInt(cardStr.replace("Card.png", ""), 10);
                                                return isNaN(num) ? 0 : num;
                                            };
                                            const topVal = getCardNum("slot-top");
                                            const rightVal = getCardNum("slot-right");
                                            const leftVal = getCardNum("slot-left");
                                            const bottomVal = getCardNum("slot-bottom");

                                            let isPerfectSuccess = false;
                                            if (topVal === 5 && rightVal === 9) {
                                                if ((leftVal === 2 && bottomVal === 4) || (leftVal === 4 && bottomVal === 2)) {
                                                    isPerfectSuccess = true;
                                                }
                                            }

                                            const hirunumaEnemy = { 
                                                name: 'ドクター蛭沼', image: 'assets/images/demon/5f-hirunuma.png', 
                                                hp: isPerfectSuccess ? 600 : 1200, 
                                                atk: isPerfectSuccess ? 45 : 70, 
                                                def: isPerfectSuccess ? 12 : 25, 
                                                weakness: [5, 9], agi: 15
                                            };

                                            const startBossBattle = () => {
                                                openCombatUI(hirunumaEnemy, gameState, (bossRes) => {
                                                    if (bossRes === 'win' || bossRes === 'combat_win') {
                                                        gameState.isHirunumaDefeated = true;
                                                        showConversationDialog(
                                                            "assets/images/demon/5f-hirunuma.png",
                                                            "【瀕死の蛭沼】\n「違う、あの子が歩けなくなったのは俺の執刀ミスのせいじゃない、治せる、俺は治せるんだ……」",
                                                            () => {
                                                                showMessageDialog("【黒猫の失踪】\n倒れた蛭沼を背に、父親を介抱しようとしたその時――\n足元にいた黒猫がするりと身を翻し、開いた非常階段（6階）へ駆け上がっていってしまった！\n\n主人公「おい、待て！……くそっ、放っておくわけにはいかない！」", onComplete);
                                                            }
                                                        );
                                                    } else {
                                                        onComplete();
                                                    }
                                                }, context);
                                            };

                                            if (isPerfectSuccess) {
                                                showMessageDialog("【術式解呪成功！】\n魔方陣が激しく展開し、蛭沼の肉体結合が弱体化した！（HP・能力半減！）", () => {
                                                    playVideo("assets/videos/magic-circle.mp4", () => {
                                                        startBossBattle();
                                                    });
                                                });
                                            } else {
                                                showMessageDialog("【術式解呪失敗……！】\n術式が暴走し、完全体となった蛭沼が襲いかかってくる！", () => {
                                                    startBossBattle();
                                                });
                                            }
                                        });
                                    }
                                );
                            });
                        });
                    } else {
                        onComplete();
                    }
                }, context);
            }
        );
    });
}