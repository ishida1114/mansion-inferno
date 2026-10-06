// main.js - ゲーム起点処理・移動操作・1F固有マップ＆イベント連動（完全修正版）

import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';

const appUI = new AppUI();
const renderer = new Renderer();
let isRunning = false;

function init() {
  const titleScreen = document.getElementById('title-screen');
  const btnStart = document.getElementById('btn-start');
  const btnLoad = document.getElementById('btn-load');

  if (btnStart) {
    btnStart.onclick = () => {
      if (titleScreen) titleScreen.classList.add('hidden');
      startNewGame();
    };
  }

  if (btnLoad) {
    btnLoad.onclick = () => {
      const hasSave = gameState.loadGame();
      if (hasSave) {
        if (titleScreen) titleScreen.classList.add('hidden');
        resumeGame();
      } else {
        alert('保存されたセーブデータが見つかりませんでした。');
      }
    };
  }
}

// 新規ゲーム開始
function startNewGame() {
  gameState.currentFloor = 1;
  gameState.currentMap = map1F;                // ★ maps/map1F.js の正しい1Fマップを読み込み
  gameState.player.x = playerStart1F.x;        // ★ 正しい初期位置 X:7
  gameState.player.y = playerStart1F.y;        // ★ 正しい初期位置 Y:1
  gameState.player.dir = playerStart1F.dir;    // ★ 正しい初期向き (北向き)

  document.getElementById('touch-controls')?.classList.remove('hidden');
  appUI.renderApp();
  initInputListeners();

  if (!isRunning) {
    isRunning = true;
    gameLoop();
  }
}

// セーブデータから再開
function resumeGame() {
  document.getElementById('touch-controls')?.classList.remove('hidden');
  appUI.renderApp();
  initInputListeners();

  if (!isRunning) {
    isRunning = true;
    gameLoop();
  }
}

function gameLoop() {
  if (isRunning) {
    renderer.render();
    requestAnimationFrame(gameLoop);
  }
}

// キーボード & UI操作ボタンの登録
function initInputListeners() {
  window.onkeydown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        moveForward();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        moveBackward();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        gameState.player.dir = (gameState.player.dir + 3) % 4;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        gameState.player.dir = (gameState.player.dir + 1) % 4;
        break;
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        interactFrontCell(); // ★ スペースキーで目の前のマスを調べる
        break;
      case 'Escape':
        toggleAppUI();
        break;
      case 'F2':
        e.preventDefault();
        toggleDebugUI();
        break;
    }
  };

  // UIボタンイベントの登録
  const btnUp = document.getElementById('btn-up');
  const btnDown = document.getElementById('btn-down');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnAction = document.getElementById('btn-action');
  const btnApp = document.getElementById('btn-app-toggle');
  const btnDebug = document.getElementById('btn-close-debug');

  if (btnUp) btnUp.onclick = () => moveForward();
  if (btnDown) btnDown.onclick = () => moveBackward();
  if (btnLeft) btnLeft.onclick = () => gameState.player.dir = (gameState.player.dir + 3) % 4;
  if (btnRight) btnRight.onclick = () => gameState.player.dir = (gameState.player.dir + 1) % 4;
  if (btnAction) btnAction.onclick = () => interactFrontCell(); // ★ 「調べる」ボタン連動
  if (btnApp) btnApp.onclick = () => toggleAppUI();
  if (btnDebug) btnDebug.onclick = () => toggleDebugUI();
}

// 目の前のマス（コンビニ・血の池・ポスト・扉等）を調べるイベント処理
function interactFrontCell() {
  const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const vec = dirVectors[gameState.player.dir];
  const frontX = gameState.player.x + vec.x;
  const frontY = gameState.player.y + vec.y;

  const map = gameState.currentMap;
  if (!map || !map[frontY]) return;

  const cellType = map[frontY][frontX];
  if (!cellType || cellType === 0 || cellType === 1) return; // 壁や通路は無視

  // 1階固有イベントの発火
  if (gameState.currentFloor === 1) {
    const eventObj = handleEvent1F(cellType, gameState, {
      changeFloor: (floor) => {
        gameState.currentFloor = floor;
        alert(`${floor}Fへ移動します（2F処理準備中）`);
      },
      redraw: () => renderer.render()
    });

    if (eventObj && typeof eventObj.run === 'function') {
      eventObj.run(() => {
        renderer.render();
      });
    }
  }
}

function toggleAppUI() {
  const container = document.getElementById('app-ui-container');
  if (container) {
    const isHidden = container.classList.contains('hidden');
    if (isHidden) {
      appUI.renderApp();
      container.classList.remove('hidden');
    } else {
      container.classList.add('hidden');
    }
  }
}

function toggleDebugUI() {
  const overlay = document.getElementById('debug-overlay');
  const info = document.getElementById('debug-info');
  if (overlay && info) {
    const isHidden = overlay.classList.contains('hidden');
    if (isHidden) {
      const p = gameState.player;
      info.innerHTML = `座標 (X:${p.x}, Y:${p.y})<br>向き: ${p.dir} (0:北,1:東,2:南,3:西)<br>Lv: ${p.level} | HP: ${p.hp}/${p.maxHp} | SIN: ${p.sin}`;
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
}

function moveForward() {
  const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const vec = dirVectors[gameState.player.dir];
  const nextX = gameState.player.x + vec.x;
  const nextY = gameState.player.y + vec.y;
  const map = gameState.currentMap;
  if (map && map[nextY] && map[nextY][nextX] === 0) {
    gameState.player.x = nextX;
    gameState.player.y = nextY;
  }
}

function moveBackward() {
  const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const vec = dirVectors[gameState.player.dir];
  const nextX = gameState.player.x - vec.x;
  const nextY = gameState.player.y - vec.y;
  const map = gameState.currentMap;
  if (map && map[nextY] && map[nextY][nextX] === 0) {
    gameState.player.x = nextX;
    gameState.player.y = nextY;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}