// gameState.js - プレイヤーステータス・経験値・カード装填・新システム完全統合版

export const gameState = {
  player: {
    x: 7,          // X座標（1F初期位置: 7）
    y: 1,          // Y座標（1F初期位置: 1）
    dir: 0,        // 向き (0:北, 1:東, 2:南, 3:西)
    level: 1,
    exp: 0,        // 現在の経験値
    maxExp: 100,   // Lv1➔2の必要EXP (100)
    hp: 20,
    maxHp: 20,
    def: 0,        // 防具＋成長による防御力
    agi: 5,        // 素早さ（逃走率・回避率に影響）
    sin: 0,        // 罪ゲージ（人間の誤射で+30、闇の契約で+15）
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
  hasElevatorKey: false, // 2F影山撃破で獲得（3Fエレベーター開通）
  hasModelGun: false,
  hasMetGrandma: false,
  hasTalkedStudentInCVS: false,
  cards: [],

  // クリア済み部屋の記録（重複査問・無限稼ぎ防止）
  clearedRooms: {},
  bossHints: [],

  inventory: {
    items: [],
  },

  flags: {
    cleared2F: false,
    hasCat: false, // Lv15以上で自動加入
  },

  // ★ 新仕様管理データ
  lastTransitMethod: 'stair', // 'stair' (非常階段) または 'elevator' (エレベーター)
  lastLostMoney: 0,           // 直前の死亡で失った金額（闇の契約で回収用）

  // ★ コスト上限に基づくカード装填自動計算
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

  // 経験値獲得処理（必要EXPに達したらレベルアップ）
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

  // ★ レベルアップ処理（DEFアップ・黒猫フラグ・maxExp計算）
  levelUp(amount = 1) {
    this.player.level += amount;
    this.player.maxHp += 5 * amount;
    this.player.hp = this.player.maxHp; // 自動全回復
    this.player.agi += 1 * amount;

    // レベルに応じた必要経験値（maxExp）の増加計算
    this.player.maxExp = Math.floor(100 + (this.player.level - 1) * 60 + Math.pow(this.player.level, 1.3) * 10);

    if (this.player.level % 2 === 0) {
      this.player.def += 1;
    }

    if (this.player.level >= 15) {
      this.flags.hasCat = true;
    }

    this.updateEquippedCards();
  },

  // ★ 死亡時ペナルティ処理（0%〜50%ランダム減額 ＆ 復帰テキスト生成）
  handlePlayerDeath() {
    const lostRate = Math.random() * 0.5; // 0.0 〜 0.5 (0%〜50%)
    const lostMoney = Math.floor(this.player.money * lostRate);
    
    this.player.money -= lostMoney;
    this.lastLostMoney = lostMoney;
    this.player.hp = this.player.maxHp; // 体力全回復

    let respawnMsg = "";
    let respawnCoord = { x: 7, y: 1 }; // デフォルト位置（非常階段前）

    if (this.lastTransitMethod === 'elevator') {
      respawnMsg = `【意識が浮上する……】\n「チーン……」という電子音でハッと目を覚ました。\n悪魔に弾き飛ばされ、自動で1階のエレベーター前まで送り返されたようだ……。`;
      respawnCoord = { x: 11, y: 1 }; // 1Fエレベーター前
    } else {
      respawnMsg = `【意識が浮上する……】\n重い衝撃とともに目を覚ました……。\n意識を失う寸前、必死で1階の非常階段前まで転がり落ちてきたようだ。`;
      respawnCoord = { x: 7, y: 1 }; // 1F非常階段前
    }

    if (lostMoney > 0) {
      respawnMsg += `\n\n（ポケットから 💰${lostMoney} を失った……！）\n※スマホの「悪魔辞典アプリ」から【闇の契約】で取り戻せます。`;
    } else {
      respawnMsg += `\n\n（奇跡的に所持金は失わずに済んだ！）`;
    }

    // 1階へ復帰
    this.currentFloor = 1;
    this.player.x = respawnCoord.x;
    this.player.y = respawnCoord.y;

    return respawnMsg;
  },

  // ★ 闇の契約（Sin +15 と引き換えに失った所持金を100%全額回収）
  contractRecovery() {
    if (this.lastLostMoney <= 0) return { success: false, msg: "回収できるお金はありません。" };
    
    const recovered = this.lastLostMoney;
    this.player.money += recovered;
    this.player.sin += 15; // 罪を15加算
    this.lastLostMoney = 0; // 回収完了

    return { 
      success: true, 
      msg: `【闇の契約成立】\nSin（罪）が 15 増加した……。\n引き換えに失った 💰${recovered} を全額回収した！` 
    };
  },

  // ★ Sin浄化の累進利息計算（基本単価15、倍率1.5）
  getPurifyCost() {
    const sin = this.player.sin;
    if (sin <= 0) return 0;
    return Math.floor(sin * (15 + sin * 1.5));
  },

  // ★ Sin浄化（コンビニで罪を消去）
  purifySin() {
    const cost = this.getPurifyCost();
    if (this.player.money < cost) return false;
    
    this.player.money -= cost;
    this.player.sin = 0;
    return true;
  },

  // ★ 初期化リセット
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

  // ★ セーブ処理（エラーハンドリング付き）
  saveGame() {
    try {
      localStorage.setItem('mansion_inferno_save', JSON.stringify(this));
      return true;
    } catch (e) {
      return false;
    }
  },

  // ★ ロード処理（エラーハンドリング付き）
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