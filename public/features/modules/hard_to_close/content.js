// Hard to Close - UI
// Displays a persistent 'Lives' counter

(() => {
    const ID = 'hackandroll-lives-counter';
    if (document.getElementById(ID)) return; // Prevent duplicates

    const box = document.createElement('div');
    box.id = ID;
    Object.assign(box.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: '2147483647', // Max Z-Index
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        pointerEvents: 'none', // Let clicks pass through
        transition: 'transform 0.2s',
        userSelect: 'none'
    });

    box.innerText = 'Lives: 1-15?'; // Initial state before message
    document.body.appendChild(box);

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'UPDATE_LIVES') {
            box.innerText = `Lives: ${msg.lives}`;
            // Pulse animation
            box.style.transform = 'scale(1.2)';
            setTimeout(() => box.style.transform = 'scale(1)', 200);
        }
    });

    // Handle case where we might have missed the initial message
    // Ask background for current status? 
    // Usually background sends it on 'complete', so we should get it.
})();
