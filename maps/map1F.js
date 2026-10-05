// maps/map1F.js

// ★ 初期スタート位置：1階非常階段の真ん前 (x:7, y:1, dir:0 は北向き＝階段のドアを直視)
export const playerStart1F = { x: 7, y: 1, dir: 0 };

export const map1F = [
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1], // y=0: 4は2階への非常階段ドア
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=1: (7,1)が初期位置
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 2, 1, 0, 1, 3, 1, 0, 1, 9, 1, 0, 1], // y=3: 2=コンビニ, 3=中庭(血の池)
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function handleEvent1F(targetCell, gameState) {
    // 2階への非常階段（マス 4）
    if (targetCell === 4) {
        if (!gameState.hasKey2F) {
            // ★ 初期導線：最初は鍵がかかっていることをメッセージで伝え、目的を与える
            return {
                type: "message",
                text: "【非常階段の扉】\n重厚な鉄の扉に頑丈な錠前がかかっている……。\n2階へ上がるには『2F非常階段の鍵』が必要のようだ。\nまずは1階を探索して手がかりや鍵を探そう。"
            };
        } else {
            // 鍵を所持していれば2階へ移動
            return { type: "changeFloor", targetFloor: 2 };
        }
    }

    // 1階コンビニ（マス 2）
    if (targetCell === 2) {
        if (!gameState.hasMetGrandma) {
            return { type: "grandmaEvent" };
        } else {
            return { type: "shop" };
        }
    }

    // 中庭の血の池・エクソシスト継承イベント（マス 3）
    if (targetCell === 3) {
        if (!gameState.hasExorcistInherited) {
            return { type: "exorcistSequence" };
        } else {
            return {
                type: "message",
                text: "【血の池跡】\nエクソシストが沈んでいった血の池……。\n今は静まり返り、ただどす黒い痕跡だけが残っている。"
            };
        }
    }

    return null;
}