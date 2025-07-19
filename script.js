// script.js

// Grab buttons and content container
const wellnessBtn = document.getElementById('wellnessBtn');
const sustainabilityBtn = document.getElementById('sustainabilityBtn');
const contentArea = document.getElementById('contentArea');

// Habit Tracking Elements
const habitInput = document.getElementById('habitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitList = document.getElementById('habitList');
const streakMsg = document.getElementById('streakMsg');

// Sample content for each focus area
const wellnessContent = `
  <h2>Digital Wellness Tips</h2>
  <ul>
    <li>Take regular breaks from screens every hour.</li>
    <li>Set a no-phone time before bed.</li>
    <li>Use blue light filters in the evening.</li>
    <li>Practice mindfulness apps or breathing exercises.</li>
  </ul>
  <p>Track your wellness habits and improve your balance!</p>
`;

const sustainabilityContent = `
  <h2>E-Waste Recycling & Eco Tips</h2>
  <p>Find local recycling centers to safely dispose of old devices.</p>
  <input type="text" id="locationInput" placeholder="Enter your city or country" />
  <button id="searchRecyclingBtn">Search</button>
  <ul id="recyclingResults"></ul>
  <ul>
    <li>Recycle chargers, batteries, and phones.</li>
    <li>Support eco-friendly tech companies.</li>
    <li>Reduce digital clutter to lower energy usage.</li>
  </ul>
  <p>Track your sustainable actions and share progress.</p>
`;

// State for habits
let habits = JSON.parse(localStorage.getItem('digitalBalanceHabits')) || [];

// Function to save habits to localStorage
function saveHabits() {
  localStorage.setItem('digitalBalanceHabits', JSON.stringify(habits));
}

// Render habits list
function renderHabits() {
  habitList.innerHTML = '';
  habits.forEach((habit, index) => {
    const li = document.createElement('li');
    li.textContent = habit;
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✖';
    removeBtn.title = 'Remove habit';
    removeBtn.onclick = () => {
      habits.splice(index, 1);
      saveHabits();
      renderHabits();
      updateStreak();
    };
    li.appendChild(removeBtn);
    habitList.appendChild(li);
  });
  updateStreak();
}

// Simple streak based on count of habits
function updateStreak() {
  const streak = habits.length;
  streakMsg.textContent = `You have tracked ${streak} habit${streak !== 1 ? 's' : ''}! Keep going!`;
}

// Add habit button listener
addHabitBtn.addEventListener('click', () => {
  const habit = habitInput.value.trim();
  if (habit) {
    habits.push(habit);
    habitInput.value = '';
    saveHabits();
    renderHabits();
  }
});

// Show content based on focus
function showContent(type) {
  if (type === 'wellness') {
    contentArea.innerHTML = wellnessContent;
    wellnessBtn.classList.add('active');
    sustainabilityBtn.classList.remove('active');
  } else if (type === 'sustainability') {
    contentArea.innerHTML = sustainabilityContent;
    sustainabilityBtn.classList.add('active');
    wellnessBtn.classList.remove('active');
    setupRecyclingSearch(); // setup event listener for recycling search
  }
}

// Setup Recycling Center Search for Sustainability content
function setupRecyclingSearch() {
  const locationInput = document.getElementById('locationInput');
  const searchRecyclingBtn = document.getElementById('searchRecyclingBtn');
  const recyclingResults = document.getElementById('recyclingResults');

  searchRecyclingBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
      searchRecyclingCenters(location);
    }
  });

  async function searchRecyclingCenters(location) {
    recyclingResults.innerHTML = 'Searching...';

    const query = encodeURIComponent('e-waste recycling ' + location);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (data.length === 0) {
        recyclingResults.innerHTML = '<li>No results found.</li>';
        return;
      }

      recyclingResults.innerHTML = '';
      data.forEach(place => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${place.display_name}</strong><br/>Latitude: ${place.lat}, Longitude: ${place.lon}`;
        recyclingResults.appendChild(li);
      });
    } catch (error) {
      recyclingResults.innerHTML = `<li>Error fetching data: ${error.message}</li>`;
    }
  }
}

// Button event listeners
wellnessBtn.addEventListener('click', () => showContent('wellness'));
sustainabilityBtn.addEventListener('click', () => showContent('sustainability'));

// On page load show wellness content & render habits
window.onload = () => {
  showContent('wellness');
  renderHabits();
};
