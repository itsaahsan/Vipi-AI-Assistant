import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test if the API key is loaded
api_key = os.getenv("GROQ_API_KEY")

if api_key:
    print("+ GROQ_API_KEY is loaded successfully")
    print(f"API Key starts with: {api_key[:8]}...")
else:
    print("- GROQ_API_KEY is NOT loaded. Please check your .env file.")

# Test other environment variables
secret_key = os.getenv("SECRET_KEY")
if secret_key:
    print("+ SECRET_KEY is loaded successfully")
else:
    print("? SECRET_KEY is not set (this is optional)")

print("\nEnvironment variables loaded successfully!")