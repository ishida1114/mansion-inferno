// maps/map2F.js - 2階マップ（影山ボス戦発火対応完全版）
import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openBossPuzzleUI 
} from '../ui.js';

export const playerStart2F = { x: 1, y: 1, dir: 0 };

export const map2F = [
    [1, 4, 1, 1, 1, 1, 1, 1, 1], // (1, 0) 1階非常階段扉
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 2, 0, 1, 0, 1], // (4, 2) 教え子の部屋
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 1, 1, 0, 1, 8, 1], // (7, 4) ボス影山の部屋(8)
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function handleEvent2F(targetCell, gameState, context) {
    // 4: 1階へ下りる非常階段扉
    if (targetCell === 4) {
        return {
            run: (onComplete) => {
                playFloorTransition(1, () => {
                    context.changeFloor(1);
                    onComplete();
                });
            }
        };
    }

    // 2: 教え子の部屋（モデルガン ＆ 魔除けのお守り DEF +1 入手）
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

    // 3: 一般部屋ドア（対面時は人間と同じ見た目で擬態）
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
                    { name: "2階の不審な住人", realImage: "assets/images/demon/demon1.png", weaknesses: [1, 3] },
                    { name: "気妙な笑顔の住人", realImage: "assets/images/demon/demon2.png", weaknesses: [2, 4] },
                    { name: "言葉遣いがおかしい住民", realImage: "assets/images/demon/demon3.png", weaknesses: [5, 7] }
                ];
                const randDemon = demonList[Math.floor(Math.random() * demonList.length)];

                const isDemon = Math.random() < 0.5;
                const entity = isDemon ? {
                    name: randDemon.name,
                    type: "demon",
                    faceImage: randFace,
                    realImage: randDemon.realImage,
                    image: randDemon.realImage,
                    weaknesses: randDemon.weaknesses
                } : {
                    name: "怯えるマンション住民",
                    type: "human",
                    faceImage: randFace,
                    image: randFace,
                    weaknesses: []
                };

                if (context && context.openInquisitionUI) {
                    context.openInquisitionUI(entity, (result) => {
                        if (result === "combat_win" || result === "finish" || result === "kill_human") {
                            gameState.clearedRooms[roomKey] = true;
                        }
                        onComplete();
                    });
                } else {
                    onComplete();
                }
            }
        };
    }

    // ★ 8: 最奥 影山の部屋（登場演出 ➔ パズルUI発火）
    if (targetCell === 8) {
        return {
            run: (onComplete) => {
                if (gameState.flags.cleared2F) {
                    showMessageDialog("【2F 影山の部屋】\n部屋の中は静まり返っている……。", onComplete);
                    return;
                }

                // 影山登場動画再生 ➔ パズル戦UI起動
                playVideo("assets/videos/2f-kageyama.mp4", () => {
                    openBossPuzzleUI(gameState, (result) => {
                        if (result === "win") {
                            gameState.flags.cleared2F = true;
                            gameState.hasKey2F = true;
                            
                            showMessageDialog("【2F ボス撃破！】\n「ギャアアアアッ！ 覗いて何が悪いんだァァァッ！！」\n影山は叫び声をあげて消滅した！\n（💰500 を獲得！ / 3階非常階段の鍵を獲得！）", () => {
                                gameState.player.money += 500;
                                gameState.gainExp(200);
                                onComplete();
                            });
                        } else {
                            onComplete();
                        }
                    });
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