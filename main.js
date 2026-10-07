// main.js - 移動・イベント制御・エンカウント査問遷移完全連動版

import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';
import { map2F, playerStart2F, handleEvent2F, check2FRandomEncounter } from './maps/map2F.js';
import { showMessageDialog, openInquisitionUI } from './ui.js';

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

    if (isProcessingEvent) return;

    const id = target.id;
    if (id === 'btn-up') moveForward();
    else if (id === 'btn-down') moveBackward();
    else if (id === 'btn-left') gameState.player.dir = (gameState.player.dir + 3) % 4;
    else if (id === 'btn-right') gameState.player.dir = (gameState.player.dir + 1) % 4;
    else if (id === 'btn-action') interactFrontCell();
    else if (id === 'btn-app-toggle') toggleAppUI();
    else if (id === 'btn-close-debug') toggleDebugUI();
  });

  window.onkeydown = (e) => {
    if (isProcessingEvent) return;

    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': moveForward(); break;
      case 'ArrowDown': case 's': case 'S': moveBackward(); break;
      case 'ArrowLeft': case 'a': case 'A': gameState.player.dir = (gameState.player.dir + 3) % 4; break;
      case 'ArrowRight': case 'd': case 'D': gameState.player.dir = (gameState.player.dir + 1) % 4; break;
      case ' ': case 'Spacebar': e.preventDefault(); interactFrontCell(); break;
      case 'Escape': toggleAppUI(); break;
      case 'F2': e.preventDefault(); toggleDebugUI(); break;
    }
  };
}

function startNewGame() {
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

function gameLoop() {
  if (isRunning) {
    renderer.render();
    requestAnimationFrame(gameLoop);
  }
}

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
    changeFloor: (floor) => { changeFloor(floor); },
    redraw: () => renderer.render()
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
      renderer.render();
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
    showMessageDialog("【2階 非常階段前】\n2階へ到達した。廊下に人ならざる者の禍々しい気が満ちている……", () => {
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
      info.innerHTML = `階層: ${gameState.currentFloor}F<br>座標 (X:${p.x}, Y:${p.y})<br>向き: ${p.dir} (0:北,1:東,2:南,3:西)<br>Lv: ${p.level} | HP: ${p.hp}/${p.maxHp} | 罪: ${p.sin}`;
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
}

// ★ 2階での悪魔遭遇時：ただのテキストで終わらせず、査問画面（openInquisitionUI）を発火！
function checkEncounterAfterMove() {
  if (gameState.currentFloor === 2) {
    check2FRandomEncounter(gameState, () => {
      isProcessingEvent = true;
      const enemy = {
        name: "一般階の悪魔（覗き魔の影）",
        type: "demon",
        image: "assets/images/demon/2f-kageyama.mp4",
        weaknesses: [1, 2]
      };
      
      openInquisitionUI(enemy, gameState, (result) => {
        if (result === "combat") {
          showMessageDialog("【戦闘開始】\n正体を見破られた悪魔が襲いかかってきた！（敗走チュートリアル）\n……圧倒的な力に押し潰され、1階へ死に戻った！", () => {
            gameState.player.hp = gameState.player.maxHp;
            changeFloor(1);
            isProcessingEvent = false;
          });
        } else {
          isProcessingEvent = false;
          renderer.render();
        }
      });
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