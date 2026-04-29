/**
 * utils/api.js
 * Manages saving and loading progress using localStorage.
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

export const analyzeEmotion = async (imageData, currentEmotion) => {
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock successful response 80% of the time
      const isSuccess = Math.random() > 0.2;
      
      resolve({
        success: isSuccess,
        detected_emotion: isSuccess ? currentEmotion : 'neutral',
        confidence: isSuccess ? (0.7 + Math.random() * 0.3) : 0.4,
      });
    }, 1500);
  });
};

export const saveProgress = async (data) => {
  try {
    const newRecord = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRecord)
    });

    if (!response.ok) {
      throw new Error('Failed to save to database');
    }

    const savedRecord = await response.json();
    console.log('Progress saved successfully to DB:', savedRecord);
    return { success: true, record: savedRecord };
  } catch (err) {
    console.error('Failed to save progress to DB. Falling back to localStorage:', err);
    
    // Fallback to local storage if API fails (for resilience)
    try {
      const existing = localStorage.getItem('emotilearn_history');
      const history = existing ? JSON.parse(existing) : [];
      const newRecord = {
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      };
      history.push(newRecord);
      if (history.length > 50) history.shift();
      localStorage.setItem('emotilearn_history', JSON.stringify(history));
      return { success: true, record: newRecord, fallback: true };
    } catch (localErr) {
      return { success: false, error: err.message };
    }
  }
};

export const getHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch from database');
    }
    const history = await response.json();
    return history;
  } catch (err) {
    console.error('Failed to get history from DB. Falling back to localStorage:', err);
    try {
      const existing = localStorage.getItem('emotilearn_history');
      const history = existing ? JSON.parse(existing) : [];
      // Normalize timestamp vs date
      const normalizedHistory = history.map(item => ({
        ...item,
        date: item.timestamp || item.date
      }));
      normalizedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      return normalizedHistory;
    } catch (localErr) {
      return [];
    }
  }
};
