import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      // More specific error message for connection issues
      if (error.message && error.message.includes('Network Error')) {
        throw new Error('Cannot connect to the server. Please ensure the backend is running at http://localhost:5000');
      } else {
        throw new Error('No response from the server. Please check that the backend is running.');
      }
    } else {
      // Something else happened
      throw new Error('Request failed. Please try again.');
    }
  }
);

export const chatService = {
  // Health check
  healthCheck: () => apiClient.get('/health'),

  // Send text message
  sendTextMessage: (message, sessionId = 'default') => 
    apiClient.post('/chat', { message, session_id: sessionId }),

  // Send voice message
  sendVoiceMessage: async (audioBlob, sessionId = 'default') => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('session_id', sessionId);

    return axios.post(`${API_BASE_URL}/voice`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Longer timeout for voice processing
    }).then(response => response.data);
  },

  // Get TTS audio
  getTTSAudio: async (text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tts`, { text }, {
        responseType: 'blob',
        timeout: 30000,
      });

      // Create blob URL for audio playback
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error getting TTS audio:', error);
      return null;
    }
  },

  // Get conversation history
  getConversation: (sessionId) => apiClient.get(`/conversation/${sessionId}`),

  // Clear conversation
  clearConversation: (sessionId) => apiClient.delete(`/conversation/${sessionId}`),

  // Update settings
  updateSettings: (settings) => apiClient.post('/settings', settings),
};

export default apiClient;