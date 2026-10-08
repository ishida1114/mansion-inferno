// appUI.js - スマホUI（闇の契約・回収ボタン統合版）
import { gameState } from './gameState.js';
import { itemDefinitions } from './items.js';
import { applyChromaKey } from './ui.js';

export const LOGO_ASSETS = {
  TITLE_LOGO: 'assets/images/akumanologo.png',
  APP_LOGO: 'assets/images/DictionariumDaemonum.webp'
};

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
            width: 330px; height: 92%; background-color: #0d0d12;
            border: 3px solid #2a1a1a; border-radius: 20px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.9), 0 0 15px rgba(100, 0, 0, 0.5);
            display: flex; flex-direction: column; overflow: hidden;
            font-family: 'Shippori Mincho', serif; color: #ddd; position: relative;
        }
        .app-header {
            background: linear-gradient(180deg, #220000, #000); padding: 8px 10px;
            font-size: 0.78em; display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #550000; color: #aaa;
        }
        .app-header span { font-weight: bold; color: #ffdd66; }
        .app-close-x {
            color: #ff4444; font-weight: bold; cursor: pointer; padding: 2px 6px; font-size: 1.2em;
            line-height: 1; user-select: none;
        }
        .app-close-x:hover { color: #fff; background: rgba(255,0,0,0.3); border-radius: 3px; }
        
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
        .app-home-btn { width: 50px; height: 6px; background-color: #555; border-radius: 3px; cursor: pointer; }
        .app-home-btn:hover { background-color: #aaa; }
        
        .sub-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #550000; padding-bottom: 8px; margin-bottom: 12px; }
        .back-btn { cursor: pointer; color: #888; font-size: 0.85em; transition: color 0.2s; padding: 4px; }
        .back-btn:hover { color: #fff; }
        .sub-title { font-size: 1.1em; color: #ff3333; text-shadow: 0 0 5px red; margin: 0; text-align: center; flex: 1; font-weight: bold; }
        
        .loadout-slot { background: #111; border: 2px dashed #440000; padding: 10px; text-align: center; margin-bottom: 8px; color: #666; border-radius: 6px; font-size: 0.85em; }
        .equipped-slot { border: 2px solid #ffdd66; color: #ffdd66; background: #221a00; }
        
        .card-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding-top: 8px; }
        .card-item { border: 1px solid #555; padding: 6px; cursor: pointer; background: #000; text-align: center; border-radius: 6px; }
        .card-item:hover { border-color: #ff3333; }
        .card-item.disabled { opacity: 0.35; cursor: not-allowed; border-color: #222; }
        .card-item img { max-width: 45px; display: block; margin: 0 auto 4px auto; }
    `;
    document.head.appendChild(appStyle);
}

export class AppUI {
  constructor() {
    this.currentSubView = 'home';
  }

  closeApp() {
    const container = document.getElementById('app-ui-container');
    if (container) container.classList.add('hidden');
    this.currentSubView = 'home';
  }

  renderApp() {
    const appContainer = document.getElementById('app-ui-container');
    if (!appContainer) return;

    appContainer.classList.add('app-overlay');
    
    if (!gameState.equippedCards) {
      gameState.equippedCards = [];
    }

    const familiarPercent = gameState.flags.hasCat ? 100 : Math.min(100, Math.floor((gameState.player.level / 15) * 100));

    appContainer.innerHTML = `
      <div class="smartphone">
        <div class="app-header">
          <span>[Lv.${gameState.player.level}]</span>
          <span>HP:${gameState.player.hp}/${gameState.player.maxHp}</span>
          <span>罪:${gameState.player.sin}</span>
          <span>使い魔:${familiarPercent}%</span>
          <span class="app-close-x" id="btn-app-close-x" title="閉じる">✕</span>
        </div>

        <div class="app-content">
          ${this.renderSubViewContent()}
        </div>

        <div class="app-footer">
          <div class="app-home-btn" id="app-home-btn" title="ホーム / 閉じる"></div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderSubViewContent() {
    switch (this.currentSubView) {
      case 'loadout': return this.renderLoadoutView();
      case 'inventory': return this.renderInventoryView();
      case 'notes': return this.renderNotesView();
      case 'familiar': return this.renderFamiliarView();
      case 'map': return this.renderFullMapView();
      case 'log': return this.renderLogView();
      case 'system': return this.renderSystemView();
      case 'home': default: return this.renderHomeGridView();
    }
  }

  renderHomeGridView() {
    const hasLostMoney = gameState.lastLostMoney > 0;

    return `
      <div style="text-align: center; margin-bottom: 8px; padding: 2px 0;">
        <img src="${LOGO_ASSETS.APP_LOGO}" alt="悪魔辞典" style="width: 85%; max-height: 90px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.5)); margin: 0 auto; display: block;" />
      </div>

      <!-- ★ 闇の契約（回収）ボタン -->
      <div style="margin-bottom: 12px;">
        <button id="btn-dark-contract" style="width: 100%; background: ${hasLostMoney ? 'linear-gradient(180deg, #880000, #330000)' : '#1a1a1a'}; color: ${hasLostMoney ? '#ffdd66' : '#555'}; border: 1px solid ${hasLostMoney ? '#ff3333' : '#333'}; padding: 8px; border-radius: 8px; font-family: inherit; font-weight: bold; cursor: ${hasLostMoney ? 'pointer' : 'not-allowed'}; box-shadow: ${hasLostMoney ? '0 0 10px rgba(255,0,0,0.6)' : 'none'};">
          🩸 闇の契約 (資金回収)
          <div style="font-size: 0.72em; font-weight: normal; color: ${hasLostMoney ? '#ffaabb' : '#444'};">
            ${hasLostMoney ? `Sin+15 と引き換えに 💰\${gameState.lastLostMoney} を全額回収` : '回収できる失われた資金はありません'}
          </div>
        </button>
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

  renderLoadoutView() {
    const pLevel = gameState.player.level;
    const hasGun = gameState.player.hasModelGun || gameState.hasModelGun;
    const equipped = gameState.equippedCards || [];
    const totalPower = equipped.reduce((a, b) => a + b, 0);

    return `
      <div class="sub-header">
        <span class="back-btn" id="btn-back">◄ 戻る</span>
        <h3 class="sub-title">ラミナ装填</h3>
      </div>
      
      <div style="text-align: center; margin-bottom: 10px; background: #000; padding: 8px; border-radius: 6px; border: 1px solid #330000;">
        ${hasGun ? `
          <img id="loadout-gun-img" src="assets/images/modelgun.jpg" alt="モデルガン" style="max-width: 100px; max-height: 60px; object-fit: contain; display: block; margin: 0 auto 5px auto; border-radius: 4px;" />
          <span style="color:#00ff66; font-size:0.8em; font-weight:bold;">モデルガン連携中</span>
        ` : `
          <span style="color:#ff4444; font-size:0.8em;">※モデルガン未所持（装填不可）</span>
        `}
      </div>

      <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px; text-align: center;">
        Lv.<strong>${pLevel}</strong> （EXP: ${gameState.player.exp}/${gameState.player.maxExp}） | 上限コスト: <strong>${pLevel}</strong>
      </div>

      <div>
        <div class="loadout-slot ${equipped.length > 0 ? 'equipped-slot' : ''}">
          装填中：<strong>${equipped.length > 0 ? `【カード \${equipped[0]}】` : '未装填'}</strong>
        </div>
        <div style="color: #00ff66; font-size: 0.8em; margin-bottom: 10px; text-align: center;">基本威力 (Vox Sacra): ${totalPower}</div>
      </div>

      <div class="sub-title" style="font-size: 0.85em; text-align: left; margin: 10px 0 5px 0; color:#ffdd66;">タップして装填するカードを選択</div>
      <div class="card-list">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const isAllowed = hasGun && (num <= pLevel);
          return `
            <div class="card-item ${isAllowed ? '' : 'disabled'}" data-card-num="${num}">
              <img src="assets/images/cards/\${num}Card.png" alt="Card ${num}" onerror="this.src='assets/images/cards/${num}card.png'" />
              <div style="font-size: 0.7em; font-weight:bold;">【${num}】${isAllowed ? '' : '<br><span style="color:#ff4444;">ロック</span>'}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderInventoryView() {
    const items = gameState.inventory?.items || [];
    return `
      <div class="sub-header"><span class="back-btn" id="btn-back">◄ 戻る</span><h3 class="sub-title">所持品</h3></div>
      <div style="font-size: 0.85em; color: #ffdd66; margin-bottom: 10px;">所持金: ${gameState.player.money} 💰 | 防御力(DEF): +${gameState.player.def}</div>
      <div>
        ${items.length > 0 ? items.map((item, idx) => `
          <div class="loadout-slot" style="display: flex; justify-content: space-between; align-items: center; border-style: solid; text-align: left;">
            <div><div style="color: #fff; font-weight: bold;">\${item.name}</div><div style="font-size: 0.75em; color: #888;">\${item.description || ''}</div></div>
            <button class="back-btn" style="color: #ff3333; border: 1px solid #ff3333; padding: 2px 6px;">使用</button>
          </div>`).join('') : '<div class="loadout-slot">所持アイテムなし</div>'}
      </div>
    `;
  }

  renderNotesView() {
    const hints = gameState.bossHints || [];
    return `
      <div class="sub-header"><span class="back-btn" id="btn-back">◄ 戻る</span><h3 class="sub-title">悪魔手記</h3></div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="loadout-slot" style="border-style: solid; text-align: left; line-height: 1.5; margin-bottom: 4px;">
          <div style="color: #ffdd66; font-weight: bold;">【エクソシストの遺言】</div>
          <div>「ボスの魔方陣に合わせて適切な弱点カードを撃ち抜くのだ……」</div>
        </div>
        ${hints.length > 0 ? hints.map(hint => `
          <div class="loadout-slot" style="border-style: solid; text-align: left; line-height: 1.5; color: #dddddd; border-color: #770000; background: #1a0505;">
            \${hint}
          </div>
        `).join('') : '<div class="loadout-slot" style="color:#666;">（まだ攻略ヒントを入手していません）</div>'}
      </div>
    `;
  }

  renderFamiliarView() {
    const familiarPercent = gameState.flags.hasCat ? 100 : Math.min(100, Math.floor((gameState.player.level / 15) * 100));
    return `
      <div class="sub-header"><span class="back-btn" id="btn-back">◄ 戻る</span><h3 class="sub-title">使い魔</h3></div>
      <div style="text-align: center; padding: 10px 0;">
        <img id="familiar-cat-img" src="assets/images/blackcat.jpg" style="max-height: 140px; border-radius: 8px; margin-bottom: 8px;" onerror="this.style.display='none'">
        <div style="color: #ffdd66; font-weight:bold;">黒猫の使い魔</div>
        <div style="font-size: 0.8em; color: #aaa; margin-top: 8px; line-height:1.5;">Lv.15に達すると実体化して戦闘に参戦します。<br>(現在の親密度: ${familiarPercent}%)</div>
      </div>
    `;
  }

  renderFullMapView() {
    const map = gameState.currentMap || [];
    const player = gameState.player;
    return `<div class="sub-header"><span class="back-btn" id="btn-back">◄ 戻る</span><h3 class="sub-title">詳細地図 (${gameState.currentFloor}F)</h3></div><div style="display: flex; justify-content: center; padding: 10px; background: #000; border-radius: 6px;"><div style="display: grid; grid-template-columns: repeat(${map[0]?.length || 1}, 14px); gap: 2px;">${map.map((row, rIdx) => row.map((cell, cIdx) => { const isPlayer = player.x === cIdx && player.y === rIdx; let bg = '#111'; if (cell === 1) bg = '#444'; else if (cell === 2) bg = '#0088cc'; else if (cell === 3) bg = '#aa0000'; else if (cell === 4) bg = '#ff9900'; if (isPlayer) bg = '#00ff66'; return `<div style="width:14px; height:14px; background:${bg}; border-radius:2px; text-align:center; font-size:9px; line-height:14px;">${isPlayer ? '▲' : ''}</div>`; }).join('')).join('')}</div></div>`;
  }

  renderLogView() {
    return `<div class="sub-header"><span class="back-btn" id="btn-back">◄ 戻る</span><h3 class="sub-title">調査ログ</h3></div><div class="loadout-slot" style="border-style: solid; text-align: left;"><div style="color: #ff3333; font-weight: bold;">【現在の目的】</div><div>教え子を救出して最上階の悪魔を撃破する。</div></div>`;
  }

  renderSystemView() {
    return `<div class="sub-header"><span class="back-btn" id="btn-back">◄ 戻る</span><h3 class="sub-title">システム</h3></div><div style="display: flex; flex-direction: column; gap: 10px; padding-top: 10px;"><button id="btn-app-save" class="back-btn" style="padding: 10px; background: #220000; border: 1px solid #770000; color:#fff;">進行状況を保存 (SAVE)</button><button id="btn-app-load" class="back-btn" style="padding: 10px; background: #111; border: 1px solid #333; color:#fff;">データを読み込む (LOAD)</button></div>`;
  }

  bindEvents() {
    const closeX = document.getElementById('btn-app-close-x');
    if (closeX) closeX.onclick = (e) => { e.stopPropagation(); this.closeApp(); };

    const homeBtn = document.getElementById('app-home-btn');
    if (homeBtn) homeBtn.onclick = (e) => { e.stopPropagation(); if (this.currentSubView === 'home') this.closeApp(); else { this.currentSubView = 'home'; this.renderApp(); } };

    const backBtn = document.getElementById('btn-back');
    if (backBtn) backBtn.onclick = () => { this.currentSubView = 'home'; this.renderApp(); };

    // 闇の契約ボタン処理
    const contractBtn = document.getElementById('btn-dark-contract');
    if (contractBtn) {
        contractBtn.onclick = () => {
            if (gameState.lastLostMoney <= 0) return;
            const res = gameState.contractRecovery();
            alert(res.msg);
            this.renderApp();
        };
    }

    const icons = document.querySelectorAll('.app-icon');
    icons.forEach(icon => {
      icon.onclick = () => {
        const view = icon.getAttribute('data-view');
        if (view) { this.currentSubView = view; this.renderApp(); }
      };
    });

    const gunImg = document.getElementById('loadout-gun-img');
    applyChromaKey(gunImg);

    const catImg = document.getElementById('familiar-cat-img');
    applyChromaKey(catImg);

    const cardItems = document.querySelectorAll('.card-item');
    cardItems.forEach(item => {
      item.onclick = () => {
        const hasGun = gameState.player.hasModelGun || gameState.hasModelGun;
        if (!hasGun) {
          alert("モデルガンを所有していないため、ラミナを装填できません。");
          return;
        }

        const num = parseInt(item.getAttribute('data-card-num'));
        if (isNaN(num)) return;

        if (num > gameState.player.level) {
            alert(`主人公のレベル（Lv.${gameState.player.level}）を超えるカード【${num}】は装填できません！`);
        } else {
            gameState.equippedCards = [num];
            alert(`カード【${num}】をモデルガンに装填しました！`);
            this.renderApp();
        }
      };
    });

    const saveBtn = document.getElementById('btn-app-save');
    if (saveBtn) saveBtn.onclick = () => { gameState.saveGame(); alert('悪魔辞典アプリに進行状況を保存しました。'); };

    const loadBtn = document.getElementById('btn-app-load');
    if (loadBtn) loadBtn.onclick = () => { if (gameState.loadGame()) { alert('セーブデータを読み込みました。'); this.renderApp(); } else { alert('保存されたデータがありません。'); } };
  }
}