/**
 * ActivityScreen.js - The main game screen
 *
 * Game flow:
 *   Step 1 (PLAY) → Character reference + live camera side-by-side
 *                    Auto-detects when child makes the right face
 *   Step 2 (CELEBRATION) → Big celebration with confetti + stars
 *   Step 3 (SESSION_END) → Session complete summary
 *
 * Uses face-api.js for real-time expression detection.
 * The child sees the character's emotion and imitates it on camera.
 * When they hold the correct expression, it auto-triggers success!
 */

import React, { useState, useCallback, useEffect } from 'react';
import CameraView from './components/CameraView';
import Confetti from './components/Confetti';
import ProgressBar from './components/ProgressBar';
import { saveProgress } from './utils/api';
import { playSound } from './utils/sounds';
import './ActivityScreen.css';

// All emotions the app teaches
const ALL_EMOTIONS = {
  happy:     { emoji: '😊', label: 'Happy',     color: '#FFD700', hint: 'Show a big smile!', character: '😊' },
  sad:       { emoji: '😢', label: 'Sad',        color: '#74B9FF', hint: 'Make your face droopy', character: '😢' },
  neutral:   { emoji: '😐', label: 'Neutral',    color: '#A0AEC0', hint: 'Relax your face', character: '😐' },
  angry:     { emoji: '😠', label: 'Angry',      color: '#FF7675', hint: 'Scrunch your eyebrows', character: '😠' },
  surprised: { emoji: '😮', label: 'Surprised',  color: '#FDCB6E', hint: 'Open your mouth wide!', character: '😮' },
  scared:    { emoji: '😨', label: 'Scared',     color: '#A29BFE', hint: 'Make your eyes big', character: '😨' },
};

// Which emotions appear at each level
const LEVEL_EMOTIONS = {
  1: ['happy', 'sad', 'neutral'],
  2: ['happy', 'sad', 'neutral', 'angry', 'surprised'],
  3: ['happy', 'sad', 'neutral', 'angry', 'surprised', 'scared'],
};

const ROUNDS_PER_SESSION = 5;

const STEPS = {
  PLAY:        'play',          // Camera + reference — auto-detecting
  CELEBRATION: 'celebration',   // Success celebration
  SESSION_END: 'session_end',   // Session complete
};

function ActivityScreen({ childName, level = 1, settings, onGoHome }) {
  const [step, setStep] = useState(STEPS.PLAY);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [round, setRound] = useState(1);
  const [sessionStars, setSessionStars] = useState(0);
  const [usedEmotions, setUsedEmotions] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const [showNextBtn, setShowNextBtn] = useState(false);

  // Character animation state for the reference card
  const [characterPhase, setCharacterPhase] = useState('neutral'); // neutral → performing → holding

  // Pick a random emotion from the current level (avoid repeating)
  const pickNextEmotion = useCallback((used) => {
    const available = LEVEL_EMOTIONS[level].filter(e => !used.includes(e));
    const pool = available.length > 0 ? available : LEVEL_EMOTIONS[level];
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setCurrentEmotion(picked);
    if (available.length > 0) {
      setUsedEmotions(prev => [...prev, picked]);
    } else {
      setUsedEmotions([picked]);
    }
    return picked;
  }, [level]);

  // Pick the first emotion when component loads
  useEffect(() => {
    pickNextEmotion([]);
  }, [pickNextEmotion]);

  // Character animation: neutral → performing when emotion changes
  useEffect(() => {
    if (!currentEmotion) return;
    setCharacterPhase('neutral');
    const t1 = setTimeout(() => {
      playSound('hover', settings.soundOn);
      setCharacterPhase('performing');
    }, 1000);
    const t2 = setTimeout(() => setCharacterPhase('holding'), 3000); // Give them 2s to watch it perform
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [currentEmotion, settings.soundOn]);

  // When face-api detects the correct emotion
  const handleSuccess = useCallback(async (result) => {
    playSound('success', settings.soundOn);
    const starsEarned = result.confidence > 0.85 ? 3 : result.confidence > 0.70 ? 2 : 1;

    setCelebrationData({
      starsEarned,
      confidence: Math.round(result.confidence * 100),
      detected: result.detected_emotion,
    });

    setSessionStars(prev => prev + starsEarned);
    setShowConfetti(true);
    setStep(STEPS.CELEBRATION);

    // Show next button after a short delay
    setTimeout(() => setShowNextBtn(true), 2000);

    // Save progress
    try {
      await saveProgress({
        child_name: childName,
        emotion: currentEmotion,
        detected_emotion: result.detected_emotion,
        success: true,
        level,
        stars_earned: starsEarned,
      });
    } catch (err) {
      console.error('Save error:', err);
    }
  }, [childName, currentEmotion, level]);

  // Move to next round
  const handleNext = () => {
    playSound('click', settings.soundOn);
    setShowConfetti(false);
    setShowNextBtn(false);
    setCelebrationData(null);

    if (round >= ROUNDS_PER_SESSION) {
      setStep(STEPS.SESSION_END);
    } else {
      setRound(prev => prev + 1);
      pickNextEmotion(usedEmotions);
      setStep(STEPS.PLAY);
    }
  };

  if (!currentEmotion) return <div className="loading-screen"><div className="spinner" /></div>;

  const emotionData = ALL_EMOTIONS[currentEmotion];

  return (
    <div className="activity-screen screen">
      {/* ===== CONFETTI OVERLAY ===== */}
      <Confetti active={showConfetti} duration={3500} />

      {/* ===== HEADER ===== */}
      <div className="activity-header">
        <button className="back-btn interactive-btn" onClick={() => { playSound('click', settings.soundOn); onGoHome(); }} title="Go Home">
          ← Home
        </button>
        <div className="header-info">
          <span className="header-name">👋 {childName}</span>
          <span className="header-level">Level {level} ⭐</span>
        </div>
        <div className="header-stars">
          {sessionStars > 0 ? '⭐'.repeat(Math.min(sessionStars, 5)) : '○'}
          {sessionStars > 5 && <span className="stars-count">+{sessionStars - 5}</span>}
        </div>
      </div>

      {/* Round progress bar */}
      <ProgressBar current={round} total={ROUNDS_PER_SESSION} />

      {/* ===== STEP 1: PLAY (Camera + Reference) ===== */}
      {step === STEPS.PLAY && (
        <div className="step-container play-container fade-in">
          {/* Instruction */}
          <div className="play-instruction">
            <p className="step-instruction">
              Make a <strong style={{ color: emotionData.color }}>{emotionData.label}</strong> face! {emotionData.emoji}
            </p>
            <p className="step-hint">💡 {emotionData.hint}</p>
          </div>

          {/* Main play area: Character reference + Camera */}
          <div className="play-area">
            {/* Character reference card */}
            <div className="character-reference">
              <div className={`character-card character-card--${characterPhase}`}
                   style={{ borderColor: emotionData.color }}>
                <div className="character-emoji">
                  {characterPhase === 'neutral' ? '😐' : emotionData.emoji}
                </div>
                <div className="character-name">{emotionData.label}</div>
                <div className={`character-status character-status--${characterPhase}`}>
                  {characterPhase === 'neutral' && 'Watch me...'}
                  {characterPhase === 'performing' && `I'm ${emotionData.label}!`}
                  {characterPhase === 'holding' && 'Your turn! →'}
                </div>
              </div>
            </div>

            {/* Live camera with detection */}
            <div className="camera-area">
              <CameraView
                targetEmotion={currentEmotion}
                onSuccess={handleSuccess}
                loading={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 2: CELEBRATION ===== */}
      {step === STEPS.CELEBRATION && celebrationData && (
        <div className="step-container celebration-container fade-in">
          {/* Big celebration character */}
          <div className="celebration-character">
            {/* ANIMATION PLACEHOLDER: Replace with celebrating character animation */}
            <div className="celebration-emoji-bounce">🎉</div>
          </div>

          <h2 className="celebration-title">Amazing job! 🌟</h2>
          <p className="celebration-subtitle">
            You made a perfect <strong style={{ color: emotionData.color }}>{emotionData.label}</strong> face!
          </p>

          {/* Stars earned */}
          <div className="celebration-stars">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`celebration-star ${star <= celebrationData.starsEarned ? 'earned' : 'unearned'}`}
                style={{ animationDelay: `${0.5 + star * 0.3}s` }}
              >
                {star <= celebrationData.starsEarned ? '⭐' : '☆'}
              </span>
            ))}
          </div>

          <p className="celebration-confidence">
            Accuracy: {celebrationData.confidence}%
          </p>

          {/* Next button (appears after delay) */}
          {showNextBtn && (
            <button className="btn-primary next-btn fade-in" onClick={handleNext}>
              {round >= ROUNDS_PER_SESSION ? '🏁 See Results!' : '➡️ Next Emotion!'}
            </button>
          )}
        </div>
      )}

      {/* ===== STEP 3: SESSION END ===== */}
      {step === STEPS.SESSION_END && (
        <div className="session-end fade-in">
          <Confetti active={true} duration={5000} />
          <div className="session-end-card card">
            <div className="celebration-emoji-bounce">🎊</div>
            <h2>Amazing job, {childName}! 🏆</h2>
            <p className="session-end-subtitle">You finished the session!</p>

            <div className="total-stars-display">
              <div className="total-stars-number">{sessionStars}</div>
              <div className="total-stars-label">Stars Earned!</div>
              <div className="stars-row">
                {Array.from({ length: Math.min(sessionStars, 15) }).map((_, i) => (
                  <span key={i} className="big-star" style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
                ))}
              </div>
            </div>

            <div className="session-actions">
              <button
                className="btn-primary interactive-btn"
                onClick={() => {
                  playSound('click', settings.soundOn);
                  setRound(1);
                  setSessionStars(0);
                  setUsedEmotions([]);
                  setShowConfetti(false);
                  setStep(STEPS.PLAY);
                  pickNextEmotion([]);
                }}
              >
                🎮 Play Again!
              </button>
              <button className="btn-secondary interactive-btn" onClick={() => { playSound('click', settings.soundOn); onGoHome(); }}>
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityScreen;
