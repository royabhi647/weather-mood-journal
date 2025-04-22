# 🌦️ Mood Journal with Weather Integration

An interactive web application that allows users to track their daily moods alongside real-time weather data.

---

## 🚀 Features

### Core Functionality
- **📝 Daily Mood Logging**: Choose from 5 different mood options with visual emoji representation.
- **☀️ Weather Integration**: Automatically captures local weather data using the user's geolocation.
- **📓 Journal Notes**: Add personal notes to each mood entry.
- **💾 Persistent Storage**: All entries are saved to browser localStorage.
- **📅 Calendar View**: Review past entries in an organized calendar interface.
- **🔍 Mood Filtering**: Filter entries by specific mood types.

### Enhanced User Experience
- **📱 Responsive Design**: Works seamlessly on both mobile and desktop devices.
- **🎨 Dynamic Theming**: Background changes based on selected mood.
- **🌙 Dark Mode**: Toggle between light and dark themes.
- **📤 Data Export**: Export all journal entries as a CSV file.
- **📊 Mood Trends**: Visualize mood patterns over time with a trend graph.
- **✨ Smooth Animations**: Interactive and fluid UI transitions.

---

## 🛠️ Tech Stack

- **React**: Frontend library for building the UI.
- **CSS**: Custom styling with CSS variables for theming.
- **OpenWeatherMap API**: For real-time weather data.
- **Browser Geolocation API**: For detecting user location.
- **LocalStorage**: For saving mood entries persistently in the browser.

---

## 🧩 Installation and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/mood-journal.git
cd mood-journal

# Install dependencies
npm install

# Add your API key to a .env file
echo "REACT_APP_WEATHER_API_KEY=your_api_key_here" > .env

# Start the development server
npm run dev