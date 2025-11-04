# Vipi - AI Assistant

A full-stack AI Assistant web application using only free APIs and services.
# Vipi---AI-Assistant

## 🚀 Features

- **Voice Chat**: Click mic → record → AI processes with Groq (Llama-3) → spoken response
- **Text Chat**: Traditional text input with AI responses
- **Memory**: Stores last 10 exchanges per session
- **Voice Settings**: Adjustable speed, volume, and auto-play
- **Modern UI**: Clean, responsive design with dark/light theme support
- **Real-time**: Live conversation with instant feedback
- **Cross-browser compatibility**: Works with all modern browsers
- **Favicon**: Custom app icon for better user experience

## 🛠️ Tech Stack

### Frontend
- **React** - Modern UI library
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **Lucide React** - Beautiful icons

### Backend
- **Python Flask** - Lightweight web framework
- **MongoDB Atlas** - Cloud database (free tier)

### AI & Voice Processing
- **Groq API** - Llama-3.1-70b for chat responses
- **Vosk** - Offline speech-to-text (free)
- **gTTS** - Google Text-to-Speech (free)
- **pydub** - Audio processing and format conversion

## 📁 Project Structure

```
vipi-ai-voice-assistant/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── chat_groq.py        # Groq API integration
│   ├── stt_vosk.py         # Speech-to-text with Vosk
│   ├── tts_gtts.py         # Text-to-speech with gTTS
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBubble.jsx
│   │   │   ├── MicButton.jsx
│   │   │   └── SettingsPanel.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── vite.svg        # Favicon file
│   ├── package.json
│   └── vite.config.js
├── .env
├── setup.ps1 / setup.sh
└── README.md
```

## 🚦 Quick Start

### Prerequisites

- **Node.js** (v16+)
- **Python** (v3.8+)
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd vipi-ai-voice-assistant
```

### 2. Environment Setup

Create `.env` file with your API keys:

```bash
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=your_mongodb_atlas_uri
SECRET_KEY=your_secret_key_here
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### Getting API Keys

#### Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Create account and generate API key
3. Add to `.env` as `GROQ_API_KEY`

#### MongoDB Atlas (Optional - not currently used in main implementation)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster (free tier)
3. Get connection string and add to `.env` as `MONGO_URI`

#### Environment Setup
Create `.env` file in the backend directory with required variables:

```bash
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_secret_key_here  # Optional, for session management
```

### Voice Settings

- **Speech Speed**: 0.5x to 2.0x
- **Volume**: 0% to 100%
- **Auto-play**: Automatic TTS playback
- **Theme**: Light/Dark mode

## 🚀 Quick Setup

**Manual Setup (Recommended):**
1. Backend: `cd backend && pip install -r requirements.txt && python app.py`
2. Frontend: `cd frontend && npm install && npm run dev`

**Auto Setup Scripts:**
- Windows: `.\setup.ps1`
- Linux/Mac: `./setup.sh`

Access the application at `http://localhost:3000`

## 📱 Usage

### Voice Chat
1. Click the microphone button
2. Speak your question (recording now works in all modern browsers)
3. AI processes and responds with voice
4. Conversation is saved automatically

### Text Chat
1. Type message in input field
2. Press Enter or click Send
3. AI responds with text
4. Optionally play TTS audio

### Settings
- Click settings icon in header
- Adjust voice speed and volume
- Toggle auto-play and theme
- Reset to defaults anytime

## 🔍 API Endpoints

### Backend API

- `GET /` - Health check
- `GET /api/health` - Detailed health status
- `POST /api/chat` - Text message
- `POST /api/voice` - Voice message
- `POST /api/tts` - Generate TTS audio
- `GET /api/conversation/<session_id>` - Get chat history
- `DELETE /api/conversation/<session_id>` - Clear chat history

## 🚨 Troubleshooting

### Common Issues

**Microphone not working:**
- Check browser permissions (click the lock icon in the address bar)
- Ensure HTTPS (required for mic access in production) or localhost in development
- Try different browser if still having issues

**Recording not starting:**
- Make sure to click "Allow" when browser asks for microphone permission
- Recording now works with multiple audio formats (webm, mp3, wav, ogg, etc.)

**Groq API errors:**
- Verify API key in `.env`
- Check rate limits
- Ensure internet connection

**Vosk model download:**
- First run downloads ~50MB model
- Requires internet connection
- Check disk space

**TTS not playing:**
- Check volume settings
- Verify audio permissions
- Try unmuting browser tab

### Development Mode

```bash
# Backend with debug mode
python app.py

# Frontend with hot reload
npm run dev

# Check logs
Check browser console and terminal logs
```

## 🌟 Features in Detail

### Speech Recognition
- Uses Vosk for offline processing
- Enhanced with pydub for cross-format compatibility
- Supports multiple audio formats (webm, mp3, wav, ogg, mp4, aac, flac, opus)
- Real-time transcription with format conversion for better accuracy

### AI Processing
- Powered by Llama-3.1-70b via Groq
- Maintains conversation context
- Fast response times
- Natural language understanding

### Text-to-Speech
- Google TTS for natural voices
- Adjustable speed and volume
- Multiple language support
- Cached for performance

### User Interface
- Responsive design for all devices
- Accessibility features
- Real-time chat bubbles
- Visual recording indicators
- Custom favicon for better branding

## 🆕 Recent Improvements

### Fixed Recording Issues
- Improved browser compatibility for audio recording
- Added support for multiple audio formats (webm, mp3, wav, ogg, etc.)
- Enhanced audio format conversion using pydub
- Better error handling and fallback mechanisms
- More robust microphone permission handling

### Added Favicon Support
- Added custom favicon to enhance user experience
- Includes both SVG and ICO formats for cross-browser compatibility
- Apple touch icon support for mobile devices

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 🆘 Support

- Create GitHub issue for bugs
- Check existing issues for solutions
- Review documentation first
- Provide error logs when reporting

---

**Built with ❤️ using 100% free APIs and services**