// appUI.js - スマホアプリ「悪魔辞典」画面UI・正確なロゴ定義（完全版）
import { gameState } from './gameState.js';

// 画像アセットパスの正本定義
export const LOGO_ASSETS = {
  TITLE_LOGO: 'assets/images/akumanologo.png',          // ゲームタイトルロゴ
  APP_LOGO: 'assets/images/DictionariumDaemonum.webp'   // 悪魔辞典アプリ用ロゴ
};

export class AppUI {
  constructor() {
    this.appContainer = document.getElementById('app-ui-container');
  }

  // スマホ画面（悪魔辞典アプリ）の描画
  renderApp() {
    if (!this.appContainer) return;

    // 最新の装填スロット状態を更新
    gameState.updateEquippedCards();

    this.appContainer.innerHTML = `
      <div class="smartphone-screen">
        <!-- アプリヘッダー -->
        <div class="app-header">
          <img src="${LOGO_ASSETS.APP_LOGO}" alt="Dictionarium Daemonum" class="app-logo-img" />
          <span class="app-title">悪魔辞典 - Dictionarium Daemonum</span>
        </div>

        <!-- プレイヤー情報 -->
        <div class="player-status-panel">
          <p>主人公 Lv: <strong>${gameState.player.level}</strong> (総コスト上限: ${gameState.player.level})</p>
          <p>HP: ${gameState.player.hp} / ${gameState.player.maxHp}</p>
          <p>所持金: ${gameState.player.money} 💰 | 罪 (SIN): ${gameState.player.sin}</p>
        </div>

        <!-- モデルガン & ラミナ装填スロット表示 -->
        <div class="lamina-slot-panel">
          <h3>【モデルガン装填スロット】</h3>
          ${gameState.player.hasModelGun ? this.renderSlots() : '<p class="warning-text">※モデルガン未所持（素手）</p>'}
        </div>

        <!-- アプリ機能メニュー (セーブ) -->
        <div class="app-menu-buttons">
          <button id="btn-save-game" class="app-btn">データ保存 (SAVE)</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  // スロット装填状況の生成
  renderSlots() {
    if (gameState.equippedCards.length === 0) {
      return '<p>装填されているカードはありません</p>';
    }

    return `
      <ul class="slot-list">
        ${gameState.equippedCards.map((cardNum, index) => `
          <li class="slot-item">
            <span class="slot-number">スロット ${index + 1} (上限 ${10 - (index + 1)})</span>
            <img src="assets/images/cards/${cardNum}card.png" alt="${cardNum}のカード" class="card-icon" />
            <span class="card-name">【${cardNum}】のラミナ (基礎威力 +${cardNum})</span>
          </li>
        `).join('')}
      </ul>
      <p class="total-power">Vox Sacra 基礎威力: <strong>${gameState.equippedCards.reduce((a, b) => a + b, 0)}</strong></p>
    `;
  }

  bindEvents() {
    const saveBtn = document.getElementById('btn-save-game');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        gameState.saveGame();
        alert('悪魔辞典アプリに進行状況を保存しました。');
      });
    }
  }
}