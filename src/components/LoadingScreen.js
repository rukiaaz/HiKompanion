import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [showDevelopedBy, setShowDevelopedBy] = useState(false);
  
  const companyName = "HIKOMPANION";
  const developerText = "developed by Tamayo";

  useEffect(() => {
    // Animate company name letter by letter
    const interval = setInterval(() => {
      if (textIndex < companyName.length) {
        setTextIndex(prev => prev + 1);
      } else {
        clearInterval(interval);
        // Show developer text after company name is fully displayed
        setTimeout(() => {
          setShowDevelopedBy(true);
        }, 300);
      }
    }, 150);

    // Start fade out after 2.5 seconds total
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Call onComplete after fade animation
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [textIndex, onComplete]);

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.content,
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? 'scale(0.95)' : 'scale(1)',
        transition: 'opacity 0.8s ease, transform 0.8s ease'
      }}>
        {/* Animated Company Name */}
        <div style={styles.companyContainer}>
          {companyName.substring(0, textIndex).split('').map((letter, index) => (
            <span
              key={index}
              style={{
                ...styles.letter,
                animation: `fadeInUp 0.3s ease forwards`,
                animationDelay: `${index * 0.05}s`
              }}
            >
              {letter}
            </span>
          ))}
          {textIndex < companyName.length && (
            <span style={styles.cursor}>|</span>
          )}
        </div>

        {/* Developed By Text */}
        <div style={{
          ...styles.developedBy,
          opacity: showDevelopedBy ? 1 : 0,
          transform: showDevelopedBy ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}>
          {developerText}
        </div>

        {/* Loading Bar */}
        <div style={styles.loadingBarContainer}>
          <div style={{
            ...styles.loadingBar,
            width: fadeOut ? '100%' : `${(textIndex / companyName.length) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  content: {
    textAlign: 'center',
    width: '100%',
    maxWidth: '600px',
    padding: '20px',
  },
  companyContainer: {
    marginBottom: '20px',
    minHeight: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  letter: {
    fontSize: 'clamp(36px, 10vw, 72px)',
    fontWeight: '800',
    color: '#ffffff',
    display: 'inline-block',
    letterSpacing: '2px',
    textShadow: '0 0 20px rgba(255,255,255,0.3)',
  },
  cursor: {
    fontSize: 'clamp(36px, 10vw, 72px)',
    fontWeight: '800',
    color: '#ffffff',
    marginLeft: '5px',
    animation: 'pulse 1s infinite',
  },
  developedBy: {
    fontSize: 'clamp(14px, 4vw, 18px)',
    color: '#888888',
    marginTop: '10px',
    letterSpacing: '2px',
    textTransform: 'lowercase',
  },
  loadingBarContainer: {
    width: '200px',
    height: '2px',
    backgroundColor: '#222222',
    margin: '40px auto 0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '2px',
  }
};

export default LoadingScreen;