// script.js

// Grab buttons and content container
const wellnessBtn = document.getElementById('wellnessBtn');
const sustainabilityBtn = document.getElementById('sustainabilityBtn');
const contentArea = document.getElementById('contentArea');

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
  <ul>
    <li>Recycle chargers, batteries, and phones.</li>
    <li>Support eco-friendly tech companies.</li>
    <li>Reduce digital clutter to lower energy usage.</li>
  </ul>
  <p>Track your sustainable actions and share progress.</p>
`;

// Function to update content based on selection
function showContent(type) {
  if (type === 'wellness') {
    contentArea.innerHTML = wellnessContent;
    wellnessBtn.classList.add('active');
    sustainabilityBtn.classList.remove('active');
  } else if (type === 'sustainability') {
    contentArea.innerHTML = sustainabilityContent;
    sustainabilityBtn.classList.add('active');
    wellnessBtn.classList.remove('active');
  }
}

// Add event listeners
wellnessBtn.addEventListener('click', () => showContent('wellness'));
sustainabilityBtn.addEventListener('click', () => showContent('sustainability'));

// Load wellness by default on page load
window.onload = () => {
  showContent('wellness');
};
