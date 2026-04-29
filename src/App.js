import React, { useState } from 'react';
import HomeScreen from './HomeScreen';
import ActivityScreen from './ActivityScreen';
import ParentDashboard from './components/ParentDashboard';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [childName, setChildName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);

  const [settings, setSettings] = useState({
    soundOn: true,
    colorTheme: 'blue',
  });

  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className={`app theme-${settings.colorTheme}`}>

      {currentScreen === 'home' && (
        <HomeScreen
          onStartActivity={(name, level) => {
            setChildName(name);
            setSelectedLevel(level);
            navigate('activity');
          }}
          onOpenDashboard={() => navigate('dashboard')}
          settings={settings}
          onSettingsChange={setSettings}
        />
      )}

      {currentScreen === 'activity' && (
        <ActivityScreen
          childName={childName}
          level={selectedLevel}
          settings={settings}
          onGoHome={() => navigate('home')}
        />
      )}

      {currentScreen === 'dashboard' && (
        <ParentDashboard
          onGoBack={() => navigate('home')}
          settings={settings}
        />
      )}

    </div>
  );
}

export default App;