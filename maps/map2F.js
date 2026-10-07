// maps/map2F.js - 2階固有イベント（モデルガンモーダル表示 ＆ 2F敵遭遇制御版）

import { showMessageDialog, showConversationDialog, showItemAcquiredModal } from '../ui.js';

export const playerStart2F = { x: 1, y: 1, dir: 1 };

export const map2F = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 2, 0, 1, 0, 1], // (4, 2) 教え子の部屋
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 8, 1], // (7, 4) フロアボス影山の部屋
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function handleEvent2F(targetCell, gameState, context) {
    // 2: 教え子の部屋（★モデルガン獲得モーダル＆画像表示）
    if (targetCell === 2) {
        if (!gameState.hasModelGun) {
            return {
                run: (onComplete) => {
                    showConversationDialog("assets/images/human1.png", "【教え子】\n「先生……っ！ 助けに来てくれたんだね！\nこれ……父親の部屋にあったモデルガンなんだけど、持っていって！」", () => {
                        gameState.hasModelGun = true;
                        gameState.player.hasModelGun = true;
                        
                        // ★ modelgun.jpg 画像モーダルのポップアップ呼び出し
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

    // 8: ボス影山の部屋
    if (targetCell === 8) {
        return {
            run: (onComplete) => showMessageDialog("【2F 影山の部屋】\n部屋の奥から禍々しい視線を感じる……！（ボス戦準備中）", onComplete)
        };
    }

    return null;
}

// ★ 2階の歩行移動時にランダムで悪魔（ザコ敵）とエンカウントする処理
export function check2FRandomEncounter(gameState, onEncounter) {
    // モデルガン入手前でも敗走チュートリアルとして遭遇可能（20%の確率）
    if (Math.random() < 0.20) {
        if (onEncounter) onEncounter();
        return true;
    }
    return false;
}