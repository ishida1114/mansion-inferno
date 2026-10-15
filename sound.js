// sound.js - BGM・SE統合管理マネージャー（音量ON/OFFボタン自動生成付き）

class SoundManager {
    constructor() {
        this.bgm = new Audio();
        this.bgm.loop = true;
        this.currentTrack = null;
        this.isMuted = false;
        this.defaultBgmVol = 0.45;
        this.defaultSeVol = 0.6;

        this.initToggleButton();
    }

    // 画面右上に「🔊 ON / 🔇 OFF」ボタンを自動生成
    initToggleButton() {
        const createBtn = () => {
            if (document.getElementById("sound-toggle-btn")) return;
            const btn = document.createElement("button");
            btn.id = "sound-toggle-btn";
            btn.innerText = "🔊 ON";
            btn.style.cssText = "position: fixed; top: 12px; right: 12px; z-index: 99999; background: rgba(20, 0, 0, 0.85); color: #ffdd66; border: 1px solid #770000; border-radius: 6px; padding: 6px 14px; font-size: 13px; font-weight: bold; cursor: pointer; box-shadow: 0 0 10px rgba(0,0,0,0.8); transition: 0.2s;";
            
            btn.onclick = () => {
                const muted = this.toggleMute();
                btn.innerText = muted ? "🔇 OFF" : "🔊 ON";
                btn.style.color = muted ? "#888888" : "#ffdd66";
                btn.style.borderColor = muted ? "#444444" : "#770000";
            };
            document.body.appendChild(btn);
        };

        if (document.body) {
            createBtn();
        } else {
            window.addEventListener("DOMContentLoaded", createBtn);
        }
    }

    // ミュート切り替え
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.bgm.volume = 0;
        } else {
            this.bgm.volume = this.defaultBgmVol;
        }
        return this.isMuted;
    }

    // BGM再生
    playBGM(src, volume = this.defaultBgmVol) {
        this.defaultBgmVol = volume;
        if (this.currentTrack === src && !this.bgm.paused) return;
        this.bgm.src = src;
        this.bgm.volume = this.isMuted ? 0 : volume;
        this.bgm.loop = true;
        this.bgm.play().catch(err => {
            console.warn("BGM autoplay wait:", err);
        });
        this.currentTrack = src;
    }

    // BGM停止
    stopBGM() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
        this.currentTrack = null;
    }

    // 効果音再生
    playSE(src, volume = this.defaultSeVol) {
        if (this.isMuted) return;
        const se = new Audio(src);
        se.volume = volume;
        se.play().catch(err => {
            console.warn("SE playback blocked:", err);
        });
    }
}

export const sound = new SoundManager();