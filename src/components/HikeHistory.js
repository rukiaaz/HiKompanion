import React from 'react';
import { format } from 'date-fns';

const HikeHistory = ({ hikes, setCurrentScreen, onSelectHike }) => {
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

  const getDifficultyClass = (difficulty) => {
    return `difficulty-badge difficulty-${difficulty || 'easy'}`;
  };

  const getDifficultyEmoji = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return '🌱';
      case 'medium': return '⚡';
      case 'hard': return '🏔️';
      default: return '🌱';
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
          <h2 className="detail-title">Hike History</h2>
        </div>

        <div className="stats-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span>Total Hikes</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{hikes.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Distance</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {hikes.reduce((sum, hike) => sum + (hike.distance || 0), 0).toFixed(1)} km
            </span>
          </div>
        </div>

        {hikes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🥾</span>
            <h3 className="empty-title">No Hikes Yet</h3>
            <p className="empty-text">
              Start your first adventure by clicking the Start Hike button!
            </p>
            <button onClick={() => setCurrentScreen('home')} className="primary-btn">
              Go to Home
            </button>
          </div>
        ) : (
          <div>
            {hikes.map((hike) => (
              <div 
                key={hike.id} 
                className={`hike-item ${hike.imageUrl ? 'with-image' : ''}`}
                onClick={() => onSelectHike && onSelectHike(hike)}
              >
                {hike.imageUrl && (
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={hike.imageUrl} 
                      alt={hike.title || 'Hike'} 
                      className="hike-image"
                    />
                    <span className="difficulty-overlay">
                      <span>{getDifficultyEmoji(hike.difficulty)}</span>
                      <span>{hike.difficulty || 'easy'}</span>
                    </span>
                  </div>
                )}

                <div className="hike-info">
                  {!hike.imageUrl && (
                    <div className="hike-header">
                      <h3 style={{ fontSize: '18px', margin: 0, color: '#ffffff' }}>
                        {hike.title || 'Untitled Hike'}
                      </h3>
                      <span className={getDifficultyClass(hike.difficulty)}>
                        <span>{getDifficultyEmoji(hike.difficulty)}</span>
                        <span style={{ marginLeft: '4px' }}>{hike.difficulty || 'easy'}</span>
                      </span>
                    </div>
                  )}

                  {hike.imageUrl && (
                    <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#ffffff' }}>
                      {hike.title || 'Untitled Hike'}
                    </h3>
                  )}

                  <p className="hike-description">
                    {hike.description || 'No description provided'}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '20px' }}>📏</span>
                      <span className="hike-distance">
                        {hike.distance?.toFixed(1) || '0.0'} km
                      </span>
                    </div>
                    
                    {hike.duration && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '20px' }}>⏱️</span>
                        <span style={{ color: '#cccccc', fontSize: '14px' }}>
                          {hike.duration}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid #222222',
                    paddingTop: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#999999' }}>📅</span>
                      <span className="hike-date">
                        {formatSafeDate(hike.startTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => setCurrentScreen('home')}>
          <span>🏠</span>
          <span>Home</span>
        </div>
        <div className="nav-item active" onClick={() => setCurrentScreen('history')}>
          <span>📋</span>
          <span>History</span>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('active')}>
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

export default HikeHistory;