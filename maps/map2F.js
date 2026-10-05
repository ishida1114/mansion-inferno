// maps/map2F.js
export const playerStart2F = { x: 1, y: 1, dir: 2 }; // ★ 階段の前（南向き）

export const map2F = [
    [1, 4, 1], // y=0: 4は1階へ降りる階段のドア
    [1, 0, 1], // y=1: 初期位置(1,1)
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 8, 1], // y=7: 生徒の部屋
    [1, 1, 1]
];

export function handleEvent2F(targetCell, gameState) {
    if (targetCell === 4) {
        // ★ 1階へ戻る階段イベント
        return { type: "changeFloor", targetFloor: 1 };
    }
    if (targetCell === 8) {
        if (!gameState.hasModelGun) {
            return { type: "studentEvent" };
        } else {
            return { type: "message", text: "【201号室】\n部屋の中は空っぽだ。生徒はすでに1階のコンビニへ避難したようだ。" };
        }
    }
    return null;
}