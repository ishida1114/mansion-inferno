// maps/map2F.js - 2階マップ・ザコ敵データ・ドア査問制御

import { showMessageDialog, showConversationDialog, showItemAcquiredModal, openInquisitionUI } from '../ui.js';

export const playerStart2F = { x: 1, y: 1, dir: 1 };

// 2階マップ配列 (0: 通路, 1: 壁, 2: 教え子の部屋, 3: 一般部屋ドア(査問), 8: ボス影山の部屋)
export const map2F = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 2, 0, 1, 0, 1], // (4, 2) 教え子の部屋
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 1, 1, 0, 1, 8, 1], // (1, 4) 一般部屋ドア（査問発火）
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// 2階固有の調べ（SPACE）イベント
export function handleEvent2F(targetCell, gameState, context) {
    // 2: 教え子の部屋（モデルガン入手）
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
                            "悪魔辞典アプリとモデルガンが同期！\nラミナカードを装填して聖なる弾丸を撃てるようになった！", 
                            onComplete
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

    // ★ 3: ドアを開ける（住人 vs 悪魔 の査問パート発火）
    if (targetCell === 3) {
        return {
            run: (onComplete) => {
                // ランダムで「本物の人間」か「化けた悪魔」かを選択
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

                openInquisitionUI(entity, gameState, (result) => {
                    onComplete();
                });
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

// ★ 廊下歩行時のランダムエンカウント（査問なし！ 2Fザコ敵 `demon1.png`〜`demon3.png` と直接戦闘）
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