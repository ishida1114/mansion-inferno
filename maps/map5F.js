// maps/map5F.js - エレベーター順序・報酬適正化・悪魔手記連携・5Fクリアフラグ・父親スキップ＆80%削減対応 完全版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, playFloorTransition, openCombatUI, openInquisitionUI, openBossPuzzleUI 
} from '../ui.js';

// 5階開始位置
export const playerStart5F = { x: 7, y: 1, dir: 1 };

// ★マップ配列（X:14, Y:1 に502号室を追加）
export const map5F = [
    [1, 1, 1, 1, 1, 1, 3, 5, 1, 1, 1, 2, 1, 1, 1], // y=0 (3:エレベーター(6,0), 5:4F下り階段(7,0), 2:501号室(11,0))
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2], // y=1 (Start:7,1。東の突き当り 14,1 が502号室)
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1], // y=2 
    [1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 2], // y=3 (2:最奥実験室(7,3), 2:ウサギ覗き窓(14,3))
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // y=4
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // y=5
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // y=6
    [1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 1], // y=7 (2:ウサギ(3,7), 2:アリス(7,7), 2:トランプ(13,7))
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1]  // y=8 (4:6F上り階段)
];

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
    syncMapState(gameState);
    
    if (Math.random() < 0.15) {
        // ★ 5F基準の適正報酬（120〜140 EXP / 420〜500 円）を設定
        const demonTypes = [
            { id: 'DEVIL10_5F', name: '徘徊するキメラ', image: 'assets/images/demon/demon10.png', hp: 200, atk: 32, def: 5, weakness: [4, 7], agi: 12, rewardExp: 120, rewardMoney: 420 },
            { id: 'DEVIL11_5F', name: '失敗作の肉塊', image: 'assets/images/demon/demon11.png', hp: 240, atk: 35, def: 8, weakness: [1, 6], agi: 10, rewardExp: 130, rewardMoney: 450 },
            { id: 'DEVIL12_5F', name: '狂気の実験体', image: 'assets/images/demon/demon12.png', hp: 170, atk: 42, def: 4, weakness: [9], agi: 16, rewardExp: 140, rewardMoney: 500 }
        ];
        const chosenEnemy = demonTypes[Math.floor(Math.random() * demonTypes.length)];
        onEncounter({ ...chosenEnemy });
    }
}

export function handleEvent5F(targetCell, gameState, context) {
    syncMapState(gameState);
    
    // 3: エレベーター（並び順：上を上の階、下を1階に統一）
    if (targetCell === 3) {
        return {
            run: (onComplete) => {
                const evModal = document.createElement("div");
                evModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-family: monospace;";
                
                const canGo7F = gameState.flags && (
                    gameState.flags.cleared6F || 
                    gameState.flags.cleared7F || 
                    gameState.flags.seen7FIntro || 
                    gameState.flags.unlocked7FElevator
                );

                let html = `<h2 style="color: #66ccff; margin-bottom: 20px;">【エレベーター】</h2>`;
                if (canGo7F) {
                    html += `<button class="ev-btn" data-floor="7" style="width: 240px; padding: 15px; margin: 5px; background: linear-gradient(180deg, #664400, #221100); color: #ffdd66; border: 1px solid #ffcc00; font-size: 1.1em; font-weight: bold; cursor: pointer; box-shadow: 0 0 10px rgba(255,200,0,0.4);">7F (VIPラウンジ)</button>`;
                }
                html += `<button class="ev-btn" data-floor="5" style="width: 240px; padding: 15px; margin: 5px; background: #004400; color: #00ff66; border: 1px solid #00ff66; font-size: 1.1em; cursor: pointer;">5F (現在地)</button>`;
                html += `<button class="ev-btn" data-floor="3" style="width: 240px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.1em; cursor: pointer;">3F (汚染フロア)</button>`;
                html += `<button class="ev-btn" data-floor="1" style="width: 240px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.1em; cursor: pointer;">1F (エントランス)</button>`;
                html += `<button id="ev-cancel" style="width: 240px; padding: 15px; margin-top: 20px; background: #440000; color: #ff6666; border: 1px solid #ff3333; cursor: pointer;">閉じる</button>`;
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
        // X=14, Y=1: 502号室（隔離病室）
        if (frontX === 14 && frontY === 1) {
            return { run: (onComplete) => handleRoom502(gameState, context, onComplete) };
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
            return { run: (onComplete) => handleBossLab5F(gameState, context, onComplete) };
        }
    }

    return null;
}

// ----------------------------------------------------
// イベントサブルーチン
// ----------------------------------------------------

// ① 501号室（看護師・悪魔手記記録対応）
function handleRoom501(gameState, context, onComplete) {
    if (gameState.hasRescued501) {
        showMessageDialog("【501号室 看護師】\n「先生、無事で……！ 奥で苦しんでいる人たちを早く助けてあげてください……！」", onComplete);
        return;
    }
    showConversationDialog(
        "assets/images/kangosi.png",
        "【震える看護師】\n「ひっ……！ 殺さないで！ 私はただの看護師です……！ 蛭沼先生に逆らったら実験台にされそうになって……！」\n\n（※この人物をどうする？）",
        () => {
            const dialogueText = "「助けてくれてありがとう……！ あの医者、自分の頭脳を神だと思い込んでいて、右手の手術メスで生体を切り刻んでいるの。」\n\n「奴の【頭部（上段）に『聖書（5）』】、【凶器の腕（右）に『銀の杭（9）』】を打ち込めば動きを止められるはずよ！」";
            const entity = {
                type: "human",
                name: "震える看護師",
                faceImage: "assets/images/kangosi.png",
                dialogue: dialogueText
            };
            openInquisitionUI(entity, gameState, (res) => {
                if (res === "finish" || res === "combat_win" || res === "kill_human") {
                    gameState.hasRescued501 = true;
                    // ★ 悪魔手記（手帳）への記録
                    if (!gameState.bossHints) gameState.bossHints = [];
                    const hint501 = "【5Fメモ① 看護師の証言】蛭沼の弱点：頭部(上)に『聖書(5)』、凶器の腕(右)に『銀の杭(9)』を打ち込め！";
                    if (!gameState.bossHints.includes(hint501)) {
                        gameState.bossHints.push(hint501);
                    }
                    showMessageDialog("【悪魔手記を更新】\n『看護師の証言（蛭沼攻略メモ①）』が悪魔辞典に記録された！\n\n" + dialogueText, onComplete);
                } else {
                    onComplete();
                }
            }, context);
        }
    );
}

// ② 502号室（隔離病室・生体分離の伏線）
function handleRoom502(gameState, context, onComplete) {
    if (gameState.hasSaved502) {
        showMessageDialog("【502号室 隔離病室】\n人間に戻った男が壁にもたれて荒い息をついている。\n\n「奥の手術室にいる男（父親）を助けてやってくれ……」", onComplete);
        return;
    }
    showMessageDialog("【502号室 隔離病室】\n部屋に入ると、ベッドに縛り付けられていた「異形の肉塊」が拘束を引きちぎり、こちらに襲いかかってきた！", () => {
        const experimentEnemy = { 
            name: '暴走したキメラ', image: 'assets/images/demon/demon11.png', 
            hp: 280, atk: 35, def: 5, weakness: [1, 6], agi: 12,
            rewardExp: 150, rewardMoney: 550
        };
        openCombatUI(experimentEnemy, gameState, (res) => {
            if (res === 'win' || res === 'combat_win') {
                gameState.hasSaved502 = true;
                showMessageDialog("【生体分離現象】\n悪魔の肉塊が崩れ落ちると、中から『人間の男性』が倒れ込んできた！\n\n主人公「……死んでいない。悪魔の部分だけが消え去ったのか？」", () => {
                    showMessageDialog(
                        "【助け出された男性】\n「ハッ……体が、戻った……？\n あんたの撃った弾丸が、悪魔の核だけを浄化してくれたのか……！」\n\n「頼む、奥の手術室に……最近連れてこられた『家庭教師の教え子の父親』がまだ囚われている……！ あのひともその銃で撃ち抜けば、きっと助かるはずだ……！」",
                        () => {
                            showMessageDialog("（なるほど……ラミナカードの神聖な力を使えば、キメラ化された人間を殺さずに救出できるんだ！）", onComplete);
                        }
                    );
                });
            } else {
                onComplete();
            }
        }, context);
    });
}

// ③ ウサギの覗き窓
function handlePeekHole(gameState, context, onComplete) {
    if (gameState.flags.rabbitChaseStep > 0) {
        showMessageDialog("【実験室】\n部屋の中はもぬけの殻だ。ウサギの頭をした男は奥へ逃げてしまった。", onComplete);
        return;
    }
    showMessageDialog("【覗き窓】\n窓から中を覗くと、白衣を着た「ウサギの頭部を持つ男」がメスを片手にブツブツ呟いている。\n\n……こちらの気配に気づいたウサギが、ギョロッと目を剥いた！", () => {
        showConversationDialog(
            "assets/images/demon/5f-kimera.png",
            "【ウサギの助手】\n「ひぃっ、侵入者だ！ アリス！ トランプ！ 侵入者をバラバラにしろ！」",
            () => {
                gameState.flags.rabbitChaseStep = 1;
                showMessageDialog("ウサギの助手は裏口から廊下へ逃走した！\n連動してセキュリティが解除され、南側通路の扉が開いた音がする……！", onComplete);
            }
        );
    });
}

// ④ トランプキメラ（13,7）
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
                    hp: 400, atk: 42, def: 15, weakness: [4], agi: 10,
                    rewardExp: 180, rewardMoney: 650
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

// ⑤ アリス老婆（7,7）
function handleAliceGranny(gameState, context, onComplete) {
    showMessageDialog("【大部屋の悪霊】\nフリルだらけの少女服を無理やり着せられた、顔中シワだらけの老婆悪魔が濃硫酸を撒き散らしている！", () => {
        showConversationDialog(
            "assets/images/demon/5f-kimera.png",
            "【ウサギの助手（さらに奥からの声）】\n「それ、女の子に老婆のアタマをつけてみたんだけど、変だよねぇ、ギャハハハハ」",
            () => {
                const aliceEnemy = { 
                    name: 'アリス服の老婆悪魔', image: 'assets/images/demon/alice.png', 
                    hp: 450, atk: 48, def: 12, weakness: [7], agi: 12,
                    rewardExp: 220, rewardMoney: 750
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

// ⑥ ウサギ助手決戦（3,7・悪魔手記記録対応）
function handleRabbitBoss(gameState, context, onComplete) {
    showMessageDialog("【行き止まりの薬品庫】\nついに逃げ場を失ったウサギの助手を追い詰めた！", () => {
        showConversationDialog(
            "assets/images/demon/5f-kimera.png",
            "【ウサギの助手】\n「見てくださいよ、僕だって蛭沼のやつに改造されたんですよ、被害者ですよ、あいつ、『究極の医療を完成させて自分が神である証明をする』とかイカれてるんですよ、見逃してくださいよ……バカめ、スキを見せたな！」",
            () => {
                const rabbitEnemy = { 
                    name: 'キメラ化した助手', image: 'assets/images/demon/5f-kimera.png', 
                    hp: 420, atk: 55, def: 5, weakness: [2, 9], agi: 18,
                    rewardExp: 260, rewardMoney: 900
                };
                openCombatUI(rabbitEnemy, gameState, (res) => {
                    if (res === 'win' || res === 'combat_win') {
                        gameState.flags.rabbitChaseStep = 4;
                        gameState.hasKeyLab5F = true;
                        map5F[7][3] = 0; // 中央への道を開放
                        
                        // ★ 悪魔手記（手帳）への記録
                        if (!gameState.bossHints) gameState.bossHints = [];
                        const hintRabbit = "【5Fメモ② 実験記録の切れ端】蛭沼の結界：4マスの合計は『20』。左腕と心臓(下)に『鏡(2)』と『十字架(4)』を配置せよ。";
                        if (!gameState.bossHints.includes(hintRabbit)) {
                            gameState.bossHints.push(hintRabbit);
                        }

                        showMessageDialog("ウサギの助手を討ち倒した！\n奴の懐から『最奥実験室の鍵』と『実験記録の切れ端』が落ちた。", () => {
                            showItemAcquiredModal(
                                "assets/images/cards/5Card.png",
                                "『最奥実験室の鍵』と『記録メモ』",
                                "【実験記録の切れ端】\n「……結界を崩す術式数値は4マスの合計で『20』。【真実を映す鏡（2）】と【神への権威を否定する十字架（4）】を埋め込めば陣は崩壊する……」\n\n※悪魔手記に記録されました！",
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

// ⑦ 最奥実験室（父親 ➔ 蛭沼 連戦・父親スキップ＆80%削減対応）
function handleBossLab5F(gameState, context, onComplete) {
    if (gameState.isHirunumaDefeated) {
        showMessageDialog("【最奥実験室】\n狂気の生体実験装置は停止し、静寂が漂っている。", onComplete);
        return;
    }
    if (!gameState.hasKeyLab5F) {
        showMessageDialog("【最奥実験室の扉】\n分厚い防護扉が固く閉ざされている。\n解錠するには『最奥実験室の鍵』が必要のようだ。", onComplete);
        return;
    }

    // ★ 蛭沼との対決シーケンス（再戦時も呼び出せるよう関数化）
    const triggerHirunumaSequence = () => {
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
                            const val = slots[slotId];
                            return typeof val === 'number' ? val : 0;
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

                        // ★ 80%削減ルール（適正Lv.20以上 ＋ 完全正解）
                        const floor = 5;
                        const targetLevel = (floor - 1) * 5; // Lv.20
                        const playerLevel = gameState.player.level || 1;
                        const baseHp = 1200;

                        let hpRatio = 1.0;
                        let resultMsg = "";

                        if (isPerfectSuccess) {
                            if (playerLevel >= targetLevel) {
                                hpRatio = 0.2; // 8割削減（開始HP: 240）
                                resultMsg = `【完全正解！】適正レベル(Lv.${targetLevel})到達！\n陣が眩く輝き、蛭沼の体力を 8割削減 した！`;
                            } else {
                                hpRatio = 0.5; // 半減（開始HP: 600）
                                resultMsg = `【完全正解！】魔方陣の解読に成功！\n聖なる光が吹き荒れ、蛭沼の体力を 半減 させた！`;
                            }
                        } else {
                            hpRatio = 1.0;
                            resultMsg = `【術式解呪失敗……！】\n術式が暴走し、完全体となった蛭沼が襲いかかってくる！`;
                        }

                        const startHp = Math.max(1, Math.floor(baseHp * hpRatio));
                        const hirunumaEnemy = { 
                            name: 'ドクター蛭沼', image: 'assets/images/demon/5f-hirunuma.png', 
                            hp: startHp, maxHp: baseHp,
                            atk: isPerfectSuccess ? 45 : 70, 
                            def: isPerfectSuccess ? 12 : 25, 
                            weakness: [5, 9], agi: 15,
                            rewardExp: 600, rewardMoney: 2500, isBoss: true
                        };

                        const startBossBattle = () => {
                            openCombatUI(hirunumaEnemy, gameState, (bossRes) => {
                                if (bossRes === 'win' || bossRes === 'combat_win') {
                                    if (!gameState.flags) gameState.flags = {};
                                    gameState.flags.cleared5F = true; // ★ 5Fクリアフラグ（ポスト・進行連携）
                                    gameState.isHirunumaDefeated = true;
                                    if (gameState.saveGame) gameState.saveGame();

                                    showConversationDialog(
                                        "assets/images/demon/5f-hirunuma.png",
                                        "【瀕死の蛭沼】\n「違う、あの子が歩けなくなったのは俺の執刀ミスのせいじゃない、治せる、俺は治せるんだ……」",
                                        () => {
                                            showMessageDialog("【黒猫の失踪】\n倒れた蛭沼を背に、父親を介抱しようと駆け寄る。\n父親「ありがとう…8F、8Fへ行って御堂を止めなければ…あいつが全ての元凶、市長選挙落選の逆恨みで、悪魔の門を…」\n主人公（い、いや、無理だよ、父親を助けたんだからもう無理だ、帰るぞ、無理だ…）\n逡巡したその時――\n足元にいた黒猫がするりと身を翻し、開いた非常階段（6階）へ駆け上がっていってしまった！\n\n主人公「おい、待て！……くそっ、放っておくわけにはいかない！」", onComplete);
                                        }
                                    );
                                } else {
                                    onComplete();
                                }
                            }, context);
                        };

                        showMessageDialog(resultMsg, () => {
                            if (isPerfectSuccess) {
                                playVideo("assets/videos/magic-circle.mp4", () => {
                                    startBossBattle();
                                });
                            } else {
                                startBossBattle();
                            }
                        });
                    });
                }
            );
        });
    };

    // ★ 父親救出済みなら、父親戦をスキップして直接蛭沼戦へ
    if (gameState.isFatherRescued) {
        showMessageDialog("【最奥実験室】\n父親は安全な隅で気を失って横たわっている。\n奥からドクター蛭沼が冷酷な眼差しで睨みつけてくる……！", () => {
            triggerHirunumaSequence();
        });
        return;
    }

    // 初回突入：父親キメラ戦 ➔ 蛭沼戦
    showMessageDialog("【最奥実験室】\n扉を開けると、手術台の前に変わり果てた姿の男が鎖に繋がれていた……。", () => {
        showConversationDialog(
            "assets/images/demon/5f-father.png",
            "【キメラ化した父親】\n「息子ハ…息子ハ、ブジか…コロシテ…モウ、ダメダ…理性ガ…」",
            () => {
                const fatherEnemy = { 
                    name: 'キメラ化した父親', image: 'assets/images/demon/5f-father.png', 
                    hp: 480, atk: 50, def: 15, weakness: [3], agi: 14,
                    rewardExp: 300, rewardMoney: 1100
                };
                openCombatUI(fatherEnemy, gameState, (res) => {
                    if (res === 'win' || res === 'combat_win') {
                        gameState.isFatherRescued = true;
                        showMessageDialog("【父親の救出】\n異形の肉体が崩れ、人間の姿を取り戻した父親が気を失って倒れ込んだ。\n微かに息はある……助かったんだ！", () => {
                            triggerHirunumaSequence();
                        });
                    } else {
                        onComplete();
                    }
                }, context);
            }
        );
    });
}