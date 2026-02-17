import React, { useState } from 'react';

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
      startTime: activeHike?.startTime || new Date().toISOString(),
      endTime: new Date().toISOString()
    };

    saveCompletedHike(completedHikeData);
  };

  return (
    <div className="add-hike-form">
      <div className="status-bar">
        <span className="time">9:41</span>
        <button onClick={() => setCurrentScreen('active')} className="back-btn">
          ← Back
        </button>
      </div>

      <h2>Complete Your Hike</h2>

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
          background: '#111111', 
          padding: '15px', 
          borderRadius: '10px',
          margin: '20px 0',
          border: '1px solid #333333'
        }}>
          <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>Hike Summary</h4>
          <p style={{ color: '#cccccc' }}>Distance: {activeHike?.distance?.toFixed(1) || 0} km</p>
          <p style={{ color: '#cccccc' }}>Duration: {activeHike?.duration || '00:00:00'}</p>
        </div>

        <button type="submit" className="submit-btn">
          Save Hike
        </button>
      </form>
    </div>
  );
};

export default AddHike;