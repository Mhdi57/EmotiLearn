/**
 * sounds.js
 * Utility for playing UI sound effects
 */

// Simple synthesizer to generate sounds without needing external files
const playTone = (frequency, type, duration, volume = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("AudioContext not supported or blocked");
  }
};

export const playSound = (soundName, isSoundOn) => {
  if (!isSoundOn) return;

  switch (soundName) {
    case 'click':
      // Short blip
      playTone(600, 'sine', 0.1, 0.05);
      setTimeout(() => playTone(800, 'sine', 0.1, 0.05), 50);
      break;
    case 'success':
      // Happy chime (arpeggio)
      playTone(523.25, 'sine', 0.2, 0.1); // C5
      setTimeout(() => playTone(659.25, 'sine', 0.2, 0.1), 100); // E5
      setTimeout(() => playTone(783.99, 'sine', 0.4, 0.1), 200); // G5
      setTimeout(() => playTone(1046.50, 'sine', 0.6, 0.1), 300); // C6
      break;
    case 'error':
      // Low boop
      playTone(300, 'triangle', 0.3, 0.1);
      setTimeout(() => playTone(250, 'triangle', 0.4, 0.1), 150);
      break;
    case 'hover':
      // Very soft tick
      playTone(1000, 'sine', 0.05, 0.01);
      break;
    case 'celebration':
      // Long happy sequence
      playTone(440, 'square', 0.2, 0.05); // A4
      setTimeout(() => playTone(554.37, 'square', 0.2, 0.05), 150); // C#5
      setTimeout(() => playTone(659.25, 'square', 0.2, 0.05), 300); // E5
      setTimeout(() => playTone(880, 'square', 0.6, 0.05), 450); // A5
      break;
    case 'countdown_tick':
      // Mid-pitched beep
      playTone(440, 'sine', 0.2, 0.1); // A4
      break;
    case 'countdown_go':
      // High-pitched longer beep
      playTone(880, 'sine', 0.4, 0.1); // A5
      break;
    default:
      break;
  }
};
