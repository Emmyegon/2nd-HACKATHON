#!/usr/bin/env python3
"""
Test OpenAI API Connection
This script tests if the OpenAI API is working correctly
"""

import os
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

def test_openai_connection():
    """Test OpenAI API connection"""
    print("🧪 Testing OpenAI API Connection")
    print("=" * 40)
    
    # Get API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ No OpenAI API key found in .env file")
        return False
    
    print(f"✅ API Key found: {api_key[:20]}...")
    
    try:
        # Test with new client format
        print("🔌 Testing OpenAI client...")
        client = openai.OpenAI(api_key=api_key)
        
        print("📝 Testing chat completion...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Say 'Hello, this is a test!'"}
            ],
            max_tokens=50
        )
        
        content = response.choices[0].message.content
        print(f"✅ OpenAI API working! Response: {content}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI API error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    test_openai_connection()
