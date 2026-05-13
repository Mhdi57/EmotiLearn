import React, { useState, useCallback, useEffect, useRef } from 'react';
import CameraView from './components/CameraView';
import CountdownOverlay from './components/CountdownOverlay';
import Confetti from './components/Confetti';
import ProgressBar from './components/ProgressBar';
import { ALL_EMOTIONS, LEVEL_EMOTIONS } from './utils/emotions';
import { playSound } from './utils/sounds';
import { saveProgress } from './utils/api';
import './ActivityScreen.css';

const STEPS = {
  COUNTDOWN: 'countdown',
  PLAY: 'play',
  CELEBRATION: 'celebration',
  SESSION_END: 'session_end'
};

const ROUNDS_PER_SESSION = 5;

const ActivityScreen = ({ childName, level, onGoHome, settings }) => {
  const [round, setRound] = useState(1);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [usedEmotions, setUsedEmotions] = useState([]);
  const [step, setStep] = useState(STEPS.COUNTDOWN);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [sessionStars, setSessionStars] = useState(0);
  const [celebrationData, setCelebrationData] = useState(null);

  // Character animation state for the reference card
  const [characterPhase, setCharacterPhase] = useState('neutral'); // neutral → performing → holding
  const countdownAudioRef = useRef(null);

  const handleCountdownFinished = useCallback(() => {
    setStep(STEPS.PLAY);
  }, []);

  // Pick a random emotion from the current level (avoid repeating)
  const pickNextEmotion = useCallback((used, lastEmotion) => {
    // 1. Get all emotions for this level
    const allForLevel = LEVEL_EMOTIONS[level];

    // 2. Try to pick one that hasn't been used in this session yet
    // AND is not the one we just did
    let available = allForLevel.filter(e => !used.includes(e) && e !== lastEmotion);

    // 3. If everything has been used, reset the 'used' list but still avoid the last one
    if (available.length === 0) {
      available = allForLevel.filter(e => e !== lastEmotion);
    }

    // 4. Final fallback (should only happen if level has only 1 emotion)
    if (available.length === 0) available = allForLevel;

    const picked = available[Math.floor(Math.random() * available.length)];
    setCurrentEmotion(picked);
    setUsedEmotions(prev => {
      const nextUsed = [...prev, picked];
      // If we've used all emotions, we might want to clear the 'used' history 
      // but keep the 'lastEmotion' check active for the next round
      return nextUsed.length >= allForLevel.length ? [] : nextUsed;
    });
    setCharacterPhase('neutral');
    return picked;
  }, [level]);

  const sessionStartedRef = useRef(false);

  // Pick the first emotion when component loads
  useEffect(() => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    pickNextEmotion([], null);

    // Initial audio play
    if (settings.soundOn) {
      const audio = new Audio('/sounds/countdown.mp3');
      countdownAudioRef.current = audio;
      audio.play().catch(err => {
        console.warn("Audio play blocked:", err);
        countdownAudioRef.current = null;
      });
    }
  }, [pickNextEmotion, settings.soundOn]);

  // Character animation: neutral → performing when emotion changes
  useEffect(() => {
    if (step === STEPS.PLAY || step === STEPS.COUNTDOWN) {
      const timer = setTimeout(() => {
        setCharacterPhase('performing');
        playSound('instruction', settings.soundOn);

        // After showing, hold for a bit then tell user it's their turn
        setTimeout(() => setCharacterPhase('holding'), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentEmotion, step, settings.soundOn]);

  // Handle successful emotion match
  const handleSuccess = useCallback(async (result) => {
    if (step !== STEPS.PLAY) return;

    playSound('success', settings.soundOn);
    setCelebrationData(result);

    // Earn stars based on confidence
    const starsEarned = result.confidence > 0.8 ? 3 : (result.confidence > 0.5 ? 2 : 1);
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
  }, [childName, currentEmotion, level, settings.soundOn, step]);

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
      pickNextEmotion(usedEmotions, currentEmotion);
      setStep(STEPS.COUNTDOWN);

      // Start countdown audio
      if (settings.soundOn) {
        if (countdownAudioRef.current) {
          countdownAudioRef.current.pause();
          countdownAudioRef.current.currentTime = 0;
        }
        countdownAudioRef.current = new Audio('/sounds/countdown.mp3');
        countdownAudioRef.current.play().catch(err => console.warn("Audio play blocked:", err));
      }
    }
  };

  // Restart session
  const handleRestart = () => {
    playSound('click', settings.soundOn);
    setRound(1);
    setSessionStars(0);
    setUsedEmotions([]);
    setStep(STEPS.COUNTDOWN);
    pickNextEmotion([], null);

    if (settings.soundOn) {
      const audio = new Audio('/sounds/countdown.mp3');
      countdownAudioRef.current = audio;
      audio.play().catch(err => console.warn("Audio play blocked:", err));
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
      {(step === STEPS.PLAY || step === STEPS.COUNTDOWN) && (
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
                hideVideo={step === STEPS.COUNTDOWN}
                activeDetection={step === STEPS.PLAY}
              />
              {step === STEPS.COUNTDOWN && (
                <CountdownOverlay
                  onFinished={handleCountdownFinished}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 2: CELEBRATION ===== */}
      {step === STEPS.CELEBRATION && celebrationData && (
        <div className="step-container celebration-container fade-in">
          <div className="celebration-character">
            <div className="celebration-emoji-bounce">🎉</div>
          </div>
          <h2 className="celebration-title">You did it! 🌟</h2>
          <p className="celebration-text">That was a perfect {currentEmotion} face!</p>

          {showNextBtn && (
            <button className="next-btn interactive-btn pop-in" onClick={handleNext}>
              Next Round →
            </button>
          )}
        </div>
      )}

      {/* ===== STEP 3: SESSION END ===== */}
      {step === STEPS.SESSION_END && (
        <div className="step-container end-container fade-in">
          <div className="end-trophy">🏆</div>
          <h2 className="end-title">Session Complete!</h2>
          <p className="end-text">You earned {sessionStars} stars today!</p>
          <div className="end-stars">{'⭐'.repeat(Math.min(sessionStars, 10))}</div>
          <div className="end-buttons">
            <button className="finish-btn play-again-btn interactive-btn" onClick={handleRestart}>
              🔄 Play Again
            </button>
            <button className="finish-btn interactive-btn" onClick={onGoHome}>
              🏠 Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityScreen;
