// main.js - 5F正式接続・3F階段着地修正・デバッグ連動 完全版
import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';
import { map2F, playerStart2F, handleEvent2F, check2FRandomEncounter } from './maps/map2F.js';
import { map3F, playerStart3F, handleEvent3F, check3FRandomEncounter } from './maps/map3F.js';
import { map4F, playerStart4F, handleEvent4F, check4FRandomEncounter } from './maps/map4F.js';
import { map5F, playerStart5F, handleEvent5F, check5FRandomEncounter } from './maps/map5F.js';
import { showMessageDialog, showConversationDialog, openCombatUI, openInquisitionUI, showOpeningUI, playVideo } from './ui.js';
import { initDebug } from './debug.js';

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

    if (target.classList.contains('debug-warp-btn')) {
      const floor = parseInt(target.getAttribute('data-floor'));
      if (!isNaN(floor)) {
        debugJumpToFloor(floor);
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

  gameState.markVisited(1, map1F, playerStart1F.x, playerStart1F.y);

  const container = document.getElementById('app-ui-container');
  if (container) container.classList.add('hidden');

  document.getElementById('touch-controls')?.classList.remove('hidden');

  showOpeningUI(() => {
    if (!isRunning) {
      isRunning = true;
      gameLoop();
    } else {
      redraw();
    }
  });
}

function resumeGame() {
  const container = document.getElementById('app-ui-container');
  if (container) container.classList.add('hidden');

  document.getElementById('touch-controls')?.classList.remove('hidden');

  if (gameState.currentMap) {
    gameState.markVisited(gameState.currentFloor, gameState.currentMap, gameState.player.x, gameState.player.y);
  }

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
  } else if (gameState.currentFloor === 3) {
    eventObj = handleEvent3F(cellType, gameState, context);
  } else if (gameState.currentFloor === 4) {
    eventObj = handleEvent4F(cellType, gameState, context);
  } else if (gameState.currentFloor === 5) {
    eventObj = handleEvent5F(cellType, gameState, context);
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

  if (floor === 6) {
    showMessageDialog("【6階への扉】\n重い扉の向こうから邪悪な気配が漂っている……（※開発中）", () => {
      redraw();
    });
  } 
  else if (floor === 5) {
    gameState.currentMap = map5F;
    
    // 4Fから階段で上がってきた場合：北側の階段手前 (X:7, Y:1, 南向き)
    if (gameState.lastTransitMethod === 'stair') {
      gameState.player.x = 7;
      gameState.player.y = 1;
      gameState.player.dir = 2;
    } 
    // エレベーターで上がってきた場合：エレベーター前 (X:6, Y:1, 南向き)
    else if (gameState.lastTransitMethod === 'elevator') {
      gameState.player.x = 6;
      gameState.player.y = 1;
      gameState.player.dir = 2;
    } 
    else {
      gameState.player.x = playerStart5F.x;
      gameState.player.y = playerStart5F.y;
      gameState.player.dir = playerStart5F.dir;
    }

    // 5Fに入った瞬間の自動イベント
    if (!gameState.hasSeen5FIntro) {
      gameState.hasSeen5FIntro = true;
      showMessageDialog(
        "【館内放送・ドクター蛭沼の声】\n「失敗だな、リナからもらった実験体、とても進化とは言えない、醜い、廃棄しなくては……」",
        () => {
          // ワンクッション挟む
          showMessageDialog("【使い魔の気配が強まった！！急速に存在が実体化する兆しを感じる】", () => {
            const prevBg = document.body.style.backgroundColor;
            document.body.style.backgroundColor = "#141418";

            playVideo("assets/videos/blackcat.mp4", () => {
              document.body.style.backgroundColor = prevBg;
              
              if (!gameState.flags) gameState.flags = {};
              gameState.flags.hasCat = true;
              gameState.flags.isCatTrapped = false;

              showMessageDialog(
                "【使い魔の実体化】\n5階に充満する濃厚な生体エネルギーに反応し、主人公の影からすっと黒猫が実体化して現れた！\n（※足元に寄り添い、戦闘中に身を挺して庇ってくれたり、追撃してくれたりするようになった！）",
                () => {
                  redraw();
                }
              );
            });
          });
        }
      );
    } else {
      if (!gameState.isHirunumaDefeated) {
        showMessageDialog("【5階 精神科病棟】\n消毒液と腐敗臭が混ざり合うフロア。異様な唸り声が響いている……", () => {
          redraw();
        });
      } else {
        showMessageDialog("【5階 精神科病棟】\nドクター蛭沼は討滅され、異様な悪臭は静まり返っている……", () => {
          redraw();
        });
      }
    }
  } 
  else if (floor === 4) {
    gameState.currentMap = map4F;
    if (gameState.lastTransitMethod === 'stair_down') {
      gameState.player.x = 5;
      gameState.player.y = 1;
      gameState.player.dir = 2;
      showMessageDialog("【4階 非常階段前】\n5階から4階へ降りてきた……。", () => {
        redraw();
      });
    } else {
      gameState.player.x = playerStart4F.x;
      gameState.player.y = playerStart4F.y;
      gameState.player.dir = playerStart4F.dir;
      if (!gameState.flags || !gameState.flags.cleared4F) {
        showConversationDialog("assets/images/demon/4f-rina.jpg", "【色欲・リナ】\n「あら、私は『色欲』のリナ……私を助けて、強いひと」", () => {
          redraw();
        });
      } else {
        showMessageDialog("【4階 非常階段前】\n4階へ到達した。桃色の霧は完全に消え去っている……", () => {
          redraw();
        });
      }
    }
  } 
  else if (floor === 3) {
    gameState.currentMap = map3F;
    if (gameState.lastTransitMethod === 'stair_down') {
      gameState.player.x = 5;
      gameState.player.y = 1;
      gameState.player.dir = 2;
      showMessageDialog("【3階 非常階段前】\n4階から3階へ降りてきた。漂うヘドロと強烈な異臭が鼻をつく……", () => {
        redraw();
      });
    } else {
      gameState.player.x = playerStart3F.x;
      gameState.player.y = playerStart3F.y;
      gameState.player.dir = playerStart3F.dir;
      showMessageDialog("【3階 エレベーター前】\n3階へ到着した。漂うヘドロと強烈な異臭が鼻をつく……", () => {
        redraw();
      });
    }
  } 
  else if (floor === 2) {
    gameState.currentMap = map2F;
    gameState.player.x = playerStart2F.x;
    gameState.player.y = playerStart2F.y;
    gameState.player.dir = playerStart2F.dir;
    showMessageDialog("【2階 非常階段前】\n2階へ到達した。不気味な足音が暗闇から聞こえる……", () => {
      redraw();
    });
  } 
  else if (floor === 1) {
    gameState.currentMap = map1F;
    if (gameState.lastTransitMethod === 'elevator') {
      gameState.player.x = 6;
      gameState.player.y = 1;
      gameState.player.dir = 0;
    } else {
      gameState.player.x = playerStart1F.x;
      gameState.player.y = playerStart1F.y;
      gameState.player.dir = playerStart1F.dir;
    }
  }

  if (gameState.currentMap) {
    gameState.markVisited(floor, gameState.currentMap, gameState.player.x, gameState.player.y);
  }
  redraw();
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
      info.innerHTML = `
        <div style="font-weight:bold; color:#ffdd66; margin-bottom:5px;">【デバッグ・テストモード】</div>
        階層: ${gameState.currentFloor}F | 座標: (X:${p.x}, Y:${p.y}) | 向き: ${p.dir}<br>
        Lv: ${p.level} | HP: ${p.hp}/${p.maxHp} | 💰${p.money} | Sin: ${p.sin}
        <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap;">
            <button class="debug-warp-btn" data-floor="1" style="background:#333; color:#fff; border:1px solid #777; padding:4px 8px; cursor:pointer; font-size:11px;">1Fワープ</button>
            <button class="debug-warp-btn" data-floor="2" style="background:#550000; color:#ffdd66; border:1px solid #ff3333; padding:4px 8px; cursor:pointer; font-size:11px;">2Fワープ(Lv5)</button>
            <button class="debug-warp-btn" data-floor="3" style="background:#550000; color:#ffdd66; border:1px solid #ff3333; padding:4px 8px; cursor:pointer; font-size:11px;">3Fワープ(Lv10)</button>
            <button class="debug-warp-btn" data-floor="4" style="background:#550000; color:#ffdd66; border:1px solid #ff3333; padding:4px 8px; cursor:pointer; font-size:11px;">4Fテスト開始(3F前)</button>
            <button class="debug-warp-btn" data-floor="5" style="background:#550000; color:#ffdd66; border:1px solid #ff3333; padding:4px 8px; cursor:pointer; font-size:11px;">5Fワープ(Lv20)</button>
        </div>
      `;
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
}

function debugJumpToFloor(floor) {
  if (!gameState.flags) gameState.flags = {};

  gameState.hasExorcistInherited = true;
  gameState.hasModelGun = true;
  gameState.player.hasModelGun = true;
  gameState.cards = ["1Card.png","2Card.png","3Card.png","4Card.png","5Card.png","6Card.png","7Card.png","8Card.png","9Card.png"];

  if (floor === 1) {
    gameState.player.level = 1;
    gameState.player.maxHp = 20;
    gameState.player.hp = 20;
    gameState.player.def = 0;
    gameState.player.agi = 5;
    gameState.player.money = 0;
    gameState.currentFloor = 1;
    gameState.currentMap = map1F;
    gameState.player.x = playerStart1F.x;
    gameState.player.y = playerStart1F.y;
    gameState.player.dir = playerStart1F.dir;
  } else if (floor === 2) {
    gameState.player.level = 5;
    gameState.player.maxHp = 50;
    gameState.player.hp = 50;
    gameState.player.def = 2;
    gameState.player.agi = 8;
    gameState.player.money = 1000;
    gameState.hasKey2F = true;
    gameState.currentFloor = 2;
    gameState.currentMap = map2F;
    gameState.player.x = playerStart2F.x;
    gameState.player.y = playerStart2F.y;
    gameState.player.dir = playerStart2F.dir;
  } else if (floor === 3) {
    gameState.player.level = 10;
    gameState.player.maxHp = 80;
    gameState.player.hp = 80;
    gameState.player.def = 4;
    gameState.player.agi = 10;
    gameState.player.money = 3000;
    gameState.hasKey2F = true;
    gameState.hasElevatorKey = true;
    gameState.flags.cleared2F = true;
    gameState.flags.hasSanadaRoomKey = true;
    gameState.currentFloor = 3;
    gameState.currentMap = map3F;
    gameState.player.x = playerStart3F.x;
    gameState.player.y = playerStart3F.y;
    gameState.player.dir = playerStart3F.dir;
  } else if (floor === 4) {
    gameState.player.level = 15;
    gameState.player.maxHp = 120;
    gameState.player.hp = 120;
    gameState.player.def = 6;
    gameState.player.agi = 12;
    gameState.player.money = 5000;
    gameState.hasKey2F = true;
    gameState.hasElevatorKey = true;
    gameState.flags.cleared2F = true;
    gameState.flags.cleared3F = true;
    
    gameState.flags.hasBrandBag = false;   
    gameState.flags.hasChampagne = false;  
    gameState.flags.defeatedShineiA = false;
    gameState.flags.defeatedShineiB = false;
    gameState.flags.cleared4F = false;

    gameState.currentFloor = 3;
    gameState.currentMap = map3F;
    gameState.player.x = 5;
    gameState.player.y = 1;
    gameState.player.dir = 0;
  } else if (floor === 5) {
    gameState.player.level = 20;
    gameState.player.maxHp = 160;
    gameState.player.hp = 160;
    gameState.player.def = 8;
    gameState.player.agi = 15;
    gameState.player.money = 8000;
    gameState.hasKey2F = true;
    gameState.hasElevatorKey = true;
    gameState.flags.cleared2F = true;
    gameState.flags.cleared3F = true;
    gameState.flags.cleared4F = true;
    gameState.flags.cleared5F = false;

    gameState.currentFloor = 5;
    gameState.currentMap = map5F;
    gameState.player.x = playerStart5F.x;
    gameState.player.y = playerStart5F.y;
    gameState.player.dir = playerStart5F.dir;
  }

  gameState.updateEquippedCards();
  if (gameState.currentMap) {
    gameState.markVisited(gameState.currentFloor, gameState.currentMap, gameState.player.x, gameState.player.y);
  }

  toggleDebugUI();
  toggleDebugUI();

  redraw();
}

function checkEncounterAfterMove() {
  const handleBattleResult = (result) => {
    isProcessingEvent = false;
    if (result === 'defeat') {
      changeFloor(1);
      let deathMsg = "";
      if (gameState.lastTransitMethod === 'elevator') {
        deathMsg = "チーン……という電子音でハッと目を覚ました。\n悪魔に弾き飛ばされ、自動で1階のエレベーター前まで送り返されたようだ……。";
      } else {
        deathMsg = "重い衝撃とともに目を覚ました……。\n意識を失う寸前、必死で1階の非常階段前まで転がり落ちてきたようだ。";
      }
      showMessageDialog(deathMsg, () => {
        redraw();
      });
    } else {
      redraw();
    }
  };

  if (gameState.currentFloor === 2) {
    check2FRandomEncounter(gameState, (enemy) => {
      isProcessingEvent = true;
      openCombatUI(enemy, gameState, handleBattleResult, { changeFloor });
    });
  } else if (gameState.currentFloor === 3) {
    check3FRandomEncounter(gameState, (enemy) => {
      isProcessingEvent = true;
      openCombatUI(enemy, gameState, handleBattleResult, { changeFloor });
    });
  } else if (gameState.currentFloor === 4) {
    check4FRandomEncounter(gameState, (enemy) => {
      isProcessingEvent = true;
      openCombatUI(enemy, gameState, handleBattleResult, { changeFloor });
    });
  } else if (gameState.currentFloor === 5) {
    if (typeof check5FRandomEncounter === 'function') {
      check5FRandomEncounter(gameState, (enemy) => {
        isProcessingEvent = true;
        openCombatUI(enemy, gameState, handleBattleResult, { changeFloor });
      });
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
    gameState.markVisited(gameState.currentFloor, map, nextX, nextY);
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
    gameState.markVisited(gameState.currentFloor, map, nextX, nextY);
    checkEncounterAfterMove();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

initDebug(gameState, { 
  changeFloor: typeof changeFloor === 'function' ? changeFloor : null, 
  redraw: typeof redraw === 'function' ? redraw : null 
});