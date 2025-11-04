import requests
import sys
import time

def test_backend_connection():
    """Test if the backend server is running and accessible"""
    try:
        # Test the main endpoint
        response = requests.get('http://localhost:5000/', timeout=5)
        if response.status_code == 200:
            print("✓ Backend server is running and accessible!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"- Backend server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("- Could not connect to backend server. Is it running on http://localhost:5000?")
        return False
    except requests.exceptions.Timeout:
        print("- Connection to backend server timed out.")
        return False
    except Exception as e:
        print(f"- Error connecting to backend: {e}")
        return False

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("✓ Health check endpoint is accessible!")
            print(f"Health response: {response.json()}")
            return True
        else:
            print(f"- Health endpoint returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"- Error accessing health endpoint: {e}")
        return False

if __name__ == "__main__":
    print("Testing backend connectivity...")
    backend_ok = test_backend_connection()
    health_ok = test_health_endpoint() if backend_ok else False
    
    if backend_ok and health_ok:
        print("\n✓ All tests passed! Backend is ready.")
        sys.exit(0)
    else:
        print("\n- Backend is not accessible. Please start the backend server first.")
        sys.exit(1)