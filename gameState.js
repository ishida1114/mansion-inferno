// gameState.js - 経験値バランス調整（敵5〜10体で1レベルアップ）完全版

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
    cleared7F: false,
    postedArmorLetter: false,
    unlockedAdvancedArmor: false,
    hasCat: false,
  },

  lastTransitMethod: 'stair',
  lastLostMoney: 0,

  visitedMaps: {},

  getFloorLevelCap(floor = this.currentFloor) {
    if (floor <= 1) return 999;
    return (floor - 1) * 5;
  },

  // 報酬キャップ（お金の減衰を50%に緩和）
  calculateRewards(baseExp, baseMoney, floor = this.currentFloor) {
    const capLevel = this.getFloorLevelCap(floor);
    if (this.player.level >= capLevel) {
      const cappedExp = Math.max(1, Math.floor(baseExp * 0.1));
      const cappedMoney = Math.max(1, Math.floor(baseMoney * 0.5));
      return { exp: cappedExp, money: cappedMoney, isCapped: true };
    }
    return { exp: baseExp, money: baseMoney, isCapped: false };
  },

  markVisited(floor, mapData, px, py) {
    if (!this.visitedMaps[floor]) {
      this.visitedMaps[floor] = Array(mapData.length).fill(0).map(() => Array(mapData[0].length).fill(false));
    }
    const visited = this.visitedMaps[floor];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = px + dx;
        const ny = py + dy;
        if (ny >= 0 && ny < mapData.length && nx >= 0 && nx < mapData[0].length) {
          visited[ny][nx] = true;
        }
      }
    }
  },

  isVisited(floor, x, y) {
    if (!this.visitedMaps || !this.visitedMaps[floor]) return false;
    if (y < 0 || y >= this.visitedMaps[floor].length || x < 0 || x >= this.visitedMaps[floor][0].length) return false;
    return this.visitedMaps[floor][y][x];
  },

  updateEquippedCards() {
    if (!this.player.hasModelGun && !this.hasModelGun) {
      this.equippedCards = [];
      return;
    }

    let slots = 1;
    if (this.player.level >= 20) slots = 3;
    else if (this.player.level >= 10) slots = 2;

    const availableNums = this.cards.map(cardStr => {
      const num = parseInt(cardStr.replace("Card.png", ""), 10);
      return isNaN(num) ? 0 : num;
    }).filter(n => n > 0);

    availableNums.sort((a, b) => b - a);
    this.equippedCards = availableNums.slice(0, slots);
  },

  // ★ 敵5〜10体（平均約7体）で1レベル上がるように適正スケーリング
  gainExp(amount) {
    const maxGain = Math.floor(this.player.maxExp * 0.18); // 最速でも約5.5体
    const minGain = Math.max(1, Math.floor(this.player.maxExp * 0.11)); // 最低でも約9体

    let scaledExp = amount;
    if (amount > maxGain) {
      scaledExp = Math.floor(this.player.maxExp * 0.14); // 敵1体で約14%（約7体で1Lvアップ）
    } else if (amount < minGain && amount > 0) {
      scaledExp = Math.floor(this.player.maxExp * 0.12); // 約8体で1Lvアップ
    }

    this.player.exp += scaledExp;
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

    // 必要経験値カーブの適正化
    this.player.maxExp = Math.floor(100 + (this.player.level - 1) * 80 + Math.pow(this.player.level, 1.5) * 15);

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
      respawnCoord = { x: 6, y: 1 };
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
    this.visitedMaps = {};
    
    this.flags = {
      cleared2F: false,
      cleared7F: false,
      postedArmorLetter: false,
      unlockedAdvancedArmor: false,
      hasCat: false,
    };

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
        if (!this.visitedMaps) this.visitedMaps = {};
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};