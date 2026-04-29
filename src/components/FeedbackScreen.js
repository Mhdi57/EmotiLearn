/**
 * FeedbackScreen.js - Shows result after emotion detection
 *
 * Animation slots:
 *   - successCelebration: Big celebration when child gets it right
 *   - tryAgainEncouragement: Encouraging animation for retry
 *   - starsAnimation: Stars popping in one by one
 *   - characterReaction: Character reacting to the result
 */

import React, { useState, useEffect } from 'react';

const FeedbackScreen = ({ result, targetEmotion, onNext, onRetry, isLastRound }) => {
  const [showStars, setShowStars] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Stagger the reveal of elements
  useEffect(() => {
    const starsTimer = setTimeout(() => setShowStars(true), 800);
    const actionsTimer = setTimeout(() => setShowActions(true), 1500);

    return () => {
      clearTimeout(starsTimer);
      clearTimeout(actionsTimer);
    };
  }, []);

  return (
    <div className="feedback-screen step-container fade-in">
      {/* ====== CHARACTER REACTION ====== */}
      <div className="feedback-character">
        {/*
         * ANIMATION PLACEHOLDER: Character Reaction
         *
         * Replace with animated character that:
         *   - Celebrates (jumping, clapping) on success
         *   - Shows encouraging expression on failure
         *
         * Props available:
         *   - result.success: boolean
         *   - result.starsEarned: number (0-3)
         *
         * Example:
         *   <CharacterReaction success={result.success} stars={result.starsEarned} />
         */}
        <div className={`feedback-character-placeholder ${result.success ? 'celebrating' : 'encouraging'}`}>
          {result.success ? '🎉' : '💪'}
        </div>
      </div>

      {/* ====== RESULT MESSAGE ====== */}
      <div className="feedback-message">
        {result.success ? (
          <>
            {/*
             * ANIMATION PLACEHOLDER: Success Text Animation
             * Replace with animated text reveal (e.g. text flying in with confetti)
             */}
            <h2 className="feedback-title feedback-title--success">
              Amazing job! 🌟
            </h2>
            <p className="feedback-subtitle">
              You made a perfect <strong style={{ color: targetEmotion.color }}>{targetEmotion.label}</strong> face!
            </p>
          </>
        ) : (
          <>
            {/*
             * ANIMATION PLACEHOLDER: Encouragement Animation
             * Replace with gentle, encouraging animation
             */}
            <h2 className="feedback-title feedback-title--retry">
              Almost there! 🤔
            </h2>
            <p className="feedback-subtitle">
              Let's try making your <strong style={{ color: targetEmotion.color }}>{targetEmotion.label}</strong> face again!
            </p>
          </>
        )}
      </div>

      {/* ====== STARS DISPLAY ====== */}
      {showStars && (
        <div className="feedback-stars">
          {/*
           * ANIMATION PLACEHOLDER: Stars Animation
           *
           * Replace with animated stars that pop in one by one with
           * particle effects. Earned stars should be golden, unearned gray.
           *
           * Example:
           *   <AnimatedStars earned={result.starsEarned} total={3} />
           */}
          <div className="stars-display">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`feedback-star ${star <= result.starsEarned ? 'earned' : 'unearned'}`}
                style={{ animationDelay: `${star * 0.2}s` }}
              >
                {star <= result.starsEarned ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ====== ACTION BUTTONS ====== */}
      {showActions && (
        <div className="feedback-actions">
          {result.success ? (
            <button
              className="btn-primary feedback-btn"
              onClick={onNext}
            >
              {/*
               * ANIMATION PLACEHOLDER: Button animation
               * Replace with animated button (pulsing glow, bouncing arrow, etc.)
               */}
              {isLastRound ? '🏁 Finish Session!' : '➡️ Next Emotion!'}
            </button>
          ) : (
            <button
              className="btn-primary feedback-btn feedback-btn--retry"
              onClick={onRetry}
            >
              {/*
               * ANIMATION PLACEHOLDER: Retry button animation
               * Replace with spinning retry icon animation
               */}
              🔄 Try Again!
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackScreen;
