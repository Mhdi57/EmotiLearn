/**
 * Confetti.js - Pure CSS confetti celebration animation
 *
 * Shows colorful confetti particles falling from the top
 * with stars and sparkles for celebrating achievements.
 */

import React, { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A29BFE', '#FF9FF3', '#54A0FF', '#5F27CD', '#FF9800'];
const SHAPES = ['circle', 'square', 'triangle', 'star'];

const Confetti = ({ active, duration = 3000 }) => {
  const [particles, setParticles] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    // Generate confetti particles
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 2,
      size: 6 + Math.random() * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      rotation: Math.random() * 360,
      drift: -30 + Math.random() * 60,
    }));

    setParticles(newParticles);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (!visible) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`confetti-particle confetti-${p.shape}`}
          style={{
            left: `${p.left}%`,
            '--fall-delay': `${p.delay}s`,
            '--fall-duration': `${p.duration}s`,
            '--particle-size': `${p.size}px`,
            '--particle-color': p.color,
            '--particle-rotation': `${p.rotation}deg`,
            '--particle-drift': `${p.drift}px`,
          }}
        />
      ))}

      {/* Big celebration stars */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={`star-${i}`}
          className="confetti-big-star"
          style={{
            left: `${15 + i * 15}%`,
            '--star-delay': `${0.2 + i * 0.15}s`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
};

export default Confetti;
