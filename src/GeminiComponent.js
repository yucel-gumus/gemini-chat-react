import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faSpinner } from "@fortawesome/free-solid-svg-icons";
import "../src/index.css";

// Extracted ChatMessage component
const ChatMessage = ({ role, content, darkMode }) => (
  <div
    className={`card ${role}`}
    style={{
      borderRadius: "10px",
      padding: "10px",
      marginBottom: "10px",
      overflow: "hidden",
      boxShadow: darkMode ? "0 4px 8px rgba(255, 255, 255, 0.1)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode 
        ? (role === "user" ? "#2a4d69" : "#1a1a1a") 
        : (role === "user" ? "#f0f8ff" : "#e6e6e6"),
      transition: "all 0.3s ease",
    }}
  >
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontSize: "16px",
        fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
        backgroundColor: darkMode 
          ? (role === "user" ? "#4682b4" : "#555555") 
          : (role === "user" ? "#add8e6" : "#b0b0b0"),
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        padding: "10px",
        color: darkMode ? "#f0f0f0" : "#333",
        fontWeight: "bold",
      }}
    >
      {role}
    </div>
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontSize: "14px",
        borderRadius: "10px",
        fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
        backgroundColor: darkMode ? "#2c2c2c" : "#ffffff",
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
        padding: "10px",
        marginTop: "5px",
        color: darkMode ? "#e0e0e0" : "#555",
      }}
    >
      {content}
    </div>
  </div>
);

// Extracted ChatHistory component
const ChatHistory = ({ messages, chatHistoryRef, darkMode }) => (
  <div
    className="custom-scrollbar"
    ref={chatHistoryRef}
    style={{
      overflowY: "auto",
      maxHeight: "600px",
      overflowX: "hidden",
      maxWidth: "100%",
      borderRadius: "10px",
      padding: "10px",
      backgroundColor: darkMode ? "#1e1e1e" : "#f9f9f9",
      transition: "background-color 0.3s ease",
    }}
  >
    {messages.length === 0 ? (
      <div style={{
        textAlign: "center", 
        padding: "20px", 
        color: darkMode ? "#aaa" : "#888",
        fontStyle: "italic"
      }}>
        Sohbete başlamak için bir mesaj gönderin
      </div>
    ) : (
      messages.map((message, index) => (
        <ChatMessage key={index} role={message.role} content={message.text} darkMode={darkMode} />
      ))
    )}
  </div>
);

// Typing animation component
const TypingAnimation = ({ darkMode }) => (
  <div style={{ 
    display: "flex", 
    justifyContent: "center", 
    padding: "10px",
    color: darkMode ? "#aaa" : "#888" 
  }}>
    <FontAwesomeIcon 
      icon={faSpinner} 
      spin 
      style={{ marginRight: "10px" }} 
    />
    <span>Yanıt yazılıyor...</span>
  </div>
);

// Main component
const GenerativeAIComponent = () => {
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
  }, [darkMode]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (error) setError(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError(null);

    setChatHistory((prevHistory) => [
      ...prevHistory,
      { role: "user", text: inputText },
    ]);
    
    const messageText = inputText;
    setInputText("");

    try {
      const response = await axios.post(
        "https://gem2-node.vercel.app/api/generateContent",
        {
          prompt: messageText,
        },
        {
          timeout: 30000,
        }
      );

      const text = response.data.text || "Yanıt alınamadı.";
      
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "assistant", text },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error.response?.data?.error || 
        "Sunucuyla bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin."
      );
      
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { 
          role: "assistant", 
          text: "Üzgünüm, bir hata oluştu: " + 
                (error.response?.data?.error || "Sunucuyla bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.")
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleEnterPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // const toggleDarkMode = () => {
  //   setDarkMode(prev => !prev);
  // };

  return (
    <div
      className="container"
      style={{ 
        maxWidth: "800px", 
        margin: "50px auto", 
        borderRadius: "10px", 
        backgroundColor: darkMode ? "#1e1e1e" : "#ffffff", 
        boxShadow: darkMode ? "0 4px 8px rgba(255, 255, 255, 0.1)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        padding: "20px",
      }}
    >
      <div className="header" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px",
      }}>
      </div>

      <div className="row" style={{ margin: "10px 0" }}>
        <ChatHistory 
          messages={chatHistory} 
          chatHistoryRef={chatHistoryRef} 
          darkMode={darkMode} 
        />
        
        {loading && <TypingAnimation darkMode={darkMode} />}
        
        {error && !loading && (
          <div style={{ 
            color: "#ff6b6b", 
            padding: "10px", 
            marginTop: "10px", 
            backgroundColor: darkMode ? "#2c2c2c" : "#fff0f0",
            borderRadius: "5px",
            border: "1px solid #ff6b6b"
          }}>
            {error}
          </div>
        )}
      </div>

      <div
        className="footer"
        style={{
          padding: "10px 0",
          borderRadius: "10px",
          boxShadow: darkMode ? "0 -4px 8px rgba(255, 255, 255, 0.05)" : "0 -4px 8px rgba(0, 0, 0, 0.05)",
          backgroundColor: darkMode ? "#2c2c2c" : "#f9f9f9",
          position: "relative",
          marginTop: "20px",
        }}
      >
        <textarea
          id="prompt-textarea"
          placeholder="Mesajınızı buraya yazın"
          onKeyDown={handleEnterPress}
          onChange={handleInputChange}
          style={{
            resize: "none",
            width: "calc(100% - 50px)",
            fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
            height: "100px",
            marginBottom: "10px",
            borderRadius: "10px",
            border: darkMode ? "1px solid #444" : "1px solid #ccc",
            boxSizing: "border-box",
            padding: "10px",
            backgroundColor: darkMode ? "#333" : "#ffffff",
            color: darkMode ? "#e0e0e0" : "#333",
          }}
          value={inputText}
          disabled={loading}
        />
        <FontAwesomeIcon
          icon={loading ? faSpinner : faArrowUp}
          spin={loading}
          onClick={!loading ? handleSendMessage : undefined}
          style={{
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "24px",
            color: loading ? (darkMode ? "#555" : "#ccc") : (darkMode ? "#87CEEB" : "#87CEEB"),
            pointerEvents: loading ? "none" : "auto",
            position: "absolute",
            bottom: "15px",
            right: "15px",
            transition: "color 0.3s ease",
          }}
        />    
      </div>
    </div>
  );
};
export default GenerativeAIComponent;
