// renderer.js - 画像アセットベースの擬似3Dダンジョンレンダラー（完全版）
import { gameState } from './gameState.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";
const dirNames = ["北 (N)", "東 (E)", "南 (S)", "西 (W)"];
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

// 画像アセット管理
export const images = {};
const imageSources = {
    logo: "assets/images/DictionariumDaemonum.webp",
    door: "assets/images/door.png",
    wall: "assets/images/wall.png",
    stairDoor: "assets/images/stair_door.png",
    left1: "assets/images/leftwall1.png",
    left2: "assets/images/leftwall2.png",
    left3: "assets/images/leftwall3.png",
    left4: "assets/images/leftwall4.png",
    right1: "assets/images/rightwall1.png",
    right2: "assets/images/rightwall2.png",
    right3: "assets/images/rightwall3.png",
    right4: "assets/images/rightwall4.png"
};

let loadedCount = 0;
const totalImages = Object.keys(imageSources).length;

export function initRenderer(onReady) {
    for (let key in imageSources) {
        images[key] = new Image();
        images[key].onload = () => {
            loadedCount++;
            if (loadedCount === totalImages && onReady) onReady();
        };
        images[key].onerror = () => {
            console.warn(`画像見つからず: ${imageSources[key]}`);
            loadedCount++;
            if (loadedCount === totalImages && onReady) onReady();
        };
        images[key].src = imageSources[key];
    }
}

// 台形＆座標スロット
const leftClips = { 
    1: [{x:0, y:0}, {x:150, y:75}, {x:150, y:325}, {x:0, y:400}], 
    2: [{x:150, y:75}, {x:220, y:135}, {x:220, y:265}, {x:150, y:325}], 
    3: [{x:220, y:135}, {x:255, y:165}, {x:255, y:235}, {x:220, y:265}], 
    4: [{x:255, y:165}, {x:275, y:180}, {x:275, y:220}, {x:255, y:235}] 
};
const rightClips = { 
    1: [{x:450, y:75}, {x:600, y:0}, {x:600, y:400}, {x:450, y:325}], 
    2: [{x:380, y:135}, {x:450, y:75}, {x:450, y:325}, {x:380, y:265}], 
    3: [{x:345, y:165}, {x:380, y:135}, {x:380, y:265}, {x:345, y:235}], 
    4: [{x:325, y:180}, {x:345, y:165}, {x:345, y:235}, {x:325, y:220}] 
};
const frontBounds = { 
    4: { x: 275, y: 180, w: 50, h: 40 }, 
    3: { x: 255, y: 165, w: 90, h: 70 }, 
    2: { x: 220, y: 135, w: 160, h: 130 }, 
    1: { x: 150, y: 75, w: 300, h: 250 } 
};
const sideCornerSlots = { 
    left: { 
        1: { x: 0, y: 75, w: 150, h: 250 }, 
        2: { x: 150, y: 135, w: 70, h: 130 }, 
        3: { x: 220, y: 165, w: 35, h: 70 }, 
        4: { x: 255, y: 180, w: 20, h: 40 } 
    }, 
    right: { 
        1: { x: 450, y: 75, w: 150, h: 250 }, 
        2: { x: 380, y: 135, w: 70, h: 130 }, 
        3: { x: 345, y: 165, w: 35, h: 70 }, 
        4: { x: 325, y: 180, w: 20, h: 40 } 
    } 
};

// main.jsからの呼び出しに対応するためのクラス定義
export class Renderer {
    constructor() {
        initRenderer();
    }

    render() {
        const canvas = document.getElementById("game-canvas") || document.getElementById("gameCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx || !gameState.currentMap) return;

        draw(gameState.player, gameState.currentMap, gameState.currentFloor, ctx, canvas);
    }
}

// メイン描画処理
export function draw(player, currentMap, currentFloor, customCtx, customCanvas) {
    const canvas = customCanvas || document.getElementById("game-canvas") || document.getElementById("gameCanvas");
    if (!canvas) return;
    const ctx = customCtx || canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEnvironment(ctx, canvas);
    const leftDir = (player.dir + 3) % 4, rightDir = (player.dir + 1) % 4;

    for (let depth = 4; depth >= 1; depth--) {
        const forwardOffset = depth - 1;
        const fX = player.x + dx[player.dir] * depth, fY = player.y + dy[player.dir] * depth;
        const lX = player.x + dx[player.dir] * forwardOffset + dx[leftDir], lY = player.y + dy[player.dir] * forwardOffset + dy[leftDir];
        const rX = player.x + dx[player.dir] * forwardOffset + dx[rightDir], rY = player.y + dy[player.dir] * forwardOffset + dy[rightDir];

        // 左壁
        if (currentMap[lY] && currentMap[lY][lX] !== 0) {
            const imgKey = "left" + depth;
            if (images[imgKey] && images[imgKey].complete) {
                const clip = leftClips[depth];
                ctx.save(); 
                ctx.beginPath(); 
                ctx.moveTo(clip[0].x, clip[0].y); 
                ctx.lineTo(clip[1].x, clip[1].y); 
                ctx.lineTo(clip[2].x, clip[2].y); 
                ctx.lineTo(clip[3].x, clip[3].y); 
                ctx.closePath(); 
                ctx.clip();
                ctx.drawImage(images[imgKey], 0, 0, canvas.width, canvas.height); 
                applyDepthShadow(ctx, clip, depth); 
                ctx.restore();
            }
        } else {
            const lX_next = player.x + dx[player.dir] * depth + dx[leftDir], lY_next = player.y + dy[player.dir] * depth + dy[leftDir];
            if (currentMap[lY_next] && currentMap[lY_next][lX_next] !== 0 && images.wall && images.wall.complete) {
                const slot = sideCornerSlots.left[depth];
                ctx.drawImage(images.wall, slot.x, slot.y, slot.w, slot.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`; 
                ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
            }
        }

        // 右壁
        if (currentMap[rY] && currentMap[rY][rX] !== 0) {
            const imgKey = "right" + depth;
            if (images[imgKey] && images[imgKey].complete) {
                const clip = rightClips[depth];
                ctx.save(); 
                ctx.beginPath(); 
                ctx.moveTo(clip[0].x, clip[0].y); 
                ctx.lineTo(clip[1].x, clip[1].y); 
                ctx.lineTo(clip[2].x, clip[2].y); 
                ctx.lineTo(clip[3].x, clip[3].y); 
                ctx.closePath(); 
                ctx.clip();
                ctx.drawImage(images[imgKey], 0, 0, canvas.width, canvas.height); 
                applyDepthShadow(ctx, clip, depth); 
                ctx.restore();
            }
        } else {
            const rX_next = player.x + dx[player.dir] * depth + dx[rightDir], rY_next = player.y + dy[player.dir] * depth + dy[rightDir];
            if (currentMap[rY_next] && currentMap[rY_next][rX_next] !== 0 && images.wall && images.wall.complete) {
                const slot = sideCornerSlots.right[depth];
                ctx.drawImage(images.wall, slot.x, slot.y, slot.w, slot.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`; 
                ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
            }
        }

        // 正面
        if (currentMap[fY] && currentMap[fY][fX] !== 0) {
            const cellType = currentMap[fY][fX], b = frontBounds[depth];
            let targetImg = images.wall;
            if (cellType === 4 && images.stairDoor && images.stairDoor.complete) targetImg = images.stairDoor;
            else if ((cellType === 2 || cellType === 3 || cellType === 7 || cellType === 8 || cellType === 9) && images.door && images.door.complete) targetImg = images.door;
            if (targetImg && targetImg.complete) {
                ctx.drawImage(targetImg, b.x, b.y, b.w, b.h);
                ctx.fillStyle = `rgba(0, 0, 0, ${(depth - 1) * 0.22})`; 
                ctx.fillRect(b.x, b.y, b.w, b.h);
            }
        }
    }

    drawMiniMap(ctx, player, currentMap);
    drawCompass(ctx, canvas, player, currentFloor);
    drawActionHint(ctx, canvas, player, currentMap);

    ctx.fillStyle = "rgba(0,0,0,0.5)"; 
    ctx.fillRect(10, canvas.height - 30, 260, 25);
    ctx.fillStyle = "#fff"; 
    ctx.font = `12px ${HORROR_FONT}`; 
    ctx.textAlign = "left";
    ctx.fillText("[ ESC ] アプリ  |  [ F2 ] デバッグ", 20, canvas.height - 13);
}

function drawActionHint(ctx, canvas, player, currentMap) {
    const frontX = player.x + dx[player.dir], frontY = player.y + dy[player.dir];
    const target = currentMap[frontY] ? currentMap[frontY][frontX] : 1;
    if ([2, 3, 4, 5, 6, 7, 8, 9].includes(target)) {
        ctx.fillStyle = "rgba(15, 0, 0, 0.75)"; 
        ctx.fillRect(canvas.width / 2 - 90, canvas.height - 50, 180, 32);
        ctx.strokeStyle = "#550000"; 
        ctx.lineWidth = 1; 
        ctx.strokeRect(canvas.width / 2 - 90, canvas.height - 50, 180, 32);
        ctx.fillStyle = "#ffdd66"; 
        ctx.font = `bold 16px ${HORROR_FONT}`; 
        ctx.textAlign = "center"; 
        ctx.fillText("[ SPACE ] 調べる", canvas.width / 2, canvas.height - 28);
    }
}

function drawEnvironment(ctx, canvas) {
    ctx.fillStyle = "#0a0a0c"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = "#140f0c"; 
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"; 
    ctx.lineWidth = 1;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    [0, 100, 150, 220, 255].forEach(x => {
        ctx.beginPath(); 
        ctx.moveTo(cx - x, cy); 
        ctx.lineTo(0 - x * 2, canvas.height); 
        ctx.stroke();
        ctx.beginPath(); 
        ctx.moveTo(cx + x, cy); 
        ctx.lineTo(canvas.width + x * 2, canvas.height); 
        ctx.stroke();
    });
}

function applyDepthShadow(ctx, clip, depth) {
    const shadowAlpha = (depth - 1) * 0.22;
    if (shadowAlpha <= 0) return;
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath(); 
    ctx.moveTo(clip[0].x, clip[0].y); 
    ctx.lineTo(clip[1].x, clip[1].y); 
    ctx.lineTo(clip[2].x, clip[2].y); 
    ctx.lineTo(clip[3].x, clip[3].y); 
    ctx.closePath(); 
    ctx.fill();
}

function drawCompass(ctx, canvas, player, currentFloor) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; 
    ctx.fillRect(canvas.width - 90, 10, 80, 26);
    ctx.strokeStyle = "#555"; 
    ctx.strokeRect(canvas.width - 90, 10, 80, 26);
    ctx.fillStyle = "#ffdd66"; 
    ctx.font = `bold 14px ${HORROR_FONT}`; 
    ctx.textAlign = "center";
    ctx.fillText(`${currentFloor}F: ` + dirNames[player.dir], canvas.width - 50, 28);
}

function drawMiniMap(ctx, player, currentMap) {
    if (!gameState.hasExorcistInherited) return; 
    const size = 8, margin = 10, mapW = currentMap[0].length * size, mapH = currentMap.length * size;
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)"; 
    ctx.fillRect(margin, margin, mapW + 6, mapH + 6);
    ctx.strokeStyle = "#444"; 
    ctx.lineWidth = 1; 
    ctx.strokeRect(margin, margin, mapW + 6, mapH + 6);
    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            const cell = currentMap[y][x];
            if (cell !== 0) {
                ctx.fillStyle = cell === 1 ? "#555" : (cell === 8 || cell === 9 ? "#cc0000" : "#8a2be2");
                ctx.fillRect(margin + 3 + x * size, margin + 3 + y * size, size - 1, size - 1);
            }
        }
    }
    const px = margin + 3 + player.x * size + size / 2, py = margin + 3 + player.y * size + size / 2;
    ctx.fillStyle = "#ff3333"; 
    ctx.beginPath(); 
    ctx.arc(px, py, size / 2.5, 0, Math.PI * 2); 
    ctx.fill();
    ctx.strokeStyle = "#ff3333"; 
    ctx.lineWidth = 2; 
    ctx.beginPath(); 
    ctx.moveTo(px, py);
    ctx.lineTo(px + dx[player.dir] * (size + 2), py + dy[player.dir] * (size + 2)); 
    ctx.stroke();
}