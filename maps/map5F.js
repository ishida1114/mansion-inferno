// maps/map5F.js - 5階（傲慢・生体実験フロア）完全統合版 ＋ エレベーター追加

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, playFloorTransition 
} from '../ui.js';
import { ENEMIES, evaluateHirunumaPuzzle } from '../enemies.js';
// ※戦闘処理はメインの openCombatUI などを context 経由で呼び出す想定に変更

// 5階開始位置 (x: 7, y: 1, 南向き)
export const playerStart5F = { x: 7, y: 1, dir: 2 };

// 5階マップ構造 (15 x 9)
// 1: 壁 / 0: 通路
// 3: エレベーター (x:2, y:1)  <-- ★新規追加
// 4: 4階への非常階段 (降り: x:7, y:0)
// 6: 6階への非常階段 (昇り: x:7, y:8)
// 51: 501号室（査問：看護師・人間）
// 52: 502号室（査問：助手悪魔・計算ヒント所持）
// 53: 隔離実験室（ギミック中ボス：改造キメラ人間・鍵所持）
// 54: 最奥実験室の扉（鍵チェック ➔ 父親・蛭沼連戦）
export const map5F = [
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 51, 1, 0, 1, 53, 1, 0, 1, 52, 1, 0, 1],
    [1, 0, 1,  1, 1, 0, 1,  1, 1, 0, 1,  1, 1, 0, 1],
    [1, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 1],
    [1, 0, 1,  1, 1, 0, 1, 54, 1, 0, 1,  1, 1, 0, 1],
    [1, 0, 1,  1, 1, 0, 1,  1, 1, 0, 1,  1, 1, 0, 1],
    [1, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 1, 1, 1]
];

export function handleEvent5F(targetCell, gameState, context) {
    // 5F進入時（初回のみ）の独白＆使い魔実体化イベントチェック
    if (!gameState.hasSeen5FIntro) {
        return {
            run: (onComplete) => trigger5FEntranceEvent(gameState, onComplete)
        };
    }

    // ★ 3: エレベーター（行き来可能）
    if (targetCell === 3) {
        return {
            run: (onComplete) => {
                const evModal = document.createElement("div");
                evModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-family: monospace;";
                
                let html = `<h2 style="color: #66ccff; margin-bottom: 20px;">【エレベーター】</h2>`;
                
                // 1F, 3F, 5Fボタンを配置
                html += `<button class="ev-btn" data-floor="1" style="width: 200px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.2em; cursor: pointer;">1F (エントランス)</button>`;
                html += `<button class="ev-btn" data-floor="3" style="width: 200px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.2em; cursor: pointer;">3F (汚染フロア)</button>`;
                html += `<button class="ev-btn" data-floor="5" style="width: 200px; padding: 15px; margin: 5px; background: #004400; color: #00ff66; border: 1px solid #00ff66; font-size: 1.2em; cursor: pointer;">5F (現在地)</button>`;
                
                html += `<button id="ev-cancel" style="width: 200px; padding: 15px; margin-top: 20px; background: #440000; color: #ff6666; border: 1px solid #ff3333; cursor: pointer;">閉じる</button>`;
                evModal.innerHTML = html;
                document.body.appendChild(evModal);

                document.getElementById("ev-cancel").onclick = () => {
                    evModal.remove();
                    onComplete();
                };

                evModal.querySelectorAll(".ev-btn").forEach(btn => {
                    btn.onclick = () => {
                        const f = parseInt(btn.getAttribute("data-floor"), 10);
                        evModal.remove();
                        if (f === 5) {
                            onComplete(); // 現在地なので何もしない
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
    if (targetCell === 4) {
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

    // 6: 6階へ上がる階段
    if (targetCell === 6) {
        if (!gameState.isHirunumaDefeated) {
            return {
                run: (onComplete) => showMessageDialog(
                    "【6階への非常階段】\n生体実験の醜悪な肉塊と蔦が階段を強固に塞いでいる……。\nフロアの元凶を排除しなければ先へ進めない。",
                    onComplete
                )
            };
        } else {
            return {
                run: (onComplete) => {
                    gameState.lastTransitMethod = 'stair';
                    playFloorTransition(6, () => {
                        context.changeFloor(6);
                        onComplete();
                    });
                }
            };
        }
    }

    // 51: 501号室（査問：看護師）
    if (targetCell === 51) {
        return { run: (onComplete) => handleRoom501(gameState, context, onComplete) };
    }

    // 52: 502号室（査問：助手悪魔）
    if (targetCell === 52) {
        return { run: (onComplete) => handleRoom502(gameState, context, onComplete) };
    }

    // 53: 隔離実験室（改造キメラ人間）
    if (targetCell === 53) {
        return { run: (onComplete) => handleRoom53(gameState, context, onComplete) };
    }

    // 54: 最奥実験室（父親 ＆ 蛭沼連戦）
    if (targetCell === 54) {
        return { run: (onComplete) => handleBossLab54(gameState, context, onComplete) };
    }

    return null;
}

// ----------------------------------------------------
// イベントサブルーチン
// ----------------------------------------------------

// 5F進入時初回演出（蛭沼独白 ＆ 黒猫実体化動画）
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

// 501号室：看護師（正解：保護 ➔ 部位ヒント）
function handleRoom501(gameState, context, onComplete) {
    if (gameState.hasRescued501) {
        showMessageDialog("【501号室 看護師】\n「先生、無事で……！ 奥で苦しんでいる人たちを早く助けてあげてください……！」", onComplete);
        return;
    }

    showConversationDialog(
        "assets/images/kangosi.png",
        "【震える看護師】\n「ひっ……！ 殺さないで！ 私はただの看護師です……！ 蛭沼先生に逆らったら実験台にされそうになって……！」\n\n（※この人物をどうする？）",
        () => {
            // ★ ui.jsの openInquisitionUI を呼び出して判断を委ねる形に変更
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
                // フォールバック
                gameState.hasRescued501 = true;
                showMessageDialog("【看護師を保護した】\n" + entity.dialogue, onComplete);
            }
        }
    );
}

// 502号室：助手悪魔（正解：撃退 ➔ 計算ヒント）
function handleRoom502(gameState, context, onComplete) {
    if (gameState.hasCleared502) {
        showMessageDialog("【502号室】\n実験記録が散乱した冷たい部屋。もう悪魔の気配はない。", onComplete);
        return;
    }

    showConversationDialog(
        "assets/images/demon/5f-kimera.png",
        "【キメラ化した助手】\n「私は蛭沼先生の研究助手です……。ここは危険です、私を安全な場所へ連れて行ってください……」\n\n（※カードをかざすと、男の影が引き攣るように蠢いた！ 悪魔だ！）",
        () => {
            const demonEnemy = { ...ENEMIES.DEVIL10_5F };
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

// 53: 隔離実験室（改造キメラ人間・鍵入手）
function handleRoom53(gameState, context, onComplete) {
    if (gameState.hasKeyLab5F) {
        showMessageDialog("【隔離実験室】\n正気を取り戻した住人が息を整えている。\n「私は大丈夫です……！ 早く奥の部屋へ……！」", onComplete);
        return;
    }

    showMessageDialog("【隔離実験室】\n異形の肉塊が苦悶の声をあげて鎖を引きちぎり、襲いかかってきた！", () => {
        const kimeraEnemy = { ...ENEMIES.KIMERA_HUMAN_5F };
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

// 54: 最奥実験室（父親 ➔ 蛭沼 連戦）
function handleBossLab54(gameState, context, onComplete) {
    if (gameState.isHirunumaDefeated) {
        showMessageDialog("【最奥実験室】\n狂気の生体実験装置は停止し、静寂が漂っている。", onComplete);
        return;
    }

    if (!gameState.hasKeyLab5F) {
        showMessageDialog("【最奥実験室の扉】\n分厚い防護扉が固く閉ざされている。\n解錠するには『最奥実験室の鍵』が必要のようだ。", onComplete);
        return;
    }

    // --- 連戦第1弾：キメラ化した父親（パズルなし） ---
    showMessageDialog("【最奥実験室】\n扉を開けると、手術台の前に変わり果てた姿の男が鎖に繋がれていた……。", () => {
        showConversationDialog(
            "assets/images/demon/5f-father.png",
            "【キメラ化した父親】\n「息子ハ…息子ハ、ブジか…コロシテ…モウ、ダメダ…理性ガ…」",
            () => {
                const fatherEnemy = { ...ENEMIES.FATHER_5F };
                if (context.startCombat) {
                    context.startCombat(fatherEnemy, (res) => {
                        if (res === 'win' || res === 'combat_win') {
                            gameState.isFatherRescued = true;
                            showMessageDialog(
                                "【父親の救出】\n異形の肉体が崩れ、人間の姿を取り戻した父親が気を失って倒れ込んだ。\n微かに息はある……助かったんだ！",
                                () => {
                                    // --- 連戦第2弾：ドクター蛭沼（パズルあり） ---
                                    playVideo("assets/videos/5f-hirunuma.mp4", () => {
                                        showConversationDialog(
                                            "assets/images/demon/5f-hirunuma.png",
                                            "【ドクター蛭沼】\n「俺は選ばれた、生物を合体させて進化させることができるのだ、神だよ、お前も俺を神と称えよ」",
                                            () => {
                                                const hirunumaEnemy = { ...ENEMIES.HIRUNUMA_5F };
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
                                                } else if (context.startCombat) {
                                                    // フォールバック
                                                    context.startCombat(hirunumaEnemy, (bossRes) => {
                                                        if (bossRes === 'win' || bossRes === 'combat_win') {
                                                            gameState.isHirunumaDefeated = true;
                                                            showMessageDialog("【討滅】ドクター蛭沼を浄化した。", onComplete);
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