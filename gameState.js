// gameState.js - プレイヤー状態・位置座標・3Dマップ・セーブ・ラミナ装填コスト計算（完全版）

export const gameState = {
  // プレイヤー基本ステータスおよび3Dダンジョン位置座標
  player: {
    x: 7,          // X座標（1F初期位置: 7）
    y: 1,          // Y座標（1F初期位置: 1）
    dir: 0,        // 向き (0:北, 1:東, 2:南, 3:西)
    level: 1,
    hp: 20,
    maxHp: 20,
    def: 0,        // 装備防具＋自動上昇DEFの合計
    agi: 5,        // 素早さ（逃走率・回避率に影響）
    sin: 0,        // 罪ゲージ（人間の誤射で+30）
    money: 0,      // 所持金（💰）
    hasModelGun: false, // 2Fで教え子から入手するまでfalse
  },

  currentFloor: 1,
  currentMap: null,
  equippedArmor: null,

  ownedCards: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  equippedCards: [], // 現在銃に装填されているカードのリスト

  hasExorcistInherited: false,
  hasKey2F: false,
  hasModelGun: false,
  hasMetGrandma: false,
  hasTalkedStudentInCVS: false,
  cards: [],

  // クリア済み部屋の記録（重複査問・無限稼ぎ防止）
  clearedRooms: {},

  inventory: {
    items: [],
  },

  flags: {
    cleared2F: false,
    hasCat: false, // Lv15以上で自動加入
  },

  // コスト上限に基づくカード装填自動計算
  updateEquippedCards() {
    if (!this.player.hasModelGun && !this.hasModelGun) {
      this.equippedCards = [];
      return;
    }

    let remainingCost = this.player.level;
    const newEquipped = [];
    const slotCapacities = [9, 8, 7, 6, 5, 4, 3, 2, 1];

    for (let i = 0; i < slotCapacities.length; i++) {
      if (remainingCost <= 0) break;
      const capacity = slotCapacities[i];
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

    if (this.player.level % 2 === 0) {
      this.player.def += 1;
    }

    if (this.player.level >= 15) {
      this.flags.hasCat = true;
    }

    this.updateEquippedCards();
  },

  // ゲーム状態リセット
  resetGame() {
    this.currentFloor = 1;
    this.player.x = 7;
    this.player.y = 1;
    this.player.dir = 0;
    this.player.level = 1;
    this.player.hp = 20;
    this.player.maxHp = 20;
    this.player.def = 0;
    this.player.agi = 5;
    this.player.sin = 0;
    this.player.money = 0;
    this.player.hasModelGun = false;

    this.hasExorcistInherited = false;
    this.hasKey2F = false;
    this.hasModelGun = false;
    this.hasMetGrandma = false;
    this.hasTalkedStudentInCVS = false;
    this.equippedArmor = null;
    this.cards = [];
    this.equippedCards = [];
    this.clearedRooms = {};
    this.inventory.items = [];
    this.flags.cleared2F = false;
    this.flags.hasCat = false;
  },

  saveGame() {
    try {
      localStorage.setItem('mansion_inferno_save', JSON.stringify(this));
      return true;
    } catch (e) {
      return false;
    }
  },

  loadGame() {
    try {
      const data = localStorage.getItem('mansion_inferno_save');
      if (data) {
        Object.assign(this, JSON.parse(data));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};