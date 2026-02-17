import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ActiveHike = ({ activeHike, setActiveHike, saveCompletedHike, setCurrentScreen }) => {
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [path, setPath] = useState([]);
  const [elevationGain, setElevationGain] = useState(0);
  const [currentElevation, setCurrentElevation] = useState(0);
  const [maxElevation, setMaxElevation] = useState(0);
  const watchIdRef = useRef();

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (!isPaused && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newElevation = pos.coords.altitude || 0;
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            altitude: newElevation,
            timestamp: pos.timestamp
          };

          // Elevation gain calculation
          if (newElevation > currentElevation) {
            setElevationGain(prev => prev + (newElevation - currentElevation));
          }
          
          // Max elevation
          if (newElevation > maxElevation) {
            setMaxElevation(newElevation);
          }

          setCurrentElevation(newElevation);
          setPosition(newPos);
          
          setPath(prevPath => {
            const newPath = [...prevPath, newPos];
            
            if (prevPath.length > 0) {
              const lastPos = prevPath[prevPath.length - 1];
              const segmentDistance = calculateDistance(
                lastPos.lat, lastPos.lng,
                newPos.lat, newPos.lng
              );
              setDistance(prevDist => prevDist + segmentDistance);
            }
            
            return newPath;
          });
        },
        (error) => console.error('Error getting location:', error),
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isPaused]);

  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (window.confirm('End this hike?')) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      const updatedHike = {
        ...activeHike,
        distance: parseFloat(distance.toFixed(2)),
        duration: formatTime(duration),
        elevationGain: parseFloat(elevationGain.toFixed(1)),
        maxElevation: parseFloat(maxElevation.toFixed(1)),
        path: path,
        endTime: new Date().toISOString()
      };
      
      setActiveHike(updatedHike);
      setCurrentScreen('add');
    }
  };

  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      if (position) {
        map.setView([position.lat, position.lng], 16);
      }
    }, [position, map]);
    
    return null;
  };

  return (
    <div className="active-hike">
      <div className="map-container">
        <MapContainer
          center={position ? [position.lat, position.lng] : [51.505, -0.09]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {path.length > 1 && (
            <Polyline 
              positions={path.map(p => [p.lat, p.lng])}
              color="#ffffff"
              weight={4}
              opacity={0.7}
            />
          )}
          <MapController />
        </MapContainer>
      </div>

      <div className="hike-stats">
        <div className="stat-row">
          <div className="stat-block">
            <div className="value">{distance.toFixed(2)}</div>
            <div className="label">km</div>
          </div>
          <div className="stat-block">
            <div className="value">{formatTime(duration)}</div>
            <div className="label">time</div>
          </div>
          <div className="stat-block">
            <div className="value">{elevationGain.toFixed(0)}</div>
            <div className="label">elevation</div>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-block">
            <div className="value">{duration > 0 ? (distance / (duration / 3600)).toFixed(1) : 0}</div>
            <div className="label">km/h</div>
          </div>
          <div className="stat-block">
            <div className="value">{currentElevation.toFixed(0)}</div>
            <div className="label">current</div>
          </div>
          <div className="stat-block">
            <div className="value">{maxElevation.toFixed(0)}</div>
            <div className="label">max</div>
          </div>
        </div>

        <div className="control-buttons">
          <button 
            className={`control-btn ${isPaused ? 'secondary-btn' : 'pause-btn'}`}
            onClick={handlePauseResume}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button 
            className="control-btn stop-btn"
            onClick={handleStop}
          >
            Stop
          </button>
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
        <div className="nav-item active" onClick={() => setCurrentScreen('active')}>
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

export default ActiveHike;