// main.js - ゲーム本体コアコントローラー（デバッグ完全分離・7F-BGM対応・本編軽量版）
import { gameState } from './gameState.js';
import { AppUI } from './appUI.js';
import { Renderer } from './renderer.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';
import { map2F, playerStart2F, handleEvent2F, check2FRandomEncounter } from './maps/map2F.js';
import { map3F, playerStart3F, handleEvent3F, check3FRandomEncounter } from './maps/map3F.js';
import { map4F, playerStart4F, handleEvent4F, check4FRandomEncounter } from './maps/map4F.js';
import { map5F, playerStart5F, handleEvent5F, check5FRandomEncounter } from './maps/map5F.js';
import { map6F, playerStart6F, handleEvent6F, check6FRandomEncounter } from './maps/map6F.js';
import { map7F, playerStart7F, handleEvent7F, check7FRandomEncounter } from './maps/map7F.js';
import { map8F, playerStart8F, handleEvent8F, check8FRandomEncounter } from './maps/map8F.js';

import { showMessageDialog, showConversationDialog, openCombatUI, openInquisitionUI, showOpeningUI, playVideo } from './ui.js';
import { initDebug } from './debug.js';
import { sound } from './sound.js';

let appUI;
let renderer;
let isRunning = false;
let isProcessingEvent = false;

// ★ フロアに応じたBGMを再生する関数
function playFloorBGM(floor) {
  if (floor === 7) {
    sound.playBGM("assets/audio/bgm/7thfloor.mp3");
  } else {
    sound.playBGM("assets/audio/bgm/field.mp3");
  }
}

function isActionBlocked() {
  if (window.lastDialogCloseTime && (Date.now() - window.lastDialogCloseTime < 400)) return true; 
  return false;
}

// 1F帰還用グローバル関数
window.executeReturnTo1F = () => {
  document.getElementById('app-ui-container')?.classList.add('hidden');
  gameState.lastTransitMethod = 'elevator';
  changeFloor(1);
  setTimeout(() => {
    showMessageDialog("【帰還の札】\n不思議な光に包まれ、瞬時に 1階 のエレベーター前へ帰還した！", () => redraw());
  }, 100);
};

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
    }
  };
}

function startNewGame() {
  sound.playBGM("assets/audio/bgm/opening.mp3");
  gameState.resetGame();
  gameState.currentFloor = 1;
  gameState.currentMap = map1F;
  gameState.player.x = playerStart1F.x;
  gameState.player.y = playerStart1F.y;
  gameState.player.dir = playerStart1F.dir;
  gameState.markVisited(1, map1F, playerStart1F.x, playerStart1F.y);
  document.getElementById('app-ui-container')?.classList.add('hidden');
  document.getElementById('touch-controls')?.classList.remove('hidden');

  showOpeningUI(() => {
    if (!isRunning) { isRunning = true; gameLoop(); } else { redraw(); }
    showMessageDialog("眼前に2Fへの非常口がある。\n右下の『調べる（SPACE）』で調べてみよう。", () => {
      redraw();
    });
  });
}

function resumeGame() {
  playFloorBGM(gameState.currentFloor);
  document.getElementById('app-ui-container')?.classList.add('hidden');
  document.getElementById('touch-controls')?.classList.remove('hidden');
  if (gameState.currentMap) gameState.markVisited(gameState.currentFloor, gameState.currentMap, gameState.player.x, gameState.player.y);
  if (!isRunning) { isRunning = true; gameLoop(); }
}

function redraw() { if (renderer) renderer.render(); }
function gameLoop() { if (isRunning) { redraw(); requestAnimationFrame(gameLoop); } }

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
      document.getElementById('app-ui-container')?.classList.remove('hidden');
    },
    openInquisitionUI: (entity, gState, cb, ctxObj) => {
      const callbackFunc = typeof gState === 'function' ? gState : cb;
      openInquisitionUI(entity, gameState, (result) => {
        if (typeof callbackFunc === 'function') callbackFunc(result);
      }, ctxObj || context);
    }
  };

  let eventObj = null;
  if (gameState.currentFloor === 1) eventObj = handleEvent1F(cellType, gameState, context);
  else if (gameState.currentFloor === 2) eventObj = handleEvent2F(cellType, gameState, context);
  else if (gameState.currentFloor === 3) eventObj = handleEvent3F(cellType, gameState, context);
  else if (gameState.currentFloor === 4) eventObj = handleEvent4F(cellType, gameState, context);
  else if (gameState.currentFloor === 5) eventObj = handleEvent5F(cellType, gameState, context);
  else if (gameState.currentFloor === 6) eventObj = handleEvent6F(cellType, gameState, context);
  else if (gameState.currentFloor === 7) eventObj = handleEvent7F(cellType, gameState, context);
  else if (gameState.currentFloor === 8) eventObj = handleEvent8F(cellType, gameState, context);

  if (eventObj && typeof eventObj.run === 'function') {
    isProcessingEvent = true;
    eventObj.run(() => { isProcessingEvent = false; redraw(); });
  }
}

function changeFloor(floor) {
  gameState.currentFloor = floor;
  playFloorBGM(floor);

  if (floor === 8) {
    gameState.currentMap = map8F;
    gameState.player.x = playerStart8F.x;
    gameState.player.y = playerStart8F.y;
    gameState.player.dir = playerStart8F.dir;
    showMessageDialog("【8階 最上階：悪魔王の祭壇】\n窓の外には街の夜景が広がり、不吉な魔力の稲妻が走っている……。\n奥から、狂気じみた演説の声が響き渡っている。", () => redraw());
  }
  else if (floor === 7) {
    gameState.currentMap = map7F;
    if (gameState.lastTransitMethod === 'stair_down') {
      gameState.player.x = 3;
      gameState.player.y = 1;
      gameState.player.dir = 2;
      showMessageDialog("【7階 VIPラウンジ】\n8階から降りてきた。ペントハウスの静寂が広がっている……。", () => redraw());
    } else if (gameState.lastTransitMethod === 'stairs') {
      gameState.player.x = playerStart7F.x;
      gameState.player.y = playerStart7F.y;
      gameState.player.dir = playerStart7F.dir;
    } else {
      gameState.player.x = playerStart7F.x;
      gameState.player.y = playerStart7F.y;
      gameState.player.dir = playerStart7F.dir;
    }
    
    if (!gameState.flags) gameState.flags = {};
    if (!gameState.flags.seen7FIntro && gameState.lastTransitMethod !== 'stair_down') {
      gameState.flags.seen7FIntro = true;
      showMessageDialog("【7階 VIPラウンジ】\n豪華なレッドカーペットと白大理石の廊下。空気が金と欲望の匂いで充満している……。", () => {
        showConversationDialog("assets/images/demon/7f-shiratori.png", "【館内放送・マダム白鳥】\n「あぁら、また小汚い庶民が迷い込んだの？ 庶民の匂いは本当に吐き気がするわね。\n……まさか、一階でくたばった『あの神父』の仇でも取りに来たつもり？\nアハハ！ 傑作ね！ あんな男、私がちょっと札束を積んで『私の専属になりなさい』って言ってやったら、偉そうに説教なんて始めて……\nだから御堂先生にお願いして、ちょっと『再教育』してもらったの。今頃、泥水の中で惨めな姿になってるでしょうね。\nいいこと？ このマンションの住人も、迷い込んだ愚か者も、ぜーんぶ私の『資産』よ。命の価値なんてね、通帳の残高で決まるの。\nあなたの残高いくらかしら？\n精々、私のペットたちの餌になって、少しでも私の利益に貢献しなさいな。失せな！」", () => redraw());
      });
    } else if (gameState.lastTransitMethod !== 'stair_down') {
      showMessageDialog("【7階 VIPラウンジ】\n豪華なレッドカーペットと白大理石の廊下。すさまじく圧迫感があるおぞましい成金趣味だ……", () => redraw());
    }
  }
  else if (floor === 6) {
    gameState.currentMap = map6F;
    if (gameState.lastTransitMethod === 'stair_down') {
      gameState.player.x = 5;
      gameState.player.y = 1; 
      gameState.player.dir = 2; 
      showMessageDialog("【6階 非常階段前】\n7階から6階へ降りてきた……。", () => redraw());
    } else {
      gameState.player.x = 5;
      gameState.player.y = 8;
      gameState.player.dir = 0; 
      showMessageDialog("【6階 非常階段前】\n6階へ到達した。冷たい蜘蛛の糸がまとわりつく……", () => redraw());
    }
  }
  else if (floor === 5) {
    gameState.currentMap = map5F;
    if (gameState.lastTransitMethod === 'stair_down') {
      gameState.player.x = 7; gameState.player.y = 7; gameState.player.dir = 0;
      showMessageDialog("【5階 非常階段前】\n6階から5階へ降りてきた……。", () => redraw());
    } else if (gameState.lastTransitMethod === 'elevator') {
      gameState.player.x = 6; gameState.player.y = 1; gameState.player.dir = 2;
    } else {
      gameState.player.x = playerStart5F.x; gameState.player.y = playerStart5F.y; gameState.player.dir = playerStart5F.dir;
    }

    if (gameState.lastTransitMethod !== 'stair_down') {
      if (!gameState.hasSeen5FIntro) {
        gameState.hasSeen5FIntro = true;
        showMessageDialog("【館内放送・ドクター蛭沼の声】\n「失敗だな、リナからもらった実験体、とても進化とは言えない、醜い、廃棄しなくては……」", () => {
          showMessageDialog("【使い魔の気配が強まった！！急速に存在が実体化する兆しを感じる】", () => {
            const prevBg = document.body.style.backgroundColor; document.body.style.backgroundColor = "#141418";
            playVideo("assets/videos/blackcat.mp4", () => {
              document.body.style.backgroundColor = prevBg;
              if (!gameState.flags) gameState.flags = {};
              gameState.flags.hasCat = true; gameState.flags.isCatTrapped = false;
              showMessageDialog("【使い魔の実体化】\n5階に充満する濃厚な生体エネルギーに反応し、主人公の影からすっと黒猫が実体化して現れた！\n（※足元に寄り添い、戦闘中に身を挺して庇ってくれたり、追撃してくれたりするようになった！）", () => redraw());
            });
          });
        });
      } else {
        showMessageDialog(gameState.isHirunumaDefeated ? "【5階 精神科病棟】\nドクター蛭沼は討滅され、異様な悪臭は静まり返っている……" : "【5階 精神科病棟】\n消毒液と腐敗臭が混ざり合うフロア。異様な唸り声が響いている……", () => redraw());
      }
    }
  } 
  else if (floor === 4) {
    gameState.currentMap = map4F;
    if (gameState.lastTransitMethod === 'stair_down') {
      gameState.player.x = 5; gameState.player.y = 1; gameState.player.dir = 2;
      showMessageDialog("【4階 非常階段前】\n5階から4階へ降りてきた……。", () => redraw());
    } else {
      gameState.player.x = playerStart4F.x; gameState.player.y = playerStart4F.y; gameState.player.dir = playerStart4F.dir;
      if (!gameState.flags || !gameState.flags.cleared4F) {
        showConversationDialog("assets/images/demon/4f-rina.jpg", "【色欲・リナ】\n「あら、私はリナちゃん……私も悪魔に取り憑かれたの、苦しいの、つらいの、私を助けて、強いひと」\n主人公（なんだ、今のは…いや、そんなことより父親だ、まずは父親を探さなくては…）", () => redraw());
      } else {
        showMessageDialog("【4階 非常階段前】\n4階へ到達した。桃色の霧は完全に消え去っている……", () => redraw());
      }
    }
  } 
  else if (floor === 3) {
    gameState.currentMap = map3F;
    if (!gameState.flags) gameState.flags = {};

    if (gameState.lastTransitMethod === 'stair_down') {
      gameState.player.x = 5; gameState.player.y = 1; gameState.player.dir = 2;
      showMessageDialog("【3階 非常階段前】\n4階から3階へ降りてきた。漂うヘドロと強烈な異臭が鼻をつく……", () => redraw());
    } else {
      gameState.player.x = playerStart3F.x; gameState.player.y = playerStart3F.y; gameState.player.dir = playerStart3F.dir;
      
      if (!gameState.flags.seen3FIntro) {
        gameState.flags.seen3FIntro = true;
        showMessageDialog("【3階 エレベーター前】\n3階へ到着した。漂うヘドロと強烈な異臭が鼻をつく……\n\n「父親が、ここにいる、のか…？ なんだこの強烈な臭いは…」", () => redraw());
      } else {
        showMessageDialog("【3階 エレベーター前】\n3階へ到着した。漂うヘドロと強烈な異臭が鼻をつく……", () => redraw());
      }
    }
  } 
  else if (floor === 2) {
    gameState.currentMap = map2F;
    gameState.player.x = playerStart2F.x; gameState.player.y = playerStart2F.y; gameState.player.dir = playerStart2F.dir;
    showMessageDialog("【2階 非常階段前】\n2階へ到達した。不気味な足音が暗闇から聞こえる……", () => redraw());
  } 
  else if (floor === 1) {
    gameState.currentMap = map1F;
    if (gameState.lastTransitMethod === 'elevator') {
      gameState.player.x = 6; gameState.player.y = 1; gameState.player.dir = 0;
    } else {
      gameState.player.x = playerStart1F.x; gameState.player.y = playerStart1F.y; gameState.player.dir = playerStart1F.dir;
    }
  }

  if (gameState.currentMap) gameState.markVisited(floor, gameState.currentMap, gameState.player.x, gameState.player.y);
  redraw();
}

function toggleAppUI() {
  if (!gameState.hasExorcistInherited) { showMessageDialog("【スマホ】\nまだ『悪魔辞典アプリ』を入手していない……。", () => {}); return; }
  const container = document.getElementById('app-ui-container');
  if (container) {
    if (container.classList.contains('hidden')) { appUI.currentSubView = 'home'; appUI.renderApp(); container.classList.remove('hidden'); }
    else { container.classList.add('hidden'); }
  }
}

function checkEncounterAfterMove() {
  const handleBattleResult = (result) => {
    isProcessingEvent = false;
    if (result === 'defeat') {
      changeFloor(1);
      showMessageDialog(gameState.lastTransitMethod === 'elevator' ? "チーン……という電子音でハッと目を覚ました。\n悪魔に弾き飛ばされ、自動で1階のエレベーター前まで送り返されたようだ……。" : "重い衝撃とともに目を覚ました……。\n意識を失う寸前、必死で1階の非常階段前まで転がり落ちてきたようだ。", () => redraw());
    } else { redraw(); }
  };

  if (gameState.currentFloor === 2) { check2FRandomEncounter(gameState, (enemy) => { isProcessingEvent = true; openCombatUI(enemy, gameState, handleBattleResult, { changeFloor }); }); }
  else if (gameState.currentFloor === 3) { check3FRandomEncounter(gameState, (enemy) => { isProcessingEvent = true; openCombatUI(enemy, gameState, handleBattleResult, { changeFloor }); }); }
  else if (gameState.currentFloor === 4) { check4FRandomEncounter(gameState, (enemy) => { isProcessingEvent = true; openCombatUI(enemy, gameState, handleBattleResult, { changeFloor }); }); }
  else if (gameState.currentFloor === 5) { if (typeof check5FRandomEncounter === 'function') check5FRandomEncounter(gameState, (enemy) => { isProcessingEvent = true; openCombatUI(enemy, gameState, handleBattleResult, { changeFloor }); }); }
  else if (gameState.currentFloor === 6) { if (typeof check6FRandomEncounter === 'function') check6FRandomEncounter(gameState, (enemy) => { if (enemy) { isProcessingEvent = true; openCombatUI(enemy, gameState, handleBattleResult, { changeFloor }); } else { redraw(); } }); }
  else if (gameState.currentFloor === 7) { if (typeof check7FRandomEncounter === 'function') { isProcessingEvent = true; check7FRandomEncounter(gameState, { changeFloor }, () => { isProcessingEvent = false; redraw(); }); } }
  else if (gameState.currentFloor === 8) { if (typeof check8FRandomEncounter === 'function') { isProcessingEvent = true; check8FRandomEncounter(gameState, { changeFloor }, () => { isProcessingEvent = false; redraw(); }); } }
}

function moveForward() {
  const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const vec = dirVectors[gameState.player.dir];
  const nextX = gameState.player.x + vec.x; const nextY = gameState.player.y + vec.y;
  const map = gameState.currentMap;
  if (map && map[nextY] && map[nextY][nextX] === 0) {
    gameState.player.x = nextX; gameState.player.y = nextY;
    gameState.markVisited(gameState.currentFloor, map, nextX, nextY);
    checkEncounterAfterMove();
  }
}

function moveBackward() {
  const dirVectors = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const vec = dirVectors[gameState.player.dir];
  const nextX = gameState.player.x - vec.x; const nextY = gameState.player.y - vec.y;
  const map = gameState.currentMap;
  if (map && map[nextY] && map[nextY][nextX] === 0) {
    gameState.player.x = nextX; gameState.player.y = nextY;
    gameState.markVisited(gameState.currentFloor, map, nextX, nextY);
    checkEncounterAfterMove();
  }
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

// ★ デバッグ機能の起動（本番リリース時はこの1行をコメントアウトするだけで完全消去できます）
initDebug(gameState, { changeFloor, redraw });