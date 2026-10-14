// maps/map6F.js - 感情の導線修正・拡張子(.png)完全反映・ドッペルゲンガー決戦版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openBossPuzzleUI, openCombatUI, openInquisitionUI 
} from '../ui.js';

export const playerStart6F = { x: 5, y: 8, dir: 0 };

export const map6F = [
    [1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1],
    [1, 2, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 2, 0, 1, 0, 1, 0, 2, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  
];

// ランダムエンカウント ＆ 進入時イベント
export function check6FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 6) return;
    
    // ① 進入時の環境演出（感情の導線修正）
    if (!gameState.flags) gameState.flags = {};
    if (!gameState.flags.seen6FIntro) {
        gameState.flags.seen6FIntro = true;
        showMessageDialog("【6階：濃密な蜘蛛の巣】\n5階から駆け上がっていった黒猫を追い、6階へ足を踏み入れた。\nフロア全体に、異常なほど白く粘つく蜘蛛の糸が張り巡らされている……。", () => {
            showMessageDialog("糸をかき分けて進もうとすると、全身が泥に沈むような強烈な『無気力感』に襲われた。\nどうやらこの糸自体が、精神を蝕む悪魔の毒を発しているようだ。", () => {
                showMessageDialog("（……なんだ、これ。身体が、重い……）\n\n毒にあてられた脳内に、一番逃げ出したい過去の記憶が幻聴となってこびりつく。\n\n『――あなたの志望動機は？』\n『この会社で、何をしてみたいのですか？』", () => {
                    showMessageDialog("無機質な面接官の声が響く。\n\n主人公（分からない……給与と安定以外に、正解があるのか。やりたいことなんて、何もやってもないのに分かるわけがないだろ……）\n\n（俺は……ここで何をしてるんだ？ 家庭教師の生徒とはいえ、他人の中学生の父親を助けるために悪魔と戦う？ ……馬鹿げてる）", () => {
                        showMessageDialog("（ふと、1階で息絶えた神父の顔が浮かんだ）\n\n『8Fの御堂は私の想像を超えていた……頼む……』\n\n（神父も人選ミスだ。どうしてよりによって、何者にもなれない俺なんかに託した……？）\n憂鬱と自己嫌悪が渦巻く中、遠くから微かに猫の鳴き声が聞こえた。どうした、何か助けを求めてるのか？", () => {
                            if (onEncounter) onEncounter(null);
                        });
                    });
                });
            });
        });
        return;
    }

    if (Math.random() < 0.15) {
        const demonTypes = [
            { id: 'DEVIL13_6F', name: '停滞の糸紡ぎ', image: 'assets/images/demon/demon14.png', hp: 260, atk: 45, def: 8, weakness: [6], agi: 14 },
            { id: 'DEVIL14_6F', name: '神父の悪夢', image: 'assets/images/demon/demon15.png', hp: 220, atk: 58, def: 5, weakness: [7], agi: 18 },
            { id: 'DEVIL15_6F', name: '可能性のひとつだった幻の未来', image: 'assets/images/demon/demon13.png', hp: 320, atk: 48, def: 12, weakness: [2, 4], agi: 10 }
        ];
        const chosenEnemy = demonTypes[Math.floor(Math.random() * demonTypes.length)];
        if (onEncounter) onEncounter({ ...chosenEnemy });
    }
}

export function handleEvent6F(targetCell, gameState, context) {
    if (!gameState.flags) gameState.flags = {};

    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                showMessageDialog("【非常階段】\n5階へ降りますか？", () => {
                    gameState.lastTransitMethod = 'stair_down';
                    playFloorTransition(5, () => { context.changeFloor(5); onComplete(); });
                });
            }
        };
    }

    if (targetCell === 5) {
        if (!gameState.flags.cleared6F) {
            return {
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n強固な蜘蛛の糸と鉛のような倦怠の気配が階段を閉ざしている。\n自らの過去の影（ドッペルゲンガー）を打ち破らなければ先へは進めない！", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    showMessageDialog("【非常階段】\n7階へ昇りますか？", () => {
                        gameState.lastTransitMethod = 'stair';
                        playFloorTransition(7, () => { context.changeFloor(7); onComplete(); });
                    });
                }
            };
        }
    }

    if (targetCell === 2) {
        const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
        const vec = dirVectors[gameState.player.dir];
        const frontX = gameState.player.x + vec.x;
        const frontY = gameState.player.y + vec.y;

        if (frontX === 2 && frontY === 7) return { run: (onComplete) => handleRoom601(gameState, context, onComplete) };
        if (frontX === 8 && frontY === 7) return { run: (onComplete) => handleRoom602(gameState, context, onComplete) };
        if (frontX === 1 && frontY === 3) return { run: (onComplete) => handleSpiderMiniBoss(gameState, context, onComplete) };
        if (frontX === 5 && frontY === 2) return { run: (onComplete) => handleCocoonBossRoom(gameState, context, onComplete) };
    }

    return null;
}

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
                type: "human", name: "目覚めを拒む男", faceImage: "assets/images/human1.png",
                dialogue: "「……ハッ、聖水で意識が……ありがとう、危うく永遠に眠りこけるところだった。\nあの影はお前の頭の中に巣食う『諦め』そのものだ。\n奴の【頭部（上段）に『Ⅶ 鐘』】を鳴らして目を覚まさせろ。【足元（下段）に『Ⅱ 鏡』】を突きつけ、泥濘の中に立ち止まっている無様な姿を直視させるんだ！」"
            };
            openInquisitionUI(entity, gameState, (res) => {
                if (res === "finish" || res === "combat_win" || res === "kill_human") {
                    gameState.flags.cleared601 = true;
                    
                    if (!gameState.bossHints) gameState.bossHints = [];
                    gameState.bossHints.push("【6F 覚醒の助言】<br>「影の頭部（上段）に『Ⅶ 鐘』を鳴らせ。足元（下段）に『Ⅱ 鏡』を突きつけろ」");

                    onComplete();
                } else { onComplete(); }
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
                type: "demon", name: "甘言を弄する美女", faceImage: "assets/images/human2.png",
                realImage: "assets/images/demon/demon14.png", weakness: 4 
            };
            openInquisitionUI(entity, gameState, (res) => {
                if (res === "combat_win" || res === "kill_human") {
                    gameState.flags.cleared602 = true;
                    
                    if (!gameState.bossHints) gameState.bossHints = [];
                    gameState.bossHints.push("【6F 術式メモ】<br>「怠惰の影を断ち切る術式数値は6マスの合計で『25』。胸の虚無（左）には【Ⅳ 十字架】を穿て」");

                    showMessageDialog("【悪魔の討滅】\n射殺した悪魔の死体から、手記の切れ端が剥がれ落ちた。", () => {
                        showItemAcquiredModal("assets/images/cards/4Card.png", "『剥がれ落ちた蜘蛛の繭片』", "【術式メモ】\n「……怠惰の影を断ち切る術式数値は6マスの合計で『25』。\n奴が抱え込む胸の虚無（左）には、神への忠誠を示す【Ⅳ 十字架】を穿ち、甘美な眠りを打ち砕け……」", onComplete);
                    });
                } else if (res === "demon_ambush") {
                    gameState.player.hp = Math.max(1, gameState.player.hp - 15);
                    const demonEnemy = { name: "擬態した蜘蛛悪魔", image: "assets/images/demon/demon14.png", hp: 200, atk: 45, def: 5, weakness: [4] };
                    openCombatUI(demonEnemy, gameState, (cRes) => {
                        if (cRes === "win") {
                            gameState.flags.cleared602 = true;
                            if (!gameState.bossHints) gameState.bossHints = [];
                            gameState.bossHints.push("【6F 術式メモ】<br>「怠惰の影を断ち切る術式数値は6マスの合計で『25』。胸の虚無（左）には【Ⅳ 十字架】を穿て」");
                        }
                        onComplete();
                    }, context);
                } else { onComplete(); }
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

    showMessageDialog("【廃棄物保管室】\n扉を開けた瞬間、天井から粘着性の糸が降り注ぐ！\n先行していた黒猫を襲った元凶、「蜘蛛の怪異」が這いずり出てきた！", () => {
        const miniBoss = { name: "蜘蛛の怪異", image: "assets/images/demon/demon14.png", hp: 450, atk: 52, def: 10, weakness: [6], agi: 13 };
        openCombatUI(miniBoss, gameState, (res) => {
            if (res === "win" || res === "combat_win") {
                gameState.flags.hasSilverShears = true;
                showMessageDialog("蜘蛛の怪異を討ち滅ぼした！\n奴の巣の奥に、悪魔の糸をも断ち切る鋭利な刃物が突き刺さっているのを発見した。", () => {
                    showItemAcquiredModal("assets/images/knife.jpg", "断ち切りの銀鋏", "【キーアイテム】\n精神を蝕む悪魔の繭糸を切断できる聖銀の鋏。\nこれで奥の部屋に捕らわれているかもしれない『黒猫』を救出できる！", onComplete);
                });
            } else { onComplete(); }
        }, context);
    });
}

// ④ 蜘蛛の繭部屋：黒猫救出 ＆ ドッペルゲンガー決戦
function handleCocoonBossRoom(gameState, context, onComplete) {
    if (gameState.flags.cleared6F) {
        showMessageDialog("【最奥の部屋】\n自らの影を乗り越えた静寂が広がっている。\n足元には頼もしい相棒（黒猫）がいる。", onComplete);
        return;
    }

    if (!gameState.flags.hasSilverShears) {
        showMessageDialog("【蜘蛛の繭部屋】\n部屋の中央に巨大な糸の繭があり、その中に黒猫が閉じ込められている！\nしかし悪魔の糸は強固で、モデルガンや素手では引きちぎれない……！\nどこかで『糸を断ち切る刃物』を見つける必要がある！", onComplete);
        return;
    }

    // ★ リトライ時のイベント短縮（すでに繭を切っている場合）
    if (gameState.flags.isCocoonCut) {
        showMessageDialog("【最奥の部屋】\n自由を取り戻した黒猫が、部屋の奥で牙を剥いている。\n暗闇から再び、主人公と同じ姿をした影（ドッペルゲンガー）が嘲笑を浮かべて歩み出てきた！\n\n主人公「……もうお前の言葉には惑わされない。決着をつけるぞ！」", () => {
            startDoppelgangerPuzzle(gameState, context, onComplete);
        });
        return;
    }

    // 初回イベント
    showConversationDialog("assets/images/catpinchi.jpg", "【捕らわれた黒猫】\n部屋の中央。張り巡らされた巨大な蜘蛛の巣に、黒猫が絡め取られていた。\n\n物理的な拘束だけではない。このフロアに充満する『諦めの毒』に侵され、あの鋭かった金色の瞳は虚ろに濁り、動くことすら放棄しているようだ。", () => {
        showMessageDialog("主人公は『断ち切りの銀鋏』を構え、黒猫を救出しようと踏み出した。\n\n――その時。部屋の奥の暗闇から、主人公と【全く同じ姿をした男】が嘲笑を浮かべて歩み出てきた。", () => {
            playVideo("assets/images/demon/6f-doppelganger.mp4", () => {
                showConversationDialog("assets/images/demon/6f-doppelganger.png", "【ドッペルゲンガー】\n「……何を必死になっている？ 銃を握らされ、誰かのために戦うフリをして、自分に価値があると思い込みたいだけだろう？」\n\n「お前はずっと、何者にもなりたくなかったはずだ。選択する痛みを恐れ、責任を恐れ、ただ眠っていたかった。……あの子を助ける？ 傲慢だな。お前はただ、自分の空っぽな人生から目を背ける口実が欲しかっただけだ」", () => {
                    showMessageDialog("影の言葉が、鋭く胸をえぐる。\n（……その通りだ。俺には崇高な目的もない。立派な志望動機も持てなかった。神父が俺にスマホを託したのだって、きっとただの偶然だ）\n\n主人公の足元に蜘蛛の糸が這い上がり、身体が鉛のように重くなる。銃を構える腕が下がりかけた――", () => {
                        showConversationDialog("assets/images/catpinchi.jpg", "【黒猫】\n「……ニャァアアッ！！」\n\nその瞬間。完全に心を折られていたはずの黒猫が、主人公の危機に反応して力を振り絞り、自分を縛る蜘蛛の糸に鋭く噛みついた！\n\n金色の瞳が、主人公への絶対的な『信頼』を込めて見つめてくる。", () => {
                            showMessageDialog("（……！）\n主人公の中で、何かが弾けた。\n\n（神父が俺を選んだ理由なんて、ただの偶然でいい。）\n（俺の人生に価値があるかどうかも、今すぐ分からなくていい！）\n\n「――だが、今俺を信じて鳴いているこいつを見捨てるような……最低の逃げ方は、もうごめんだッ！！」", () => {
                                showMessageDialog("主人公は力任せに足元の糸を引きちぎり、銀鋏で黒猫の繭を一気に切り裂いた！\n自由を取り戻した黒猫がしなやかに着地した。大きく深呼吸すると、覇気を取り戻したようだ。\n\n主人公「……行けるか？」\n\n黒猫は『当たり前だろ』とでも言うように軽く目配せし、低く唸って敵を睨みつける）", () => {
                                    
                                    // ★ ここで「繭を斬った」フラグを保存（負けてもここから再開できる）
                                    gameState.flags.isCocoonCut = true;
                                    
                                    startDoppelgangerPuzzle(gameState, context, onComplete);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

// ボス戦の魔方陣 ＆ 戦闘呼び出し（リトライ時にも共通で使うため分離）
function startDoppelgangerPuzzle(gameState, context, onComplete) {
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
        const getCardNum = (id) => typeof slots[id] === 'number' ? slots[id] : 0;
        const sum = [getCardNum("slot-tl"), getCardNum("slot-top"), getCardNum("slot-left"), getCardNum("slot-right"), getCardNum("slot-bottom"), getCardNum("slot-br")].reduce((a,b)=>a+b,0);
        const isUnique = new Set([getCardNum("slot-tl"), getCardNum("slot-top"), getCardNum("slot-left"), getCardNum("slot-right"), getCardNum("slot-bottom"), getCardNum("slot-br")]).size === 6;

        let isPerfect = (getCardNum("slot-top") === 7 && getCardNum("slot-bottom") === 2 && getCardNum("slot-left") === 4 && sum === 25 && isUnique);

        const doppelEnemy = {
            name: "ドッペルゲンガー", image: "assets/images/demon/6f-doppelganger.png", 
            hp: isPerfect ? 400 : 1000, maxHp: 1000, atk: isPerfect ? 50 : 70, def: isPerfect ? 10 : 20, weakness: [4, 7], agi: 15
        };

        const startBossBattle = () => {
            openCombatUI(doppelEnemy, gameState, (res) => {
                if (res === "win" || res === "combat_win") {
                    gameState.flags.cleared6F = true;
                    // ★ 猫の合流を確定
                    gameState.flags.hasCat = true;
                    gameState.flags.isCatTrapped = false;
                    
                    showMessageDialog("【ドッペルゲンガー討滅】\n砕け散った自らの影は、黒い霧となって消え去った。\n胸の中にあった鉛のような倦怠感は消え、確かな熱が宿っている。", () => {
                        showMessageDialog("足元に寄ってきた黒猫が、主人公を見上げて一声短く鳴いた。\n\n主人公「さて、相棒……8Fの『御堂』を倒しに行くか」\n\n（※黒猫が真の相棒として合流！ 7階への非常階段が開通した！）", onComplete);
                    });
                } else { onComplete(); }
            }, context);
        };

        if (isPerfect) {
            showMessageDialog("【完全解呪成功！】\n魔方陣が激しく共鳴！ 過去の迷いと停滞が打ち砕かれ、影の体力を大幅削減した！", () => {
                playVideo("assets/videos/magic-circle.mp4", startBossBattle);
            });
        } else {
            showMessageDialog(`【術式解呪失敗……（合計: ${sum}）】\n迷いを断ち切れず、完全体となったドッペルゲンガーが襲いかかってくる！`, startBossBattle);
        }
    });
}