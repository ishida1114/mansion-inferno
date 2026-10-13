// maps/map5F.js - ドア画像表示対応・敵エンカウント追加・階段画像修正版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, playFloorTransition 
} from '../ui.js';
import { ENEMIES, evaluateHirunumaPuzzle } from '../enemies.js';

// 5階開始位置 (x: 7, y: 1, 南向き)
export const playerStart5F = { x: 7, y: 1, dir: 2 };

// 5階マップ構造 (15 x 9)
// 1: 壁 / 0: 通路
// 3: エレベーター (x:2, y:1) 
// 4: 4階への非常階段 (降り: x:7, y:0)
// 5: 6階への非常階段 (昇り: x:7, y:8) <-- 6から5（上り階段画像）に変更
// 8: 査問/イベント部屋（システムがドア画像として認識する番号を使用）
export const map5F = [
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 8, 1, 0, 1, 8, 1, 0, 1, 8, 1, 0, 1], // 左から: 501号室(x:3), 隔離実験室(x:7), 502号室(x:11)
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 8, 1, 0, 1, 1, 1, 0, 1], // 最奥実験室(x:7)
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1]  // 6F行き階段（番号5）
];

// ★ 5F専用のランダムエンカウント処理（敵が出ない問題を修正）
export function check5FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 5) return;
    
    // 歩くたびに15%の確率で敵が出現
    if (Math.random() < 0.15) {
        // demon10, demon11, demon12 に相当する敵データを生成
        const demonTypes = [
            { id: 'DEVIL10_5F', name: '徘徊するキメラ', image: 'assets/images/demon/demon10.png', hp: 45, atk: 12, def: 2, weakness: [4, 7] },
            { id: 'DEVIL11_5F', name: '失敗作の肉塊', image: 'assets/images/demon/demon11.png', hp: 50, atk: 14, def: 3, weakness: [1, 6] },
            { id: 'DEVIL12_5F', name: '狂気の実験体', image: 'assets/images/demon/demon12.png', hp: 40, atk: 16, def: 1, weakness: [9] }
        ];
        
        const chosenEnemy = demonTypes[Math.floor(Math.random() * demonTypes.length)];
        onEncounter({ ...chosenEnemy });
    }
}

export function handleEvent5F(targetCell, gameState, context) {
    if (!gameState.hasSeen5FIntro) {
        return { run: (onComplete) => trigger5FEntranceEvent(gameState, onComplete) };
    }

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

    // 4: 4階へ降りる階段
  // 4: 4階へ降りる階段
    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                // ★ 降りるフラグを明示的にセット
                gameState.lastTransitMethod = 'stair_down'; 
                playFloorTransition(4, () => {
                    context.changeFloor(4); // ★ここは4
                    onComplete();
                });
            }
        };
    }

    // 5: 6階へ上がる階段
    if (targetCell === 5) {
        if (!gameState.isHirunumaDefeated) {
            return {
                run: (onComplete) => showMessageDialog("【6階への非常階段】\n生体実験の醜悪な肉塊と蔦が階段を強固に塞いでいる……。", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    gameState.lastTransitMethod = 'stair';
                    playFloorTransition(6, () => {
                        context.changeFloor(6); // ★ここは6
                        onComplete();
                    });
                }
            };
        }
    }

    // 8: 各種イベント部屋（座標でどの部屋かを判定）
    if (targetCell === 8) {
        // プレイヤーの目の前の座標を計算
        const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
        const vec = dirVectors[gameState.player.dir];
        const frontX = gameState.player.x + vec.x;
        const frontY = gameState.player.y + vec.y;

        // X=3, Y=2 なら 501号室（看護師）
        if (frontX === 3 && frontY === 2) {
            return { run: (onComplete) => handleRoom501(gameState, context, onComplete) };
        }
        // X=7, Y=2 なら 隔離実験室（キメラ人間・鍵）
        if (frontX === 7 && frontY === 2) {
            return { run: (onComplete) => handleRoom53(gameState, context, onComplete) };
        }
        // X=11, Y=2 なら 502号室（助手）
        if (frontX === 11 && frontY === 2) {
            return { run: (onComplete) => handleRoom502(gameState, context, onComplete) };
        }
        // X=7, Y=5 なら 最奥実験室（ボス連戦）
        if (frontX === 7 && frontY === 5) {
            return { run: (onComplete) => handleBossLab54(gameState, context, onComplete) };
        }
    }

    return null;
}

// ----------------------------------------------------
// イベントサブルーチン
// ----------------------------------------------------

function trigger5FEntranceEvent(gameState, onComplete) {
    gameState.hasSeen5FIntro = true;
    showMessageDialog(
        "【館内放送・ドクター蛭沼の声】\n「失敗だな、リナからもらった実験体、とても進化とは言えない、醜い、廃棄しなくては……」",
        () => {
            if (gameState.player.level >= 15 || gameState.playerLevel >= 15) {
                const prevBg = document.body.style.backgroundColor;
                document.body.style.backgroundColor = "#141418";

                playVideo("assets/videos/blackcat.mp4", () => {
                    document.body.style.backgroundColor = prevBg;
                    showMessageDialog(
                        "【使い魔の実体化】\n5階に充満する濃厚な生体エネルギーに反応し、主人公の影からすっと黒猫が実体化して現れた！\n（※足元に寄り添い、戦闘中に身を挺して庇ってくれたり、追撃してくれたりするようになった！）",
                        onComplete
                    );
                });
            } else {
                onComplete();
            }
        }
    );
}

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
            if (context.openInquisitionUI) {
                context.openInquisitionUI(entity, gameState, (res) => {
                    if (res === "finish" || res === "combat_win" || res === "kill_human") {
                        gameState.hasRescued501 = true;
                        onComplete();
                    } else {
                        onComplete();
                    }
                });
            } else {
                gameState.hasRescued501 = true;
                showMessageDialog("【看護師を保護した】\n" + entity.dialogue, onComplete);
            }
        }
    );
}

function handleRoom502(gameState, context, onComplete) {
    if (gameState.hasCleared502) {
        showMessageDialog("【502号室】\n実験記録が散乱した冷たい部屋。もう悪魔の気配はない。", onComplete);
        return;
    }
    showConversationDialog(
        "assets/images/demon/5f-kimera.png",
        "【キメラ化した助手】\n「私は蛭沼先生の研究助手です……。ここは危険です、私を安全な場所へ連れて行ってください……」\n\n（※カードをかざすと、男の影が引き攣るように蠢いた！ 悪魔だ！）",
        () => {
            const demonEnemy = { 
                name: 'キメラ化した助手', 
                image: 'assets/images/demon/5f-kimera.png', 
                hp: 60, atk: 15, def: 2, weakness: [4] 
            };
            if (context.startCombat) {
                context.startCombat(demonEnemy, (res) => {
                    if (res === 'win' || res === 'combat_win') {
                        gameState.hasCleared502 = true;
                        showItemAcquiredModal(
                            "assets/images/cards/5Card.png",
                            "『実験記録の切れ端』",
                            "悪魔の懐からメモを見つけた！\n「……結界を崩す術式数値は4マスの合計で『20』。【真実を映す鏡（2）】と【神への権威を否定する十字架（4）】を埋め込めば陣は崩壊する……」",
                            onComplete
                        );
                    } else {
                        onComplete();
                    }
                });
            } else {
                onComplete();
            }
        }
    );
}

function handleRoom53(gameState, context, onComplete) {
    if (gameState.hasKeyLab5F) {
        showMessageDialog("【隔離実験室】\n正気を取り戻した住人が息を整えている。\n「私は大丈夫です……！ 早く奥の部屋へ……！」", onComplete);
        return;
    }
    showMessageDialog("【隔離実験室】\n異形の肉塊が苦悶の声をあげて鎖を引きちぎり、襲いかかってきた！", () => {
        const kimeraEnemy = { 
            name: '暴走キメラ人間', 
            image: 'assets/images/demon/demon11.png', 
            hp: 80, atk: 18, def: 4, weakness: [7] 
        };
        if (context.startCombat) {
            context.startCombat(kimeraEnemy, (res) => {
                if (res === 'win' || res === 'combat_win') {
                    gameState.hasKeyLab5F = true;
                    showConversationDialog(
                        "assets/images/human1.png",
                        "【正気に戻った住人】\n「う……あ……私ハ……？ 意識が戻った……？ 倒して、助けてくれたのか……！」\n\n「あいつは……ドクター蛭沼は、さらに奥の部屋で別の人間を実験台にしている……！ この鍵を持って行ってくれ……！」",
                        () => {
                            showItemAcquiredModal(
                                "assets/images/cards/9Card.png",
                                "最奥実験室の鍵",
                                "『最奥実験室の鍵』を受け取った！\n（主人公の確信: 「倒せば正気に戻せる……！ なら、生徒の父親も絶対に救い出せるはずだ！」）",
                                onComplete
                            );
                        }
                    );
                } else {
                    onComplete();
                }
            });
        } else {
            onComplete();
        }
    });
}

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
                    name: 'キメラ化した父親', 
                    image: 'assets/images/demon/5f-father.png', 
                    hp: 120, atk: 25, def: 5, weakness: [3] 
                };
                if (context.startCombat) {
                    context.startCombat(fatherEnemy, (res) => {
                        if (res === 'win' || res === 'combat_win') {
                            gameState.isFatherRescued = true;
                            showMessageDialog(
                                "【父親の救出】\n異形の肉体が崩れ、人間の姿を取り戻した父親が気を失って倒れ込んだ。\n微かに息はある……助かったんだ！",
                                () => {
                                    playVideo("assets/videos/5f-hirunuma.mp4", () => {
                                        showConversationDialog(
                                            "assets/images/demon/5f-hirunuma.png",
                                            "【ドクター蛭沼】\n「俺は選ばれた、生物を合体させて進化させることができるのだ、神だよ、お前も俺を神と称えよ」",
                                            () => {
                                                const hirunumaEnemy = { 
                                                    name: 'ドクター蛭沼', 
                                                    image: 'assets/images/demon/5f-hirunuma.png', 
                                                    hp: 400, atk: 35, def: 8, weakness: [5, 9] 
                                                };
                                                if (context.startBossCombat) {
                                                    context.startBossCombat(hirunumaEnemy, (bossRes) => {
                                                        if (bossRes === 'win' || bossRes === 'combat_win') {
                                                            gameState.isHirunumaDefeated = true;
                                                            showConversationDialog(
                                                                "assets/images/demon/5f-hirunuma.png",
                                                                "【瀕死の蛭沼】\n「違う、あの子が歩けなくなったのは俺の執刀ミスのせいじゃない、治せる、俺は治せるんだ……」",
                                                                () => {
                                                                    showMessageDialog(
                                                                        "【黒猫の失踪】\n倒れた蛭沼を背に、父親を介抱しようとしたその時――\n足元にいた黒猫がするりと身を翻し、開いた非常階段（6階）へ駆け上がっていってしまった！\n\n主人公「おい、待て！……くそっ、放っておくわけにはいかない！」",
                                                                        onComplete
                                                                    );
                                                                }
                                                            );
                                                        } else {
                                                            onComplete();
                                                        }
                                                    });
                                                } else {
                                                    onComplete();
                                                }
                                            }
                                        );
                                    });
                                }
                            );
                        } else {
                            onComplete();
                        }
                    });
                } else {
                    onComplete();
                }
            }
        );
    });
}