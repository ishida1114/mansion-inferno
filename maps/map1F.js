// maps/map1F.js

// 初期スタート位置：1階非常階段の真ん前 (x:7, y:1, dir:0 は北向き＝階段ドアを直視)
export const playerStart1F = { x: 7, y: 1, dir: 0 };

/*
  1階マップ構成 (15 × 7)
  0: 通路
  1: 壁
  2: コンビニ（無人レジ）
  3: 中庭（血の池・エクソシスト）
  4: 2階への非常階段扉
  5: 集合ポスト（郵便受け）
  6: エントランス扉（外への出口）
*/
export const map1F = [
    [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1], // y=0: (7,0)に非常階段扉
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=1: 横メイン通路 (7,1はスタート地点)
    [1, 0, 1, 2, 1, 0, 1, 3, 1, 0, 1, 5, 1, 0, 1], // y=2: (3,2)=コンビニ, (7,2)=血の池, (11,2)=ポスト
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], // y=3: 縦通路
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], // y=4: 縦通路
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=5: 横南通路
    [1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 1, 1, 1]  // y=6: (7,6)にエントランス扉
];

export function handleEvent1F(targetCell, gameState) {
    // 【4】2階への非常階段
    if (targetCell === 4) {
        if (!gameState.hasKey2F) {
            return {
                type: "message",
                text: "【非常階段の扉】\n重厚な鉄の扉に頑丈な錠前がかかっている……。\n2階へ上がるには『2F非常階段の鍵』が必要のようだ。\nまずは1階を探索して手がかりや鍵を探そう。"
            };
        } else {
            return { type: "changeFloor", targetFloor: 2 };
        }
    }

    // 【2】1階コンビニ（悪魔の無人レジ）
    if (targetCell === 2) {
        if (!gameState.hasMetGrandma) {
            return { type: "grandmaEvent" };
        } else {
            return { type: "shop" };
        }
    }

    // 【3】中庭の血の池・エクソシスト継承イベント
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

    // 【5】集合ポスト（郵便受け）
    if (targetCell === 5) {
        return {
            type: "message",
            text: "【1階集合ポスト】\n錆びついた住民用の郵便受けが並んでいる。\nコンビニのおばあさんが言っていたのはこのポストのことだろうか……。"
        };
    }

    // 【6】エントランス扉（外への出口）
    if (targetCell === 6) {
        return {
            type: "message",
            text: "【エントランス扉】\nガラスの向こうには漆黒の霧が立ち込めている……。\n不思議な力で強く封じられていて、扉はびくともしない。"
        };
    }

    return null;
}