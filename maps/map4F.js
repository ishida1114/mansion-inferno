// maps/map4F.js - 黒猫霊体レスキューイベント追加＆親衛隊・ボス全機能維持 完全版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openShopUI, openCombatUI, openInquisitionUI, openBossPuzzleUI 
} from '../ui.js';
import { ENEMIES, evaluateRinaPuzzle } from '../enemies.js';
import { sound } from '../sound.js'; // ★黒猫のSE再生用

export const playerStart4F = { x: 5, y: 8, dir: 0 };

// 5: 5Fへの上り階段 / 4: 3Fへの下り階段 / 2: 全ての部屋の扉
export const map4F = [
    [1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1], 
    [1, 2, 1, 0, 0, 0, 0, 0, 1, 2, 1], // (1,1)リナ部屋 / (9,1)親衛隊A
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1], // (5,3)査問部屋1
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 2, 1, 0, 0, 0, 0, 0, 1, 2, 1], // (1,5)親衛隊B / (9,5)査問部屋2
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1], 
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  
];

// 残留しているピンクのもやを画面から消去
function clearPinkMist() {
    const mist = document.getElementById('pink-mist-overlay');
    if (mist) mist.remove();
}

export function check4FRandomEncounter(gameState, onEncounter) {
    clearPinkMist();
    if (gameState.currentFloor !== 4) return;

    if (Math.random() < 0.15) {
        const demonKeys = ['DEVIL7_4F', 'DEVIL8_4F', 'DEVIL9_4F'];
        const chosenKey = demonKeys[Math.floor(Math.random() * demonKeys.length)];
        const demonData = ENEMIES[chosenKey] || ENEMIES['DEVIL7_4F'];
        
        const scaledEnemy = { ...demonData, rewardExp: 80, rewardMoney: 250 };
        onEncounter(scaledEnemy);
    }
}

export function handleEvent4F(targetCell, gameState, context) {
    clearPinkMist();

    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                showMessageDialog("【非常階段】\n3階へ降りますか？", () => {
                    gameState.lastTransitMethod = 'stair_down';
                    playFloorTransition(3, () => {
                        clearPinkMist();
                        context.changeFloor(3);
                        onComplete();
                    });
                });
            }
        };
    }

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
                        clearPinkMist();
                        context.changeFloor(5);
                        onComplete();
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

        // X:1, Y:1 -> リナのボス部屋
        if (frontX === 1 && frontY === 1) {
            if (gameState.flags && gameState.flags.cleared4F) {
                return {
                    run: (onComplete) => showMessageDialog("【最奥の部屋】\nリナの悪霊は浄化され、甘ったるい香気は完全に静まり返っている……。", onComplete)
                };
            }

            const hasBag = gameState.flags && gameState.flags.hasBrandBag;
            const hasChampagne = gameState.flags && gameState.flags.hasChampagne;

            if (!hasBag || !hasChampagne) {
                return {
                    run: (onComplete) => showMessageDialog("【色欲の扉】\n妖艶なピンクの結界が部屋を塞いでいる……！\n扉の前には絢爛な台座があり、リナへ捧げる『貢ぎ物（ブランドバッグ＆高級シャンパン）』を置く必要がありそうだ。", onComplete)
                };
            }

            return { run: (onComplete) => startRinaBossSequence(gameState, context, onComplete) };
        }

        // X:9, Y:1 -> 親衛隊Aイベント（高級ブランドバッグ）
        if (frontX === 9 && frontY === 1) {
            return { run: (onComplete) => startShineiAEvent(gameState, context, onComplete) };
        }

        // X:1, Y:5 -> 親衛隊Bイベント（高級シャンパン）
        if (frontX === 1 && frontY === 5) {
            return { run: (onComplete) => startShineiBEvent(gameState, context, onComplete) };
        }

        // X:5, Y:3 -> 査問部屋1（ヒント1）
        if (frontX === 5 && frontY === 3) {
            return { run: (onComplete) => start4FRoomInquisition(gameState, context, onComplete, 8) };
        }

        // X:9, Y:5 -> 査問部屋2（ヒント2）
        if (frontX === 9 && frontY === 5) {
            return { run: (onComplete) => start4FRoomInquisition(gameState, context, onComplete, 9) };
        }
    }

    return null;
}

// 査問部屋（ヒント付与と名前の偽装）
function start4FRoomInquisition(gameState, context, onComplete, roomType = 8) {
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

    let hintDialogue = "";
    let hintLogText = "";

    if (roomType === 8) {
        hintDialogue = "「リナの魔方陣は、上（瞳）に『真実の鏡(2)』、右（腕）に『聖書(5)』を配置して誘惑を打ち破るんだ！」";
        hintLogText = "【4F住人の証言①】リナの魔方陣は、上（瞳）に『真実の鏡(2)』、右（腕）に『聖書(5)』を配置して誘惑を打ち破るんだ！";
    } else {
        hintDialogue = "「あいつの残る急所は……下（足）に『浄化塩(3)』を撒き、左（腕）に『聖水(1)』をかけて甘い香気を打ち消せ！」";
        hintLogText = "【4F住人の証言②】リナの魔方陣は、下（足）に『浄化塩(3)』、左（腕）に『聖水(1)』を配置するんだ！";
    }

    const grantRinaHint = (messageTitle, callback) => {
        if (!gameState.bossHints) gameState.bossHints = [];
        if (!gameState.bossHints.includes(hintLogText)) {
            gameState.bossHints.push(hintLogText);
        }
        showMessageDialog(`${messageTitle}\n『リナ攻略メモ』がスマホの悪魔手記に記録された！\n\n${hintDialogue}`, callback);
    };

    const isRealHuman = Math.random() < 0.5;

    if (isRealHuman) {
        const entity = {
            type: "human",
            name: "怯えるマンション住民",
            faceImage: "assets/images/human1.png",
            dialogue: hintDialogue,
            message: hintDialogue
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
            name: "怯えるマンション住民",
            trueName: "桃色の悪魔",
            faceImage: "assets/images/human1.png",
            realImage: "assets/images/demon/demon7.png",
            dialogue: hintDialogue,
            message: hintDialogue,
            weakness: 2,
            rewardExp: 80,
            rewardMoney: 250
        };
        openInquisitionUI(entity, gameState, (res) => {
            if (res === "combat_win" || res === "kill_human") {
                gameState.clearedRooms[roomKey] = true;
                grantRinaHint("【悪魔を討滅した】\n悪魔の残骸から手記を発見した！", onComplete);
            } else if (res === "demon_ambush") {
                gameState.player.hp = Math.max(1, gameState.player.hp - 10);
                const demonEnemy = {
                    name: entity.trueName,
                    image: entity.realImage,
                    hp: 40, atk: 14, def: 2,
                    weakness: [entity.weakness],
                    rewardExp: 80, rewardMoney: 250
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
        showMessageDialog("【豪奢な部屋】\n男はもう動かない", onComplete);
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
            weakness: [2],
            rewardExp: 100,
            rewardMoney: 350
        };

        openCombatUI(enemyA, gameState, (res) => {
            if (res === 'win') {
                if (!gameState.flags) gameState.flags = {};
                gameState.flags.defeatedShineiA = true;
                gameState.flags.hasBrandBag = true;

                showConversationDialog("assets/images/demon/shineia.png", "【リナ親衛隊A】\n「苦しかったけど、楽しかった、リナちゃんに貢いでる時だけが生きてる感じがした、解放されて寂しくなる。。。（息絶えた）」", () => {
                    showItemAcquiredModal("assets/images/present.png", "高級ブランドバッグ", "【貢ぎ物キーアイテム】\nリナ親衛隊Aが大事に抱え込んでいた『高級ブランドバッグ』を手に入れた！", () => {
                        context.redraw();
                        onComplete();
                    });
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
            weakness: [5],
            rewardExp: 100,
            rewardMoney: 350
        };

        openCombatUI(enemyB, gameState, (res) => {
            if (res === 'win') {
                if (!gameState.flags) gameState.flags = {};
                gameState.flags.defeatedShineiB = true;
                gameState.flags.hasChampagne = true;

                showConversationDialog("assets/images/demon/shineib.png", "【リナ親衛隊B】\n「リナちゃんが俺だけじゃないなんて知ってたよ、でもリナちゃんはたくさんいないと寂しさが埋まらないんだ、それは俺だけが知ってるんだ。。。（息絶えた）」", () => {
                    showItemAcquiredModal("assets/images/present.png", "高級シャンパン", "【貢ぎ物キーアイテム】\nリナ親衛隊Bが祭壇に捧げていた『高級シャンパン』を手に入れた！", () => {
                        context.redraw();
                        onComplete();
                    });
                });
            } else {
                onComplete();
            }
        }, context);
    });
}

// ==========================================
// ★ 黒猫霊体レスキュー ＆ リナボス戦闘シーケンス
// ==========================================
function startRinaBossSequence(gameState, context, onComplete) {
    showMessageDialog("【台座に貢ぎ物を設置】\n『高級ブランドバッグ』と『高級シャンパン』を台座に並べた。\n桃色の結界が霧散し、最奥の扉が開いた……！", () => {
        playVideo("assets/images/demon/4f-rina.mp4", () => {
            
            // ★ リナの甘言（前半）
            showConversationDialog("assets/images/demon/4f-rina.jpg", "【色欲・リナ】\n「うふふ……本当に持ってきてくれたのね。ありがとう、大好き……」", () => {
                
                // 画面をピンク色に染める演出
                const prevBg = document.body.style.backgroundColor;
                document.body.style.backgroundColor = "#ffccff"; 
                
                setTimeout(() => {
                    showMessageDialog("（画面がピンク色のモヤに包まれ、甘く重苦しい香気が漂う）", () => {
                        
                        // ★ リナの甘言（後半）
                        showConversationDialog("assets/images/demon/4f-rina.jpg", "【色欲・リナ】\n「父親のことなんて、もうどうでもいいじゃない……？\n頑張らなくていいのよ。これからは私のお婿さんになって、ずぅっと甘い夢の中で暮らしましょう……？」", () => {
                            
                            // ★ 主人公の堕ちかけモノローグ
                            showMessageDialog("（頭がぼーっとする……。甘い匂いで、考えるのが面倒になっていく……。\nそうだ、就職も全部落ちて、俺は何のために苦労してるんだ？\nもう……全部あきらめて、この人に身を任せてしまえば楽になれるんじゃないか……？）\n\n（主人公がだらりと銃を取り落としそうになる）", () => {
                                
                                // ★ 黒猫霊体の乱入！！
                                sound.playSE("assets/audio/se/cat.mp3");
                                document.body.style.backgroundColor = prevBg; // 背景を瞬時に戻す

                                setTimeout(() => {
                                    showMessageDialog("【？？？（黒猫の霊体）】\n「――ギャウッ、フシャーーーッ！！」", () => {
                                        showMessageDialog("（暗闇から飛び出した漆黒の影が、主人公の頬を一閃！）\n（ピシッ！ という鋭い炸裂音）", () => {
                                            
                                            showMessageDialog("【主人公】\n「痛っっっ！？ ……ハッ、俺は何を……！？」", () => {
                                                showConversationDialog("assets/images/demon/4f-rina.jpg", "【色欲・リナ】\n「キャッ！？ な、何よ今の黒い影……！ 私の術を引っ掻き破るなんて……！！」", () => {
                                                    
                                                    // ★ モノローグと立ち直り
                                                    showMessageDialog("（足元を冷たい風がすり抜けた。\n闇の奥へ消えていく小さな黒い影……猫……使い魔？\n……危なかった。あいつが痛烈な一撃をくれなきゃ、完全に自我を喰われるところだった！）", () => {
                                                        showMessageDialog("【主人公】\n「悪魔のまやかしに、危うく呑まれるところだった。。\n……（深呼吸して）銃はあるか、身体に違和感は…大丈夫か、よし、やれる」", () => {
                                                            
                                                            // ★ パズル UI 起動へ
                                                            const puzzleConfig = {
                                                                title: "【4Fボス解読】色欲のパパ活女子・リナ♥",
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
                                                                    const playerLevel = gameState.player.level || 1;

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

                                                                    const baseHp = ENEMIES.RINA_4F ? ENEMIES.RINA_4F.hp : 480;
                                                                    const startHp = Math.max(1, Math.floor(baseHp * hpRatio));

                                                                    showMessageDialog(`${resultMsg}\nリナとの決戦に入る！`, () => {
                                                                        const rinaEnemy = {
                                                                            name: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.name : "色欲のパパ活女子・リナ",
                                                                            image: "assets/images/demon/4f-rina-b.jpg",
                                                                            hp: startHp, maxHp: baseHp,
                                                                            atk: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.atk : 60,
                                                                            def: ENEMIES.RINA_4F ? ENEMIES.RINA_4F.def : 8,
                                                                            weakness: [2, 5],
                                                                            rewardExp: 400,
                                                                            rewardMoney: 1500,
                                                                            isBoss: true
                                                                        };

                                                                        openCombatUI(rinaEnemy, gameState, (combatRes) => {
                                                                            if (combatRes === 'win') {
                                                                                if (!gameState.flags) gameState.flags = {};
                                                                                gameState.flags.cleared4F = true;
                                                                                if (gameState.saveGame) gameState.saveGame();

                                                                                gameState.player.x = 1;
                                                                                gameState.player.y = 1;
                                                                                gameState.player.dir = 2;

                                                                                clearPinkMist();

                                                                                showConversationDialog("assets/images/demon/4f-rina.jpg", "【色欲・リナ】\n「バカじゃないの、この悪魔！ ひとでなし！ 中学生の父親？ あの男はなびかないから5Fの蛭沼っちに渡したわ、蛭沼っち、改造できるおもちゃを欲しがってたから。ねぇ助けてよ……お願いだから見捨てないでぇぇっ…」", () => {
                                                                                    showMessageDialog(`【4Fフロアボス討滅！】\nリナの怨霊を浄化し、甘い桃色の霧と蔦が消え去った！\n\n主人公「5Fの蛭沼、まだ上かよ、あぁクソ……無事だといいけど……！」\n※5階への非常階段が解禁されました！`, onComplete);
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
                                            });

                                        });
                                    });
                                }, 200);

                            });
                        });
                    });
                }, 100);

            });
        });
    });
}