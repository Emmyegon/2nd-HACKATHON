#!/usr/bin/env python3
"""
Recipe Recommender Startup Script
Run this file to start the application
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_requirements():
    """Check if all required environment variables are set"""
    required_vars = ['OPENAI_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease create a .env file with the required variables.")
        print("See README.md for setup instructions.")
        return False
    
    return True

def main():
    """Main startup function"""
    print("🍳 AI Recipe Recommender")
    print("=" * 40)
    
    # Check environment variables
    if not check_requirements():
        sys.exit(1)
    
    print("✅ Environment variables loaded successfully")
    print("🚀 Starting Flask application...")
    print("📱 Application will be available at: http://localhost:5000")
    print("=" * 40)
    
    # Import and run the Flask app
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ImportError as e:
        print(f"❌ Error importing Flask app: {e}")
        print("Make sure all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

