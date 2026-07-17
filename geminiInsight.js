import { base44 } from "@/api/base44Client";

// JSON schema Gemini must respond with — matches the { type, title, message, priority }
// insight shape consumed by the <AIInsights /> component.
const INSIGHT_SCHEMA = {
  type: "object",
  properties: {
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["warning", "success", "info"] },
          title: { type: "string" },
          message: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["type", "title", "message", "priority"],
      },
    },
  },
  required: ["insights"],
};

// Generates AI agronomy insights from live ESP32 sensor data + OpenWeather forecast
// using Gemini. Returns an array of insight objects.
export async function generateGeminiInsights(sensorData, cropProfile, weather) {
  const { moisture, temperature, humidity } = sensorData;
  const today = weather[0] || {};
  const tomorrow = weather[1] || {};

  const prompt = `You are an expert AI agronomist monitoring a smart irrigation farm. Analyze the live ESP32 sensor readings below against the crop profile and the OpenWeather forecast, then produce a concise list of actionable insights for the farmer.

CROP: ${cropProfile.name}
Ideal soil moisture: ${cropProfile.moisture.ideal_low}–${cropProfile.moisture.ideal_high}% (critical low ${cropProfile.moisture.critical_low}%, critical high ${cropProfile.moisture.critical_high}%)
Ideal temperature: ${cropProfile.temp.ideal_low}–${cropProfile.temp.ideal_high}°C
Ideal humidity: ${cropProfile.humidity.ideal_low}–${cropProfile.humidity.ideal_high}%

LIVE SENSOR READINGS (current zone):
- Soil moisture: ${moisture != null ? moisture + "%" : "no data"}
- Temperature: ${temperature != null ? temperature + "°C" : "no data"}
- Humidity: ${humidity != null ? humidity + "%" : "no data"}

WEATHER (OpenWeather):
- Today: ${today.condition ?? "unknown"}, high ${today.tempHigh ?? "—"}°C / low ${today.tempLow ?? "—"}°C, daytime humidity ${today.rhDay ?? "—"}%, rainfall next 6h ${today.rainfall6hForecast ?? 0}mm, UV index ${today.uvIndex ?? "—"}
- Tomorrow: ${tomorrow.condition ?? "unknown"}, high ${tomorrow.tempHigh ?? "—"}°C, rainfall forecast ${tomorrow.rainfallForecastMm ?? 0}mm

Produce 2 to 5 insights. Each insight must have:
- type: "warning" (urgent risk / fail-safe), "success" (conditions are optimal), or "info" (advisory)
- title: a short label (max ~6 words)
- message: one or two specific, actionable sentences that reference the actual numbers above
- priority: "high", "medium", or "low"

Focus on irrigation decisions, soil-moisture trends, heat and rainfall risks, fungal/disease risk from high humidity, and UV exposure. Be concrete and cite the real readings.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: "gemini_3_flash",
    add_context_from_internet: true,
    response_json_schema: INSIGHT_SCHEMA,
  });

  const insights = result?.insights ?? [];
  return insights.filter((i) => i && i.title && i.message);
}
