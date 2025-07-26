// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKDpzYJDKYmuk-ZFWxC8WQwDrcGOBAi24",
  authDomain: "greenly-43c78.firebaseapp.com",
  projectId: "greenly-43c78",
  storageBucket: "greenly-43c78.firebasestorage.app",
  messagingSenderId: "579986163152",
  appId: "1:579986163152:web:5cc2f5b513b135a6a625d5",
  measurementId: "G-2QVMPR4D5V"
};

// API Keys
const YOUTUBE_API_KEY = 'AIzaSyC1parPR5F0yTNLh6t6uD2ALuPJpFkQmb0';
const NEWS_API_KEY = '7f5a7d5b037a4f5abd8838f14fe128f5';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const userEmail = document.getElementById('user-email');
const userName = document.getElementById('user-name');
const streakCount = document.getElementById('streakCount');
const dailyQuote = document.getElementById('daily-quote');

// App State
let currentMode = 'eco'; // default mode
let currentUser = null;
let streakTimer;

// Inspirational quotes for daily motivation
const inspirationalQuotes = [
  "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
  "We do not inherit the Earth from our ancestors; we borrow it from our children. - Native American Proverb",
  "The greatest threat to our planet is the belief that someone else will save it. - Robert Swan",
  "In every walk with nature, one receives far more than he seeks. - John Muir",
  "The Earth does not belong to us: we belong to the Earth. All things are connected like the blood that unites one family. - Chief Seattle",
  "Never doubt that a small group of thoughtful, committed citizens can change the world; indeed, it's the only thing that ever has. - Margaret Mead",
  "We don't need a handful of people doing zero waste perfectly. We need millions of people doing it imperfectly. - Anne Marie Bonneau",
  "The ultimate test of man's conscience may be his willingness to sacrifice something today for the sake of something better tomorrow. - Martin Luther King Jr.",
  "What we are doing to the forests of the world is but a mirror reflection of what we are doing to ourselves and to one another. - Mahatma Gandhi",
  "The future will either be green or not at all. - Bob Brown"
];

// Auth State Listener
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    showDashboard(user);
    loadUserData(user.uid);
    loadContent();
    updateDailyQuote();
    startStreakTimer();
  } else {
    currentUser = null;
    showAuth();
    stopStreakTimer();
  }
});

// Show Dashboard
function showDashboard(user) {
  authContainer.classList.add('hidden');
  dashboard.classList.remove('hidden');
  
  // Update user info
  userEmail.textContent = user.email;
  userName.textContent = user.email.split('@')[0];
  
  // Add fade-in animation
  dashboard.classList.add('fade-in');
  
  // Initialize mode buttons after slight delay to ensure DOM is ready
  setTimeout(initializeModeButtons, 100);
}

// Show Auth
function showAuth() {
  dashboard.classList.add('hidden');
  authContainer.classList.remove('hidden');
  authContainer.classList.add('fade-in');
}

// Initialize Mode Buttons
function initializeModeButtons() {
  const ecoBtn = document.getElementById('eco-mode');
  const wellnessBtn = document.getElementById('wellness-mode');
  
  if (ecoBtn && wellnessBtn) {
    // Remove any existing event listeners to prevent duplicates
    ecoBtn.replaceWith(ecoBtn.cloneNode(true));
    wellnessBtn.replaceWith(wellnessBtn.cloneNode(true));
    
    // Get new references
    const newEcoBtn = document.getElementById('eco-mode');
    const newWellnessBtn = document.getElementById('wellness-mode');
    
    newEcoBtn.addEventListener('click', () => setMode('eco'));
    newWellnessBtn.addEventListener('click', () => setMode('wellness'));
    
    // Set initial active state
    setMode(currentMode);
  }
}

// Set Mode Function
function setMode(mode) {
  currentMode = mode;
  
  // Update button states
  const ecoBtn = document.getElementById('eco-mode');
  const wellnessBtn = document.getElementById('wellness-mode');
  
  if (ecoBtn && wellnessBtn) {
    ecoBtn.classList.toggle('active', mode === 'eco');
    wellnessBtn.classList.toggle('active', mode === 'wellness');
  }
  
  // Update mode title
  const modeTitle = document.getElementById('mode-title');
  if (modeTitle) {
    modeTitle.textContent = mode === 'eco' ? 'Eco Awareness' : 'Digital Wellness';
  }
  
  // Reload content based on mode
  loadContent();
}

// Load User Data
async function loadUserData(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      streakCount.textContent = userData.streak || 0;
      
      // Check if user has visited today
      checkAndUpdateStreak(userId, userData);
    } else {
      // Create new user document
      await db.collection('users').doc(userId).set({
        email: currentUser.email,
        streak: 0,
        lastVisit: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error loading user ', error);
  }
}

// Check and Update Streak
async function checkAndUpdateStreak(userId, userData) {
  const today = new Date().toDateString();
  const lastVisit = userData.lastVisit ? userData.lastVisit.toDate().toDateString() : null;
  
  // If user hasn't visited today, update streak
  if (lastVisit !== today) {
    let newStreak = userData.streak || 0;
    
    // If they visited yesterday, increment streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastVisit === yesterday.toDateString()) {
      newStreak += 1;
    } else {
      // Reset streak if they missed a day
      newStreak = 1;
    }
    
    // Update Firestore
    await db.collection('users').doc(userId).update({
      streak: newStreak,
      lastVisit: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update UI
    streakCount.textContent = newStreak;
    
    // Show streak celebration if streak is 3+ days
    if (newStreak >= 3) {
      showStreakCelebration(newStreak);
    }
  }
}

// Show Streak Celebration
function showStreakCelebration(days) {
  // Remove any existing celebrations
  const existing = document.querySelector('.streak-celebration');
  if (existing) existing.remove();
  
  const celebration = document.createElement('div');
  celebration.className = 'streak-celebration';
  celebration.innerHTML = `
    <div class="celebration-content">
      <i class="fas fa-fire"></i>
      <h3>${days} Day Streak! 🔥</h3>
      <p>Amazing commitment to wellness and sustainability!</p>
    </div>
  `;
  
  document.body.appendChild(celebration);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (celebration.parentNode) {
      celebration.remove();
    }
  }, 3000);
}

// Login Function
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    showDashboard(userCredential.user);
  } catch (error) {
    alert(`Login Error: ${error.message}`);
  }
}

// Signup Function
async function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    showDashboard(userCredential.user);
    
    // Create user document
    await db.collection('users').doc(userCredential.user.uid).set({
      email: email,
      streak: 1, // Start with 1 day streak
      lastVisit: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update streak display
    streakCount.textContent = '1';
    
  } catch (error) {
    alert(`Signup Error: ${error.message}`);
  }
}

// Logout Function
async function logout() {
  try {
    await auth.signOut();
    showAuth();
  } catch (error) {
    alert(`Logout Error: ${error.message}`);
  }
}

// Load All Content
async function loadContent() {
  loadVideos();
  loadNews();
  loadTips();
}

// Load YouTube Videos with Mode-Specific Content
async function loadVideos() {
  const videoSection = document.getElementById('video-section');
  videoSection.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading inspiring content...</p>';
  
  try {
    // Mode-specific search queries
    let searchQuery;
    if (currentMode === 'eco') {
      searchQuery = 'sustainability environment climate change eco friendly renewable energy';
    } else {
      searchQuery = 'mindfulness meditation digital wellness mental health screen time balance';
    }
    
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&q=${encodeURIComponent(searchQuery)}&type=video&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      let videoHTML = '<div class="video-grid">';
      data.items.forEach(item => {
        const video = item.snippet;
        videoHTML += `
          <div class="video-card">
            <div class="video-embed">
              <iframe 
                src="https://www.youtube.com/embed/${item.id.videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                loading="lazy">
              </iframe>
            </div>
            <div class="video-info">
              <h4>${truncateText(video.title, 60)}</h4>
              <p class="channel">${video.channelTitle}</p>
            </div>
          </div>
        `;
      });
      videoHTML += '</div>';
      videoSection.innerHTML = videoHTML;
    } else {
      videoSection.innerHTML = '<p>No videos found. Try again later.</p>';
    }
  } catch (error) {
    console.error('Error loading videos:', error);
    videoSection.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Unable to load videos right now. Please check your internet connection.</p>
        <button onclick="loadVideos()" class="retry-btn">Retry</button>
      </div>
    `;
  }
}

// Truncate text helper
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Load News with Working NewsAPI
async function loadNews() {
  const newsSection = document.getElementById('news-section');
  newsSection.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading latest news...</p>';
  
  try {
    // Mode-specific news queries
    let newsQuery;
    if (currentMode === 'eco') {
      newsQuery = 'environment+sustainability+climate';
    } else {
      newsQuery = 'wellness+mental+health+mindfulness';
    }
    
    // Using a CORS proxy to access NewsAPI
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://newsapi.org/v2/everything?q=${newsQuery}&sortBy=publishedAt&language=en&pageSize=4&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(proxyUrl + apiUrl);
    
    if (!response.ok) {
      throw new Error(`News API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      let newsHTML = '<div class="news-list">';
      data.articles.slice(0, 4).forEach(article => {
        const date = new Date(article.publishedAt).toLocaleDateString();
        newsHTML += `
          <div class="news-card">
            <h4>${truncateText(article.title, 80)}</h4>
            <p class="news-source">${article.source.name} • ${date}</p>
            <p class="news-description">${truncateText(article.description || article.content, 120)}</p>
            <a href="${article.url}" target="_blank" class="read-more">Read full article →</a>
          </div>
        `;
      });
      newsHTML += '</div>';
      newsSection.innerHTML = newsHTML;
    } else {
      newsSection.innerHTML = '<p>No news articles found. Try again later.</p>';
    }
  } catch (error) {
    console.error('Error loading news:', error);
    // Fallback to sample data
    loadSampleNews();
  }
}

// Fallback Sample News
function loadSampleNews() {
  const newsSection = document.getElementById('news-section');
  
  let sampleNews;
  if (currentMode === 'eco') {
    sampleNews = [
      {
        title: "New Solar Panel Technology Increases Efficiency by 40%",
        source: { name: "Green Tech News" },
        publishedAt: new Date().toISOString(),
        description: "Scientists develop breakthrough solar cells that could revolutionize renewable energy adoption worldwide.",
        url: "https://example.com/solar-news"
      },
      {
        title: "Cities Worldwide Commit to Carbon Neutrality by 2050",
        source: { name: "Environmental Journal" },
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        description: "Over 100 major cities announce ambitious plans to achieve net-zero carbon emissions in the next 30 years.",
        url: "https://example.com/carbon-news"
      },
      {
        title: "Ocean Cleanup Project Removes 100 Tons of Plastic",
        source: { name: "Marine Conservation" },
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        description: "Innovative technology successfully removes massive amounts of plastic waste from ocean gyres.",
        url: "https://example.com/ocean-news"
      }
    ];
  } else {
    sampleNews = [
      {
        title: "Digital Detox: How Unplugging Improves Mental Health",
        source: { name: "Wellness Today" },
        publishedAt: new Date().toISOString(),
        description: "New research shows significant mental health benefits from regular digital breaks and mindful technology use.",
        url: "https://example.com/detox-news"
      },
      {
        title: "The Science Behind Mindfulness and Stress Reduction",
        source: { name: "Mindful Living" },
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        description: "Neuroscientists explain how mindfulness practices rewire the brain to reduce stress and anxiety.",
        url: "https://example.com/mindfulness-news"
      },
      {
        title: "Screen Time Guidelines for Better Sleep Quality",
        source: { name: "Sleep Health" },
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        description: "Experts recommend specific screen time limits to improve sleep patterns and overall well-being.",
        url: "https://example.com/sleep-news"
      }
    ];
  }
  
  let newsHTML = '<div class="news-list">';
  sampleNews.forEach(article => {
    const date = new Date(article.publishedAt).toLocaleDateString();
    newsHTML += `
      <div class="news-card">
        <h4>${truncateText(article.title, 80)}</h4>
        <p class="news-source">${article.source.name} • ${date}</p>
        <p class="news-description">${truncateText(article.description, 120)}</p>
        <a href="${article.url}" target="_blank" class="read-more">Read full article →</a>
      </div>
    `;
  });
  newsHTML += '</div>';
  newsSection.innerHTML = newsHTML;
}

// Load Tips (Mode-Specific)
function loadTips() {
  const tipsSection = document.getElementById('tips-section');
  
  let tips;
  if (currentMode === 'eco') {
    tips = [
      "💡 Unplug devices when not in use to save energy",
      "🌱 Choose streaming quality that matches your needs to reduce data usage",
      "♻️ Recycle old electronics at certified e-waste centers",
      "🔋 Enable power saving mode on all your devices",
      "🔌 Use smart power strips to eliminate phantom energy drain",
      "📱 Repair instead of replace - extend device lifespan"
    ];
  } else {
    tips = [
      "🧘 Take 5-minute mindfulness breaks every hour",
      "📱 Set app timers to limit social media usage",
      "🌙 Create a device-free bedtime routine for better sleep",
      "⏰ Schedule regular digital detox periods",
      "📵 Designate phone-free zones in your home",
      "💭 Practice single-tasking instead of multitasking"
    ];
  }
  
  let tipsHTML = '<div class="tips-carousel">';
  tips.forEach((tip, index) => {
    tipsHTML += `
      <div class="tip-card ${index === 0 ? 'active' : ''}">
        <p>${tip}</p>
      </div>
    `;
  });
  tipsHTML += '</div>';
  
  tipsSection.innerHTML = tipsHTML;
}

// Update Daily Quote
function updateDailyQuote() {
  const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
  dailyQuote.innerHTML = `
    <i class="fas fa-quote-left"></i>
    ${inspirationalQuotes[randomIndex]}
    <i class="fas fa-quote-right"></i>
  `;
}

// Streak Timer - Update quote every 24 hours
function startStreakTimer() {
  // Update quote every 24 hours (86400000 ms)
  if (streakTimer) {
    clearInterval(streakTimer);
  }
  streakTimer = setInterval(() => {
    updateDailyQuote();
  }, 86400000); // 24 hours
}

function stopStreakTimer() {
  if (streakTimer) {
    clearInterval(streakTimer);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Auth buttons
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (loginBtn) loginBtn.addEventListener('click', login);
  if (signupBtn) signupBtn.addEventListener('click', signup);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  
  // Enter key support
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        login();
      }
    });
  }
  
  // Initialize mode buttons if user is already logged in
  if (auth.currentUser) {
    setTimeout(initializeModeButtons, 100);
  }
});

// Initialize content when page loads
if (auth.currentUser) {
  loadContent();
  updateDailyQuote();
}