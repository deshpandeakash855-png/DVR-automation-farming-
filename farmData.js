// Crop threshold configurations
export const CROP_PROFILES = {
  tomatoes: {
    name: "Tomatoes",
    emoji: "🍅",
    moisture: { critical_low: 20, ideal_low: 40, ideal_high: 70, critical_high: 85 },
    temp: { min: 18, ideal_low: 21, ideal_high: 27, max: 35 },
    humidity: { min: 50, ideal_low: 60, ideal_high: 80, max: 90 },
  },
  wheat: {
    name: "Wheat",
    emoji: "🌾",
    moisture: { critical_low: 15, ideal_low: 30, ideal_high: 60, critical_high: 75 },
    temp: { min: 10, ideal_low: 15, ideal_high: 24, max: 30 },
    humidity: { min: 40, ideal_low: 50, ideal_high: 70, max: 80 },
  },
  rice: {
    name: "Rice",
    emoji: "🌿",
    moisture: { critical_low: 40, ideal_low: 60, ideal_high: 90, critical_high: 95 },
    temp: { min: 20, ideal_low: 25, ideal_high: 32, max: 38 },
    humidity: { min: 60, ideal_low: 70, ideal_high: 90, max: 95 },
  },
  corn: {
    name: "Corn",
    emoji: "🌽",
    moisture: { critical_low: 18, ideal_low: 35, ideal_high: 65, critical_high: 80 },
    temp: { min: 15, ideal_low: 20, ideal_high: 30, max: 35 },
    humidity: { min: 45, ideal_low: 55, ideal_high: 75, max: 85 },
  },
  soybeans: {
    name: "Soybeans",
    emoji: "🫘",
    moisture: { critical_low: 20, ideal_low: 40, ideal_high: 65, critical_high: 80 },
    temp: { min: 15, ideal_low: 20, ideal_high: 28, max: 35 },
    humidity: { min: 50, ideal_low: 60, ideal_high: 80, max: 90 },
  },
};

// IMD-style 5-day district weather forecast
export function generateWeatherForecast() {
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Thunderstorm", "Clear"];
  const icons = {
    "Sunny": "☀️", "Partly Cloudy": "⛅", "Cloudy": "☁️",
    "Light Rain": "🌧️", "Thunderstorm": "⛈️", "Clear": "🌤️"
  };

  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const tempHigh = Math.round(25 + Math.random() * 12);
    const tempLow = tempHigh - Math.round(4 + Math.random() * 6);
    const isRainy = condition.includes("Rain") || condition.includes("Thunder");
    const rainChance = isRainy
      ? Math.round(40 + Math.random() * 55)
      : Math.round(Math.random() * 20);

    // IMD-specific metrics
    const rhDay = Math.round(30 + Math.random() * 40);
    const rhNight = Math.round(60 + Math.random() * 35);
    const rainfallForecastMm = isRainy
      ? Math.round((2 + Math.random() * 35) * 10) / 10
      : 0;

    days.push({
      day: i === 0 ? "Today" : dayNames[date.getDay()],
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      condition,
      icon: icons[condition],
      tempHigh,
      tempLow,
      rainChance,
      rhDay,
      rhNight,
      rainfallForecastMm,
      uvIndex: Math.round(2 + Math.random() * 9),
      windSpeed: Math.round(5 + Math.random() * 20),
      // Today-only IMD observation fields
      ...(i === 0 ? {
        rainfallPast24h: Math.round(Math.random() * 15 * 10) / 10,
        rainfall6hForecast: isRainy ? Math.round((1 + Math.random() * 20) * 10) / 10 : 0,
        rh0830: Math.round(50 + Math.random() * 40),
        rh1730: Math.round(25 + Math.random() * 35),
      } : {}),
    });
  }
  return days;
}

// Simulated ESP32 sensor data with realistic drift
export function createSensorSimulator() {
  let moisture = 45 + Math.random() * 20;
  let temperature = 24 + Math.random() * 6;
  let humidity = 55 + Math.random() * 20;
  let pumpActive = false;

  return {
    tick(cropProfile, weatherToday) {
      // Natural drift
      const heatFactor = Math.max(0, (temperature - 28) * 0.3);
      const rainBoost = weatherToday?.rainChance > 50 ? 0.2 : 0;
      
      if (pumpActive) {
        moisture = Math.min(95, moisture + 0.8 + Math.random() * 0.5);
      } else {
        moisture = Math.max(5, moisture - 0.15 - heatFactor * 0.1 + rainBoost);
      }
      
      temperature += (Math.random() - 0.48) * 0.4;
      temperature = Math.max(15, Math.min(40, temperature));
      
      humidity += (Math.random() - 0.5) * 1.2;
      humidity = Math.max(20, Math.min(98, humidity));

      // Autonomous irrigation logic
      const shouldPump = moisture < cropProfile.moisture.critical_low ||
        (moisture < cropProfile.moisture.ideal_low && weatherToday?.rainChance < 30);
      const shouldStop = moisture >= cropProfile.moisture.ideal_high;

      let event = null;
      if (shouldPump && !pumpActive) {
        pumpActive = true;
        event = { type: "start", moisture: Math.round(moisture), time: new Date() };
      } else if (shouldStop && pumpActive) {
        pumpActive = false;
        event = { type: "stop", moisture: Math.round(moisture), time: new Date() };
      }

      return {
        moisture: Math.round(moisture * 10) / 10,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        pumpActive,
        event,
      };
    },
    forceState(m, t, h, pump) {
      moisture = m; temperature = t; humidity = h; pumpActive = pump;
    }
  };
}

// AI Agronomist — cross-analyzes live ESP32 sensor data with official IMD forecast
export function generateAIInsights(sensorData, cropProfile, weather) {
  const insights = [];
  const { moisture, temperature, humidity } = sensorData;
  const today = weather[0];
  const tomorrow = weather[1];

  // FAIL-SAFE: Heavy rain within 6 hours → delay watering
  if (today?.rainfall6hForecast >= 10) {
    insights.push({
      type: "warning",
      title: "Rainfall Fail-Safe Activated",
      message: `OpenWeather forecast: ${today.rainfall6hForecast}mm of rain within the next 6 hours. AI Engine has DELAYED automatic irrigation to conserve water. Watering will resume only if soil drops below critical moisture.`,
      priority: "high",
    });
  }

  // PREDICTIVE SOIL DRYNESS ALERT
  if (tomorrow && tomorrow.rainfallForecastMm === 0 && today.tempHigh > 28) {
    const hoursUntilDry = Math.max(4, Math.round((moisture - cropProfile.moisture.critical_low) / 2.2));
    insights.push({
      type: "warning",
      title: "Predictive Soil Dryness Alert",
      message: `AI Predicts: Due to OpenWeather forecast of ${today.tempHigh}°C heat and ${tomorrow.rainfallForecastMm}mm rainfall tomorrow, your soil moisture will drop below critical levels in approximately ${hoursUntilDry} hours.`,
      priority: "high",
    });
  }

  // PERSONALIZED PLANT SUGGESTION — fungal risk from high humidity
  if (today?.rh0830 > 75 && temperature > 24 && temperature < 32) {
    insights.push({
      type: "info",
      title: "AI Suggestion — Fungal Risk",
      message: `OpenWeather reports high humidity (${today.rh0830}%) today. Combined with current ${Math.round(temperature)}°C temperatures, this increases fungal risks for ${cropProfile.name}. Keep a close eye on the Live Camera feed.`,
      priority: "medium",
    });
  }

  // Plant condition assessment
  const moistureOk = moisture >= cropProfile.moisture.ideal_low && moisture <= cropProfile.moisture.ideal_high;
  const tempOk = temperature >= cropProfile.temp.ideal_low && temperature <= cropProfile.temp.ideal_high;
  const humidityOk = humidity >= cropProfile.humidity.ideal_low && humidity <= cropProfile.humidity.ideal_high;

  if (moistureOk && tempOk && humidityOk) {
    insights.push({
      type: "success",
      title: "Optimal Conditions",
      message: `All sensor readings are within ideal ranges for ${cropProfile.name}. The AI engine continues to cross-monitor with IMD forecasts.`,
      priority: "low",
    });
  } else {
    const issues = [];
    if (!moistureOk) issues.push(moisture < cropProfile.moisture.ideal_low ? "low soil moisture" : "high soil moisture");
    if (!tempOk) issues.push(temperature < cropProfile.temp.ideal_low ? "low temperature" : "high temperature");
    if (!humidityOk) issues.push(humidity < cropProfile.humidity.ideal_low ? "low humidity" : "high humidity");

    insights.push({
      type: "info",
      title: "Condition Advisory",
      message: `AI is monitoring ${issues.join(", ")} for your ${cropProfile.name} crop. Irrigation parameters are being adjusted autonomously.`,
      priority: "medium",
    });
  }

  // Rain expected — irrigation will be paused
  if (tomorrow && tomorrow.rainfallForecastMm > 5) {
    insights.push({
      type: "info",
      title: "Rain Expected",
      message: `OpenWeather forecasts ${tomorrow.rainfallForecastMm}mm rainfall on ${tomorrow.day}. Irrigation will be paused to conserve water and prevent over-saturation.`,
      priority: "medium",
    });
  }

  // UV warning
  if (today.uvIndex > 7) {
    insights.push({
      type: "warning",
      title: "High UV Index",
      message: `UV index is ${today.uvIndex} today. Consider shade cloth deployment for sensitive ${cropProfile.name} varieties.`,
      priority: "medium",
    });
  }

  return insights;
}
