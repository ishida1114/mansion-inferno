// main.js - 移動操作・操作ボタン・イベント二重発火防止ロック（完全版）

import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';

let appUI;
let renderer;
let isRunning = false;
let isProcessingEvent = false; // ★ イベント重複発火防止フラグ

function init() {
  appUI = new AppUI();
  renderer = new Renderer();

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    if (target.id === 'btn-start' || target.closest('#btn-start')) {
      const titleScreen = document.getElementById('title-screen');
      if (titleScreen) titleScreen.classList.add('hidden');
      startNewGame();
    } else if (target.id === 'btn-load' || target.closest('#btn-load')) {
      const hasSave = gameState.loadGame();
      if (hasSave) {
        const titleScreen = document.getElementById('title-screen');
        if (titleScreen) titleScreen.classList.add('hidden');
        resumeGame();
      } else {
        alert('保存されたセーブデータが見つかりませんでした。');
      }
    }
  });
}

function startNewGame() {
  gameState.currentFloor = 1;
  gameState.currentMap = map1F;
  gameState.player.x = playerStart1F.x;
  gameState.player.y = playerStart1F.y;
  gameState.player.dir = playerStart1F.dir;

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

function initInputListeners() {
  window.onkeydown = (e) => {
    if (isProcessingEvent) return; // ★ イベント処理中はキー操作を無効化

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
        interactFrontCell();
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

  document.addEventListener('click', (e) => {
    if (isProcessingEvent) return; // ★ イベント処理中はボタン操作を無効化

    const id = e.target?.id;
    if (id === 'btn-up') moveForward();
    else if (id === 'btn-down') moveBackward();
    else if (id === 'btn-left') gameState.player.dir = (gameState.player.dir + 3) % 4;
    else if (id === 'btn-right') gameState.player.dir = (gameState.player.dir + 1) % 4;
    else if (id === 'btn-action') interactFrontCell();
    else if (id === 'btn-app-toggle') toggleAppUI();
    else if (id === 'btn-close-debug') toggleDebugUI();
  });
}

// 目の前のマスを調べる（ロック制御付き）
function interactFrontCell() {
  if (isProcessingEvent) return; // ★ 既にイベント進行中なら何もしない

  const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const vec = dirVectors[gameState.player.dir];
  const frontX = gameState.player.x + vec.x;
  const frontY = gameState.player.y + vec.y;

  const map = gameState.currentMap;
  if (!map || !map[frontY]) return;

  const cellType = map[frontY][frontX];
  if (!cellType || cellType === 0 || cellType === 1) return;

  if (gameState.currentFloor === 1) {
    const eventObj = handleEvent1F(cellType, gameState, {
      changeFloor: (floor) => {
        gameState.currentFloor = floor;
        alert(`${floor}Fへ移動します`);
      },
      redraw: () => renderer.render()
    });

    if (eventObj && typeof eventObj.run === 'function') {
      isProcessingEvent = true; // ★ ロック開始

      eventObj.run(() => {
        isProcessingEvent = false; // ★ イベント終了時にロック解除
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