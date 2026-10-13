// debug.js 内のキーボードイベント部分の修正
window.addEventListener('keydown', (e) => {
    // ...
    if (e.key === '4') {
        // 現在のレベルから20になるように差分を足す（または直接20にする）
        const diff = 20 - gameState.player.level;
        if (diff > 0) {
            gameState.levelUp(diff);
            gameState.player.money += 2000;
            alert(`【DEBUG】レベルを20に引き上げ、所持金を+2000しました。`);
            if (window.renderMap) window.renderMap();
        }
    }
    // ...
});