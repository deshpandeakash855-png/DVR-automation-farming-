# 🌱 DVR Smart Farming



### AI & IoT Powered Smart Farming Platform

Monitor • Predict • Automate • Optimize Agriculture

</div>

---

# 📖 Overview

DVR Smart Farming is an intelligent agriculture platform that combines **Artificial Intelligence (AI)**, **Internet of Things (IoT)**, **Cloud Computing**, and **Weather Intelligence** to help farmers monitor crops, automate irrigation, and make data-driven decisions.

The platform collects real-time data from ESP32-based sensors, stores it in Firebase, predicts irrigation needs using AI, integrates IBM Weather data, and allows farmers to interact with an AI-powered chatbot for personalized farming advice.

---

# 🚀 Features

## 🌡 Real-Time Monitoring
- Live Temperature Monitoring
- Live Humidity Monitoring
- Soil Moisture Monitoring
- ESP32 Online Status
- Water Tank Monitoring
- Pump Status

## 💧 Smart Irrigation
- Automatic Pump Control
- Manual Pump Control
- Moisture Threshold Settings
- Water Usage Optimization
- Smart Irrigation Scheduling

## ☁ Cloud Integration
- Firebase Authentication
- Firebase Realtime Database
- Cloud Synchronization
- Live Dashboard Updates

## 🤖 Artificial Intelligence
- Gemini AI Integration
- AI Agronomist
- Crop Recommendations
- Irrigation Suggestions
- Disease Prevention Tips
- Fertilizer Recommendations

## 🌦 Weather Intelligence
- IBM Weather API
- Current Weather
- Rain Prediction
- Wind Speed
- UV Index
- Weather Alerts

## 💬 AI Chat Assistant
Ask questions like:

- Why are my leaves turning yellow?
- Should I water my crops today?
- Which fertilizer should I use?
- What crop is best for my weather?
- Analyze my farm data.

---

# 🛠 Technology Stack

## Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Recharts

## Backend

- Node.js
- Express.js

## Database

- Firebase Realtime Database

## Authentication

- Firebase Authentication

## Hardware

- ESP32
- Soil Moisture Sensor
- DHT11/DHT22
- Relay Module
- Water Pump

## Artificial Intelligence

- Google Gemini API

## Weather

- IBM Weather API

---

# 📂 Project Structure

```
DVR-Smart-Farming
│
├── Dashboard
│
├── Backend
│
├── Firmware
│
├── Firebase
│
├── AI
│
├── Documentation
│
├── Assets
│
├── API
│
└── README.md
```

---

# 🏗 System Architecture

```
        Soil Moisture Sensor
                 │
        Temperature Sensor
                 │
          Humidity Sensor
                 │
                 ▼
             ESP32 Device
                 │
                 ▼
       Firebase Realtime Database
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
 Dashboard   IBM Weather   Gemini AI
      │          │          │
      └──────────┼──────────┘
                 ▼
        AI Smart Farming Chatbot
                 │
                 ▼
              Farmer
```

---

# 📊 Dashboard Modules

- Home Dashboard
- Live Sensor Monitoring
- Soil Moisture Gauge
- Weather Forecast
- AI Recommendation Panel
- AI Chat Assistant
- Pump Controller
- Automation Logs
- ESP32 Status
- User Profile
- Settings

---

# 🔥 Firebase Database Structure

```
Farm
│
├── Sensors
│     ├── Temperature
│     ├── Humidity
│     ├── SoilMoisture
│
├── Pump
│     ├── Status
│     └── Mode
│
├── Weather
│
├── AI
│
└── Users
```

---

# ⚙ Installation

Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/DVR-Smart-Farming.git
```

Go to Project

```bash
cd DVR-Smart-Farming
```

Install Dependencies

```bash
npm install
```

Run Project

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file.

```
VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_DATABASE_URL=

VITE_FIREBASE_PROJECT_ID=

VITE_GEMINI_API_KEY=

IBM_WEATHER_API_KEY=

IBM_WEATHER_URL=
```

---

# 🤖 AI Capabilities

✔ Crop Recommendation

✔ Irrigation Prediction

✔ Weather Analysis

✔ AI Chat Assistant

✔ Crop Health Suggestions

✔ Fertilizer Recommendation

✔ Smart Farming Analytics

---

# 📈 Future Enhancements

- Disease Detection using Computer Vision
- ESP32-CAM Integration
- Drone Monitoring
- Satellite Data Integration
- Yield Prediction
- Market Price Prediction
- Voice Assistant
- Multi-language Support

---

# 📷 Screenshots

Add screenshots here:

- Dashboard
- Login
- Weather Panel
- AI Chatbot
- Firebase Database
- ESP32 Serial Monitor

---

# 👨‍💻 Team

**Project Name:** DVR Smart Farming

**Hackathon:** MRUH Hackathon 2026

**Developed By:** Team DVR Smart Farming

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you like this project, give it a ⭐ on GitHub.

---

## 🌾 "Empowering Agriculture with Artificial Intelligence and IoT."
