// 1. ZenQuotes API
async function fetchQuote(){
  try {
    const res = await fetch("https://zenquotes.io/api/today");
    const data = await res.json();
    document.getElementById("quote").textContent = `"${data[0].q}" — ${data[0].a}`;
  } catch {
    document.getElementById("quote").textContent = "Stay focused; small steps matter.";
  }
}
fetchQuote();

// 2. CO₂ Calculator via Climatiq
document.getElementById("calcBtn").addEventListener("click", async () => {
  const activity = document.getElementById("activitySelect").value;
  let reqBody = {};

  if(activity === "streaming"){
    reqBody = { activity:"data_transferred_video_streaming", distance:1, distance_unit:"hour" };
  } else if(activity === "ai_query"){
    reqBody = { activity:"api_call_ai_response", distance:1, distance_unit:"query" };
  } else {
    reqBody = { activity:"web_browsing", distance:1, distance_unit:"hour" };
  }

  try {
    const resp = await fetch("https://beta3.api.climatiq.io/estimate", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer YOUR_CLIMATIQ_API_KEY" },
      body: JSON.stringify(reqBody)
    });
    const json = await resp.json();
    const co2 = (json.co2e_kg * 1000).toFixed(1);
    document.getElementById("co2Result").textContent = `Estimated CO₂ emission: ${co2} g`;
  } catch {
    document.getElementById("co2Result").textContent = `Unable to calculate CO₂.`;
  }
});

// 3. Google Maps + Nearby Places
function initMap(){
  const defaultLoc = { lat:-1.9577, lng:30.1127 };
  const map = new google.maps.Map(document.getElementById("map"), { center:defaultLoc, zoom:13 });
  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch({ location:defaultLoc, radius:5000, keyword:"electronics recycling" },
    (results,status) => {
      if(status === google.maps.places.PlacesServiceStatus.OK && results.length){
        results.forEach(p => new google.maps.Marker({ map, position:p.geometry.location, title:p.name }));
      } else {
        document.getElementById("no-results").textContent =
          "😔 No centers found nearby. Please consider contacting EnviroServe Rwanda or local facilities.";
      }
    }
  );
}

