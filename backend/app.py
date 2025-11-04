from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import tempfile
import uuid
from datetime import datetime
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import wave
import sys
import traceback

# Import our modules
try:
    from chat_groq import ask_groq, test_groq_connection
    from tts_gtts import text_to_speech, text_to_speech_bytes, cleanup_temp_files
    from stt_vosk import transcribe_audio_file, simple_transcribe
except ImportError as e:
    print(f"Import error: {e}")
    print("Traceback:", traceback.format_exc())
    sys.exit(1)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# In-memory storage for conversation history (replace with MongoDB in production)
conversation_sessions = {}

# Allowed file extensions - now includes all common audio formats
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'webm', 'm4a', 'mp4', 'aac', 'flac', 'opus'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return jsonify({
        "message": "Vipi AI Voice Assistant Backend",
        "status": "running",
        "version": "1.0.0"
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        groq_status, groq_message = test_groq_connection()
        
        return jsonify({
            "status": "healthy",
            "groq_api": "connected" if groq_status else "error",
            "groq_message": groq_message,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in health check: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            "status": "unhealthy",
            "groq_api": "error",
            "groq_message": f"Health check failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Text-based chat endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        # Get conversation history
        history = conversation_sessions.get(session_id, [])
        
        # Get AI response
        ai_response = ask_groq(user_message, history)
        
        # Validate response
        if ai_response is None:
            return jsonify({"error": "Failed to get AI response"}), 500
        
        # Create conversation exchange
        exchange = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "user_message": user_message,
            "ai_response": ai_response,
            "type": "text"
        }
        
        # Update conversation history
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = []
        
        conversation_sessions[session_id].append(exchange)
        
        # Keep only last 10 exchanges
        conversation_sessions[session_id] = conversation_sessions[session_id][-10:]
        
        return jsonify({
            "success": True,
            "exchange": exchange,
            "session_id": session_id
        })
    
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/voice', methods=['POST'])
def voice_chat():
    """Voice-based chat endpoint"""
    temp_audio_path = None  # Initialize to ensure it's available in error handling
    try:
        session_id = request.form.get('session_id', 'default')
        
        # Check if audio file was uploaded
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({"error": "No audio file selected"}), 400
        
        if not allowed_file(audio_file.filename):
            return jsonify({"error": "Invalid file type"}), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(audio_file.filename)
        temp_audio_path = os.path.join(tempfile.gettempdir(), f"upload_{uuid.uuid4().hex}_{filename}")
        audio_file.save(temp_audio_path)
        
        # Transcribe audio to text
        user_message = transcribe_audio_file(temp_audio_path)
        
        # Check for transcription errors
        if not user_message or user_message.startswith("Error"):
            print(f"Transcription error: {user_message}")
            # Fallback for development
            user_message = "I said something but the transcription isn't working yet."
        
        # Get conversation history
        history = conversation_sessions.get(session_id, [])
        
        # Get AI response
        ai_response = ask_groq(user_message, history)
        
        # Validate response
        if ai_response is None:
            return jsonify({"error": "Failed to get AI response"}), 500
        
        # Generate TTS audio for AI response
        tts_audio_bytes = text_to_speech_bytes(ai_response)
        
        # Create conversation exchange
        exchange = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "user_message": user_message,
            "ai_response": ai_response,
            "type": "voice"
        }
        
        # Update conversation history
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = []
        
        conversation_sessions[session_id].append(exchange)
        conversation_sessions[session_id] = conversation_sessions[session_id][-10:]
        
        return jsonify({
            "success": True,
            "exchange": exchange,
            "session_id": session_id,
            "has_audio": tts_audio_bytes is not None
        })
    
    except Exception as e:
        print(f"Error in voice chat endpoint: {e}")
        # Ensure cleanup happens even if there's an error in the main try block
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except:
                pass  # Ignore errors during cleanup
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/tts', methods=['POST'])
def get_tts_audio():
    """Get TTS audio for a given text"""
    temp_file_path = None  # Initialize to ensure it's available in error handling
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({"error": "Text cannot be empty"}), 400
        
        # Generate TTS audio
        audio_bytes = text_to_speech_bytes(text)
        
        if not audio_bytes:
            return jsonify({"error": "Failed to generate audio"}), 500
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        temp_file.write(audio_bytes)
        temp_file.close()
        temp_file_path = temp_file.name
        
        return send_file(
            temp_file_path,
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name='response.mp3'
        )
    
    except Exception as e:
        print(f"Error in TTS endpoint: {e}")
        # Ensure cleanup happens even if there's an error
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass  # Ignore errors during cleanup
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/conversation/<session_id>', methods=['GET'])
def get_conversation(session_id):
    """Get conversation history for a session"""
    try:
        history = conversation_sessions.get(session_id, [])
        return jsonify({
            "success": True,
            "session_id": session_id,
            "conversation": history,
            "count": len(history)
        })
    
    except Exception as e:
        print(f"Error getting conversation: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/conversation/<session_id>', methods=['DELETE'])
def clear_conversation(session_id):
    """Clear conversation history for a session"""
    try:
        if session_id in conversation_sessions:
            del conversation_sessions[session_id]
        
        return jsonify({
            "success": True,
            "message": "Conversation cleared",
            "session_id": session_id
        })
    
    except Exception as e:
        print(f"Error clearing conversation: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/settings', methods=['POST'])
def update_settings():
    """Update user settings (placeholder for future implementation)"""
    try:
        data = request.get_json()
        # For now, just return the settings back
        # In production, save to database
        
        return jsonify({
            "success": True,
            "settings": data,
            "message": "Settings updated successfully"
        })
    
    except Exception as e:
        print(f"Error updating settings: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Cleanup function
@app.teardown_appcontext
def cleanup(error):
    cleanup_temp_files()

if __name__ == '__main__':
    print("Starting Vipi AI Voice Assistant Backend...")
    print("Checking Groq API connection...")
    
    try:
        groq_status, groq_message = test_groq_connection()
        if groq_status:
            print("+ Groq API connected successfully")
        else:
            print(f"- Groq API connection failed: {groq_message}")
    except Exception as e:
        print(f"- Groq API test failed with error: {e}")
        groq_status = False
    
    print("Server starting on http://localhost:5000")
    
    # Check if model is available before starting server
    try:
        from stt_vosk import get_model_instance
        model = get_model_instance()  # This will trigger model download if needed
        print("+ Vosk model loaded successfully")
    except Exception as e:
        print(f"- Error loading Vosk model: {e}")
        print("Model will be downloaded when first needed")
    
    app.run(debug=True, host='0.0.0.0', port=5000)