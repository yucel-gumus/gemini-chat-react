import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

// API Anahtarı
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Genai nesnesini oluştur
const genAI = new GoogleGenerativeAI(API_KEY);

// Netlify functions (alternatif olarak kalabilir - gerekirse kullanılır)
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8888/.netlify/functions/api'
  : '/.netlify/functions/api';

const ENDPOINTS = {
  GENERATE_TEXT: `${API_BASE_URL}/generateContent`,
  GENERATE_IMAGE: `${API_BASE_URL}/generateImage`
};

// Request timeouts in milliseconds
const TIMEOUTS = {
  TEXT: 60000, // 60 saniye
  IMAGE: 90000  // 90 saniye
};

// API durumunu kontrol et
export const checkApiStatus = async () => {
  try {
    if (!API_KEY) {
      throw new Error('API anahtarı bulunamadı');
    }
    
    // API anahtarı var, hızlı bir test yap
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    await model.generateContent("Merhaba");
    return { status: 'API hazır' };
  } catch (error) {
    console.error('API durum kontrolü başarısız:', error);
    throw new Error('API sunucusuna bağlanılamadı');
  }
};

/**
 * Send a text prompt to Gemini AI and get a response
 * @param {string} prompt - User's text input
 * @param {Array} history - Chat history for context
 * @returns {Promise} - Response from the API
 */
export const sendTextMessage = async (prompt, history = []) => {
  try {
    if (!API_KEY) {
      throw new Error('API anahtarı bulunamadı');
    }
    
    // Gemini API'yi doğrudan çağır
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Chat geçmişi yapılandırması - boş veya eski geçmiş olabilir
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: h.parts || [{ text: h.text || h.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    // Mesajı gönder
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Yeni sohbet geçmişini oluştur
    const updatedHistory = [
      ...history,
      { role: 'user', parts: [{ text: prompt }] },
      { role: 'model', parts: [{ text }] }
    ];
    
    return {
      text,
      history: updatedHistory
    };
  } catch (error) {
    console.error('Metin gönderme hatası:', error);
    
    if (error.message.includes('timeout')) {
      throw new Error('İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.');
    }
    
    throw new Error(`Gemini API hatası: ${error.message}`);
  }
};

/**
 * Send an image with optional prompt to Gemini AI for analysis
 * @param {string} imageData - Base64 encoded image data
 * @param {string} prompt - Optional text prompt describing what to analyze in the image
 * @param {Array} history - Chat history for context
 * @returns {Promise} - Response from the API
 */
export const sendImageForAnalysis = async (imageData, prompt, history = []) => {
  try {
    if (!API_KEY) {
      throw new Error('API anahtarı bulunamadı');
    }
    
    // Görüntü formatı doğru mu kontrol et
    const base64Image = imageData.startsWith('data:') 
      ? imageData.split(',')[1] 
      : imageData;
      
    if (!base64Image) {
      throw new Error('Geçersiz görüntü formatı');
    }
    
    // Gemini Pro Vision modelini kullan
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Görüntü ve metin içeriği oluştur
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageData.includes('data:image/png') ? 'image/png' : 'image/jpeg',
      },
    };
    
    const promptText = prompt || "Bu görselde ne var?";
    
    // Görüntü ve metin ile analiz et
    const result = await model.generateContent([imagePart, promptText]);
    const response = await result.response;
    const text = response.text();
    
    // Yeni sohbet geçmişini oluştur - görüntüyü geçmişte saklamıyoruz
    const updatedHistory = [
      ...history,
      { role: 'user', parts: [{ text: promptText }] },
      { role: 'model', parts: [{ text }] }
    ];
    
    return {
      text,
      history: updatedHistory
    };
  } catch (error) {
    console.error('Görüntü analizi hatası:', error);
    
    if (error.message.includes('timeout')) {
      throw new Error('Görüntü analizi zaman aşımına uğradı. Görüntü boyutu büyük olabilir veya sunucu yoğun olabilir.');
    }
    
    throw new Error(`Görüntü analizi hatası: ${error.message}`);
  }
}; 