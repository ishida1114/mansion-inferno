// enemies.js
export const enemyDefinitions = {
    demon1: {
        id: "demon1",
        name: "小悪魔 インプ",
        level: 2,
        hp: 20,
        atk: 6,
        satk: 8,
        def: 2,
        agi: 4,
        exp: 15,
        money: 150,
        weakness: "2Card.png",
        image: "assets/images/demon/demon1.png",
        actions: [
            { name: "ひっかき", type: "physical" },
            { name: "黒い呪言", type: "magic" }
        ]
    },
    demon2: {
        id: "demon2",
        name: "擬態悪魔 ヴァーサル",
        level: 3,
        hp: 30,
        atk: 9,
        satk: 10,
        def: 3,
        agi: 5,
        exp: 25,
        money: 200,
        weakness: "4Card.png",
        image: "assets/images/demon/demon2.png",
        actions: [
            { name: "鋭い爪", type: "physical" },
            { name: "狂気の眼光", type: "magic" }
        ]
    },
    demon3: {
        id: "demon3",
        name: "潜伏悪魔 ベルゼフ",
        level: 4,
        hp: 40,
        atk: 12,
        satk: 14,
        def: 4,
        agi: 6,
        exp: 40,
        money: 300,
        weakness: "7Card.png",
        image: "assets/images/demon/demon3.png",
        actions: [
            { name: "かみくだく", type: "physical" },
            { name: "血の波動", type: "magic" }
        ]
    },
    boss_kageyama: {
        id: "boss_kageyama",
        name: "ストーカー 影山",
        level: 5,
        hp: 60,
        atk: 15,
        satk: 18,
        def: 5,
        agi: 7,
        exp: 100,
        money: 500,
        weakness: "3Card.png",
        image: "assets/images/demon/2f-kageyama.mp4",
        actions: [
            { name: "影の触手", type: "physical" },
            { name: "絶望の咆哮", type: "magic" }
        ]
    }
};