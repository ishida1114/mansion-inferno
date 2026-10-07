// appUI.js - スマホアプリ「悪魔辞典」UI（仕様書_5準拠 完全版）
import { gameState } from './gameState.js';
import { CONSUMABLE_ITEMS, ARMOR_ITEMS } from './items.js';

export const LOGO_ASSETS = {
  TITLE_LOGO: 'assets/images/akumanologo.png',
  APP_LOGO: 'assets/images/DictionariumDaemonum.webp'
};

export class AppUI {
  constructor() {
    this.currentSubView = 'home'; // 'home' | 'loadout' | 'inventory' | 'notes' | 'familiar' | 'map' | 'log' | 'system'
  }

  // スマホUI全体の描画
  renderApp() {
    const appContainer = document.getElementById('app-ui-container');
    if (!appContainer) return;

    gameState.updateEquippedCards();

    // 使い魔（黒猫）の解放パーセンテージ計算
    const familiarPercent = gameState.flags.hasCat ? 100 : Math.min(100, Math.floor((gameState.player.level / 15) * 100));

    appContainer.innerHTML = `
      <div class="smartphone">
        <!-- 仕様書_5準拠 上部ステータスバー -->
        <div class="app-header">
          <span>[Lv.${gameState.player.level}]</span>
          <span>HP: ${gameState.player.hp}/${gameState.player.maxHp}</span>
          <span>SIN: ${gameState.player.sin}</span>
          <span>FAMILIAR: ${familiarPercent}%</span>
        </div>

        <!-- メインコンテンツ表示域 -->
        <div class="app-content">
          ${this.renderSubViewContent()}
        </div>

        <!-- フッター ホームボタン -->
        <div class="app-footer">
          <div class="app-home-btn" id="app-home-btn" title="ホームへ戻る"></div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  // サブ画面コンテンツ分岐
  renderSubViewContent() {
    switch (this.currentSubView) {
      case 'loadout':
        return this.renderLoadoutView();
      case 'inventory':
        return this.renderInventoryView();
      case 'notes':
        return this.renderNotesView();
      case 'familiar':
        return this.renderFamiliarView();
      case 'map':
        return this.renderFullMapView();
      case 'log':
        return this.renderLogView();
      case 'system':
        return this.renderSystemView();
      case 'home':
      default:
        return this.renderHomeGridView();
    }
  }

  // 1. ホームグリッド（2列・7アイコン）
  renderHomeGridView() {
    return `
      <div style="text-align: center; margin-bottom: 15px;">
        <img src="${LOGO_ASSETS.APP_LOGO}" alt="App Logo" style="width: 48px; height: 48px; object-fit: contain;" />
        <h2 style="font-size: 1.1em; color: #ff3333; margin-top: 5px;">悪魔辞典 - Dictionarium Daemonum</h2>
      </div>

      <div class="app-grid">
        <div class="app-icon" data-view="loadout">
          <div class="app-icon-emoji">🔫</div>
          <div class="app-icon-title">ラミナ装填</div>
        </div>
        <div class="app-icon" data-view="notes">
          <div class="app-icon-emoji">📜</div>
          <div class="app-icon-title">悪魔手記</div>
        </div>
        <div class="app-icon" data-view="inventory">
          <div class="app-icon-emoji">🎒</div>
          <div class="app-icon-title">所持品</div>
        </div>
        <div class="app-icon" data-view="familiar">
          <div class="app-icon-emoji">👁️</div>
          <div class="app-icon-title">使い魔</div>
        </div>
        <div class="app-icon" data-view="map">
          <div class="app-icon-emoji">🗺️</div>
          <div class="app-icon-title">詳細地図</div>
        </div>
        <div class="app-icon" data-view="log">
          <div class="app-icon-emoji">📝</div>
          <div class="app-icon-title">調査ログ</div>
        </div>
        <div class="app-icon" data-view="system" style="grid-column: span 2;">
          <div class="app-icon-emoji">💾</div>
          <div class="app-icon-title">システム (セーブ/ロード)</div>
        </div>
      </div>
    `;
  }

  // 2. 🔫 ラミナ装填画面（モデルガン用コスト装填）
  renderLoadoutView() {
    const totalPower = gameState.equippedCards.reduce((a, b) => a + b, 0);

    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">ラミナ装填</h3>
      </div>
      
      <p style="font-size: 0.8em; color: #aaa; margin-bottom: 10px;">
        主人公Lv <strong>${gameState.player.level}</strong> (総コスト上限: ${gameState.player.level})<br>
        ${gameState.player.hasModelGun ? 'モデルガン状態: <span style="color:#00ff66;">装備中</span>' : '<span style="color:#ff3333;">※モデルガン未所持（素手）</span>'}
      </p>

      <div style="margin-bottom: 15px;">
        <h4 style="font-size: 0.9em; color: #ffdd66; margin-bottom: 5px;">【装填スロット】</h4>
        ${gameState.equippedCards.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${gameState.equippedCards.map((card, idx) => `
              <div class="loadout-slot equipped-slot" style="display: flex; align-items: center; justify-content: space-between; padding: 8px;">
                <span>スロット ${idx + 1} (上限 ${9 - idx})</span>
                <span style="font-weight: bold; font-size: 1.1em;">【カード ${card}】</span>
              </div>
            `).join('')}
          </div>
          <p style="margin-top: 8px; color: #00ff66; font-size: 0.85em;">基礎射撃威力 (Vox Sacra): <strong>${totalPower}</strong></p>
        ` : '<div class="loadout-slot">カードは装填されていません</div>'}
      </div>

      <div>
        <h4 style="font-size: 0.9em; color: #aaa; margin-bottom: 5px;">【所持カード（1〜9全所有）】</h4>
        <div class="card-list">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `
            <div class="card-item">
              <img src="assets/images/cards/${num}card.png" alt="${num}" onerror="this.src='assets/images/cards/1card.png'" />
              <span style="font-size: 0.75em; color:#fff;">【${num}】</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 3. 🎒 所持品画面（回復アイテム・傘）
  renderInventoryView() {
    const items = gameState.inventory?.items || [];

    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">所持品</h3>
      </div>

      <p style="font-size: 0.85em; color: #ffdd66; margin-bottom: 10px;">所持金: ${gameState.player.money} 💰</p>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${items.length > 0 ? items.map((item, idx) => `
          <div style="background: #111; border: 1px solid #333; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="color: #fff; font-weight: bold; font-size: 0.9em;">${item.name}</div>
              <div style="color: #888; font-size: 0.75em;">${item.description || ''}</div>
            </div>
            <button class="use-item-btn" data-index="${idx}" style="background: #440000; color: #fff; border: 1px solid #ff3333; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8em;">使用</button>
          </div>
        `).join('')} : `
          <div style="text-align: center; color: #666; margin-top: 30px; font-size: 0.85em;">
            所持アイテムはありません。<br>1階のコンビニで購入可能です。
          </div>
        `}
      </div>
    `;
  }

  // 4. 📜 悪魔手記画面
  renderNotesView() {
    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">悪魔手記</h3>
      </div>
      <div style="font-size: 0.8em; line-height: 1.6; color: #ccc; background: #111; padding: 10px; border: 1px solid #330000; border-radius: 6px;">
        <p style="color: #ffdd66; font-weight: bold; margin-bottom: 5px;">【エクソシストの遺言】</p>
        <p>「マンションの悪魔は九つの退魔カード『ラミナ』に弱い……。ボスの魔方陣に合わせて適切な箇所の弱点を射抜くのだ……」</p>
        <hr style="border-color: #333; margin: 10px 0;">
        <p style="color: #ff4444;">【2F影山の噂】</p>
        <p>「影山は顔に『鏡（2）』、足元に『塩（3）』を嫌う。合計数字を『10』に合わせよ……」</p>
      </div>
    `;
  }

  // 5. 👁️ 使い魔画面（黒猫）
  renderFamiliarView() {
    const hasCat = gameState.flags.hasCat;
    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">使い魔</h3>
      </div>
      <div style="text-align: center; padding: 20px 10px;">
        <div style="font-size: 3em; margin-bottom: 10px;">🐈‍⬛</div>
        <h4 style="color: #ffdd66; margin-bottom: 10px;">黒猫の使い魔</h4>
        <p style="font-size: 0.8em; color: #aaa; line-height: 1.6;">
          ${hasCat ? 
            '<span style="color: #00ff66; font-weight: bold;">【実体化完了】</span><br>戦闘中、30%の確率で自動的に爪攻撃・身代わり・気まぐれ行動を行います。' : 
            `<span style="color: #ff4444;">【未実体化 (Lv.15で解放)】</span><br>現在のレベル: Lv.${gameState.player.level}<br>Lv.15に達すると漆黒の使い魔が戦闘に参戦します。`}
        </p>
      </div>
    `;
  }

  // 6. 🗺️ 詳細地図画面（全画面2Dマップ）
  renderFullMapView() {
    const map = gameState.currentMap || [];
    const player = gameState.player;

    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">詳細地図 (${gameState.currentFloor}F)</h3>
      </div>
      <div style="display: flex; justify-content: center; align-items: center; padding: 10px; background: #000; border: 1px solid #333; border-radius: 6px;">
        <div style="display: grid; grid-template-columns: repeat(${map[0]?.length || 1}, 18px); gap: 2px;">
          ${map.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isPlayer = player.x === cIdx && player.y === rIdx;
              let bg = '#111';
              if (cell === 1) bg = '#444'; // 壁
              else if (cell === 2) bg = '#0088cc'; // コンビニ/部屋
              else if (cell === 3) bg = '#aa0000'; // 血の池
              else if (cell === 4) bg = '#ff9900'; // 非常階段
              if (isPlayer) bg = '#00ff66'; // プレイヤー現在地

              return `<div style="width:18px; height:18px; background:${bg}; border-radius:2px; text-align:center; font-size:10px; line-height:18px;">${isPlayer ? '▲' : ''}</div>`;
            }).join('')
          ).join('')}
        </div>
      </div>
      <p style="font-size: 0.75em; color: #aaa; text-align: center; margin-top: 10px;">
        <span style="color:#00ff66;">▲</span> 現在地 | <span style="color:#444;">■</span> 壁 | <span style="color:#0088cc;">■</span> 施設/部屋 | <span style="color:#ff9900;">■</span> 階段
      </p>
    `;
  }

  // 7. 📝 調査ログ画面
  renderLogView() {
    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">調査ログ</h3>
      </div>
      <div style="font-size: 0.8em; color: #ccc; display: flex; flex-direction: column; gap: 10px;">
        <div style="background: #111; padding: 10px; border-left: 3px solid #ff3333;">
          <strong style="color: #ff3333;">【現在の目的】</strong><br>
          マンションを探索し、教え子を救出して最上階の悪魔を倒す。
        </div>
        <div style="background: #111; padding: 10px; border-left: 3px solid #ffdd66;">
          <strong style="color: #ffdd66;">【進行状況】</strong><br>
          ・1F 血の池にてエクソシストから悪魔辞典アプリとラミナ一式を受注。<br>
          ・2F非常階段の鍵を入手済み。
        </div>
      </div>
    `;
  }

  // 8. 💾 システム（セーブ/ロード）画面
  renderSystemView() {
    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">システム</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
        <button id="btn-app-save" class="app-btn" style="padding: 12px;">進行状況を保存 (SAVE)</button>
        <button id="btn-app-load" class="app-btn" style="padding: 12px; background: #222;">セーブデータを読み込む (LOAD)</button>
      </div>
    `;
  }

  // イベント登録
  bindEvents() {
    // ホームボタン（画面最下部のバー）
    const homeBtn = document.getElementById('app-home-btn');
    if (homeBtn) {
      homeBtn.onclick = () => {
        this.currentSubView = 'home';
        this.renderApp();
      };
    }

    // 戻るボタン
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.onclick = () => {
        this.currentSubView = 'home';
        this.renderApp();
      };
    }

    // アイコンタップ処理
    const icons = document.querySelectorAll('.app-icon');
    icons.forEach(icon => {
      icon.onclick = () => {
        const view = icon.getAttribute('data-view');
        if (view) {
          this.currentSubView = view;
          this.renderApp();
        }
      };
    });

    // セーブ・ロードボタン処理
    const saveBtn = document.getElementById('btn-app-save');
    if (saveBtn) {
      saveBtn.onclick = () => {
        gameState.saveGame();
        alert('悪魔辞典アプリに進行状況を保存しました。');
      };
    }

    const loadBtn = document.getElementById('btn-app-load');
    if (loadBtn) {
      loadBtn.onclick = () => {
        if (gameState.loadGame()) {
          alert('セーブデータを読み込みました。');
          this.renderApp();
        } else {
          alert('保存されたデータがありません。');
        }
      };
    }
  }
}