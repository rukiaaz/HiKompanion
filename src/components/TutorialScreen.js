import React, { useState } from 'react';

const TutorialScreen = ({ onComplete, onSkip, userName }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const tutorialSteps = [
    {
      title: `Welcome ${userName}! 👋`,
      icon: '👋',
      description: 'Let\'s get you started with HiKompanion',
      detail: 'Track your hikes, connect with friends, and explore nature'
    },
    {
      title: 'Start a Hike',
      icon: '🥾',
      description: 'Tap the "Start Hike" button to begin tracking',
      detail: 'Your GPS will track distance, time, and elevation in real-time'
    },
    {
      title: 'Pause & Stop',
      icon: '⏸️',
      description: 'Control your hike with pause, stop, or abort',
      detail: 'Pause for breaks, stop to save, abort to discard'
    },
    {
      title: 'Share with Community',
      icon: '🌐',
      description: 'Share your achievements with friends',
      detail: 'Add photos, like posts, and build your hiking network'
    }
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
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
        padding: '30px 20px',
        border: '1px solid #222',
        position: 'relative'
      }}>
        {/* Skip Button */}
        <button
          onClick={onSkip}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '5px 10px'
          }}
        >
          Skip Tutorial
        </button>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#222',
          borderRadius: '2px',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(step / totalSteps) * 100}%`,
            height: '100%',
            backgroundColor: '#fff',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Step Content */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            animation: 'float 2s ease-in-out infinite'
          }}>
            {tutorialSteps[step - 1].icon}
          </div>
          
          <h2 style={{
            color: '#fff',
            fontSize: '28px',
            marginBottom: '15px',
            fontWeight: '600'
          }}>
            {tutorialSteps[step - 1].title}
          </h2>
          
          <p style={{
            color: '#888',
            fontSize: '18px',
            marginBottom: '10px',
            lineHeight: '1.5'
          }}>
            {tutorialSteps[step - 1].description}
          </p>
          
          <p style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            {tutorialSteps[step - 1].detail}
          </p>
        </div>

        {/* Step Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '30px'
        }}>
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: i + 1 === step ? '#fff' : '#333',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="secondary-btn"
              style={{ flex: 1 }}
            >
              ← Previous
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="primary-btn"
            style={{ flex: step > 1 ? 1 : 2 }}
          >
            {step === totalSteps ? 'Get Started' : 'Next →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default TutorialScreen;