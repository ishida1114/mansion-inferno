// gameState.js - appUI連動スロット枠整合・悪魔手記永続化・経験値バランス適正化 完全版

export const gameState = {
  player: {
    x: 7,
    y: 1,
    dir: 0,
    level: 1,
    exp: 0,
    maxExp: 115,
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
  hasSeen5FIntro: false,
  isHirunumaDefeated: false,
  cards: [],

  clearedRooms: {},
  bossHints: [], // ★ 悪魔手記に記録される討伐ヒント配列
  justReachedLv15: false, // ★ Lv.15到達演出をUI側で検知するための通知フラグ

  inventory: {
    items: [],
  },

  flags: {
    cleared2F: false,
    cleared3F: false,
    cleared4F: false,
    cleared5F: false,
    cleared6F: false,
    cleared7F: false,
    cleared8F: false,
    postedArmorLetter: false, // ★ 1Fポスト投函フラグ（防具解放キー）
    unlockedAdvancedArmor: false,
    hasCat: false,
    isCatTrapped: false,
    seenLv15CatHint: false,   // ★ Lv.15予兆メッセージ表示済みフラグ
    hasSanadaRoomKey: false,
    hasSanadaHint2: false,
    seen3FIntro: false,
    seen7FIntro: false,
    seenInqTutorial: false,
    hasBrandBag: false,
    hasChampagne: false,
    defeatedShineiA: false,
    defeatedShineiB: false,
  },

  lastTransitMethod: 'stair',
  lastLostMoney: 0,

  visitedMaps: {},

  // ★ 防具解放ステージ（3Fクリアでは自動解放せず、1Fポスト投函[postedArmorLetter]で初めてStage 1に昇格）
  _armorUnlockStage: 0,
  get armorUnlockStage() {
    if (this.flags) {
      if (this.flags.cleared7F) return 3;
      if (this.flags.cleared5F) return 2;
      if (this.flags.postedArmorLetter) return 1; // ポスト投函が必須
    }
    return this._armorUnlockStage || 0;
  },
  set armorUnlockStage(val) {
    this._armorUnlockStage = val;
  },

  getFloorLevelCap(floor = this.currentFloor) {
    if (floor <= 1) return 999;
    return (floor - 1) * 5;
  },

  // ★ 報酬キャップ判定：適正レベル（Lv.15等）では減衰させず、それを超過（>）した時のみ減衰
  calculateRewards(baseExp, baseMoney, floor = this.currentFloor) {
    const capLevel = this.getFloorLevelCap(floor);
    if (this.player.level > capLevel) {
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

  // ★ appUI.js と整合：Lv.5で2枠、Lv.15で3枠に統一 ＆ 文字列/数値の両対応
  updateEquippedCards() {
    if (!this.player.hasModelGun && !this.hasModelGun) {
      this.equippedCards = [];
      return;
    }

    let slots = 1;
    if (this.player.level >= 15) slots = 3;
    else if (this.player.level >= 5) slots = 2;

    if (this.equippedCards && this.equippedCards.length > 0) {
      this.equippedCards = this.equippedCards
        .map(c => typeof c === 'number' ? c : parseInt(String(c).match(/\d+/)?.[0] || '0', 10))
        .filter(c => c > 0 && c <= this.player.level)
        .slice(0, slots);
    } else {
      const cardSource = (this.cards && this.cards.length > 0) ? this.cards : this.ownedCards;
      const availableNums = cardSource.map(cardItem => {
        if (typeof cardItem === 'number') return cardItem;
        const match = String(cardItem).match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      }).filter(n => n > 0 && n <= this.player.level);

      availableNums.sort((a, b) => b - a);
      this.equippedCards = availableNums.slice(0, slots);
    }
  },

  // ★ 経験値獲得：ザコ敵は平均7体でLvUP、ボス報酬（200EXP以上）は縮小せず満額付与
  gainExp(amount) {
    let scaledExp = amount;
    const isBossReward = amount >= 200;

    if (isBossReward) {
      scaledExp = Math.max(amount, Math.floor(this.player.maxExp * 0.35));
    } else {
      const maxGain = Math.floor(this.player.maxExp * 0.18);
      const minGain = Math.max(1, Math.floor(this.player.maxExp * 0.11));

      if (amount > maxGain) {
        scaledExp = Math.floor(this.player.maxExp * 0.14);
      } else if (amount < minGain && amount > 0) {
        scaledExp = Math.floor(this.player.maxExp * 0.12);
      }
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
    const prevLevel = this.player.level;
    this.player.level += amount;
    this.player.maxHp += 5 * amount;
    this.player.hp = this.player.maxHp;
    this.player.agi += 1 * amount;

    // 必要経験値カーブ
    this.player.maxExp = Math.floor(100 + (this.player.level - 1) * 80 + Math.pow(this.player.level, 1.5) * 15);

    if (this.player.level % 2 === 0) {
      this.player.def += 1;
    }

    // ★ Lv.15 初回到達時：使い魔の覚醒予兆フラグをセット（黒猫の実体化は5Fストーリーイベントまで保留）
    if (this.player.level >= 15 && prevLevel < 15) {
      if (!this.flags) this.flags = {};
      if (!this.flags.seenLv15CatHint) {
        this.flags.seenLv15CatHint = true;
        this.justReachedLv15 = true;
      }
    }

    this.updateEquippedCards();
  },

  // ★ 使い魔の予兆演出用メッセージ取得ヘルパー
  getLv15CatHintText() {
    return "【使い魔の気配】\nLv.15に到達したことで、自身の影の中から確かな霊力の脈動を感じる……！\nしかし、まだ実体化には至らない。\n完全な実体化を果たすには、もっと濃厚な『生体エネルギー』が必要なようだ……。";
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
    this.player.maxExp = 115;
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
    this.hasSeen5FIntro = false;
    this.isHirunumaDefeated = false;
    this.equippedArmor = null;
    this._armorUnlockStage = 0;
    this.cards = [];
    this.equippedCards = [];
    this.clearedRooms = {};
    this.bossHints = [];
    this.justReachedLv15 = false;
    this.inventory = { items: [] };
    this.visitedMaps = {};
    
    this.flags = {
      cleared2F: false,
      cleared3F: false,
      cleared4F: false,
      cleared5F: false,
      cleared6F: false,
      cleared7F: false,
      cleared8F: false,
      postedArmorLetter: false,
      unlockedAdvancedArmor: false,
      hasCat: false,
      isCatTrapped: false,
      seenLv15CatHint: false,
      hasSanadaRoomKey: false,
      hasSanadaHint2: false,
      seen3FIntro: false,
      seen7FIntro: false,
      seenInqTutorial: false,
      hasBrandBag: false,
      hasChampagne: false,
      defeatedShineiA: false,
      defeatedShineiB: false,
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
        if (!this.bossHints) this.bossHints = [];
        if (!this.flags) this.flags = {};
        if (!this.inventory) this.inventory = { items: [] };
        if (!this.inventory.items) this.inventory.items = [];
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};