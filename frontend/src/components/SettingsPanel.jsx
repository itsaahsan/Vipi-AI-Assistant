import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Zap, Palette, Info } from 'lucide-react';

const SettingsPanel = ({ settings, onSettingsChange, onClose }) => {
  const handleSettingChange = (key, value) => {
    onSettingsChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="h-full overflow-y-auto glass-bg backdrop-blur-xl border-l border-white/20 dark:border-gray-700/20"
    >
      <div className="p-6">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl glass-bg hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
        </motion.div>

        {/* Voice Settings */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-bg rounded-2xl p-4 border border-white/20 dark:border-gray-700/20">
            <h3 className="flex items-center text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Volume2 className="w-4 h-4 mr-2 text-blue-500" />
              </motion.div>
              Voice Settings
            </h3>
          
          <div className="space-y-4">
            {/* Voice Speed */}
            <div className="input-group">
              <label htmlFor="voiceSpeed">Speech Speed</label>
              <div className="flex items-center space-x-3">
                <input
                  id="voiceSpeed"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.voiceSpeed}
                  onChange={(e) => handleSettingChange('voiceSpeed', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">{settings.voiceSpeed}x</span>
              </div>
            </div>

            {/* Volume */}
            <div className="input-group">
              <label htmlFor="volume">Volume</label>
              <div className="flex items-center space-x-3">
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">{Math.round(settings.volume * 100)}%</span>
              </div>
            </div>

            {/* Auto-play */}
            <div className="flex items-center justify-between">
              <label htmlFor="autoPlay" className="text-sm font-medium text-gray-700">
                Auto-play responses
              </label>
              <input
                id="autoPlay"
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => handleSettingChange('autoPlay', e.target.checked)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h3 className="flex items-center text-sm font-medium text-gray-900 mb-3">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </h3>
          
          <div className="input-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        {/* Performance */}
        <div>
          <h3 className="flex items-center text-sm font-medium text-gray-900 mb-3">
            <Zap className="w-4 h-4 mr-2" />
            Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="fastMode" className="text-sm font-medium text-gray-700">
                Fast response mode
              </label>
              <input
                id="fastMode"
                type="checkbox"
                checked={settings.fastMode || false}
                onChange={(e) => handleSettingChange('fastMode', e.target.checked)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="lowBandwidth" className="text-sm font-medium text-gray-700">
                Low bandwidth mode
              </label>
              <input
                id="lowBandwidth"
                type="checkbox"
                checked={settings.lowBandwidth || false}
                onChange={(e) => handleSettingChange('lowBandwidth', e.target.checked)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="flex items-center text-sm font-medium text-gray-900 mb-3">
            <Info className="w-4 h-4 mr-2" />
            About
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Vipi AI Assistant</strong></p>
            <p>Version 1.0.0</p>
            <p>Powered by:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Groq (Llama-3)</li>
              <li>Vosk (Speech-to-Text)</li>
              <li>Google TTS</li>
            </ul>
          </div>
        </div>

          {/* Reset Settings */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-6 border-t border-white/10"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSettingsChange({
                theme: 'light',
                voiceSpeed: 1.0,
                volume: 0.8,
                autoPlay: true
              })}
              className="w-full px-4 py-3 glass-bg rounded-xl border border-white/20 dark:border-gray-700/20 text-gray-800 dark:text-gray-200 font-medium hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
            >
              Reset to Defaults
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsPanel;