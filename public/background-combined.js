// Unified Background Service Worker
// Merges: Runner, BrainrotAI, and Features

import './features/background/index.js';
import './brainrot/background.js';

// --- Runner Logic (Ported from original background.js) ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CLOSE_TAB' && sender.tab) {
        chrome.tabs.remove(sender.tab.id);
    }
});

console.log("Unified Extension Loaded Successfully.");
