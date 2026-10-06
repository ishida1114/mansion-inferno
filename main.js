// main.js - ゲーム起点処理・タイトル画面遷移・操作イベント・描画ループ（完全版）

import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';

// 1階の基本マップデータ（0: 通路, 1: 壁）
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

// 初期化処理（ボタンイベントの登録）
function init() {
  const titleScreen = document.getElementById('title-screen');
  const btnStart = document.getElementById('btn-start');
  const btnLoad = document.getElementById('btn-load');

  // スタートボタンの処理
  if (btnStart) {
    btnStart.onclick = () => {
      if (titleScreen) titleScreen.classList.add('hidden');
      startNewGame();
    };
  }

  // つづきからボタンの処理
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
  gameState.currentMap = DEFAULT_MAP_1F;
  gameState.player.x = 1;
  gameState.player.y = 1;
  gameState.player.dir = 1; // 東向き

  appUI.renderApp();
  initInputListeners();

  // 3Dダンジョン描画ループをスタート
  if (!isRunning) {
    isRunning = true;
    gameLoop();
  }
}

// つづきから開始
function resumeGame() {
  appUI.renderApp();
  initInputListeners();

  if (!isRunning) {
    isRunning = true;
    gameLoop();
  }
}

// 毎フレーム3D画面を描画するループ関数
function gameLoop() {
  if (isRunning) {
    renderer.render(); // 画面描画
    requestAnimationFrame(gameLoop);
  }
}

// 移動操作イベント（矢印キー / WASD）
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
        // 左に90度回転
        gameState.player.dir = (gameState.player.dir + 3) % 4;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        // 右に90度回転
        gameState.player.dir = (gameState.player.dir + 1) % 4;
        break;
    }
  };
}

// 一歩前進
function moveForward() {
  const dirVectors = [
    { x: 0, y: -1 }, // 0: 北
    { x: 1, y: 0 },  // 1: 東
    { x: 0, y: 1 },  // 2: 南
    { x: -1, y: 0 }  // 3: 西
  ];
  const vec = dirVectors[gameState.player.dir];
  const nextX = gameState.player.x + vec.x;
  const nextY = gameState.player.y + vec.y;

  const map = gameState.currentMap;
  if (map && map[nextY] && map[nextY][nextX] === 0) {
    gameState.player.x = nextX;
    gameState.player.y = nextY;
  }
}

// 一歩後退
function moveBackward() {
  const dirVectors = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ];
  const vec = dirVectors[gameState.player.dir];
  const nextX = gameState.player.x - vec.x;
  const nextY = gameState.player.y - vec.y;

  const map = gameState.currentMap;
  if (map && map[nextY] && map[nextY][nextX] === 0) {
    gameState.player.x = nextX;
    gameState.player.y = nextY;
  }
}

// DOMの読み込み状況に関わらず確実に初期化を呼び出す
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}