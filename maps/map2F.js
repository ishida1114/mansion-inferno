// 2階マップデータ
// 0: 通路, 1: 壁, 2: 一般客室ドア, 4: 非常階段, 8: 生徒の部屋, 9: 202号室（ボス部屋）
export const map2F = [
    [1, 1, 4, 1, 1, 1, 1, 1, 1, 1], // y=0: 北側（非常階段）
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=1: 通路
    [1, 0, 1, 1, 8, 1, 9, 1, 0, 1], // y=2: 8:生徒の部屋, 9:202号室(影山)
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1], // y=3: 中央廊下
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 2, 2, 0, 1, 0, 1], // y=5: 2:一般客室
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=7: 通路
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=8: 1Fからの到着位置 (x:1, y:8)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export const playerStart2F = {
    x: 1,
    y: 8,
    dir: 0 // 北向き
};

export function handleEvent2F(targetCode, gameState) {
    switch(targetCode) {
        case 2:
            // 一般客室（見極めイベントまたは鍵かかり）
            return { 
                type: "message", 
                text: "【客室の扉】\n鍵がかかっている。中からかすかに不気味な気配が漂っている……" 
            };

        case 4:
            // 階段（1階へ戻る）
            return { type: "changeFloor", targetFloor: 1 };

        case 8:
            // 生徒の部屋（生徒保護 ＆ モデルガン入手）
            if (!gameState.hasModelGun) {
                return { type: "studentEvent" };
            } else {
                return { 
                    type: "message", 
                    text: "【生徒の部屋】\n部屋の中は空っぽだ。生徒は無事に1階へ向かったはずだ。" 
                };
            }

        case 9:
            // 202号室（ボス：ストーカー影山）
            if (!gameState.hasModelGun) {
                return { 
                    type: "message", 
                    text: "【202号室】\n扉の向こうから激しい呻き声と呪詛が聞こえる……。\n武器（モデルガン）なしで入るのは危険すぎる！" 
                };
            }
            return { type: "bossBattle2F" };

        default:
            break;
    }
    return null;
}