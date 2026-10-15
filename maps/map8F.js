// maps/map8F.js - 8F「最上階：悪魔王の祭壇」完全版
// ケルベロス(西)・牛頭馬頭(東)討伐 ➔ 父親の手帳ヒント ➔ 御堂決戦＆魔方陣パズル

import { 
    showMessageDialog, showConversationDialog, 
    playVideo, openCombatUI, openBossPuzzleUI, playFloorTransition 
} from '../ui.js';

export const playerStart8F = { x: 3, y: 4, dir: 0 };

// 1: 壁 / 0: 通路
// 4: 7Fへの大階段 (3, 5)
// 8: 最奥・御堂の間の扉 (3, 1)
// 2: 守護者の扉（西: 1, 3 ケルベロス / 東: 5, 3 牛頭・馬頭）
export const map8F = [
    [1, 1, 1, 1, 1, 1, 1], // y=0
    [1, 1, 1, 8, 1, 1, 1], // y=1 (8: 御堂の間への扉)
    [1, 1, 1, 0, 1, 1, 1], // y=2
    [1, 2, 0, 0, 0, 2, 1], // y=3 (西(1,3): ケルベロス / 東(5,3): 牛頭馬頭)
    [1, 1, 1, 0, 1, 1, 1], // y=4 (開始地点: 3, 4)
    [1, 1, 1, 4, 1, 1, 1], // y=5 (4: 7Fへの階段)
    [1, 1, 1, 1, 1, 1, 1]  // y=6
];

export function handleEvent8F(targetCell, gameState, context) {
    const px = gameState.player.x;
    const py = gameState.player.y;
    const dir = gameState.player.dir;
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];
    const frontX = px + dx[dir];
    const frontY = py + dy[dir];

    // 4: 7Fへの階段
    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                gameState.lastTransitMethod = 'stairs';
                playFloorTransition(7, () => {
                    context.changeFloor(7);
                    onComplete();
                });
            }
        };
    }

    // 2: 守護者の扉
    if (targetCell === 2) {
        // 西の部屋 (1, 3)：ケルベロス
        if (frontX === 1 && frontY === 3) {
            return { run: (onComplete) => handleCerberusRoom(gameState, context, onComplete) };
        }
        // 東の部屋 (5, 3)：牛頭と馬頭
        if (frontX === 5 && frontY === 3) {
            return { run: (onComplete) => handleGozuMezuRoom(gameState, context, onComplete) };
        }
    }

    // 8: 最奥・御堂の間の扉
    if (targetCell === 8) {
        return {
            run: (onComplete) => handleMidoChamber(gameState, context, onComplete)
        };
    }

    return null;
}

// 【西の間：番犬ケルベロス】
function handleCerberusRoom(gameState, context, onComplete) {
    if (!gameState.flags) gameState.flags = {};

    if (gameState.flags.clearedCerberus) {
        showMessageDialog("【西の間：地獄の犬舎】\nケルベロスの死骸は灰となり、静まり返っている。床には父親の手帳の切れ端が落ちていた場所がある。", onComplete);
        return;
    }

    showMessageDialog(
        "【西の間：地獄の犬舎】\n扉を開けると、猛烈な硫黄の臭気と共に双子の紅蓮の瞳が闇に浮かび上がった！\n洋の地獄より召喚されし門番【ケルベロス】が、灼熱の牙を剥いて飛びかかってきた！",
        () => {
            const cerberusBoss = {
                name: "地獄の番犬・ケルベロス",
                image: "assets/images/demon/Cerberus.jpg", // ★ 画像を反映
                hp: 260,
                atk: 24,
                def: 3,
                weakness: [1, 6], // 1: 聖水 / 6: 聖炎
                actions: [
                    "の双子の顎が同時に噛みついてきた！",
                    "は口から猛烈な『業火ブレス』を吐き散らした！",
                    "が地獄の咆哮を上げ、威圧で身動きを封じてくる！"
                ]
            };

            openCombatUI(cerberusBoss, gameState, (res) => {
                if (res === "win") {
                    gameState.flags.clearedCerberus = true;
                    gameState.player.money += 3000;

                    showMessageDialog(
                        "【ケルベロス 討滅！】\n双子の首を討ち果たし、巨獣は黒煙を上げて崩れ落ちた！\n\n部屋の隅に、踏みにじられた父親のペンとノートの切れ端が落ちている……！",
                        () => {
                            showMessageDialog(
                                "【父親の取材手帳・前編】\n『……御堂が隠し持っていたオカルト古文書の写しだ。\n悪魔王の不死の核を貫くには、神聖なる三つの印を魔方陣に捧げねばならぬ。\n\n◆ 中央の座：罪を清め、闇を焼き尽くす【Ⅵ 聖炎】を据えよ。\n◆ 右の座：悪魔を貫き逃走を阻む【Ⅸ 銀杭】を置け。』\n\n（※魔方陣パズルの手がかりを手に入れた！）",
                                onComplete
                            );
                        }
                    );
                } else {
                    onComplete();
                }
            }, context);
        }
    );
}

// 【東の間：獄卒・牛頭馬頭】
function handleGozuMezuRoom(gameState, context, onComplete) {
    if (!gameState.flags) gameState.flags = {};

    if (gameState.flags.clearedGozuMezu) {
        showMessageDialog("【東の間：阿鼻の拷問所】\n牛頭と馬頭は消滅し、血溜まりだけが残されている。床には父親の手帳の切れ端が落ちていた場所がある。", onComplete);
        return;
    }

    showMessageDialog(
        "【東の間：阿鼻の拷問所】\n血塗られた鉄格子の中、東洋の地獄より喚び出された二体の巨漢が蠢いている……！\n重厚な棍棒を持った【牛頭】と、鋭利な槍を構えた【馬頭】が立ち塞がった！",
        () => {
            const gozuMezuBoss = {
                name: "地獄の獄卒・牛頭＆馬頭",
                image: "assets/images/demon/gozumezu.png", // ★ 画像を反映
                hp: 300,
                atk: 26,
                def: 4,
                weakness: [2, 7], // 2: 鏡 / 7: 鐘
                actions: [
                    "の牛頭が巨大な金棒を狂乱しながら振り下ろした！",
                    "の馬頭が血に飢えた槍で電光石火の突きを放つ！",
                    "は二体同時に阿鼻叫喚の怒号を轟かせた！"
                ]
            };

            openCombatUI(gozuMezuBoss, gameState, (res) => {
                if (res === "win") {
                    gameState.flags.clearedGozuMezu = true;
                    gameState.player.money += 3500;

                    showMessageDialog(
                        "【牛頭＆馬頭 討滅！】\n二体の獄卒を撃破した！ 鉄格子が砕け散り、二体は泥となって溶け去った！\n\nその足元に、千切れた父親の取材メモの続きが落ちている……！",
                        () => {
                            showMessageDialog(
                                "【父親の取材手帳・後編】\n『……ボロボロで血に汚れているが、読めるぞ！\n\n◆ 左の座：悪しき波長を反射し真理を映す【Ⅱ 鏡】を据えよ。\n\n左に【Ⅱ 鏡】、中央に【Ⅵ 聖炎】、右に【Ⅸ 銀杭】……\nこの三位一体の神聖陣が揃った瞬間、神の裁き【Vox Sacra】が発動し、悪魔の核を撃ち抜くだろう！』\n\n（※魔方陣パズルの配置法則を完全に特定した！）",
                                onComplete
                            );
                        }
                    );
                } else {
                    onComplete();
                }
            }, context);
        }
    );
}

// 【最奥：御堂の間】
function handleMidoChamber(gameState, context, onComplete) {
    if (!gameState.flags) gameState.flags = {};

    if (gameState.flags.cleared8F) {
        showMessageDialog("【御堂の間：破壊された祭壇】\n悪魔王・御堂は完全に滅び去った。夜明けの光が割れたガラス窓から差し込んでいる。", onComplete);
        return;
    }

    // 左右の守護者を倒していないと扉が開かない
    if (!gameState.flags.clearedCerberus || !gameState.flags.clearedGozuMezu) {
        showMessageDialog(
            "【御堂の間：結界の扉】\n扉には青い業火と黒い怨念の鎖が幾重にも巻き付いている……！\n（※東西の部屋に潜む【ケルベロス】と【牛頭＆馬頭】を討伐しなければ、この結界は破れない！）",
            onComplete
        );
        return;
    }

    // 御堂の演説演出
    showConversationDialog(
        "assets/images/demon/midou.png", // ★ 御堂（人間）画像
        "【御堂の演説（街の市民への放送）】\n「おい、聞こえてるな市民諸君！ 男・御堂だ！\nよくも……よくもあの選挙で、この俺を落選させてくれたなぁッ！？\n誰が一番この街を愛してた！？ 誰が泥をかぶって街のために動いてたと思ってんだ！\n老人ホームの募金？ ふざけんじゃねえぞ！ あんなもん俺が市長になって、もっとデカい予算で倍にして建て替えてやるつもりだったんだよ！ 俺の男気と大義を何一つ理解できねえで、あのマスゴミのデマを鵜呑みにしやがって！\n恩知らずの愚民どもがぁぁッ！！」",
        () => {
            showConversationDialog(
                "assets/images/demon/midou.png", // ★ 御堂（人間）画像
                "【御堂の演説（街の市民への放送）】\n「……だがな、俺は器のデカい男だ！ 貴様らを見捨てたりはせん！\n民主主義がダメなら、この悪魔の力で街を一つにまとめてやる！\n喜べ！ 今日から俺が貴様らの絶対のリーダー、『悪魔王』だ！ 俺の敷いたレールの上を、泣いて感謝しながら這いつくばって歩けぇぇッ！！」",
                () => {
                    showConversationDialog(
                        "assets/images/demon/midou.png", // ★ 御堂（人間）画像
                        "【御堂（主人公を睨みつけ）】\n「……あぁん！？ なんだテメェは！\nどこのクソガキだか何だか知らねえが、大人の神聖な大義名分に、ガキが土足で踏み込んでんじゃねえぞ！\nテメェの名前なんぞ知るか！ 構ってほしければ金持ってこい！\nこっちはこれからこの街の百万人を背負って立つんだ！ てめえみたいな名もねえ雑魚に構ってる暇はねえんだよ！\n邪魔すんなら容赦しねえぞ、俺の偉大なる戴冠式の生贄にしてミンチにしてやるわッ！！」",
                        () => {
                            // ★ 変身アニメーション動画を再生してからバトルへ！
                            playVideo("assets/images/demon/midou.mp4", () => {
                                startMidoBattleSequence(gameState, context, onComplete);
                            });
                        }
                    );
                }
            );
        }
    );
}

// 御堂バトル ➔ 不死身復活 ➔ 魔方陣パズル
function startMidoBattleSequence(gameState, context, onComplete) {
    const midoBoss = {
        name: "悪魔王・御堂（自己顕示の化身）",
        image: "assets/images/demon/midouakuma.png", // ★ 御堂（悪魔形態）画像
        hp: 420,
        atk: 30,
        def: 4,
        weakness: [4, 9], // 4: 十字架 / 9: 銀杭
        actions: [
            "は『俺の大義が分からんか！』と逆上し、血の業火を放った！",
            "は『感謝しろ！ 畏れ敬え！』と腕を振り回し叩きつけてくる！",
            "の背中から無数の黒い触手が伸び、暴風のような魔気を撒き散らす！",
            "は狂気に満ちた目でがなり立て、精神を削り取る咆哮を上げた！"
        ]
    };

    openCombatUI(midoBoss, gameState, (res) => {
        if (res === "win") {
            // 倒しても立ち上がるイベント
            showConversationDialog(
                "assets/images/demon/midouakuma.png", // ★ 御堂（悪魔形態）画像
                "【悪魔王・御堂】\n「グハハハ……痛ぇじゃねえか、クソガキが……！\nだが無駄だ！ 言ったはずだろ、俺は人間をやめた『悪魔王』だとな！\n貴様ごときがどれだけ小細工しようが、この不死の肉体は滅びん！\n街中を地獄に変える儀式はもう止まらんぞ！ 死ねぇッ！！」",
                () => {
                    showMessageDialog(
                        "【主人公の直感】\n（父親の取材手帳にあった通りだ……！ 物理的な攻撃じゃ倒せない。\nエクソシストから受け継いだ神聖カードを、床の魔方陣に正しくセットして【神の裁き（Vox Sacra）】を発動させるしかない！）",
                        () => {
                            // 魔方陣パズルUI起動（3スロット：左=2鏡、中央=6聖炎、右=9銀杭）
                            const puzzleConfig = {
                                bossName: "悪魔王・御堂（不死の核）",
                                slots: 3,
                                correctPattern: [2, 6, 9] // Ⅱ 鏡, Ⅵ 聖炎, Ⅸ 銀杭
                            };

                            openBossPuzzleUI(puzzleConfig, gameState, (isCorrect) => {
                                if (isCorrect) {
                                    // パズル成功：完全討滅
                                    showConversationDialog(
                                        "assets/images/demon/midouakuma.png", // ★ 御堂（悪魔形態）画像
                                        "【悪魔王・御堂 討滅！】\n「なっ……魔方陣が……逆流している……！？\n馬鹿な……俺の大義が……俺の男気が……こんな、名も無きガキに……！\n認めん、認めんぞぉぉぉッ！！ 俺が……俺こそが、王だぁぁぁぁっ……！！」",
                                        () => {
                                            gameState.flags.cleared8F = true;
                                            showMessageDialog(
                                                "【マンションの解放・夜明け】\n眩い神聖光が御堂の核を貫き、悪魔の巨躯は光の塵となって爆散した。\n\nタワマンを覆っていた禍々しい黒雲が裂け、窓から眩しい朝陽が街全体を照らし出す。\n街は救われ、すべての呪いは解き放たれたのだ……！\n\n【プロトタイプ版 クリア！ おめでとうございます！】",
                                                onComplete
                                            );
                                        }
                                    );
                                } else {
                                    // パズル失敗：ダメージを受けてやり直し
                                    gameState.player.hp = Math.max(1, gameState.player.hp - 30);
                                    showMessageDialog(
                                        "【神聖陣の暴走！】\n印の波長が合わず、魔方陣が激しく反発した！（30ダメージを受けた）\n\n御堂「ガハハ！ 無駄だと言っただろうが！ 貴様の浅知恵など通用せんわ！」",
                                        onComplete
                                    );
                                }
                            });
                        }
                    );
                }
            );
        } else {
            onComplete();
        }
    }, context);
}

// 8F 通常ランダムエンカウント（狂信者・親衛隊）
export function check8FRandomEncounter(gameState, context, onComplete) {
    const roll = Math.random();
    if (roll > 0.15) {
        if (onComplete) onComplete();
        return;
    }

    const enemy = {
        name: "御堂の後援会狂信者",
        image: "assets/images/demon/demon17.png",
        hp: 75,
        atk: 22,
        def: 2,
        weakness: [3, 5],
        actions: [
            "は『御堂先生こそ真の市長だ！』と叫び襲いかかってきた！",
            "は血塗られた選挙ビラを投げつけて目を眩ませてきた！",
            "の狂気の眼差しが精神を激しく揺さぶる！"
        ]
    };

    openCombatUI(enemy, gameState, (res) => {
        if (onComplete) onComplete();
    }, context);
}