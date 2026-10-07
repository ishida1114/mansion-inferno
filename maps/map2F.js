// maps/map2F.js - 2階マップデータおよび教え子・影山ボス部屋イベント定義

import { showMessageDialog, showConversationDialog } from '../ui.js';

// 2階スタート位置 (x: 1, y: 1, 東向き)
export const playerStart2F = { x: 1, y: 1, dir: 1 };

// 2階マップ配列 (0: 通路, 1: 壁, 2: 教え子の部屋, 8: ボス影山の部屋)
export const map2F = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 2, 0, 1, 0, 1], // (4, 2) 教え子の部屋
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 8, 1], // (7, 4) フロアボス影山の部屋
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// 2階イベントハンドラー
export function handleEvent2F(targetCell, gameState, context) {
    // 2: 教え子の部屋（モデルガン獲得イベント）
    if (targetCell === 2) {
        if (!gameState.hasModelGun) {
            return {
                run: (onComplete) => {
                    showConversationDialog("assets/images/human1.png", "【教え子】\n「先生……っ！ 助けに来てくれたんだね！\nこれ……父親の部屋にあったモデルガンなんだけど、持っていって！」", () => {
                        gameState.hasModelGun = true;
                        gameState.player.hasModelGun = true;
                        showMessageDialog("【モデルガンを入手した！】\n悪魔辞典アプリにモデルガンが連携され、ラミナの装填・射撃機能が解放された！", onComplete);
                    });
                }
            };
        } else {
            return {
                run: (onComplete) => showMessageDialog("【教え子の部屋】\n教え子は身をひそめて無事を祈っている。", onComplete)
            };
        }
    }

    // 8: ボス影山の部屋
    if (targetCell === 8) {
        return {
            run: (onComplete) => showMessageDialog("【2F 影山の部屋】\n部屋の奥から禍々しい視線を感じる……！（ボス戦準備中）", onComplete)
        };
    }

    return null;
}