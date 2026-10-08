// gameState.js - ステータス・Sin浄化コスト改定版

export const gameState = {
  player: {
    x: 7,
    y: 1,
    dir: 0,
    level: 1,
    exp: 0,
    maxExp: 100,
    hp: 20,
    maxHp: 20,
    def: 0,
    agi: 5,
    sin: 0,
    money: 0,
    hasModelGun: false,
  },

  currentFloor: 1,
  currentMap: null,
  equippedArmor: null,

  ownedCards: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  equippedCards: [],

  hasExorcistInherited: false,
  hasKey2F: false,
  hasElevatorKey: false,
  hasModelGun: false,
  hasMetGrandma: false,
  hasTalkedStudentInCVS: false,
  cards: [],

  clearedRooms: {},
  bossHints: [],

  inventory: {
    items: [],
  },

  flags: {
    cleared2F: false,
    hasCat: false,
  },

  lastTransitMethod: 'stair',
  lastLostMoney: 0,

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

  gainExp(amount) {
    this.player.exp += amount;
    let leveledUp = false;
    while (this.player.exp >= this.player.maxExp) {
      this.player.exp -= this.player.maxExp;
      this.levelUp(1);
      leveledUp = true;
    }
    return leveledUp;
  },

  levelUp(amount = 1) {
    this.player.level += amount;
    this.player.maxHp += 5 * amount;
    this.player.hp = this.player.maxHp;
    this.player.agi += 1 * amount;

    this.player.maxExp = Math.floor(100 + (this.player.level - 1) * 60 + Math.pow(this.player.level, 1.3) * 10);

    if (this.player.level % 2 === 0) {
      this.player.def += 1;
    }

    if (this.player.level >= 15) {
      this.flags.hasCat = true;
    }

    this.updateEquippedCards();
  },

  handlePlayerDeath() {
    const lostRate = Math.random() * 0.5;
    const lostMoney = Math.floor(this.player.money * lostRate);
    
    this.player.money -= lostMoney;
    this.lastLostMoney = lostMoney;
    this.player.hp = this.player.maxHp;

    let respawnMsg = "";
    let respawnCoord = { x: 7, y: 1 };

    if (this.lastTransitMethod === 'elevator') {
      respawnMsg = `【意識が浮上する……】\n「チーン……」という電子音でハッと目を覚ました。\n悪魔に弾き飛ばされ、自動で1階のエレベーター前まで送り返されたようだ……。`;
      respawnCoord = { x: 6, y: 6 }; // エントランス横エレベーター前
    } else {
      respawnMsg = `【意識が浮上する……】\n重い衝撃とともに目を覚ました……。\n意識を失う寸前、必死で1階の非常階段前まで転がり落ちてきたようだ。`;
      respawnCoord = { x: 7, y: 1 };
    }

    if (lostMoney > 0) {
      respawnMsg += `\n\n（ポケットから 💰${lostMoney} を失った……！）\n※スマホの「悪魔辞典アプリ」から【闇の契約】で取り戻せます。`;
    } else {
      respawnMsg += `\n\n（奇跡的に所持金は失わずに済んだ！）`;
    }

    this.currentFloor = 1;
    this.player.x = respawnCoord.x;
    this.player.y = respawnCoord.y;

    return respawnMsg;
  },

  contractRecovery() {
    if (this.lastLostMoney <= 0) return { success: false, msg: "回収できるお金はありません。" };
    
    const recovered = this.lastLostMoney;
    this.player.money += recovered;
    this.player.sin += 15;
    this.lastLostMoney = 0;

    return { 
      success: true, 
      msg: `【闇の契約成立】\nSin（罪）が 15 増加した……。\n引き換えに失った 💰${recovered} を全額回収した！` 
    };
  },

  // ★ 改定コスト計算: 1 Sin ＝ 2 💰（Sin 15 ＝ 💰30）
  getPurifyCost() {
    const sin = this.player.sin;
    if (sin <= 0) return 0;
    return sin * 2;
  },

  purifySin() {
    const cost = this.getPurifyCost();
    if (this.player.money < cost) return false;
    
    this.player.money -= cost;
    this.player.sin = 0;
    return true;
  },

  resetGame() {
    this.currentFloor = 1;
    this.player.x = 7;
    this.player.y = 1;
    this.player.dir = 0;
    this.player.level = 1;
    this.player.exp = 0;
    this.player.maxExp = 100;
    this.player.hp = 20;
    this.player.maxHp = 20;
    this.player.def = 0;
    this.player.agi = 5;
    this.player.sin = 0;
    this.player.money = 0;
    this.player.hasModelGun = false;

    this.hasExorcistInherited = false;
    this.hasKey2F = false;
    this.hasElevatorKey = false;
    this.hasModelGun = false;
    this.hasMetGrandma = false;
    this.hasTalkedStudentInCVS = false;
    this.equippedArmor = null;
    this.cards = [];
    this.equippedCards = [];
    this.clearedRooms = {};
    this.bossHints = [];
    this.inventory.items = [];
    this.flags.cleared2F = false;
    this.flags.hasCat = false;
    this.lastTransitMethod = 'stair';
    this.lastLostMoney = 0;
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