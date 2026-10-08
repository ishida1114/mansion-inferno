// main.js - 3Dレンダラー統合＆査問引数ミスマッチ解消完全版

import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';
import { map2F, playerStart2F, handleEvent2F, check2FRandomEncounter } from './maps/map2F.js';
import { showMessageDialog, openCombatUI, openInquisitionUI } from './ui.js';

let appUI;
let renderer;
let isRunning = false;
let isProcessingEvent = false;

function isActionBlocked() {
    if (window.lastDialogCloseTime && (Date.now() - window.lastDialogCloseTime < 400)) {
        return true; 
    }
    return false;
}

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
      return;
    } 
    
    if (target.id === 'btn-load' || target.closest('#btn-load')) {
      const hasSave = gameState.loadGame();
      if (hasSave) {
        const titleScreen = document.getElementById('title-screen');
        if (titleScreen) titleScreen.classList.add('hidden');
        resumeGame();
      } else {
        alert('保存されたセーブデータが見つかりませんでした。');
      }
      return;
    }

    if (isProcessingEvent || isActionBlocked()) return;

    const id = target.id;
    if (id === 'btn-up') moveForward();
    else if (id === 'btn-down') moveBackward();
    else if (id === 'btn-left') { gameState.player.dir = (gameState.player.dir + 3) % 4; redraw(); }
    else if (id === 'btn-right') { gameState.player.dir = (gameState.player.dir + 1) % 4; redraw(); }
    else if (id === 'btn-action') interactFrontCell();
    else if (id === 'btn-app-toggle') toggleAppUI();
    else if (id === 'btn-close-debug') toggleDebugUI();
  });

  window.onkeydown = (e) => {
    if (isProcessingEvent || isActionBlocked()) return;

    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': moveForward(); break;
      case 'ArrowDown': case 's': case 'S': moveBackward(); break;
      case 'ArrowLeft': case 'a': case 'A': gameState.player.dir = (gameState.player.dir + 3) % 4; redraw(); break;
      case 'ArrowRight': case 'd': case 'D': gameState.player.dir = (gameState.player.dir + 1) % 4; redraw(); break;
      case ' ': case 'Spacebar': e.preventDefault(); interactFrontCell(); break;
      case 'Escape': toggleAppUI(); break;
      case 'F2': e.preventDefault(); toggleDebugUI(); break;
    }
  };
}

function startNewGame() {
  gameState.resetGame();
  gameState.currentFloor = 1;
  gameState.currentMap = map1F;
  gameState.player.x = playerStart1F.x;
  gameState.player.y = playerStart1F.y;
  gameState.player.dir = playerStart1F.dir;

  const container = document.getElementById('app-ui-container');
  if (container) container.classList.add('hidden');

  document.getElementById('touch-controls')?.classList.remove('hidden');

  if (!isRunning) {
    isRunning = true;
    gameLoop();
  }
}

function resumeGame() {
  const container = document.getElementById('app-ui-container');
  if (container) container.classList.add('hidden');

  document.getElementById('touch-controls')?.classList.remove('hidden');

  if (!isRunning) {
    isRunning = true;
    gameLoop();
  }
}

function redraw() {
    if (renderer) renderer.render();
}

function gameLoop() {
  if (isRunning) {
    redraw();
    requestAnimationFrame(gameLoop);
  }
}

function interactFrontCell() {
  if (isProcessingEvent || isActionBlocked()) return;

  const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const vec = dirVectors[gameState.player.dir];
  const frontX = gameState.player.x + vec.x;
  const frontY = gameState.player.y + vec.y;

  const map = gameState.currentMap;
  if (!map || !map[frontY]) return;

  const cellType = map[frontY][frontX];
  if (!cellType || cellType === 0 || cellType === 1) return;

  // ★ openInquisitionUI に渡す引数を正確に転送するように修正
  const context = {
    changeFloor: (floor) => { changeFloor(floor); },
    redraw: () => redraw(),
    openLoadoutApp: () => {
      appUI.currentSubView = 'loadout';
      appUI.renderApp();
      const container = document.getElementById('app-ui-container');
      if (container) container.classList.remove('hidden');
    },
    openInquisitionUI: (entity, gState, cb, ctxObj) => {
      const callbackFunc = typeof gState === 'function' ? gState : cb;
      openInquisitionUI(entity, gameState, (result) => {
        if (typeof callbackFunc === 'function') callbackFunc(result);
      }, ctxObj || context);
    }
  };

  let eventObj = null;

  if (gameState.currentFloor === 1) {
    eventObj = handleEvent1F(cellType, gameState, context);
  } else if (gameState.currentFloor === 2) {
    eventObj = handleEvent2F(cellType, gameState, context);
  }

  if (eventObj && typeof eventObj.run === 'function') {
    isProcessingEvent = true;
    eventObj.run(() => {
      isProcessingEvent = false;
      redraw();
    });
  }
}

function changeFloor(floor) {
  gameState.currentFloor = floor;
  if (floor === 2) {
    gameState.currentMap = map2F;
    gameState.player.x = playerStart2F.x;
    gameState.player.y = playerStart2F.y;
    gameState.player.dir = playerStart2F.dir;
    showMessageDialog("【2階 非常階段前】\n2階へ到達した。不気味な足音が暗闇から聞こえる……", () => {
      redraw();
    });
  } else if (floor === 1) {
    gameState.currentMap = map1F;
    gameState.player.x = playerStart1F.x;
    gameState.player.y = playerStart1F.y;
    gameState.player.dir = playerStart1F.dir;
    redraw();
  }
}

function toggleAppUI() {
  if (!gameState.hasExorcistInherited) {
    showMessageDialog("【スマホ】\nまだ『悪魔辞典アプリ』を入手していない……。", () => {});
    return;
  }

  const container = document.getElementById('app-ui-container');
  if (container) {
    const isHidden = container.classList.contains('hidden');
    if (isHidden) {
      appUI.currentSubView = 'home';
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
      info.innerHTML = `階層: ${gameState.currentFloor}F<br>座標 (X:${p.x}, Y:${p.y})<br>向き: ${p.dir} (0:北,1:東,2:南,3:西)<br>Lv: ${p.level} | HP: ${p.hp}/${p.maxHp} | 罪: ${p.sin}`;
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
}

function checkEncounterAfterMove() {
  if (gameState.currentFloor === 2) {
    check2FRandomEncounter(gameState, (enemy) => {
      isProcessingEvent = true;
      openCombatUI(enemy, gameState, (result) => {
        isProcessingEvent = false;
        redraw();
      }, { changeFloor });
    });
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
    checkEncounterAfterMove();
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
    checkEncounterAfterMove();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}