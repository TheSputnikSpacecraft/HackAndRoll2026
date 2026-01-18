let deathCount = 0;
let iframe = null;
let isGamePlaying = false; // Strict State
let recoveryInterval = null;
let isFirstStart = true; // Track if this is the first game start or a restart after death

// Speed settings
const MAX_SPEED = 1.5;
const NORMAL_SPEED = 1.0;
const DEATH_SPEED = 0.25;

// Track video element for auto-scroll
let currentVideo = null;

// Listen for messages from the Game Iframe
window.addEventListener('message', (event) => {
    if (event.data.type === 'GAME_OVER') {
        handleDeath();
    } else if (event.data.type === 'GAME_START') {
        handleGamePlay(true); // First start
    } else if (event.data.type === 'GAME_RESTART') {
        handleGamePlay(false); // Restart after death
    } else if (event.data.type === 'BOMB_COLLECTED') {
        handleBombCollected();
    }
});

function getActiveVideo() {
    const selectors = [
        'video.video-stream',
        '#shorts-player video',
        'ytd-reel-video-renderer video',
        'video'
    ];

    for (const selector of selectors) {
        const video = document.querySelector(selector);
        if (video && video.tagName === 'VIDEO') {
            return video;
        }
    }
    return null;
}

// ========== AUTO-SCROLL FUNCTIONALITY ==========
function scrollToNextShort() {
    console.log('🔄 Looking for next button...');

    const nextButton = document.querySelector('button[aria-label="Next video"]') ||
        document.querySelector('button[aria-label="Next short"]') ||
        document.querySelector('.navigation-button-down') ||
        document.querySelector('#navigation-button-down') ||
        document.querySelector('ytd-shorts button.navigation-button');

    if (nextButton) {
        console.log('✅ Found next button, clicking it!');
        nextButton.click();
    } else {
        console.warn('❌ Next button not found');
    }
}

function setupAutoScroll() {
    const video = getActiveVideo();

    if (video && video !== currentVideo) {
        console.log('🎥 Setting up auto-scroll for new video');

        // Remove listener from previous video if exists
        if (currentVideo) {
            currentVideo.removeEventListener('ended', onVideoEnded);
            currentVideo.removeEventListener('timeupdate', checkVideoProgress);
        }

        // Set up listeners for new video
        currentVideo = video;

        // Primary method: ended event
        video.addEventListener('ended', onVideoEnded);

        // Backup method: monitor time progress
        video.addEventListener('timeupdate', checkVideoProgress);

        console.log('✅ Auto-scroll listeners attached. Duration:', video.duration);
    }
}

// Check if video is near end (backup to 'ended' event)
function checkVideoProgress() {
    const video = currentVideo;
    if (!video) return;

    const timeRemaining = video.duration - video.currentTime;

    // If less than 0.5 seconds remaining and not paused
    if (timeRemaining < 0.5 && timeRemaining > 0 && !video.paused) {
        console.log('⏱️ Video near end, preparing to scroll...');
        video.removeEventListener('timeupdate', checkVideoProgress);
        setTimeout(onVideoEnded, 400);
    }
}

// Handle video end event
function onVideoEnded() {
    console.log('🎬 Video ended! Auto-scrolling to next Short now...');
    scrollToNextShort();

    // Reset current video immediately so we can detect the new one
    currentVideo = null;

    // Aggressively look for the next video element
    let attempts = 0;
    const maxAttempts = 20;

    const findNextVideo = setInterval(() => {
        attempts++;
        console.log(`🔍 Looking for next video... (attempt ${attempts}/${maxAttempts})`);

        const newVideo = getActiveVideo();
        if (newVideo && newVideo !== currentVideo) {
            console.log('✅ Found next video! Setting up listeners...');
            setupAutoScroll();
            clearInterval(findNextVideo);
        } else if (attempts >= maxAttempts) {
            console.warn('⚠️ Could not find next video after', maxAttempts, 'attempts');
            clearInterval(findNextVideo);
        }
    }, 200);
}

// ========== MAIN ENFORCEMENT LOOP ==========
setInterval(() => {
    // 1. Maintain Focus on Game
    if (iframe && document.activeElement !== iframe) {
        iframe.focus();
        iframe.contentWindow?.focus();
    }

    // 2. Control Video State
    const video = getActiveVideo();
    if (video) {
        // Setup autoscroll listener
        setupAutoScroll();

        if (isGamePlaying) {
            // Game IS playing - video should play
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

// Monitor for URL changes (YouTube uses dynamic loading)
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        console.log('🌐 URL changed, setting up auto-scroll for new Short');
        lastUrl = location.href;
        setTimeout(setupAutoScroll, 1000);
    }
});

urlObserver.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
});

// Periodically check for new videos
setInterval(() => {
    const video = getActiveVideo();
    if (video && video !== currentVideo) {
        console.log('🔄 Detected video change via interval check');
        setupAutoScroll();
    }
}, 3000);

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
        video.playbackRate = DEATH_SPEED; // Reset to 0.25x on death
    }

    if (deathCount >= 3) {
        chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    }
}

function handleGamePlay(isFirstStart = false) {
    isGamePlaying = true; // ALLOW video

    // Steal focus again just in case
    if (iframe) {
        iframe.focus();
        iframe.contentWindow.focus();
    }

    const video = getActiveVideo();
    if (video) {
        video.currentTime = 0; // Restart from 0

        if (isFirstStart) {
            // First game start - play at normal speed
            video.playbackRate = NORMAL_SPEED;
            console.log('Game Started - Starting Video at 1x');
        } else {
            // Restart after death - start slow and speed up
            video.playbackRate = DEATH_SPEED;
            console.log('Game Restarted - Starting Video at 0.25x, will speed up to 1.5x');
        }

        video.play().then(() => {
            console.log(`Video playing at ${video.playbackRate}x`);
            if (!isFirstStart) {
                startSpeedRecovery(video);
            }
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

        if (!video.paused && video.playbackRate < MAX_SPEED) {
            video.playbackRate = Math.min(MAX_SPEED, video.playbackRate + 0.1);
            console.log(`Recovering Speed: ${video.playbackRate.toFixed(2)}x`);
        } else {
            if (video.playbackRate >= MAX_SPEED) clearInterval(recoveryInterval);
        }
    }, 2000);
}

function handleBombCollected() {
    console.log('💣 Bomb collected - skipping 5 seconds!');

    const video = getActiveVideo();
    if (video) {
        // Skip 5 seconds forward
        video.currentTime = Math.min(video.currentTime + 5, video.duration - 0.1);

        // Increase speed slightly, capped at MAX_SPEED (1.5x)
        const newSpeed = Math.min(video.playbackRate + 0.1, MAX_SPEED);
        video.playbackRate = newSpeed;
        console.log(`Speed increased to ${newSpeed.toFixed(2)}x after bomb`);
    }
}
