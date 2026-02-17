import React, { useState } from 'react';
import { format } from 'date-fns';

const AddHike = ({ setCurrentScreen, saveCompletedHike, activeHike }) => {
  const [hikeData, setHikeData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    imageUrl: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setHikeData({ ...hikeData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hikeData.title || !hikeData.description) {
      alert('Please fill in all fields');
      return;
    }

    const completedHikeData = {
      ...hikeData,
      distance: activeHike?.distance || 0,
      duration: activeHike?.duration || '00:00:00',
      elevationGain: activeHike?.elevationGain || 0,
      maxElevation: activeHike?.maxElevation || 0,
      startTime: activeHike?.startTime || new Date().toISOString(),
      endTime: new Date().toISOString()
    };

    saveCompletedHike(completedHikeData);
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

      <div className="add-hike-form">
        <div className="detail-header">
          <button onClick={() => setCurrentScreen('active')} className="back-btn">
            ←
          </button>
          <h2 className="detail-title">Complete Hike</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hike Title</label>
            <input
              type="text"
              placeholder="Morning Trail Run"
              value={hikeData.title}
              onChange={(e) => setHikeData({ ...hikeData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe your hike experience..."
              value={hikeData.description}
              onChange={(e) => setHikeData({ ...hikeData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select
              value={hikeData.difficulty}
              onChange={(e) => setHikeData({ ...hikeData, difficulty: e.target.value })}
            >
              <option value="easy">Easy 🌱</option>
              <option value="medium">Medium ⚡</option>
              <option value="hard">Hard 🏔️</option>
            </select>
          </div>

          <div className="form-group">
            <label>Add Photo</label>
            <div className="image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div>
                    <span style={{ fontSize: '40px', display: 'block' }}>📸</span>
                    <span>Click to upload a photo</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div style={{ 
            background: '#0a0a0a', 
            padding: '15px', 
            borderRadius: '10px',
            margin: '20px 0',
            border: '1px solid #222222'
          }}>
            <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>Hike Summary</h4>
            <p style={{ color: '#cccccc' }}>Distance: {activeHike?.distance?.toFixed(1) || 0} km</p>
            <p style={{ color: '#cccccc' }}>Duration: {activeHike?.duration || '00:00:00'}</p>
            <p style={{ color: '#cccccc' }}>Elevation Gain: {activeHike?.elevationGain?.toFixed(0) || 0} m</p>
            <p style={{ color: '#cccccc' }}>Max Elevation: {activeHike?.maxElevation?.toFixed(0) || 0} m</p>
          </div>

          <button type="submit" className="submit-btn">
            Save Hike
          </button>
        </form>
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

export default AddHike;