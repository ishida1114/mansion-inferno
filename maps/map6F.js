// maps/map6F.js - 6F「蜘蛛の巣と面接室」トラウマ破砕・ドッペルゲンガー決戦完全版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openBossPuzzleUI, openCombatUI, openInquisitionUI 
} from '../ui.js';

// 6階開始位置（5Fからの階段前、北を向いて開始）
export const playerStart6F = { x: 5, y: 8, dir: 0 };

// 1: 壁 / 0: 通路
// 4: 5Fへの下り階段(5,9) / 5: 7Fへの上り階段(5,0)
// 2: すべての部屋の扉（木製ドア）
export const map6F = [
    [1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1], // y=0 (5: 7F上り階段)
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=1
    [1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1], // y=2 (5,2: 蜘蛛の繭部屋への防護扉)
    [1, 2, 1, 0, 0, 0, 0, 0, 1, 0, 1], // y=3 (1,3: 廃棄物保管室・中ボス蜘蛛)
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1], // y=4
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=5
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1], // y=6
    [1, 0, 2, 0, 1, 0, 1, 0, 2, 0, 1], // y=7 (2,7: 601号室 / 8,7: 602号室)
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1], // y=8 (開始地点: 5,8)
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1], // y=9 (4: 5F下り階段)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // y=10
];

// ランダムエンカウント（6F専用・3体のトラウマ悪魔）
export function check6FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 6) return;
    
    // ① 進入時の環境演出・幻聴イベント（初回歩行時に発火）
    if (!gameState.flags) gameState.flags = {};
    if (!gameState.flags.seen6FIntro) {
        gameState.flags.seen6FIntro = true;
        showMessageDialog("【6階：濃密な蜘蛛の巣】\nフロア全体に白く粘つく蜘蛛の糸が静かに漂っている……。\nそして遠くから、冷たく無機質な「面接官」の声が幻聴となって耳にこびりつく。", () => {
            showMessageDialog("『――あなたの志望動機は？』\n『この会社で、何をしてみたいのですか？』\n\n主人公「……給与と安定以外にあるか。やってもないのに分かるわけがないだろ……」", () => {
                showMessageDialog("（ふと、1階で息絶えた神父の言葉が脳裏をよぎる）\n\n『8Fの御堂は私の想像を超えていた……奴は街全体の脅威になる……頼む……』\n\n（なぜ、何の力もない素人の俺に託したんだ？ 神父にとっては、ただそこに居合わせた誰でもよかったんじゃないのか……？）", () => {
                    // 初回メッセージ終了後はエンカウントせず画面を戻す
                    if (onEncounter) onEncounter(null);
                });
            });
        });
        return;
    }

    // 15%の確率でエンカウント
    if (Math.random() < 0.15) {
        const demonTypes = [
            { 
                id: 'DEVIL13_6F', 
                name: '停滞の糸紡ぎ', 
                image: 'assets/images/demon/demon14.jpg', 
                hp: 260, atk: 45, def: 8, weakness: [6], agi: 14 // 聖炎(6)が弱点
            },
            { 
                id: 'DEVIL14_6F', 
                name: '神父の幻像', 
                image: 'assets/images/demon/demon15.png', 
                hp: 220, atk: 58, def: 5, weakness: [7], agi: 18 // 真理の鐘(7)が弱点
            },
            { 
                id: 'DEVIL15_6F', 
                name: '幻の未来', 
                image: 'assets/images/demon/demon13.png', 
                hp: 320, atk: 48, def: 12, weakness: [2, 4], agi: 10 // 鏡(2)と十字架(4)が弱点
            }
        ];
        const chosenEnemy = demonTypes[Math.floor(Math.random() * demonTypes.length)];
        if (onEncounter) onEncounter({ ...chosenEnemy });
    }
}

// イベント振り分け
export function handleEvent6F(targetCell, gameState, context) {
    if (!gameState.flags) gameState.flags = {};

    // 4: 5階への非常階段（降りる）
    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                showMessageDialog("【非常階段】\n5階へ降りますか？", () => {
                    gameState.lastTransitMethod = 'stair_down';
                    playFloorTransition(5, () => {
                        context.changeFloor(5);
                        onComplete();
                    });
                });
            }
        };
    }

    // 5: 7階への非常階段（昇る）
    if (targetCell === 5) {
        if (!gameState.flags.cleared6F) {
            return {
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n強固な蜘蛛の糸と鉛のような倦怠の気配が階段を閉ざしている。\n自身の影（ドッペルゲンガー）を打ち破らなければ先へは進めない！", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    showMessageDialog("【非常階段】\n7階へ昇りますか？", () => {
                        gameState.lastTransitMethod = 'stair';
                        playFloorTransition(7, () => {
                            context.changeFloor(7);
                            onComplete();
                        });
                    });
                }
            };
        }
    }

    // 2: 通常の扉（座標判定）
    if (targetCell === 2) {
        const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
        const vec = dirVectors[gameState.player.dir];
        const frontX = gameState.player.x + vec.x;
        const frontY = gameState.player.y + vec.y;

        // X:2, Y:7 -> 601号室（目覚めを拒む人間）
        if (frontX === 2 && frontY === 7) {
            return { run: (onComplete) => handleRoom601(gameState, context, onComplete) };
        }

        // X:8, Y:7 -> 602号室（安楽死を囁く蜘蛛の擬態悪魔）
        if (frontX === 8 && frontY === 7) {
            return { run: (onComplete) => handleRoom602(gameState, context, onComplete) };
        }

        // X:1, Y:3 -> 廃棄物保管室（中ボス：蜘蛛の怪異・銀鋏入手）
        if (frontX === 1 && frontY === 3) {
            return { run: (onComplete) => handleSpiderMiniBoss(gameState, context, onComplete) };
        }

        // X:5, Y:2 -> 蜘蛛の繭部屋（黒猫救出 ＆ ドッペルゲンガー決戦）
        if (frontX === 5 && frontY === 2) {
            return { run: (onComplete) => handleCocoonBossRoom(gameState, context, onComplete) };
        }
    }

    return null;
}

// ----------------------------------------------------
// 各イベントサブルーチン
// ----------------------------------------------------

// ① 601号室：目覚めを拒む住人（人間）
function handleRoom601(gameState, context, onComplete) {
    if (gameState.flags.cleared601) {
        showMessageDialog("【601号室】\n部屋にはもう誰もいない。男性は避難していったようだ。", onComplete);
        return;
    }

    showConversationDialog(
        "assets/images/human1.png",
        "【ベッドで眠る男性】\n蜘蛛の糸に巻かれ、微かに目を覚ます男。\n「頼むから起こさないでくれ……ここは痛みのない世界なんだ……競争も、誰かと比べる苦しみもないんだ……」\n\n（※この人物をどうする？）",
        () => {
            const entity = {
                type: "human",
                name: "目覚めを拒む男",
                faceImage: "assets/images/human1.png",
                dialogue: "「……ハッ、聖水で意識が……ありがとう、危うく永遠に眠りこけるところだった。\nあの影はお前の頭の中に巣食う『諦め』そのものだ。\n奴の【頭部（上段）に『Ⅶ 鐘』】を鳴らして目を覚まさせろ。【足元（下段）に『Ⅱ 鏡』】を突きつけ、泥濘の中に立ち止まっている無様な姿を直視させるんだ！」"
            };
            openInquisitionUI(entity, gameState, (res) => {
                if (res === "finish" || res === "combat_win" || res === "kill_human") {
                    gameState.flags.cleared601 = true;
                    onComplete();
                } else {
                    onComplete();
                }
            }, context);
        }
    );
}

// ② 602号室：安楽死を囁く蜘蛛の擬態（悪魔）
function handleRoom602(gameState, context, onComplete) {
    if (gameState.flags.cleared602) {
        showMessageDialog("【602号室】\n悪魔が霧散した跡には、ただどす黒い灰だけが残っている。", onComplete);
        return;
    }

    showConversationDialog(
        "assets/images/human2.png",
        "【穏やかな笑みを浮かべる女】\n「もう苦しまなくていいんですよ。この館で静かに溶けてしまえば、明日への不安も、誰かと比べる苦しみも、すべて消え去るのですから……」\n甘い声で主人公を引き込もうとしてくる。\n\n（※この人物をどうする？）",
        () => {
            const entity = {
                type: "demon",
                name: "甘言を弄する美女",
                faceImage: "assets/images/human2.png",
                realImage: "assets/images/demon/demon14.jpg", // 蜘蛛の悪魔の画像を使用
                weakness: 4 // Ⅳ 十字架が弱点
            };
            openInquisitionUI(entity, gameState, (res) => {
                if (res === "combat_win" || res === "kill_human") {
                    gameState.flags.cleared602 = true;
                    showMessageDialog("【悪魔の討滅】\n射殺した悪魔の死体から、手記の切れ端が剥がれ落ちた。", () => {
                        showItemAcquiredModal(
                            "assets/images/cards/4Card.png",
                            "『剥がれ落ちた蜘蛛の繭片』",
                            "【術式メモ】\n「……怠惰の影を断ち切る術式数値は6マスの合計で『25』。\n奴が抱え込む胸の虚無（左）には、神への忠誠を示す【Ⅳ 十字架】を穿ち、甘美な眠りを打ち砕け……」",
                            onComplete
                        );
                    });
                } else if (res === "demon_ambush") {
                    gameState.player.hp = Math.max(1, gameState.player.hp - 15);
                    const demonEnemy = {
                        name: "擬態した蜘蛛悪魔",
                        image: "assets/images/demon/demon14.jpg",
                        hp: 200, atk: 45, def: 5, weakness: [4]
                    };
                    openCombatUI(demonEnemy, gameState, (cRes) => {
                        if (cRes === "win") gameState.flags.cleared602 = true;
                        onComplete();
                    }, context);
                } else {
                    onComplete();
                }
            }, context);
        }
    );
}

// ③ 廃棄物保管室：中ボス「蜘蛛の怪異」（銀鋏入手）
function handleSpiderMiniBoss(gameState, context, onComplete) {
    if (gameState.flags.hasSilverShears) {
        showMessageDialog("【廃棄物保管室】\n巨大蜘蛛を討伐した部屋。散らばった糸は干からびている。", onComplete);
        return;
    }

    showMessageDialog("【廃棄物保管室】\n扉を開けた瞬間、天井から粘着性の糸が降り注ぐ！\n奥から無数の複眼を光らせた「蜘蛛の怪異」が這いずり出てきた！", () => {
        const miniBoss = {
            name: "蜘蛛の怪異",
            image: "assets/images/demon/demon14.jpg",
            hp: 450, atk: 52, def: 10,
            weakness: [6], // 聖炎
            agi: 13
        };

        openCombatUI(miniBoss, gameState, (res) => {
            if (res === "win" || res === "combat_win") {
                gameState.flags.hasSilverShears = true;
                showMessageDialog("蜘蛛の怪異を討ち滅ぼした！\n奴の巣の奥に、悪魔の糸をも断ち切る鋭利な刃物が突き刺さっているのを発見した。", () => {
                    showItemAcquiredModal(
                        "assets/images/present.png",
                        "断ち切りの銀鋏",
                        "【キーアイテム】\n精神を蝕む悪魔の繭糸を切断できる聖銀の鋏。\nこれで中央の繭に捕らわれた『黒猫』を救出できる！",
                        onComplete
                    );
                });
            } else {
                onComplete();
            }
        }, context);
    });
}

// ④ 蜘蛛の繭部屋：黒猫救出 ＆ ドッペルゲンガー決戦
function handleCocoonBossRoom(gameState, context, onComplete) {
    if (gameState.flags.cleared6F) {
        showMessageDialog("【最奥の部屋】\n自らの影を乗り越えた静寂が広がっている。\n足元には頼もしい相棒（黒猫）がいる。", onComplete);
        return;
    }

    // 銀鋏がない場合
    if (!gameState.flags.hasSilverShears) {
        showMessageDialog("【蜘蛛の繭部屋】\n部屋の中央に巨大な糸の繭があり、その中に黒猫が閉じ込められている！\nしかし悪魔の糸は強固で、モデルガンや素手では引きちぎれない……！\nどこかで『糸を断ち切る刃物』を見つける必要がある！", onComplete);
        return;
    }

    // 銀鋏がある場合 ➔ 救出 ＆ ドッペルゲンガー出現
    showMessageDialog("【黒猫の救出】\n『断ち切りの銀鋏』を振るい、黒猫を封じていた強固な蜘蛛の繭を切り裂いた！\n\n落下した黒猫がしなやかに着地し、静かに毛並みを整える。", () => {
        showMessageDialog("その時、部屋の奥の暗闇から、主人公と【全く同じ姿をした男】が嘲笑を浮かべて歩み出てきた……！", () => {
            
            // ★ ドッペルゲンガー覚醒の動画を再生
            playVideo("assets/images/demon/6f-doppelganger.mp4", () => {
                showConversationDialog(
                    "assets/images/demon/6f-doppelganger.jpg", // ★ ドッペルゲンガーの画像
                    "【ドッペルゲンガー】\n「……何を必死になっている？ 銃を握らされ、誰かのために戦うフリをして、自分に価値があると思い込みたいだけだろう？」\n\n「お前はずっと、何者にもなりたくなかったはずだ。選択する痛みを恐れ、責任を恐れ、ただ眠っていたかった。……あの子を助ける？ 傲慢だな。お前はただ、自分の空っぽな人生から目を背ける口実が欲しかっただけだ」",
                    () => {
                        showMessageDialog("主人公の足元に蜘蛛の糸が絡みつき、身体が鉛のように重くなる（怠惰の呪縛）。\n\n――しかし、足元にいる黒猫が、じっと金色の瞳で主人公を見つめ返してきた。", () => {
                            showMessageDialog("主人公の覚醒:\n（……そうだ。神父が俺を選んだ理由なんて、ただの偶然でいい。）\n（何がしたいかも、どう生きるべきかも、今すぐ分からなくていい！）\n\n「今、目の前で助けを求めている奴らがいる……！ 俺は、俺にできることをやるだけだ！！」", () => {
                                showMessageDialog("主人公は力任せに足元の糸を引きちぎり、モデルガンを構えた！\n\n主人公「……行けるか？」\n黒猫（『当たり前だろ』とでも言うように目を合わせ、低く唸って敵を睨みつける！）", () => {
                                    // 6マス魔方陣パズル開始
                                    const puzzleConfig = {
                                        title: "【魔方陣術式】怠惰と停滞の影（ドッペルゲンガー）",
                                        subTitle: "6マスの合計値を『25』にし、トラウマを粉砕せよ",
                                        bossName: "影",
                                        slots: [
                                            { id: "slot-tl", label: "①甘美な忘却", gridPos: "grid-area: 1 / 1;" },
                                            { id: "slot-top", label: "②思考の停止", gridPos: "grid-area: 1 / 2;" },
                                            { id: "slot-left", label: "③魂の空洞", gridPos: "grid-area: 2 / 1;" },
                                            { id: "slot-right", label: "④存在の倦怠", gridPos: "grid-area: 2 / 3;" },
                                            { id: "slot-bottom", label: "⑤泥濘の足枷", gridPos: "grid-area: 3 / 2;" },
                                            { id: "slot-br", label: "⑥静かなる死", gridPos: "grid-area: 3 / 3;" }
                                        ]
                                    };

                                    openBossPuzzleUI(puzzleConfig, gameState, (slots) => {
                                        const getCardNum = (slotId) => {
                                            const val = slots[slotId];
                                            return typeof val === 'number' ? val : 0;
                                        };

                                        const valTL = getCardNum("slot-tl");
                                        const valTop = getCardNum("slot-top");
                                        const valLeft = getCardNum("slot-left");
                                        const valRight = getCardNum("slot-right");
                                        const valBottom = getCardNum("slot-bottom");
                                        const valBR = getCardNum("slot-br");

                                        const allVals = [valTL, valTop, valLeft, valRight, valBottom, valBR];
                                        const sum = allVals.reduce((a, b) => a + b, 0);
                                        const isUnique = new Set(allVals).size === 6;

                                        // 正解判定：②=7(鐘), ⑤=2(鏡), ③=4(十字架) ＆ 重複なし ＆ 合計25
                                        let isPerfect = false;
                                        if (valTop === 7 && valBottom === 2 && valLeft === 4 && sum === 25 && isUnique) {
                                            isPerfect = true;
                                        }

                                        // ★ ボスの戦闘用画像
                                        const doppelEnemy = {
                                            name: "ドッペルゲンガー",
                                            image: "assets/images/demon/6f-doppelganger.jpg", 
                                            hp: isPerfect ? 400 : 1000,
                                            maxHp: 1000,
                                            atk: isPerfect ? 50 : 70,
                                            def: isPerfect ? 10 : 20,
                                            weakness: [4, 7],
                                            agi: 15
                                        };

                                        const startBossBattle = () => {
                                            openCombatUI(doppelEnemy, gameState, (res) => {
                                                if (res === "win" || res === "combat_win") {
                                                    gameState.flags.cleared6F = true;
                                                    gameState.flags.hasCat = true;
                                                    gameState.flags.isCatTrapped = false;

                                                    showMessageDialog("【ドッペルゲンガー討滅】\n砕け散った自らの影は、黒い霧となって消え去った。\n\n胸の中にあった鉛のような倦怠感は消え、確かな熱が宿っている。", () => {
                                                        showMessageDialog("足元に寄ってきた黒猫が、主人公を見上げて一声短く鳴いた。\n\n主人公「さて、相棒……8Fの『御堂』を倒しに行くか」\n\n（※黒猫が真の相棒として合流！ 7階への非常階段が開通した！）", onComplete);
                                                    });
                                                } else {
                                                    onComplete();
                                                }
                                            }, context);
                                        };

                                        if (isPerfect) {
                                            showMessageDialog("【完全解呪成功！】\n魔方陣が激しく共鳴！ 過去の迷いと停滞が打ち砕かれ、影の体力を大幅削減した！", () => {
                                                playVideo("assets/videos/magic-circle.mp4", () => {
                                                    startBossBattle();
                                                });
                                            });
                                        } else {
                                            showMessageDialog(`【術式解呪失敗……（合計: ${sum}）】\n迷いを断ち切れず、完全体となったドッペルゲンガーが襲いかかってくる！`, () => {
                                                startBossBattle();
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    }
                );
            });
        });
    });
}