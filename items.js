// items.js - アイテム定義データ（段階的防具解放＆救急セット＆傘対応 完全版）

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
  first_aid: {
    id: 'first_aid',
    name: '救急セット',
    type: 'consumable',
    price: 600,
    description: 'HPを 50 回復する。大ダメージ時の切り札。',
    healAmount: 50,
    battleUsable: true,
    use: (state) => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 50);
      return 'HPが50回復した！';
    }
  },
  // ★ 追加：上位回復薬1
  mystery_supplement: {
    id: 'mystery_supplement',
    name: '謎のサプリメント',
    type: 'consumable',
    price: 1000,
    description: 'HPを 100 回復する。怪しいが効果は絶大。',
    healAmount: 100,
    battleUsable: true,
    use: (state) => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 100);
      return 'HPが100回復した！';
    }
  },
  // ★ 追加：上位回復薬2
  crystal_potion: {
    id: 'crystal_potion',
    name: '青いクリスタルの瓶に入ったポーション',
    type: 'consumable',
    price: 2000,
    description: 'HPを 200 回復する。完全なる霊薬。',
    healAmount: 200,
    battleUsable: true,
    use: (state) => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 200);
      return 'HPが200回復した！';
    }
  },
  // ★ 追加：1F帰還アイテム
  return_talisman: {
    id: 'return_talisman',
    name: '悪霊の通り道',
    type: 'consumable',
    price: 300,
    description: '使用すると、瞬時に 1F エレベーター前へ帰還する。（※戦闘中は使用不可）',
    isReturnItem: true, // main.jsでフロア移動フラグとして判定
    battleUsable: false,
    use: (state) => {
      // 実際のフロア移動処理は main.js のアイテム使用処理内で拾う
      return '悪霊の通り道を使用した！ 1Fへ転移します……';
    }
  },

  // ビニール傘シリーズ（使い捨て戦闘用）
  blue_umbrella: {
    id: 'blue_umbrella',
    name: '青いビニール傘（防御）',
    type: 'consumable',
    price: 200,
    description: '素早く開き、次の敵の攻撃ダメージを 70% 軽減する。',
    battleEffect: { type: 'GUARD_70', turns: 1 },
    guardEffect: true,
    battleUsable: true
  },
  yellow_umbrella: {
    id: 'yellow_umbrella',
    name: '黄色いビニール傘（スタン）',
    type: 'consumable',
    price: 500,
    description: '相手を 2ターン 行動不能（休止）にする。',
    battleEffect: { type: 'STUN', turns: 3 },
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
    price: 2500,
    description: '次ターンの銃撃ダメージが【3倍】になる。',
    battleEffect: { type: 'BOOST_DAMAGE', multiplier: 3, turns: 1 },
    battleUsable: true
  }
};

// --- 防具データ（段階解放対応） ---
// unlockStage: 0=初期, 1=3Fクリア後, 2=5Fクリア後, 3=7Fクリア後
export const ARMOR_ITEMS = {
  // 【初期解放（Stage 0：1F〜3F用）】
  delivery_jacket: {
    id: 'delivery_jacket',
    name: '配達員のジャケット',
    type: 'armor',
    price: 300,
    def: 2,
    unlockStage: 0,
    description: '被ダメージを抑える作業着。(DEF +2)'
  },
  proof_vest: {
    id: 'proof_vest',
    name: '防刃チョッキ',
    type: 'armor',
    price: 800,
    def: 3,
    unlockStage: 0,
    description: '物理攻撃を大きく軽減する。(DEF +3)'
  },

  // 【3Fクリア後解放（Stage 1：4F〜5F用）】
  leather_jacket: {
    id: 'leather_jacket',
    name: 'お守りレザージャケット',
    type: 'armor',
    price: 2000,
    def: 4,
    unlockStage: 1,
    description: 'お札が縫い付けられた漆黒のジャケット。(DEF +4)'
  },
  tactical_vest: {
    id: 'tactical_vest',
    name: '儀式用タクティカルベスト',
    type: 'armor',
    price: 4500,
    def: 6,
    unlockStage: 1,
    description: '悪魔祓いの刻印が入った特殊防具。(DEF +6)'
  },

  // 【5Fクリア後解放（Stage 2：6F〜7F用）】
  relic_leather_suit: {
    id: 'relic_leather_suit',
    name: '聖遺物のレザースーツ',
    type: 'armor',
    price: 10000,
    def: 8,
    unlockStage: 2,
    description: '聖人の骨の粉末が練り込まれた重装備。(DEF +8)'
  },

  // 【7Fクリア後解放（Stage 3：8Fラスボス決戦用）】
  exorcist_coat: {
    id: 'exorcist_coat',
    name: 'エクソシストの漆黒コート',
    type: 'armor',
    price: 22000,
    def: 12,
    unlockStage: 3,
    description: '初代神父の遺品。悪魔の攻撃を大幅に軽減する。(DEF +12)'
  }
};

// 全アイテムの一括エクスポート
export const itemDefinitions = {
  ...CONSUMABLE_ITEMS,
  ...ARMOR_ITEMS
};

// 現在の進行度（armorUnlockStage）に応じた購入可能防具一覧を返す関数
export function getAvailableArmors(gameState) {
  const currentStage = gameState.armorUnlockStage || 0;
  return Object.values(ARMOR_ITEMS).filter(armor => armor.unlockStage <= currentStage);
}