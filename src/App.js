import React, { useState, useEffect } from 'react';
import './App.css';
import HomeScreen from './components/HomeScreen';
import ActiveHike from './components/ActiveHike';
import HikeHistory from './components/HikeHistory';
import AddHike from './components/AddHike';
import HikeDetail from './components/HikeDetail';
import ProfileScreen from './components/ProfileScreen';
import LoginScreen from './components/LoginScreen';
import CommunityScreen from './components/CommunityScreen';
import TutorialScreen from './components/TutorialScreen';
import NewUserScreen from './components/NewUserScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [hikes, setHikes] = useState([]);
  const [activeHike, setActiveHike] = useState(null);
  const [selectedHike, setSelectedHike] = useState(null);
  const [user, setUser] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Check if user has seen tutorial
      if (userData.hasSeenTutorial) {
        setCurrentScreen('home');
        setShowTutorial(false);
      } else {
        // User exists but hasn't seen tutorial
        setCurrentScreen('home');
        setShowTutorial(true);
      }
    } else {
      // No user found, show login
      setCurrentScreen('login');
    }
    setIsLoading(false);
  }, []);

  // Load hikes from localStorage
  useEffect(() => {
    const savedHikes = localStorage.getItem('hikes');
    if (savedHikes) {
      try {
        setHikes(JSON.parse(savedHikes));
      } catch (e) {
        console.error('Error loading hikes:', e);
      }
    }
  }, []);

  // Save hikes to localStorage
  useEffect(() => {
    if (hikes.length > 0) {
      localStorage.setItem('hikes', JSON.stringify(hikes));
    }
  }, [hikes]);

  const startNewHike = () => {
    const now = new Date();
    const newHike = {
      id: Date.now(),
      startTime: now.toISOString(),
      endTime: null,
      distance: 0,
      path: [],
      elevationGain: 0,
      maxElevation: 0,
      status: 'active',
      paused: false,
      description: '',
      difficulty: 'easy',
      imageUrl: null,
      title: ''
    };
    setActiveHike(newHike);
    setCurrentScreen('active');
  };

  const saveCompletedHike = (hikeData) => {
    const completedHike = {
      ...activeHike,
      ...hikeData,
      endTime: new Date().toISOString(),
      status: 'completed',
      id: activeHike?.id || Date.now()
    };
    setHikes(prevHikes => [completedHike, ...prevHikes]);
    setActiveHike(null);
    setCurrentScreen('home');
  };

  const viewHikeDetail = (hike) => {
    setSelectedHike(hike);
    setCurrentScreen('detail');
  };

  const handleLoginSuccess = (userData, isNew = false) => {
    if (isNew) {
      setIsNewUser(true);
    } else if (userData) {
      // Save user to localStorage
      const userWithTutorialFlag = {
        ...userData,
        hasSeenTutorial: false // New users haven't seen tutorial
      };
      localStorage.setItem('currentUser', JSON.stringify(userWithTutorialFlag));
      setUser(userWithTutorialFlag);
      setCurrentScreen('home');
      setShowTutorial(true); // Show tutorial for new users
    }
  };

  const handleNewUserComplete = (newUser) => {
    // New user hasn't seen tutorial yet
    const userWithTutorialFlag = {
      ...newUser,
      hasSeenTutorial: false
    };
    localStorage.setItem('currentUser', JSON.stringify(userWithTutorialFlag));
    setUser(userWithTutorialFlag);
    setIsNewUser(false);
    setCurrentScreen('home');
    setShowTutorial(true); // Show tutorial for new users
  };

  const handleTutorialComplete = () => {
    // Mark tutorial as seen
    const updatedUser = { ...user, hasSeenTutorial: true };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    // Even if skipped, mark as seen so it doesn't show again
    const updatedUser = { ...user, hasSeenTutorial: true };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowTutorial(false);
  };

  const handleLogout = () => {
    // Clear user from localStorage but keep hikes
    localStorage.removeItem('currentUser');
    setUser(null);
    setCurrentScreen('login');
    setShowTutorial(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', animation: 'pulse 1.5s infinite' }}>🥾</div>
          <p style={{ color: '#999', marginTop: '20px' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Login Screen */}
      {currentScreen === 'login' && !user && !isNewUser && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {/* New User Name Input */}
      {isNewUser && (
        <NewUserScreen onComplete={handleNewUserComplete} />
      )}

      {/* Tutorial Overlay - Only show if user exists AND hasn't seen tutorial AND we're on home screen */}
      {showTutorial && user && currentScreen === 'home' && (
        <TutorialScreen
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          userName={user.displayName || user.username || 'there'}
        />
      )}

      {/* Main App Screens (only show if user exists) */}
      {user && (
        <>
          {currentScreen === 'home' && (
            <HomeScreen 
              setCurrentScreen={setCurrentScreen}
              startNewHike={startNewHike}
              hikes={hikes}
              onSelectHike={viewHikeDetail}
              user={user}
              onLogout={handleLogout}
            />
          )}
          
          {currentScreen === 'active' && (
            <ActiveHike 
              activeHike={activeHike}
              setActiveHike={setActiveHike}
              saveCompletedHike={saveCompletedHike}
              setCurrentScreen={setCurrentScreen}
            />
          )}
          
          {currentScreen === 'history' && (
            <HikeHistory 
              hikes={hikes}
              setCurrentScreen={setCurrentScreen}
              onSelectHike={viewHikeDetail}
            />
          )}
          
          {currentScreen === 'add' && (
            <AddHike 
              setCurrentScreen={setCurrentScreen}
              saveCompletedHike={saveCompletedHike}
              activeHike={activeHike}
              user={user}
            />
          )}
          
          {currentScreen === 'detail' && (
            <HikeDetail 
              hike={selectedHike}
              setCurrentScreen={setCurrentScreen}
              user={user}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen 
              hikes={hikes}
              setCurrentScreen={setCurrentScreen}
              user={user}
              onLogout={handleLogout}
            />
          )}

          {currentScreen === 'community' && (
            <CommunityScreen 
              setCurrentScreen={setCurrentScreen}
              user={user}
              hikes={hikes}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;