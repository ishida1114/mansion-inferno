// main.js - 移動操作・操作ボタン・ESC/F2キー制御（完全版）

import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';

const DEFAULT_MAP_1F = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

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

function startNewGame() {
  gameState.currentFloor = 1;
  gameState.currentMap = DEFAULT_MAP_1F;
  gameState.player.x = 1;
  gameState.player.y = 1;
  gameState.player.dir = 1;

  document.getElementById('touch-controls')?.classList.remove('hidden');
  appUI.renderApp();
  initInputListeners();

  if (!isRunning) {
    isRunning = true;
    gameLoop();
  }
}

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

// -------------------------------------------------------------
// 【キーボード & 操作UIボタンの登録】
// -------------------------------------------------------------
function initInputListeners() {
  // キーボード入力
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
      case 'Escape':
        toggleAppUI();
        break;
      case 'F2':
        e.preventDefault();
        toggleDebugUI();
        break;
    }
  };

  // UIボタンイベント登録
  document.getElementById('btn-up').onclick = () => moveForward();
  document.getElementById('btn-down').onclick = () => moveBackward();
  document.getElementById('btn-left').onclick = () => gameState.player.dir = (gameState.player.dir + 3) % 4;
  document.getElementById('btn-right').onclick = () => gameState.player.dir = (gameState.player.dir + 1) % 4;
  document.getElementById('btn-app-toggle').onclick = () => toggleAppUI();
  document.getElementById('btn-close-debug').onclick = () => toggleDebugUI();
}

// ESCキー: アプリUI表示切り替え
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

// F2キー: デバッグ画面表示切り替え
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