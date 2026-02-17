import React, { useState, useEffect } from 'react';
import socialService from '../services/socialService';

const LoginScreen = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const user = await socialService.getCurrentUser();
    if (user) {
      onLoginSuccess(user, false);
    }
  };

  const handleExistingUser = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = await socialService.getCurrentUser();
      if (user) {
        onLoginSuccess(user, false);
      } else {
        // No saved user, show sign up form
        setShowSignUp(true);
        setLoading(false);
      }
    } catch (error) {
      setError('Error loading user data');
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create new user in database
      const result = await socialService.createUser({
        username: username,
        email: email,
        profilePic: ''
      });

      if (result.success) {
        // Save to localStorage for quick access
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        onLoginSuccess(result.user, false);
      } else {
        setError(result.error || 'Error creating account');
      }
    } catch (error) {
      setError('Error creating account');
      console.error(error);
    }
    
    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo, use socialService.signIn
      const result = await socialService.signIn(email, password);
      
      if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        onLoginSuccess(result.user, false);
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('Error signing in');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Create a demo user
      const demoUsername = `hiker_${Math.floor(Math.random() * 1000)}`;
      const result = await socialService.createUser({
        username: demoUsername,
        email: `${demoUsername}@demo.com`,
        profilePic: ''
      });

      if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        onLoginSuccess(result.user, false);
      }
    } catch (error) {
      setError('Error creating demo account');
    }
    
    setLoading(false);
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
      padding: '20px',
      overflowY: 'auto'
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

        {error && (
          <div style={{
            background: '#331111',
            color: '#ff8888',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #662222'
          }}>
            {error}
          </div>
        )}

        {showSignUp ? (
          // Sign Up Form
          <div style={{
            background: '#0a0a0a',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #222',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>Create Account</h3>
            
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '15px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '15px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '20px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
            />

            <button
              onClick={handleSignUp}
              className="primary-btn"
              style={{
                padding: '15px',
                fontSize: '16px',
                width: '100%',
                marginBottom: '10px'
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <button
              onClick={() => setShowSignUp(false)}
              className="secondary-btn"
              style={{
                padding: '15px',
                fontSize: '16px',
                width: '100%'
              }}
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        ) : (
          // Login Options
          <>
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
                onClick={() => setShowSignUp(true)}
                className="secondary-btn"
                style={{
                  padding: '18px',
                  fontSize: '18px',
                  width: '100%'
                }}
                disabled={loading}
              >
                Create New Account
              </button>

              <button
                onClick={handleDemoLogin}
                className="secondary-btn"
                style={{
                  padding: '15px',
                  fontSize: '16px',
                  width: '100%',
                  background: '#1a3a1a',
                  borderColor: '#2a5a2a',
                  color: '#8f8'
                }}
                disabled={loading}
              >
                🎮 Try Demo Mode
              </button>
            </div>

            {/* Sign In Form (optional) */}
            <div style={{
              padding: '20px',
              background: '#0a0a0a',
              borderRadius: '12px',
              border: '1px solid #222',
              marginBottom: '15px'
            }}>
              <h4 style={{ color: '#888', marginBottom: '15px', fontSize: '14px' }}>
                Or sign in with email
              </h4>
              
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '10px',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />

              <button
                onClick={handleSignIn}
                className="secondary-btn"
                style={{
                  padding: '12px',
                  fontSize: '14px',
                  width: '100%'
                }}
                disabled={loading}
              >
                Sign In
              </button>
            </div>
          </>
        )}

        <div style={{
          padding: '15px',
          background: '#0a0a0a',
          borderRadius: '12px',
          border: '1px solid #222',
          fontSize: '13px',
          color: '#666',
          marginTop: '20px'
        }}>
          📱 All data stored on this device only<br />
          👥 Create multiple users to test friend features
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