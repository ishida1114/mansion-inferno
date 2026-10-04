// enemies.js
// 悪魔の基本データ定義（レベル固定型）

export const enemyDefinitions = {
    // 2F廊下 雑魚悪魔
    demon1: {
        id: "demon1",
        name: "迷いの影悪魔",
        level: 3,         // ★ 脅威度（レベル表示）
        image: "assets/images/demon/demon1.png",
        hp: 30,
        maxHp: 30,
        atk: 18,          // 物理攻撃力
        satk: 22,         // 呪言攻撃力
        def: 2,           // 防御力
        agi: 4,           // 素速さ（主人公の初期AGI5より少し遅い）
        exp: 0.5,         // 経験値（2体で1Lvアップ相当）
        money: 150,       // 獲得お金
        weakness: "1Card.png", // 弱点ラミナ
        actions: [
            { name: "黒い爪で鋭く引き裂く！", type: "physical" },
            { name: "不気味な呪言を吐き捨てる！", type: "magic" }
        ]
    },

    // 2Fボス：ストーカー影山
    boss_kageyama: {
        id: "boss_kageyama",
        name: "202号室の影山",
        level: 5,
        image: "assets/images/human4.png",
        hp: 140,
        maxHp: 140,
        atk: 32,
        satk: 38,
        def: 6,
        agi: 6,           // 主人公が育っていないと先制される
        exp: 2.5,
        money: 600,
        weakness: "1Card.png",
        actions: [
            { name: "包丁を狂暴に振り下ろす！", type: "physical" },
            { name: "耳元で執念の呪詛を囁く！", type: "magic" }
        ]
    }

    /* 
    // ★ 10階での再登場例（Lvが上がり、ステータスが激増している）
    demon1_10F: {
        id: "demon1_10F",
        name: "迷いの影悪魔（怨念）",
        level: 28,
        image: "assets/images/demon/demon1.png",
        hp: 350, maxHp: 350, atk: 120, satk: 145, def: 30, agi: 45,
        exp: 8.0, money: 1200, weakness: "5Card.png",
        actions: [ ... ]
    }
    */
};