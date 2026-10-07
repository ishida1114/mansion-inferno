// gameState.js - プレイヤーステータス・カード装填・レベル成長一元管理
export const gameState = {
  player: {
    x: 7,
    y: 1,
    dir: 0,
    level: 1,
    hp: 20,
    maxHp: 20,
    def: 0,        // 防具＋成長による防御力
    agi: 5,        // 素早さ（回避率）
    sin: 0,        // 罪ゲージ
    money: 0,      // 所持金
    hasModelGun: false // 初期状態は必ずfalse
  },

  currentFloor: 1,
  currentMap: null,
  equippedArmor: null,

  ownedCards: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  equippedCards: [], // 装填カード

  hasExorcistInherited: false,
  hasKey2F: false,
  hasModelGun: false,
  hasMetGrandma: false,
  hasTalkedStudentInCVS: false,

  cards: [],
  clearedRooms: {},

  inventory: {
    items: []
  },

  flags: {
    cleared2F: false,
    hasCat: false
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

  levelUp(amount = 1) {
    this.player.level += amount;
    this.player.maxHp += 5 * amount;
    this.player.hp = this.player.maxHp;
    this.player.agi += 1 * amount;

    if (this.player.level % 2 === 0) {
      this.player.def += 1;
    }

    if (this.player.level >= 15) {
      this.flags.hasCat = true;
    }

    this.updateEquippedCards();
  },

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