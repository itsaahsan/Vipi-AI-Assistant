import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { Zap } from 'lucide-react';
import ChatBubble from './components/ChatBubble';
import MicButton from './components/MicButton';
import SettingsPanel from './components/SettingsPanel';
import { chatService } from './services/api';

function App() {
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [textInput, setTextInput] = useState('');
  const [settings, setSettings] = useState({
    theme: 'dark',
    voiceSpeed: 1.0,
    volume: 0.8,
    autoPlay: true
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isMuted, setIsMuted] = useState(false);
  
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);

  // Check backend connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0; // For reverse flex direction
    }
  }, [conversation]);

  const checkConnection = async () => {
    try {
      const response = await chatService.healthCheck();
      setConnectionStatus(response.groq_api === 'connected' ? 'connected' : 'warning');
    } catch (error) {
      setConnectionStatus('error');
      console.error('Connection check failed:', error);
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const playTTS = async (text) => {
    if (isMuted) return;
    
    try {
      const audioUrl = await chatService.getTTSAudio(text);
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = settings.volume;
        audioRef.current.playbackRate = settings.voiceSpeed;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
    }
  };


  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || isLoading) return;

    const userMessage = textInput.trim();
    setTextInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendTextMessage(userMessage, sessionId);
      if (response.success) {
        setConversation(prev => [...prev, response.exchange]);
        
        // Auto-play TTS if enabled
        if (settings.autoPlay && !isMuted) {
          playTTS(response.exchange.ai_response);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to conversation with more specific information
      let errorMessage = "Sorry, I'm having trouble processing your request right now. Please try again.";
      
      // Provide more specific error messages based on the error
      if (error.message && error.message.includes("Network Error")) {
        errorMessage = "Unable to connect to the server. Please make sure the backend is running on http://localhost:5000.";
      } else if (error.message && error.message.includes("400")) {
        errorMessage = "The request could not be processed. Please check your input.";
      } else if (error.message && error.message.includes("500")) {
        errorMessage = "The server encountered an error. Please check the backend logs.";
      } else if (error.message && error.message.includes("502")) {
        errorMessage = "The server is temporarily unavailable. Please check if the Groq API key is valid.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}. Please check that the backend is running and the API keys are configured correctly.`;
      }
      
      // Add error message to conversation
      setConversation(prev => [...prev, {
        id: `error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_message: userMessage,
        ai_response: errorMessage,
        type: "text"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceMessage = async (audioBlob) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await chatService.sendVoiceMessage(audioBlob, sessionId);
      if (response.success) {
        setConversation(prev => [...prev, response.exchange]);
        
        // Auto-play TTS if enabled
        if (settings.autoPlay && !isMuted) {
          playTTS(response.exchange.ai_response);
        }
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      // Add error message to conversation with more specific information
      let errorMessage = "Sorry, I'm having trouble processing your voice message right now. Please try again.";
      
      // Provide more specific error messages based on the error
      if (error.message && error.message.includes("Network Error")) {
        errorMessage = "Unable to connect to the server. Please make sure the backend is running on http://localhost:5000.";
      } else if (error.message && error.message.includes("400")) {
        errorMessage = "The audio could not be processed. Please try recording again.";
      } else if (error.message && error.message.includes("500")) {
        errorMessage = "The server encountered an error during transcription. Please check the backend logs.";
      } else if (error.message && error.message.includes("502")) {
        errorMessage = "The server is temporarily unavailable. Please check if the Groq API key is valid.";
      } else if (error.message) {
        errorMessage = `Error processing voice message: ${error.message}. Please check that the backend is running and the API keys are configured correctly.`;
      }
      
      // Add error message to conversation
      setConversation(prev => [...prev, {
        id: `error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_message: "Voice message (transcription failed)",
        ai_response: errorMessage,
        type: "voice"
      }]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Black Background */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black to-gray-900/80"></div>
      

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Chat Container */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex-1 max-w-4xl mx-auto px-6 pb-6"
        >
          <div className="flex flex-col h-screen">
            {/* Chat Messages Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 chat-container"
              style={{ 
                display: 'flex',
                flexDirection: 'column-reverse'
              }}
            >
              <AnimatePresence mode="wait">
                {conversation.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                      className="relative mb-6"
                    >
                      <div className="w-20 h-20 glass-bg rounded-3xl flex items-center justify-center mx-auto mb-4 neu-shadow">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-10 h-10 text-blue-500" />
                        </motion.div>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-lg"
                      ></motion.div>
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                    >
                      Welcome to Vipi
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto"
                    >
                      Your next-generation AI assistant is ready to help
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex items-center space-x-2 glass-bg px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Click the microphone to speak</span>
                      </div>
                      <div className="flex items-center space-x-2 glass-bg px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>Or type a message below</span>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div layout className="space-y-6 flex flex-col-reverse">
                    {conversation.slice().reverse().map((exchange, index) => (
                      <motion.div
                        key={exchange.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        layout
                      >
                        <ChatBubble 
                          exchange={exchange} 
                          onPlayTTS={playTTS}
                          isMuted={isMuted}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Loading Indicator - positioned at bottom for reverse layout */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex justify-start order-first"
                  >
                    <div className="glass-bg rounded-2xl p-4 neu-shadow">
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                        ></motion.div>
                        <span className="text-gray-600 dark:text-gray-300">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area - Positioned perfectly at bottom */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="glass-bg rounded-2xl p-6 neu-shadow border border-white/20 dark:border-gray-700/20 mt-4"
            >
              <div className="flex items-center space-x-4">
                {/* Voice Input */}
                <MicButton 
                  onVoiceMessage={handleVoiceMessage}
                  disabled={isLoading}
                />
                
                {/* Text Input */}
                <form onSubmit={handleTextSubmit} className="flex-1 flex space-x-3">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 px-6 py-4 glass-bg rounded-xl border border-white/20 dark:border-gray-700/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!textInput.trim() || isLoading}
                    className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Send
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.main>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 320 }}
              exit={{ width: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="overflow-hidden"
            >
              <SettingsPanel 
                settings={settings}
                onSettingsChange={setSettings}
                onClose={() => setShowSettings(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden Audio Element for TTS */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

// Wrap the App with ErrorBoundary
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;