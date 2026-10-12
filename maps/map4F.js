// maps/map4F.js - マップデザイン刷新＆査問部屋（ヒント獲得）追加完全版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openShopUI, openCombatUI, openInquisitionUI, openBossPuzzleUI 
} from '../ui.js';
import { ENEMIES, evaluateRinaPuzzle } from '../enemies.js';

// 4Fスタート位置（x: 5, y: 8, 北向き）
export const playerStart4F = { x: 5, y: 8, dir: 0 };

// 1:壁 / 0:通路 / 4:3F下り階段 / 5:5F上り階段(結界) / 3:ボス(リナ) 
// 2:親衛隊A部屋 / 6:親衛隊B部屋 / 8:査問部屋1 / 9:査問部屋2
export const map4F = [
    [1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1], // y=0: 5F階段(x:5, y:0)
    [1, 3, 1, 0, 0, 0, 0, 0, 1, 2, 1], // y=1: リナボス部屋(x:1, y:1), 親衛隊A(x:9, y:1)
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1], // y=2
    [1, 0, 0, 0, 1, 8, 1, 0, 0, 0, 1], // y=3: 査問部屋1(x:5, y:3)
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1], // y=4
    [1, 6, 1, 0, 0, 0, 0, 0, 1, 9, 1], // y=5: 親衛隊B(x:1, y:5), 査問部屋2(x:9, y:5)
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], // y=6
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1], // y=7
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1], // y=8
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1], // y=9: 3F下り階段(x:5, y:9)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // y=10
];

export function check4FRandomEncounter(gameState, onEncounter) {
    if (gameState.currentFloor !== 4) return;
    if (Math.random() < 0.15) {
        const demonKeys = ['DEVIL7_4F', 'DEVIL8_4F', 'DEVIL9_4F'];
        const chosenKey = demonKeys[Math.floor(Math.random() * demonKeys.length)];
        const demonData = ENEMIES[chosenKey] || ENEMIES['DEVIL7_4F'];
        onEncounter({ ...demonData });
    }
}

export function handleEvent4F(targetCell, gameState, context) {
    // 4: 3Fへ降りる非常階段
    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                showMessageDialog("【非常階段】\n3階へ降りますか？", () => {
                    gameState.lastTransitMethod = 'stair';
                    playFloorTransition(3, () => {
                        context.changeFloor(3);
                        onComplete();
                    });
                });
            }
        };
    }

    // 5: 5Fへ登る非常階段（リナ討滅で解放）
    if (targetCell === 5) {
        if (!gameState.flags || !gameState.flags.cleared4F) {
            return {
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n甘い桃色の霧と太い肉の蔦が階段を固く閉ざしている！\nフロアボスの『リナ』を倒さなければ先へ進めない！", onComplete)
            };
        } else {
            return {
                run: (onComplete) => {
                    gameState.lastTransitMethod = 'stair';
                    playFloorTransition(5, () => {
                        context.changeFloor(5);
                        onComplete();
                    });
                }
            };
        }
    }

    // 2: ギミック部屋A（リナ親衛隊A・元富裕層パパ）
    if (targetCell === 2) {
        return {
            run: (onComplete) => startShineiAEvent(gameState, context, onComplete)
        };
    }

    // 6: ギミック部屋B（リナ親衛隊B・ガチ恋ファン）
    if (targetCell === 6) {
        return {
            run: (onComplete) => startShineiBEvent(gameState, context, onComplete)
        };
    }

    // 8, 9: 査問部屋（ヒント入手場所）
    if (targetCell === 8 || targetCell === 9) {
        return {
            run: (onComplete) => start4FRoomInquisition(gameState, context, onComplete)
        };
    }

    // 3: 4Fボス部屋（リナ）
    if (targetCell === 3) {
        if (gameState.flags && gameState.flags.cleared4F) {
            return {
                run: (onComplete) => showMessageDialog("【最奥の部屋】\nリナの悪霊は浄化され、甘ったるい香気は静まり返っている……。", onComplete)
            };
        }

        const hasBag = gameState.flags && gameState.flags.hasBrandBag;
        const hasChampagne = gameState.flags && gameState.flags.hasChampagne;

        if (!hasBag || !hasChampagne) {
            return {
                run: (onComplete) => showMessageDialog("【色欲の扉】\n妖艶なピンクの結界が部屋を塞いでいる……！\n扉の前には絢爛な台座があり、リナへ捧げる『貢ぎ物（ブランドバッグ＆高級シャンパン）』を置く必要がありそうだ。", onComplete)
            };
        }

        return {
            run: (onComplete) => startRinaBossSequence(gameState, context, onComplete)
        };
    }

    return null;
}

// ★ 4F査問部屋（住人救出 ➔ リナの解読ヒント入手）
function start4FRoomInquisition(gameState, context, onComplete) {
    const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
    const vec = dirVectors[gameState.player.dir];
    const frontX = gameState.player.x + vec.x;
    const frontY = gameState.player.y + vec.y;
    const roomKey = `4F_${frontX}_${frontY}`;

    if (!gameState.clearedRooms) gameState.clearedRooms = {};

    if (gameState.clearedRooms[roomKey]) {
        showMessageDialog("【住人の部屋】\nこの部屋にはもう誰もいない……。", onComplete);
        return;
    }

    const grantRinaHint = (messageTitle, callback) => {
        if (!gameState.bossHints) gameState.bossHints = [];
        const hintMsg = "【4F住人の証言】リナの魔方陣は、上（瞳）に『真実の鏡(2)』、右（腕）に『聖書(5)』を配置して誘惑を打ち破るんだ！";
        if (!gameState.bossHints.includes(hintMsg)) {
            gameState.bossHints.push(hintMsg);
        }
        showMessageDialog(`${messageTitle}\n『リナ攻略メモ』がスマホの悪魔手記に記録された！`, callback);
    };

    const isRealHuman = Math.random() < 0.5;

    if (isRealHuman) {
        const entity = {
            type: "human",
            name: "マンションの住人",
            faceImage: "assets/images/human1.png"
        };
        openInquisitionUI(entity, gameState, (res) => {
            if (res === "finish" || res === "combat_win" || res === "kill_human") {
                gameState.clearedRooms[roomKey] = true;
                grantRinaHint("【住人を保護した】", onComplete);
            } else {
                onComplete();
            }
        }, context);
    } else {
        const entity = {
            type: "demon",
            name: "マンションの住人",
            faceImage: "assets/images/human1.png",
            realImage: "assets/images/demon/demon7.jpg",
            weakness: 2
        };
        openInquisitionUI(entity, gameState, (res) => {
            if (res === "combat_win" || res === "kill_human") {
                gameState.clearedRooms[roomKey] = true;
                grantRinaHint("【悪魔を討滅した】\n悪魔の残骸から手記を発見した！", onComplete);
            } else if (res === "demon_ambush") {
                gameState.player.hp = Math.max(1, gameState.player.hp - 10);
                const demonEnemy = {
                    name: entity.name,
                    image: entity.realImage,
                    hp: 40,
                    atk: 14,
                    def: 2,
                    weakness: [entity.weakness]
                };
                openCombatUI(demonEnemy, gameState, (cRes) => {
                    if (cRes === "win") {
                        gameState.clearedRooms[roomKey] = true;
                        grantRinaHint("【悪魔を討滅した】\n悪魔の残骸から手記を発見した！", onComplete);
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

function startShineiAEvent(gameState, context, onComplete) {
    if (gameState.flags && gameState.flags.defeatedShineiA) {
        showMessageDialog("【豪奢な部屋】\n衰弱しきった男が横たわっている……もう戦う気力はないようだ。", onComplete);
        return;
    }

    showConversationDialog("assets/images/demon/shineia.png", "【リナ親衛隊A・元富裕層の男】\n「リナちゃん……！ 今月も僕がナンバーワンのパパだよね……？ ほら、カード限度額まで切ったよ……！\n……ん？ お前誰だ……？ リナちゃんに近づくな！！ 俺の口座はもう空だけど、この命を捧げればリナちゃんは僕だけを愛してくれるんだァァァッ！！」", () => {
        const enemyA = {
            name: ENEMIES.SHINEI_A_4F.name,
            image: "assets/images/demon/shineia.png",
            hp: ENEMIES.SHINEI_A_4F.hp,
            maxHp: ENEMIES.SHINEI_A_4F.hp,
            atk: ENEMIES.SHINEI_A_4F.atk,
            def: ENEMIES.SHINEI_A_4F.def,
            weakness: [2]
        };

        openCombatUI(enemyA, gameState, (res) => {
            if (res === 'win') {
                if (!gameState.flags) gameState.flags = {};
                gameState.flags.defeatedShineiA = true;
                gameState.flags.hasBrandBag = true;

                showConversationDialog("assets/images/demon/shineia.png", "【リナ親衛隊A】\n「苦しかったけど、楽しかった、リナちゃんに貢いでる時だけが生きてる感じがした、解放されて寂しくなる。。。（息絶えた）」", () => {
                    showItemAcquiredModal("assets/images/cards/1Card.png", "高級ブランドバッグ", "【貢ぎ物キーアイテム】\nリナ親衛隊Aが大事に抱え込んでいた『高級ブランドバッグ』を手に入れた！", onComplete);
                });
            } else {
                onComplete();
            }
        }, context);
    });
}

function startShineiBEvent(gameState, context, onComplete) {
    if (gameState.flags && gameState.flags.defeatedShineiB) {
        showMessageDialog("【密室の部屋】\n男が力尽きて倒れている……壁一面にリナの写真が貼られている。", onComplete);
        return;
    }

    showConversationDialog("assets/images/demon/shineib.png", "【リナ親衛隊B・狂信的ファン】\n「リナちゃんを傷つける害虫は許さない……！ 彼女の言葉は絶対なんだ！\n『あいつ（主人公）生意気だから消して♡』って、リナちゃんが僕に頼んでくれたんだよ！？ 彼女の役に立てるなら、俺は悪魔にだって魂を売る！！ 死ねぇぇぇっ！！」", () => {
        const enemyB = {
            name: ENEMIES.SHINEI_B_4F.name,
            image: "assets/images/demon/shineib.png",
            hp: ENEMIES.SHINEI_B_4F.hp,
            maxHp: ENEMIES.SHINEI_B_4F.hp,
            atk: ENEMIES.SHINEI_B_4F.atk,
            def: ENEMIES.SHINEI_B_4F.def,
            weakness: [5]
        };

        openCombatUI(enemyB, gameState, (res) => {
            if (res === 'win') {
                if (!gameState.flags) gameState.flags = {};
                gameState.flags.defeatedShineiB = true;
                gameState.flags.hasChampagne = true;

                showConversationDialog("assets/images/demon/shineib.png", "【リナ親衛隊B】\n「リナちゃんが俺だけじゃないなんて知ってたよ、でもリナちゃんはたくさんいないと寂しさが埋まらないんだ、それは俺だけが知ってるんだ。。。（息絶えた）」", () => {
                    showItemAcquiredModal("assets/images/cards/1Card.png", "高級シャンパン", "【貢ぎ物キーアイテム】\nリナ親衛隊Bが祭壇に捧げていた『高級シャンパン』を手に入れた！", onComplete);
                });
            } else {
                onComplete();
            }
        }, context);
    });
}

function startRinaBossSequence(gameState, context, onComplete) {
    showMessageDialog("【台座に貢ぎ物を設置】\n『高級ブランドバッグ』と『高級シャンパン』を台座に並べた。\n桃色の結界が霧散し、最奥の扉が開いた……！", () => {
        playVideo("assets/images/demon/4f-rina.mp4", () => {
            showConversationDialog("assets/images/demon/4f-rina.jpg", "【色欲・リナ】\n「みんなひどいことばっかり言うの、私は弱いのに、私の強がりをわかってくれない。困ってるの、男のひとはみんな怖い、あなたは？あなたも怖いの？助けて、私の強いひと」", () => {
                const puzzleConfig = {
                    title: "【4Fボス解読】色欲のパパ活女子・リナ",
                    subTitle: "甘い誘惑と精神攻撃を断ち切れ",
                    bossName: "リナ",
                    slots: [
                        { id: '1', label: '上：惑わしの瞳', gridPos: 'grid-area: 1 / 2;' },
                        { id: '3', label: '左：色香の腕', gridPos: 'grid-area: 2 / 1;' },
                        { id: '5', label: '右：誘惑の腕', gridPos: 'grid-area: 2 / 3;' },
                        { id: '7', label: '下：執着の足', gridPos: 'grid-area: 3 / 2;' }
                    ]
                };

                openBossPuzzleUI(puzzleConfig, gameState, (placedSlots) => {
                    const evalResult = typeof evaluateRinaPuzzle === 'function' ? evaluateRinaPuzzle(placedSlots) : { result: 'FAIL', correctCount: 0 };

                    const applyDamageAndCombat = () => {
                        const floor = 4;
                        const targetLevel = (floor - 1) * 5;
                        const playerLevel = gameState.player.level;

                        let hpRatio = 1.0;
                        let resultMsg = "";

                        if (evalResult.result === 'PERFECT') {
                            if (playerLevel >= targetLevel) {
                                hpRatio = 0.2;
                                resultMsg = `【完全正解！】適正レベル(Lv.${targetLevel})到達！\n陣が眩く輝き、リナの体力を 8割削減 した！`;
                            } else {
                                hpRatio = 0.5;
                                resultMsg = `【完全正解！】魔方陣の解読に成功！\n聖なる光が吹き荒れ、リナの体力を 半減 させた！`;
                            }
                        } else if (evalResult.result === 'PARTIAL') {
                            const reductionRate = Math.min(evalResult.correctCount * 0.1, 0.3);
                            hpRatio = 1.0 - reductionRate;
                            resultMsg = `【部分正解】${evalResult.correctCount}箇所の弱点が合致！\nリナの体力を ${Math.round(reductionRate * 100)}% 削減した！`;
                        } else {
                            hpRatio = 1.0;
                            resultMsg = `【解読失敗】不完全な陣だ！ ダメージを与えられなかった！`;
                        }

                        const baseHp = ENEMIES.RINA_4F ? ENEMIES.RINA_4F.hp : 150;
                        const startHp = Math.max(1, Math.floor(baseHp * hpRatio));

                        showMessageDialog(`${resultMsg}\nリナとの決戦に入る！`, () => {
                            const rinaEnemy = {
                                name: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.name : "色欲のパパ活女子・リナ",
                                image: "assets/images/demon/4f-rina.jpg",
                                hp: startHp,
                                maxHp: baseHp,
                                atk: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.atk : 22,
                                def: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.def : 4,
                                weakness: [2, 5]
                            };

                            openCombatUI(rinaEnemy, gameState, (combatRes) => {
                                if (combatRes === 'win') {
                                    if (!gameState.flags) gameState.flags = {};
                                    gameState.flags.cleared4F = true;
                                    if (gameState.saveGame) gameState.saveGame();

                                    gameState.player.x = 1;
                                    gameState.player.y = 1;
                                    gameState.player.dir = 2;

                                    const reward = gameState.calculateRewards ? gameState.calculateRewards(300, 1200) : { exp: 300, money: 1200 };
                                    gameState.player.money += reward.money;
                                    const isLvUp = gameState.gainExp(reward.exp);
                                    
                                    const capNotice = reward.isCapped ? "\n※レベル上限超過により獲得量減衰" : "";

                                    showConversationDialog("assets/images/demon/4f-rina.jpg", "【色欲・リナ】\n「バカじゃないの、この悪魔！ 中学生の父親？ あいつはなびかないから5Fの蛭沼に渡したわ、あいつ、改造できるおもちゃを欲しがってたから。ねぇ助けてよ……お願いだから捨てないでぇぇっ…」", () => {
                                        showMessageDialog(`【4Fフロアボス討滅！】\nリナの怨霊を浄化し、甘い桃色の霧と蔦が消え去った！\n（💰${reward.money} 獲得 / ${reward.exp} EXP獲得）${isLvUp ? '\n★ レベルアップ！' : ''}${capNotice}\n※5階への非常階段が解禁されました！`, onComplete);
                                    });
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
    });
}