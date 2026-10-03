// 1階マップデータ
// 0: 通路, 1: 壁, 3: コンビニ, 4: 非常階段, 5: ポスト, 6: 血の池, 7: エレベーター
export const map1F = [
    [1, 1, 3, 1, 5, 1, 1, 4, 1, 1], // y=0: 北側の壁にオブジェクト配置
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=1: 北側通路（自由に歩行可能）
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

export function handleEvent1F(targetCode, gameState) {
    switch(targetCode) {
        case 3:
            // コンビニ：動画再生 ➔ ショップ画面
            return { type: "video", src: "assets/videos/CVS.mp4", next: "shop" };

        case 4:
            // 非常階段：鍵がないと登れない
            if (!gameState.hasKey2F) {
                return { 
                    type: "message", 
                    text: "【非常階段の扉】\n重厚な鍵がかかっていて開かない。\nまずは1階を探索し、鍵を手に入れる必要があるようだ……" 
                };
            }
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
            // 血の池：初回のみエクソシスト継承イベント
            if (!gameState.hasExorcistInherited) {
                return { type: "exorcistSequence" };
            } else {
                return { 
                    type: "message", 
                    text: "【血の池】\nどす黒い血の池が不気味に静まり返っている……。\n先ほどのエクソシストが引きずり込まれた痕跡だけが残っている。" 
                };
            }

        case 7:
            alert("【エレベーター】ボタンを押しても反応がない。『電源が落ちています』と赤字で表示されている。");
            break;
        default:
            break;
    }
    return null;
}