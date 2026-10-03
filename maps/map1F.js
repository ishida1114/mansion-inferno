// 1階マップデータ
// 0: 通路, 1: 壁, 3: コンビニ, 4: 非常階段, 5: ポスト, 6: 血の池, 7: エレベーター
export const map1F = [
    [1, 1, 3, 1, 5, 1, 1, 4, 1, 1], // y=0: 北の壁側にオブジェクト（3:コンビニ, 5:ポスト, 4:非常階段）を配置
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=1: 北側通路（全線開通！自由に歩けます）
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
            // コンビニ：動画再生 ➔ ショップ画面
            return { type: "video", src: "assets/videos/CVS.mp4", next: "shop" };
        case 4:
            // 非常階段：2階へ上る
            return { type: "changeFloor", targetFloor: 2 };
        case 5:
            // 集合ポスト：動画再生 ➔ 手記ダイアログ表示
            return { 
                type: "video", 
                src: "assets/videos/post.mp4", 
                next: "message",
                text: "【集合ポスト】\n荒らされたポストの中に、古びた手記が入っている…\n\n『202号室の住人は毎夜、鏡に向かって呪文を呟いている。あの部屋に近づいてはならない…』"
            };
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