// maps/map1F.js - 1階マップデータ（ヒント手紙テキスト反映版）

import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playVideo, openShopUI 
} from '../ui.js';

export const playerStart1F = { x: 7, y: 1, dir: 0 };

export const map1F = [
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 1, 2, 1, 0, 1, 3, 1, 0, 1, 5, 1, 0, 1], 
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], 
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 1, 1, 1]  
];

export function handleEvent1F(targetCell, gameState, context) {
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

    if (targetCell === 2) {
        if (!gameState.hasMetGrandma) {
            return { run: (onComplete) => startGrandmaEvent(gameState, onComplete) };
        } else if (gameState.hasModelGun && !gameState.hasTalkedStudentInCVS) {
            return { run: (onComplete) => startStudentInCvsEvent(gameState, onComplete) };
        } else {
            return { run: (onComplete) => openShopUI(onComplete) };
        }
    }

    if (targetCell === 3) {
        if (!gameState.hasExorcistInherited) {
            return { run: (onComplete) => startExorcistSequence(gameState, context.redraw, onComplete) };
        } else {
            return { 
                run: (onComplete) => showMessageDialog("【血の池跡】\nエクソシストが沈んでいった血の池……。\n今は静まり返り、ただどす黒い痕跡だけが残っている。", onComplete) 
            };
        }
    }

    if (targetCell === 5) {
        return { run: (onComplete) => startPostEvent(gameState, onComplete) };
    }

    if (targetCell === 6) {
        return { 
            run: (onComplete) => showConversationDialog(
                "assets/images/entrance.png", 
                "【1F エントランス】\n不気味な静寂に包まれたマンションの入口……。\n外への扉は固く閉ざされ、異様な気配が漂っている。", 
                onComplete
            )
        };
    }

    return null;
}

// ★ 集合ポスト手紙イベント（ヒント1獲得）
function startPostEvent(gameState, onComplete) {
    playVideo("assets/videos/post.mp4", () => {
        const letterText = "【ポストに入っていた古びた手紙】\n『影山は気味の悪い視線で部屋を覗き込んでくる。奴の顔（上段①）に「真実の鏡（2）」を向けろ。そして足元（下段④）に「浄化の塩（3）」を撒けば、身動きが取れなくなるはずだ……』";
        
        if (!gameState.bossHints) gameState.bossHints = [];
        gameState.bossHints.push("【集合ポストの手紙】影山の顔(上①)には「真実の鏡(2)」、足元(下④)には「浄化の塩(3)」を配置する。");

        showMessageDialog(`【1階 集合ポスト】\n${letterText}\n（スマホの悪魔手記にヒントが保存された！）`, onComplete);
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
            showMessageDialog("【瀕死のエクソシスト】\n「そ、そこのひと…」\n「悪魔にやられました、ワタシはもう……長くありません……」\n\n「ワタシのスマホ……『悪魔辞典アプリ』と、退魔の札『LAMINA EXORCISMI（ラミナ）』……そして使い魔と2階非常階段の鍵を……あなたに託します……」", () => {
                showItemAcquiredModal("assets/images/cards/1Card.png", "退魔の札『ラミナ』一式", "『悪魔辞典アプリ』『使い魔（Lv.15から）』『2F非常階段の鍵』\nそして『1〜9番のラミナ全9枚』を受け継いだ！", () => {
                    showMessageDialog("【衝撃の光景】\n話し終えた直後、無数の黒い腕が池から伸び、神父が引きずり込まれた……。あまりのことに驚いて、身体が硬直し、見ていることしかできなかった…。", () => {
                        gameState.hasExorcistInherited = true; 
                        gameState.hasKey2F = true; 
                        gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];
                        if (redraw) redraw(); 
                        onComplete();
                    });
                });
            });
        }));
    });
}