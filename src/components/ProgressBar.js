import React from 'react';

const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="progress-container" style={{ margin: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold', color: '#666' }}>
        <span>Round {current} of {total}</span>
      </div>
      <div 
        className="progress-bar-bg" 
        style={{ 
          width: '100%', 
          backgroundColor: '#e0e0e0', 
          height: '16px', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: '#4CAF50', 
            height: '100%', 
            borderRadius: '8px', 
            transition: 'width 0.5s ease-out' 
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
