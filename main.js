// renderer.js - 擬似3Dダンジョン描画ロジック（完全版）
import { gameState } from './gameState.js';

export class Renderer {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.fov = Math.PI / 3; // 視野角 (60度)
  }

  // 毎フレーム実行される3D描画処理
  render() {
    if (!this.ctx || !gameState.currentMap) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const map = gameState.currentMap;
    const player = gameState.player;

    // 1. 天井と床の描画 (暗い赤黒いホラー空間)
    this.ctx.fillStyle = '#0a0505';
    this.ctx.fillRect(0, 0, width, height / 2); // 天井
    this.ctx.fillStyle = '#1a1010';
    this.ctx.fillRect(0, height / 2, width, height / 2); // 床

    // 2. プレイヤーの向き (0:北, 1:東, 2:南, 3:西)
    const dirAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    const playerAngle = dirAngles[player.dir];

    const numRays = width; // 画面横幅分の視線を飛ばす
    const halfFov = this.fov / 2;

    // 3. 視線（レイ）を飛ばして壁を描く
    for (let i = 0; i < numRays; i++) {
      const rayAngle = playerAngle - halfFov + (i / numRays) * this.fov;
      let distance = 0;
      let hitWall = false;

      const cos = Math.cos(rayAngle);
      const sin = Math.sin(rayAngle);

      // 壁に当たるまでレイを進める
      while (!hitWall && distance < 12) {
        distance += 0.05;
        const checkX = Math.floor(player.x + cos * distance);
        const checkY = Math.floor(player.y + sin * distance);

        if (checkY < 0 || checkY >= map.length || checkX < 0 || checkX >= map[0].length) {
          hitWall = true;
          distance = 12;
        } else if (map[checkY][checkX] === 1) {
          hitWall = true;
        }
      }

      // 歪み補正 (魚眼レンズ補正)
      const correctedDist = distance * Math.cos(rayAngle - playerAngle);
      const wallHeight = Math.min(height, (height / (correctedDist + 0.0001)));

      // 距離に応じた影（遠いほど暗く）
      const colorVal = Math.max(15, Math.floor(180 - correctedDist * 14));
      this.ctx.fillStyle = `rgb(${colorVal}, 15, 15)`; // 赤黒い壁
      this.ctx.fillRect(i, (height - wallHeight) / 2, 1, wallHeight);

      // 壁の立体感を出す輪郭線
      if (i % 12 === 0) {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(i, (height - wallHeight) / 2, 1, wallHeight);
      }
    }
  }
}