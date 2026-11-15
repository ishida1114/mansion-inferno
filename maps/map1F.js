// maps/map1F.js - エレベーター(7Fボタン追加)・中庭扉・段階的防具ポスト投函・管理人室(セル10・玄関横配置)・継承アイテム3連続モーダル・改行修正 完全版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, openShopUI, playFloorTransition 
} from '../ui.js';

export const playerStart1F = { x: 7, y: 1, dir: 0 };

// 1: 壁 / 0: 通路 
// 3: エレベーター(x:6, y:0) / 4: 非常階段(x:7, y:0)
// 2: コンビニ(x:3, y:2) / 8: 中庭への扉・血の池(x:7, y:2) / 9: 集合ポスト(x:11, y:2)
// 10: 管理人室(x:6, y:6) / 6: 出口(x:7, y:6)
export const map1F = [
    [1, 1, 1, 1, 1, 1, 3, 4, 1, 1, 1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 1, 2, 1, 0, 1, 8, 1, 0, 1, 9, 1, 0, 1], 
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], 
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 1, 1, 1, 1, 1, 10, 6, 1, 1, 1, 1, 1, 1, 1]  
];

export function handleEvent1F(targetCell, gameState, context) {
    // 3: エレベーター（1F・3F・5F・7F を選べる共通UI）
    if (targetCell === 3) {
        if (!gameState.hasElevatorKey) {
            return { 
                run: (onComplete) => showMessageDialog("【エレベーター】\n重厚な鍵がかかっていて動かない……。\n動かすにはフロアボスが持っている『エレベーターキー』が必要のようだ。", onComplete) 
            };
        } else {
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

                    const is5FUnlocked = gameState.flags && gameState.flags.cleared4F;
                    html += `<button class="ev-btn" data-floor="5" style="width: 240px; padding: 15px; margin: 5px; background: ${is5FUnlocked ? '#222' : '#111'}; color: ${is5FUnlocked ? '#fff' : '#666'}; border: 1px solid ${is5FUnlocked ? '#666' : '#333'}; font-size: 1.1em; cursor: pointer;">5F (精神科病棟) ${is5FUnlocked ? '' : '🔒'}</button>`;
                    
                    html += `<button class="ev-btn" data-floor="3" style="width: 240px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.1em; cursor: pointer;">3F (汚染フロア)</button>`;
                    html += `<button class="ev-btn" data-floor="1" style="width: 240px; padding: 15px; margin: 5px; background: #004400; color: #00ff66; border: 1px solid #00ff66; font-size: 1.1em; cursor: pointer;">1F (現在地)</button>`;

                    html += `<button id="ev-cancel" style="width: 240px; padding: 15px; margin-top: 20px; background: #440000; color: #ff6666; border: 1px solid #ff3333; cursor: pointer;">閉じる</button>`;
                    
                    evModal.innerHTML = html;
                    document.body.appendChild(evModal);

                    document.getElementById("ev-cancel").onclick = () => { evModal.remove(); onComplete(); };
                    evModal.querySelectorAll(".ev-btn").forEach(btn => {
                        btn.onclick = () => {
                            const f = parseInt(btn.getAttribute("data-floor"), 10);
                            
                            if (f === 5 && (!gameState.flags || !gameState.flags.cleared4F)) {
                                alert("【ロック中】4階の異変を解決するまで、5階へ昇ることはできない！");
                                return;
                            }

                            evModal.remove();
                            if (f === 1) {
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
    }

    // 4: 非常階段（2F扉）
    if (targetCell === 4) {
        if (!gameState.hasKey2F) {
            return { 
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n重厚な鉄の扉に頑丈な錠前がかかっている……。\n2階へ上がるには『2F非常階段の鍵』が必要のようだ。\n真後ろから異様な空気を感じる、左を2回か右を2回で振り返ってみよう。", onComplete) 
            };
        } else {
            return { 
                run: (onComplete) => {
                    gameState.lastTransitMethod = 'stair';
                    playFloorTransition(2, () => {
                        context.changeFloor(2);
                        onComplete();
                    });
                } 
            };
        }
    }

    // 2: コンビニ
    if (targetCell === 2) {
        if (!gameState.hasMetGrandma) {
            return { run: (onComplete) => startGrandmaEvent(gameState, onComplete) };
        } else if (gameState.hasModelGun && !gameState.hasTalkedStudentInCVS) {
            return { run: (onComplete) => startStudentInCvsEvent(gameState, onComplete) };
        } else {
            return { run: (onComplete) => openShopUI(onComplete) };
        }
    }

    // 10: 管理人室（玄関6のすぐ横）
    if (targetCell === 10) {
        return { run: (onComplete) => startCaretakerRoomEvent(gameState, onComplete) };
    }

    // 8: 中庭への扉（血の池）
    if (targetCell === 8) {
        if (!gameState.hasExorcistInherited) {
            return { run: (onComplete) => startExorcistSequence(gameState, context.redraw, onComplete) };
        } else {
            return { 
                run: (onComplete) => showMessageDialog("【血の池跡】\nエクソシストが沈んでいった血の池……。\n今は静まり返り、ただどす黒い痕跡だけが残っている。", onComplete) 
            };
        }
    }

    // 9: 集合ポスト（段階的防具解放）
    if (targetCell === 9) {
        return { run: (onComplete) => startPostEvent(gameState, onComplete) };
    }

    // 6: エントランス扉
    if (targetCell === 6) {
        return { 
            run: (onComplete) => showMessageDialog("【エントランス扉】\nガラスの向こうには漆黒の霧が立ち込めている……。\n不思議な力で強く封じられていて、扉はびくともしない。", onComplete) 
        };
    }

    return null;
}

// ==========================================
// ★ 1F 管理人室（管理人の孫娘による休憩・回復イベント）
// ==========================================
function startCaretakerRoomEvent(gameState, onComplete) {
    if (!gameState.flags) gameState.flags = {};
    const imgPath = "assets/images/kanrinin-musume.jpg";
    const isRescued = !!gameState.flags.rescuedManager;
    const maxHp = gameState.player.maxHp || 20;
    const curHp = gameState.player.hp || 0;

    // パターンB：3Fで管理人を救出した後（HP 100%全快解禁）
    if (isRescued) {
        let cheerLine = "「おじいちゃんを助けてくださって、本当にありがとうございました！ おかげですっかり元気になりましたよ。\nここはおじいちゃんと私の大切な場所ですから、疲れたらいつでも休んでいってくださいね！」";
        if (gameState.flags.cleared7F) {
            cheerLine = "「いよいよ最上階ですね……！ 無茶だけはしないで、必ず無事に帰ってきてくださいね。私とおじいちゃんで、温かいご飯を用意して待っていますから！」";
        } else if (gameState.flags.cleared5F) {
            cheerLine = "「上の階はどんどん空気が重くなっているみたい……。無理をなさらないで、傷ついたらすぐここへ戻ってきてくださいね！」";
        }

        if (!gameState.flags.seenCaretakerFullUnlock) {
            gameState.flags.seenCaretakerFullUnlock = true;
            showConversationDialog(
                imgPath,
                "【管理人の孫】\n「あっ、先生！ おじいちゃんから全部聞きました！ 3階の冷蔵庫に閉じ込められていたところを助けてくださったんですね……！\n本当に、本当にありがとうございます……！\n\nこれからは奥のベッドも自由に使ってくださいね。私がしっかり看病しますから、いつでも全快まで休んでいってください！」",
                () => {
                    gameState.player.hp = maxHp;
                    if (gameState.saveGame) gameState.saveGame();
                    showMessageDialog(`【管理人室で休憩】\n清潔なシーツが敷かれたベッドでぐっすり眠った。\n（主人公のHPが完全に回復した！ HP: ${gameState.player.hp}/${maxHp}）`, onComplete);
                }
            );
        } else {
            showConversationDialog(
                imgPath,
                `【管理人の孫】\n${cheerLine}`,
                () => {
                    const needsHeal = curHp < maxHp;
                    gameState.player.hp = maxHp;
                    if (gameState.saveGame) gameState.saveGame();
                    const resultText = needsHeal
                        ? `【管理人室で休憩】\n孫娘が淹れてくれた温かいお茶を飲み、ベッドでゆっくり身体を休めた。\n（主人公のHPが完全に回復した！ HP: ${gameState.player.hp}/${maxHp}）`
                        : `【管理人室で小休止】\n孫娘と少し言葉を交わし、温かいお茶でほっと一息ついた。\n（HPはすでに満タンだ！ HP: ${gameState.player.hp}/${maxHp}）`;
                    showMessageDialog(resultText, onComplete);
                }
            );
        }
        return;
    }

    // パターンA：3Fで管理人を救出する前（最大HPの50%まで回復）
    const halfHp = Math.max(1, Math.floor(maxHp * 0.5));
    const introDialogue = !gameState.flags.visitedCaretakerRoom
        ? "【管理人の孫】\n「ひっ……！ ……あ、なんだ、怪しい人じゃないんですね。驚かせないでくださいよ……！\n私はここの管理人の孫です。おじいちゃんが『3階の異臭の様子を見てくる』って言ったきり戻らなくて、ずっとここで待ってるんです……。\n\nあの、すごく疲れてるみたいですね。今は奥の部屋が散らかっていてソファしか使えませんが、少し休んでいきますか？」"
        : "【管理人の孫】\n「おかえりなさい！ まだおじいちゃんは戻ってきていないんです……。\n3階の大きな冷蔵庫のあたりから変な音がしたって住人さんが言っていたのが気になって……。\nよかったら、ソファで少し身体を休めていってくださいね！」";

    gameState.flags.visitedCaretakerRoom = true;

    showConversationDialog(imgPath, introDialogue, () => {
        if (curHp < halfHp) {
            gameState.player.hp = halfHp;
            if (gameState.saveGame) gameState.saveGame();
            showMessageDialog(
                `【管理人室で仮眠】\n古いソファに横になり、束の間の休息をとった。\n（体力が最大値の50%まで回復した！ HP: ${gameState.player.hp}/${maxHp}）\n※さらに深く休むには、3階へ行った管理人を探し出す必要がありそうだ。`,
                onComplete
            );
        } else {
            showMessageDialog(
                `【管理人室で小休止】\n孫娘が温かいお茶を淹れてくれた。\n（現在の体力が最大値の50%以上あるため、ソファでの仮眠ではこれ以上回復しないようだ。 HP: ${curHp}/${maxHp}）`,
                onComplete
            );
        }
    });
}

// 段階的防具解放ポストイベント
function startPostEvent(gameState, onComplete) {
    if (!gameState.hasExorcistInherited) {
        showMessageDialog("【1階 ポルターガイストだらけの集合ポスト】\n錆びついた住民用の郵便受けが並んでいる。\n……『悪魔辞典アプリ』を持っていないため、まだ調べる意味はなさそうだ。\n（※まずは中庭の血の池を調べよう）", onComplete);
        return;
    }

    if (!gameState.flags) gameState.flags = {};
    if (gameState.armorUnlockStage === undefined) {
        gameState.armorUnlockStage = 0;
    }

    const stage = gameState.armorUnlockStage;
    const canPost3F = (stage < 1 && gameState.flags.cleared3F);
    const canPost5F = (stage < 2 && gameState.flags.cleared5F);
    const canPost7F = (stage < 3 && gameState.flags.cleared7F);
    const isFirstCheck = !gameState.flags.seenPostVideo;
    const willPost = canPost3F || canPost5F || canPost7F;

    const executePostLogic = () => {
        if (canPost3F) {
            gameState.armorUnlockStage = 1;
            gameState.flags.postedArmorLetter = true;
            showMessageDialog(
                "【1階 集合ポスト】\n3階の怨霊を祓った報告と共に、『中層探索用防具の支給要請書』を投函口へ差し入れた。\n\nポストの奥から微かな聖水のはじける音がした……。\n\n【防具解放】\nコンビニに『お守りレザージャケット』と『儀式用タクティカルベスト』が入荷しました！",
                onComplete
            );
        } else if (canPost5F) {
            gameState.armorUnlockStage = 2;
            showMessageDialog(
                "【1階 集合ポスト】\n中層の悪魔を退けた報告と共に、『上位退魔スーツの支給要請書』を投函口へ差し入れた。\n\nポストの奥からカチャリと重厚な鍵の開く音がした……。\n\n【防具解放】\nコンビニに『聖遺物のレザースーツ』が入荷しました！",
                onComplete
            );
        } else if (canPost7F) {
            gameState.armorUnlockStage = 3;
            showMessageDialog(
                "【1階 集合ポスト】\nマダム・白鳥を討伐した証と共に、『最終決戦用防具の支給要請書』を投函口へ差し入れた。\n\nポストの奥から低い鐘の音が響いた……。\n\n【防具解放】\nコンビニに『エクソシストの漆黒コート』が入荷しました！",
                onComplete
            );
        } else {
            if (stage >= 3) {
                showMessageDialog("【1階 集合ポスト】\n全ての防具要請書は投函済みだ。これ以上の装備は存在しない。\n残るは8階……最上階の決戦のみだ。", onComplete);
            } else {
                if (gameState.hasMetGrandma) {
                    showMessageDialog(
                        "【1階 集合ポスト】\n錆びついた住民用の郵便受けが並んでいる。\n\n「外で連絡したいことができたら、このポストに手紙を放り込んでおくれ……」\nおばあさんの言葉が頭をよぎる。\n（※各階のフロアボスを撃破すると、防具支給要請書を投函できます）",
                        onComplete
                    );
                } else {
                    showMessageDialog(
                        "【1階 集合ポスト】\n錆びついた住民用の郵便受けが並んでいる。\n投函口は固く閉ざされており、今は投函できるものもなさそうだ。\n（※西側のコンビニから物音が聞こえる……調べてみよう）",
                        onComplete
                    );
                }
            }
        }
    };

    if (isFirstCheck || willPost) {
        gameState.flags.seenPostVideo = true;
        playVideo("assets/videos/post.mp4", executePostLogic);
    } else {
        executePostLogic();
    }
}

function startStudentInCvsEvent(gameState, onComplete) {
    showConversationDialog("assets/images/human1.png", "【生徒】\n「先生……っ！ 無事だったんだね！ 良かった……！」\n\n「おばあさんが『ここなら悪魔も入ってこられない』って、僕を匿ってくれたんだ。お父さんのこと……よろしく頼むね！」", () => {
        gameState.hasTalkedStudentInCVS = true; 
        openShopUI(onComplete);
    });
}

function startGrandmaEvent(gameState, onComplete) {
    playVideo("assets/videos/CVS.mp4", () => {
        showConversationDialog("assets/images/grandma.jpg", "【謎のおばあさん】\n「おや……こんな場所に迷い込むとは、運の悪い子だねえ。」\n\n「もし外で連絡したいことができたら、1階のポストに手紙を放り込んでおくれ。ワタシが受け取ってやるからね……」", () => {
            gameState.hasMetGrandma = true; 
            openShopUI(onComplete);
        });
    });
}

function startExorcistSequence(gameState, redraw, onComplete) {
    showMessageDialog("【血の池】\nマンションの中庭に血の池が湧き、底から無数の人ならざる者がこの世に出ようともがいている……", () => {
        playVideo("assets/videos/BloodPond.mp4", () => playVideo("assets/videos/exorcist.mp4", () => {
            showConversationDialog("assets/images/exorcist.png", "【瀕死のエクソシスト】\n「そ、そこのひと…」\n「悪魔にやられました、ワタシはもう……長くありません……」\n\n「ワタシのスマホ……『悪魔辞典アプリ』と、退魔の札『LAMINA EXORCISMI（ラミナ）』……そして使い魔と2階非常階段の鍵を……あなたに託します……」", () => {
                // ★ 1つ目：悪魔辞典アプリ（エクソシストのスマホ）
                showItemAcquiredModal("assets/images/demon-app.jpg", "悪魔辞典アプリ（エクソシストのスマホ）", "400年にわたる悪魔との戦いの知見を集約した『悪魔辞典アプリ』と、\n影に潜む『使い魔（Lv.15から）』を受け継いだ！", () => {
                    // ★ 2つ目：退魔の札『ラミナ』一式
                    showItemAcquiredModal("assets/images/lamina-set.jpg", "退魔の札『ラミナ』一式", "モデルガンに装填して神聖な言葉を弾丸に変える\n『1〜9番のラミナ全9枚』を受け継いだ！", () => {
                        // ★ 3つ目：2F非常階段の鍵
                        showItemAcquiredModal("assets/images/key-2f.jpg", "2F非常階段の鍵", "1階北側の非常階段の錠前を開ける重厚な古鍵\n『2F非常階段の鍵』を受け継いだ！", () => {
                            showMessageDialog("【瀕死のエクソシスト】\n「8Fの御堂、あれは私の想像を超えて凶悪だった……あれはこの街の脅威になる……」", () => {
                                showMessageDialog("【衝撃の光景】\n話し終えた直後、無数の黒い腕が池から伸び、神父が引きずり込まれた……。あまりに驚いて、手を差し伸べることもできず見ているしかなかった。", () => {
                                    gameState.hasExorcistInherited = true; 
                                    gameState.hasKey2F = true; 
                                    gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
                                    if (redraw) redraw(); 

                                    showMessageDialog(
                                        "【悪魔辞典アプリ】\n悪魔辞典を使えるようになった。\n400年にわたる悪魔との戦いの知見を、何十冊もの辞典にまとめた『悪魔辞典』。\nこのアプリはとても持ち運びできない膨大な辞典をアプリに集約したもののようだ。\n\n右下の『悪魔辞典（ESC）』をクリックすると開く。\n進捗の保存もここから出来る。",
                                        onComplete
                                    );
                                });
                            });
                        });
                    });
                });
            });
        }));
    });
}