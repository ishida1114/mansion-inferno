// enemies.js - 敵ステータス・個別技メッセージ・5Fボス＆パズル統合完全版[cite: 2]

export const ENEMIES = {
  // ==========================================
  // 1F 雑魚
  // ==========================================
  DEVIL_1F: {
    name: '下級の悪霊',
    hp: 8,
    atk: 3,
    satk: 2,
    def: 0,
    agi: 3,
    rewardMoney: 60,
    weaknessCard: 1,
    actions: [
      'の冷たい手が主人公の首を絞め上げてきた！',
      'が耳元で不気味な怨嗟の声を囁いた！'
    ]
  },

  // ==========================================
  // 2F 雑魚
  // ==========================================
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
    actions: [
      'の鋭い爪が引っ掻いてきた！',
      'が甲高い奇声を上げて飛びかかってきた！'
    ]
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
    actions: [
      'の不潔な牙が噛みついてきた！',
      'が足元を素早くすり抜けて引っ掻いた！'
    ]
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
    actions: [
      'が浮遊する瓦礫を投げつけてきた！',
      'の放つ怪異の衝撃波が吹き飛ばす！'
    ]
  },

  // ==========================================
  // 3F 雑魚
  // ==========================================
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
    actions: [
      'の腐敗した残飯の顎が噛みついてきた！',
      'が吐き気を催す腐臭を吹きかけてきた！'
    ]
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
    actions: [
      'の爛れた肉塊が重くのしかかってきた！',
      'が濁った唸り声をあげて突進してきた！'
    ]
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
    actions: [
      'の毒針が突き刺さる！',
      'が無数の足で素早く這い寄って噛みついてきた！'
    ]
  },

  // ==========================================
  // 4F 雑魚 ＆ 中ボス
  // ==========================================
  DEVIL7_4F: {
    name: 'リナちゃんのスマホ',
    image: 'assets/images/demon/demon7.png',
    hp: 110,
    atk: 32,
    satk: 18,
    def: 3,
    agi: 9,
    rewardMoney: 300,
    weaknessCard: 2,
    actions: [
      'の画面から無数の通知と呪詛が弾け飛ぶ！',
      'が耳をつんざく着信音で鼓膜を震わせる！'
    ]
  },
  DEVIL8_4F: {
    name: '悪魔の赤ちゃん',
    image: 'assets/images/demon/demon8.png',
    hp: 140,
    atk: 35,
    satk: 20,
    def: 4,
    agi: 8,
    rewardMoney: 330,
    weaknessCard: 5,
    actions: [
      'の不気味な泣き声が精神を激しく削り取る！',
      'が異常な力でしがみついて噛みついてきた！'
    ]
  },
  DEVIL9_4F: {
    name: '偽りの美貌',
    image: 'assets/images/demon/demon9.png',
    hp: 100,
    atk: 38,
    satk: 22,
    def: 2,
    agi: 10,
    rewardMoney: 310,
    weaknessCard: 1,
    actions: [
      'の桃色の毒霧が主人公を包み込む！',
      'の鋭く研ぎ澄まされた爪が空を裂く！'
    ]
  },
  SHINEI_A_4F: {
    name: 'リナ親衛隊A（狂乱の元富裕層）',
    image: 'assets/images/demon/shineia.png',
    hp: 250,
    atk: 40,
    def: 4,
    agi: 7,
    rewardMoney: 600,
    weaknessCard: 2,
    actions: [
      'が『リナちゃんのために！』と札束を握りしめて殴りかかる！',
      'の狂乱した怒号が叩きつけられる！'
    ]
  },
  SHINEI_B_4F: {
    name: 'リナ親衛隊B（狂信的ガチ恋）',
    image: 'assets/images/demon/shineib.png',
    hp: 280,
    atk: 45,
    def: 5,
    agi: 8,
    rewardMoney: 700,
    weaknessCard: 5,
    actions: [
      'が血走った目で激しく突進してきた！',
      'の執着に狂った拳が主人公を打ちのめす！'
    ]
  },

  // ==========================================
  // 5F 雑魚エネミー（キメラ実験体）
  // ==========================================
  DEVIL10_5F: {
    name: '融解したキメラ',
    image: 'assets/images/demon/demon10.png',
    hp: 180,
    atk: 48,
    satk: 25,
    def: 5,
    agi: 9,
    rewardMoney: 450,
    weaknessCard: 1,
    actions: [
      'のドロドロに溶けた肉塊の腕が殴りかかってきた！',
      'が腐食性の体液を撒き散らして攻撃してきた！'
    ]
  },
  DEVIL11_5F: {
    name: '猟犬キメラ',
    image: 'assets/images/demon/demon11.png',
    hp: 210,
    atk: 54,
    satk: 20,
    def: 4,
    agi: 13,
    rewardMoney: 500,
    weaknessCard: 3,
    actions: [
      'の二重に裂けた顎が激しく噛みついてきた！',
      'が奇怪な四足歩行で飛びかかって引き裂いた！'
    ]
  },
  DEVIL12_5F: {
    name: '甲殻合成キメラ',
    image: 'assets/images/demon/demon12.png',
    hp: 250,
    atk: 50,
    satk: 22,
    def: 8,
    agi: 7,
    rewardMoney: 550,
    weaknessCard: 9,
    actions: [
      'の硬質化した外骨格の腕が叩きつけられた！',
      'が不気味な軋み音を立てながら巨体で圧殺してきた！'
    ]
  },

  // ==========================================
  // 5F ギミック中ボス：改造キメラ人間（鍵所持）
  // ==========================================
  KIMERA_HUMAN_5F: {
    name: '改造キメラ人間',
    image: 'assets/images/demon/5f-kimera.png',
    hp: 360,
    atk: 58,
    def: 7,
    agi: 9,
    rewardMoney: 900,
    weaknessCard: 4,
    actions: [
      'が苦痛に顔を歪めながら狂乱の腕を振り回す！',
      'の繋ぎ合わされた異形の拳が主人公を打ち据える！'
    ]
  },

  // ==========================================
  // 5F ボス連戦1：キメラ化父親（パズルなし通常戦闘）
  // ==========================================
  FATHER_5F: {
    name: 'キメラ化した父親',
    image: 'assets/images/demon/5f-father.png',
    hp: 520,
    atk: 64,
    def: 8,
    agi: 11,
    rewardMoney: 1200,
    weaknessCard: 5,
    actions: [
      'が『息子ハ…！』と叫びながら理性を失って殴りかかる！',
      'の鋭い異形の爪が主人公を容赦なく引き裂く！'
    ]
  },

  // ==========================================
  // フロアボス（パズル戦あり）[cite: 2]
  // ==========================================
  
  // 2F フロアボス：ストーカー影山[cite: 2]
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
    },
    actions: [
      'の執拗な視線が主人公の隙を突いて切り裂く！',
      'が気味の悪い笑みを浮かべて掴みかかってきた！'
    ]
  },

  // 3F フロアボス：ゴミ屋敷の狂人・真田[cite: 2]
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
      correctSolution: { 1: 8, 7: 6, 3: 1, 5: 3 },
      targetSum: 18
    },
    actions: [
      'がゴミの山から掴んだ劇物を投げつけてきた！',
      'の放つ猛烈な悪臭ガスが肺を焼く！'
    ]
  },

  // 4F フロアボス：色欲のパパ活女子・リナ[cite: 2]
  RINA_4F: {
    name: '色欲のパパ活女子・リナ',
    video: 'assets/images/demon/4f-rina.mp4',
    image: 'assets/images/demon/4f-rina.jpg',
    hp: 500,
    atk: 60,
    satk: 35,
    def: 8,
    agi: 10,
    rewardMoney: 2000,
    baseLevel: 15,
    puzzle: {
      openSlots: [1, 3, 5, 7],
      correctSolution: { 1: 2, 3: 1, 5: 5, 7: 3 },
      targetSum: 11
    },
    actions: [
      'が甘い香りの肉の蔦をムチのように叩きつけてきた！',
      'の惑わしの瞳が主人公の精神を縛り付ける！'
    ]
  },

  // 5F フロアボス：傲慢の執刀医・ドクター蛭沼[cite: 2]
  HIRUNUMA_5F: {
    name: '傲慢の執刀医・蛭沼',
    video: 'assets/images/demon/5f-hirunuma.mp4',
    image: 'assets/images/demon/5f-hirunuma.png',
    hp: 850,
    atk: 72,
    satk: 40,
    def: 10,
    agi: 13,
    rewardMoney: 3000,
    baseLevel: 20,
    puzzle: {
      openSlots: [1, 3, 5, 7],
      // ①上(頭脳)=聖書(5), ③左(心臓)=十字架(4), ⑤右(腕)=銀の杭(9), ⑦下(足元)=鏡(2)
      // 合計値: 5 + 4 + 9 + 2 = 20[cite: 2]
      correctSolution: { 1: 5, 3: 4, 5: 9, 7: 2 },
      targetSum: 20
    },
    actions: [
      'が『神を称えよ！』と狂気の手術メスを連続で突き立てる！',
      'が配合した毒劇薬のアンプルを砕いて浴びせてきた！'
    ]
  }
};

// ==========================================
// パズル解読判定関数群[cite: 2]
// ==========================================

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

export function evaluateHirunumaPuzzle(placedCards) {
  const solution = ENEMIES.HIRUNUMA_5F.puzzle.correctSolution;
  let correctCount = 0;
  let currentSum = 0;

  for (const slotId of [1, 3, 5, 7]) {
    const card = placedCards[slotId];
    if (card) {
      currentSum += card;
      if (card === solution[slotId]) correctCount++;
    }
  }

  // 4箇所正解かつ合計値がピッタリ20
  if (correctCount === 4 && currentSum === 20) {
    return { result: 'PERFECT', correctCount: 4 };
  } else if (correctCount > 0) {
    return { result: 'PARTIAL', correctCount: Math.min(correctCount, 3) };
  } else {
    return { result: 'FAIL', correctCount: 0 };
  }
}