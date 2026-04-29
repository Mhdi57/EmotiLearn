import React, { useEffect, useState } from 'react';
import { getHistory } from '../utils/api';
import { playSound } from '../utils/sounds';
import './ParentDashboard.css';

const ParentDashboard = ({ onGoBack, settings }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getHistory();
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const totalStars = history.reduce((acc, curr) => acc + (curr.stars_earned || 0), 0);
  const totalSessions = history.length;
  
  // Calculate top emotion based on history
  const emotionsCount = history.reduce((acc, curr) => {
    if (curr.success) {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
    }
    return acc;
  }, {});
  
  const topEmotion = Object.entries(emotionsCount).sort((a, b) => b[1] - a[1])[0];
  const bestEmotion = topEmotion ? topEmotion[0] : 'None yet';

  const handleBackClick = () => {
    playSound('click', settings.soundOn);
    onGoBack();
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-screen screen">
      <div className="dashboard-header">
        <button className="back-btn interactive-btn" onClick={handleBackClick}>
          ← Back to Menu
        </button>
        <h2>👩‍💼 Parent Dashboard</h2>
      </div>

      <div className="dashboard-content fade-in">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{totalStars}</div>
            <div className="stat-label">Total Stars Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎮</div>
            <div className="stat-value">{totalSessions}</div>
            <div className="stat-label">Emotions Practiced</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value" style={{ textTransform: 'capitalize' }}>{bestEmotion}</div>
            <div className="stat-label">Best Emotion</div>
          </div>
        </div>

        <div className="history-section card">
          <h3>Recent Play History</h3>
          
          {loading ? (
            <p className="history-empty">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="history-empty">No play history yet. Go play some games!</p>
          ) : (
            <div className="history-list">
              {history.map((record) => (
                <div key={record.id} className="history-item">
                  <div className="history-info">
                    <span className="history-date">{formatDate(record.timestamp)}</span>
                    <span className="history-child">Player: <strong>{record.child_name || 'Friend'}</strong></span>
                  </div>
                  <div className="history-details">
                    <span className="history-emotion">
                      Target: <strong style={{ textTransform: 'capitalize' }}>{record.emotion}</strong>
                    </span>
                    <span className="history-stars">
                      {record.success ? '⭐'.repeat(record.stars_earned || 1) : '❌ Missed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
