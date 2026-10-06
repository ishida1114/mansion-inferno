// enemies.js - 敵ステータス・2F影山魔方陣パズル判定（完全版）

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
    weaknessCard: 1, // 聖水が弱点
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
    weaknessCard: 3, // 塩が弱点
  },

  // 2F フロアボス：ストーカー影山
  KAGEYAMA_2F: {
    name: 'ストーカー影山',
    video: 'assets/videos/2f-kageyama.mp4',
    hp: 60,
    atk: 8,
    satk: 6,
    def: 2,
    agi: 6,
    rewardMoney: 500,
    baseLevel: 8, // 100%合致時の適正Lv

    // 2Fボス 3x3魔方陣パズル（4マス開放）
    puzzle: {
      openSlots: [1, 3, 5, 7], // 0〜8のグリッドのうち開いている4マス
      correctSolution: {
        1: 2, // ①上段（顔・目） ＝ 【Ⅱ】真実の鏡 (2)
        7: 3, // ④下段（足元）   ＝ 【Ⅲ】浄化の塩 (3)
        3: 1, // ②左（腕）      ＝ 【Ⅰ】聖水 (1)
        5: 4, // ③右（腕）      ＝ 【Ⅳ】聖なる十字架 (4)
      },
      targetSum: 10 // 4マスの合計数字
    }
  }
};

// 2Fボス影山魔方陣パズルの解読判定処理
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