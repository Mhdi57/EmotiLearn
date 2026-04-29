/**
 * EmotionCard.js - Character emotion demonstration card
 *
 * Shows the character/mascot demonstrating the target emotion.
 * The character "performs" the emotion first, then the child imitates.
 *
 * Animation slots:
 *   - characterAnimation: The main character face animation
 *   - emotionEntrance: How the card appears on screen
 *   - emotionIdle: Subtle idle loop while showing
 */

import React, { useState, useEffect } from 'react';

const EmotionCard = ({ emotion, emotionKey, showDemo = true }) => {
  const [demoPhase, setDemoPhase] = useState('entering'); // entering → performing → idle

  // Simulate the character performing the emotion
  useEffect(() => {
    setDemoPhase('entering');

    // Phase 1: Card enters
    const enterTimer = setTimeout(() => setDemoPhase('performing'), 600);

    // Phase 2: Character "performs" the emotion (animation would play here)
    const performTimer = setTimeout(() => setDemoPhase('idle'), 2000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(performTimer);
    };
  }, [emotionKey]);

  if (!emotion) return null;

  return (
    <div
      className={`emotion-card emotion-card--${demoPhase}`}
      style={{ '--emotion-color': emotion.color }}
    >
      {/* ====== CHARACTER AREA ====== */}
      <div className="emotion-card__character">
        {/*
         * ANIMATION PLACEHOLDER: Character Face Animation
         *
         * Replace this entire div with your animated character component.
         * The character should:
         *   1. Start with a neutral face (entering phase)
         *   2. Transition to the target emotion (performing phase)
         *   3. Hold the emotion with subtle movement (idle phase)
         *
         * Props available:
         *   - emotionKey: string (e.g. 'happy', 'sad', 'angry')
         *   - demoPhase: 'entering' | 'performing' | 'idle'
         *
         * Example replacement:
         *   <CharacterAnimation emotion={emotionKey} phase={demoPhase} />
         */}
        <div className={`character-placeholder character-placeholder--${demoPhase}`}>
          {/* Default emoji face — replace with animated character */}
          <div className="character-face">
            {demoPhase === 'entering' ? '😐' : emotion.emoji}
          </div>

          {/* Character body/context — replace with character body animation */}
          <div className="character-body">
            {/* ANIMATION PLACEHOLDER: Character body that reacts to emotion */}
            <div className="character-body-placeholder" />
          </div>
        </div>
      </div>

      {/* ====== EMOTION LABEL ====== */}
      <div className="emotion-card__label">
        <h2 className="emotion-name" style={{ color: emotion.color }}>
          {emotion.label}
        </h2>
      </div>

      {/* ====== DEMO INSTRUCTION ====== */}
      {showDemo && (
        <div className={`emotion-card__demo-status demo-status--${demoPhase}`}>
          {demoPhase === 'entering' && (
            <span className="demo-text">Watch me... 👀</span>
          )}
          {demoPhase === 'performing' && (
            <>
              {/* ANIMATION PLACEHOLDER: Replace with animated "performing" indicator */}
              <span className="demo-text demo-text--performing">
                I'm making a {emotion.label} face!
              </span>
            </>
          )}
          {demoPhase === 'idle' && (
            <span className="demo-text demo-text--ready">
              Now you try! 🎯
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EmotionCard;
