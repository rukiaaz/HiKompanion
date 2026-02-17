import React, { useState, useEffect } from 'react';
import './App.css';
import HomeScreen from './components/HomeScreen';
import ActiveHike from './components/ActiveHike';
import HikeHistory from './components/HikeHistory';
import AddHike from './components/AddHike';
import HikeDetail from './components/HikeDetail';
import ProfileScreen from './components/ProfileScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [hikes, setHikes] = useState([]);
  const [activeHike, setActiveHike] = useState(null);
  const [selectedHike, setSelectedHike] = useState(null);

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

  return (
    <div className="App">
      {currentScreen === 'home' && (
        <HomeScreen 
          setCurrentScreen={setCurrentScreen}
          startNewHike={startNewHike}
          hikes={hikes}
          onSelectHike={viewHikeDetail}
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
        />
      )}
      
      {currentScreen === 'detail' && (
        <HikeDetail 
          hike={selectedHike}
          setCurrentScreen={setCurrentScreen}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen 
          hikes={hikes}
          setCurrentScreen={setCurrentScreen}
        />
      )}
    </div>
  );
}

export default App;