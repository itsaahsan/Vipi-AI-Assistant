import json
import wave
import vosk
import os
import sys
import subprocess
import tempfile

# Global variable to store the model to avoid repeated downloads
_model_instance = None

# Download Vosk model if not exists
def download_vosk_model():
    model_path = "vosk-model-en-us-0.22"
    if not os.path.exists(model_path):
        print("Downloading Vosk model...")
        # For Windows, use PowerShell commands with error handling
        import platform
        if platform.system() == "Windows":
            try:
                # Ensure we're using Windows PowerShell for compatibility
                subprocess.run([
                    "powershell", "-Command", 
                    "if (Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue) { Invoke-WebRequest -Uri 'https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip' -OutFile 'vosk-model.zip' } else { (New-Object System.Net.WebClient).DownloadFile('https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip', 'vosk-model.zip') }"
                ], check=True)
                subprocess.run(["powershell", "-Command", "Expand-Archive -Path 'vosk-model.zip' -DestinationPath '.'"], check=True)
                subprocess.run(["powershell", "-Command", "Remove-Item 'vosk-model.zip'"], check=True)
            except subprocess.CalledProcessError:
                print("PowerShell download failed, trying with urllib...")
                # Fallback to Python download
                import urllib.request
                urllib.request.urlretrieve("https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip", "vosk-model.zip")
                
                # Extract using Python
                import zipfile
                with zipfile.ZipFile("vosk-model.zip", 'r') as zip_ref:
                    zip_ref.extractall(".")
                
                # Clean up
                import os
                os.remove("vosk-model.zip")
        else:
            try:
                subprocess.run([
                    "curl", "-L", 
                    "https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip",
                    "-o", "vosk-model.zip"
                ], check=True)
                subprocess.run(["unzip", "vosk-model.zip"], check=True)
                subprocess.run(["rm", "vosk-model.zip"], check=True)
            except subprocess.CalledProcessError:
                print("curl download failed, trying with urllib...")
                import urllib.request
                urllib.request.urlretrieve("https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip", "vosk-model.zip")
                
                import zipfile
                with zipfile.ZipFile("vosk-model.zip", 'r') as zip_ref:
                    zip_ref.extractall(".")
                
                import os
                os.remove("vosk-model.zip")
    return model_path

def get_model_instance():
    """Get or create a singleton model instance to avoid repeated downloads"""
    global _model_instance
    if _model_instance is None:
        model_path = download_vosk_model()
        if not os.path.exists(model_path):
            raise Exception("Vosk model not found")
        _model_instance = vosk.Model(model_path)
    return _model_instance

def transcribe_audio(audio_data, sample_rate=16000):
    """
    Transcribe audio data using Vosk
    """
    try:
        # Initialize Vosk model
        model = get_model_instance()
        rec = vosk.KaldiRecognizer(model, sample_rate)
        rec.SetWords(True)
        rec.SetPartialWords(True)
        
        # Process audio data
        if rec.AcceptWaveform(audio_data):
            result = json.loads(rec.Result())
            return result.get('text', '')
        else:
            partial_result = json.loads(rec.PartialResult())
            return partial_result.get('partial', '')
            
    except Exception as e:
        print(f"Error in speech-to-text: {e}")
        return f"Error: Could not transcribe audio - {str(e)}"

def transcribe_audio_file(file_path):
    """
    Transcribe audio from a file
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            return "Error: Audio file does not exist."
        
        # Only accept WAV files directly to avoid pydub dependency issues
        file_ext = os.path.splitext(file_path)[1].lower()
        
        # If it's not a WAV file, we'll attempt to process it but with a warning
        # For now, let's focus on ensuring WAV files work
        if file_ext != '.wav':
            print(f"Warning: Non-WAV file {file_ext} detected. This may not work without proper audio processing libraries.")
            # Since pydub might cause issues on Windows, we'll provide an alternative
            # that only works with WAV files for now
            return f"Error: Unsupported file format {file_ext}. Only WAV files are supported in this environment. For other formats, please install ffmpeg."
        
        # Read wave file directly
        wf = wave.open(file_path, 'rb')
        
        # Check audio format
        if wf.getnchannels() != 1:
            wf.close()
            return "Error: Audio must be in mono format. Please use a mono WAV file."
        
        if wf.getsampwidth() != 2:  # 16-bit
            wf.close()
            return "Error: Audio must be 16-bit. Please use a 16-bit WAV file."
        
        if wf.getcomptype() != "NONE":  # Check if compressed
            wf.close()
            return "Error: Audio must be uncompressed. Please use an uncompressed WAV file."
        
        # Use the singleton model instance with error handling
        try:
            model = get_model_instance()
        except Exception as model_error:
            print(f"Error loading Vosk model: {model_error}")
            return f"Error: Failed to load speech recognition model - {str(model_error)}"
        
        rec = vosk.KaldiRecognizer(model, wf.getframerate())
        rec.SetWords(True)
        
        transcription = ""
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                if result.get('text'):
                    transcription += result.get('text') + " "
        
        # Get final result
        final_result = json.loads(rec.FinalResult())
        if final_result.get('text'):
            transcription += final_result.get('text')
        
        wf.close()
        
        # Return the transcription or a default message if empty
        transcription = transcription.strip()
        return transcription if transcription else "I couldn't understand the audio clearly. Could you please repeat that?"
        
    except wave.Error as e:
        print(f"Wave file error: {e}")
        return f"Error: Invalid WAV file format - {str(e)}"
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return f"Error: Failed to process transcription result - {str(e)}"
    except Exception as e:
        print(f"Error transcribing file: {e}")
        return f"Error: Could not transcribe file - {str(e)}"

# Fallback for web environments where Vosk might not work
def simple_transcribe(audio_file):
    """
    Simple fallback transcription for development
    """
    return "Hello, this is a test transcription since Vosk model is being set up."