// maps/map8F.js - 8F「最上階：悪魔王の祭壇」完全版
// セリフ演出・黒猫お休みギミック・階段動線同期・ステータス強化・Sinマルチエンディング対応

import { 
    showMessageDialog, showConversationDialog, 
    playVideo, openCombatUI, openBossPuzzleUI, playFloorTransition 
} from '../ui.js';
import { sound } from '../sound.js';

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

    // ★ 4: 7Fへの階段
    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                gameState.lastTransitMethod = 'stair_down';
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

    showConversationDialog(
        "assets/images/demon/Cerberus.jpg",
        "【地獄の番犬・ケルベロス】\n「ワレヲ喚ビ出シタノハ誰ダ…貴様カッ、頭ガ高イィッ！」\n\n（使い魔が怯えている……相手が地獄の猛犬のせいか、この戦闘で使い魔の助けは期待できないかもしれない！）",
        () => {
            const cerberusBoss = {
                name: "地獄の番犬・ケルベロス",
                image: "assets/images/demon/Cerberus.jpg",
                hp: 1000,
                atk: 90,
                def: 10,
                weakness: [1, 6],
                actions: [
                    "の２つの顎が同時に噛みついてきた！",
                    "は口から猛烈な『業火ブレス』を吐き散らした！",
                    "が地獄の咆哮を上げ、威圧で身動きを封じてくる！"
                ]
            };

            const prevCatState = gameState.flags.isCatTrapped;
            gameState.flags.isCatTrapped = true;

            openCombatUI(cerberusBoss, gameState, (res) => {
                gameState.flags.isCatTrapped = prevCatState;

                if (res === "win") {
                    gameState.flags.clearedCerberus = true;
                    gameState.player.money += 3000;

                    // ★ チェックポイントセーブ（ケルベロス討伐を保存）
                    if (gameState.saveGame) gameState.saveGame();

                    showMessageDialog(
                        "【ケルベロス 討滅！】\n２つの首を討ち果たし、巨獣は黒煙を上げて崩れ落ちた！\n\n主人公「大丈夫か、いけるか、相棒」\n黒猫はすまなそうに主人公を見上げると、（ニヤッ）と短く鳴き、強い瞳で前を向きなおした。\n\n部屋の隅に、踏みにじられた父親のペンとノートの切れ端が落ちている……！",
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

    showConversationDialog(
        "assets/images/demon/gozumezu.png",
        "【地獄の獄卒・牛頭＆馬頭】\n牛頭「ここはどこだ？？ お前は罪人か？ ならば己の罪を数えよ」\n\n馬頭「いや、数える必要もあるまい、ここは地獄、判決は、死刑よ！」",
        () => {
            const gozuMezuBoss = {
                name: "地獄の獄卒・牛頭＆馬頭",
                image: "assets/images/demon/gozumezu.png",
                hp: 1100,
                atk: 95,
                def: 12,
                weakness: [2, 7],
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

                    // ★ チェックポイントセーブ（牛頭馬頭討伐を保存）
                    if (gameState.saveGame) gameState.saveGame();

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

    // ★ リトライ時の短縮（すでに演説を聞いて敗北した場合）
    if (gameState.flags.seenMidoIntro) {
        showConversationDialog(
            "assets/images/demon/midou.png",
            "【悪魔王・御堂】\n「しぶといクソガキめ……何度来ようがこの悪魔王の生贄にしてミンチにしてやるわッ！！」",
            () => {
                startMidoPuzzleAndBattle(gameState, context, onComplete);
            }
        );
        return;
    }

    // 初回イベント
    showConversationDialog(
        "assets/images/demon/midou.png", 
        "【御堂の演説（街の市民への生放送）】\n「おい、聞こえてるな市民諸君！ 男・御堂だ！\nよくも……よくもあの選挙で、この俺を落選させてくれたなぁッ！？\n誰が一番この街を愛してた！？ 誰が泥をかぶって街のために動いてたと思ってんだ！\n老人ホーム建設の募金の着服？ ふざけんじゃねえぞ！ あんなもん俺が市長になって、もっとデカい予算で倍にして建て替えてやるつもりだったんだよ！ 俺の男気と大義を何一つ理解できねえで、あのマスゴミのデマを鵜呑みにしやがって！\n恩知らずの愚民どもがぁぁッ！！」",
        () => {
            showConversationDialog(
                "assets/images/demon/midou.png",
                "【御堂の演説（街の市民への放送）】\n「……だがな、俺は器のデカい男だ！ 貴様らを見捨てたりはせん！\n民主主義がダメなら、この悪魔の力で街を一つにまとめてやる！\n喜べ！ 今日から俺が貴様らの絶対のリーダー、『悪魔王』だ！ 俺の敷いたレールの上を、泣いて感謝しながら這いつくばって歩けぇぇッ！！」",
                () => {
                    showConversationDialog(
                        "assets/images/demon/midou.png",
                        "【御堂（主人公を睨みつけ）】\n「……あぁん！？ なんだテメェは！\nどこの小僧だか何だか知らねえが、大人の神聖な大義名分に、ガキが土足で踏み込んでんじゃねえぞ！\nテメェの名前なんぞ知るか！ 覚える価値もねえ！\nこっちはこれからこの街の百万人を背負って立つんだ！ てめえみたいな名もねえ雑魚に構ってる暇はねえんだよ！\n邪魔すんなら容赦しねえぞ、俺の偉大なる戴冠式の生贄にしてミンチにしてやるわッ！！」",
                        () => {
                            playVideo("assets/images/demon/midou.mp4", () => {
                                gameState.flags.seenMidoIntro = true;
                                if (gameState.saveGame) gameState.saveGame();
                                startMidoPuzzleAndBattle(gameState, context, onComplete);
                            });
                        }
                    );
                }
            );
        }
    );
}

// ★ 魔方陣パズル ➔ 弱体化 ➔ 最終決戦バトル ➔ エンディング
function startMidoPuzzleAndBattle(gameState, context, onComplete) {
    showMessageDialog(
        "【主人公の直感】\n（床一面に禍々しい魔方陣が脈打っている……！\n父親の手帳にあった通り、まずはこの神聖陣を解呪して奴の不死結界を破らなければ、攻撃が通じない！）",
        () => {
            const puzzleConfig = {
                title: "【魔方陣術式】悪魔王・御堂（不死の核）",
                subTitle: "父親の手帳に従い、神聖なる三つの印を魔方陣に捧げよ",
                bossName: "御堂",
                slots: [
                    { id: "slot_1", label: "① 中央", gridPos: "grid-area: 1 / 2;" },
                    { id: "slot_3", label: "② 左", gridPos: "grid-area: 2 / 1;" },
                    { id: "slot_5", label: "③ 右", gridPos: "grid-area: 2 / 3;" }
                ]
            };

            openBossPuzzleUI(puzzleConfig, gameState, (slots) => {
                // 左: 2(鏡)、中央: 6(聖炎)、右: 9(銀杭)
                const isCorrect = (Number(slots["slot_3"]) === 2 && Number(slots["slot_1"]) === 6 && Number(slots["slot_5"]) === 9);

                const targetLevel = 35; // 8F適正Lv
                const playerLevel = gameState.player.level || 1;
                const baseHp = 2800;

                let hpRatio = 1.0;
                let resultMsg = "";

                if (isCorrect) {
                    if (playerLevel >= targetLevel) {
                        hpRatio = 0.2; // 8割削減（開始HP: 560）
                        resultMsg = `【神聖陣完全発動！】適正レベル(Lv.${targetLevel})到達！\n三位一体の神聖光が悪魔王の核を撃ち抜いた！\n不死結界が崩壊し、体力を 8割削減 した！`;
                    } else {
                        hpRatio = 0.5; // 半減（開始HP: 1400）
                        resultMsg = `【神聖陣発動！】魔方陣が共鳴し、悪魔王の結界を一時的に弱体化！\n体力を 半減 させた！`;
                    }
                } else {
                    hpRatio = 1.0;
                    resultMsg = `【術式発動失敗……！】\n印の波長が合わず魔方陣が激しく暴走した！\n完全体となった悪魔王・御堂が襲いかかってくる！`;
                }

                const startHp = Math.max(1, Math.floor(baseHp * hpRatio));

                const midoBoss = {
                    name: "悪魔王・御堂（自己顕示の化身）",
                    image: "assets/images/demon/midouakuma.png",
                    hp: startHp,
                    maxHp: baseHp,
                    atk: isCorrect ? 95 : 120,
                    def: isCorrect ? 10 : 18,
                    weakness: [4, 9],
                    rewardExp: 1500,
                    rewardMoney: 10000,
                    isBoss: true,
                    actions: [
                        "は『俺の大義が分からんか！』と逆上し、血の業火を放った！",
                        "は『感謝しろ！ 畏れ敬え！』と腕を振り回し叩きつけてくる！",
                        "の背中から無数の黒い触手が伸び、暴風のような魔気を撒き散らす！",
                        "は狂気に満ちた目でがなり立て、精神を削り取る咆哮を上げた！"
                    ]
                };

                const startBossBattle = () => {
                    openCombatUI(midoBoss, gameState, (res) => {
                        if (res === "win") {
                            gameState.flags.cleared8F = true;
                            if (gameState.saveGame) gameState.saveGame();
                            sound.playBGM("assets/audio/bgm/ending.mp3");

                            showConversationDialog(
                                "assets/images/demon/midouakuma.png",
                                "【悪魔王・御堂 討滅！】\n「なっ……魔方陣が……逆流している……！？\n馬鹿な……俺の大義が……俺の男気が……こんな、名も無きガキに……！\n認めん、認めんぞぉぉぉッ！！ 俺が……俺こそが、王だぁぁぁぁっ……！！」",
                                () => {
                                    triggerEndingSequence(gameState, onComplete);
                                }
                            );
                        } else {
                            onComplete();
                        }
                    }, context);
                };

                if (isCorrect) {
                    showMessageDialog(resultMsg, () => {
                        playVideo("assets/videos/magic-circle.mp4", startBossBattle);
                    });
                } else {
                    showMessageDialog(resultMsg, startBossBattle);
                }
            });
        }
    );
}

// 罪(Sin)によるマルチエンディング分岐
function triggerEndingSequence(gameState, onComplete) {
    const currentSin = gameState.player.sin || 0;

    const returnToTitle = () => {
        const overlay = document.createElement("div");
        overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 9999; opacity: 0; transition: opacity 2s ease;";
        document.body.appendChild(overlay);
        
        setTimeout(() => { overlay.style.opacity = "1"; }, 10);
        setTimeout(() => { location.reload(); }, 3000);
    };

    // ① TRUE END: Sin = 0
    if (currentSin === 0) {
        showConversationDialog(
            "assets/images/ending.png",
            "【マンションの解放・夜明け】\n眩い神聖光が御堂の核を貫き、悪魔の巨躯は光の塵となって霧散していった。\nタワマンを覆っていた禍々しい黒雲が裂け、窓から眩しい朝陽が街全体を照らし出す。\n\n静まり返ったフロアで、ポケットのスマホがピロンと鳴った。\n画面には就活サイトからの事務的な通知。『〇〇株式会社：二次面接の日程調整について』\n\n主人公はふっと苦笑し、スマホをポケットに突っ込んだ。\n足元にすっと寄り添い、優雅にしっぽを揺らす黒猫。朝陽に照らされた街の遠くを見つめながら、どこか誇らしげに目を細めている。\n\n主人公\n「さてと……これからどうする、相棒？ 就職活動でもするか？」\n\n（澄み渡る街を見渡して、手の中の銃を見つめる）\n\n主人公\n「…………いっそ、プロのエクソシスト（悪魔祓い）になるか。」\n\n黒猫は楽しそうに喉を鳴らし、「ニャー」と短く鳴いた。\n二人の影が、朝陽に長く伸びていく――。",
            () => {
                showMessageDialog("【 TRUE END : プロのエクソシスト 】\n\nマンション・インフェルノ クリア！\n完全な潔白証明、おめでとうございます！", returnToTitle);
            }
        );
    } 
    // ② NORMAL END: Sin 1 〜 30
    else if (currentSin > 0 && currentSin <= 30) {
        showConversationDialog(
            "assets/images/knife.jpg",
            "【終わらない贖罪】\n御堂は滅び、黒雲の裂け目から朝陽が差し込む。\nしかし、主人公の胸の奥に残る「人間を撃ってしまった罪悪感」は消えない。\n\nスマホが鳴り、就活の面接通知が表示されるが、主人公は画面を見つめたまま立ち尽くす。\n\n主人公\n「……俺の手は、もう綺麗じゃないな。\nこんな血で汚れた手で、普通の生活に戻れるわけがない……。」\n\n黒猫はじゃれつくことなく、少し離れた瓦礫の上から、試すような冷たい瞳でじっと主人公を見つめている。\n主人公は血に濡れた武器を強く握りしめ、影を落とした瞳で前を向いた。\n\n主人公\n「就活は辞退だ。\n……背負った罪は消えない。なら、街に残った悪魔をすべて狩り尽くすまで、俺は戦うのをやめない。……付き合ってくれるか、相棒。」\n\n黒猫は小さく頷くように目を細め、静かに主人公の影の中へと溶けていった――。",
            () => {
                showMessageDialog("【 NORMAL END : 贖罪の執行人 】\n\nマンション・インフェルノ クリア。\n（※1階の無人レジで罪を全て浄化していれば、別の結末が……？）", returnToTitle);
            }
        );
    } 
    // ③ BAD END: Sin 31以上
    else {
        playVideo("assets/images/demon/6f-doppelganger.mp4", () => {
            showMessageDialog(
                "【新・悪魔王の誕生】\n御堂が絶叫とともに爆散した瞬間――その体から吹き出した大量の黒煙と怨念が、浄化されることなく主人公の全身へと吸い込まれていく。\n罪に染まりきった主人公の肉体は、悪魔の瘴気を拒絶するどころか、極上の苗床として貪り食ったのだ。\n\n窓の外の黒雲は晴れず、むしろマンションを中心に赤黒い雷光が渦を巻き始める。\nスマホが鳴り、就活の通知が届くが――主人公はそれを床に叩き落とし、踵で無残に踏み砕いた。\n\n主人公\n「ハハ……ハハハッ！\nなんだこれは……全身に力が漲る……！ 就職活動？ 面接？ 馬鹿馬鹿しい……！」\n\n瞳が禍々しい紅蓮に染まり、背中から黒い魔気の翼が広がっていく。\n足元の黒猫は毛を逆立て、主人公を「新たな怪物」として激しく威嚇したあと、闇の中へと逃げ去っていった。\n\n主人公\n「御堂の言ってたことも、あながち間違いじゃなかったな。\n愚民どもめ……今日からこの俺が、貴様らの新しい『悪魔王』だ。」\n\nマンション・インフェルノに、新たな絶望の支配者が君臨した――。",
                () => {
                    showMessageDialog("【 BAD END : 新・悪魔王誕生 】\n\nゲームオーバー……。\n（※人間を撃ちすぎです。1階の無人レジでお金を払って罪を浄化してください）", returnToTitle);
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
        image: "assets/images/demon/demon18.png",
        hp: 350,
        atk: 75,
        def: 5,
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