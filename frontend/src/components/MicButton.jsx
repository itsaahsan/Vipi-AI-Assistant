import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';

const MicButton = ({ onVoiceMessage, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const checkBrowserSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      return false;
    }
    return true;
  }, []);

  const startRecording = async () => {
    if (!checkBrowserSupport() || disabled) return;

    try {
      // Simple and direct approach to get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      audioChunksRef.current = [];
      
      // Determine the best MIME type supported by the browser
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mpeg',
        'audio/wav',
        'audio/aac'
      ].find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      // Store the selected mimeType to use in the onstop handler
      const selectedMimeType = mimeType;

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: selectedMimeType 
          });
          
          // Stop all tracks to release microphone properly
          stream.getTracks().forEach(track => {
            track.stop();
          });
          
          if (onVoiceMessage) {
            onVoiceMessage(audioBlob);
          }
        } catch (error) {
          console.error('Error creating audio blob:', error);
          alert('Error processing the recorded audio.');
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        // Ensure tracks are stopped even if there's an error
        try {
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.error('Error stopping tracks:', e);
        }
        setIsRecording(false);
      };

      mediaRecorderRef.current.onstart = () => {
        // Reset audio chunks at start
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start(1000); // Collect data every 1000ms (1 second) for more reliable chunks
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      
      // Check for specific error types to provide better user feedback
      if (error.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
        alert('No microphone found on this device. Please connect a microphone and try again.');
      } else if (error.name === 'SecurityError' || error.name === 'PermissionDismissedError') {
        alert('Microphone access requires a secure context (HTTPS or localhost).');
      } else {
        alert(`Could not access microphone: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Check if mediaRecorder is in the right state to stop
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
      }
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <motion.button
        disabled
        className="relative w-16 h-16 rounded-2xl glass-bg opacity-50 cursor-not-allowed flex items-center justify-center"
        title="Microphone not supported in this browser"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MicOff className="w-7 h-7 text-gray-400" />
      </motion.button>
    );
  }

  return (
    <div className="relative">
      {/* Pulsing background rings when recording */}
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ 
                scale: [1, 1.4, 1.8],
                opacity: [0.6, 0.3, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ 
                scale: [1, 1.6, 2.2],
                opacity: [0.4, 0.2, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.2
              }}
              className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r from-red-400 to-pink-400"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          background: isRecording 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
          boxShadow: isRecording
            ? '0 10px 30px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(239, 68, 68, 0.2)'
            : '0 10px 30px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.2)'
        }}
        whileHover={{ 
          scale: disabled ? 1 : 1.05,
          boxShadow: isRecording
            ? '0 15px 40px rgba(239, 68, 68, 0.5), 0 0 0 3px rgba(239, 68, 68, 0.3)'
            : '0 15px 40px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.3)'
        }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        animate={isRecording ? { 
          boxShadow: [
            '0 10px 30px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(239, 68, 68, 0.2)',
            '0 15px 40px rgba(239, 68, 68, 0.6), 0 0 0 4px rgba(239, 68, 68, 0.4)',
            '0 10px 30px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(239, 68, 68, 0.2)'
          ]
        } : {}}
        transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <motion.div
          animate={isRecording ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 2, repeat: isRecording ? Infinity : 0, ease: "linear" }}
        >
          {isRecording ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Square className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </motion.div>

        {/* Recording indicator dot */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default MicButton;