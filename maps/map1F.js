// maps/map1F.js - エレベーター(セル3)統一・中庭扉(セル8)修正・5F行先対応完全版

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, openShopUI, playFloorTransition 
} from '../ui.js';

export const playerStart1F = { x: 7, y: 1, dir: 0 };

// 1: 壁 / 0: 通路 
// 3: エレベーター(x:6, y:0) / 4: 非常階段(x:7, y:0) 
// 2: コンビニ(x:3, y:2) / 8: 中庭への扉・血の池(x:7, y:2) / 5: 集合ポスト(x:11, y:2) / 6: 出口(x:7, y:6)
export const map1F = [
    [1, 1, 1, 1, 1, 1, 3, 4, 1, 1, 1, 1, 1, 1, 1], // ★ (6,0)を正式なエレベーター[3]に変更
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 1, 2, 1, 0, 1, 8, 1, 0, 1, 5, 1, 0, 1], // ★ 中庭の扉(7,2)をドア[8]に変更
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], 
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 1, 1, 1]  
];

export function handleEvent1F(targetCell, gameState, context) {
    // 3: エレベーター（★ 1F・3F・5F を選べる共通UI）
    if (targetCell === 3) {
        if (!gameState.hasElevatorKey) {
            return { 
                run: (onComplete) => showMessageDialog("【エレベーター】\n重厚な鍵がかかっていて動かない……。\n動かすにはフロアボスが持っている『エレベーターキー』が必要のようだ。", onComplete) 
            };
        } else {
            return { 
                run: (onComplete) => {
                    const evModal = document.createElement("div");
                    evModal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-family: monospace;";
                    
                    let html = `<h2 style="color: #66ccff; margin-bottom: 20px;">【エレベーター】</h2>`;
                    html += `<button class="ev-btn" data-floor="1" style="width: 220px; padding: 15px; margin: 5px; background: #004400; color: #00ff66; border: 1px solid #00ff66; font-size: 1.1em; cursor: pointer;">1F (現在地)</button>`;
                    html += `<button class="ev-btn" data-floor="3" style="width: 220px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.1em; cursor: pointer;">3F (汚染フロア)</button>`;
                    html += `<button class="ev-btn" data-floor="5" style="width: 220px; padding: 15px; margin: 5px; background: #222; color: #fff; border: 1px solid #666; font-size: 1.1em; cursor: pointer;">5F (精神科病棟)</button>`;
                    html += `<button id="ev-cancel" style="width: 220px; padding: 15px; margin-top: 20px; background: #440000; color: #ff6666; border: 1px solid #ff3333; cursor: pointer;">閉じる</button>`;
                    evModal.innerHTML = html;
                    document.body.appendChild(evModal);

                    document.getElementById("ev-cancel").onclick = () => { evModal.remove(); onComplete(); };
                    evModal.querySelectorAll(".ev-btn").forEach(btn => {
                        btn.onclick = () => {
                            const f = parseInt(btn.getAttribute("data-floor"), 10);
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
                run: (onComplete) => showMessageDialog("【非常階段の扉】\n重厚な鉄の扉に頑丈な錠前がかかっている……。\n2階へ上がるには『2F非常階段の鍵』が必要のようだ。", onComplete) 
            };
        } else {
            return { 
                run: (onComplete) => { context.changeFloor(2); onComplete(); } 
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

    // ★ 8: 中庭への扉（血の池）
    if (targetCell === 8) {
        if (!gameState.hasExorcistInherited) {
            return { run: (onComplete) => startExorcistSequence(gameState, context.redraw, onComplete) };
        } else {
            return { 
                run: (onComplete) => showMessageDialog("【血の池跡】\nエクソシストが沈んでいった血の池……。\n今は静まり返り、ただどす黒い痕跡だけが残っている。", onComplete) 
            };
        }
    }

    // 5: 集合ポスト
    if (targetCell === 5) {
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

function startPostEvent(gameState, onComplete) {
    if (!gameState.hasExorcistInherited) {
        showMessageDialog("【1階 集合ポスト】\n錆びついた住民用の郵便受けが並んでいる。\n……『悪魔辞典アプリ』を持っていないため、まだ調べる意味はなさそうだ。\n（※まずは中庭の血の池を調べよう）", onComplete);
        return;
    }
    playVideo("assets/videos/post.mp4", () => {
        showMessageDialog("【1階 集合ポスト】\n錆びついた住民用の郵便受けが並んでいる。\n\n「外で連絡したいことができたら、このポストに手紙を放り込んでおくれ……」\nおばあさんの言葉が頭をよぎる。", onComplete);
    });
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
                showItemAcquiredModal("assets/images/cards/1Card.png", "退魔の札『ラミナ』一式", "『悪魔辞典アプリ』『使い魔（Lv.15から）』『2F非常階段の鍵』\nそして『1〜9番のラミナ全9枚』を受け継いだ！", () => {
                    showMessageDialog("【瀕死のエクソシスト】\n「8Fの御堂、あれは私の想像を超えて凶悪だった……あれはこの街の脅威になる……」", () => {
                        showMessageDialog("【衝撃の光景】\n話し終えた直後、無数の黒い腕が池から伸び、神父が引きずり込まれた……。あまりに驚いて、見ているしかなかった。", () => {
                            gameState.hasExorcistInherited = true; 
                            gameState.hasKey2F = true; 
                            gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
                            if (redraw) redraw(); 
                            onComplete();
                        });
                    });
                });
            });
        }));
    });
}