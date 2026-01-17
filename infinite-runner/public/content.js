let deathCount = 0;
let iframe = null;
let isGamePlaying = false; // Strict State
let recoveryInterval = null;

// Listen for messages from the Game Iframe
window.addEventListener('message', (event) => {
    if (event.data.type === 'GAME_OVER') {
        handleDeath();
    } else if (event.data.type === 'GAME_RESTART' || event.data.type === 'GAME_START') {
        handleGamePlay();
    }
});

function getActiveVideo() {
    const videos = Array.from(document.querySelectorAll('video'));
    const active = videos.find(v => {
        const rect = v.getBoundingClientRect();
        return rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight;
    });
    return active || document.querySelector('.html5-main-video') || document.querySelector('video');
}

// Strict Enforcement Loop
setInterval(() => {
    // 1. Maintain Focus on Game
    if (iframe && document.activeElement !== iframe) {
        iframe.focus();
        iframe.contentWindow?.focus(); // Try to steal focus back for controls
    }

    // 2. Control Video State
    const video = getActiveVideo();
    if (video) {
        if (isGamePlaying) {
            // Game IS playing, ensure video IS playing (unless waiting for user interaction which usually handled by restarts)
            // Actually, we don't force PLAY here constantly as it might buffer.
            // We only force PAUSE if NOT playing.
        } else {
            // Game is NOT playing (Dead or Not Started)
            // FORCE PAUSE
            if (!video.paused) {
                console.log('Strict Mode: Pausing Video (Game not active)');
                video.pause();
            }
        }
    }

    // Check URL injection
    if (window.location.href.includes('/shorts/')) {
        if (!iframe) injectGame();
    } else {
        if (iframe) removeGame();
    }
}, 100);

function injectGame() {
    console.log('Injecting Runner Game...');
    iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html');
    iframe.id = 'runner-game-iframe';

    Object.assign(iframe.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        width: '400px',
        height: '100vh',
        border: 'none',
        zIndex: '9999',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.5)'
    });

    document.body.appendChild(iframe);

    // Auto-Focus immediately
    iframe.onload = () => {
        iframe.focus();
        iframe.contentWindow.focus();
    };
}

function removeGame() {
    if (iframe) {
        iframe.remove();
        iframe = null;
    }
}

function handleDeath() {
    isGamePlaying = false; // STOP video
    deathCount++;
    console.log(`Player Died! Count: ${deathCount}`);

    if (recoveryInterval) clearInterval(recoveryInterval);

    const video = getActiveVideo();
    if (video) {
        video.pause();
        video.playbackRate = 0.25;
    }

    if (deathCount >= 3) {
        chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    }
}

function handleGamePlay() {
    isGamePlaying = true; // ALLOW video
    console.log('Game Started/Restarted - Resetting Video');

    // Steal focus again just in case
    if (iframe) {
        iframe.focus();
        iframe.contentWindow.focus();
    }

    const video = getActiveVideo();
    if (video) {
        video.currentTime = 0; // Restart from 0
        video.playbackRate = 0.25; // Start slow

        video.play().then(() => {
            startSpeedRecovery(video);
        }).catch(err => {
            console.error('Video Play Failed:', err);
            setTimeout(() => video.play(), 100);
        });
    }
}

function startSpeedRecovery(video) {
    if (recoveryInterval) clearInterval(recoveryInterval);

    recoveryInterval = setInterval(() => {
        // Only recover if game is still playing
        if (!isGamePlaying) {
            clearInterval(recoveryInterval);
            return;
        }

        if (!video.paused && video.playbackRate < 1.0) {
            video.playbackRate = Math.min(1.0, video.playbackRate + 0.05);
            console.log(`Recovering Speed: ${video.playbackRate.toFixed(2)}x`);
        } else {
            if (video.playbackRate >= 1.0) clearInterval(recoveryInterval);
        }
    }, 2000);
}
