// maps/map2F.js
import { showMessageDialog, showConversationDialog, showItemAcquiredModal, openInquisitionUI } from '../ui.js';
import { openAppToLoadout } from '../appUI.js';
import { startCombat } from '../combat.js';
import { enemyDefinitions } from '../enemies.js';

export const playerStart2F = { x: 7, y: 1, dir: 2 };

/*
  2階マップ構成 (15 × 7)
  0: 通路, 1: 壁, 4: 1階への階段
  7: 201号室（生徒）
  8: 202号室（人間 / human2.png）
  9: 203号室（悪魔 / demon1.png）
  10: 204号室（人間 / human3.png）
  11: 205号室（悪魔 / demon2.png）
  12: 206号室（人間 / human4.png）
  13: 最奥の黒塗りドア（2Fフロアボス：影山）
*/
export const map2F = [
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 1, 7, 1, 0, 1, 8, 1, 0, 1, 9, 1, 0, 1], // 201号室, 202号室, 203号室
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 10, 1, 0, 1, 11, 1, 0, 1, 12, 1, 0, 1], // 204号室, 205号室, 206号室
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 13, 1, 1, 1, 1, 1, 1, 1]  // 13: 最奥の黒塗りボス部屋
];

// 各部屋のデータ定義
const roomData = {
    7: { id: "room201", type: "student", name: "201号室（生徒の部屋）" },
    8: { id: "room202", type: "human", name: "202号室の住人", image: "assets/images/human2.png" },
    9: { id: "room203", type: "demon", name: "203号室の住人", image: "assets/images/demon/demon1.png", enemyId: "demon1", weaknesses: [2, 7] },
    10: { id: "room204", type: "human", name: "204号室の住人", image: "assets/images/human3.png" },
    11: { id: "room205", type: "demon", name: "205号室の住人", image: "assets/images/demon/demon2.png", enemyId: "demon2", weaknesses: [4, 8] },
    12: { id: "room206", type: "human", name: "206号室の住人", image: "assets/images/human4.png" }
};

export function handleEvent2F(targetCell, gameState, context) {
    // 【4】1階へ下りる階段
    if (targetCell === 4) {
        return { run: (onComplete) => { context.changeFloor(1); onComplete(); } };
    }

    // 【13】最奥の黒塗りボス部屋（2Fフロアボス：影山）
    if (targetCell === 13) {
        if (!gameState.clearedRooms) gameState.clearedRooms = [];
        if (gameState.clearedRooms.includes("boss_kageyama")) {
            return {
                run: (onComplete) => showMessageDialog("【最奥の部屋】\n影山は滅び、部屋には不気味な静寂だけが漂っている……。", onComplete)
            };
        }

        return {
            run: (onComplete) => {
                showMessageDialog("【黒塗りの重層扉】\n扉全体が異様な黒い霧で覆われている……。\n背後から禍々しい殺気を感じる！", () => {
                    startCombat(enemyDefinitions.boss_kageyama, gameState, false, (res) => {
                        if (res === "victory") {
                            gameState.clearedRooms.push("boss_kageyama");
                        }
                        onComplete();
                    });
                });
            }
        };
    }

    // 【7〜12】一般部屋の査問・会話イベント
    if (roomData[targetCell]) {
        const room = roomData[targetCell];

        if (!gameState.clearedRooms) gameState.clearedRooms = [];
        if (gameState.clearedRooms.includes(room.id)) {
            return { run: (onComplete) => showMessageDialog(`【${room.name}】\n……部屋の中には血溜まりだけが残され、誰もいない。`, onComplete) };
        }

        // 201号室：生徒イベント
        if (room.type === "student") {
            if (!gameState.hasModelGun) {
                return { run: (onComplete) => startStudentEvent(gameState, onComplete) };
            } else {
                return { run: (onComplete) => showMessageDialog("【201号室】\n生徒は1階のコンビニへ避難した。部屋は空っぽだ。", onComplete) };
            }
        }

        // 一般部屋：査問UIの呼び出し
        return {
            run: (onComplete) => {
                openInquisitionUI(room, gameState, (result) => {
                    if (result === "combat") {
                        startCombat(enemyDefinitions[room.enemyId], gameState, false, (res) => {
                            if (res === "victory") gameState.clearedRooms.push(room.id);
                            onComplete();
                        });
                    } else if (result === "kill_human") {
                        gameState.sin += 30; // 人間誤射で罪増加
                        gameState.clearedRooms.push(room.id);
                        showMessageDialog("【悲痛な叫び】\n銃声が響き、住人は血の海に沈んだ……。\n……ただの人間だった。取り返しのつかない罪を犯してしまった。\n(SINが30増加した)", onComplete);
                    } else {
                        onComplete(); // 立ち去る
                    }
                });
            }
        };
    }

    return null;
}

function startStudentEvent(gameState, onComplete) {
    showConversationDialog("assets/images/human1.png", "【生徒】\n「先生……っ！ よかった、来てくれたんだ……！」\n\n「お父さんが、上の階の様子を見てくるって言ったまま戻ってこないんだ……。先生、お願い……これを使ってお父さんを助けて……！」", () => {
        showItemAcquiredModal("assets/images/modelgun.jpg", "物理モデルガン", "生徒から託された精巧なモデルガン。\n『悪魔辞典アプリ』と連動し、退魔の札『ラミナ』を装填できる！", () => {
            gameState.hasModelGun = true;
            showMessageDialog("【主人公】\n「待てよ……弾が入っていない。どうすれば……？」\n\n「あ、そうか！ アプリにラミナ（札）を装填すれば、弾として撃てるんだった！」", () => {
                openAppToLoadout(); 
                onComplete();
            });
        });
    });
}