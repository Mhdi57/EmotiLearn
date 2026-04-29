/**
 * HomeScreen.js
 * The first screen the child/parent sees.
 * Has options: Start the game (Level Select), Settings, or open Parent Dashboard.
 */

import React, { useState } from 'react';
import { playSound } from './utils/sounds';
import './HomeScreen.css';

// Emoji faces for decoration
const EMOTION_EMOJIS = ['😊', '😢', '😠', '😮', '😨', '😐'];

function HomeScreen({ onStartActivity, onOpenDashboard, settings, onSettingsChange }) {
  const [childName, setChildName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showParentPin, setShowParentPin] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Simple PIN for parent area (in real app, this would be more secure)
  const PARENT_PIN = '1234';

  const handleHover = () => {
    playSound('hover', settings.soundOn);
  };

  const handleStartClick = () => {
    playSound('click', settings.soundOn);
    const name = childName.trim() || 'Friend';
    setChildName(name); // ensure it's set
    setShowLevelSelect(true); // Go to level selection
  };

  const handleLevelSelect = (level) => {
    playSound('success', settings.soundOn);
    onStartActivity(childName, level);
  };

  const handleParentLogin = () => {
    if (pinInput === PARENT_PIN) {
      playSound('success', settings.soundOn);
      setPinError(false);
      setShowParentPin(false);
      setPinInput('');
      onOpenDashboard();
    } else {
      playSound('error', settings.soundOn);
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const toggleSettings = () => {
    playSound('click', settings.soundOn);
    setShowSettings(!showSettings);
  };

  const toggleParentArea = () => {
    playSound('click', settings.soundOn);
    setShowParentPin(true);
  };

  const handleGoBack = () => {
    playSound('click', settings.soundOn);
    setShowLevelSelect(false);
  };

  return (
    <div className="home-screen screen">
      {/* Floating emoji decoration */}
      <div className="emoji-decoration" aria-hidden="true">
        {EMOTION_EMOJIS.map((emoji, i) => (
          <span key={i} className="float-emoji" style={{ animationDelay: `${i * 0.5}s` }}>
            {emoji}
          </span>
        ))}
      </div>

      {/* Main card */}
      <div className="home-card card fade-in">
        {/* App title */}
        <h1 className="app-title">EmotiLearn</h1>
        <p className="app-subtitle">Learn feelings, have fun! 🌟</p>

        {!showLevelSelect ? (
          <>
            {/* Mascot */}
            <div className="mascot-area" onMouseEnter={handleHover}>
              <div className="mascot-placeholder interactive-mascot">
                <div className="mascot-face">😊</div>
              </div>
            </div>

            {/* Name input */}
            <div className="name-section">
              <label className="name-label">What's your name?</label>
              <input
                type="text"
                className="name-input interactive-input"
                placeholder="Type your name here..."
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartClick()}
                onFocus={handleHover}
                maxLength={20}
              />
            </div>

            {/* Start button */}
            <button
              className="btn-primary start-btn interactive-btn"
              onClick={handleStartClick}
              onMouseEnter={handleHover}
            >
              🎮 Let's Play!
            </button>
          </>
        ) : (
          <div className="level-select-container fade-in">
            <h2 className="level-select-title">Hi {childName}! Pick a Level:</h2>
            <div className="level-options">
              <button 
                className="level-card level-easy interactive-btn" 
                onClick={() => handleLevelSelect(1)}
                onMouseEnter={handleHover}
              >
                <h3>Level 1: Easy</h3>
                <p>😊 😢 😐</p>
                <span className="level-desc">Happy, Sad, Neutral</span>
              </button>
              
              <button 
                className="level-card level-medium interactive-btn" 
                onClick={() => handleLevelSelect(2)}
                onMouseEnter={handleHover}
              >
                <h3>Level 2: Medium</h3>
                <p>😠 😮</p>
                <span className="level-desc">Adds Angry & Surprised</span>
              </button>

              <button 
                className="level-card level-hard interactive-btn" 
                onClick={() => handleLevelSelect(3)}
                onMouseEnter={handleHover}
              >
                <h3>Level 3: Hard</h3>
                <p>😨</p>
                <span className="level-desc">Adds Scared</span>
              </button>
            </div>
            <button className="btn-secondary back-btn interactive-btn mt-4" onClick={handleGoBack} onMouseEnter={handleHover}>
              ← Back
            </button>
          </div>
        )}

        {/* Bottom options */}
        {!showLevelSelect && (
          <div className="bottom-options">
            <button
              className="option-btn interactive-btn"
              onClick={toggleSettings}
              onMouseEnter={handleHover}
            >
              ⚙️ Settings
            </button>
            <button
              className="option-btn interactive-btn"
              onClick={toggleParentArea}
              onMouseEnter={handleHover}
            >
              👩‍💼 Parent Area
            </button>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel card fade-in">
          <h3>⚙️ Settings</h3>

          <div className="setting-row">
            <label>Sound</label>
            <button
              className={`toggle-btn interactive-btn ${settings.soundOn ? 'on' : 'off'}`}
              onClick={() => {
                playSound('click', !settings.soundOn ? true : false); // Play if turning on
                onSettingsChange({ ...settings, soundOn: !settings.soundOn });
              }}
              onMouseEnter={handleHover}
            >
              {settings.soundOn ? '🔊 On' : '🔇 Off'}
            </button>
          </div>

          <div className="setting-row">
            <label>Color Theme</label>
            <div className="color-options">
              {['blue', 'green', 'purple'].map(color => (
                <button
                  key={color}
                  className={`color-btn interactive-btn color-${color} ${settings.colorTheme === color ? 'selected' : ''}`}
                  onClick={() => {
                    playSound('click', settings.soundOn);
                    onSettingsChange({ ...settings, colorTheme: color });
                  }}
                  onMouseEnter={handleHover}
                  title={color}
                />
              ))}
            </div>
          </div>

          <button
            className="btn-secondary interactive-btn"
            onClick={toggleSettings}
            onMouseEnter={handleHover}
            style={{ marginTop: '16px', width: '100%' }}
          >
            Close
          </button>
        </div>
      )}

      {/* Parent PIN Modal */}
      {showParentPin && (
        <div className="modal-overlay" onClick={() => { setShowParentPin(false); setPinInput(''); playSound('click', settings.soundOn); }}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>👩‍💼 Parent Login</h3>
            <p className="modal-hint">Enter PIN to access parent dashboard</p>
            <p className="modal-hint" style={{ color: '#888', fontSize: '0.85rem' }}>
              (Demo PIN: 1234)
            </p>

            <input
              type="password"
              className={`pin-input interactive-input ${pinError ? 'shake' : ''}`}
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => {
                playSound('hover', settings.soundOn); // little tick for typing
                setPinInput(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleParentLogin()}
              maxLength={6}
              autoFocus
            />

            {pinError && <p className="error-msg">❌ Wrong PIN. Try again!</p>}

            <div className="modal-buttons">
              <button className="btn-primary interactive-btn" onClick={handleParentLogin} onMouseEnter={handleHover}>
                Enter
              </button>
              <button
                className="btn-secondary interactive-btn"
                onClick={() => { playSound('click', settings.soundOn); setShowParentPin(false); setPinInput(''); setPinError(false); }}
                onMouseEnter={handleHover}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
