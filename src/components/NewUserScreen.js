import React, { useState } from 'react';

const NewUserScreen = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Please enter a valid name (at least 2 characters)');
      return;
    }
    
    // Save user to localStorage
    const user = {
      uid: `user_${Date.now()}`,
      username: name.trim(),
      displayName: name.trim(),
      createdAt: new Date().toISOString(),
      hasSeenTutorial: false,
      totalHikes: 0,
      totalDistance: 0,
      totalElevation: 0
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    onComplete(user);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: '#0a0a0a',
        borderRadius: '30px',
        padding: '40px 20px',
        border: '1px solid #222',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'wave 2s ease-in-out infinite'
        }}>
          👋
        </div>

        <h2 style={{
          color: '#fff',
          fontSize: '32px',
          marginBottom: '10px',
          fontWeight: '600'
        }}>
          Welcome to HiKompanion!
        </h2>

        <p style={{
          color: '#888',
          fontSize: '16px',
          marginBottom: '30px'
        }}>
          Let's get to know you better
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '16px',
                background: '#111',
                border: `2px solid ${error ? '#663333' : '#333'}`,
                borderRadius: '16px',
                color: '#fff',
                fontSize: '18px',
                textAlign: 'center',
                outline: 'none'
              }}
              autoFocus
            />
            {error && (
              <p style={{
                color: '#cc8888',
                fontSize: '14px',
                marginTop: '8px',
                textAlign: 'center'
              }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="primary-btn"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px'
            }}
          >
            Continue
          </button>
        </form>

        <p style={{
          color: '#666',
          fontSize: '13px',
          marginTop: '20px'
        }}>
          This will be your display name in the app
        </p>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
      `}</style>
    </div>
  );
};

export default NewUserScreen;