// Redirect YouTube Home to Shorts immediately
if (window.location.hostname === 'https://www.youtube.com') {
    window.location.replace('https://www.youtube.com/shorts');
}

// Also listen for SPA navigations (yt-navigate-finish)
window.addEventListener('yt-navigate-finish', () => {
    if (window.location.pathname === '/') {
        window.location.replace('https://www.youtube.com/shorts');
    }
});
