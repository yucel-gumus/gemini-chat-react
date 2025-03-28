import React, { useState, useEffect } from 'react';
import './styles/App.css';
import ChatComponent from './components/chat/ChatComponent';
import VisionComponent from './components/vision/VisionComponent';
import { useTheme } from './contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { checkApiStatus } from './services/geminiService';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState({ isReady: true, message: '' });
  const { darkMode, toggleDarkMode } = useTheme();

  // Check API status on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        await checkApiStatus();
        setApiStatus({ isReady: true, message: '' });
      } catch (error) {
        console.error('API bağlantı hatası:', error);
        setApiStatus({ 
          isReady: false, 
          message: 'API sunucusuna bağlanılamadı. Gemini API anahtarınızı kontrol edin.'
        });
      }
    };
    
    checkApi();
  }, []);

  // Show loading screen briefly
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Ceminay yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">✨</span>
          <h1>Ceminay</h1>
        </div>
        
        <div className="tabs">
          <button 
            className={activeTab === 'chat' ? 'active' : ''} 
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          
          <button 
            className={activeTab === 'vision' ? 'active' : ''} 
            onClick={() => setActiveTab('vision')}
          >
            🖼️ Vision
          </button>
          
          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
            aria-label={darkMode ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
        </div>
      </header>
      
      {!apiStatus.isReady && (
        <div className="api-error-banner">
          <FontAwesomeIcon icon={faExclamationTriangle} className="api-error-icon" />
          <span>{apiStatus.message}</span>
        </div>
      )}
      
      <main className="main">
        {activeTab === 'chat' ? (
          <ChatComponent />
        ) : (
          <VisionComponent />
        )}
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Ceminay AI Assistant</p>
          <p className="footer-tagline">Powered by Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App; 