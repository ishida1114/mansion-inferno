// renderer.js - 擬似3D透視投影描画（エレベーター画像対応＆全機能保持完全版）
import { gameState } from './gameState.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";
const dirNames = ["北 (N)", "東 (E)", "南 (S)", "西 (W)"];
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

export const images = {};
const imageSources = {
    logo: "assets/images/DictionariumDaemonum.webp",
    door: "assets/images/door.png",
    wall: "assets/images/wall.png",
    stairDoor: "assets/images/stair_door.png",
    elevator: "assets/images/elevator.png", // ★ エレベーター画像を追加
    entrance: "assets/images/entrance.png", 
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
            loadedCount++;
            if (loadedCount === totalImages && onReady) onReady();
        };
        images[key].src = imageSources[key];
    }
}

// 消失点(300, 200)に基づく完全パースポリゴンクリップ
const leftClips = { 
    1: [{x:0, y:0}, {x:150, y:100}, {x:150, y:300}, {x:0, y:400}], 
    2: [{x:150, y:100}, {x:225, y:150}, {x:225, y:250}, {x:150, y:300}], 
    3: [{x:225, y:150}, {x:262, y:175}, {x:262, y:225}, {x:225, y:250}], 
    4: [{x:262, y:175}, {x:281, y:187}, {x:281, y:213}, {x:262, y:225}] 
};

const rightClips = { 
    1: [{x:450, y:100}, {x:600, y:0}, {x:600, y:400}, {x:450, y:300}], 
    2: [{x:375, y:150}, {x:450, y:100}, {x:450, y:300}, {x:375, y:250}], 
    3: [{x:338, y:175}, {x:375, y:150}, {x:375, y:250}, {x:338, y:225}], 
    4: [{x:319, y:187}, {x:338, y:175}, {x:338, y:225}, {x:319, y:213}] 
};

const frontBounds = { 
    1: { x: 150, y: 100, w: 300, h: 200 }, 
    2: { x: 225, y: 150, w: 150, h: 100 }, 
    3: { x: 262, y: 175, w: 76, h: 50 }, 
    4: { x: 281, y: 187, w: 38, h: 26 } 
};

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

        // 左側側壁描画（ポリゴンクリップで斜め壁として正確に描画）
        if (currentMap[lY] && currentMap[lY][lX] !== 0) {
            const imgKey = "left" + depth;
            const targetImg = (images[imgKey] && images[imgKey].complete) ? images[imgKey] : images.wall;
            if (targetImg && targetImg.complete) {
                const clip = leftClips[depth];
                ctx.save(); 
                ctx.beginPath(); 
                ctx.moveTo(clip[0].x, clip[0].y); 
                ctx.lineTo(clip[1].x, clip[1].y); 
                ctx.lineTo(clip[2].x, clip[2].y); 
                ctx.lineTo(clip[3].x, clip[3].y); 
                ctx.closePath(); 
                ctx.clip();
                ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height); 
                applyDepthShadow(ctx, clip, depth); 
                ctx.restore();
            }
        }

        // 右側側壁描画
        if (currentMap[rY] && currentMap[rY][rX] !== 0) {
            const imgKey = "right" + depth;
            const targetImg = (images[imgKey] && images[imgKey].complete) ? images[imgKey] : images.wall;
            if (targetImg && targetImg.complete) {
                const clip = rightClips[depth];
                ctx.save(); 
                ctx.beginPath(); 
                ctx.moveTo(clip[0].x, clip[0].y); 
                ctx.lineTo(clip[1].x, clip[1].y); 
                ctx.lineTo(clip[2].x, clip[2].y); 
                ctx.lineTo(clip[3].x, clip[3].y); 
                ctx.closePath(); 
                ctx.clip();
                ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height); 
                applyDepthShadow(ctx, clip, depth); 
                ctx.restore();
            }
        }

        // 正面壁・扉・エレベーター描画
        if (currentMap[fY] && currentMap[fY][fX] !== 0) {
            const cellType = currentMap[fY][fX], b = frontBounds[depth];
            let targetImg = images.wall;

            if (cellType === 4 && images.stairDoor && images.stairDoor.complete) {
                // 非常階段扉
                targetImg = images.stairDoor;
            } else if ((cellType === 5 || cellType === 6) && images.elevator && images.elevator.complete) {
                // ★ エレベーター扉（セルタイプ5・6に対応）
                targetImg = images.elevator;
            } else if ([2, 3, 7, 8, 9].includes(cellType) && images.door && images.door.complete) {
                // 通常扉
                targetImg = images.door;
            }

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
        let label = "[ SPACE ] 調べる";
        if (target === 4) {
            label = gameState.currentFloor === 2 ? "[ SPACE ] 1階へ下りる" : "[ SPACE ] 2階へ登る";
        } else if (target === 5 || target === 6) {
            label = "[ SPACE ] エレベーターに乗る";
        } else if (target === 2 && gameState.currentFloor === 1) {
            label = "[ SPACE ] コンビニに入る";
        }
        ctx.fillStyle = "rgba(15, 0, 0, 0.75)"; 
        ctx.fillRect(canvas.width / 2 - 100, canvas.height - 50, 200, 32);
        ctx.strokeStyle = "#550000"; 
        ctx.lineWidth = 1; 
        ctx.strokeRect(canvas.width / 2 - 100, canvas.height - 50, 200, 32);
        ctx.fillStyle = "#ffdd66"; 
        ctx.font = `bold 16px ${HORROR_FONT}`; 
        ctx.textAlign = "center"; 
        ctx.fillText(label, canvas.width / 2, canvas.height - 28);
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
    [0, 100, 150, 225, 262].forEach(x => {
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
    const size = 10, margin = 10;
    const mapW = currentMap[0].length * size, mapH = currentMap.length * size;
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)"; 
    ctx.fillRect(margin, margin, mapW + 6, mapH + 6);
    ctx.strokeStyle = "#555"; 
    ctx.lineWidth = 1; 
    ctx.strokeRect(margin, margin, mapW + 6, mapH + 6);

    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            const cell = currentMap[y][x];
            if (cell !== 0) {
                ctx.fillStyle = cell === 1 ? "#444" : (cell === 8 || cell === 9 ? "#cc0000" : "#8a2be2");
                ctx.fillRect(margin + 3 + x * size, margin + 3 + y * size, size - 1, size - 1);
            }
        }
    }

    const px = margin + 3 + player.x * size + size / 2;
    const py = margin + 3 + player.y * size + size / 2;
    const arrowChars = ["▲", "▶", "▼", "◀"];

    ctx.fillStyle = "#ff3333";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(arrowChars[player.dir], px, py);
}