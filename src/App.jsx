import React, { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '@mui/material';
import CryptoJS from 'crypto-js';

const BreadBonus = ({ position, onCollect }) => (
  <div
    style={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      fontSize: '30px',
      cursor: 'pointer',
      zIndex: 20,
    }}
    onClick={(e) => {
      e.stopPropagation();
      onCollect();
    }}
  >
    🍞
  </div>
);

const App = () => {
  const [animal, setAnimal] = useState('');
  const [clickEmojis, setClickEmojis] = useState([]);
  const [isDuck, setIsDuck] = useState(true);
  const [clicksForCurrentLevel, setClicksForCurrentLevel] = useState(0);
  const [bread, setBread] = useState(null);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  
  const [score, setScore] = useState(0);
  const [highestDuckLevel, setHighestDuckLevel] = useState(1);
  const [duckLevel, setDuckLevel] = useState(1);
  const [highestCrocLevel, setHighestCrocLevel] = useState(1);
  const [crocLevel, setCrocLevel] = useState(1);

  const cdn = 'cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; // Replace with your secret key

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, cdn).toString();
  };

  const decryptData = (data) => {
    const bytes = CryptoJS.AES.decrypt(data, cdn);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const getInitialState = (key, defaultValue) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue) {
      const decryptedValue = decryptData(savedValue);
      if (!isNaN(decryptedValue)) {
        return parseInt(decryptedValue, 10);
      }
    }
    return defaultValue;
  };

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const savedScore = localStorage.getItem('crocoduckScore');
    const savedDuckLevel = localStorage.getItem('highestDuckLevel');
    const savedCrocLevel = localStorage.getItem('highestCrocLevel');


    if (savedScore) {
      const decryptedScore = decryptData(savedScore);
      if (!isNaN(decryptedScore)) {
        setScore(parseInt(decryptedScore, 10));
      }
    }

    if (savedDuckLevel) {
      const decryptedDuckLevel = decryptData(savedDuckLevel);
      if (!isNaN(decryptedDuckLevel)) {
        const level = parseInt(decryptedDuckLevel, 10);
        setHighestDuckLevel(level);
        setDuckLevel(level);
      }
    }

    if (savedCrocLevel) {
      const decryptedCrocLevel = decryptData(savedCrocLevel);
      if (!isNaN(decryptedCrocLevel)) {
        const level = parseInt(decryptedCrocLevel, 10);
        setHighestCrocLevel(level);
        setCrocLevel(level);
      }
    }

    resetAnimal();
    startBreadTimer();
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('crocoduckScore', encryptData(score.toString()));
      localStorage.setItem('highestDuckLevel', encryptData(highestDuckLevel.toString()));
      localStorage.setItem('highestCrocLevel', encryptData(highestCrocLevel.toString()));
    }
  }, [score, highestDuckLevel, highestCrocLevel, isInitialLoad]);


const startBreadTimer = () => {
    const randomTime = Math.floor(Math.random() * (5 * 60 * 1000 - 1 * 60 * 1000)) + 1 * 60 * 1000; // Between 1 and 5 minutes
    setTimeout(() => {
      if (Math.random() < 0.3) { // 30% chance to spawn bread
        setBread({
          x: Math.random() * (window.innerWidth - 50),
          y: Math.random() * (window.innerHeight - 110) + 60, // Avoid top and bottom bars
        });
        setTimeout(() => setBread(null), 10000); // Disappear after 3 seconds if not clicked
      }
      startBreadTimer(); // Set up the next bread spawn
    }, randomTime);
  };

  const resetAnimal = () => {
    const newIsDuck = Math.random() < 0.5;
    setIsDuck(newIsDuck);
    setAnimal(newIsDuck ? '🦆' : '🐊');
    setClicksForCurrentLevel(0);
  };

  const getRequiredClicks = (level) => {
    return Math.floor(10 * Math.pow(1.5, level - 1));
  };

  const handleClick = useCallback((e) => {
    setScore(prevScore => prevScore + 1);
    setClicksForCurrentLevel(prevClicks => prevClicks + 1);

    const currentLevel = isDuck ? duckLevel : crocLevel;
    const requiredClicks = getRequiredClicks(currentLevel);

    if (clicksForCurrentLevel + 1 >= requiredClicks) {
      const newLevel = currentLevel + 1;
      if (isDuck) {
        setDuckLevel(newLevel);
        setHighestDuckLevel(prev => Math.max(prev, newLevel));
      } else {
        setCrocLevel(newLevel);
        setHighestCrocLevel(prev => Math.max(prev, newLevel));
      }
      setClicksForCurrentLevel(0);
    }

    const newEmoji = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      emoji: isDuck ? '🐊' : '🦆',
      bounceX: Math.random() * 2 - 1,
      bounceY: -(Math.random() * 2 + 2),
      rotation: Math.random() * 360
    };
    setClickEmojis(prev => [...prev, newEmoji]);

    setTimeout(() => {
      setClickEmojis(prev => prev.filter(emoji => emoji.id !== newEmoji.id));
    }, 2000);
  }, [animal, duckLevel, crocLevel, clicksForCurrentLevel, isDuck]);

  const handleToggle = () => {
    setIsDuck(!isDuck);
    setAnimal(!isDuck ? '🦆' : '🐊');
    setClicksForCurrentLevel(0);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset? This will clear all your progress.')) {
      localStorage.clear();
      setScore(0);
      setDuckLevel(1);
      setCrocLevel(1);
      setHighestDuckLevel(1);
      setHighestCrocLevel(1);
      resetAnimal();
    }
  };

  const handleCollectBread = () => {
    setScore(prevScore => prevScore + 50);
    isDuck ? setDuckLevel(prevLevel => prevLevel + 1) : setCrocLevel(prevLevel => prevLevel + 1);
    setBread(null);
  };

  const currentLevel = isDuck ? duckLevel : crocLevel;
  const progress = (clicksForCurrentLevel / getRequiredClicks(currentLevel)) * 100;

  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#1f2937',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ color: 'white', fontSize: '20px' }}>
          {isSmallScreen ? (
            <>🦆 {duckLevel ? duckLevel : 0}</>
          ) : (
            <>🦆 level: {duckLevel ? duckLevel : 0}</>
          )}
          </div>
          <div style={{ color: 'white', fontSize: '20px' }}>
          {isSmallScreen ? (
            <>🐊 {crocLevel ? crocLevel : 0}</>
          ) : (
            <>🐊 level: {crocLevel ? crocLevel : 0}</>
          )}
          </div>
          <div style={{ color: 'white', fontSize: '20px' }}>
            Score: {score ? score : 0}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: 'white', marginRight: '10px', fontSize: 20 }}>🐊</span>
        <label className="switch">
          <input type="checkbox" checked={isDuck} onChange={handleToggle} />
          <span className="slider round"></span>
        </label>
        <span style={{ color: 'white', marginLeft: '10px', fontSize: 20 }}>🦆</span>
      </div>


      </div>

      <div 
        onClick={handleClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 120px)',
          paddingTop: '60px',
        }}
      >
        <div 
          style={{ 
            fontSize: `${Math.min(50 + (currentLevel - 1) * 10, 200)}px`, 
            transition: 'font-size 0.3s ease',
            textAlign: 'center',
          }}
        >
          {animal}
        </div>
      </div>

      <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        zIndex: 10,
      }}
    >
      <div style={{ color: 'white', fontSize: '20px', marginRight: '20px' }}>
        Level: {currentLevel ? currentLevel : 0}
      </div>
      <div style={{ 
        width: '35%', 
        height: '20px', 
        backgroundColor: '#4a5568', 
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div 
          style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: isDuck ? '#fbbe24' : '#48bb78', // Yellow for duck, green for croc
            borderRadius: '10px', 
            transition: 'width 0.3s ease, background-color 0.3s ease' 
          }}
        />
      </div>
      <button 
        onClick={handleReset} 
        style={{
          marginLeft: '20px',
          padding: '10px 20px',
          backgroundColor: 'transparent',
          color: 'white',
          fontSize: '20px',
          border: '1px solid rgb(31, 41, 55)',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Reset
      </button>
    </div>

      {clickEmojis.map(emoji => (
        <div
          key={emoji.id}
          style={{ 
            position: 'absolute',
            left: emoji.x, 
            top: emoji.y, 
            fontSize: '20px',
            pointerEvents: 'none',
            animation: 'bounceAndFade 2s forwards',
            '--bounceX': emoji.bounceX,
            '--bounceY': emoji.bounceY,
            '--rotation': emoji.rotation
          }}
        >
          {emoji.emoji}
        </div>
      ))}

      {bread && <BreadBonus position={bread} onCollect={handleCollectBread} />}
      
      <style jsx>{`
        @keyframes bounceAndFade {
          0% { 
            opacity: 1; 
            transform: translateX(0) translateY(0) scale(1) rotate(0deg); 
          }
          100% { 
            opacity: 0; 
            transform: translateX(calc(var(--bounceX) * 100px)) translateY(calc(var(--bounceY) * 100px)) scale(0.5) rotate(calc(var(--rotation) * 1deg)); 
          }
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #fbbe24;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: #48bb78;
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default App;