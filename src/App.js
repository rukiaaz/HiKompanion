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

  // Check for existing user on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Check if user has seen tutorial
      if (userData.hasSeenTutorial) {
        setCurrentScreen('home');
      } else {
        setShowTutorial(true);
        setCurrentScreen('home'); // Show home behind tutorial
      }
    }
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
      setUser(userData);
      
      // Check if user has seen tutorial
      if (userData.hasSeenTutorial) {
        setCurrentScreen('home');
      } else {
        setShowTutorial(true);
        setCurrentScreen('home');
      }
    }
  };

  const handleNewUserComplete = (newUser) => {
    setUser(newUser);
    setIsNewUser(false);
    setShowTutorial(true);
    setCurrentScreen('home');
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

      {/* Tutorial Overlay */}
      {showTutorial && user && (
        <TutorialScreen
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          userName={user.displayName || user.username}
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
            />
          )}

          {currentScreen === 'community' && (
            <CommunityScreen 
              setCurrentScreen={setCurrentScreen}
              user={user}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;