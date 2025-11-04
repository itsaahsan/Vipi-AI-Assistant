from gtts import gTTS
import os
import tempfile
import uuid
from io import BytesIO

def text_to_speech(text, lang='en', slow=False):
    """
    Convert text to speech using Google Text-to-Speech
    Returns the audio file path
    """
    try:
        if not text or text.strip() == "":
            return None
        
        # Create TTS object
        tts = gTTS(text=text, lang=lang, slow=slow)
        
        # Generate unique filename
        filename = f"tts_{uuid.uuid4().hex}.mp3"
        filepath = os.path.join(tempfile.gettempdir(), filename)
        
        # Save to file
        tts.save(filepath)
        
        return filepath
    
    except Exception as e:
        print(f"Error in text-to-speech: {e}")
        return None

def text_to_speech_bytes(text, lang='en', slow=False):
    """
    Convert text to speech and return as bytes
    """
    try:
        if not text or text.strip() == "":
            print("Warning: Empty text provided to TTS")
            return None
        
        # Create TTS object
        tts = gTTS(text=text, lang=lang, slow=slow)
        
        # Save to BytesIO object
        fp = BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        
        result = fp.read()
        if not result:
            print("Warning: TTS returned empty audio data")
            return None
        
        return result
    
    except Exception as e:
        print(f"Error in text-to-speech: {e}")
        # Return None but log the issue
        import traceback
        print(f"TTS traceback: {traceback.format_exc()}")
        return None

def cleanup_temp_files():
    """
    Clean up temporary TTS files
    """
    try:
        temp_dir = tempfile.gettempdir()
        for filename in os.listdir(temp_dir):
            if filename.startswith("tts_") and filename.endswith(".mp3"):
                file_path = os.path.join(temp_dir, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
    except Exception as e:
        print(f"Error cleaning up temp files: {e}")

def test_tts():
    """Test TTS functionality"""
    try:
        test_text = "Hello! This is a test of the text to speech system."
        audio_file = text_to_speech(test_text)
        if audio_file and os.path.exists(audio_file):
            print(f"TTS test successful. Audio saved to: {audio_file}")
            return True
        return False
    except Exception as e:
        print(f"TTS test failed: {e}")
        return False