// maps/map6F.js - 一家心中事件の裏設定・ホラー演出統合版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openBossPuzzleUI, openCombatUI, openInquisitionUI 
} from '../ui.js';
import { sound } from '../sound.js'; // SE再生用

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

// ランダムエンカウント ＆ 進入時イベント ＆ 通路の怨霊ギミック
export function check6FRandomEncounter(gameState, onEncounter, context) {
    if (gameState.currentFloor !== 6) return;
    
    // ① 進入時の環境演出（主人公の心境「最近一家心中があったから絶対行きたくない」を追加）
    if (!gameState.flags) gameState.flags = {};
    if (!gameState.flags.seen6FIntro) {
        gameState.flags.seen6FIntro = true;
        showMessageDialog("【6階：濃密な蜘蛛の巣】\n5階から駆け上がっていった黒猫を追い、6階へ足を踏み入れた。\nフロア全体に、異常なほど白く粘つく蜘蛛の糸が張り巡らされている……。\n（うわ、なんだこれ？蜘蛛？マジか、あらゆる生き物で蜘蛛が一番苦手なんだよなぁ）", () => {
            showMessageDialog("糸をかき分けて進もうとすると、全身が泥に沈むような強烈な『無気力感』に襲われた。\n（え、気持ち悪い…吐き気がする…だるい…）\nどうやらこの糸自体が、精神を蝕む悪魔の毒を発しているようだ。", () => {
                showMessageDialog("（目がかすむ……なんだ、これ。身体が、重い……）\n\n毒にあてられた脳内に、一番逃げ出したい過去の記憶が幻聴となってこびりつく。\n\n『――あなたの志望動機は？』\n『この会社で、何をしてみたいのですか？』", () => {
                    showMessageDialog("無機質な面接官の声が響く。\n\n主人公（分からない……給与と安定以外に、正解があるのか。やりたいことなんて、何もやってもないのに分かるわけがないだろ……）\n\n（俺は……ここで何をしてるんだ？ 家庭教師の生徒とはいえ、他人の父親を助けるために悪魔と戦う？ ……馬鹿げてる）", () => {
                        showMessageDialog("（ふと、1階で息絶えた神父の顔が浮かんだ）\n\n『8Fの御堂は私の想像を超えていた……頼む……』\n\n（神父も人選ミスだ。どうしてよりによって、何者にもなれない俺なんかに託した……？）\n憂鬱と自己嫌悪が渦巻く中、遠くから微かに猫の鳴き声が聞こえた。どうした、何か助けを求めてるのか？", () => {
                            showMessageDialog("（……そういえば、6階ってつい最近、投資詐欺に巻き込まれて借金を背負わされた『一家心中事件』があった階じゃなかったか……？）\n\n（マジかよ……絶対に行きたくないんだよな……でも、あいつ（黒猫）を放っておくわけにはいかない……！）", () => {
                                if (onEncounter) onEncounter(null);
                            });
                        });
                    });
                });
            });
        });
        return;
    }

    // ② 歩行時の「父親の怨念」二択ギミック（12%の確率で発生）
    if (Math.random() < 0.12) {
        triggerDadAmbushEvent(gameState, context, () => {
            if (onEncounter) onEncounter(null);
        });
        return;
    }

    // ③ 通常のランダムエンカウント
    if (Math.random() < 0.15) {
        const demonTypes = [
            { id: 'DEVIL13_6F', name: '停滞の糸紡ぎ', image: 'assets/images/demon/demon14.png', hp: 260, atk: 45, def: 8, weakness: [6], agi: 14, rewardExp: 220, rewardMoney: 750 },
            { id: 'DEVIL14_6F', name: '神父の悪夢', image: 'assets/images/demon/demon15.png', hp: 220, atk: 58, def: 5, weakness: [7], agi: 18, rewardExp: 240, rewardMoney: 800 },
            { id: 'DEVIL15_6F', name: '可能性のひとつだった幻の未来', image: 'assets/images/demon/demon13.png', hp: 320, atk: 48, def: 12, weakness: [2, 4], agi: 10, rewardExp: 260, rewardMoney: 850 }
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

        if (frontX === 2 && frontY === 7) return { run: (onComplete) => startMusumeRoomEvent(gameState, context, onComplete) }; // 娘の部屋
        if (frontX === 8 && frontY === 7) return { run: (onComplete) => startMomBossEvent(gameState, context, onComplete) };    // 母親の心中現場
        if (frontX === 1 && frontY === 3) return { run: (onComplete) => handleSpiderMiniBoss(gameState, context, onComplete) }; // 銀鋏取得
        if (frontX === 5 && frontY === 2) return { run: (onComplete) => handleCocoonBossRoom(gameState, context, onComplete) }; // 黒猫救出・ボス
    }

    return null;
}

// ==========================================
// ★ 一家心中の怨霊イベント（父親・娘・母親）
// ==========================================

// ① 父親：通路の気配察知・二択ギミック
export function triggerDadAmbushEvent(gameState, context, onComplete) {
    if (gameState.flags && gameState.flags.clearedDadAmbush) {
        if (onComplete) onComplete();
        return;
    }

    sound.playSE("assets/audio/se/zero.mp3");

    showMessageDialog("（ピキン……ッ！\n足元の床板が軋み、頭上と背後の空間からねばつくような悪意が張り詰める……！）", () => {
        showConversationDialog("assets/images/6f-dad.png", "【？？？のうわ言】\n「……御堂さん、どうして……俺のせいじゃない……俺だって騙されたんだ……\n……お前も、俺を責めに来た記者か……？ 一緒に死んでくれ……！」", () => {
            
            const choiceModal = document.createElement("div");
            choiceModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3500; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; font-family: 'Shippori Mincho', serif; box-sizing: border-box;";
            
            choiceModal.innerHTML = `
                <div style="width: 100%; max-width: 480px; background: rgba(20,5,5,0.95); border: 2px solid #aa0000; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 0 25px red;">
                    <div style="color: #ff3333; font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">【悪魔の殺気！】</div>
                    <div style="color: #ccc; font-size: 0.9em; line-height: 1.6; margin-bottom: 20px;">
                        天井の太い糸がきしむ音と、背後の冷たい息遣いが同時に迫る！<br>
                        気配は頭上か、それとも背後か……！？
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button id="btn-choice-up" style="flex: 1; padding: 12px; background: linear-gradient(180deg, #550000, #220000); color: #ffdd66; border: 1px solid #ff4444; border-radius: 4px; font-weight: bold; cursor: pointer; font-family: inherit;">[ 1: 頭上へ銃を向ける ]</button>
                        <button id="btn-choice-back" style="flex: 1; padding: 12px; background: linear-gradient(180deg, #550000, #220000); color: #ffdd66; border: 1px solid #ff4444; border-radius: 4px; font-weight: bold; cursor: pointer; font-family: inherit;">[ 2: 振り返って背後を撃つ ]</button>
                    </div>
                </div>
            `;
            document.body.appendChild(choiceModal);

            const handleChoice = (isUpChosen) => {
                choiceModal.remove();
                const isCorrect = (Math.random() < 0.5);

                const dadEnemyBase = {
                    id: "6F_DAD",
                    name: "縊死した父親の怨霊",
                    image: "assets/images/6f-dad.png",
                    hp: 200,
                    atk: 35,
                    def: 5,
                    weakness: [6], // Ⅵ 聖炎
                    rewardExp: 180,
                    rewardMoney: 500,
                    actions: [
                        "は折れ曲がった首を軋ませて突進してきた！",
                        "「返せ……俺の人生を返せぇぇっ！」血涙を流して殴りかかってきた！",
                        "の首から伸びた無数の蜘蛛の糸が首を絞めにかかる！"
                    ]
                };

                if (isCorrect) {
                    sound.playSE("assets/audio/se/gun.mp3");
                    showMessageDialog("【看破成功！】\n闇に潜んでいた悪霊の出鼻を挫き、至近距離から銃弾を叩き込んだ！\n（先制攻撃！ 敵HPを大幅に削った状態で戦闘開始！）", () => {
                        const enemy = { ...dadEnemyBase, hp: Math.floor(dadEnemyBase.hp * 0.4) };
                        openCombatUI(enemy, gameState, (res) => {
                            if (res === 'win') {
                                gameState.flags.clearedDadAmbush = true;
                                showMessageDialog("【怨霊撃退】\n「許さない……御堂……絶対に許さないぞ……」\n男の影は床の隙間に染み込むように消え去った。", onComplete);
                            } else {
                                onComplete();
                            }
                        }, context);
                    });
                } else {
                    sound.playSE("assets/audio/se/zero.mp3");
                    gameState.player.hp = Math.max(1, gameState.player.hp - 20);
                    showMessageDialog("【判断ミス！】\n死角から組み付かれた！ 首の折れた男の顔が目の前に迫る！\n（奇襲を受けて主人公のHPが減少！）", () => {
                        openCombatUI(dadEnemyBase, gameState, (res) => {
                            if (res === 'win') {
                                gameState.flags.clearedDadAmbush = true;
                                showMessageDialog("【怨霊撃退】\n「許さない……御堂……絶対に許さないぞ……」\n男の影は床の隙間に染み込むように消え去った。", onComplete);
                            } else {
                                onComplete();
                            }
                        }, context);
                    });
                }
            };

            document.getElementById("btn-choice-up").onclick = () => handleChoice(true);
            document.getElementById("btn-choice-back").onclick = () => handleChoice(false);
        });
    });
}

// ② 娘：子供部屋のドア攻防 ＆ 逃げ遅れた娘の残滓
export function startMusumeRoomEvent(gameState, context, onComplete) {
    if (gameState.flags && gameState.flags.clearedMusumeRoom) {
        showMessageDialog("【子供部屋の残骸】\n壁一面に赤いクレヨンで書かれた文字は消え、静まり返っている……。", onComplete);
        return;
    }

    showMessageDialog("（ドアノブに手をかけると、内側から「ガタガタガタッ！」と必死にドアを押さえつける振動が走った！）", () => {
        showConversationDialog("assets/images/6f-musume.jpg", "【内側からの叫び】\n「開けないで！ お願いだから開けないで！\nお父さんが来ちゃう！ お父さんがみんな一緒に死のうって……！！」", () => {
            showMessageDialog("【主人公】\n「（中に生存者が……！？ いや、この禍々しい気配は……！）」\n\n主人公は意を決して、固く閉ざされたドアを蹴破った！", () => {
                
                showMessageDialog("【荒れ果てた子供部屋】\n床には『シニアレジデンス計画・推薦人：御堂』と書かれた大量の破棄チラシ。\n壁一面には赤いクレヨンで『パパは悪くない』『うそつきテレビ』と狂気じみた殴り書きがされている……。", () => {
                    
                    showConversationDialog("assets/images/6f-musume.jpg", "【逃げ遅れた娘の残滓】\n「……お父さんじゃない……？\nテレビの人……？ パパをいじめに来たの……？\n……あはっ、あはははっ！ じゃあ、お兄ちゃんもいっしょにしんじゃえええっ！！」", () => {
                        
                        const musumeEnemy = {
                            id: "6F_MUSUME",
                            name: "逃げ遅れた娘の残滓",
                            image: "assets/images/6f-musume.jpg",
                            hp: 180,
                            atk: 32,
                            def: 4,
                            weakness: [4], // Ⅳ 十字架
                            rewardExp: 200,
                            rewardMoney: 600,
                            actions: [
                                "は泣き叫びながら鋭い爪で引っ掻いてきた！",
                                "「パパをいじめないで！」耳をつんざく金切り声を上げた！",
                                "は床下を蜘蛛のようにカサカサと這い回り、足首に噛みついてきた！"
                            ]
                        };

                        openCombatUI(musumeEnemy, gameState, (res) => {
                            if (res === 'win') {
                                if (!gameState.flags) gameState.flags = {};
                                gameState.flags.clearedMusumeRoom = true;

                                showConversationDialog("assets/images/6f-musume.jpg", "【逃げ遅れた娘の残滓】\n「……う……うぅ……パパ……ママ……痛いよ……暗いよぉ……（光の粒子となって消滅した）」", () => {
                                    showMessageDialog("【怨念の解放】\n少女の霊は霧散した。\n机の上には、未払いの督促状の山と、家族3人で笑い合う写真立てが残されていた……。", () => {
                                        
                                        // 悪魔手記に記録
                                        if (!gameState.bossHints) gameState.bossHints = [];
                                        gameState.bossHints.push("【6F 術式メモ】<br>「影の頭部（上段）に『Ⅶ 鐘』を鳴らせ。足元（下段）に『Ⅱ 鏡』を突きつけろ」");
                                        showMessageDialog("【悪魔の消滅】\n部屋の隅から、魔方陣の解読メモを発見した！\n（※悪魔手記に記録されました）", onComplete);

                                    });
                                });
                            } else {
                                onComplete();
                            }
                        }, context);

                    });
                });
            });
        });
    });
}

// ③ 母親：心中現場の繭 ＆ 絶望への抗い（中ボス戦）
export function startMomBossEvent(gameState, context, onComplete) {
    if (gameState.flags && gameState.flags.clearedMomBoss) {
        showMessageDialog("【心中現場の部屋】\n蜘蛛の糸と腐臭は消え去り、家族が眠る静寂だけが残されている。", onComplete);
        return;
    }

    showMessageDialog("【凄惨な心中現場】\n部屋の中央には、古びた毛布やシーツが黒い糸で幾重にも巻かれた『巨大な繭』が天井から吊り下げられている……。\n\n足元には散乱した『督促状』と、殴り書きされた父親の遺書がある。\n『御堂さん、信じていたのに……。マスコミがドアを叩く音が止まりません。もう、どこにも逃げ場がありません』", () => {
        
        showMessageDialog("（……部屋の奥から、ノイズ混じりの歪んだ子守唄が聞こえてくる……）\n\n『ねんねん……ころりよ……おころりよ……』", () => {
            
            showConversationDialog("assets/images/6f-mom.png", "【抱擁の繭・母親】\n「しぃっ……静かに……。この子は今、やっと苦しみから解放されて、ゆっくり眠っているの……」", () => {
                showConversationDialog("assets/images/6f-mom.png", "【抱擁の繭・母親】\n「あなたも、就活に失敗して……生きているのが辛いのでしょう……？\n生きる意味なんて、最初からどこにもなかったのよ……。\nもう頑張らなくていいの。さあ、私たちと一緒に、泥のように眠りましょう……？」", () => {
                    
                    showMessageDialog("【主人公の葛藤】\n（甘く重い絶望の香気が脳を麻痺させる……。\n確かに、俺の人生は挫折だらけだった。\nここで目を閉じて、すべてを諦めてしまえば……どれだけ楽になれるだろう……？）", () => {
                        showMessageDialog("【主人公の覚悟】\n「――ふざけるな！！」\n\n（違う……諦めて逃げ込んだ先に待っているのは、こんな腐った地獄だけだ！\n騙されて命を奪われたこの家族の無念を……そして何より、俺を信じて待っている教え子を、こんなところで投げ出せるか！！）", () => {
                            
                            showConversationDialog("assets/images/6f-mom.png", "【抱擁の繭・母親】\n「ああ……可哀想に……狂ってしまったのね……。\n無理にでも、私の腕の中で眠らせてあげるわァァッ！！」", () => {
                                
                                const momEnemy = {
                                    id: "6F_MOM",
                                    name: "抱擁の繭（母親の怨念）",
                                    image: "assets/images/6f-mom.png",
                                    hp: 350,
                                    atk: 45,
                                    def: 8,
                                    weakness: [1, 6], // Ⅰ 聖水、Ⅵ 聖炎
                                    isBoss: true,
                                    rewardExp: 350,
                                    rewardMoney: 1200,
                                    actions: [
                                        "は粘着質な絶望の糸を吐き散らし、主人公の動きを封じにかかる！",
                                        "「誰も信じない……誰も許さない……！」狂乱の叫びが精神を削る！",
                                        "の巨大な繭から無数の黒い手が伸び、引きずり込もうとする！"
                                    ]
                                };

                                openCombatUI(momEnemy, gameState, (res) => {
                                    if (res === 'win') {
                                        if (!gameState.flags) gameState.flags = {};
                                        gameState.flags.clearedMomBoss = true;

                                        showConversationDialog("assets/images/6f-mom.png", "【抱擁の繭・母親】\n「ああ……あたたかい……。\nあの子……パパ……私たち、やっと……本当の朝を迎えられるのね……（光となって昇天した）」", () => {
                                            
                                            // 悪魔手記に記録
                                            if (!gameState.bossHints) gameState.bossHints = [];
                                            gameState.bossHints.push("【6F 術式メモ】<br>「怠惰の影を断ち切る術式数値は6マスの合計で『25』。胸の虚無（左）には【Ⅳ 十字架】を穿て」");
                                            
                                            showMessageDialog("【母親の怨念浄化】\n巨大な繭が崩れ落ち、悪魔の残骸から魔方陣の解読メモを発見した！\n（※悪魔手記に記録されました）\n\n主人公「待ってろよ、御堂……！ もう誰も、お前の食い物にはさせない！」", () => {
                                                if (context && context.redraw) context.redraw();
                                                onComplete();
                                            });
                                        });
                                    } else {
                                        onComplete();
                                    }
                                }, context);

                            });
                        });
                    });
                });
            });
        });
    });
}

// ==========================================
// 銀鋏（アイテム）＆ ボス・ドッペルゲンガー戦
// ==========================================

function handleSpiderMiniBoss(gameState, context, onComplete) {
    if (gameState.flags.hasSilverShears) {
        showMessageDialog("【廃棄物保管室】\n巨大蜘蛛を討伐した部屋。散らばった糸は干からびている。", onComplete);
        return;
    }

    showMessageDialog("【廃棄物保管室】\n扉を開けた瞬間、天井から粘着性の糸が降り注ぐ！\n先行していた黒猫を襲った元凶、「蜘蛛の怪異」が這いずり出てきた！", () => {
        const miniBoss = { 
            name: "蜘蛛の怪異", image: "assets/images/demon/demon14.png", 
            hp: 450, atk: 52, def: 10, weakness: [6], agi: 13,
            rewardExp: 400, rewardMoney: 1500
        };
        openCombatUI(miniBoss, gameState, (res) => {
            if (res === "win" || res === "combat_win") {
                gameState.flags.hasSilverShears = true;
                
                if (gameState.saveGame) gameState.saveGame();

                showMessageDialog("蜘蛛の怪異を討ち滅ぼした！\n奴の巣の奥に、悪魔の糸をも断ち切る鋭利な刃物が突き刺さっているのを発見した。", () => {
                    showItemAcquiredModal("assets/images/knife.jpg", "断ち切りの銀鋏", "【キーアイテム】\n精神を蝕む悪魔の繭糸を切断できる聖銀の鋏。\nこれで奥の部屋に捕らわれているかもしれない『黒猫』を救出できる！", onComplete);
                });
            } else { onComplete(); }
        }, context);
    });
}

function handleCocoonBossRoom(gameState, context, onComplete) {
    if (gameState.flags.cleared6F) {
        showMessageDialog("【最奥の部屋】\n自らの影を乗り越えた静寂が広がっている。\n足元には頼もしい相棒（黒猫）がいる。", onComplete);
        return;
    }

    if (!gameState.flags.hasSilverShears) {
        showMessageDialog("【蜘蛛の繭部屋】\n部屋の中央に巨大な糸の繭があり、その中に黒猫が閉じ込められている！\nしかし悪魔の糸は強固で、モデルガンや素手では引きちぎれない……！\nどこかで『糸を断ち切る刃物』を見つける必要がある！", onComplete);
        return;
    }

    if (gameState.flags.isCocoonCut) {
        gameState.flags.hasCat = true;
        gameState.flags.isCatTrapped = false;
        showMessageDialog("【最奥の部屋】\n自由を取り戻した黒猫が、部屋の奥で牙を剥いている。\n暗闇から再び、主人公と同じ姿をした影（ドッペルゲンガー）が嘲笑を浮かべて歩み出てきた！\n\n主人公「……もうお前の言葉には惑わされない。決着をつけるぞ！」", () => {
            startDoppelgangerPuzzle(gameState, context, onComplete);
        });
        return;
    }

    showConversationDialog("assets/images/catpinchi.jpg", "【捕らわれた黒猫】\n部屋の中央。張り巡らされた巨大な蜘蛛の巣に、黒猫が絡め取られていた。\n\n物理的な拘束だけではない。このフロアに充満する『諦めの毒』に侵され、あの鋭かった金色の瞳は虚ろに濁り、動くことすら放棄しているようだ。", () => {
        showMessageDialog("主人公は『断ち切りの銀鋏』を構え、黒猫を救出しようと踏み出した。\n\n――その時。部屋の奥の暗闇から、主人公と【全く同じ姿をした男】が嘲笑を浮かべて歩み出てきた。", () => {
            playVideo("assets/images/demon/6f-doppelganger.mp4", () => {
                showConversationDialog("assets/images/demon/6f-doppelganger.png", "【ドッペルゲンガー】\n「……何を必死になっている？ 銃を握らされ、誰かのために戦うフリをして、自分に価値があると思い込みたいだけだろう？」\n\n「お前はずっと、何者にもなりたくなかったはずだ。選択する痛みを恐れ、責任を恐れ、ただ眠っていたかった。……あの子を助ける？ 傲慢だな。お前はただ、自分の空っぽな人生から目を背ける口実が欲しかっただけだ」", () => {
                    showMessageDialog("影の言葉が、鋭く胸をえぐる。\n（……その通りだ。俺には崇高な目的もない。立派な志望動機も持てなかった。神父が俺にスマホを託したのだって、きっとただの偶然だ）\n\n主人公の足元に蜘蛛の糸が返り咲き、身体が鉛のように重くなる。銃を構える腕が下がりかけた――", () => {
                        showConversationDialog("assets/images/catpinchi.jpg", "【黒猫】\n「……ニャァアアッ！！」\n\nその瞬間。完全に心を折られていたはずの黒猫が、主人公の危機に反応して力を振り絞り、自分を縛る蜘蛛の糸に鋭く噛みついた！\n\n金色の瞳が、主人公への絶対的な『信頼』を込めて見つめてくる。", () => {
                            showMessageDialog("（……！）\n主人公の中で、何かが弾けた。\n\n（神父が俺を選んだ理由なんて、ただの偶然でいい。）\n（俺の人生に価値があるかどうかも、今すぐ分からなくていい！）\n\n「――だが、今俺を信じて鳴いているこいつを見捨てるような……最低の逃げ方は、もうごめんだッ！！」", () => {
                                showMessageDialog("主人公は力任せに足元の糸を引きちぎり、銀鋏で黒猫の繭を一気に切り裂いた！\n自由を取り戻した黒猫がしなやかに着地した。大きく深呼吸すると、覇気を取り戻したようだ。\n\n主人公「……行けるか？」\n\n黒猫は『当たり前だろ』とでも言うように軽く目配せし、低く唸って敵を睨みつける）", () => {
                                    
                                    gameState.flags.isCocoonCut = true;
                                    gameState.flags.hasCat = true;
                                    gameState.flags.isCatTrapped = false;
                                    
                                    if (gameState.saveGame) gameState.saveGame();
                                    
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

        const floor = 6;
        const targetLevel = (floor - 1) * 5; // Lv.25
        const playerLevel = gameState.player.level || 1;
        const baseHp = 1000;

        let hpRatio = 1.0;
        let resultMsg = "";

        if (isPerfect) {
            if (playerLevel >= targetLevel) {
                hpRatio = 0.2; 
                resultMsg = `【完全正解！】適正レベル(Lv.${targetLevel})到達！\n魔方陣が激しく共鳴！ 過去の迷いと停滞を打ち砕き、影の体力を 8割削減 した！`;
            } else {
                hpRatio = 0.5; 
                resultMsg = `【完全正解！】魔方陣の解読に成功！\n聖なる光が吹き荒れ、影の体力を 半減 させた！`;
            }
        } else {
            hpRatio = 1.0;
            resultMsg = `【術式解呪失敗……（合計: ${sum}）】\n迷いを断ち切れず、完全体となったドッペルゲンガーが襲いかかってくる！`;
        }

        const startHp = Math.max(1, Math.floor(baseHp * hpRatio));

        const doppelEnemy = {
            name: "ドッペルゲンガー", image: "assets/images/demon/6f-doppelganger.png", 
            hp: startHp, maxHp: baseHp, 
            atk: isPerfect ? 50 : 70, 
            def: isPerfect ? 10 : 20, 
            weakness: [4, 7], agi: 15,
            rewardExp: 800, rewardMoney: 3500, isBoss: true
        };

        const startBossBattle = () => {
            openCombatUI(doppelEnemy, gameState, (res) => {
                if (res === "win" || res === "combat_win") {
                    gameState.flags.cleared6F = true;
                    gameState.flags.hasCat = true;
                    gameState.flags.isCatTrapped = false;
                    if (gameState.saveGame) gameState.saveGame();
                    
                    showMessageDialog("【ドッペルゲンガー討滅】\n砕け散った自らの影が、粒子となってフロアの闇へ溶けていく……。\n\n『……ふん。選んだんだな、痛みを引き受ける道を……』\n\n消えゆく影が残した呟きとともに、全身を縛っていた鉛のような倦怠感が霧散した。激しい呼吸の中、胸の奥に確かな熱が宿っている。", () => {
                        showMessageDialog("（ゴホッ、ゴホッ…ハァ…ハァ…息が、上がる……本当に俺が、あいつを倒したのか……？）\n\n何者にもなれず、選択から逃げ続けてきた過去の自分。\nその弱さが消えたわけじゃない。それでも――目の前で懸命に生きようとした小さな命を見捨てなかったことだけは、胸を張れる。", () => {
                            playVideo("assets/videos/blackcat2.mp4", () => {
                                showMessageDialog("主人公「……痛かったよな。よく耐えてくれた。」\n\n屈んでその頭を撫でると、温かい体温が掌に伝わってきた。\n神父から託されたただの「使い魔」ではない。絶望の中で背中を預け合える、たった一人の仲間だ。\n\n主人公「行こう……相棒。8Fの元凶（御堂）を止めて、全部終わらせるぞ」", () => {
                                    showConversationDialog(
                                        "assets/images/ketui.png",
                                        "【不退転の決意】\n瞳に宿る迷いは完全に消え去った。\n\n自分を信じてくれた黒猫と共に、主人公は前を見据える。\n目指すは最上階――全ての元凶を断ち切るために。\n\n（※黒猫が真の相棒として合流！ 7階への非常階段が開通した！）",
                                        onComplete
                                    );
                                });
                            });
                        });
                    });
                } else { onComplete(); }
            }, context);
        };

        if (isPerfect) {
            showMessageDialog(resultMsg, () => {
                playVideo("assets/videos/magic-circle.mp4", startBossBattle);
            });
        } else {
            showMessageDialog(resultMsg, startBossBattle);
        }
    });
}