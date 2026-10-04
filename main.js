// main.js
import { gameState } from './gameState.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';
import { map2F, playerStart2F, handleEvent2F } from './maps/map2F.js';
import { enemyDefinitions } from './enemies.js';
import { startCombat } from './combat.js';
import { initRenderer, draw } from './renderer.js';
import { 
    showMessageDialog, showConversationDialog, showItemAcquiredModal, 
    playFloorTransition, playVideo, openShopUI, openDebugMenu 
} from './ui.js';
import { toggleMenu, isAppMenuOpen } from './appUI.js';

// 階層データ管理
let currentFloor = 1;
let currentMap = map1F;
let currentHandleEvent = handleEvent1F;
let isEventPlaying = false;

let player = { x: playerStart1F.x, y: playerStart1F.y, dir: playerStart1F.dir };
const dx = [0, 1, 0, -1], dy = [-1, 0, 1, 0];

// アセット初期化＆初回描画
initRenderer(() => {
    draw(player, currentMap, currentFloor);
});

// 階層移動
function changeFloor(targetFloor) {
    isEventPlaying = true;
    playFloorTransition(targetFloor, () => {
        currentFloor = targetFloor;
        if (currentFloor === 2) {
            currentMap = map2F; currentHandleEvent = handleEvent2F;
            player.x = playerStart2F.x; player.y = playerStart2F.y; player.dir = playerStart2F.dir;
        } else {
            currentMap = map1F; currentHandleEvent = handleEvent1F;
            player.x = 7; player.y = 1; player.dir = 2;
        }
        draw(player, currentMap, currentFloor);
        isEventPlaying = false;
    });
}

// エンカウント判定
function checkEncounter() {
    if (currentFloor !== 2) return;

    if (!gameState.hasExperiencedFirstEncounter) {
        gameState.hasExperiencedFirstEncounter = true;
        triggerCombat(enemyDefinitions.demon1);
        return;
    }
    if (Math.random() < 0.10) {
        triggerCombat(enemyDefinitions.demon1);
    }
}

function triggerCombat(enemyDef) {
    isEventPlaying = true;
    startCombat(enemyDef, gameState, false, (result) => {
        isEventPlaying = false;
        if (result === "died") {
            changeFloor(1);
            showMessageDialog("【絶望】\n悪魔の圧倒的な力の前に惨殺された……。\n気がつくと、1階の静けさの中に倒れていた。（HPが全回復した）");
        } else {
            draw(player, currentMap, currentFloor);
        }
    });
}

// イベント発生処理
function interact() {
    if (isEventPlaying || isAppMenuOpen()) return;
    const frontX = player.x + dx[player.dir], frontY = player.y + dy[player.dir];
    const target = currentMap[frontY] ? currentMap[frontY][frontX] : 1;
    const action = currentHandleEvent(target, gameState);

    if (action) {
        if (action.type === "video") playVideo(action.src, () => { if (action.next === "shop") startShop(); if (action.next === "message") showMessageDialog(action.text); });
        else if (action.type === "message") showMessageDialog(action.text);
        else if (action.type === "changeFloor") changeFloor(action.targetFloor);
        else if (action.type === "exorcistSequence") startExorcistSequence();
        else if (action.type === "grandmaEvent") startGrandmaEvent();
        else if (action.type === "shop") startShop();
        else if (action.type === "studentEvent") startStudentEvent();
    }
}

function startShop() {
    isEventPlaying = true;
    openShopUI(() => { isEventPlaying = false; });
}

function startStudentEvent() {
    isEventPlaying = true;
    showConversationDialog("assets/images/human1.png", "【生徒】\n「先生……っ！ よかった、来てくれたんだ……！」\n\n「お父さんが、上の階の様子を見てくるって言ったまま戻ってこないんだ……。外からは変な声が聞こえるし、怖くて……」\n\n「先生、お願い……これを使ってお父さんを助けて……！」", () => {
        showMessageDialog("【主人公】\n（これは……モデルガン？ なぜこんなものを……いや、今はこれでも心強い。）\n\n「わかった、お父さんは俺が探す。お前は1階のコンビニへ逃げろ。あそこなら安全なはずだ。後で必ず合流しよう」", () => {
            showItemAcquiredModal("assets/images/modelgun.jpg", "物理モデルガン", "生徒から託された精巧なモデルガン。\n『悪魔辞典アプリ』と連動し、退魔の札『ラミナ』を装填できる！\n（生徒は1階のコンビニへ向かった）", () => {
                gameState.hasModelGun = true;
                isEventPlaying = false;
            });
        });
    });
}

function startGrandmaEvent() {
    isEventPlaying = true;
    playVideo("assets/videos/CVS.mp4", () => {
        showConversationDialog("assets/images/grandma.jpg", "【謎のおばあさん】\n「おや……こんな場所に迷い込むとは、運の悪い子だねえ。」\n\n「ワタシはね、なぜかこの店の中にだけは居られるんだよ。不思議なもんだねえ……。もし外で何か連絡したいことができたら、1階のポストに手紙を放り込んでおくれ。ワタシが受け取ってやるからね……」", () => {
            gameState.hasMetGrandma = true;
            openShopUI(() => { isEventPlaying = false; });
        });
    });
}

function startExorcistSequence() {
    isEventPlaying = true;
    showMessageDialog("【血の池】\nマンションの中庭に血の池が湧いて、池の底から無数の人ならざる者がこの世に出ようともがいているのが見える……", () => {
        playVideo("assets/videos/BloodPond.mp4", () => playVideo("assets/videos/exorcist.mp4", () => {
            showMessageDialog("【瀕死のエクソシスト】\n「……気づいて……くださったのですね……。ワタシはもう……長くありません……」\n\n「ワタシのスマホ……『悪魔辞典アプリ』と、退魔の札『LAMINA EXORCISMI（ラミナ）』……そして使い魔と2階非常階段の鍵を……あなたに託します……」\n\n「9枚のラミナで悪魔を見極め……使い魔はLv.15であなたの助けに……」", () => {
                showItemAcquiredModal("assets/images/cards/1Card.png", "退魔の札『ラミナ』", "『悪魔辞典アプリ』『使い魔（Lv.15から）』『2F非常階段の鍵』を受け継いだ！", () => {
                    showMessageDialog("【衝撃の光景】\n話し終えた直後、血の池がどす黒く泡立ち始めた！\n\n無数の黒い腕が池から這い出し、エクソシストの体にまとわりつく……！\n\n絶叫とともに、エクソシストは血の池の底へと引きずり込まれ、完全に姿を消した。", () => {
                        gameState.hasExorcistInherited = true; gameState.hasKey2F = true; gameState.cards.push("1Card.png"); 
                        isEventPlaying = false;
                        draw(player, currentMap, currentFloor);
                    });
                });
            });
        }));
    });
}

// 移動処理
function moveForward() {
    const nx = player.x + dx[player.dir], ny = player.y + dy[player.dir];
    if (currentMap[ny] && currentMap[ny][nx] === 0) { 
        player.x = nx; player.y = ny; draw(player, currentMap, currentFloor); checkEncounter(); 
    }
}
function moveBackward() {
    const nx = player.x - dx[player.dir], ny = player.y - dy[player.dir];
    if (currentMap[ny] && currentMap[ny][nx] === 0) { 
        player.x = nx; player.y = ny; draw(player, currentMap, currentFloor); checkEncounter(); 
    }
}
function turnLeft() { player.dir = (player.dir + 3) % 4; draw(player, currentMap, currentFloor); }
function turnRight() { player.dir = (player.dir + 1) % 4; draw(player, currentMap, currentFloor); }

// キーイベント
window.addEventListener("keydown", (e) => {
    if (e.key === "F2") {
        openDebugMenu((action) => {
            if (action === "warp2F") changeFloor(2);
            if (action === "warp1F") changeFloor(1);
            draw(player, currentMap, currentFloor);
        });
        return;
    }
    if (e.key === "Escape") { toggleMenu(); return; }
    if (isEventPlaying || isAppMenuOpen()) return;

    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") moveForward();
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") moveBackward();
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") turnLeft();
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") turnRight();
    if (e.key === " " || e.key === "Enter") interact();
});