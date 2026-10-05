// maps/map2F.js
import { showMessageDialog, showConversationDialog, showItemAcquiredModal } from '../ui.js';
import { openAppToLoadout } from '../appUI.js';

export const playerStart2F = { x: 1, y: 1, dir: 2 };

export const map2F = [
    [1, 4, 1], // 1階へ降りる階段
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 8, 1], // 生徒の部屋
    [1, 1, 1]
];

export function handleEvent2F(targetCell, gameState, context) {
    if (targetCell === 4) {
        return { run: (onComplete) => { context.changeFloor(1); onComplete(); } };
    }
    if (targetCell === 8) {
        if (!gameState.hasModelGun) {
            return { run: (onComplete) => startStudentEvent(gameState, onComplete) };
        } else {
            return {
                run: (onComplete) => {
                    showMessageDialog("【201号室】\n部屋の中は空っぽだ。生徒はすでに1階のコンビニへ避難したようだ。", onComplete);
                }
            };
        }
    }
    return null;
}

// -------------------------------------------------------------
// ★ 以下、2階固有のイベント演出処理
// -------------------------------------------------------------

function startStudentEvent(gameState, onComplete) {
    showConversationDialog("assets/images/human1.png", "【生徒】\n「先生……っ！ よかった、来てくれたんだ……！」\n\n「お父さんが、上の階の様子を見てくるって言ったまま戻ってこないんだ……。外からは変な声が聞こえるし、怖くて……」\n\n「先生、お願い……これを使ってお父さんを助けて……！」", () => {
        showMessageDialog("【主人公】\n（これは……モデルガン？ なぜこんなものを……いや、今はこれでも心強い。）\n\n「わかった、お父さんは俺が探す。お前は1階のコンビニへ逃げろ。あそこなら安全なはずだ」", () => {
            showItemAcquiredModal("assets/images/modelgun.jpg", "物理モデルガン", "生徒から託された精巧なモデルガン。\n『悪魔辞典アプリ』と連動し、退魔の札『ラミナ』を装填できる！", () => {
                gameState.hasModelGun = true;
                
                showMessageDialog("【主人公】\n「待てよ……弾が入っていない。どうすれば……？」\n\n「あ、そうか！ エクソシストから受け取った『悪魔辞典アプリ』にラミナ（札）を装填すれば、弾として撃てるんだった！」", () => {
                    openAppToLoadout(); 
                    onComplete();
                });
            });
        });
    });
}