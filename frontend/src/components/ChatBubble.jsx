import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Volume2, Clock, Sparkles } from 'lucide-react';

const ChatBubble = ({ exchange, onPlayTTS, isMuted }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlayTTS = () => {
    if (!isMuted && onPlayTTS) {
      onPlayTTS(exchange.ai_response);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* User Message */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-end"
      >
        <div className="flex items-end space-x-3 max-w-sm lg:max-w-lg">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-bg rounded-2xl rounded-br-md px-4 py-3 neu-shadow border border-white/20 dark:border-gray-700/20"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'
            }}
          >
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{exchange.user_message}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center space-x-1">
                {exchange.type === 'voice' ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center"
                  >
                    <div className="text-xs">🎤</div>
                  </motion.div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <div className="text-xs">💬</div>
                  </div>
                )}
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">You</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(exchange.timestamp)}
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            <User className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* AI Response */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-start"
      >
        <div className="flex items-end space-x-3 max-w-sm lg:max-w-lg">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-purple-500 opacity-30 blur-sm"
            ></motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-bg rounded-2xl rounded-bl-md px-4 py-3 neu-shadow border border-white/20 dark:border-gray-700/20"
          >
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {exchange.ai_response}
            </p>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayTTS}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  isMuted 
                    ? 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-400' 
                    : 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200/50 dark:hover:bg-blue-800/40'
                }`}
                disabled={isMuted}
                title={isMuted ? 'Audio is muted' : 'Play audio'}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  animate={!isMuted ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Volume2 className="w-4 h-4" />
                </motion.div>
                <span className="text-sm font-medium">Play</span>
              </motion.button>
              
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-green-500 rounded-full"
                ></motion.div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(exchange.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatBubble;