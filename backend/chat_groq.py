from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_groq(prompt, conversation_history=None):
    """
    Send a prompt to Groq's Llama-3 model and get a response
    """
    try:
        messages = []
        
        # Add conversation history if provided
        if conversation_history:
            for exchange in conversation_history[-10:]:  # Keep last 10 exchanges
                messages.append({"role": "user", "content": exchange.get("user_message", "")})
                messages.append({"role": "assistant", "content": exchange.get("ai_response", "")})
        
        # Add current prompt
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"Error with Groq API: {e}")
        error_str = str(e)
        print(f"Full error details: {error_str}")
        # Provide more specific error message based on the type of error
        error_msg = error_str.lower()
        if "api key" in error_msg or "authentication" in error_msg or "unauthorized" in error_msg:
            return "Error: Invalid or missing Groq API key. Please check your GROQ_API_KEY in the .env file."
        elif "rate limit" in error_msg or "quota" in error_msg or "exceeded" in error_msg:
            return "Error: Rate limit exceeded. Please try again later or check your Groq API usage limits."
        elif "model" in error_msg or "not found" in error_msg or "does not exist" in error_msg:
            return "Error: AI model not available. Please check if 'llama-3.1-8b-instant' model is available in your account."
        elif "connection" in error_msg or "timeout" in error_msg or "connect" in error_msg:
            return "Error: Cannot connect to Groq API. Please check your internet connection."
        else:
            return f"Error: {str(e)}. Please verify your API key and connection."

def test_groq_connection():
    """Test if Groq API is working"""
    try:
        # Use a simple test that won't consume many tokens
        response = ask_groq("Hello")
        return True, response if response else "Connection OK"
    except Exception as e:
        print(f"Groq connection test failed: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False, str(e)