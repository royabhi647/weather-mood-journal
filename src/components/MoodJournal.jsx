import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Moon, Sun, Download } from 'lucide-react';
import './MoodJournal.css';

function MoodJournal() {
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const moodOptions = [
    { name: 'happy', emoji: '😊', color: '#FFD700' },
    { name: 'calm', emoji: '😌', color: '#87CEEB' },
    { name: 'sad', emoji: '😢', color: '#6495ED' },
    { name: 'angry', emoji: '😠', color: '#FF6347' },
    { name: 'excited', emoji: '🤩', color: '#FF69B4' }
  ];

  const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⚡',
    'Drizzle': '🌦️',
    'Mist': '🌫️',
    'default': '🌡️'
  };

  useEffect(() => {
    const savedEntries = localStorage.getItem('moodEntries');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchWeatherData(latitude, longitude);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Unable to access location. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const API_KEY = "5b16b66df7fa4d7f3d184649ead148ee";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Weather data not available");
      }

      const data = await response.json();
      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        city: data.name
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Unable to fetch weather data. Please try again later.");
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!mood) {
      setNotification({ show: true, message: "Please select a mood" });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: date.toISOString(),
      mood,
      note,
      weather: weather ? {
        temp: weather.temp,
        condition: weather.condition,
        city: weather.city
      } : null
    };

    setEntries([newEntry, ...entries]);
    setMood('');
    setNote('');

    setNotification({ show: true, message: "Entry saved successfully!" });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(entry => entry.mood === filter);

  const exportEntries = () => {
    const header = "Date,Mood,Note,Temperature,Weather Condition,City\n";
    const csvContent = entries.reduce((acc, entry) => {
      const date = new Date(entry.date).toLocaleDateString();
      const weather = entry.weather ?
        `${entry.weather.temp}°C,${entry.weather.condition},${entry.weather.city}` :
        ",,";
      return acc + `"${date}","${entry.mood}","${entry.note}",${weather}\n`;
    }, header);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mood_journal_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMonthlyMoodData = () => {
    const monthlyData = {};

    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { total: 0, moods: {} };
      }

      monthlyData[monthYear].total += 1;

      if (!monthlyData[monthYear].moods[entry.mood]) {
        monthlyData[monthYear].moods[entry.mood] = 0;
      }

      monthlyData[monthYear].moods[entry.mood] += 1;
    });

    return Object.keys(monthlyData).map(month => ({
      month,
      ...monthlyData[month]
    })).slice(-6);
  };

  const monthlyData = getMonthlyMoodData();

  const getBackgroundStyle = () => {
    const selectedMood = moodOptions.find(m => m.name === mood);
    return selectedMood ? { backgroundColor: selectedMood.color + '20' } : {};
  };

  if (loading) {
    return (
      <div className={`loading-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading-spinner"></div>
        <p>Loading your mood journal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`error-container ${darkMode ? 'dark-mode' : ''}`}>
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`mood-journal ${darkMode ? 'dark-mode' : ''}`} style={mood ? getBackgroundStyle() : {}}>
      <header>
        <h1>Mood Journal</h1>
        <div className="header-actions">
          <button
            className="icon-button calendar-button"
            onClick={() => setShowCalendar(!showCalendar)}
            aria-label="Toggle Calendar View"
          >
            <Calendar size={24} />
          </button>
          <button
            className="icon-button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      <main>
        {!showCalendar ? (
          <div className="journal-entry">
            <div className="date-weather">
              <h2>{formatDate(date)}</h2>
              {weather && (
                <div className="weather-display">
                  <span className="weather-icon">
                    {weatherIcons[weather.condition] || weatherIcons.default}
                  </span>
                  <span className="weather-info">
                    {weather.temp}°C, {weather.description} in {weather.city}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mood-selector">
                <h3>How are you feeling today?</h3>
                <div className="mood-options">
                  {moodOptions.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      className={`mood-button ${mood === option.name ? 'selected' : ''}`}
                      onClick={() => setMood(option.name)}
                      style={{ backgroundColor: mood === option.name ? option.color : 'transparent' }}
                      aria-label={`Select ${option.name} mood`}
                    >
                      <span className="mood-emoji">{option.emoji}</span>
                      <span className="mood-name">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="note-section">
                <label htmlFor="journal-note">Journal Note:</label>
                <textarea
                  id="journal-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write your thoughts here..."
                  rows={4}
                ></textarea>
              </div>

              <button type="submit" className="save-button">Save Entry</button>
            </form>

            {notification.show && (
              <div className="notification">
                {notification.message}
              </div>
            )}
          </div>
        ) : (
          <div className="calendar-view">
            <div className="calendar-controls">
              <h2>Your Mood History</h2>
              <div className="filter-controls">
                <label htmlFor="mood-filter">Filter by mood:</label>
                <select
                  id="mood-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All moods</option>
                  {moodOptions.map(option => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <button className="export-button" onClick={exportEntries}>
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>

            {filteredEntries.length > 0 ? (
              <>
                <div className="entries-list">
                  {filteredEntries.map(entry => {
                    const entryDate = new Date(entry.date);
                    const moodData = moodOptions.find(m => m.name === entry.mood);

                    return (
                      <div
                        key={entry.id}
                        className="entry-card"
                        style={{ borderColor: moodData ? moodData.color : '#ccc' }}
                      >
                        <div className="entry-header">
                          <span className="entry-date">
                            {entryDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="entry-mood" title={entry.mood}>
                            {moodData ? moodData.emoji : ''}
                          </span>
                        </div>

                        {entry.note && <p className="entry-note">{entry.note}</p>}

                        {entry.weather && (
                          <div className="entry-weather">
                            <span className="weather-icon">
                              {weatherIcons[entry.weather.condition] || weatherIcons.default}
                            </span>
                            <span>
                              {entry.weather.temp}°C in {entry.weather.city}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {entries.length >= 5 && (
                  <div className="mood-trends">
                    <h3>Mood Trends</h3>
                    <div className="trend-chart">
                      {monthlyData.map((month, index) => (
                        <div key={index} className="month-column">
                          <div className="month-bars">
                            {moodOptions.map(mood => {
                              const count = month.moods[mood.name] || 0;
                              const percentage = month.total > 0 ?
                                (count / month.total) * 100 : 0;

                              return (
                                <div
                                  key={mood.name}
                                  className="mood-bar"
                                  style={{
                                    height: `${percentage}%`,
                                    backgroundColor: mood.color,
                                    display: percentage > 0 ? 'block' : 'none'
                                  }}
                                  title={`${mood.name}: ${count} entries (${Math.round(percentage)}%)`}
                                >
                                </div>
                              );
                            })}
                          </div>
                          <div className="month-label">{month.month}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mood-legend">
                      {moodOptions.map(mood => (
                        <div key={mood.name} className="legend-item">
                          <span
                            className="legend-color"
                            style={{ backgroundColor: mood.color }}
                          ></span>
                          <span className="legend-name">{mood.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-entries">
                <p>No entries found. Start adding your daily moods!</p>
                <button
                  className="back-button"
                  onClick={() => setShowCalendar(false)}
                >
                  Add New Entry
                </button>
              </div>
            )}

            <button
              className="back-button"
              onClick={() => setShowCalendar(false)}
            >
              Back to Journal
            </button>
          </div>
        )}
      </main>

      <footer>
        <p>Interactive Mood Journal with Weather Integration</p>
      </footer>
    </div>
  );
}

export default MoodJournal;