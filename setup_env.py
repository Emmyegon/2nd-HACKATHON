#!/usr/bin/env python3
"""
Environment Setup Script for Recipe Recommender
This script helps you configure the necessary environment variables
"""

import os
import sys

def setup_environment():
    """Interactive setup for environment variables"""
    print("🍳 Recipe Recommender Environment Setup")
    print("=" * 50)
    
    # Get OpenAI API key
    print("\n1. OpenAI API Configuration")
    print("   Visit: https://platform.openai.com/api-keys")
    print("   Create a new API key and paste it below:")
    openai_key = input("   OpenAI API Key: ").strip()
    
    if not openai_key:
        print("   ❌ OpenAI API key is required!")
        return False
    
    # Get MySQL credentials
    print("\n2. MySQL Database Configuration")
    print("   Enter your MySQL credentials:")
    mysql_user = input("   MySQL Username (default: root): ").strip() or "root"
    mysql_password = input("   MySQL Password: ").strip()
    mysql_host = input("   MySQL Host (default: localhost): ").strip() or "localhost"
    mysql_database = input("   Database Name (default: recipe_db): ").strip() or "recipe_db"
    
    # Create .env file content
    env_content = f"""# Flask Configuration
SECRET_KEY=your-secret-key-here-change-this-in-production
FLASK_ENV=development

# Database Configuration
DATABASE_URL=mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_database}

# OpenAI API Configuration
OPENAI_API_KEY={openai_key}

# MySQL Credentials (for setup script)
MYSQL_USER={mysql_user}
MYSQL_PASSWORD={mysql_password}
"""
    
    # Write to .env file
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print(f"\n✅ Environment file created successfully!")
        print(f"   File: .env")
        
        # Also set environment variables for current session
        os.environ['OPENAI_API_KEY'] = openai_key
        os.environ['DATABASE_URL'] = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_database}"
        os.environ['MYSQL_USER'] = mysql_user
        os.environ['MYSQL_PASSWORD'] = mysql_password
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error creating .env file: {e}")
        return False

def main():
    """Main setup function"""
    if setup_environment():
        print("\n🚀 Environment setup complete!")
        print("\nNext steps:")
        print("1. Make sure MySQL server is running")
        print("2. Run: python setup_database.py")
        print("3. Run: python app.py")
        print("\nYour application will be available at: http://localhost:5000")
    else:
        print("\n❌ Setup failed. Please try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()

