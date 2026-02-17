import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ProfileScreen = ({ hikes, setCurrentScreen, user }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate personal records
  const records = {
    totalDistance: hikes.reduce((sum, h) => sum + (h.distance || 0), 0),
    totalElevation: hikes.reduce((sum, h) => sum + (h.elevationGain || 0), 0),
    totalHikes: hikes.length,
    longestHike: Math.max(...hikes.map(h => h.distance || 0), 0),
    highestElevation: Math.max(...hikes.map(h => h.maxElevation || 0), 0),
    fastestPace: hikes.length > 0 ? 
      Math.min(...hikes.map(h => {
        if (!h.distance || !h.duration) return Infinity;
        const hours = parseInt(h.duration.split(':')[0]) + 
                     parseInt(h.duration.split(':')[1]) / 60;
        return h.distance / hours;
      })) : 0,
    averageDistance: hikes.length > 0 ? 
      hikes.reduce((sum, h) => sum + (h.distance || 0), 0) / hikes.length : 0,
    bestHike: hikes.length > 0 ? 
      hikes.reduce((best, current) => 
        (current.distance || 0) > (best.distance || 0) ? current : best
      ) : null
  };

  // Simulated weather data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setWeatherData({
        current_weather: {
          temperature: 18,
          windspeed: 12,
          weathercode: 0
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  // Export data
  const exportData = () => {
    const dataStr = JSON.stringify(hikes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hikompanion-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const merged = [...imported, ...hikes];
          const unique = merged.filter((hike, index, self) =>
            index === self.findIndex(h => h.id === hike.id)
          );
          localStorage.setItem('hikes', JSON.stringify(unique));
          window.location.reload();
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Logout function
  const handleLogout = () => {
    if (window.confirm('Log out from HiKompanion?')) {
      localStorage.removeItem('currentUser');
      window.location.reload();
    }
  };

  return (
    <div className="App">
      <div className="top-bar">
        <span className="time">{format(new Date(), 'h:mm a')}</span>
        <div className="menu-icons">
          <div className="menu-icon"></div>
          <div className="menu-icon"></div>
        </div>
      </div>

      <div className="content" style={{ paddingBottom: '80px' }}>
        <div className="detail-header">
          <button onClick={() => setCurrentScreen('home')} className="back-btn">
            ←
          </button>
          <div>
            <h2 className="detail-title">Profile</h2>
            <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
              {user?.displayName || user?.username}
            </p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="stats-card" style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#111',
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #333',
            fontSize: '40px'
          }}>
            👤
          </div>
          <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '5px' }}>
            {user?.displayName || user?.username}
          </h2>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
          </p>
        </div>

        {/* Weather Widget */}
        <div className="stats-card" style={{ marginBottom: '24px' }}>
          <div className="stats-header">
            <span>Current Weather</span>
            <span>🌤️</span>
          </div>
          {loading ? (
            <p style={{ color: '#888' }}>Loading...</p>
          ) : weatherData ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stats-value" style={{ fontSize: '32px' }}>
                  {weatherData.current_weather.temperature}°C
                </div>
                <div className="stats-label">
                  Wind: {weatherData.current_weather.windspeed} km/h
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px' }}>
                  {weatherData.current_weather.weathercode === 0 ? '☀️' : '☁️'}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#888' }}>Weather unavailable</p>
          )}
        </div>

        {/* Personal Records */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-icon">📏</div>
            <div className="stat-number">{records.totalDistance.toFixed(1)}</div>
            <div className="stat-label">total km</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⛰️</div>
            <div className="stat-number">{records.totalElevation.toFixed(0)}</div>
            <div className="stat-label">total m</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">{records.totalHikes}</div>
            <div className="stat-label">hikes</div>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-number">{records.longestHike.toFixed(1)}</div>
            <div className="stat-label">longest km</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⛰️</div>
            <div className="stat-number">{records.highestElevation.toFixed(0)}</div>
            <div className="stat-label">max elevation</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-number">{records.fastestPace.toFixed(1)}</div>
            <div className="stat-label">fastest km/h</div>
          </div>
        </div>

        {/* Best Hike */}
        {records.bestHike && (
          <div className="stats-card" style={{ marginBottom: '24px' }}>
            <div className="stats-header">
              <span>Best Hike</span>
              <span>👑</span>
            </div>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>
              {records.bestHike.title || 'Untitled'}
            </h3>
            <p style={{ color: '#888', marginBottom: '8px' }}>
              {records.bestHike.distance?.toFixed(1)}km • 
              {records.bestHike.elevationGain?.toFixed(0)}m gain
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {format(new Date(records.bestHike.startTime), 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        {/* Import/Export Buttons */}
        <div className="button-container" style={{ marginTop: '32px' }}>
          <button 
            className="secondary-btn" 
            style={{ flex: 1 }}
            onClick={exportData}
          >
            📤 Export Data
          </button>
          <label className="primary-btn" style={{ flex: 1, textAlign: 'center' }}>
            📥 Import Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="secondary-btn"
          style={{
            width: '100%',
            marginTop: '20px',
            marginBottom: '20px',
            borderColor: '#663333',
            color: '#cc8888'
          }}
        >
          🚪 Log Out
        </button>

        {/* Offline Maps Status */}
        <div style={{ 
          marginTop: '16px',
          padding: '16px',
          background: '#0a0a0a',
          borderRadius: '16px',
          border: '1px solid #222'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: '600', marginBottom: '4px' }}>
                Offline Maps
              </div>
              <div style={{ color: '#888', fontSize: '13px' }}>
                {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
              </div>
            </div>
            <button className="secondary-btn" style={{ padding: '8px 16px' }}>
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => setCurrentScreen('home')}>
          <span>🏠</span>
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('history')}>
          <span>📋</span>
          <span>History</span>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('active')}>
          <span>➕</span>
          <span>New</span>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('community')}>
          <span>🌐</span>
          <span>Community</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;