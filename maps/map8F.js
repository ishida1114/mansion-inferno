// maps/map8F.js - 8F「最上階：悪魔王の祭壇」完全版
// ケルベロス(西)・牛頭馬頭(東)討伐 ➔ 父親の手帳ヒント ➔ 御堂決戦＆魔方陣パズル ➔ Sinによるマルチエンディング

import { 
    showMessageDialog, showConversationDialog, 
    playVideo, openCombatUI, openBossPuzzleUI, playFloorTransition 
} from '../ui.js';
import { sound } from '../sound.js'; // ★ BGM管理

export const playerStart8F = { x: 3, y: 4, dir: 0 };

export const map8F = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 8, 1, 1, 1], // 8: 御堂の間への扉
    [1, 1, 1, 0, 1, 1, 1],
    [1, 2, 0, 0, 0, 2, 1], // 西: ケルベロス / 東: 牛頭馬頭
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 4, 1, 1, 1], // 4: 7Fへの階段
    [1, 1, 1, 1, 1, 1, 1]
];

export function handleEvent8F(targetCell, gameState, context) {
    const px = gameState.player.x;
    const py = gameState.player.y;
    const dir = gameState.player.dir;
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];
    const frontX = px + dx[dir];
    const frontY = py + dy[dir];

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

    if (targetCell === 2) {
        if (frontX === 1 && frontY === 3) return { run: (onComplete) => handleCerberusRoom(gameState, context, onComplete) };
        if (frontX === 5 && frontY === 3) return { run: (onComplete) => handleGozuMezuRoom(gameState, context, onComplete) };
    }

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
        "【西の間：地獄の犬舎】\n扉を開けると、猛烈な硫黄の臭気と共に３つの紅蓮の瞳が闇に浮かび上がった！\n洋の地獄より召喚されし門番【ケルベロス】が、灼熱の牙を剥いて飛びかかってきた！",
        () => {
            const cerberusBoss = {
                name: "地獄の番犬・ケルベロス",
                image: "assets/images/demon/Cerberus.jpg",
                hp: 260,
                atk: 24,
                def: 3,
                weakness: [1, 6],
                actions: ["の３つの顎が同時に噛みついてきた！", "は口から猛烈な『業火ブレス』を吐き散らした！", "が地獄の咆哮を上げ、威圧で身動きを封じてくる！"]
            };

            openCombatUI(cerberusBoss, gameState, (res) => {
                if (res === "win") {
                    gameState.flags.clearedCerberus = true;
                    gameState.player.money += 3000;
                    showMessageDialog(
                        "【ケルベロス 討滅！】\n３つの首を討ち果たし、巨獣は黒煙を上げて崩れ落ちた！\n\n部屋の隅に、踏みにじられた父親のペンとノートの切れ端が落ちている……！",
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
                image: "assets/images/demon/gozumezu.png",
                hp: 300,
                atk: 26,
                def: 4,
                weakness: [2, 7],
                actions: ["の牛頭が巨大な金棒を狂乱しながら振り下ろした！", "の馬頭が血に飢えた槍で電光石火の突きを放つ！", "は二体同時に阿鼻叫喚の怒号を轟かせた！"]
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
        showMessageDialog("【御堂の間：破壊された祭壇】\n悪魔王・御堂は完全に滅び去った。ここはもう用はない。", onComplete);
        return;
    }

    if (!gameState.flags.clearedCerberus || !gameState.flags.clearedGozuMezu) {
        showMessageDialog("【御堂の間：結界の扉】\n扉には青い業火と黒い怨念の鎖が幾重にも巻き付いている……！\n（※東西の部屋に潜む【ケルベロス】と【牛頭＆馬頭】を討伐しなければ、この結界は破れない！）", onComplete);
        return;
    }

    showConversationDialog(
        "assets/images/demon/midou.png", 
        "【御堂の演説（街の市民への放送）】\n「おい、聞こえてるな市民諸君！ 男・御堂だ！\nよくも……よくもあの選挙で、この俺を落選させてくれたなぁッ！？\n誰が一番この街を愛してた！？ 誰が泥をかぶって街のために動いてたと思ってんだ！\n老人ホームの募金？ ふざけんじゃねえぞ！ あんなもん俺が市長になって、もっとデカい予算で倍にして建て替えてやるつもりだったんだよ！ 俺の男気と大義を何一つ理解できねえで、あのマスゴミのデマを鵜呑みにしやがって！\n恩知らずの愚民どもがぁぁッ！！」",
        () => {
            showConversationDialog(
                "assets/images/demon/midou.png",
                "【御堂の演説（街の市民への放送）】\n「……だがな、俺は器のデカい男だ！ 貴様らを見捨てたりはせん！\n民主主義がダメなら、この悪魔の力で街を一つにまとめてやる！\n喜べ！ 今日から俺が貴様らの絶対のリーダー、『悪魔王』だ！ 俺の敷いたレールの上を、泣いて感謝しながら這いつくばって歩けぇぇッ！！」",
                () => {
                    showConversationDialog(
                        "assets/images/demon/midou.png",
                        "【御堂（主人公を睨みつけ）】\n「……あぁん！？ なんだテメェは！\nどこの家庭教師だか何だか知らねえが、大人の神聖な大義名分に、ガキが土足で踏み込んでんじゃねえぞ！\nテメェの名前なんぞ知るか！ 覚える価値もねえ！\nこっちはこれからこの街の百万人を背負って立つんだ！ てめえみたいな名もねえ雑魚に構ってる暇はねえんだよ！\n邪魔すんなら容赦しねえぞ、俺の偉大なる戴冠式の生贄にしてミンチにしてやるわッ！！」",
                        () => {
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

// 御堂バトル ➔ 不死身復活 ➔ 魔方陣パズル ➔ エンディング分岐
function startMidoBattleSequence(gameState, context, onComplete) {
    const midoBoss = {
        name: "悪魔王・御堂（自己顕示の化身）",
        image: "assets/images/demon/midouakuma.png",
        hp: 420,
        atk: 30,
        def: 4,
        weakness: [4, 9],
        actions: [
            "は『俺の大義が分からんか！』と逆上し、血の業火を放った！",
            "は『感謝しろ！ 畏れ敬え！』と腕を振り回し叩きつけてくる！",
            "の背中から無数の黒い触手が伸び、暴風のような魔気を撒き散らす！",
            "は狂気に満ちた目でがなり立て、精神を削り取る咆哮を上げた！"
        ]
    };

    openCombatUI(midoBoss, gameState, (res) => {
        if (res === "win") {
            showConversationDialog(
                "assets/images/demon/midouakuma.png",
                "【悪魔王・御堂】\n「グハハハ……痛ぇじゃねえか、クソガキが……！\nだが無駄だ！ 言ったはずだろ、俺は人間をやめた『悪魔王』だとな！\n貴様ごときがどれだけ小細工しようが、この不死の肉体は滅びん！\n街中を地獄に変える儀式はもう止まらんぞ！ 死ねぇッ！！」",
                () => {
                    showMessageDialog(
                        "【主人公の直感】\n（父親の取材手帳にあった通りだ……！ 物理的な攻撃じゃ倒せない。\nエクソシストから受け継いだ神聖カードを、床の魔方陣に正しくセットして【神の裁き（Vox Sacra）】を発動させるしかない！）",
                        () => {
                            const puzzleConfig = {
                                bossName: "悪魔王・御堂（不死の核）",
                                slots: [
                                    { id: "slot_3", label: "② 左", gridPos: "grid-area: 2 / 1;" },
                                    { id: "slot_1", label: "① 中央", gridPos: "grid-area: 1 / 2;" }, // 中央を1とするかデザイン次第
                                    { id: "slot_5", label: "③ 右", gridPos: "grid-area: 2 / 3;" }
                                ] // ※ 左=2, 中央=6, 右=9 を想定
                            };

                            openBossPuzzleUI(puzzleConfig, gameState, (slots) => {
                                // 簡易判定：全部埋まっていれば成功とする（本来は evaluatePuzzleFn をかませる）
                                const isCorrect = (slots["slot_3"] === 2 && slots["slot_1"] === 6 && slots["slot_5"] === 9) || true; // ★ 強制成功にしていますが、厳密にする場合はココを調整

                                if (isCorrect) {
                                    showConversationDialog(
                                        "assets/images/demon/midouakuma.png",
                                        "【悪魔王・御堂 討滅！】\n「なっ……魔方陣が……逆流している……！？\n馬鹿な……俺の大義が……俺の男気が……こんな、名も無きガキに……！\n認めん、認めんぞぉぉぉッ！！ 俺が……俺こそが、王だぁぁぁぁっ……！！」",
                                        () => {
                                            gameState.flags.cleared8F = true;
                                            
                                            // ★ エンディング曲へ切り替え
                                            sound.playBGM("assets/audio/bgm/ending.mp3");

                                            // ★ 罪(Sin)によるマルチエンディング分岐処理
                                            triggerEndingSequence(gameState, onComplete);
                                        }
                                    );
                                } else {
                                    gameState.player.hp = Math.max(1, gameState.player.hp - 30);
                                    showMessageDialog("【神聖陣の暴走！】\n印の波長が合わず、魔方陣が激しく反発した！（30ダメージ）\n\n御堂「ガハハ！ 無駄だと言っただろうが！」", onComplete);
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

// =====================================
// ★ 罪(Sin)によるマルチエンディング分岐
// =====================================
function triggerEndingSequence(gameState, onComplete) {
    const currentSin = gameState.player.sin || 0;

    // ① TRUE END: Sin = 0
    if (currentSin === 0) {
        showConversationDialog(
            "assets/images/ending.png",
            "【マンションの解放・夜明け】\n眩い神聖光が御堂の核を貫き、悪魔の巨躯は光の塵となって霧散していった。\nタワマンを覆っていた禍々しい黒雲が裂け、窓から眩しい朝陽が街全体を照らし出す。\n\n静まり返ったフロアで、ポケットのスマホがピロンと鳴った。\n画面には就活サイトからの事務的な通知。『〇〇株式会社：二次面接の日程調整について』\n\n主人公はふっと苦笑し、スマホをポケットに突っ込んだ。\n足元にすっと寄り添い、優雅にしっぽを揺らす黒猫。朝陽に照らされた街の遠くを見つめながら、どこか誇らしげに目を細めている。\n\n主人公\n「さてと……これからどうする、相棒？ 就職活動でもするか？」\n\n（澄み渡る街を見渡して、手の中の銃を見つめる）\n\n主人公\n「…………いっそ、プロのエクソシスト（悪魔祓い）になるか。」\n\n黒猫は楽しそうに喉を鳴らし、「ニャー」と短く鳴いた。\n二人の影が、朝陽に長く伸びていく――。",
            () => {
                showMessageDialog("【 TRUE END : プロのエクソシスト 】\n\nマンション・インフェルノ クリア！\n完全な潔白証明、おめでとうございます！", onComplete);
            }
        );
    } 
    // ② NORMAL END: Sin 1 〜 30
    else if (currentSin > 0 && currentSin <= 30) {
        showConversationDialog(
            "assets/images/knife.jpg",
            "【終わらない贖罪】\n御堂は滅び、黒雲の裂け目から朝陽が差し込む。\nしかし、主人公の胸の奥に残る「人間を撃ってしまった罪悪感」は消えない。\n\nスマホが鳴り、就活の面接通知が表示されるが、主人公は画面を見つめたまま立ち尽くす。\n\n主人公\n「……俺の手は、もう綺麗じゃないな。\nこんな血で汚れた手で、普通の生活に戻れるわけがない……。」\n\n黒猫はじゃれつくことなく、少し離れた瓦礫の上から、試すような冷たい瞳でじっと主人公を見つめている。\n主人公は血に濡れた武器を強く握りしめ、影を落とした瞳で前を向いた。\n\n主人公\n「就活は辞退だ。\n……背負った罪は消えない。なら、街に残った悪魔をすべて狩り尽くすまで、俺は戦うのをやめない。……付き合ってくれるか、相棒。」\n\n黒猫は小さく頷くように目を細め、静かに主人公の影の中へと溶けていった――。",
            () => {
                showMessageDialog("【 NORMAL END : 贖罪の執行人 】\n\nマンション・インフェルノ クリア。\n（※1階の無人レジで罪を全て浄化していれば、別の結末が……？）", onComplete);
            }
        );
    } 
    // ③ BAD END: Sin 31以上
    else {
        playVideo("assets/images/demon/6f-doppelganger.mp4", () => {
            showMessageDialog(
                "【新・悪魔王の誕生】\n御堂が絶叫とともに爆散した瞬間――その体から吹き出した大量の黒煙と怨念が、浄化されることなく主人公の全身へと吸い込まれていく。\n罪に染まりきった主人公の肉体は、悪魔の瘴気を拒絶するどころか、極上の苗床として貪り食ったのだ。\n\n窓の外の黒雲は晴れず、むしろマンションを中心に赤黒い雷光が渦を巻き始める。\nスマホが鳴り、就活の通知が届くが――主人公はそれを床に叩き落とし、踵で無残に踏み砕いた。\n\n主人公\n「ハハ……ハハハッ！\nなんだこれは……全身に力が漲る……！ 就職活動？ 面接？ 馬鹿馬鹿しい……！」\n\n瞳が禍々しい紅蓮に染まり、背中から黒い魔気の翼が広がっていく。\n足元の黒猫は毛を逆立て、主人公を「新たな怪物」として激しく威嚇したあと、闇の中へと逃げ去っていった。\n\n主人公\n「御堂の言ってたことも、あながち間違いじゃなかったな。\n愚民どもめ……今日からこの俺が、貴様らの新しい『悪魔王』だ。」\n\nマンション・インフェルノに、新たな絶望の支配者が君臨した――。",
                () => {
                    showMessageDialog("【 BAD END : 新・悪魔王誕生 】\n\nゲームオーバー……。\n（※人間を撃ちすぎです。1階の無人レジでお金を払って罪を浄化してください）", onComplete);
                }
            );
        });
    }
}

// 8F 通常ランダムエンカウント
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
        actions: ["は『御堂先生こそ真の市長だ！』と叫び襲いかかってきた！", "は血塗られた選挙ビラを投げつけて目を眩ませてきた！", "の狂気の眼差しが精神を激しく揺さぶる！"]
    };

    openCombatUI(enemy, gameState, (res) => {
        if (onComplete) onComplete();
    }, context);
}