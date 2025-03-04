import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUpload, 
  faImage, 
  faSpinner, 
  faTimes, 
  faPaperPlane 
} from "@fortawesome/free-solid-svg-icons";

const ChatMessage = React.memo(({ message, darkMode }) => (
  <div
    className={`message ${message.role}`}
    style={{
      padding: "15px",
      marginBottom: "15px",
      borderRadius: "10px",
      backgroundColor: darkMode 
        ? (message.role === "user" ? "#2a4d69" : "#1a1a1a") 
        : (message.role === "user" ? "#f0f8ff" : "#f9f9f9"),
      boxShadow: darkMode ? "0 2px 4px rgba(255, 255, 255, 0.1)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
      maxWidth: "100%",
    }}
  >
    <div style={{
      fontWeight: "bold",
      marginBottom: "5px",
      color: darkMode ? "#e0e0e0" : "#333",
    }}>
      {message.role === "user" ? "Siz" : "Gemini AI"}
    </div>
    {message.hasImage && (
      <div style={{ marginBottom: "10px" }}>
        <FontAwesomeIcon 
          icon={faImage} 
          style={{ marginRight: "5px", color: darkMode ? "#87CEEB" : "#4682b4" }} 
        />
        <span style={{ color: darkMode ? "#aaa" : "#666", fontStyle: "italic" }}>
          Resim yüklendi
        </span>
      </div>
    )}
    <div style={{ 
      whiteSpace: "pre-wrap",
      color: darkMode ? "#e0e0e0" : "#555",
    }}>
      {message.text}
    </div>
  </div>
));

const GeminiVision = () => {
  const [inlineData, setInlineData] = useState();
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
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

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fileToGenerativePart = useCallback((file, mimeType) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(",")[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (files.length === 0) return;
    setError(null);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const firstFile = files[0];
    if (!allowedTypes.includes(firstFile.type)) {
      setError("Lütfen geçerli bir resim dosyası yükleyin (JPEG, PNG, GIF, WEBP)");
      return;
    }
    if (firstFile.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu çok büyük. Lütfen 5MB'dan küçük bir dosya yükleyin.");
      return;
    }
    try {
      const generativeParts = await Promise.all(
        files.map((file) => fileToGenerativePart(file, file.type))
      );
      setInlineData(generativeParts);
      const objectUrl = URL.createObjectURL(firstFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Dosya işleme hatası:", error);
      setError("Dosya işlenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }, [fileToGenerativePart]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e);
  }, [handleFileChange]);

  const handleSendMessage = useCallback(async () => {
    if (!inlineData || !inputText.trim()) {
      setError("Lütfen bir resim yükleyin ve mesaj yazın");
      return;
    }
    setIsSending(true);
    setError(null);
    setChatHistory(prev => [
      ...prev, 
      { role: "user", text: inputText, hasImage: true }
    ]);
    const messageText = inputText;
    setInputText("");
    try {
      const response = await axios.post(
        "https://gem2-node.vercel.app/api/generateImage", 
        {
          prompt: messageText,
          imageParts: inlineData[0],
        },
        {
          timeout: 60000,
        }
      );
      const text = response.data.text;
      setChatHistory(prev => [
        ...prev, 
        { role: "assistant", text: text }
      ]);
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      setError(
        error.response?.data?.error || 
        "Sunucuyla bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin."
      );
      setChatHistory(prev => [
        ...prev, 
        { role: "assistant", text: "Üzgünüm, bir hata oluştu: " + (error.response?.data?.error || "Sunucuyla bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.") }
      ]);
    } finally {
      setIsSending(false);
    }
  }, [inlineData, inputText]);

  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
    if (error) setError(null);
  }, [error]);

  const handleEnterPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const clearImage = useCallback(() => {
    setPreviewUrl(null);
    setInlineData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div style={{
      padding: "20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
      borderRadius: "10px",
      boxShadow: darkMode ? "0 4px 8px rgba(255, 255, 255, 0.1)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
    }}>
      <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px",
      }}>
      </div>
      
      <div 
        style={{ 
          marginBottom: "20px",
          border: `2px dashed ${dragActive ? "#4CAF50" : (darkMode ? "#555" : "#ccc")}`,
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          backgroundColor: darkMode ? "#2c2c2c" : "#f9f9f9",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        {previewUrl ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "10px",
                border: darkMode ? "1px solid #555" : "1px solid #ccc",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                backgroundColor: darkMode ? "#444" : "#fff",
                color: darkMode ? "#e0e0e0" : "#333",
                border: "none",
                borderRadius: "50%",
                width: "25px",
                height: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ) : (
          <div>
            <FontAwesomeIcon 
              icon={faUpload} 
              style={{ fontSize: "32px", color: darkMode ? "#87CEEB" : "#4682b4", marginBottom: "10px" }} 
            />
            <p style={{ margin: "0", color: darkMode ? "#aaa" : "#666" }}>
              Resim yüklemek için tıklayın veya sürükleyip bırakın
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ 
          color: "#ff6b6b", 
          padding: "10px", 
          marginBottom: "20px", 
          backgroundColor: darkMode ? "#2c2c2c" : "#fff0f0",
          borderRadius: "5px",
          border: "1px solid #ff6b6b"
        }}>
          {error}
        </div>
      )}
      
      <div 
        ref={chatHistoryRef}
        style={{ 
          maxHeight: "400px", 
          overflowY: "auto",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: darkMode ? "#1a1a1a" : "#f5f5f5",
          borderRadius: "10px",
          display: chatHistory.length > 0 ? "block" : "none"
        }}
        className="custom-scrollbar"
      >
        {chatHistory.map((message, index) => (
          <ChatMessage key={index} message={message} darkMode={darkMode} />
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <textarea
          id="prompt-textarea"
          placeholder="Resim hakkında sormak istediğiniz soruyu yazın"
          onChange={handleInputChange}
          onKeyDown={handleEnterPress}
          style={{
            resize: "none",
            width: "100%",
            fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
            height: "150px",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
            border: darkMode ? "1px solid #444" : "1px solid #ccc",
            boxSizing: "border-box",
            boxShadow: darkMode ? "0 2px 4px rgba(255, 255, 255, 0.05)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
            backgroundColor: darkMode ? "#333" : "#fff",
            color: darkMode ? "#e0e0e0" : "#333",
          }}
          value={inputText}
          disabled={isSending}
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending || !inlineData}
          style={{
            position: "absolute",
            right: "10px",
            bottom: "20px",
            padding: "10px 20px",
            backgroundColor: isSending || !inlineData 
              ? (darkMode ? "#555" : "#ccc") 
              : (darkMode ? "#2a4d69" : "#4CAF50"),
            color: isSending || !inlineData 
              ? (darkMode ? "#aaa" : "#666") 
              : "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: isSending || !inlineData ? "not-allowed" : "pointer",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            transition: "background-color 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isSending ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} />
          )}
          <span>Gönder</span>
        </button>
      </div>
    </div>
  );
};

export default GeminiVision;
