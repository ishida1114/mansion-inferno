// maps/map2F.js - 2階固有イベント（モデルガン光る演出＆ラミナ装填アプリ自動起動制御版）

import { showMessageDialog, showConversationDialog, showItemAcquiredModal } from '../ui.js';

export const playerStart2F = { x: 1, y: 1, dir: 1 };

export const map2F = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 2, 0, 1, 0, 1], // (4, 2) 教え子の部屋
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 1, 1, 0, 1, 8, 1], // (1, 4) 一般部屋ドア（査問発火）
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function handleEvent2F(targetCell, gameState, context) {
    // 2: 教え子の部屋（★モデルガン光る演出 ➔ アプリ自動起動）
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
                                        // ★ アプリのラミナ装填画面を自動オープン
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

    // 3: ドアを開ける（査問パート）
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

// 2階廊下歩行時のランダムエンカウント（2Fザコ悪魔 demon1.png〜demon3.png）
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