import React, { useRef, useEffect } from 'react';
import { useVision } from '../../hooks/useVision';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faImage, 
  faTimes, 
  faUpload,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';

const VisionComponent = () => {
  const { 
    messages,
    inputValue,
    imagePreview,
    isLoading,
    error,
    isDragging,
    apiReady,
    handleInputChange,
    handleImageSelect,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    analyzeImage,
    clearVision,
    removeImage
  } = useVision();
  
  const fileInputRef = useRef(null);
  const visionResultsRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to the bottom of results
  useEffect(() => {
    if (visionResultsRef.current) {
      visionResultsRef.current.scrollTop = visionResultsRef.current.scrollHeight;
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

  // Handle file selection button click
  const handleSelectButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle Enter key to send message (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeImage(e);
    }
  };

  return (
    <div className="vision-container">
      {/* Clear button */}
      {(imagePreview || messages.length > 0) && (
        <div className="controls">
          <button 
            className="clear-button" 
            onClick={clearVision}
            title="Görüntü ve sohbeti temizle"
          >
            <FontAwesomeIcon icon={faTrash} className="clear-icon" />
            Temizle
          </button>
        </div>
      )}
      
      {/* API Status warning */}
      {!apiReady && (
        <div className="api-warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>API bağlantısı kurulamadı. Görüntü analizi yapılamayabilir.</span>
        </div>
      )}
      
      {/* Image upload area */}
      {!imagePreview ? (
        <div 
          className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleSelectButtonClick}
        >
          <FontAwesomeIcon icon={faImage} className="image-upload-icon" />
          <p className="image-upload-text">
            Analiz etmek için bir görüntü sürükleyip bırakın veya seçin
          </p>
          <div className="image-upload-button">
            <FontAwesomeIcon icon={faUpload} />
            <span style={{ marginLeft: '8px' }}>Görüntü Seç</span>
          </div>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/jpeg, image/png, image/gif, image/webp"
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="image-preview-container">
          <img 
            src={imagePreview}
            alt="Seçilen görüntü"
            className="image-preview"
          />
          <button 
            className="remove-image-button"
            onClick={removeImage}
            title="Görüntüyü kaldır"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      
      {/* Vision results */}
      <div className="vision-results" ref={visionResultsRef}>
        {messages.length === 0 ? (
          imagePreview ? (
            <div className="empty-vision">
              <p>Görüntü hakkında bir soru sorun veya analiz edin</p>
            </div>
          ) : (
            <div className="empty-vision">
              <div className="empty-icon">🖼️</div>
              <h3>Görüntü Analizi</h3>
              <p>Gemini AI ile görüntü analizi yapmak için bir görüntü yükleyin</p>
            </div>
          )
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
                {message.image && (
                  <img 
                    src={message.image} 
                    alt="Yüklenen görüntü" 
                    className="message-image"
                  />
                )}
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
          <span>Görüntü analiz ediliyor...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && !isLoading && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {/* Input form */}
      <form className="input-container" onSubmit={analyzeImage}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={imagePreview 
            ? "Görüntü hakkında bir soru sorun..." 
            : "Önce bir görüntü yükleyin..."
          }
          disabled={isLoading || !imagePreview || !apiReady}
          rows={1}
        />
        <button 
          type="submit" 
          className="send" 
          disabled={isLoading || !imagePreview || !apiReady}
        >
          Analiz Et
        </button>
      </form>
    </div>
  );
};

export default VisionComponent; 