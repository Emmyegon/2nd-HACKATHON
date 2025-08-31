import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here-change-this-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # Database Configuration
    DATABASE_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/recipe_db')
    
    # OpenAI API Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')
    
    # Example MySQL connection string:
    # DATABASE_URL=mysql+pymysql://root:your_password@localhost/recipe_db

