// main.js - ゲーム起点処理・タイトル画面遷移・操作イベント（完全版）

import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';

// 1階のダミー/基本マップデータ（0: 通路, 1: 壁）
const DEFAULT_MAP_1F = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

const appUI = new AppUI();

// 画面読み込み完了時の初期化処理
function init() {
  const titleScreen = document.getElementById('title-screen');
  const btnStart = document.getElementById('btn-start');
  const btnLoad = document.getElementById('btn-load');

  // 【1. ゲームスタートボタンのクリック処理】
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      // タイトル画面を非表示にする
      if (titleScreen) titleScreen.classList.add('hidden');
      startNewGame();
    });
  }

  // 【2. つづきからボタンのクリック処理】
  if (btnLoad) {
    btnLoad.addEventListener('click', () => {
      const hasSave = gameState.loadGame();
      if (hasSave) {
        if (titleScreen) titleScreen.classList.add('hidden');
        resumeGame();
      } else {
        alert('保存されたセーブデータが見つかりませんでした。');
      }
    });
  }
}

// 新規ゲーム開始
function startNewGame() {
  gameState.currentFloor = 1;
  gameState.currentMap = DEFAULT_MAP_1F;
  gameState.player.x = 1;
  gameState.player.y = 1;
  gameState.player.dir = 0; // 北向き

  // スマホ画面UIの更新描画
  appUI.renderApp();

  // キーボード移動のイベント登録
  initInputListeners();
}

// セーブデータから再開
function resumeGame() {
  appUI.renderApp();
  initInputListeners();
}

// キーボード移動（矢印キー / WASD）のイベント登録
function initInputListeners() {
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        moveForward();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        // 左回転
        gameState.player.dir = (gameState.player.dir + 3) % 4;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        // 右回転
        gameState.player.dir = (gameState.player.dir + 1) % 4;
        break;
    }
  });
}

// 一歩前進処理
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

// ページ読み込み時に実行
window.addEventListener('DOMContentLoaded', init);