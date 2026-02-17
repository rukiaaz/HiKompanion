import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';

const HomeScreen = ({ setCurrentScreen, startNewHike, hikes, onSelectHike }) => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  
  const weekDays = [...Array(7)].map((_, i) => {
    const day = addDays(startOfCurrentWeek, i);
    return {
      date: day,
      dayName: format(day, 'EEE'),
      dayNumber: format(day, 'd'),
      isToday: format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    };
  });

  const totalDistance = hikes.reduce((sum, hike) => sum + (hike.distance || 0), 0);
  const recentHikes = hikes.slice(0, 3);

  const formatSafeDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="App">
      {/* Clean Top Bar - No emojis */}
      <div className="top-bar">
        <span className="time">{format(new Date(), 'h:mm a')}</span>
        <div className="menu-icons">
          <div className="menu-icon"></div>
          <div className="menu-icon"></div>
        </div>
      </div>

      <div className="content">
        <div className="header">
          <button className="menu-btn" onClick={() => {}}>☰</button>
          <h2>HiKompanion</h2>
          <button className="profile-btn" onClick={() => setCurrentScreen('profile')}>👤</button>
        </div>

        <div className="stats-card">
          <div className="stats-header">
            <span>Total Distance</span>
            <span>🏆</span>
          </div>
          <div className="stats-value">{totalDistance.toFixed(1)} km</div>
          <div className="stats-label">{hikes.length} hikes completed</div>
        </div>

        <div className="today-section">
          <h3>{format(today, 'MMMM d, yyyy')}</h3>
          <div className="date-grid">
            {weekDays.map((day, index) => (
              <div 
                key={index}
                className={`date-cell ${day.isToday ? 'today' : ''}`}
              >
                <div>{day.dayName}</div>
                <div><strong>{day.dayNumber}</strong></div>
              </div>
            ))}
          </div>
        </div>

        <div className="button-container">
          <button 
            className="primary-btn" 
            onClick={startNewHike}
          >
            Start Hike
          </button>
          <button 
            className="secondary-btn"
            onClick={() => setCurrentScreen('history')}
          >
            View History
          </button>
        </div>

        <h3 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px', fontWeight: '500' }}>
          Recent Hikes
        </h3>
        
        {recentHikes.length > 0 ? (
          recentHikes.map((hike) => (
            <div 
              key={hike.id} 
              className="hike-item"
              onClick={() => onSelectHike && onSelectHike(hike)}
            >
              <div className="hike-header">
                <span className="hike-distance">{hike.distance?.toFixed(1) || 0} km</span>
                <span className={`difficulty-badge difficulty-${hike.difficulty || 'easy'}`}>
                  {hike.difficulty || 'easy'}
                </span>
              </div>
              <p className="hike-description">{hike.description || 'No description'}</p>
              <span className="hike-date">
                {formatSafeDate(hike.startTime)}
              </span>
            </div>
          ))
        ) : (
          <p style={{ color: '#666666', textAlign: 'center', margin: '60px 0' }}>
            No hikes yet. Start your first adventure!
          </p>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active" onClick={() => setCurrentScreen('home')}>
          <span>🏠</span>
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('history')}>
          <span>📋</span>
          <span>History</span>
        </div>
        <div className="nav-item" onClick={startNewHike}>
          <span>➕</span>
          <span>New</span>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('profile')}>
          <span>👤</span>
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;