// main.js
import { gameState } from './gameState.js';
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';
import { map2F, playerStart2F, handleEvent2F } from './maps/map2F.js';
import { enemyDefinitions } from './enemies.js';
import { startCombat } from './combat.js';
import { initRenderer, draw } from './renderer.js';
import { showMessageDialog, playFloorTransition, openDebugMenu } from './ui.js';
import { toggleMenu, isAppMenuOpen } from './appUI.js';

let currentFloor = 1;
let currentMap = map1F;
let currentHandleEvent = handleEvent1F;
let isEventPlaying = false;

let player = { x: playerStart1F.x, y: playerStart1F.y, dir: playerStart1F.dir };
const dx = [0, 1, 0, -1], dy = [-1, 0, 1, 0];

initRenderer(() => {
    draw(player, currentMap, currentFloor);
    setupMobileControls();
});

function setupMobileControls() {
    const btnApp = document.getElementById("btn-open-app");
    if (btnApp) btnApp.onclick = () => toggleMenu();

    const buttons = document.querySelectorAll(".controls-container button");
    buttons.forEach(btn => {
        const text = btn.innerText || "";
        if (text.includes("左")) btn.onclick = (e) => { e.preventDefault(); turnLeft(); };
        else if (text.includes("前進")) btn.onclick = (e) => { e.preventDefault(); moveForward(); };
        else if (text.includes("右")) btn.onclick = (e) => { e.preventDefault(); turnRight(); };
        else if (text.includes("後退")) btn.onclick = (e) => { e.preventDefault(); moveBackward(); };
    });

    const canvas = document.getElementById("gameCanvas");
    if (canvas) canvas.onclick = () => interact();
}

function changeFloor(targetFloor) {
    isEventPlaying = true;
    playFloorTransition(targetFloor, () => {
        currentFloor = targetFloor;
        if (currentFloor === 2) {
            currentMap = map2F; currentHandleEvent = handleEvent2F;
            player.x = playerStart2F.x; player.y = playerStart2F.y; player.dir = playerStart2F.dir;
        } else {
            currentMap = map1F; currentHandleEvent = handleEvent1F;
            player.x = playerStart1F.x; player.y = playerStart1F.y; player.dir = playerStart1F.dir;
        }
        draw(player, currentMap, currentFloor);
        isEventPlaying = false;
    });
}

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
            isEventPlaying = true;
            showMessageDialog("【絶望】\n悪魔の圧倒的な力の前に惨殺された……。\n気がつくと、1階の静けさの中に倒れていた。（HPが全回復した）", () => {
                isEventPlaying = false;
            });
        } else {
            draw(player, currentMap, currentFloor);
        }
    });
}

// ★ 調べるアクション：マップ側にイベント実行を委譲するだけで完結！
function interact() {
    if (isEventPlaying || isAppMenuOpen()) return;
    const frontX = player.x + dx[player.dir], frontY = player.y + dy[player.dir];
    const target = currentMap[frontY] ? currentMap[frontY][frontX] : 1;
    
    const context = {
        changeFloor: changeFloor,
        redraw: () => draw(player, currentMap, currentFloor)
    };

    const action = currentHandleEvent(target, gameState, context);

    if (action && action.run) {
        isEventPlaying = true;
        action.run(() => {
            isEventPlaying = false;
        });
    }
}

function moveForward() {
    if (isEventPlaying || isAppMenuOpen()) return;
    const nx = player.x + dx[player.dir], ny = player.y + dy[player.dir];
    if (currentMap[ny] && currentMap[ny][nx] === 0) { 
        player.x = nx; player.y = ny; draw(player, currentMap, currentFloor); checkEncounter(); 
    }
}
function moveBackward() {
    if (isEventPlaying || isAppMenuOpen()) return;
    const nx = player.x - dx[player.dir], ny = player.y - dy[player.dir];
    if (currentMap[ny] && currentMap[ny][nx] === 0) { 
        player.x = nx; player.y = ny; draw(player, currentMap, currentFloor); checkEncounter(); 
    }
}
function turnLeft() { 
    if (isEventPlaying || isAppMenuOpen()) return; 
    player.dir = (player.dir + 3) % 4; draw(player, currentMap, currentFloor); 
}
function turnRight() { 
    if (isEventPlaying || isAppMenuOpen()) return; 
    player.dir = (player.dir + 1) % 4; draw(player, currentMap, currentFloor); 
}

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