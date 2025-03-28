import { useState, useCallback, useEffect } from 'react';
import { sendImageForAnalysis, checkApiStatus } from '../services/geminiService';

/**
 * Custom hook for image analysis functionality
 * @returns {Object} Vision state and methods
 */
export const useVision = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visionHistory, setVisionHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [apiReady, setApiReady] = useState(true);

  // Check API status on initial load
  useEffect(() => {
    const verifyApiStatus = async () => {
      try {
        await checkApiStatus();
        setApiReady(true);
      } catch (err) {
        console.error("API status check failed:", err);
        setApiReady(false);
        setError("API ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.");
      }
    };
    
    verifyApiStatus();
  }, []);

  // Load vision history from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem('vision_messages');
    const savedHistory = localStorage.getItem('vision_history');
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Kaydedilmiş görüntü mesajları çözümlenemedi:', e);
        localStorage.removeItem('vision_messages');
      }
    }
    
    if (savedHistory) {
      try {
        setVisionHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Kaydedilmiş görüntü geçmişi çözümlenemedi:', e);
        localStorage.removeItem('vision_history');
      }
    }
  }, []);

  // Save messages and history to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('vision_messages', JSON.stringify(messages));
      } catch (e) {
        console.error('Görüntü mesajları kaydedilemedi:', e);
      }
    }
    
    if (visionHistory.length > 0) {
      try {
        localStorage.setItem('vision_history', JSON.stringify(visionHistory));
      } catch (e) {
        console.error('Görüntü geçmişi kaydedilemedi:', e);
      }
    }
  }, [messages, visionHistory]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    if (error) setError(null);
  }, [error]);

  // Handle image selection
  const handleImageSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  }, [handleImageFile]);

  // Handle image file processing
  const handleImageFile = useCallback((file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Lütfen geçerli bir görüntü dosyası seçin (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Görüntü dosyası 5MB\'dan küçük olmalıdır');
      return;
    }
    
    setSelectedImage(file);
    
    // Create preview for the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setError(null);
    };
    reader.onerror = () => {
      setError('Görüntü dosyası okunamadı. Lütfen tekrar deneyin.');
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  }, [handleImageFile]);

  // Clear image and chat
  const clearVision = useCallback(() => {
    setMessages([]);
    setSelectedImage(null);
    setImagePreview(null);
    setVisionHistory([]);
    setError(null);
    localStorage.removeItem('vision_messages');
    localStorage.removeItem('vision_history');
  }, []);

  // Remove selected image
  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
  }, []);

  // Send image with prompt to Gemini AI
  const analyzeImage = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!imagePreview) {
      setError('Lütfen bir görüntü seçin');
      return;
    }
    
    if (!apiReady) {
      setError("API ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const prompt = inputValue.trim() || "Bu görselde ne var?";
    setInputValue('');

    // Add user message to UI
    const newUserMessage = { 
      role: 'user', 
      content: prompt,
      image: imagePreview 
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    try {
      // Send image and prompt to API
      const response = await sendImageForAnalysis(imagePreview, prompt, visionHistory);
      
      // Add AI response to UI
      const aiMessage = { role: 'assistant', content: response.text };
      setMessages(prev => [...prev, aiMessage]);
      
      // Update vision history for context
      setVisionHistory(response.history || []);
    } catch (err) {
      const errorMessage = err.message || 
                          'Görüntü analiz edilirken bir hata oluştu.';
      
      setError(errorMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Üzgünüm, bir hata oluştu: ${errorMessage}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [imagePreview, inputValue, visionHistory, apiReady]);

  return {
    messages,
    inputValue,
    selectedImage,
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
  };
}; 