// maps/map2F.js - 2階マップ（1F下り階段設置・各種イベント）

import { showMessageDialog, showConversationDialog, showItemAcquiredModal, playFloorTransition } from '../ui.js';

export const playerStart2F = { x: 1, y: 1, dir: 0 };

// ★ (1, 0) にセル値 4（1階へ戻る非常階段の扉）を配置
export const map2F = [
    [1, 4, 1, 1, 1, 1, 1, 1, 1], // (1, 0) 1階非常階段扉
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 2, 0, 1, 0, 1], // (4, 2) 教え子の部屋
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 1, 1, 0, 1, 8, 1], // (1, 4) 一般部屋ドア（査問）
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function handleEvent2F(targetCell, gameState, context) {
    // ★ 4: 1階へ下りる非常階段扉
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

    // 2: 教え子の部屋（モデルガン入手 ➔ アプリ自動起動）
    if (targetCell === 2) {
        if (!gameState.hasModelGun) {
            return {
                run: (onComplete) => {
                    showConversationDialog("assets/images/human1.png", "【教え子】\n「先生……っ！ 助けに来てくれたんだね！\nこれ……父親の部屋にあったモデルガンなんだけど、持っていって！」", () => {
                        gameState.hasModelGun = true;
                        gameState.player.hasModelGun = true;
                        
                        showItemAcquiredModal(
                            "assets/images/modelgun.jpg", 
                            "モデルガン（Vox Sacra連動）", 
                            "手渡されたモデルガンを受け取った！", 
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
                run: (onComplete) => showMessageDialog("【教え子の部屋】\n教え子は息をひそめて無事を祈っている。", onComplete)
            };
        }
    }

    // 3: ドアを開ける（査問）
    if (targetCell === 3) {
        return {
            run: (onComplete) => {
                const isDemon = Math.random() < 0.5;
                const entity = isDemon ? {
                    name: "2階の不審な住人",
                    type: "demon",
                    image: "assets/images/demon/demon1.png",
                    weaknesses: [1, 3]
                } : {
                    name: "怯えるマンション住民",
                    type: "human",
                    image: "assets/images/human1.png",
                    weaknesses: []
                };

                if (context && context.openInquisitionUI) {
                    context.openInquisitionUI(entity, onComplete);
                } else {
                    onComplete();
                }
            }
        };
    }

    // 8: ボス影山の部屋
    if (targetCell === 8) {
        return {
            run: (onComplete) => showMessageDialog("【2F 影山の部屋】\n部屋の奥から禍々しい視線を感じる……！（ボス戦準備中）", onComplete)
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