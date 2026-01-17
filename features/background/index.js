// Main Background Loader
// Imports feature-specific background scripts

import '../modules/hard_to_close/background.js';
import * as State from './state.js';

console.log("Background Service Worker Loaded");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        // Pre-assign feature so it's ready for content script
        State.assignFeature(tabId);
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    State.clearFeature(tabId);
});
