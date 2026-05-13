// utils/emotions.js

export const ALL_EMOTIONS = {
  happy: {
    label: 'Happy',
    emoji: '😊',
    color: '#4CAF50',
    hint: 'Think of something that makes you smile!'
  },
  sad: {
    label: 'Sad',
    emoji: '😢',
    color: '#2196F3',
    hint: 'It is okay to be sad sometimes.'
  },
  neutral: {
    label: 'Neutral',
    emoji: '😐',
    color: '#9E9E9E',
    hint: 'Try to relax your face.'
  },
  angry: {
    label: 'Angry',
    emoji: '😠',
    color: '#F44336',
    hint: 'Show me your tough face!'
  },
  surprised: {
    label: 'Surprised',
    emoji: '😮',
    color: '#FF9800',
    hint: 'Open your mouth wide!'
  },
  scared: {
    label: 'Scared',
    emoji: '😨',
    color: '#9C27B0',
    hint: 'Imagine seeing something spooky!'
  }
};

export const LEVEL_EMOTIONS = {
  1: ['happy', 'sad', 'neutral'],
  2: ['happy', 'sad', 'neutral', 'angry', 'surprised'],
  3: ['happy', 'sad', 'neutral', 'angry', 'surprised', 'scared']
};
