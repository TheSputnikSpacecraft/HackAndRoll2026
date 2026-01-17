// evilBrainrotAI - Content Script
// Detects productive sites and shows brainrot quiz

(function() {
  'use strict';

  // Sites that should NOT be blocked (allowlist)
  const ALLOWED_SITES = [
    'instagram.com',
    'youtube.com',
    'youtu.be'
  ];

  // List of productive sites (substring match)
  const PRODUCTIVE_SITES = [
    // Docs / Writing
    'docs.google.com',
    'drive.google.com',
    'notion.so',
    'obsidian.md',
    'overleaf.com',
    'medium.com',
    'hackmd.io',
    'typora.io',
    'office.com',
    'word.office.com',
    // Coding / CS
    'github.com',
    'leetcode.com',
    'codeforces.com',
    'atcoder.jp',
    'hackerrank.com',
    'replit.com',
    'codesandbox.io',
    'stackblitz.com',
    'colab.research.google.com',
    'kaggle.com',
    'vscode.dev',
    // School / University
    'canvas.',
    'lms.',
    'edx.org',
    'coursera.org',
    'udemy.com',
    'nus.edu.sg',
    'mit.edu',
    'csail.mit.edu',
    // Research / Reading
    'arxiv.org',
    'scholar.google.com',
    'ieeexplore.ieee.org',
    'springer.com',
    'sciencedirect.com',
    'jstor.org',
    'researchgate.net',
    // Productivity / Planning
    'calendar.google.com',
    'todoist.com',
    'ticktick.com',
    'trello.com',
    'asana.com',
    'linear.app',
    'clickup.com',
    'linkedin.com',
    'outlook.com',
    'outlook.office.com'
  ];

  // Generic heuristics - URL keywords that suggest productivity
  const PRODUCTIVE_KEYWORDS = [
    'docs',
    'notes',
    'assignment',
    'lecture',
    'syllabus',
    'homework',
    'problemset'
  ];

  // Brainrot quiz questions
  const BRAINROT_QUIZ = [
    {
      question: "What is the sigma grindset?",
      answers: ["Working hard all day", "Sleep 3 hours, grind 23 hours", "Be productive", "Wake up early"],
      correct: 1
    },
    {
      question: "What does 'rizz' mean?",
      answers: ["Charisma", "Cool", "Dance move", "Pizza"],
      correct: 0
    },
    {
      question: "What is Skibidi?",
      answers: ["A game", "A meme with toilets and cameras", "A dance", "A food"],
      correct: 1
    },
    {
      question: "What does 'Ohio' mean in memes?",
      answers: ["A state", "Something weird/cursed", "A city", "A song"],
      correct: 1
    },
    {
      question: "What does 'fanum tax' refer to?",
      answers: ["Government tax", "Taking someone's food", "Streamer tax", "A game"],
      correct: 1
    },
    {
      question: "What is 'sigma male'?",
      answers: ["A Greek letter", "Independent confident man", "A video game", "A song"],
      correct: 1
    },
    {
      question: "What does 'no cap' mean?",
      answers: ["No hat", "No lie / for real", "No limits", "No problem"],
      correct: 1
    },
    {
      question: "What is 'GYATT'?",
      answers: ["An exclamation", "A dance", "A food", "A game"],
      correct: 0
    },
    {
      question: "What does 'based' mean?",
      answers: ["Grounds for something", "Cool/agreeable", "Built on", "False"],
      correct: 1
    },
    {
      question: "What is 'pov'?",
      answers: ["Point of view", "Player vs player", "Port of Venice", "Power of video"],
      correct: 0
    },
    {
      question: "What does 'bussin' mean?",
      answers: ["Really good", "Breaking something", "A bus", "Eating"],
      correct: 0
    },
    {
      question: "What is the 'final boss' in Ohio memes?",
      answers: ["The governor", "A scary monster", "A difficult challenge", "A video game boss"],
      correct: 2
    },
    {
      question: "What does 'sus' mean?",
      answers: ["Suspicious", "Super", "Success", "Sustained"],
      correct: 0
    },
    {
      question: "What is 'brainrot'?",
      answers: ["A disease", "Consuming too much meme content", "Headache", "Brain damage"],
      correct: 1
    },
    {
      question: "What does 'ratio' mean in internet slang?",
      answers: ["Math proportion", "When replies get more likes than original", "A ratio meme", "Comparison"],
      correct: 1
    }
  ];

  // Track quiz pass state - session-wide (clears on page reload)
  let quizPassedThisSession = false;
  
  // Track wrong answers in current quiz attempt
  let wrongAnswersCount = 0;

  // Brainrot roast messages for wrong answers
  const ROAST_MESSAGES = [
    '❌ WRONG! You have NO rizz 💀<br>Study more brainrot you sigma failure 🗿',
    '❌ INCORRECT! Your grindset is WEAK 🔥<br>Get some brainrot knowledge before trying again 😭',
    '❌ NOPE! You\'re not sigma enough 🧌<br>Touch some grass and watch more memes 💯',
    '❌ WRONG ANSWER! Zero rizz detected 🕳️<br>Learn your brainrot culture first 🗿',
    '❌ FAILED! Your Ohio energy is WEAK 💀<br>Go watch Skibidi Toilet and try again 🔥',
    '❌ NICE TRY! But you have negative rizz 🥶<br>Study brainrot harder next time 🧌',
    '❌ WRONG! You\'re a beta, not sigma 😎<br>Get rekt by evilBrainrotAI 💀',
    '❌ INCORRECT! No cap, you need more brainrot 🗿<br>Watch more memes before coming back 🔥',
    '❌ FAIL! Your brainrot IQ is too low 💯<br>Go watch some sigma memes and return 🧌',
    '❌ WRONG! You have zero fanum tax knowledge 🕳️<br>Study harder, noob 💀'
  ];

  // Check if URL should be allowed (not blocked)
  function isAllowedSite(url) {
    const urlLower = url.toLowerCase();
    return ALLOWED_SITES.some(site => urlLower.includes(site));
  }

  // Check if current URL matches a productive site
  function isProductiveSite(url) {
    // First check if site is explicitly allowed
    if (isAllowedSite(url)) {
      return false;
    }
    
    const urlLower = url.toLowerCase();
    
    // Check for productive site substrings
    if (PRODUCTIVE_SITES.some(site => urlLower.includes(site))) {
      return true;
    }
    
    // Check for generic productive keywords
    if (PRODUCTIVE_KEYWORDS.some(keyword => urlLower.includes(keyword))) {
      return true;
    }
    
    return false;
  }

  // Generate a new quiz question
  function generateNewQuestion() {
    return BRAINROT_QUIZ[Math.floor(Math.random() * BRAINROT_QUIZ.length)];
  }

  // Close tab with roast message
  function closeTabWithRoast() {
    const roastMessages = [
      'You failed the brainrot quiz 3 times! 💀<br>Tab closed because you have NO rizz 🗿',
      '3 wrong answers = ZERO sigma energy 🔥<br>This tab is now CLOSED 😭',
      'You couldn\'t answer 3 brainrot questions? 💀<br>Tab terminated - go watch memes 🧌',
      '3 strikes, you\'re OUT! 🕳️<br>Tab closed - study brainrot culture 🗿',
      'Failed 3 times = NO ACCESS 💯<br>Closing tab - you\'re too beta 🥶'
    ];
    const roast = roastMessages[Math.floor(Math.random() * roastMessages.length)];
    
    // Create a final roast overlay before closing
    const roastOverlay = document.createElement('div');
    roastOverlay.id = 'finalRoastOverlay';
    roastOverlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #ff0000, #000000, #ff0000);
        background-size: 400% 400%;
        animation: rainbow 1s ease infinite;
        z-index: 9999999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Comic Sans MS', cursive, sans-serif;
        color: white;
        text-shadow: 4px 4px 0px #000;
        font-size: 48px;
        text-align: center;
        padding: 40px;
      ">
        <style>
          @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        </style>
        <div style="font-size: 72px; margin-bottom: 30px;">💀</div>
        <div>${roast}</div>
        <div style="font-size: 36px; margin-top: 40px;">Closing tab in 3 seconds...</div>
      </div>
    `;
    document.body.appendChild(roastOverlay);
    
    // Close tab after delay
    setTimeout(() => {
      window.close();
      // Fallback if window.close doesn't work (some browsers block it)
      if (!document.hidden) {
        window.location.href = 'about:blank';
      }
    }, 3000);
  }

  // Update quiz question in existing overlay
  function updateQuizQuestion(overlay) {
    const quiz = generateNewQuestion();
    const shuffledAnswers = [...quiz.answers].sort(() => Math.random() - 0.5);
    const correctIndex = shuffledAnswers.indexOf(quiz.answers[quiz.correct]);
    
    const questionDiv = overlay.querySelector('.quiz-question');
    const answersDiv = overlay.querySelector('#quiz-answers');
    const resultDiv = overlay.querySelector('#quiz-result');
    
    if (questionDiv) {
      questionDiv.textContent = quiz.question;
    }
    
    if (answersDiv && resultDiv) {
      // Clear old buttons and result
      answersDiv.innerHTML = '';
      resultDiv.innerHTML = '';
      resultDiv.style.fontSize = '32px';
      
      // Create new buttons
      shuffledAnswers.forEach((answer, idx) => {
        const button = document.createElement('button');
        button.className = 'quiz-button';
        button.setAttribute('data-answer', idx);
        button.setAttribute('data-correct', idx === correctIndex ? 'true' : 'false');
        button.textContent = answer;
        answersDiv.appendChild(button);
      });
      
      // Reattach event listeners to new buttons
      const buttons = answersDiv.querySelectorAll('.quiz-button');
      attachQuizListeners(buttons, resultDiv, overlay, correctIndex);
    }
  }

  // Store interval reference to clear it when quiz passes
  let checkIntervalId = null;

  // Attach quiz button listeners
  function attachQuizListeners(buttons, resultDiv, overlay, correctIndex) {
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const isCorrect = this.getAttribute('data-correct') === 'true';
        
        if (isCorrect) {
          resultDiv.innerHTML = '✅ CORRECT! Sigma approved 🗿<br>Access granted for this session!';
          resultDiv.style.color = '#00ff00';
          
          // Mark quiz as passed for this session IMMEDIATELY
          quizPassedThisSession = true;
          wrongAnswersCount = 0; // Reset wrong count
          
          // Clear check interval immediately
          if (checkIntervalId) {
            clearInterval(checkIntervalId);
            checkIntervalId = null;
          }
          
          // Disable all buttons
          buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
          });
          
          // Remove overlay after a moment
          setTimeout(() => {
            // Remove overlay multiple ways to ensure it's gone
            if (overlay && overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
            const overlayCheck = document.getElementById('evilBrainrotOverlay');
            if (overlayCheck) {
              overlayCheck.remove();
              if (overlayCheck.parentNode) {
                overlayCheck.parentNode.removeChild(overlayCheck);
              }
            }
            // Also check for any overlays with the ID
            const allOverlays = document.querySelectorAll('#evilBrainrotOverlay');
            allOverlays.forEach(ov => ov.remove());
          }, 2000);
        } else {
          wrongAnswersCount++;
          
          // Get random roast message
          const roast = ROAST_MESSAGES[Math.floor(Math.random() * ROAST_MESSAGES.length)];
          resultDiv.innerHTML = roast + `<br>Wrong answers: ${wrongAnswersCount}/3`;
          resultDiv.style.color = '#ff0000';
          resultDiv.style.fontSize = '24px';
          
          // Shake animation
          const quizContainer = overlay.querySelector('.quiz-container');
          quizContainer.style.animation = 'shake 0.5s';
          
          // Check if 3 wrong answers
          if (wrongAnswersCount >= 3) {
            setTimeout(() => {
              closeTabWithRoast();
            }, 2000);
          } else {
            // Show new question after delay
            setTimeout(() => {
              quizContainer.style.animation = '';
              resultDiv.innerHTML = 'Loading new question...';
              setTimeout(() => {
                updateQuizQuestion(overlay);
              }, 1000);
            }, 2000);
          }
        }
      });
    });
  }

  // Create brainrot quiz overlay
  function createQuizOverlay() {
    // Check if quiz already passed this session
    if (quizPassedThisSession) {
      return;
    }

    // Remove any existing overlay
    const existing = document.getElementById('evilBrainrotOverlay');
    if (existing) {
      existing.remove();
    }

    // Reset wrong answers count for new quiz
    wrongAnswersCount = 0;

    // Get random quiz question
    const quiz = generateNewQuestion();
    const shuffledAnswers = [...quiz.answers].sort(() => Math.random() - 0.5);
    const correctIndex = shuffledAnswers.indexOf(quiz.answers[quiz.correct]);

    // Create overlay div
    const overlay = document.createElement('div');
    overlay.id = 'evilBrainrotOverlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff);
        background-size: 400% 400%;
        animation: rainbow 2s ease infinite;
        z-index: 999999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Comic Sans MS', cursive, sans-serif;
        color: white;
        text-shadow: 3px 3px 0px #000;
        overflow-y: auto;
        pointer-events: auto;
      ">
        <style>
          @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .quiz-container {
            background: rgba(0, 0, 0, 0.8);
            padding: 40px;
            border-radius: 20px;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
          }
          .quiz-title {
            font-size: 36px;
            margin-bottom: 20px;
            animation: bounce 1s ease infinite;
          }
          .quiz-question {
            font-size: 28px;
            margin-bottom: 30px;
            font-weight: bold;
          }
          .quiz-button {
            display: block;
            width: 100%;
            padding: 15px 20px;
            margin: 10px 0;
            font-size: 20px;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background: linear-gradient(45deg, #ff00ff, #00ffff);
            color: white;
            border: 3px solid white;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
            text-shadow: 2px 2px 0px #000;
          }
          .quiz-button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(255,255,255,0.5);
          }
          .quiz-button:active {
            transform: scale(0.95);
          }
          .quiz-result {
            font-size: 32px;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
        <div class="quiz-container">
          <div class="quiz-title">🧌 BRAINROT QUIZ 🧌</div>
          <div style="font-size: 20px; margin-bottom: 20px;">
            Answer this brainrot question to access the site:
          </div>
          <div class="quiz-question">${quiz.question}</div>
          <div id="quiz-answers">
            ${shuffledAnswers.map((answer, idx) => 
              `<button class="quiz-button" data-answer="${idx}" data-correct="${idx === correctIndex ? 'true' : 'false'}">${answer}</button>`
            ).join('')}
          </div>
          <div id="quiz-result" class="quiz-result"></div>
        </div>
      </div>
    `;

    // Inject overlay - works even before body exists
    const injectQuiz = () => {
      const container = document.body || document.documentElement;
      if (overlay.parentNode) {
        overlay.remove();
      }
      container.appendChild(overlay);

      // Attach event listeners after DOM is ready
      setTimeout(() => {
        const buttons = overlay.querySelectorAll('.quiz-button');
        const resultDiv = overlay.querySelector('#quiz-result');
        attachQuizListeners(buttons, resultDiv, overlay, correctIndex);
      }, 100);
    };

    // Inject overlay when DOM is ready
    if (document.body) {
      injectQuiz();
    } else if (document.documentElement) {
      document.documentElement.appendChild(overlay);
      const moveToBody = () => {
        if (document.body) {
          document.body.appendChild(overlay);
          injectQuiz();
        }
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', moveToBody);
      } else {
        moveToBody();
      }
    } else {
      const inject = () => {
        if (document.body || document.documentElement) {
          (document.body || document.documentElement).appendChild(overlay);
          injectQuiz();
        }
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
      }
      setTimeout(inject, 0);
    }
  }

  // Enhanced file detection (PDF, DOCX, PPTX, XLSX)
  function checkForProductiveFiles() {
    const urlLower = window.location.href.toLowerCase();
    
    // Check for file extensions
    const fileExtensions = ['.pdf', '.docx', '.pptx', '.xlsx'];
    if (fileExtensions.some(ext => urlLower.includes(ext) || urlLower.endsWith(ext))) {
      return true;
    }
    
    // Check content type
    const contentType = document.contentType || '';
    const productiveContentTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (productiveContentTypes.some(type => contentType.includes(type))) {
      return true;
    }
    
    // Check if PDF viewer is active (Chrome's built-in PDF viewer)
    if (document.querySelector('embed[type="application/pdf"]') ||
        document.querySelector('object[type="application/pdf"]')) {
      return true;
    }
    
    // Check body HTML if it exists (safely)
    if (document.body) {
      const bodyHTML = document.body.innerHTML || '';
      if (bodyHTML.includes('pdf') && bodyHTML.includes('viewer')) {
        return true;
      }
    }
    
    return false;
  }

  // Main logic
  function init() {
    const currentUrl = window.location.href;
    
    // Skip if explicitly allowed
    if (isAllowedSite(currentUrl)) {
      return;
    }
    
    // Skip if quiz already passed
    if (quizPassedThisSession) {
      return;
    }
    
    const isProductiveFile = checkForProductiveFiles();
    const isProductive = isProductiveSite(currentUrl);
    
    if (isProductive || isProductiveFile) {
      // Show quiz overlay immediately
      createQuizOverlay();
      
      // Clear any existing interval
      if (checkIntervalId) {
        clearInterval(checkIntervalId);
      }
      
      // Keep checking if quiz overlay gets removed (user might try to bypass)
      checkIntervalId = setInterval(() => {
        // Stop checking if quiz passed
        if (quizPassedThisSession) {
          clearInterval(checkIntervalId);
          checkIntervalId = null;
          return;
        }
        
        const url = window.location.href;
        if (isProductiveSite(url) || checkForProductiveFiles()) {
          if (!isAllowedSite(url)) {
            const existing = document.getElementById('evilBrainrotOverlay');
            if (!existing) {
              createQuizOverlay();
            }
          }
        }
      }, 1000);
    }
  }

  // Run immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    // Also run immediately for faster blocking
    setTimeout(init, 10);
  } else {
    init();
  }

  // Re-check on navigation (for SPAs)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      
      // Skip if explicitly allowed
      if (isAllowedSite(url)) {
        return;
      }
      
      const isProductiveFile = checkForProductiveFiles();
      if ((isProductiveSite(url) || isProductiveFile) && !quizPassedThisSession) {
        // Show quiz overlay
        createQuizOverlay();
      }
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Also listen to popstate for browser back/forward
  window.addEventListener('popstate', () => {
    const url = location.href;
    
    // Skip if explicitly allowed
    if (isAllowedSite(url)) {
      return;
    }
    
    const isProductiveFile = checkForProductiveFiles();
    if ((isProductiveSite(url) || isProductiveFile) && !quizPassedThisSession) {
      // Show quiz overlay
      createQuizOverlay();
    }
  });
})();
