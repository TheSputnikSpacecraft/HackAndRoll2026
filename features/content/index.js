// Main Content Script Loader
// Dynamically imports ONLY the assigned feature module.

(async () => {
    try {
        // Ask background which feature we are assigned
        const response = await chrome.runtime.sendMessage({ type: 'GET_TAB_FEATURE' });
        const feature = response.feature;

        console.log(`[Content] Assigned Feature: ${feature}`);

        if (feature === 'HARD_TO_CLOSE') {
            const src = chrome.runtime.getURL('modules/hard_to_close/content.js');
            await import(src);
        }

    } catch (err) {
        console.error("Failed to load assigned module:", err);
    }
})();
