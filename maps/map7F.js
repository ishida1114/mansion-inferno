// maps/map7F.js - 7F「VIPラウンジ」完全版（706号室白鳥撃破後プレゼント表示・ステータス完全維持版）

import { 
    showMessageDialog, showConversationDialog, 
    playVideo, openCombatUI, playFloorTransition 
} from '../ui.js';

export const playerStart7F = { x: 3, y: 8, dir: 0 };

// 1: 壁 / 0: 直線通路
// 4: 6Fへの階段 (3, 9) / 5: 8Fへの大階段 (3, 0)
// 8: 白鳥のペントハウス扉 (3, 1)
// 3: 1F直通エレベーター (2, 8)
// 2: 各個室の扉（ボスラッシュ・カジノ・ラウンジ）
export const map7F = [
    [1, 1, 1, 5, 1, 1, 1], // y=0 (5: 8Fへの大階段)
    [1, 1, 1, 8, 1, 1, 1], // y=1 (8: 白鳥のペントハウス扉)
    [1, 1, 1, 0, 1, 1, 1], // y=2
    [1, 1, 2, 0, 2, 1, 1], // y=3 (西: 705 カジノ / 東: 706 シャンパンラウンジ)
    [1, 1, 1, 0, 1, 1, 1], // y=4
    [1, 1, 2, 0, 2, 1, 1], // y=5 (西: 703 剥製・里奈 / 東: 704 剥製・蛭沼)
    [1, 1, 1, 0, 1, 1, 1], // y=6
    [1, 1, 2, 0, 2, 1, 1], // y=7 (西: 701 剥製・影山 / 東: 702 剥製・真田)
    [1, 1, 3, 0, 1, 1, 1], // y=8 (西の 2,8 にエレベーター新設！ 開始地点: 3, 8)
    [1, 1, 1, 4, 1, 1, 1], // y=9 (4: 6Fへの階段)
    [1, 1, 1, 1, 1, 1, 1]  // y=10
];

const TAXIDERMY_CONFIG = {
    kageyama: {
        roomName: "701号室【黄金の剥製：影山】",
        flag: "clearedTaxidermyKageyama",
        video: "assets/images/demon/2f-kageyama.mp4",
        introText: "【701号室：黄金の展示室】\n部屋の中央に、純金でコーティングされた2Fのボス・影山が鎖で繋がれている……！\nマダム・白鳥の魔力で操られ、獰猛な唸り声をあげて襲いかかってきた！",
        enemy: {
            name: "黄金の剥製・影山",
            image: "assets/images/demon/2f-kageyama2.jpg",
            hp: 350,
            atk: 50,
            def: 5,
            weakness: [2, 5],
            actions: ["は黄金の拳を振り下ろした！", "が鎖を引きちぎらんばかりに突進してくる！", "の濁った瞳から金粉がこぼれ落ちる"]
        },
        rewardMoney: 1500
    },
    sanada: {
        roomName: "702号室【黄金の剥製：真田】",
        flag: "clearedTaxidermySanada",
        video: "assets/images/demon/3f-sanada.mp4",
        introText: "【702号室：黄金の展示室】\n3Fで倒したはずの真田が、全身に宝石を埋め込まれた異様な剥製として鎮座している……！\n白鳥の強欲の呪いによって蘇り、怨嗟の声を上げながら飛びかかってきた！",
        enemy: {
            name: "黄金の剥製・真田",
            image: "assets/images/demon/3f-sanada.jpg",
            hp: 450,
            atk: 55,
            def: 6,
            weakness: [3, 8],
            actions: ["の鋭利な爪が空を裂く！", "は宝石の光を乱反射させて目を眩ませてきた！", "の金縛りの怨念が体を締め付ける！"]
        },
        rewardMoney: 2000
    },
    rina: {
        roomName: "703号室【黄金の剥製：里奈】",
        flag: "clearedTaxidermyRina",
        video: "assets/images/demon/4f-rina.mp4",
        introText: "【703号室：黄金の展示室】\n4Fの里奈が、悪趣味な金のドレスを着せられ愛玩動物のように飾られている……！\n「アハハ……お金……綺麗なドレス……」\n虚ろな笑みを浮かべ、殺意に満ちた魔力弾を放ってきた！",
        enemy: {
            name: "黄金の剥製・里奈",
            image: "assets/images/demon/4f-rina.jpg",
            hp: 550,
            atk: 60,
            def: 8,
            weakness: [1, 6],
            actions: ["は冷酷な眼差しで魔弾を連射した！", "の金のドレスが禍々しい魔気を放つ！", "の甲高い笑い声が精神を蝕む！"]
        },
        rewardMoney: 2500
    },
    hirunuma: {
        roomName: "704号室【黄金の剥製：蛭沼】",
        flag: "clearedTaxidermyHirunuma",
        video: "assets/images/demon/5f-hirunuma.mp4",
        introText: "【704号室：黄金の展示室】\n5Fの巨漢・蛭沼が、分厚い純金の鎧を皮膚に直接ボルトで打ち込まれて固定されている……！\n知性を完全に失った怪物が、白鳥の命令に従い侵入者を叩き潰そうと迫り来る！",
        enemy: {
            name: "黄金の剥製・蛭沼",
            image: "assets/images/demon/5f-hirunuma.png",
            hp: 650,
            atk: 65,
            def: 10,
            weakness: [4, 7],
            actions: ["の重厚な黄金の腕が薙ぎ払われる！", "の凄まじい地響きが部屋を揺るがす！", "は暴走し、周囲の壁を粉砕しながら突進してきた！"]
        },
        rewardMoney: 3000
    }
};

export function handleEvent7F(targetCell, gameState, context) {
    const px = gameState.player.x;
    const py = gameState.player.y;
    const dir = gameState.player.dir;
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];
    const frontX = px + dx[dir];
    const frontY = py + dy[dir];

    // 3: 1F直通エレベーター
    if (targetCell === 3) {
        return {
            run: (onComplete) => {
                showMessageDialog("【VIPエレベーター】\n1階のエントランス（集合ポスト・無人レジ）へ降りますか？", () => {
                    gameState.lastTransitMethod = 'elevator';
                    playFloorTransition(1, () => {
                        context.changeFloor(1);
                        onComplete();
                    });
                });
            }
        };
    }

    // 4: 6Fへの階段
    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                gameState.lastTransitMethod = 'stair_down';
                playFloorTransition(6, () => {
                    context.changeFloor(6);
                    onComplete();
                });
            }
        };
    }

    // 5: 8Fへの大階段
    if (targetCell === 5) {
        if (!gameState.flags || !gameState.flags.cleared7F) {
            return {
                run: (onComplete) => showMessageDialog("【8Fへの大階段】\n黄金の魔力で堅く閉ざされている。マダム・白鳥を討伐しないと進めない。", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    gameState.lastTransitMethod = 'stairs';
                    playFloorTransition(8, () => {
                        context.changeFloor(8);
                        onComplete();
                    });
                }
            };
        }
    }

    // 8: マダム・白鳥のペントハウス扉
    if (targetCell === 8) {
        return {
            run: (onComplete) => handleBossPenthouse(gameState, context, onComplete)
        };
    }

    // 2: 各個室の扉
    if (targetCell === 2) {
        if (frontX === 2 && frontY === 7) return { run: (onComplete) => handleTaxidermyRoom(gameState, context, "kageyama", onComplete) };
        if (frontX === 4 && frontY === 7) return { run: (onComplete) => handleTaxidermyRoom(gameState, context, "sanada", onComplete) };
        if (frontX === 2 && frontY === 5) return { run: (onComplete) => handleTaxidermyRoom(gameState, context, "rina", onComplete) };
        if (frontX === 4 && frontY === 5) return { run: (onComplete) => handleTaxidermyRoom(gameState, context, "hirunuma", onComplete) };
        if (frontX === 2 && frontY === 3) return { run: (onComplete) => openCasinoUI(gameState, onComplete) };
        if (frontX === 4 && frontY === 3) return { run: (onComplete) => handleLoungeRest(gameState, onComplete) };
    }

    return null;
}

// 剥製展示室
function handleTaxidermyRoom(gameState, context, bossKey, onComplete) {
    if (!gameState.flags) gameState.flags = {};
    const cfg = TAXIDERMY_CONFIG[bossKey];

    if (gameState.flags[cfg.flag]) {
        showMessageDialog(`【${cfg.roomName}】\n剥製は砕け散り、静まり返っている。ここにはもう用はない。`, onComplete);
        return;
    }

    const startCombatSequence = () => {
        playVideo(cfg.video, () => {
            showMessageDialog(cfg.introText, () => {
                openCombatUI(cfg.enemy, gameState, (res) => {
                    if (res === "win") {
                        gameState.flags[cfg.flag] = true;
                        gameState.player.money += cfg.rewardMoney;
                        
                        const clearedCount = ["clearedTaxidermyKageyama", "clearedTaxidermySanada", "clearedTaxidermyRina", "clearedTaxidermyHirunuma"].filter(k => gameState.flags[k]).length;
                        
                        let unlockMsg = `【撃破成功！】\n${cfg.enemy.name} の呪縛を解き、粉砕した！\n剥製の中から宝石と金貨がこぼれ落ちる……（💰${cfg.rewardMoney} 獲得！）`;
                        unlockMsg += `\n\n【館内放送・マダム白鳥】\n「ちょっと！！ あなた、私のコレクションに何してくれてるの！？\nそれを純金でコーティングするのに、いくらかかったと思ってるのよ！\nあんなゴミみたいな悪魔の魂でも、私が装飾してやったから『価値』が生まれたのに！\n弁償しなさい！ 今すぐその汚い臓器を全部売って、私の口座に振り込みなさい！！」`;

                        if (clearedCount >= 4) {
                            unlockMsg += `\n\n【展示室完全制覇！】\n全ての剥製を破壊した！ 廊下の最奥、マダム・白鳥のペントハウスの封印扉が開錠された！`;
                        } else {
                            unlockMsg += `\n\n（ペントハウスの封印解除まで あと ${4 - clearedCount} 体）`;
                        }
                        showMessageDialog(unlockMsg, onComplete);
                    } else {
                        onComplete();
                    }
                }, context);
            });
        });
    };

    if (!gameState.flags.seenTaxidermyIntro) {
        gameState.flags.seenTaxidermyIntro = true;
        showConversationDialog(
            "assets/images/demon/7f-shiratori.png", 
            "【館内放送・マダム白鳥】\n「ふふふ……驚いた？ それはね、私が特別に作らせた『アート』よ。\nあなたが下の階で倒したゴミ屑たち……魂を買い取って、純金と宝石でドレスアップしてあげたの！\n生きていた時よりもずっと美しくて、価値のある存在になったと思わない？\n愛も、憎しみも、最後はこうして『私だけのモノ』になる。\nあぁ、なんて素晴らしいコレクションかしら！\nさあ、私の可愛いペットたち。その貧相な闖入者を引き裂いて、新しい赤い絨毯の染料にしておしまい！」", 
            startCombatSequence
        );
    } else {
        startCombatSequence();
    }
}

// ★ 706号室：シャンパンラウンジ（白鳥撃破後は present.png に差し替え）
function handleLoungeRest(gameState, onComplete) {
    const isCleared = gameState.flags && gameState.flags.cleared7F;
    const dialogImage = isCleared ? "assets/images/present.png" : "assets/images/demon/7f-shiratori.png";
    const dialogText = isCleared
        ? "【706号室：シャンパンラウンジ】\nマダム・白鳥が消滅した部屋には、豪奢なプレゼントの小箱と冷えた高級シャンパンが残されている。\n一口含むと、心地よい芳醇な香りと共に全身の傷が急速に癒えていく……。\n\n（主人公のHPが全快した！）"
        : "【706号室：シャンパンラウンジ】\nクリスタルのテーブルに、黄金に輝く最高級シャンパンが冷やされている。\n一口含むと、心地よい芳醇な香りと共に全身の傷が急速に癒えていく……。\n\n（主人公のHPが全快した！）";

    showConversationDialog(dialogImage, dialogText, () => {
        gameState.player.hp = gameState.player.maxHp;
        onComplete();
    });
}

// 705号室：闇カジノ
function openCasinoUI(gameState, onComplete) {
    const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";
    const modal = document.createElement("div");
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,0,0,0.92); z-index: 3500; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: ${HORROR_FONT}; color: #fff; box-sizing: border-box; padding: 15px;`;

    let currentCard = Math.floor(Math.random() * 13) + 1;
    let streak = 0;
    const payouts = [0, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];

    const render = () => {
        const nextReward = payouts[Math.min(streak + 1, payouts.length - 1)];
        const currentReward = payouts[streak];
        
        modal.innerHTML = `
            <div style="background: rgba(25, 10, 10, 0.95); border: 2px solid #c5a059; border-radius: 12px; width: 100%; max-width: 440px; padding: 20px; box-shadow: 0 0 30px rgba(255, 215, 0, 0.3); text-align: center; box-sizing: border-box;">
                <h2 style="color: #ffdd66; margin: 0 0 5px 0; font-size: 1.5em; text-shadow: 0 0 10px #c5a059;">【闇カジノ：ハイ＆ロー】</h2>
                <div style="color: #bbb; font-size: 0.85em; margin-bottom: 15px;">白鳥が用意した遊戯盤。次のカードの数字を当て続けろ。</div>
                <div style="font-size: 0.95em; color: #ffdd66; margin-bottom: 10px;">所持金: 💰 ${gameState.player.money}</div>

                <div style="margin: 15px auto; width: 110px; height: 155px; background: linear-gradient(135deg, #2a0808, #110000); border: 2px solid #ffdd66; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 0 20px rgba(255,221,102,0.4);">
                    <div style="font-size: 0.75em; color: #aaa; margin-bottom: 5px;">現在の札</div>
                    <div style="font-size: 3.2em; font-weight: bold; color: #ffdd66; text-shadow: 0 0 10px red;">${currentCard}</div>
                    <div style="font-size: 0.7em; color: #888;">(1〜13)</div>
                </div>

                <div style="margin-bottom: 15px; font-size: 0.95em;">
                    <span style="color: #00ff66; font-weight: bold;">連勝数: ${streak} 回</span>
                    <span style="color: #ffaa00; margin-left: 12px; font-weight: bold;">現在の獲得賞金: 💰 ${currentReward}</span>
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                    <button id="btn-high" style="flex: 1; padding: 12px; background: #660000; color: #ffdd66; border: 1px solid #ff3333; font-size: 1.1em; font-weight: bold; cursor: pointer; border-radius: 6px;">▲ HIGH (大きい)</button>
                    <button id="btn-low" style="flex: 1; padding: 12px; background: #002244; color: #66ccff; border: 1px solid #3388ff; font-size: 1.1em; font-weight: bold; cursor: pointer; border-radius: 6px;">▼ LOW (小さい)</button>
                </div>

                <div style="font-size: 0.8em; color: #aaa; margin-bottom: 15px;">次の的中で【💰 ${nextReward}】に倍増！</div>

                <div style="display: flex; gap: 10px;">
                    <button id="btn-cashout" ${streak === 0 ? 'disabled style="flex:1; padding:8px; background:#333; color:#777; border:1px solid #555; border-radius:4px;"' : 'style="flex:1; padding:8px; background:#005500; color:#fff; border:1px solid #00ff66; font-weight:bold; cursor:pointer; border-radius:4px;"'}>賞金を確定して降りる</button>
                    <button id="btn-leave" style="flex: 1; padding: 8px; background: #222; color: #bbb; border: 1px solid #555; cursor: pointer; border-radius: 4px;">やめる</button>
                </div>
            </div>
        `;

        modal.querySelector("#btn-high").onclick = () => playGuess("high");
        modal.querySelector("#btn-low").onclick = () => playGuess("low");
        modal.querySelector("#btn-cashout").onclick = () => {
            gameState.player.money += currentReward;
            modal.remove();
            showMessageDialog(`【勝負終了！】\n賞金 💰${currentReward} を換金して受け取った！`, onComplete);
        };
        modal.querySelector("#btn-leave").onclick = () => {
            modal.remove();
            onComplete();
        };
    };

    const playGuess = (choice) => {
        if (streak === 0 && gameState.player.money >= 100) {
            gameState.player.money -= 100;
        }

        const nextCard = Math.floor(Math.random() * 13) + 1;
        const isHigh = nextCard > currentCard;
        const isLow = nextCard < currentCard;
        const isWin = (choice === "high" && isHigh) || (choice === "low" && isLow);

        if (nextCard === currentCard) {
            alert(`【引き分け！】同じ数字「${nextCard}」が出た！ もう一度！`);
            render();
            return;
        }

        if (isWin) {
            streak++;
            currentCard = nextCard;
            if (streak >= 8) {
                const maxPrize = payouts[8];
                gameState.player.money += maxPrize;
                modal.remove();
                showMessageDialog(`【前人未到の8連勝達成！！】\nディーラー悪魔が悲鳴をあげた！\n最高賞金 💰${maxPrize} を手に入れた！ これで漆黒コートも思いのままだ！`, onComplete);
                return;
            }
            render();
        } else {
            modal.remove();
            showMessageDialog(`【敗北……】\n引いたカードは「${nextCard}」だった！\n予想が外れ、これまでの賞金は全て白鳥の金庫へと没収された……。`, onComplete);
        }
    };

    if (gameState.player.money < 100) {
        showMessageDialog("【ディーラー悪魔】\n「ケケッ！ 所持金が100💰もない貧乏人か？\n……いいぜ、白鳥様の慈悲だ。1ゲーム目はタダで賭けさせてやるよ！ 勝ち上がってみせな！」", () => {
            document.body.appendChild(modal);
            render();
        });
    } else {
        document.body.appendChild(modal);
        render();
    }
}

// 最奥：マダム・白鳥のペントハウス
function handleBossPenthouse(gameState, context, onComplete) {
    if (!gameState.flags) gameState.flags = {};

    if (gameState.flags.cleared7F) {
        showMessageDialog("【ペントハウス：白鳥の間】\nマダム・白鳥の金ピカの虚飾は崩れ去り、ただの空室となっている。\n奥の大階段から【8階】へ進みます……。", () => {
            gameState.lastTransitMethod = 'stairs';
            playFloorTransition(8, () => {
                context.changeFloor(8);
                onComplete();
            });
        });
        return;
    }

    const clearedCount = ["clearedTaxidermyKageyama", "clearedTaxidermySanada", "clearedTaxidermyRina", "clearedTaxidermyHirunuma"].filter(k => gameState.flags[k]).length;
    if (clearedCount < 4) {
        showMessageDialog(`【白鳥のペントハウス扉】\n重厚な扉には4つの黄金の鎖が巻き付いている。\n（※フロア内の剥製展示室にいる4体のボスを全て撃破しないと開かない。現在: ${clearedCount}/4 体撃破）`, onComplete);
        return;
    }

    showConversationDialog(
        "assets/images/demon/7f-shiratori.png", 
        "【タワマンマダム・白鳥】\n「本当つまらない庶民ね\n頭も良くないんでしょうね\n私のまぁまぁ気に入ってたコレクションを４つも台無しにして……あなたの無価値な命を何度すり潰しても足りないわ。\n肉は美味しそうだから削ぎ取って今夜のディナーのステーキと唐揚げにしてあげる\n……でも、そうね。ひとつ許される方法があるわ。\nあなた、神父の力を受け継いでいるんでしょう？ なかなか珍しいモノを持ってるじゃない。\nそれがあれば他の悪魔も支配できそうよね\nどう？ ここで私に土下座して『永遠の奴隷になります』って誓約書に血判を押すなら、命だけは助けてあげるわよ？\nほら、さっさとひざまずきなさい、頭が悪い庶民だけど、ペットぐらいならできるでしょ！」", 
        () => {
            playVideo("assets/images/demon/7f-shiratori.mp4", () => {
                const shiratoriBoss = {
                    name: "マダム・白鳥（強欲の化身）",
                    image: "assets/images/demon/7fshiratoriakuma.png",
                    hp: 1200,
                    atk: 85,
                    def: 12,
                    weakness: [7, 9],
                    actions: [
                        "の鋭利な角が黄金の魔力をスパークさせる！",
                        "は『マネーストーム』を放った！ 猛烈な金貨の嵐が降り注ぐ！",
                        "の宝石が妖しく輝き、強欲の波動が精神を締め付ける！",
                        "は高笑いしながら宝石の爪で引き裂いてきた！"
                    ]
                };

                openCombatUI(shiratoriBoss, gameState, (res) => {
                    if (res === "win") {
                        gameState.flags.cleared7F = true;
                        gameState.player.money += 5000;
                        
                        showMessageDialog(
                            "【マダム・白鳥 討滅！】\n「私が偉そうだって？？当たり前じゃない、偉いんだから\nねぇ、見逃してくれたらあなたの好きにしていいのよ、私、今夜は飲みに行きたい気分\n\nぐはぁ（口から液体が溢れる）\n\nいや、崩れる、顔が崩れる\n助けなさいよ、このグズッ\n\nいやだ、庶民には戻りたくないぃぃぃぃっ……！！」\n\n主人公「庶民にも、戻す気はないよ」\n\n（白鳥の全身を覆っていた黄金がドロドロに溶け崩れ、ただの灰となって消滅した……。）\n（💰5,000 を獲得！）",
                            () => {
                                showMessageDialog(
                                    "【次なる目的】\n強欲の魔女を倒した。\nスタート地点横のVIPエレベーターで1階の集合ポストへ向かえば、決戦用防具『エクソシストの漆黒コート』を取り寄せられるはずだ。\n\n準備が整い次第、奥の大階段から【8F：最上階】へ挑もう！",
                                    onComplete
                                );
                            }
                        );
                    } else {
                        onComplete();
                    }
                }, context);
            });
        }
    );
}

// 7F 通常ランダムエンカウント
export function check7FRandomEncounter(gameState, context, onComplete) {
    const roll = Math.random();
    if (roll > 0.18) {
        if (onComplete) onComplete();
        return;
    }

    const isCop = Math.random() < 0.5;
    const enemy = isCop ? {
        name: "取り憑かれた悪徳警官",
        image: "assets/images/demon/demon17.png",
        hp: 250,
        atk: 55,
        def: 8,
        weakness: [4, 7],
        actions: [
            "の構えた銃口から銃弾が放たれる！",
            "は『公務執行妨害だ』と濁った声で呟き警棒を振り下ろした！",
            "は白鳥の金バッジを握りしめ、獲物を威嚇している！"
        ]
    } : {
        name: "極道ゾンビ",
        image: "assets/images/demon/demon16.png",
        hp: 300,
        atk: 60,
        def: 5,
        weakness: [2, 9],
        actions: [
            "の抜き身のドスが閃光のように走る！",
            "は胸の刺青を露わにして野獣のように咆哮した！",
            "の凄まじい威圧感が全身を金縛りにする！"
        ]
    };

    openCombatUI(enemy, gameState, (res) => {
        if (onComplete) onComplete();
    }, context);
}