// renderer.js - 7F完全VIP対応（画像トリミング・自動ファイル検索・角度パース完全整合版）

import { gameState } from './gameState.js';

const HORROR_FONT = "'Shippori Mincho', 'Yu Mincho', 'MS Mincho', serif";
const dirNames = ["北 (N)", "東 (E)", "南 (S)", "西 (W)"];
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

export const images = {};
const baseImages = {
    logo: "assets/images/DictionariumDaemonum.webp",
    door: "assets/images/door.png",
    wall: "assets/images/wall.png",
    stairDoor: "assets/images/stair_door.png",
    elevator: "assets/images/elevator.png",
    entrance: "assets/images/entrance.png", 
    left1: "assets/images/leftwall1.png",
    left2: "assets/images/leftwall2.png",
    left3: "assets/images/leftwall3.png",
    left4: "assets/images/leftwall4.png",
    right1: "assets/images/rightwall1.png",
    right2: "assets/images/rightwall2.png",
    right3: "assets/images/rightwall3.png",
    right4: "assets/images/rightwall4.png",
    carpet: "assets/images/carpet.png"
};

// 7F用画像（名前の揺れを全自動で探索）
const candidates7F = {
    wall7fLeft: [
        "assets/images/7fwallleft_2.jpg", "assets/images/7fwallleft_2.png",
        "assets/images/7fwallleft.jpg", "assets/images/7fwallleft.png"
    ],
    wall7fRight: [
        "assets/images/7fwallright_2.png", "assets/images/7fwallright_2.jpg",
        "assets/images/7fwallright.png", "assets/images/7fwallright.jpg"
    ],
    wall7fFront: [
        "assets/images/7ffloor.png", "assets/images/7ffloor.jpg"
    ],
    wall7fDoor: [
        "assets/images/7fdoor.png", "assets/images/7fdoor.jpg"
    ]
};

function isImageReady(img) {
    return img && img.complete && img.naturalWidth > 0;
}

export function initRenderer(onReady) {
    let toLoad = Object.keys(baseImages).length + Object.keys(candidates7F).length;
    let loaded = 0;

    const checkDone = () => {
        loaded++;
        if (loaded >= toLoad && onReady) onReady();
    };

    // 基本画像のロード
    for (let key in baseImages) {
        images[key] = new Image();
        images[key].onload = checkDone;
        images[key].onerror = checkDone;
        images[key].src = baseImages[key];
    }

    // 7F用画像の自動探索ロード
    for (let key in candidates7F) {
        const list = candidates7F[key];
        images[key] = new Image();
        let idx = 0;
        const tryNext = () => {
            if (idx < list.length) {
                images[key].src = list[idx++];
            } else {
                checkDone();
            }
        };
        images[key].onload = checkDone;
        images[key].onerror = tryNext;
        tryNext();
    }
}

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

    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawEnvironment(ctx, canvas, currentFloor);
        const leftDir = (player.dir + 3) % 4, rightDir = (player.dir + 1) % 4;

        for (let depth = 4; depth >= 1; depth--) {
            const forwardOffset = depth - 1;
            const fX = player.x + dx[player.dir] * depth, fY = player.y + dy[player.dir] * depth;
            const lX = player.x + dx[player.dir] * forwardOffset + dx[leftDir], lY = player.y + dy[player.dir] * forwardOffset + dy[leftDir];
            const rX = player.x + dx[player.dir] * forwardOffset + dx[rightDir], rY = player.y + dy[player.dir] * forwardOffset + dy[rightDir];

            // 左側側壁
            if (currentMap[lY] && currentMap[lY][lX] !== 0) {
                const imgKey = "left" + depth;
                let targetImg = images.wall;
                if (currentFloor === 7 && isImageReady(images.wall7fLeft)) {
                    targetImg = images.wall7fLeft;
                } else if (isImageReady(images[imgKey])) {
                    targetImg = images[imgKey];
                }

                if (isImageReady(targetImg)) {
                    const clip = leftClips[depth];
                    ctx.save(); ctx.beginPath(); 
                    ctx.moveTo(clip[0].x, clip[0].y); ctx.lineTo(clip[1].x, clip[1].y); 
                    ctx.lineTo(clip[2].x, clip[2].y); ctx.lineTo(clip[3].x, clip[3].y); 
                    ctx.closePath(); ctx.clip();
                    ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height); 
                    applyDepthShadow(ctx, clip, depth); 
                    ctx.restore();
                }
            }

            // 右側側壁
            if (currentMap[rY] && currentMap[rY][rX] !== 0) {
                const imgKey = "right" + depth;
                let targetImg = images.wall;
                if (currentFloor === 7 && isImageReady(images.wall7fRight)) {
                    targetImg = images.wall7fRight;
                } else if (isImageReady(images[imgKey])) {
                    targetImg = images[imgKey];
                }

                if (isImageReady(targetImg)) {
                    const clip = rightClips[depth];
                    ctx.save(); ctx.beginPath(); 
                    ctx.moveTo(clip[0].x, clip[0].y); ctx.lineTo(clip[1].x, clip[1].y); 
                    ctx.lineTo(clip[2].x, clip[2].y); ctx.lineTo(clip[3].x, clip[3].y); 
                    ctx.closePath(); ctx.clip();
                    ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height); 
                    applyDepthShadow(ctx, clip, depth); 
                    ctx.restore();
                }
            }

            // 正面
            if (currentMap[fY] && currentMap[fY][fX] !== 0) {
                const cellType = currentMap[fY][fX], b = frontBounds[depth];
                let targetImg = images.wall;
                let is7FCustom = false;
                
                if ((cellType === 4 || cellType === 5) && isImageReady(images.stairDoor)) {
                    targetImg = images.stairDoor;
                } else if (cellType === 6 && isImageReady(images.entrance)) {
                    targetImg = images.entrance;
                } else if ((cellType === 3 || cellType === 7) && isImageReady(images.elevator)) {
                    targetImg = images.elevator;
                } else if ([2, 8, 9].includes(cellType) && isImageReady(images.door)) {
                    targetImg = images.door;
                }

                // 7階専用の壁・扉
                if (currentFloor === 7) {
                    if ([2, 8, 9].includes(cellType) && isImageReady(images.wall7fDoor)) {
                        targetImg = images.wall7fDoor;
                        is7FCustom = true;
                    } else if (cellType === 1 && isImageReady(images.wall7fFront)) {
                        targetImg = images.wall7fFront;
                        is7FCustom = true;
                    }
                }

                if (isImageReady(targetImg)) {
                    if (is7FCustom) {
                        const nw = targetImg.naturalWidth;
                        const nh = targetImg.naturalHeight;
                        const cropTop = nh * 0.055;
                        const cropHeight = nh * 0.83;

                        ctx.drawImage(targetImg, 0, cropTop, nw, cropHeight, b.x, b.y, b.w, b.h);
                    } else {
                        ctx.drawImage(targetImg, b.x, b.y, b.w, b.h);
                    }

                    if (currentFloor === 4) {
                        ctx.fillStyle = "rgba(255, 20, 147, 0.15)";
                        ctx.fillRect(b.x, b.y, b.w, b.h);
                    }
                    const shadowAlpha = (depth - 1) * 0.22;
                    if (shadowAlpha > 0) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`; 
                        ctx.fillRect(b.x, b.y, b.w, b.h);
                    }
                }
            }
        }

        drawMiniMap(ctx, player, currentMap, currentFloor);
        drawCompass(ctx, canvas, player, currentFloor);
        drawActionHint(ctx, canvas, player, currentMap);

        // ★ 左下の [ ESC ] アプリ | [ F2 ] デバッグ の表示処理を削除しました
    } catch (e) {
        console.error("Renderer draw error:", e);
    }
}

function drawActionHint(ctx, canvas, player, currentMap) {
    const frontX = player.x + dx[player.dir], frontY = player.y + dy[player.dir];
    const target = currentMap[frontY] ? currentMap[frontY][frontX] : 1;
    
    if ([2, 3, 4, 5, 6, 7, 8, 9].includes(target)) {
        let label = "[ SPACE ] 調べる";
        
        if (target === 4) {
            if (gameState.currentFloor === 2) {
                label = "[ SPACE ] 1階へ降りる";
            } else if (gameState.currentFloor === 4) {
                label = "[ SPACE ] 3階へ降りる";
            } else if (gameState.currentFloor === 5) {
                label = "[ SPACE ] 6階へ登る";
            } else {
                const nextFloor = (gameState.currentFloor || 1) + 1;
                label = `[ SPACE ] ${nextFloor}階へ登る`;
            }
        } else if (target === 5) {
            if (gameState.currentFloor === 4) {
                label = "[ SPACE ] 5階へ登る";
            } else if (gameState.currentFloor === 5) {
                label = "[ SPACE ] 4階へ降りる";
            } else if (gameState.currentFloor === 6) {
                label = "[ SPACE ] 7階へ登る";
            } else if (gameState.currentFloor === 7) {
                label = "[ SPACE ] 8階へ登る";
            }
        } else if (target === 3 || target === 7) {
            label = "[ SPACE ] エレベーターに乗る";
        } else if (target === 2 && gameState.currentFloor === 1) {
            label = "[ SPACE ] コンビニに入る";
        }

        const boxX = 140, boxY = 10, boxW = 230, boxH = 30;
        ctx.fillStyle = "rgba(15, 0, 0, 0.85)"; 
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = "#880000"; 
        ctx.lineWidth = 1; 
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.fillStyle = "#ffdd66"; 
        ctx.font = `bold 13px ${HORROR_FONT}`; 
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";
        ctx.fillText(label, boxX + boxW / 2, boxY + boxH / 2);
    }
}

function drawEnvironment(ctx, canvas, currentFloor) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    if (currentFloor === 7) {
        ctx.fillStyle = "#0c0a08"; 
    } else {
        ctx.fillStyle = "#0a0a0c"; 
    }
    ctx.fillRect(0, 0, canvas.width, cy);
    
    if (currentFloor === 7) {
        ctx.fillStyle = "#151012"; 
        ctx.fillRect(0, cy, canvas.width, cy);

        if (isImageReady(images.carpet)) {
            ctx.save();
            
            const botLeftX = 75;
            const botRightX = 525;
            const topY = 202;
            const topLeftX = 290;
            const topRightX = 310;

            ctx.beginPath();
            ctx.moveTo(topLeftX, topY);
            ctx.lineTo(topRightX, topY);
            ctx.lineTo(botRightX, canvas.height);
            ctx.lineTo(botLeftX, canvas.height);
            ctx.closePath();
            
            ctx.save();
            ctx.clip();

            const pattern = ctx.createPattern(images.carpet, 'repeat');
            if (pattern) {
                const matrix = new DOMMatrix();
                matrix.scaleSelf(0.28, 0.28);
                pattern.setTransform(matrix);
                ctx.fillStyle = pattern;
            } else {
                ctx.fillStyle = "#550011";
            }
            ctx.fillRect(0, cy, canvas.width, cy);

            const shadowGrad = ctx.createLinearGradient(0, topY, 0, canvas.height);
            shadowGrad.addColorStop(0, "rgba(10, 0, 5, 0.75)");
            shadowGrad.addColorStop(0.4, "rgba(20, 0, 5, 0.25)");
            shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
            ctx.fillStyle = shadowGrad;
            ctx.fillRect(0, cy, canvas.width, cy);

            ctx.restore();

            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#c5a059"; 
            ctx.beginPath();
            ctx.moveTo(topLeftX, topY);
            ctx.lineTo(botLeftX, canvas.height);
            ctx.moveTo(topRightX, topY);
            ctx.lineTo(botRightX, canvas.height);
            ctx.stroke();

            ctx.restore();
        }
    } else {
        ctx.fillStyle = "#140f0c"; 
        ctx.fillRect(0, cy, canvas.width, cy);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"; 
        ctx.lineWidth = 1;
        [0, 100, 150, 225, 262].forEach(x => {
            ctx.beginPath(); ctx.moveTo(cx - x, cy); ctx.lineTo(0 - x * 2, canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + x, cy); ctx.lineTo(canvas.width + x * 2, canvas.height); ctx.stroke();
        });
    }
}

function applyDepthShadow(ctx, clip, depth) {
    const shadowAlpha = (depth - 1) * 0.22;
    if (shadowAlpha <= 0) return;
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath(); 
    ctx.moveTo(clip[0].x, clip[0].y); ctx.lineTo(clip[1].x, clip[1].y); 
    ctx.lineTo(clip[2].x, clip[2].y); ctx.lineTo(clip[3].x, clip[3].y); 
    ctx.closePath(); ctx.fill();
}

function drawCompass(ctx, canvas, player, currentFloor) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; 
    ctx.fillRect(canvas.width - 90, 10, 80, 26);
    ctx.strokeStyle = "#555"; 
    ctx.strokeRect(canvas.width - 90, 10, 80, 26);
    ctx.fillStyle = "#ffdd66"; 
    ctx.font = `bold 14px ${HORROR_FONT}`; 
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${currentFloor}F: ` + dirNames[player.dir], canvas.width - 50, 28);
}

function drawMiniMap(ctx, player, currentMap, currentFloor) {
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
            if (gameState.isVisited(currentFloor, x, y)) {
                const cell = currentMap[y][x];
                if (cell !== 0) {
                    ctx.fillStyle = cell === 1 ? "#444" : (cell === 8 || cell === 9 ? "#cc0000" : "#8a2be2");
                    ctx.fillRect(margin + 3 + x * size, margin + 3 + y * size, size - 1, size - 1);
                } else {
                    ctx.fillStyle = "#222";
                    ctx.fillRect(margin + 3 + x * size, margin + 3 + y * size, size - 1, size - 1);
                }
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