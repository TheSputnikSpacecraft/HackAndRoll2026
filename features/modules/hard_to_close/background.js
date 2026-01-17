import { getFeature, Feature } from '../../background/state.js';

const tabLives = new Map(); // tabId -> { lives: number, url: string, isResurrecting: boolean }

// Helper: Random 1-15
const getRandomLives = () => Math.floor(Math.random() * 15) + 1;

// Helper: Update Badge/Content
const updateStatus = (tabId, lives) => {
    // Only update if this feature is active
    if (getFeature(tabId) !== Feature.HARD_TO_CLOSE) return;

    // Badge
    chrome.action.setBadgeText({ text: lives.toString(), tabId }).catch(() => { });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId }).catch(() => { });

    // Content Script Message
    chrome.tabs.sendMessage(tabId, { type: "UPDATE_LIVES", lives }).catch(() => {
        // Content script might not be ready or page doesn't support it
    });
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // We trigger on 'loading' to capture the start of a navigation/refresh.
    // 'changeInfo.status' is present when status changes.
    if (changeInfo.status === 'loading') {
        // CHECK FEATURE
        if (getFeature(tabId) !== Feature.HARD_TO_CLOSE) return;

        // Exception: YouTube
        // If it's YouTube, we do NOT apply the hard-to-close logic.
        // We ensure it's removed from tracking so it closes normally.
        if (tab.url && tab.url.includes("youtube.com")) {
            tabLives.delete(tabId);
            chrome.action.setBadgeText({ text: "", tabId }).catch(() => { });
            return;
        }

        let current = tabLives.get(tabId);

        if (!current) {
            // Initialize new tab
            current = { lives: getRandomLives(), url: tab.url, isResurrecting: false };
            tabLives.set(tabId, current);
        } else if (current.isResurrecting) {
            // Resurrection: Keep lives, consume flag
            current.isResurrecting = false;
            current.url = tab.url; // Update URL
            tabLives.set(tabId, current);
        } else {
            // Normal Refresh/Navigation: Reset lives
            current.lives = getRandomLives();
            current.url = tab.url;
            tabLives.set(tabId, current);
        }

        updateStatus(tabId, current.lives);
    }

    // Trigger again on complete to ensure UI is updated (content script loaded)
    if (changeInfo.status === 'complete') {
        if (getFeature(tabId) !== Feature.HARD_TO_CLOSE) return;

        const current = tabLives.get(tabId);
        if (current) {
            // Ensure URL is up to date
            current.url = tab.url;
            updateStatus(tabId, current.lives);
        }
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (removeInfo.isWindowClosing) return; // Allow window closure

    // CHECK FEATURE
    if (getFeature(tabId) !== Feature.HARD_TO_CLOSE) {
        tabLives.delete(tabId);
        return;
    }

    const current = tabLives.get(tabId);

    // Clean up memory
    tabLives.delete(tabId);

    // Exception: YouTube
    // If exact URL matches or was tracked as YouTube, allow close.
    if (current && current.url && current.url.includes("youtube.com")) {
        return;
    }

    if (current && current.lives > 1) {
        // Decrement and Resurrect
        const newLives = current.lives - 1;
        const targetUrl = current.url || 'chrome://newtab'; // Fallback

        chrome.tabs.create({ url: targetUrl, active: true }, (newTab) => {
            // Pre-seed state for the new tab
            tabLives.set(newTab.id, {
                lives: newLives,
                url: targetUrl,
                isResurrecting: true
            });
        });
    } else if (current) {
        // Punishment Level Reached (Final Close)
        const PUNISHMENT_URL = "https://www.youtube.com/shorts/LChT7wX3MIA";
        chrome.tabs.create({ url: PUNISHMENT_URL, active: true }, (newTab) => {
            // Assign NO feature to the punishment tab so they can close it (eventually)
            // Or maybe assign it Hard to Close again? 
            // For now, let's be merciful and let them watch the video.
            // But we must strictly ensure it doesn't get caught in a loop if we are assigning features on load.
            // The state manager assigns randomly on 'loading'. 
        });
    }
});

console.log("Hard to Close: Background Logic Loaded (Range 1-15)");
