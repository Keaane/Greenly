// Inspirational Quote API
async function fetchQuote() {
  try {
    const response = await fetch("https://zenquotes.io/api/today");
    const data = await response.json();
    const quote = `"${data[0].q}" — ${data[0].a}`;
    document.getElementById("quote").textContent = quote;
  } catch (error) {
    document.getElementById("quote").textContent = "Stay inspired and grounded.";
  }
}
fetchQuote();

// Wellness and Sustainability Tips
const tips = {
  wellness: [
    "Take 5-minute screen breaks every hour.",
    "Turn off notifications while focusing.",
    "Unplug before bed to improve sleep.",
    "Use blue light filters at night.",
    "Practice mindfulness or meditation daily.",
  ],
  sustainability: [
    "Reduce e-waste by repairing before replacing.",
    "Unplug unused chargers to save energy.",
    "Buy second-hand electronics when possible.",
    "Recycle your devices responsibly.",
    "Support eco-friendly tech brands.",
  ],
};

function showTips(type) {
  const list = document.getElementById("tipsList");
  list.innerHTML = "";
  tips[type].forEach(tip => {
    const li = document.createElement("li");
    li.textContent = tip;
    list.appendChild(li);
  });
}

// Google Maps + Places API: Recycling Centers
function initMap() {
  const rwanda = { lat: -1.9577, lng: 30.1127 };
  const map = new google.maps.Map(document.getElementById("map"), {
    center: rwanda,
    zoom: 13,
  });

  const request = {
    location: rwanda,
    radius: 5000,
    keyword: "electronics recycling",
  };

  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length) {
      results.forEach(place => {
        new google.maps.Marker({
          map,
          position: place.geometry.location,
          title: place.name,
        });
      });
    } else {
      document.getElementById("no-results").textContent =
        "😔 No recycling centers found near you. Try contacting EnviroServe Rwanda or ask your local authorities.";
    }
  });
}
