// 1階マップデータ
// 0: 通路, 1: 壁, 3: コンビニ, 4: 非常階段, 5: ポスト, 6: 血の池, 7: エレベーター
export const map1F = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 3, 0, 5, 0, 0, 4, 0, 1], // 北側通路（4:非常階段）
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 6, 6, 6, 6, 1, 0, 1],
    [1, 0, 1, 6, 6, 6, 6, 7, 0, 1],
    [1, 0, 1, 6, 6, 6, 6, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // スタート位置 (x:4, y:8)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export const playerStart1F = {
    x: 4,
    y: 8,
    dir: 0 // 北向き
};

export function handleEvent1F(targetCode) {
    switch(targetCode) {
        case 3:
            return { type: "video", src: "assets/videos/CVS.mp4", next: "shop" };
        case 4:
            // 2階へ上るアクションを返す
            return { type: "changeFloor", targetFloor: 2 };
        case 5:
            alert("【集合ポスト】『202号室の住人は毎夜、鏡に向かって呪文を呟いている』と書かれた紙切れが入っている…");
            break;
        case 6:
            alert("【吹き抜けの手すり】どす黒い血の池から無数の黒い手が蠢き、うめき声が響いている…");
            break;
        case 7:
            alert("【エレベーター】ボタンを押しても反応がない。『電源が落ちています』と赤字で表示されている。");
            break;
        default:
            break;
    }
    return null;
}