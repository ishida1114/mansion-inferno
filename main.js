// 1. 1階のマップ・初期位置・イベント処理をインポート
import { map1F, playerStart1F, handleEvent1F } from './maps/map1F.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- 画像の読み込み処理 ---
const images = {};
const imageSources = {
    logo: "assets/images/akumanologo.png",
    door: "assets/images/door.png",
    wall: "assets/images/wall.png",
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

for (let key in imageSources) {
    images[key] = new Image();
    images[key].src = imageSources[key];
    images[key].onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
            draw();
        }
    };
}

// --- プレイヤー設定（1Fの初期位置） ---
let player = {
    x: playerStart1F.x,
    y: playerStart1F.y,
    dir: playerStart1F.dir
};

const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

// --- 1マスごとの正確な遠近感座標データ ---
// 左壁の台形切り抜き座標（1マス先〜4マス先）
const leftClips = {
    1: [{x:0, y:0}, {x:150, y:75}, {x:150, y:325}, {x:0, y:400}],
    2: [{x:150, y:75}, {x:220, y:135}, {x:220, y:265}, {x:150, y:325}],
    3: [{x:220, y:135}, {x:255, y:165}, {x:255, y:235}, {x:220, y:265}],
    4: [{x:255, y:165}, {x:275, y:180}, {x:275, y:220}, {x:255, y:235}]
};

// 右壁の台形切り抜き座標（1マス先〜4マス先）
const rightClips = {
    1: [{x:450, y:75}, {x:600, y:0}, {x:600, y:400}, {x:450, y:325}],
    2: [{x:380, y:135}, {x:450, y:75}, {x:450, y:325}, {x:380, y:265}],
    3: [{x:345, y:165}, {x:380, y:135}, {x:380, y:265}, {x:345, y:235}],
    4: [{x:325, y:180}, {x:345, y:165}, {x:345, y:235}, {x:325, y:220}]
};

// 正面壁・ドアの表示位置とサイズ（x, y, 幅, 高さ）
const frontBounds = {
    4: { x: 275, y: 180, w: 50,  h: 40 },
    3: { x: 255, y: 165, w: 90,  h: 70 },
    2: { x: 220, y: 135, w: 160, h: 130 },
    1: { x: 150, y: 75,  w: 300, h: 250 }
};

// --- 描画メイン関数 ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. 天井と床
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = "#1c120c";
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    const leftDir = (player.dir + 3) % 4;
    const rightDir = (player.dir + 1) % 4;

    // 2. 奥（depth 4）から手前（depth 1）へ順に不透明描画
    for (let depth = 4; depth >= 1; depth--) {
        const fX = player.x + dx[player.dir] * depth;
        const fY = player.y + dy[player.dir] * depth;

        const lX = fX + dx[leftDir];
        const lY = fY + dy[leftDir];

        const rX = fX + dx[rightDir];
        const rY = fY + dy[rightDir];

        // --- 左壁の描画 ---
        if (map1F[lY] && map1F[lY][lX] !== 0) {
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
                ctx.restore();
            }
        }

        // --- 右壁の描画 ---
        if (map1F[rY] && map1F[rY][rX] !== 0) {
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
                ctx.restore();
            }
        }

        // --- 正面壁・扉の描画 ---
        if (map1F[fY] && map1F[fY][fX] !== 0) {
            const cellType = map1F[fY][fX];
            const b = frontBounds[depth];

            if ((cellType === 2 || cellType === 3 || cellType === 4 || cellType === 7) && images.door && images.door.complete) {
                ctx.drawImage(images.door, b.x, b.y, b.w, b.h);
            } else if (images.wall && images.wall.complete) {
                ctx.drawImage(images.wall, b.x, b.y, b.w, b.h);
            }
        }
    }
}

// --- 調べる（interact）処理 ---
function interact() {
    const frontX = player.x + dx[player.dir];
    const frontY = player.y + dy[player.dir];
    const target = map1F[frontY] ? map1F[frontY][frontX] : 1;

    handleEvent1F(target);
}

// --- 移動処理 ---
function moveForward() {
    const nx = player.x + dx[player.dir];
    const ny = player.y + dy[player.dir];
    if (map1F[ny] && map1F[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
        draw();
    }
}

function moveBackward() {
    const nx = player.x - dx[player.dir];
    const ny = player.y - dy[player.dir];
    if (map1F[ny] && map1F[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
        draw();
    }
}

function turnLeft() {
    player.dir = (player.dir + 3) % 4;
    draw();
}

function turnRight() {
    player.dir = (player.dir + 1) % 4;
    draw();
}

// キー操作
window.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") moveForward();
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") moveBackward();
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") turnLeft();
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") turnRight();
    if (e.key === " " || e.key === "Enter") interact();
});