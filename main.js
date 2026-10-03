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

// --- プレイヤー設定（1Fの初期位置を適用） ---
let player = {
    x: playerStart1F.x,
    y: playerStart1F.y,
    dir: playerStart1F.dir
};

const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

// 奥行きごとの台形範囲（余白カット用マスク座標）
const leftClips = {
    1: [{x:0, y:0}, {x:100, y:50}, {x:100, y:350}, {x:0, y:400}],
    2: [{x:100, y:50}, {x:170, y:105}, {x:170, y:295}, {x:100, y:350}],
    3: [{x:170, y:105}, {x:220, y:145}, {x:220, y:255}, {x:170, y:295}],
    4: [{x:220, y:145}, {x:260, y:175}, {x:260, y:225}, {x:220, y:255}]
};

const rightClips = {
    1: [{x:500, y:50}, {x:600, y:0}, {x:600, y:400}, {x:500, y:350}],
    2: [{x:430, y:105}, {x:500, y:50}, {x:500, y:350}, {x:430, y:295}],
    3: [{x:380, y:145}, {x:430, y:105}, {x:430, y:295}, {x:380, y:255}],
    4: [{x:340, y:175}, {x:380, y:145}, {x:380, y:255}, {x:340, y:225}]
};

// 正面の壁・ドアの距離ごとの位置とサイズ
const frontBounds = {
    4: { x: 260, y: 175, w: 80,  h: 50 },
    3: { x: 220, y: 145, w: 160, h: 110 },
    2: { x: 170, y: 105, w: 260, h: 190 },
    1: { x: 100, y: 50,  w: 400, h: 300 }
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
                // 部屋ドア(2)、コンビニ(3)、階段(4)、エレベーター(7)はドア画像を使用
                ctx.drawImage(images.door, b.x, b.y, b.w, b.h);
            } else if (images.wall && images.wall.complete) {
                // 通常壁やポスト(5)、血の池(6)などは壁画像を使用
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

// キー操作（W/A/S/Dで移動、Space/Enterで「調べる」）
window.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") moveForward();
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") moveBackward();
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") turnLeft();
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") turnRight();
    if (e.key === " " || e.key === "Enter") interact();
});