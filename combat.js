// combat.js - 戦闘・査問・黒猫サポート制御（完全版）
import { gameState } from './gameState.js';

export class CombatSystem {
  constructor(enemy, isInquisition = false, isHuman = false) {
    this.enemy = enemy;
    this.isInquisition = isInquisition;
    this.isHuman = isHuman;
    this.turn = 1;
    this.umbrellaBuffs = { def: 0, turns: 0, stunTurns: 0, damageMultiplier: 1 };
  }

  // -------------------------------------------------------------
  // 【査問：間違えて悪魔を「保護」した場合の処理】
  // -------------------------------------------------------------
  handleProtectOption() {
    if (this.isHuman) {
      // 本物の人間を保護 ➔ お礼獲得＆1Fコンビニへ避難
      gameState.player.money += 150;
      return {
        success: true,
        message: '住民を無事に1Fコンビニへ避難させた！ お礼に 150💰 を受け取った。'
      };
    } else {
      // 悪魔を誤保護 ➔ 確定先制攻撃を受ける！
      const firstAttackDamage = Math.max(1, this.enemy.atk - gameState.player.def);
      gameState.player.hp -= firstAttackDamage;

      return {
        success: false,
        message: `「ククク…間抜けめ！」正体を現した悪魔から【確定先制攻撃】を受け、${firstAttackDamage} ダメージ！ 戦闘開始！`,
        forceEnemyFirstTurn: true
      };
    }
  }

  // -------------------------------------------------------------
  // 【査問：誤って人間を「撃つ」した場合の処理】
  // -------------------------------------------------------------
  handleShootOption() {
    if (this.isHuman) {
      // 人間を誤射 ➔ 罪ゲージ +1
      gameState.player.sin += 1;
      return {
        error: true,
        message: '無抵抗の人間を撃ち殺してしまった…！ 罪悪感が脳を苛む。（SIN +1）'
      };
    } else {
      // 悪魔を撃破
      return { error: false, message: '見事悪魔の正体を打ち抜いた！' };
    }
  }

  // -------------------------------------------------------------
  // 【黒猫（Lv15加入）の気まぐれサポート処理】
  // -------------------------------------------------------------
  checkCatAction() {
    if (!gameState.flags.hasCat) return null;

    // 毎ターン30%で割り込み
    if (Math.random() < 0.3) {
      const rand = Math.random();
      if (rand < 0.4) {
        // 爪攻撃
        const baseDmg = gameState.equippedCards.reduce((a, b) => a + b, 0);
        const catDmg = Math.round(baseDmg * (0.9 + Math.random() * 0.2));
        this.enemy.hp -= catDmg;
        return `黒猫が影から飛び出し、素早い爪攻撃！ 敵に ${catDmg} ダメージ！`;
      } else if (rand < 0.7) {
        // 鳴き声（スタン）
        this.umbrellaBuffs.stunTurns += 1;
        return '黒猫が甲高い声で鳴いた！ 悪魔が一瞬すくみ上り、1ターン行動不可！';
      } else {
        // 身代わり（防御）
        this.umbrellaBuffs.def += 5;
        return '黒猫が足元で威嚇し、主人公を身挺してかばった！（被ダメージ削減）';
      }
    }
    return null;
  }
}