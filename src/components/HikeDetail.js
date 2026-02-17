import React from 'react';
import { format } from 'date-fns';

const HikeDetail = ({ hike, setCurrentScreen }) => {
  if (!hike) {
    return (
      <div className="App">
        <div className="top-bar">
          <span className="time">{format(new Date(), 'h:mm a')}</span>
          <div className="menu-icons">
            <div className="menu-icon"></div>
            <div className="menu-icon"></div>
          </div>
        </div>
        <div className="content">
          <div className="detail-header">
            <button onClick={() => setCurrentScreen('history')} className="back-btn">
              ←
            </button>
            <h2 className="detail-title">Hike Details</h2>
          </div>
          <div className="empty-state">
            <span className="empty-icon">😕</span>
            <h3 className="empty-title">No Hike Selected</h3>
            <p className="empty-text">Please select a hike from the history</p>
            <button 
              onClick={() => setCurrentScreen('history')} 
              className="primary-btn"
              style={{ padding: '12px 30px' }}
            >
              Go to History
            </button>
          </div>
        </div>
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
          <div className="nav-item" onClick={() => setCurrentScreen('profile')}>
            <span>👤</span>
            <span>Profile</span>
          </div>
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

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return '#88cc88';
      case 'medium': return '#cccc88';
      case 'hard': return '#cc8888';
      default: return '#888888';
    }
  };

  // Calculate pace
  const calculatePace = () => {
    if (!hike.distance || !hike.duration) return '0:00';
    const durationParts = hike.duration.split(':');
    const totalMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
    const paceMinutes = totalMinutes / hike.distance;
    const mins = Math.floor(paceMinutes);
    const secs = Math.floor((paceMinutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      {/* Clean Top Bar */}
      <div className="top-bar">
        <span className="time">{format(new Date(), 'h:mm a')}</span>
        <div className="menu-icons">
          <div className="menu-icon"></div>
          <div className="menu-icon"></div>
        </div>
      </div>

      <div className="content" style={{ paddingBottom: '80px' }}>
        {/* Header with Back Button */}
        <div className="detail-header">
          <button onClick={() => setCurrentScreen('history')} className="back-btn">
            ←
          </button>
          <h2 className="detail-title">Hike Details</h2>
        </div>

        {/* Image Section */}
        {hike.imageUrl ? (
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <img 
              src={hike.imageUrl} 
              alt={hike.title || 'Hike'} 
              className="detail-image"
            />
            <span className="difficulty-overlay" style={{
              background: `rgba(0,0,0,0.8)`,
              border: `1px solid ${getDifficultyColor(hike.difficulty)}40`
            }}>
              <span>{getDifficultyEmoji(hike.difficulty)}</span>
              <span style={{ textTransform: 'capitalize' }}>{hike.difficulty || 'easy'}</span>
            </span>
          </div>
        ) : (
          <div className="detail-image-placeholder">
            <span style={{ fontSize: '64px' }}>🥾</span>
            <span className="difficulty-overlay" style={{
              background: `rgba(0,0,0,0.8)`,
              border: `1px solid ${getDifficultyColor(hike.difficulty)}40`
            }}>
              <span>{getDifficultyEmoji(hike.difficulty)}</span>
              <span style={{ textTransform: 'capitalize' }}>{hike.difficulty || 'easy'}</span>
            </span>
          </div>
        )}

        {/* Content Section */}
        <div className="detail-content">
          {/* Title */}
          <h1 className="detail-title" style={{ 
            fontSize: '32px', 
            marginBottom: '16px',
            fontWeight: '700'
          }}>
            {hike.title || 'Untitled Hike'}
          </h1>

          {/* Description */}
          <p className="detail-description">
            {hike.description || 'No description provided for this hike.'}
          </p>

          {/* Stats Grid - Enhanced with elevation data */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
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
              <div className="stat-number">{calculatePace()}</div>
              <div className="stat-label">pace/km</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⛰️</div>
              <div className="stat-number">{hike.elevationGain?.toFixed(0) || '0'}</div>
              <div className="stat-label">gain (m)</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏔️</div>
              <div className="stat-number">{hike.maxElevation?.toFixed(0) || '0'}</div>
              <div className="stat-label">max (m)</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-number">
                {hike.distance && hike.elevationGain ? 
                  (hike.elevationGain / hike.distance).toFixed(1) : '0'}
              </div>
              <div className="stat-label">m/km</div>
            </div>
          </div>

          {/* Journey Details - Enhanced with elevation info */}
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

            <div className="journey-row">
              <span style={{ fontSize: '20px', width: '40px' }}>⛰️</span>
              <div>
                <div className="journey-label">Elevation Profile</div>
                <div className="journey-value">
                  +{hike.elevationGain?.toFixed(0) || 0}m gain · 
                  Max {hike.maxElevation?.toFixed(0) || 0}m
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
                    text: `Just completed ${hike.distance || 0}km with ${hike.elevationGain || 0}m elevation gain! ${hike.description || ''}`,
                  }).catch(() => {
                    alert('Share cancelled');
                  });
                } else {
                  navigator.clipboard.writeText(
                    `${hike.title || 'My Hike'}\n` +
                    `Distance: ${hike.distance || 0}km\n` +
                    `Elevation Gain: ${hike.elevationGain || 0}m\n` +
                    `Duration: ${hike.duration || '00:00'}\n` +
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
        <div className="nav-item" onClick={() => setCurrentScreen('profile')}>
          <span>👤</span>
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
};

export default HikeDetail;