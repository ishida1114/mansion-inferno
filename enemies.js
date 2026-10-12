// enemies.js - 2F雑魚敵3体（小鬼・ネズミ・ポルターガイスト）追加統合版

export const ENEMIES = {
  // 1F 雑魚
  DEVIL_1F: {
    name: '下級の悪霊',
    hp: 8,
    atk: 3,
    satk: 2,
    def: 0,
    agi: 3,
    rewardMoney: 60,
    weaknessCard: 1,
  },

  // ★ 2F 雑魚（3種正式定義）
  DEVIL1_2F: {
    name: '徘徊する小鬼',
    image: 'assets/images/demon/demon1.png',
    hp: 20,
    atk: 6,
    satk: 4,
    def: 1,
    agi: 4,
    rewardMoney: 80,
    weaknessCard: 1,
  },
  DEVIL2_2F: {
    name: '潜んでいたネズミ',
    image: 'assets/images/demon/demon2.png',
    hp: 15,
    atk: 5,
    satk: 3,
    def: 1,
    agi: 6,
    rewardMoney: 70,
    weaknessCard: 3,
  },
  DEVIL3_2F: {
    name: 'ポルターガイスト',
    image: 'assets/images/demon/demon3.png',
    hp: 25,
    atk: 7,
    satk: 5,
    def: 2,
    agi: 5,
    rewardMoney: 100,
    weaknessCard: 2,
  },

  // 3F 雑魚
  DEVIL4_3F: {
    name: '悪魔の食卓',
    image: 'assets/images/demon/demon4.png',
    hp: 42,
    atk: 13,
    satk: 7,
    def: 2,
    agi: 6,
    rewardMoney: 160,
    weaknessCard: 8,
  },
  DEVIL5_3F: {
    name: 'かつてペットだったもの',
    image: 'assets/images/demon/demon5.png',
    hp: 68,
    atk: 16,
    satk: 7,
    def: 3,
    agi: 5,
    rewardMoney: 200,
    weaknessCard: 6,
  },
  DEVIL6_3F: {
    name: '腐敗臭のする蟲',
    image: 'assets/images/demon/demon6.png',
    hp: 36,
    atk: 14,
    satk: 8,
    def: 1,
    agi: 8,
    rewardMoney: 140,
    weaknessCard: 3,
  },

  // 4F 雑魚
  DEVIL7_4F: {
    name: 'リナちゃんのスマホ',
    image: 'assets/images/demon/demon7.jpg',
    hp: 50,
    atk: 18,
    satk: 12,
    def: 2,
    agi: 7,
    rewardMoney: 220,
    weaknessCard: 2,
  },
  DEVIL8_4F: {
    name: '悪魔の赤ちゃん',
    image: 'assets/images/demon/demon8.jpg',
    hp: 80,
    atk: 20,
    satk: 10,
    def: 3,
    agi: 6,
    rewardMoney: 260,
    weaknessCard: 5,
  },
  DEVIL9_4F: {
    name: '偽りの美貌',
    image: 'assets/images/demon/demon9.jpg',
    hp: 45,
    atk: 19,
    satk: 14,
    def: 1,
    agi: 9,
    rewardMoney: 240,
    weaknessCard: 1,
  },

  // 4F リナ親衛隊A（元・富裕層パパ）
  SHINEI_A_4F: {
    name: 'リナ親衛隊A（狂乱の元富裕層）',
    image: 'assets/images/demon/shineia.png',
    hp: 75,
    atk: 17,
    def: 2,
    agi: 5,
    rewardMoney: 350,
    weaknessCard: 2,
  },

  // 4F リナ親衛隊B（狂信的ファン）
  SHINEI_B_4F: {
    name: 'リナ親衛隊B（狂信的ガチ恋）',
    image: 'assets/images/demon/shineib.png',
    hp: 90,
    atk: 19,
    def: 3,
    agi: 6,
    rewardMoney: 400,
    weaknessCard: 5,
  },

  // 2F フロアボス：ストーカー影山
  KAGEYAMA_2F: {
    name: 'ストーカー影山',
    video: 'assets/images/demon/2f-kageyama.mp4',
    image: 'assets/images/demon/2f-kageyama2.jpg',
    hp: 120,
    atk: 12,
    satk: 6,
    def: 2,
    agi: 6,
    rewardMoney: 500,
    baseLevel: 5,

    puzzle: {
      openSlots: [1, 3, 5, 7],
      correctSolution: { 1: 2, 7: 3, 3: 1, 5: 4 },
      targetSum: 10
    }
  },

  // 3F フロアボス：ゴミ屋敷の狂人・真田
  SANADA_3F: {
    name: 'ゴミ屋敷の狂人・真田',
    video: 'assets/images/demon/3f-sanada.mp4',
    image: 'assets/images/demon/3f-sanada.jpg',
    hp: 110,
    atk: 18,
    satk: 12,
    def: 3,
    agi: 6,
    rewardMoney: 800,
    baseLevel: 10,

    puzzle: {
      openSlots: [1, 3, 5, 7],
      correctSolution: {
        1: 8,
        7: 6,
        3: 1,
        5: 3,
      },
      targetSum: 18
    }
  },

  // 4F フロアボス：色欲のパパ活女子・リナ
  RINA_4F: {
    name: '色欲のパパ活女子・リナ',
    video: 'assets/images/demon/4f-rina.mp4',
    image: 'assets/images/demon/4f-rina.jpg',
    hp: 150,
    atk: 22,
    satk: 15,
    def: 4,
    agi: 8,
    rewardMoney: 1200,
    baseLevel: 15,

    puzzle: {
      openSlots: [1, 3, 5, 7],
      correctSolution: {
        1: 2,
        3: 1,
        5: 5,
        7: 3,
      },
      targetSum: 11
    }
  }
};

export function evaluateKageyamaPuzzle(placedCards) {
  const solution = ENEMIES.KAGEYAMA_2F.puzzle.correctSolution;
  let correctCount = 0;
  let currentSum = 0;

  for (const slotId of [1, 3, 5, 7]) {
    const card = placedCards[slotId];
    if (card) {
      currentSum += card;
      if (card === solution[slotId]) correctCount++;
    }
  }

  if (correctCount === 4 && currentSum === 10) {
    return { result: 'PERFECT', correctCount: 4 };
  } else if (correctCount > 0) {
    return { result: 'PARTIAL', correctCount: Math.min(correctCount, 3) };
  } else {
    return { result: 'FAIL', correctCount: 0 };
  }
}

export function evaluateSanadaPuzzle(placedCards) {
  const solution = ENEMIES.SANADA_3F.puzzle.correctSolution;
  let correctCount = 0;
  let currentSum = 0;

  for (const slotId of [1, 3, 5, 7]) {
    const card = placedCards[slotId];
    if (card) {
      currentSum += card;
      if (card === solution[slotId]) correctCount++;
    }
  }

  if (correctCount === 4 && currentSum === 18) {
    return { result: 'PERFECT', correctCount: 4 };
  } else if (correctCount > 0) {
    return { result: 'PARTIAL', correctCount: Math.min(correctCount, 3) };
  } else {
    return { result: 'FAIL', correctCount: 0 };
  }
}

export function evaluateRinaPuzzle(placedCards) {
  const solution = ENEMIES.RINA_4F.puzzle.correctSolution;
  let correctCount = 0;

  for (const slotId of [1, 3, 5, 7]) {
    const card = placedCards[slotId];
    if (card && card === solution[slotId]) {
      correctCount++;
    }
  }

  if (correctCount === 4) {
    return { result: 'PERFECT', correctCount: 4 };
  } else if (correctCount > 0) {
    return { result: 'PARTIAL', correctCount: Math.min(correctCount, 3) };
  } else {
    return { result: 'FAIL', correctCount: 0 };
  }
}