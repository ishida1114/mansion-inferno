// maps/map7F.js - 7F「黄金の狂宴（VIPラウンジ）」＆ マダム・白鳥 決戦

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openBossPuzzleUI, openCombatUI, openInquisitionUI 
} from '../ui.js';

// 6Fからの階段を上がったスタート位置
export const playerStart7F = { x: 5, y: 8, dir: 0 };

/*
  1: 壁, 0: 通路(レッドカーペット), 2: 扉
  4: 6Fへの下り階段 (5, 9)
  5: 8Fへの上り階段 (5, 0)
  
  真っ直ぐなレッドカーペットの通路と、左右のVIPルームという構造
*/
export const map7F = [
    [1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1], // y=0 (5: 8Fへの階段)
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1], // y=1 (2: ボス部屋の扉)
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // y=2
    [1, 1, 2, 0, 0, 0, 0, 0, 2, 1, 1], // y=3 (左: 703 宝物庫 / 右: 704 鑑定室)
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // y=4
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // y=5
    [1, 1, 2, 0, 0, 0, 0, 0, 2, 1, 1], // y=6 (左: 701 浪費の間 / 右: 702 スロットルーム)
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // y=7
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // y=8 (開始地点: 5,8)
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1], // y=9 (4: 6Fへの階段)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // y=10
];

export function check7FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 7) return;
    
    // 初回進入時の演出
    if (!gameState.flags) gameState.flags = {};
    if (!gameState.flags.seen7FIntro) {
        gameState.flags.seen7FIntro = true;
        showMessageDialog("【7階：VIPラウンジ】\n扉を開けた瞬間、むせ返るような高級香水の匂いが漂ってきた。\nコンクリート剥き出しの廃墟だったはずのマンションが、眩い白大理石と真紅のカーペットに彩られている。", () => {
            showMessageDialog("「……なんだこの階は。ボロボロのコンクリート壁の上に、無理やり大理石のハリボテを貼り付けたのか？」\n\nよく見れば、黄金の装飾の端は剥がれ、みっともない廃墟の地肌が見え隠れしている。", () => {
                showMessageDialog("壁の向こうから、女の高笑いが響いてきた。\n\n『あぁ、気分がいいわ！ 全てはお金、お金さえあれば誰も私を見下せない！』\n\n主人公「……悪趣味極まりないな。さっさと最奥にいる『強欲の主』を叩き潰して、上へ行こう」", () => {
                    if (onEncounter) onEncounter(null);
                });
            });
        });
        return;
    }

    // 15%の確率で強欲をテーマにしたエンカウント
    if (Math.random() < 0.15) {
        const demonTypes = [
            { id: 'DEVIL16_7F', name: '浪費の亡者', image: 'assets/images/demon/demon13.png', hp: 400, atk: 65, def: 15, weakness: [1], agi: 18 },
            { id: 'DEVIL17_7F', name: '黄金の番犬', image: 'assets/images/demon/demon14.jpg', hp: 350, atk: 80, def: 10, weakness: [8], agi: 25 },
            { id: 'DEVIL18_7F', name: '鑑定士の悪霊', image: 'assets/images/demon/demon15.png', hp: 450, atk: 55, def: 20, weakness: [5], agi: 15 }
        ];
        const chosenEnemy = demonTypes[Math.floor(Math.random() * demonTypes.length)];
        if (onEncounter) onEncounter({ ...chosenEnemy });
    }
}

export function handleEvent7F(targetCell, gameState, context) {
    if (!gameState.flags) gameState.flags = {};

    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                showMessageDialog("【非常階段】\n6階へ降りますか？", () => {
                    gameState.lastTransitMethod = 'stair_down';
                    playFloorTransition(6, () => { context.changeFloor(6); onComplete(); });
                });
            }
        };
    }

    if (targetCell === 5) {
        if (!gameState.flags.cleared7F) {
            return {
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n純金でコーティングされた巨大な南京錠がかかっている。\nフロアの主（マダム・白鳥）を倒さなければ開かないようだ。", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    showMessageDialog("【非常階段】\n8階（最上階）へ昇りますか？", () => {
                        gameState.lastTransitMethod = 'stair';
                        playFloorTransition(8, () => { context.changeFloor(8); onComplete(); });
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

        if (frontX === 2 && frontY === 6) return { run: (onComplete) => handleRoom701(gameState, context, onComplete) };
        if (frontX === 8 && frontY === 6) return { run: (onComplete) => handleRoom702(gameState, context, onComplete) };
        if (frontX === 2 && frontY === 3) return { run: (onComplete) => handleRoom703(gameState, context, onComplete) };
        if (frontX === 8 && frontY === 3) return { run: (onComplete) => handleRoom704(gameState, context, onComplete) };
        if (frontX === 5 && frontY === 1) return { run: (onComplete) => handleBossRoom7F(gameState, context, onComplete) };
    }

    return null;
}

// ----------------------------------------------------
// 各VIPルームのイベント
// ----------------------------------------------------

function handleRoom701(gameState, context, onComplete) {
    if (gameState.flags.cleared701) {
        showMessageDialog("【701：VIP客室】\n大量の高級ブランド品の空箱が散乱している。", onComplete);
        return;
    }

    showConversationDialog("assets/images/human1.png", "【扉の前の悪霊】\n「おっと、この先はVIP専用だ。通るなら『入場料』として 300 💰 か、お前の『血（HP50）』を支払え」\n\n主人公（悪魔に通行料を払うつもりはないが、強行突破するか……？）", () => {
        const entity = {
            type: "demon", name: "強欲なドアマン", faceImage: "assets/images/human1.png",
            realImage: "assets/images/demon/demon13.png", weakness: 1
        };
        openInquisitionUI(entity, gameState, (res) => {
            if (res === "combat_win" || res === "kill_human") {
                gameState.flags.cleared701 = true;
                if (!gameState.bossHints) gameState.bossHints = [];
                gameState.bossHints.push("【7F 術式メモ・壱】<br>「マダムの強欲を打ち砕く魔方陣の合計値は『30』。<br>頂点（①）には、全てを平らげる【Ⅷ 暴食】のカードを置け」");
                showMessageDialog("【悪魔の討滅】\n倒れた悪霊の懐から、術式の手記を見つけた。\n（※悪魔手記に記録されました）", onComplete);
            } else { onComplete(); }
        }, context);
    });
}

function handleRoom702(gameState, context, onComplete) {
    if (gameState.flags.cleared702) {
        showMessageDialog("【702：カジノルーム】\nスロットマシンの残骸が転がっている。", onComplete);
        return;
    }

    showMessageDialog("【702：カジノルーム】\n部屋の中に黄金に輝くスロットマシンがある。\n『1回 100 💰。当たれば体力全快！ 外れれば……』", () => {
        const choice = confirm("100 💰 支払ってスロットを回しますか？（所持金: " + gameState.player.money + "）");
        if (choice) {
            if (gameState.player.money >= 100) {
                gameState.player.money -= 100;
                if (Math.random() < 0.5) {
                    gameState.player.hp = gameState.player.maxHp;
                    gameState.flags.cleared702 = true;
                    showMessageDialog("【大当たり！！】\nジャラジャラと回復薬が飛び出し、HPが全快した！\n……スロットマシンは満足して機能を停止した。", onComplete);
                } else {
                    gameState.player.hp = Math.max(1, gameState.player.hp - 50);
                    showMessageDialog("【ハズレ】\nマシンから毒ガスが噴出し、50ダメージを受けた！", onComplete);
                }
            } else {
                showMessageDialog("お金が足りないようだ……。", onComplete);
            }
        } else {
            onComplete();
        }
    });
}

function handleRoom703(gameState, context, onComplete) {
    if (gameState.flags.cleared703) {
        showMessageDialog("【703：宝物庫】\nもう金目のものは残っていない。", onComplete);
        return;
    }

    showMessageDialog("【703：宝物庫】\n部屋の奥に、豪華な装飾が施された金庫がある。\nしかし、宝を守る『黄金の番犬』が襲い掛かってきた！", () => {
        const miniBoss = { name: "黄金の番犬", image: "assets/images/demon/demon14.jpg", hp: 600, atk: 85, def: 25, weakness: [8], agi: 22 };
        openCombatUI(miniBoss, gameState, (res) => {
            if (res === "win" || res === "combat_win") {
                gameState.flags.cleared703 = true;
                gameState.player.money += 2000;
                
                if (!gameState.bossHints) gameState.bossHints = [];
                gameState.bossHints.push("【7F 術式メモ・弐】<br>「マダムの足元（⑤）には、偽りの美を映す【Ⅱ 鏡】を。<br>右腕（④）には、虚無を切り裂く【Ⅰ 剣】を配置せよ」");
                
                showMessageDialog("番犬を撃破した！\n金庫の中から 2000 💰 と、ボスに関する手記の切れ端を発見した。\n（※悪魔手記に記録されました）", onComplete);
            } else { onComplete(); }
        }, context);
    });
}

function handleRoom704(gameState, context, onComplete) {
    showMessageDialog("【704：鑑定室】\nショーケースの中に大量の宝石が並べられているが、よく見るとすべてガラス玉だ。\n「所詮は見栄。本物なんて一つもない……」", onComplete);
}

// ----------------------------------------------------
// 7F ボス部屋（マダム・白鳥）
// ----------------------------------------------------

function handleBossRoom7F(gameState, context, onComplete) {
    if (gameState.flags.cleared7F) {
        showMessageDialog("【ペントハウス：プレジデンシャルスイート】\nドロドロに溶けた黄金の跡だけが残り、静寂が支配している。\nいよいよ次は、最上階だ。", onComplete);
        return;
    }

    showConversationDialog("assets/images/demon/demon13.png", "【タワマンマダム・白鳥】\n部屋の奥。毛皮のコートを着た女が、大量の札束や宝石に埋もれるように座っている。\nしかしその顔や身体は、どろどろに溶けた黄金のスライムと化していた。\n\n「あら、貧乏人が何の用？ ここの空気を吸うだけでも、あなたには高すぎるわよ」", () => {
        showMessageDialog("主人公「……その惨めな姿を鏡で見てから言うんだな。死んでも金にしがみつく、その『強欲』の悪夢をここで終わらせる」\n\n白鳥「口の減らないガキね！ 愛も命も、結局はお金で買えるのよ！ 違うと言うなら、あなたの価値を証明してみなさい！！」", () => {
            
            const puzzleConfig = {
                title: "【魔方陣術式】強欲の権化（マダム・白鳥）",
                subTitle: "6マスの合計値を『30』にし、見栄と強欲を打ち砕け",
                bossName: "マダム・白鳥",
                slots: [
                    { id: "slot-top", label: "①頂の玉座", gridPos: "grid-area: 1 / 2;" },
                    { id: "slot-tl", label: "②虚飾の左腕", gridPos: "grid-area: 2 / 1;" },
                    { id: "slot-tr", label: "③傲慢の右腕", gridPos: "grid-area: 2 / 3;" },
                    { id: "slot-bl", label: "④強欲の左座", gridPos: "grid-area: 3 / 1;" },
                    { id: "slot-bottom", label: "⑤泥沼の足元", gridPos: "grid-area: 3 / 2;" },
                    { id: "slot-br", label: "⑥見栄の右座", gridPos: "grid-area: 3 / 3;" }
                ]
            };

            openBossPuzzleUI(puzzleConfig, gameState, (slots) => {
                const getCardNum = (id) => typeof slots[id] === 'number' ? slots[id] : 0;
                // 今回は 頂点(①)=top, 足元(⑤)=bottom, 右腕(③)=tr にヒントを割り当て
                const valTop = getCardNum("slot-top");
                const valTL = getCardNum("slot-tl");
                const valTR = getCardNum("slot-tr");
                const valBL = getCardNum("slot-bl");
                const valBottom = getCardNum("slot-bottom");
                const valBR = getCardNum("slot-br");

                const allVals = [valTop, valTL, valTR, valBL, valBottom, valBR];
                const sum = allVals.reduce((a, b) => a + b, 0);
                const isUnique = new Set(allVals).size === 6;

                // ヒント：①(top)=8, ⑤(bottom)=2, ③(tr)=1
                let isPerfect = (valTop === 8 && valBottom === 2 && valTR === 1 && sum === 30 && isUnique);

                const bossEnemy = {
                    name: "マダム・白鳥", image: "assets/images/demon/demon13.png", 
                    hp: isPerfect ? 600 : 1500, maxHp: 1500, atk: isPerfect ? 65 : 95, def: isPerfect ? 15 : 35, weakness: [1, 8], agi: 20
                };

                const startBossBattle = () => {
                    openCombatUI(bossEnemy, gameState, (res) => {
                        if (res === "win" || res === "combat_win") {
                            gameState.flags.cleared7F = true;
                            
                            showMessageDialog("【強欲の討滅】\n「嘘よ……私の、私のお金がぁあああっ！！」\n白鳥の絶叫と共に、黄金の装飾がパラパラと砂のように崩れ落ち、ただのコンクリートの廃墟へと戻っていく。", () => {
                                showMessageDialog("主人公「……終わったな。残るは8階……『御堂』だけだ。」\n\n主人公はふと息をつき、装備の劣化に気づく。\n「だが、この装備じゃ最上階は厳しいか……。そういえば、1階の郵便ポストから『高級防具の支給要請』が出せたんだったな」", () => {
                                    showMessageDialog("【システムガイド】\n※マダム・白鳥を撃破し、最高ランクの防具解放フラグが立ちました！\n1Fのエントランスに戻って、ポストに手紙を投函してください！\n（非常階段で一気に1Fまで降りられます）", onComplete);
                                });
                            });
                        } else { onComplete(); }
                    }, context);
                };

                if (isPerfect) {
                    showMessageDialog("【完全解呪成功！】\n魔方陣が黄金の光を放つ！ 白鳥の強欲の呪いが解け、防御力が大幅に低下した！", () => {
                        startBossBattle();
                    });
                } else {
                    showMessageDialog(`【術式解呪失敗……（合計: ${sum}）】\n呪いを解ききれず、白鳥が黄金の魔力を纏って襲いかかってくる！`, startBossBattle);
                }
            });
        });
    });
}