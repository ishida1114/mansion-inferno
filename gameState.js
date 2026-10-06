// gameState.js - プレイヤー状態・セーブ・ラミナ装備コスト計算（完全版）

export const gameState = {
  // プレイヤー基本ステータス
  player: {
    level: 1,
    hp: 20,
    maxHp: 20,
    def: 0,        // 装備防具＋自動上昇DEFの合計
    agi: 5,        // 素早さ
    sin: 0,        // 罪ゲージ（人間の誤射で+1）
    money: 0,      // 所持金（💰）
    hasModelGun: false, // 2Fで教え子から入手するまでfalse
  },

  // 現在装備している防具
  equippedArmor: null,

  // 所持ラミナカード（1〜9）
  ownedCards: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  // 現在銃に装填されているカードのリスト
  equippedCards: [],

  // 所持アイテム
  inventory: {
    items: [],
  },

  // 進行フラグ
  flags: {
    cleared2F: false,
    hasCat: false, // Lv15以上で自動加入
  },

  // -------------------------------------------------------------
  // 【スロット・コスト計算ロジック】
  // 主人公Lv ＝ 総コスト上限
  // 1スロット目上限9, 2スロット目上限8, 3スロット目上限7...
  // -------------------------------------------------------------
  updateEquippedCards() {
    if (!this.player.hasModelGun) {
      this.equippedCards = [];
      return;
    }

    let remainingCost = this.player.level;
    const newEquipped = [];
    const slotCapacities = [9, 8, 7, 6, 5, 4, 3, 2, 1]; // スロットごとの数字上限

    for (let i = 0; i < slotCapacities.length; i++) {
      if (remainingCost <= 0) break;

      const capacity = slotCapacities[i];
      // 残りコストとスロット上限の小さい方を装填
      const cardToEquip = Math.min(remainingCost, capacity);

      if (cardToEquip >= 1) {
        newEquipped.push(cardToEquip);
        remainingCost -= cardToEquip;
      }
    }

    this.equippedCards = newEquipped;
  },

  // レベルアップ処理（自動上昇）
  levelUp(amount = 1) {
    this.player.level += amount;
    this.player.maxHp += 5 * amount;
    this.player.hp = this.player.maxHp; // 自動全回復
    this.player.agi += 1 * amount;

    // 2レベルごとにDEF+1
    if (this.player.level % 2 === 0) {
      this.player.def += 1;
    }

    // Lv15以上で黒猫加入
    if (this.player.level >= 15) {
      this.flags.hasCat = true;
    }

    // 装填スロット再計算
    this.updateEquippedCards();
  },

  // セーブ処理（悪魔辞典アプリ機能）
  saveGame() {
    localStorage.setItem('mansion_inferno_save', JSON.stringify(this));
  },

  // ロード処理
  loadGame() {
    const data = localStorage.getItem('mansion_inferno_save');
    if (data) {
      Object.assign(this, JSON.parse(data));
      return true;
    }
    return false;
  }
};