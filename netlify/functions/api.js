// Netlify function to interact with Google Gemini API
require('dotenv').config();
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Check for API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(apiKey);

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Generate a text response from Gemini AI
 * @param {string} prompt - User's message
 * @param {Array} history - Previous conversation history
 * @returns {Object} - AI response and updated history
 */
async function generateContent(prompt, history = []) {
  try {
    // Use gemini-2.0-flash model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      safetySettings
    });
    
    // Start a chat session
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Send the message and get response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Add this exchange to history
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
    console.error('Error generating content:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Analyze an image with Gemini Vision
 * @param {string} base64Image - Base64-encoded image data
 * @param {string} prompt - Text prompt about the image
 * @param {Array} history - Previous conversation history
 * @returns {Object} - AI response and updated history
 */
async function generateImageAnalysis(base64Image, prompt, history = []) {
  try {
    // Use vision-capable model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      safetySettings
    });

    // Prepare the image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg', // We'll treat all as JPEG for simplicity
      },
    };

    const textPart = { text: prompt || "Bu görselde ne var?" };

    // Create content parts (image + text)
    const parts = [imagePart, textPart];

    // Generate content with the image and prompt
    const result = await model.generateContent([...parts]);
    const response = await result.response;
    const text = response.text();

    // Add this exchange to history (we don't add image to history to save space)
    const updatedHistory = [
      ...history,
      { role: 'user', parts: [{ text: prompt || "Bu görselde ne var?" }] },
      { role: 'model', parts: [{ text }] }
    ];
    
    return { 
      text,
      history: updatedHistory
    };
  } catch (error) {
    console.error('Error generating image analysis:', error);
    throw new Error(`Görüntü analizi hatası: ${error.message}`);
  }
}

// Netlify function handler
exports.handler = async function(event, context) {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // API status endpoint
  if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/api') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        status: 'API çalışıyor',
        env: process.env.NODE_ENV || 'production'
      })
    };
  }

  try {
    // Check API key
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API anahtarı ayarlanmamış. Lütfen GEMINI_API_KEY ortam değişkenini yapılandırın.' }),
      };
    }

    // Parse request body
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Geçersiz istek gövdesi. JSON formatı bekleniyor.' }),
        };
      }
    }

    // Handle text generation endpoint
    if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/api/generateContent') {
      const { prompt, history } = body;
      
      if (!prompt) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Mesaj metni gereklidir' }),
        };
      }

      const result = await generateContent(prompt, history || []);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    }

    // Handle image analysis endpoint
    if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/api/generateImage') {
      const { image, prompt, history } = body;
      
      if (!image) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Görüntü verisi gereklidir' }),
        };
      }

      // Extract the base64 data from the data URL
      const base64Data = image.split(',')[1];
      if (!base64Data) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Geçersiz görüntü verisi' }),
        };
      }

      const result = await generateImageAnalysis(base64Data, prompt, history || []);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    }

    // If no matching endpoint is found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'İstek yapılan endpoint bulunamadı' }),
    };

  } catch (error) {
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Sunucu hatası',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
}; 