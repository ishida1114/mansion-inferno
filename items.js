// items.js
// コンビニで買えるアイテム（消費アイテム）の定義

export const itemDefinitions = {
    coffee: {
        id: "coffee",
        name: "黒い缶コーヒー",
        price: 50,
        desc: "微糖。HPを10回復する。",
        type: "heal",
        value: 10
    },
    energy_drink: {
        id: "energy_drink",
        name: "高濃度エナジードリンク",
        price: 150,
        desc: "怪しい成分入り。HPを全回復する。",
        type: "heal_full",
        value: 0
    },
    umbrella_blue: {
        id: "umbrella_blue",
        name: "青いビニール傘（盾）",
        price: 200,
        desc: "オカルト防壁。戦闘中、3ターンの間DEF+2。",
        type: "buff",
        stat: "def",
        value: 2,
        duration: 3
    },
    umbrella_yellow: {
        id: "umbrella_yellow",
        name: "黄色いビニール傘（招雷）",
        price: 500,
        desc: "閃光の呪符。戦闘中、敵を2ターン休止させる。",
        type: "status",
        effect: "stun",
        duration: 2
    },
    umbrella_clear: {
        id: "umbrella_clear",
        name: "透明なビニール傘（隠れ蓑）",
        price: 150,
        desc: "姿を隠す。戦闘中、3ターンの間AGI+5。",
        type: "buff",
        stat: "agi",
        value: 5,
        duration: 3
    },
    umbrella_red: {
        id: "umbrella_red",
        name: "赤いビニール傘（呪血）",
        price: 300,
        desc: "血の代償。次のターン、銃撃ダメージが2倍。",
        type: "buff",
        stat: "atk_mult",
        value: 2,
        duration: 1
    }
};