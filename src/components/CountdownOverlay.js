import React, { useState, useEffect, useCallback } from 'react';
import './CountdownOverlay.css';

const CountdownOverlay = ({ onFinished }) => {
  const [count, setCount] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerStep = useCallback((val) => {
    setCount(val);
    setIsAnimating(false);
    
    // Trigger animation re-flow
    setTimeout(() => setIsAnimating(true), 10);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Start countdown sequence
    const sequence = async () => {
      // Ready -> 3
      if (mounted) triggerStep(3);
      await delay(1200);
      
      // Set -> 2
      if (mounted) triggerStep(2);
      await delay(1200);
      
      // Go -> 1
      if (mounted) triggerStep(1);
      await delay(1000);
      
      if (mounted) onFinished();
    };

    sequence();
    
    return () => { mounted = false; };
  }, [onFinished, triggerStep]);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="countdown-overlay">
      <div className={`countdown-number ${isAnimating ? 'animate' : ''} count-${count.toString().toLowerCase().replace('!', '')}`}>
        {count}
      </div>
      <div className="countdown-blur-bg" />
    </div>
  );
};

export default CountdownOverlay;
