// OpenWeather API Configuration
// Update OPENWEATHER_API_KEY with your token from https://openweathermap.org/api
const OPENWEATHER_API_KEY = "your open whether api key";

// Default location — change to your farm's city or coordinates
const LOCATION = "Pune,IN";

const API_BASE = "https://api.openweathermap.org/data/2.5";

const ICON_MAP = {
  "01d": "☀️", "01n": "🌙",
  "02d": "⛅", "02n": "☁️",
  "03d": "☁️", "03n": "☁️",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌧️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "🌨️", "13n": "🌨️",
  "50d": "🌫️", "50n": "🌫️",
};

export async function fetchWeatherForecast() {
  const currentUrl = `${API_BASE}/weather?q=${LOCATION}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const forecastUrl = `${API_BASE}/forecast?q=${LOCATION}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error("Failed to fetch weather data from OpenWeather");
  }

  const current = await currentRes.json();
  const forecastData = await forecastRes.json();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayStr = new Date().toISOString().split("T")[0];

  // Group 3-hour forecast entries by day
  const dayGroups = {};
  forecastData.list.forEach((entry) => {
    const date = new Date(entry.dt * 1000);
    const dateStr = date.toISOString().split("T")[0];
    if (!dayGroups[dateStr]) {
      dayGroups[dateStr] = { date, entries: [], isToday: dateStr === todayStr };
    }
    dayGroups[dateStr].entries.push(entry);
  });

  return Object.values(dayGroups).slice(0, 5).map((group) => {
    const entries = group.entries;
    const temps = entries.map((e) => e.main.temp);
    const tempHigh = Math.round(Math.max(...temps));
    const tempLow = Math.round(Math.min(...temps));

    const humidities = entries.map((e) => e.main.humidity);
    const rhDay = Math.round(Math.max(...humidities));
    const rhNight = Math.round(Math.min(...humidities));

    const rainVolumes = entries.map((e) => e.rain?.["3h"] ?? 0);
    const rainfallForecastMm = Math.round(rainVolumes.reduce((a, b) => a + b, 0) * 10) / 10;

    const pops = entries.map((e) => e.pop ?? 0);
    const rainChance = Math.round(Math.max(...pops) * 100);

    const weather = entries[0].weather[0];
    const icon = ICON_MAP[weather.icon] || "☁️";
    const condition = weather.main;

    const windSpeed = Math.round(entries[0].wind.speed * 3.6); // m/s → km/h

    const day = {
      day: group.isToday ? "Today" : dayNames[group.date.getDay()],
      date: group.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      condition,
      icon,
      tempHigh,
      tempLow,
      rainChance,
      rhDay,
      rhNight,
      rainfallForecastMm,
      uvIndex: 0, // Not available on OpenWeather free tier
      windSpeed,
    };

    if (group.isToday) {
      // 6-hour rainfall forecast (first two 3-hour entries)
      const sixHourRain = (entries[0]?.rain?.["3h"] ?? 0) + (entries[1]?.rain?.["3h"] ?? 0);
      day.rainfall6hForecast = Math.round(sixHourRain * 10) / 10;
      day.rainfallPast24h = Math.round((current.rain?.["1h"] ?? 0) * 10) / 10;
      day.rh0830 = Math.round(current.main.humidity);
      day.rh1730 = Math.round(humidities[Math.floor(humidities.length / 2)] ?? current.main.humidity);
    }

    return day;
  });
}
