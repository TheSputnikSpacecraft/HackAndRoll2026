chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CLOSE_TAB' && sender.tab) {
        chrome.tabs.remove(sender.tab.id);
    }
});
