// items.js - 回復アイテム・ビニール傘4種・防具データ（完全版）

// --- 消費アイテム（コンビニ購入） ---
export const CONSUMABLE_ITEMS = {
  // 回復系
  ENERGY_DRINK: {
    id: 'energy_drink',
    name: 'エナジードリンク',
    price: 100,
    description: 'HPを 10 回復する。',
    use: (state) => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 10);
      return 'HPが10回復した！';
    }
  },
  BENTO: {
    id: 'bento',
    name: 'コンビニ弁当',
    price: 250,
    description: 'HPを 25 回復する。',
    use: (state) => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 25);
      return 'HPが25回復した！';
    }
  },

  // ビニール傘シリーズ（使い捨て戦闘用）
  BLUE_UMBRELLA: {
    id: 'blue_umbrella',
    name: '青いビニール傘（防御）',
    price: 200,
    description: '3ターンの間、主人公の DEF を +2 する。',
    battleEffect: { type: 'BUFF_DEF', value: 2, turns: 3 }
  },
  YELLOW_UMBRELLA: {
    id: 'yellow_umbrella',
    name: '黄色いビニール傘（スタン）',
    price: 500,
    description: '相手を 2ターン 行動不能（休止）にする。',
    battleEffect: { type: 'STUN', turns: 2 }
  },
  CLEAR_UMBRELLA: {
    id: 'clear_umbrella',
    name: '透明なビニール傘（回避/逃走）',
    price: 150,
    description: '3ターンの間 AGI +5（または確実に逃走）。',
    battleEffect: { type: 'ESCAPE_OR_AGI', value: 5, turns: 3 }
  },
  RED_UMBRELLA: {
    id: 'red_umbrella',
    name: '赤いビニール傘（反撃）',
    price: 300,
    description: '次ターンの Vox Sacra（銃撃）ダメージが 2倍 になる。',
    battleEffect: { type: 'BOOST_DAMAGE', multiplier: 2, turns: 1 }
  }
};

// --- 防具（ショップ専用） ---
export const ARMOR_ITEMS = {
  DELIVERY_JACKET: {
    id: 'delivery_jacket',
    name: '配達員のジャケット',
    price: 300,
    def: 1,
    description: '1F全滅1回分で購入可能。被ダメージを抑える作業着。'
  },
  PROOF_VEST: {
    id: 'proof_vest',
    name: '防刃チョッキ',
    price: 800,
    def: 2,
    description: '2F稼ぎ1.5周分。物理攻撃を大きく軽減する。'
  },
  LEATHER_JACKET: {
    id: 'leather_jacket',
    name: 'お守りレザージャケット',
    price: 2000,
    def: 4,
    description: 'お札が縫い付けられた漆黒のジャケット。'
  }
};