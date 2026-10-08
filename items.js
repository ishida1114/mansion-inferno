// items.js - アイテム定義データ（全機能保持＆後半防具④〜⑥追加版）

// --- 消費アイテム（コンビニ購入） ---
export const CONSUMABLE_ITEMS = {
  energy_drink: {
    id: 'energy_drink',
    name: 'エナジードリンク',
    type: 'consumable',
    price: 100,
    description: 'HPを 15 回復する。戦闘中も使用可能。',
    healAmount: 15,
    battleUsable: true,
    use: (state) => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
      return 'HPが15回復した！';
    }
  },
  bento: {
    id: 'bento',
    name: 'コンビニ弁当',
    type: 'consumable',
    price: 250,
    description: 'HPを 25 回復する。',
    healAmount: 25,
    battleUsable: true,
    use: (state) => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 25);
      return 'HPが25回復した！';
    }
  },

  // ビニール傘シリーズ（使い捨て戦闘用）
  blue_umbrella: {
    id: 'blue_umbrella',
    name: '青いビニール傘（防御）',
    type: 'consumable',
    price: 200,
    description: '3ターンの間、主人公の DEF を +2 する。',
    battleEffect: { type: 'BUFF_DEF', value: 2, turns: 3 },
    guardEffect: true,
    battleUsable: true
  },
  yellow_umbrella: {
    id: 'yellow_umbrella',
    name: '黄色いビニール傘（スタン）',
    type: 'consumable',
    price: 500,
    description: '相手を 2ターン 行動不能（休止）にする。',
    battleEffect: { type: 'STUN', turns: 2 },
    battleUsable: true
  },
  clear_umbrella: {
    id: 'clear_umbrella',
    name: '透明なビニール傘（回避/逃走）',
    type: 'consumable',
    price: 150,
    description: '3ターンの間 AGI +5（または確実に逃走）。',
    battleEffect: { type: 'ESCAPE_OR_AGI', value: 5, turns: 3 },
    battleUsable: true
  },
  red_umbrella: {
    id: 'red_umbrella',
    name: '赤いビニール傘（反撃）',
    type: 'consumable',
    price: 300,
    description: '次ターンの Vox Sacra（銃撃）ダメージが 2倍 になる。',
    battleEffect: { type: 'BOOST_DAMAGE', multiplier: 2, turns: 1 },
    battleUsable: true
  }
};

// --- 防具（ショップ専用） ---
export const ARMOR_ITEMS = {
  // 【初期ラインナップ ①〜③】
  delivery_jacket: {
    id: 'delivery_jacket',
    name: '配達員のジャケット',
    type: 'armor',
    price: 300,
    def: 2,
    description: '被ダメージを抑える作業着。(DEF +2)'
  },
  proof_vest: {
    id: 'proof_vest',
    name: '防刃チョッキ',
    type: 'armor',
    price: 800,
    def: 3,
    description: '物理攻撃を大きく軽減する。(DEF +3)'
  },
  leather_jacket: {
    id: 'leather_jacket',
    name: 'お守りレザージャケット',
    type: 'armor',
    price: 2000,
    def: 4,
    description: 'お札が縫い付けられた漆黒のジャケット。(DEF +4)'
  },

  // 【追加ラインナップ ④〜⑥】（7Fボス撃破後のポスト投函イベントで追加）
  tactical_vest: {
    id: 'tactical_vest',
    name: '儀式用タクティカルベスト',
    type: 'armor',
    price: 4500,
    def: 6,
    description: '悪魔祓いの刻印が入った特殊防具。(DEF +6)',
    requiresAdvanced: true
  },
  relic_leather_suit: {
    id: 'relic_leather_suit',
    name: '聖遺物のレザースーツ',
    type: 'armor',
    price: 10000,
    def: 8,
    description: '聖人の骨の粉末が練り込まれた重装備。(DEF +8)',
    requiresAdvanced: true
  },
  exorcist_coat: {
    id: 'exorcist_coat',
    name: 'エクソシストの漆黒コート',
    type: 'armor',
    price: 22000,
    def: 10,
    description: '初代神父の遺品。悪魔の攻撃を大幅に軽減する。(DEF +10)',
    requiresAdvanced: true
  }
};

// 重複のない一括エクスポート
export const itemDefinitions = {
  ...CONSUMABLE_ITEMS,
  ...ARMOR_ITEMS
};