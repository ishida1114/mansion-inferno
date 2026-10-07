// main.js - 移動操作・操作ボタン・フロア遷移・アプリ解放条件管理（完全修正版）

import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';
import { map2F, playerStart2F, handleEvent2F } from './maps/map2F.js';
import { showMessageDialog } from './ui.js';

let appUI;
let renderer;
let isRunning = false;
let isProcessingEvent = false;

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

// 新規ゲーム開始 (1F非常階段前からスタート)
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
    if (isProcessingEvent) return;

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
    if (isProcessingEvent) return;

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

// 目の前のマスを調べる
function interactFrontCell() {
  if (isProcessingEvent) return;

  const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const vec = dirVectors[gameState.player.dir];
  const frontX = gameState.player.x + vec.x;
  const frontY = gameState.player.y + vec.y;

  const map = gameState.currentMap;
  if (!map || !map[frontY]) return;

  const cellType = map[frontY][frontX];
  if (!cellType || cellType === 0 || cellType === 1) return;

  const context = {
    changeFloor: (floor) => {
      changeFloor(floor);
    },
    redraw: () => renderer.render()
  };

  let eventObj = null;

  // 1階イベントハンドラ
  if (gameState.currentFloor === 1) {
    eventObj = handleEvent1F(cellType, gameState, context);
  } 
  // 2階イベントハンドラ
  else if (gameState.currentFloor === 2) {
    eventObj = handleEvent2F(cellType, gameState, context);
  }

  if (eventObj && typeof eventObj.run === 'function') {
    isProcessingEvent = true;
    eventObj.run(() => {
      isProcessingEvent = false;
      renderer.render();
    });
  }
}

// フロア移動（1F ↔ 2F）処理
function changeFloor(floor) {
  gameState.currentFloor = floor;
  if (floor === 2) {
    gameState.currentMap = map2F;
    gameState.player.x = playerStart2F.x;
    gameState.player.y = playerStart2F.y;
    gameState.player.dir = playerStart2F.dir;
    showMessageDialog("【2階 非常階段前】\n2階へ到達した。薄暗い廊下に不気味な気配が漂っている……", () => {
      renderer.render();
    });
  } else if (floor === 1) {
    gameState.currentMap = map1F;
    gameState.player.x = playerStart1F.x;
    gameState.player.y = playerStart1F.y;
    gameState.player.dir = playerStart1F.dir;
    renderer.render();
  }
}

// ESCキー / ボタン：アプリ表示（※血の池イベントクリア後のみ解放）
function toggleAppUI() {
  if (!gameState.hasExorcistInherited) {
    showMessageDialog("【スマホ】\nまだ『悪魔辞典アプリ』を入手していない……。", () => {});
    return;
  }

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
      info.innerHTML = `階層: ${gameState.currentFloor}F<br>座標 (X:${p.x}, Y:${p.y})<br>向き: ${p.dir} (0:北,1:東,2:南,3:西)<br>Lv: ${p.level} | HP: ${p.hp}/${p.maxHp} | SIN: ${p.sin}`;
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