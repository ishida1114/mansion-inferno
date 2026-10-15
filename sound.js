// sound.js
class SoundManager {
    constructor() {
        this.bgm = new Audio();
        this.bgm.loop = true;
        this.currentTrack = null;
    }

    playBGM(src, volume = 0.5) {
        if (this.currentTrack === src) return; // 同じ曲ならそのまま
        this.bgm.src = src;
        this.bgm.volume = volume;
        this.bgm.play().catch(() => {}); // ブラウザの自動再生ブロック対策
        this.currentTrack = src;
    }

    stopBGM() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
        this.currentTrack = null;
    }
}

export const sound = new SoundManager();