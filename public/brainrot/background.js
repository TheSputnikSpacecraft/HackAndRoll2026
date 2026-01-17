// evilBrainrotAI - Background Service Worker
// Handles extension lifecycle and optional redirect logic

chrome.runtime.onInstalled.addListener(() => {
    console.log('evilBrainrotAI installed - chaos activated! 💀');
});

// Optional: Handle navigation for more aggressive blocking
// Note: Optional chaining (?.) removed for safety if target env is old, but kept if ES2020+
if (chrome.webNavigation && chrome.webNavigation.onBeforeNavigate) {
    chrome.webNavigation.onBeforeNavigate.addListener(
        (details) => {
            // Allow Instagram, YouTube, and YouTube Shorts
            const url = details.url.toLowerCase();
            if (url.includes('instagram.com') || url.includes('youtube.com') || url.includes('youtu.be')) {
                return;
            }

            const productiveSites = [
                // Docs / Writing
                'docs.google.com', 'drive.google.com', 'notion.so', 'obsidian.md',
                'overleaf.com', 'medium.com', 'hackmd.io', 'typora.io', 'office.com',
                'word.office.com',
                // Coding / CS
                'github.com', 'leetcode.com', 'codeforces.com', 'atcoder.jp',
                'hackerrank.com', 'replit.com', 'codesandbox.io', 'stackblitz.com',
                'colab.research.google.com', 'kaggle.com', 'vscode.dev',
                // School / University
                'canvas.', 'lms.', 'edx.org', 'coursera.org', 'udemy.com',
                'nus.edu.sg', 'mit.edu', 'csail.mit.edu',
                // Research / Reading
                'arxiv.org', 'scholar.google.com', 'ieeexplore.ieee.org', 'springer.com',
                'sciencedirect.com', 'jstor.org', 'researchgate.net',
                // Productivity / Planning
                'calendar.google.com', 'todoist.com', 'ticktick.com', 'trello.com',
                'asana.com', 'linear.app', 'clickup.com', 'linkedin.com',
                'outlook.com', 'outlook.office.com'
            ];

            // Check for productive files
            const productiveFiles = ['.pdf', '.docx', '.pptx', '.xlsx'];
            if (productiveFiles.some(ext => url.includes(ext))) {
                // Content script will handle the overlay
                return;
            }

            // Check for productive sites
            const isProductive = productiveSites.some(site => url.includes(site));

            if (isProductive) {
                // Content script will overlay
                console.log('Productive site detected:', details.url);
            }
        },
        { url: [{ schemes: ['http', 'https'] }] }
    );
}
