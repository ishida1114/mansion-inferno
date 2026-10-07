// appUI.js - スマホアプリ「悪魔辞典」UI（仕様書CSS＆クラス名完全適用版）
import { gameState } from './gameState.js';
import { CONSUMABLE_ITEMS, ARMOR_ITEMS } from './items.js';

export const LOGO_ASSETS = {
  TITLE_LOGO: 'assets/images/akumanologo.png',
  APP_LOGO: 'assets/images/DictionariumDaemonum.webp'
};

// --- 仕様書定義：ホラー風フォントとアプリUI用スタイルの自動注入 ---
if (!document.getElementById("app-style-element")) {
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;800&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const appStyle = document.createElement("style");
    appStyle.id = "app-style-element";
    appStyle.innerHTML = `
        .app-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px);
            z-index: 3000; display: flex; justify-content: center; align-items: center;
        }
        .smartphone {
            width: 320px; height: 92%; background-color: #0d0d12;
            border: 3px solid #1a1a24; border-radius: 20px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.9), 0 0 15px rgba(100, 0, 0, 0.5);
            display: flex; flex-direction: column; overflow: hidden;
            font-family: 'Shippori Mincho', serif; color: #ddd; position: relative;
        }
        .app-header {
            background: linear-gradient(180deg, #220000, #000); padding: 8px 12px;
            font-size: 0.8em; display: flex; justify-content: space-between;
            border-bottom: 1px solid #550000; color: #aaa;
        }
        .app-header span { font-weight: bold; color: #ffdd66; }
        .app-content { flex: 1; padding: 15px; overflow-y: auto; position: relative; }
        .app-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .app-icon {
            background-color: #111; border: 1px solid #330000; border-radius: 12px;
            padding: 15px 8px; text-align: center; cursor: pointer; transition: all 0.2s ease;
        }
        .app-icon:hover { background-color: #2a0000; border-color: #ff3333; }
        .app-icon-emoji { font-size: 1.8em; margin-bottom: 6px; }
        .app-icon-title { font-size: 0.85em; color: #ccc; }
        .app-footer {
            height: 40px; border-top: 1px solid #333; display: flex;
            justify-content: center; align-items: center; background-color: #050505;
        }
        .app-home-btn { width: 50px; height: 5px; background-color: #555; border-radius: 3px; cursor: pointer; }
        .app-home-btn:hover { background-color: #aaa; }
        
        /* サブ画面用スタイル */
        .sub-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #550000; padding-bottom: 8px; margin-bottom: 12px; }
        .back-btn { cursor: pointer; color: #888; font-size: 0.85em; transition: color 0.2s; padding: 4px; }
        .back-btn:hover { color: #fff; }
        .sub-title { font-size: 1.1em; color: #ff3333; text-shadow: 0 0 5px red; margin: 0; text-align: center; flex: 1; font-weight: bold; }
        
        .loadout-slot { background: #111; border: 2px dashed #440000; padding: 10px; text-align: center; margin-bottom: 8px; color: #666; border-radius: 6px; font-size: 0.85em; }
        .equipped-slot { border: 2px solid #ffdd66; color: #ffdd66; background: #221a00; }
        .card-list { display: flex; gap: 8px; overflow-x: auto; padding-top: 8px; }
        .card-item { border: 1px solid #555; padding: 4px; cursor: pointer; background: #000; text-align: center; border-radius: 4px; min-width: 50px; }
        .card-item:hover { border-color: #ff3333; }
        .card-item img { max-width: 45px; display: block; margin: 0 auto 4px auto; }

        /* デバッグUI用 */
        .debug-modal {
            position: absolute; top: 10%; left: 10%; width: 80%; height: 80%;
            background: rgba(0, 20, 0, 0.95); border: 2px solid #00ff00;
            z-index: 4000; color: #00ff00; padding: 15px; font-family: monospace;
            display: flex; flex-direction: column; gap: 12px; border-radius: 8px;
        }
        .debug-btn {
            background: #003300; color: #00ff00; border: 1px solid #00ff00;
            padding: 8px; cursor: pointer; font-size: 1em; text-align: left;
        }
        .debug-btn:hover { background: #006600; }
    `;
    document.head.appendChild(appStyle);
}

export class AppUI {
  constructor() {
    this.currentSubView = 'home';
  }

  renderApp() {
    const appContainer = document.getElementById('app-ui-container');
    if (!appContainer) return;

    // 親コンテナに仕様書定義のクラスを付与
    appContainer.className = 'app-overlay';

    gameState.updateEquippedCards();
    const familiarPercent = gameState.flags.hasCat ? 100 : Math.min(100, Math.floor((gameState.player.level / 15) * 100));

    // 仕様書のHTML構造・クラス名に完全統一
    appContainer.innerHTML = `
      <div class="smartphone">
        <div class="app-header">
          <span>[Lv.${gameState.player.level}]</span>
          <span>HP: ${gameState.player.hp}/${gameState.player.maxHp}</span>
          <span>SIN: ${gameState.player.sin}</span>
          <span>FAMILIAR: ${familiarPercent}%</span>
        </div>

        <div class="app-content">
          ${this.renderSubViewContent()}
        </div>

        <div class="app-footer">
          <div class="app-home-btn" id="app-home-btn"></div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

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

  // 1. ホームグリッド（仕様書CSSクラス: app-grid, app-icon, app-icon-emoji, app-icon-title）
  renderHomeGridView() {
    return `
      <div style="text-align: center; margin-bottom: 12px;">
        <img src="${LOGO_ASSETS.APP_LOGO}" alt="App Logo" style="width: 40px; height: 40px; object-fit: contain;" />
        <div style="font-size: 0.9em; color: #ff3333; margin-top: 4px; font-weight: bold;">悪魔辞典</div>
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
          <div class="app-icon-title">システム</div>
        </div>
      </div>
    `;
  }

  // 2. ラミナ装填（仕様書CSSクラス: sub-header, back-btn, sub-title, loadout-slot, equipped-slot, card-list, card-item）
  renderLoadoutView() {
    const totalPower = gameState.equippedCards.reduce((a, b) => a + b, 0);

    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">ラミナ装填</h3>
      </div>
      
      <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">
        Lv.${gameState.player.level}（コスト上限:${gameState.player.level}）
      </div>

      <div>
        ${gameState.equippedCards.length > 0 ? `
          ${gameState.equippedCards.map((card, idx) => `
            <div class="loadout-slot equipped-slot">
              スロット ${idx + 1}：【カード ${card}】
            </div>
          `).join('')}
          <div style="color: #00ff66; font-size: 0.8em; margin-bottom: 10px;">攻撃力 (Vox Sacra): ${totalPower}</div>
        ` : '<div class="loadout-slot">未装填</div>'}
      </div>

      <div class="sub-title" style="font-size: 0.9em; text-align: left; margin: 10px 0 5px 0;">所持カード一式</div>
      <div class="card-list">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `
          <div class="card-item">
            <img src="assets/images/cards/${num}card.png" alt="${num}" onerror="this.src='assets/images/cards/1card.png'" />
            <div style="font-size: 0.7em;">【${num}】</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 3. 所持品（仕様書CSSクラス完全合致）
  renderInventoryView() {
    const items = gameState.inventory?.items || [];

    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">所持品</h3>
      </div>

      <div style="font-size: 0.85em; color: #ffdd66; margin-bottom: 10px;">所持金: ${gameState.player.money} 💰</div>

      <div>
        ${items.length > 0 ? items.map((item, idx) => `
          <div class="loadout-slot" style="display: flex; justify-content: space-between; align-items: center; border-style: solid; text-align: left;">
            <div>
              <div style="color: #fff; font-weight: bold;">${item.name}</div>
              <div style="font-size: 0.75em; color: #888;">${item.description || ''}</div>
            </div>
            <button class="back-btn" style="color: #ff3333; border: 1px solid #ff3333; padding: 2px 6px;">使用</button>
          </div>
        `).join('') : `
          <div class="loadout-slot">所持アイテムなし</div>
        `}
      </div>
    `;
  }

  // 4. 悪魔手記
  renderNotesView() {
    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">悪魔手記</h3>
      </div>
      <div class="loadout-slot" style="border-style: solid; text-align: left; line-height: 1.5;">
        <div style="color: #ffdd66; font-weight: bold;">【エクソシストの遺言】</div>
        <div>「ボスの魔方陣に合わせて適切な弱点カードを撃ち抜くのだ……」</div>
      </div>
    `;
  }

  // 5. 使い魔
  renderFamiliarView() {
    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">使い魔</h3>
      </div>
      <div style="text-align: center; padding: 15px 0;">
        <div style="font-size: 2.5em;">🐈‍⬛</div>
        <div style="color: #ffdd66; margin-top: 5px;">黒猫の使い魔</div>
        <div style="font-size: 0.8em; color: #aaa; margin-top: 8px;">Lv.15に達すると実体化して戦闘に参戦します。</div>
      </div>
    `;
  }

  // 6. 詳細地図
  renderFullMapView() {
    const map = gameState.currentMap || [];
    const player = gameState.player;

    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">詳細地図 (${gameState.currentFloor}F)</h3>
      </div>
      <div style="display: flex; justify-content: center; padding: 10px; background: #000; border-radius: 6px;">
        <div style="display: grid; grid-template-columns: repeat(${map[0]?.length || 1}, 14px); gap: 2px;">
          ${map.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isPlayer = player.x === cIdx && player.y === rIdx;
              let bg = '#111';
              if (cell === 1) bg = '#444';
              else if (cell === 2) bg = '#0088cc';
              else if (cell === 3) bg = '#aa0000';
              else if (cell === 4) bg = '#ff9900';
              if (isPlayer) bg = '#00ff66';

              return `<div style="width:14px; height:14px; background:${bg}; border-radius:2px; text-align:center; font-size:9px; line-height:14px;">${isPlayer ? '▲' : ''}</div>`;
            }).join('')
          ).join('')}
        </div>
      </div>
    `;
  }

  // 7. 調査ログ
  renderLogView() {
    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">調査ログ</h3>
      </div>
      <div class="loadout-slot" style="border-style: solid; text-align: left;">
        <div style="color: #ff3333; font-weight: bold;">【現在の目的】</div>
        <div>教え子を救出して最上階の悪魔を撃破する。</div>
      </div>
    `;
  }

  // 8. システム
  renderSystemView() {
    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">システム</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; padding-top: 10px;">
        <button id="btn-app-save" class="back-btn" style="padding: 10px; background: #220000; border: 1px solid #770000; color:#fff;">進行状況を保存 (SAVE)</button>
        <button id="btn-app-load" class="back-btn" style="padding: 10px; background: #111; border: 1px solid #333; color:#fff;">データを読み込む (LOAD)</button>
      </div>
    `;
  }

  bindEvents() {
    const homeBtn = document.getElementById('app-home-btn');
    if (homeBtn) {
      homeBtn.onclick = () => {
        this.currentSubView = 'home';
        this.renderApp();
      };
    }

    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.onclick = () => {
        this.currentSubView = 'home';
        this.renderApp();
      };
    }

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