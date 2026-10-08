// maps/map2F.js - 2階マップ＆影山固有ボスデータ完全定義版
import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openBossPuzzleUI 
} from '../ui.js';

export const playerStart2F = { x: 1, y: 1, dir: 0 };

export const map2F = [
    [1, 4, 1, 1, 1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 2, 0, 1, 0, 1], 
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 1, 1, 0, 1, 8, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// ★ 影山固有のパズル設定データ（2Fマップファイル内に集約）
const kageyamaPuzzleConfig = {
    title: "【フロアボス戦】覗き魔・影山",
    subTitle: "陣の4マスをタップし、下の特大カードを選べ！（※重複使用不可）",
    bossName: "影山",
    slots: [
        { id: "slot1", label: "①顔<br>(上)", gridPos: "grid-area: 1 / 2;" },
        { id: "slot2", label: "②左腕", gridPos: "grid-area: 2 / 1;" },
        { id: "slot3", label: "③右腕", gridPos: "grid-area: 2 / 3;" },
        { id: "slot4", label: "④足元<br>(下)", gridPos: "grid-area: 3 / 2;" }
    ],
    // 影山固有の完全正解判定ロジック
    checkSolution: (slots) => {
        const isFaceCorrect = slots.slot1 === 2; // 顔：2
        const isFootCorrect = slots.slot4 === 3; // 足元：3
        const isArmsCorrect = (slots.slot2 === 1 && slots.slot3 === 4) || (slots.slot2 === 4 && slots.slot3 === 1); // 腕：1と4
        return isFaceCorrect && isFootCorrect && isArmsCorrect;
    },
    // 部分合致計算
    calcMatchCount: (slots) => {
        const isFaceCorrect = slots.slot1 === 2;
        const isFootCorrect = slots.slot4 === 3;
        const isArmsCorrect = (slots.slot2 === 1 && slots.slot3 === 4) || (slots.slot2 === 4 && slots.slot3 === 1);
        return (isFaceCorrect ? 1 : 0) + (isFootCorrect ? 1 : 0) + (isArmsCorrect ? 2 : 0);
    },
    enemy: {
        name: "覗き魔・影山",
        image: "assets/images/demon/2f-kageyama2.jpg",
        hp: 60,
        atk: 12,
        def: 2
    }
};

export function handleEvent2F(targetCell, gameState, context) {
    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                gameState.lastTransitMethod = 'stair';
                playFloorTransition(1, () => {
                    context.changeFloor(1);
                    onComplete();
                });
            }
        };
    }

    if (targetCell === 2) {
        if (!gameState.hasModelGun) {
            return {
                run: (onComplete) => {
                    showConversationDialog("assets/images/human1.png", "【教え子】\n「先生……っ！ 助けに来てくれたんだね！\nこれ……父親の部屋にあったモデルガンと魔除けのお守りなんだ。使って！」", () => {
                        gameState.hasModelGun = true;
                        gameState.player.hasModelGun = true;
                        gameState.player.def += 1;
                        
                        showItemAcquiredModal(
                            "assets/images/modelgun.jpg", 
                            "モデルガン ＆ 魔除けのお守り", 
                            "『モデルガン（Vox Sacra連動）』と『魔除けのお守り（DEF +1）』を受け取った！", 
                            () => {
                                showMessageDialog("【現象が発生！】\nモデルガンが青白く光った！\nポケットの中でスマホが激しく振動し、『悪魔辞典アプリ』が自動的に立ち上がった……！", () => {
                                    showMessageDialog("【悪魔辞典】\n「手持ちの退魔カード『ラミナ』が共鳴して光っている……。\nモデルガンにラミナを装填しろということだろうか？」", () => {
                                        if (context && context.openLoadoutApp) {
                                            context.openLoadoutApp();
                                        }
                                        onComplete();
                                    });
                                });
                            }
                        );
                    });
                }
            };
        } else {
            return {
                run: (onComplete) => showMessageDialog("【教え子の部屋】\n教え子は1階のコンビニへ無事に避難した。部屋は空っぽだ。", onComplete)
            };
        }
    }

    if (targetCell === 3) {
        return {
            run: (onComplete) => {
                const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
                const vec = dirVectors[gameState.player.dir];
                const frontX = gameState.player.x + vec.x;
                const frontY = gameState.player.y + vec.y;
                const roomKey = `2F_${frontX}_${frontY}`;

                if (!gameState.clearedRooms) gameState.clearedRooms = {};

                if (gameState.clearedRooms[roomKey]) {
                    showMessageDialog("【住人の部屋】\nこの部屋にはもう誰もいない……。", onComplete);
                    return;
                }

                const humanImages = ["assets/images/human1.png", "assets/images/human2.png", "assets/images/human3.png"];
                const randFace = humanImages[Math.floor(Math.random() * humanImages.length)];

                const demonList = [
                    { name: "2階の不審な住人", realImage: "assets/images/demon/demon1.png", weakness: 3 },
                    { name: "不気味な笑顔の住人", realImage: "assets/images/demon/demon2.png", weakness: 4 },
                    { name: "言葉遣いがおかしい住民", realImage: "assets/images/demon/demon3.png", weakness: 5 }
                ];
                const randDemon = demonList[Math.floor(Math.random() * demonList.length)];

                const isDemon = Math.random() < 0.5;
                const entity = isDemon ? {
                    name: randDemon.name,
                    type: "demon",
                    faceImage: randFace,
                    realImage: randDemon.realImage,
                    image: randDemon.realImage,
                    weakness: randDemon.weakness
                } : {
                    name: "怯えるマンション住民",
                    type: "human",
                    faceImage: randFace,
                    image: randFace,
                    weakness: null
                };

                if (context && context.openInquisitionUI) {
                    context.openInquisitionUI(entity, (result) => {
                        if (result === "combat_win" || result === "finish" || result === "kill_human") {
                            gameState.clearedRooms[roomKey] = true;
                        }
                        onComplete();
                    }, context);
                } else {
                    onComplete();
                }
            }
        };
    }

    // 8: ボス影山の部屋
    if (targetCell === 8) {
        return {
            run: (onComplete) => {
                if (gameState.flags.cleared2F) {
                    showMessageDialog("【2F 影山の部屋】\n部屋の中は静まり返っている……。", onComplete);
                    return;
                }

                // ★ 1. カットイン動画(2f-kageyama.mp4)再生
                playVideo("assets/videos/2f-kageyama.mp4", () => {
                    // ★ 2. 画像(2f-kageyama2.jpg)で会話ウィンドウ表示
                    showConversationDialog(
                        "assets/images/demon/2f-kageyama2.jpg", 
                        "【覗き魔・影山】\n「中学生の父親？？さぁな、男には興味がなくてねぇ、邪魔するなら、お前のトラウマを覗いて闇の檻に閉じ込めるぞ」", 
                        () => {
                            // ★ 3. 影山の設定データ(kageyamaPuzzleConfig)を渡して汎用UIを発火
                            openBossPuzzleUI(kageyamaPuzzleConfig, gameState, (result) => {
                                if (result === "win") {
                                    gameState.flags.cleared2F = true;
                                    gameState.hasElevatorKey = true;
                                    
                                    showMessageDialog("【2F ボス撃破！】\n「ギャアアアアッ！ 覗いて何が悪いんだァァァッ！！」\n影山は叫び声をあげて消滅した！\n（💰500 を獲得！ / 『エレベーターキー』を獲得！）\n※1階のエレベーターから3階へ直接移動可能になりました！", () => {
                                        gameState.player.money += 500;
                                        gameState.gainExp(200);
                                        onComplete();
                                    });
                                } else {
                                    onComplete();
                                }
                            }, context);
                        }
                    );
                });
            }
        };
    }

    return null;
}

export function check2FRandomEncounter(gameState, onEncounter) {
    if (Math.random() < 0.20) {
        const demonNum = Math.floor(Math.random() * 3) + 1;
        const enemy = {
            name: `2階の徘徊悪魔 (${demonNum})`,
            image: `assets/images/demon/demon${demonNum}.png`,
            hp: 30,
            atk: 8,
            def: 2
        };
        if (onEncounter) onEncounter(enemy);
        return true;
    }
    return false;
}