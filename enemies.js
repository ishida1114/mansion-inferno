// enemies.js - 敵ステータス・真田動画パス（assets/images/demon/3f-sanada.mp4）修正版

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

  // 2F 雑魚
  DEVIL_2F: {
    name: '這い回る肉塊',
    hp: 15,
    atk: 5,
    satk: 3,
    def: 1,
    agi: 4,
    rewardMoney: 120,
    weaknessCard: 3,
  },

  // 3F 雑魚
  DEVIL4_3F: {
    name: '悪魔の赤ちゃん',
    image: 'assets/images/demon/demon4.png',
    hp: 42,
    atk: 13,
    satk: 7,
    def: 2,
    agi: 6,
    rewardMoney: 160,
    weaknessCard: 8, // 聖香
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
    weaknessCard: 6, // 聖炎
  },
  DEVIL6_3F: {
    name: '腐敗蟲',
    image: 'assets/images/demon/demon6.png',
    hp: 36,
    atk: 14,
    satk: 8,
    def: 1,
    agi: 8,
    rewardMoney: 140,
    weaknessCard: 3, // 塩
  },

  // 2F フロアボス：ストーカー影山
  KAGEYAMA_2F: {
    name: 'ストーカー影山',
    video: 'assets/images/demon/2f-kageyama.mp4',
    hp: 60,
    atk: 8,
    satk: 6,
    def: 2,
    agi: 6,
    rewardMoney: 500,
    baseLevel: 8,

    puzzle: {
      openSlots: [1, 3, 5, 7],
      correctSolution: {
        1: 2,
        7: 3,
        3: 1,
        5: 4,
      },
      targetSum: 10
    }
  },

  // 3F フロアボス：ゴミ屋敷の狂人・真田
  SANADA_3F: {
    name: 'ゴミ屋敷の狂人・真田',
    video: 'assets/images/demon/3f-sanada.mp4',
    image: 'assets/images/demon/demon5.png',
    hp: 110,
    atk: 18,
    satk: 12,
    def: 3,
    agi: 6,
    rewardMoney: 800,
    baseLevel: 8,

    puzzle: {
      openSlots: [1, 3, 5, 7],
      correctSolution: {
        1: 8, // ①上（毒ガス口）＝ 聖香 (8)
        7: 6, // ④下（腐敗ゴミ）＝ 聖炎 (6)
        3: 1, // ②左（腕）     ＝ 聖水 (1)
        5: 3, // ③右（腕）     ＝ 塩 (3)
      },
      targetSum: 18 // 8 + 6 + 1 + 3 = 18
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
      if (card === solution[slotId]) {
        correctCount++;
      }
    }
  }

  if (correctCount === 4 && currentSum === 10) {
    return { result: 'PERFECT', damageMultiplier: 3.0, message: '特効発動！ 魔方陣が輝き影山が絶叫する！' };
  } else if (correctCount >= 2 || currentSum === 10) {
    return { result: 'PARTIAL', damageMultiplier: 1.2, message: '一部の弱点が合致！ 手応えがあった。' };
  } else {
    return { result: 'FAIL', damageMultiplier: 0.2, message: '不完全な陣だ！ 影山に弾かれた！' };
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
      if (card === solution[slotId]) {
        correctCount++;
      }
    }
  }

  if (correctCount === 4 && currentSum === 18) {
    return { result: 'PERFECT', damageMultiplier: 3.0, message: '特効発動！ 聖なる香と炎が悪臭とゴミの悪魔を浄化する！' };
  } else if (correctCount >= 2 || currentSum === 18) {
    return { result: 'PARTIAL', damageMultiplier: 1.2, message: '一部の弱点が合致！ 毒気が和らいだ。' };
  } else {
    return { result: 'FAIL', damageMultiplier: 0.2, message: '不完全な陣だ！ 悪臭とヘドロに阻まれた！' };
  }
}