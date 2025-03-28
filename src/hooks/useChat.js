import { useState, useCallback, useEffect } from 'react';
import { sendTextMessage, checkApiStatus } from '../services/geminiService';

/**
 * Custom hook for chat functionality
 * @returns {Object} Chat state and methods
 */
export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
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

  // Load chat history from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat_messages');
    const savedHistory = localStorage.getItem('chat_history');
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Kaydedilmiş mesajlar çözümlenemedi:', e);
        localStorage.removeItem('chat_messages');
      }
    }
    
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Kaydedilmiş sohbet geçmişi çözümlenemedi:', e);
        localStorage.removeItem('chat_history');
      }
    }
  }, []);

  // Save messages and history to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('chat_messages', JSON.stringify(messages));
      } catch (e) {
        console.error('Mesajlar kaydedilemedi:', e);
      }
    }
    
    if (chatHistory.length > 0) {
      try {
        localStorage.setItem('chat_history', JSON.stringify(chatHistory));
      } catch (e) {
        console.error('Sohbet geçmişi kaydedilemedi:', e);
      }
    }
  }, [messages, chatHistory]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    if (error) setError(null);
  }, [error]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setChatHistory([]);
    localStorage.removeItem('chat_messages');
    localStorage.removeItem('chat_history');
  }, []);

  // Send message to Gemini AI
  const sendMessage = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    if (!apiReady) {
      setError("API ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.");
      return;
    }
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Add user message to UI
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    
    try {
      // Send message to API
      const response = await sendTextMessage(userMessage, chatHistory);
      
      // Add AI response to UI
      const aiMessage = { role: 'assistant', content: response.text };
      setMessages(prev => [...prev, aiMessage]);
      
      // Update chat history for context
      setChatHistory(response.history || []);
    } catch (err) {
      const errorMessage = err.message || 
                          'Sunucuyla bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.';
      
      setError(errorMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Üzgünüm, bir hata oluştu: ${errorMessage}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, chatHistory, apiReady]);

  return {
    messages,
    inputValue,
    isLoading,
    error,
    apiReady,
    handleInputChange,
    sendMessage,
    clearChat
  };
}; 