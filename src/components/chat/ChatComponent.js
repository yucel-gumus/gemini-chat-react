import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';

const ChatComponent = () => {
  const { 
    messages, 
    inputValue, 
    isLoading, 
    error,
    apiReady,
    handleInputChange, 
    sendMessage,
    clearChat 
  } = useChat();
  
  const chatHistoryRef = useRef(null);
  const textareaRef = useRef(null);

  // Autoscroll to the bottom when new messages appear
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  // Handle Enter key to send message (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="chat-container">
      {/* Clear chat button */}
      {messages.length > 0 && (
        <div className="controls">
          <button 
            className="clear-button" 
            onClick={clearChat}
            title="Sohbeti Temizle"
          >
            <FontAwesomeIcon icon={faTrash} className="clear-icon" />
            Sohbeti Temizle
          </button>
        </div>
      )}
      
      {/* API Status warning */}
      {!apiReady && (
        <div className="api-warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>API bağlantısı kurulamadı. Mesajlarınız gönderilemeyebilir.</span>
        </div>
      )}
      
      {/* Chat history */}
      <div className="chat-history" ref={chatHistoryRef}>
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <h3>Metin Sohbeti</h3>
            <p>Sohbete başlamak için bir mesaj gönderin</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role} ${message.isError ? 'isError' : ''}`}
            >
              <div className="message-header">
                {message.role === 'user' ? 'Siz' : 'Gemini AI'}
              </div>
              <div className="message-body">
                {message.role === 'assistant' ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>Yanıt yazılıyor...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && !isLoading && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {/* Message input form */}
      <form className="input-container" onSubmit={sendMessage}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          disabled={isLoading || !apiReady}
          rows={1}
        />
        <button 
          type="submit" 
          className="send" 
          disabled={isLoading || !inputValue.trim() || !apiReady}
        >
          Gönder
        </button>
      </form>
    </div>
  );
};

export default ChatComponent; 