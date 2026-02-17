import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LoadingScreen from './components/LoadingScreen';

// Suppress ResizeObserver loop error
const debounce = (fn, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

const _resizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _resizeObserver {
  constructor(callback) {
    callback = debounce(callback, 20);
    super(callback);
  }
};

const Root = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent scrolling while loading
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [loading]);

  return (
    <React.StrictMode>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <div style={{ 
        opacity: loading ? 0 : 1,
        transition: 'opacity 0.5s ease',
        visibility: loading ? 'hidden' : 'visible'
      }}>
        <App />
      </div>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);