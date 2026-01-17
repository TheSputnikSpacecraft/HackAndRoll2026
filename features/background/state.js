// State Manager
// Randomly assigns features to tabs and ensures exclusivity.

export const Feature = {
    NONE: 'NONE',
    HARD_TO_CLOSE: 'HARD_TO_CLOSE'
};

const tabFeatures = new Map(); // tabId -> Feature

// Randomly picks a feature
const pickRandomFeature = () => {
    const features = [Feature.HARD_TO_CLOSE];
    return features[Math.floor(Math.random() * features.length)];
};

export const assignFeature = (tabId) => {
    if (!tabFeatures.has(tabId)) {
        const feature = pickRandomFeature();
        tabFeatures.set(tabId, feature);
        console.log(`[State] Assigned ${feature} to Tab ${tabId}`);
    }
    return tabFeatures.get(tabId);
};

export const getFeature = (tabId) => {
    return tabFeatures.get(tabId) || Feature.NONE;
};

export const clearFeature = (tabId) => {
    tabFeatures.delete(tabId);
};

// Listen for global processing
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_TAB_FEATURE' && sender.tab) {
        // Ensure assigned
        const feature = assignFeature(sender.tab.id);
        sendResponse({ feature });
    }
});
