import React, { useState } from 'react';

const LoginScreen = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleNewUser = () => {
    setLoading(true);
    // This will trigger the NewUserScreen in App.js
    onLoginSuccess(null, true); // null user, true means new user
  };

  const handleExistingUser = () => {
    setLoading(true);
    // Get existing user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      onLoginSuccess(user, false);
    } else {
      // If no saved user, go to new user flow
      onLoginSuccess(null, true);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'bounce 2s ease infinite'
        }}>
          🥾
        </div>

        <h1 style={{
          color: '#fff',
          fontSize: '42px',
          fontWeight: '700',
          marginBottom: '10px',
          letterSpacing: '-1px'
        }}>
          HiKompanion
        </h1>

        <p style={{
          color: '#888',
          fontSize: '16px',
          marginBottom: '40px'
        }}>
          Your personal hiking companion
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <button
            onClick={handleExistingUser}
            className="primary-btn"
            style={{
              padding: '18px',
              fontSize: '18px',
              width: '100%'
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Continue as Existing User'}
          </button>

          <button
            onClick={handleNewUser}
            className="secondary-btn"
            style={{
              padding: '18px',
              fontSize: '18px',
              width: '100%'
            }}
            disabled={loading}
          >
            I'm New Here
          </button>
        </div>

        <div style={{
          padding: '15px',
          background: '#0a0a0a',
          borderRadius: '12px',
          border: '1px solid #222',
          fontSize: '13px',
          color: '#666'
        }}>
          📱 All data stored on this device only
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;