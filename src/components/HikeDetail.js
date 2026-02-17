import React from 'react';
import { format } from 'date-fns';

const HikeDetail = ({ hike, setCurrentScreen }) => {
  if (!hike) {
    return (
      <div className="content">
        <div className="status-bar">
          <span className="time">9:41</span>
          <button onClick={() => setCurrentScreen('history')} className="back-btn">
            ← Back
          </button>
        </div>
        <div className="empty-state">
          <span className="empty-icon">😕</span>
          <h3 className="empty-title">No Hike Selected</h3>
          <p className="empty-text">Please select a hike from the history</p>
          <button onClick={() => setCurrentScreen('history')} className="primary-btn">
            Go to History
          </button>
        </div>
      </div>
    );
  }

  const formatSafeDate = (dateString, formatStr) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, formatStr);
    } catch (error) {
      return 'Unknown date';
    }
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
    <div className="content" style={{ paddingBottom: '30px' }}>
      <div className="status-bar">
        <span className="time">9:41</span>
        <div className="battery">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <div className="detail-header">
        <button onClick={() => setCurrentScreen('history')} className="back-btn">
          ←
        </button>
        <h2 className="detail-title">Hike Details</h2>
      </div>

      {hike.imageUrl ? (
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <img 
            src={hike.imageUrl} 
            alt={hike.title || 'Hike'} 
            className="detail-image"
          />
          <span className="difficulty-overlay">
            <span>{getDifficultyEmoji(hike.difficulty)}</span>
            <span style={{ textTransform: 'capitalize' }}>{hike.difficulty || 'easy'}</span>
          </span>
        </div>
      ) : (
        <div className="detail-image-placeholder">
          <span style={{ fontSize: '64px' }}>🥾</span>
          <span className="difficulty-overlay">
            <span>{getDifficultyEmoji(hike.difficulty)}</span>
            <span style={{ textTransform: 'capitalize' }}>{hike.difficulty || 'easy'}</span>
          </span>
        </div>
      )}

      <div className="detail-content">
        <h1 className="detail-title" style={{ fontSize: '32px', marginBottom: '15px' }}>
          {hike.title || 'Untitled Hike'}
        </h1>

        <p className="detail-description">
          {hike.description || 'No description provided for this hike.'}
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📏</div>
            <div className="stat-number">{hike.distance?.toFixed(1) || '0.0'}</div>
            <div className="stat-label">km</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-number">{hike.duration || '00:00'}</div>
            <div className="stat-label">duration</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-number">
              {hike.distance && hike.duration ? 
                (hike.distance / (parseInt(hike.duration) || 1)).toFixed(1) : '0.0'}
            </div>
            <div className="stat-label">km/h</div>
          </div>
        </div>

        <div className="journey-details">
          <h3>Journey Details</h3>
          
          <div className="journey-row">
            <span style={{ fontSize: '20px', width: '40px' }}>📅</span>
            <div>
              <div className="journey-label">Date</div>
              <div className="journey-value">
                {formatSafeDate(hike.startTime, 'EEEE, MMMM d, yyyy')}
              </div>
            </div>
          </div>

          <div className="journey-row">
            <span style={{ fontSize: '20px', width: '40px' }}>⏰</span>
            <div>
              <div className="journey-label">Start Time</div>
              <div className="journey-value">
                {formatSafeDate(hike.startTime, 'h:mm a')}
              </div>
            </div>
          </div>

          {hike.endTime && (
            <div className="journey-row">
              <span style={{ fontSize: '20px', width: '40px' }}>🏁</span>
              <div>
                <div className="journey-label">End Time</div>
                <div className="journey-value">
                  {formatSafeDate(hike.endTime, 'h:mm a')}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button 
            className="action-btn action-btn-primary"
            onClick={() => setCurrentScreen('home')}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
          
          <button 
            className="action-btn action-btn-secondary"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: hike.title || 'My Hike',
                  text: `I just hiked ${hike.distance || 0}km! ${hike.description || ''}`,
                }).catch(() => {
                  alert('Share cancelled');
                });
              } else {
                navigator.clipboard.writeText(
                  `${hike.title || 'My Hike'}\n` +
                  `Distance: ${hike.distance || 0}km\n` +
                  `Description: ${hike.description || ''}`
                );
                alert('Copied to clipboard!');
              }
            }}
          >
            <span>📤</span>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HikeDetail;