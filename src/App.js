import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import GeminiComponent from "./GeminiComponent";
import GeminiVision from "./GeminiVision";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faComment, faImage } from "@fortawesome/free-solid-svg-icons";
import "./index.css";

// Create context for dark mode
export const DarkModeContext = createContext();

// Layout component with header and navigation
const Layout = ({ children, darkMode, toggleDarkMode }) => {
  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "20px auto", 
      padding: "0 15px",
      transition: "all 0.3s ease",
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        marginBottom: "20px",
        borderRadius: "10px",
        backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
        boxShadow: darkMode ? "0 4px 8px rgba(255, 255, 255, 0.1)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px",
          color: darkMode ? "#e0e0e0" : "#333",
        }}>
        
          <h1 style={{ 
            margin: 0, 
            fontSize: "20px",
            fontWeight: "bold",
          }}>
            Ceminay
          </h1>
        </div>
        
        <div style={{ display: "flex", gap: "15px" }}>
          <a 
            href="/" 
            style={{ 
              color: darkMode ? "#87CEEB" : "#007bff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "8px 12px",
              borderRadius: "5px",
              backgroundColor: window.location.pathname === "/" 
                ? (darkMode ? "#2a4d69" : "#f0f8ff") 
                : "transparent",
            }}
          >
            <FontAwesomeIcon icon={faComment} />
            <span>Chat</span>
          </a>
          
          <a 
            href="/geminivision" 
            style={{ 
              color: darkMode ? "#87CEEB" : "#007bff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "8px 12px",
              borderRadius: "5px",
              backgroundColor: window.location.pathname === "/geminivision" 
                ? (darkMode ? "#2a4d69" : "#f0f8ff") 
                : "transparent",
            }}
          >
            <FontAwesomeIcon icon={faImage} />
            <span>Vision</span>
          </a>
          
          <button 
            onClick={toggleDarkMode}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: darkMode ? "#e0e0e0" : "#333",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "8px 12px",
              borderRadius: "5px",
            }}
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
        </div>
      </header>
      
      {children}
      
      <footer style={{
        textAlign: "center",
        padding: "15px",
        marginTop: "20px",
        color: darkMode ? "#aaa" : "#666",
        fontSize: "14px",
      }}>
        &copy; {new Date().getFullYear()} Yücel Gümüş- Tüm hakları saklıdır.
      </footer>
    </div>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Load dark mode preference from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Save dark mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    // Apply dark mode to body
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.style.backgroundColor = "#121212";
    } else {
      document.body.classList.remove("dark-mode");
      document.body.style.backgroundColor = "#ffffff";
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: darkMode ? "#121212" : "#ffffff",
        color: darkMode ? "#e0e0e0" : "#333",
      }}>
        <p style={{ marginTop: "20px" }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <Router>
        <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
          <Routes>
            <Route path="/" element={<GeminiComponent />} />
            <Route path="/geminivision" element={<GeminiVision />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </DarkModeContext.Provider>
  );
};

export default App;
