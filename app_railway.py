from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import openai
import json
import traceback
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Railway-optimized database configuration
def get_database_uri():
    """Get database URI with fallback to SQLite for Railway"""
    if os.getenv('DATABASE_URL'):
        # Railway provides DATABASE_URL
        return os.getenv('DATABASE_URL')
    elif all([os.getenv('MYSQL_HOST'), os.getenv('MYSQL_USER'), os.getenv('MYSQL_PASSWORD')]):
        # Custom MySQL configuration
        host = os.getenv('MYSQL_HOST')
        user = os.getenv('MYSQL_USER')
        password = os.getenv('MYSQL_PASSWORD')
        database = os.getenv('MYSQL_DATABASE', 'railway')
        return f"mysql+pymysql://{user}:{password}@{host}/{database}"
    else:
        # Fallback to SQLite for local development
        logger.info("Using SQLite fallback database")
        return "sqlite:///recipe_db.sqlite"

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    recipes = db.relationship('Recipe', backref='user', lazy=True)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(50), default='Medium')
    cooking_time = db.Column(db.String(50), default='30 minutes')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# OpenAI client setup
def get_openai_client():
    """Get OpenAI client with error handling"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        logger.warning("OpenAI API key not found")
        return None
    
    try:
        return openai.OpenAI(api_key=api_key)
    except Exception as e:
        logger.error(f"Error creating OpenAI client: {e}")
        return None

# Mock recipes for fallback
def generate_mock_recipes(ingredients):
    """Generate mock recipes when OpenAI is unavailable"""
    mock_recipes = [
        {
            "title": f"Simple {ingredients[0]} Stir Fry",
            "ingredients": ingredients + ["soy sauce", "garlic", "oil"],
            "instructions": f"1. Heat oil in a pan\n2. Add {ingredients[0]} and stir fry\n3. Add soy sauce and garlic\n4. Cook until done",
            "difficulty": "Easy",
            "cooking_time": "15 minutes",
            "servings": "4"
        },
        {
            "title": f"{ingredients[0]} and Vegetable Soup",
            "ingredients": ingredients + ["vegetable broth", "onion", "herbs"],
            "instructions": f"1. Boil vegetable broth\n2. Add {ingredients[0]} and vegetables\n3. Simmer for 20 minutes\n4. Season with herbs",
            "difficulty": "Easy",
            "cooking_time": "25 minutes",
            "servings": "6"
        },
        {
            "title": f"Quick {ingredients[0]} Pasta",
            "ingredients": ingredients + ["pasta", "olive oil", "parmesan"],
            "instructions": f"1. Cook pasta according to package\n2. Sauté {ingredients[0]} in olive oil\n3. Combine pasta and ingredients\n4. Top with parmesan",
            "difficulty": "Medium",
            "cooking_time": "20 minutes",
            "servings": "4"
        }
    ]
    return mock_recipes

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test')
def test():
    return render_template('test_api.html')

@app.route('/api/health')
def health_check():
    """Health check endpoint for Railway"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "healthy", "database": "disconnected", "error": str(e)}), 200

@app.route('/api/check-auth')
def check_auth():
    """Check if user is authenticated (placeholder for session-based auth)"""
    # For now, return no user (you can implement session-based auth later)
    return jsonify({'user': None}), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout user (placeholder for session-based auth)"""
    # For now, just return success (you can implement session clearing later)
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({"error": "All fields are required"}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400
        
        # Create new user
        password_hash = generate_password_hash(password)
        new_user = User(username=username, email=email, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "message": "User registered successfully", 
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email
            }
        }), 201
    except Exception as e:
        logger.error(f"Registration error: {e}")
        db.session.rollback()
        return jsonify({"error": "Registration failed"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": "Login failed"}), 500

@app.route('/api/generate-recipes', methods=['POST'])
def generate_recipes():
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', [])
        
        if not ingredients:
            return jsonify({"error": "Ingredients are required"}), 400
        
        # Try OpenAI first
        client = get_openai_client()
        recipes = []
        
        if client:
            try:
                prompt = f"Generate 3 simple recipes using these ingredients: {', '.join(ingredients)}. Format as JSON with title, ingredients (array), instructions (string), difficulty (Easy/Medium/Hard), cooking_time (string), and servings (string)."
                
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000
                )
                
                content = response.choices[0].message.content
                recipes = parse_openai_response(content)
                
            except Exception as e:
                logger.error(f"OpenAI error: {e}")
                recipes = generate_mock_recipes(ingredients)
        else:
            recipes = generate_mock_recipes(ingredients)
        
        # Save recipes to database (with default user_id for now)
        saved_recipes = []
        for recipe_data in recipes:
            recipe = Recipe(
                title=recipe_data['title'],
                ingredients=json.dumps(recipe_data['ingredients']),
                instructions=recipe_data['instructions'],
                difficulty=recipe_data.get('difficulty', 'Medium'),
                cooking_time=recipe_data.get('cooking_time', '30 minutes'),
                user_id=1  # Default user ID for now
            )
            db.session.add(recipe)
            saved_recipes.append(recipe)
        
        db.session.commit()
        
        return jsonify({
            "message": "Recipes generated successfully",
            "recipes": [{
                "id": recipe.id,
                "title": recipe.title,
                "ingredients": json.loads(recipe.ingredients),
                "instructions": recipe.instructions,
                "difficulty": recipe.difficulty,
                "cooking_time": recipe.cooking_time,
                "servings": recipe_data.get('servings', '4')
            } for recipe, recipe_data in zip(saved_recipes, recipes)]
        }), 201
        
    except Exception as e:
        logger.error(f"Recipe generation error: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to generate recipes"}), 500

def parse_openai_response(content):
    """Parse OpenAI response and extract recipes"""
    try:
        # Try to extract JSON from the response
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        elif '```' in content:
            content = content.split('```')[1]
        
        recipes = json.loads(content)
        if isinstance(recipes, list):
            return recipes
        elif isinstance(recipes, dict) and 'recipes' in recipes:
            return recipes['recipes']
        else:
            return [recipes]
    except:
        # Fallback to mock recipes
        return generate_mock_recipes(['ingredients'])

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    try:
        # For now, return all recipes (you can implement user filtering later)
        recipes = Recipe.query.order_by(Recipe.created_at.desc()).limit(20).all()
        
        return jsonify({
            "recipes": [{
                "id": recipe.id,
                "title": recipe.title,
                "ingredients": json.loads(recipe.ingredients),
                "instructions": recipe.instructions,
                "difficulty": recipe.difficulty,
                "cooking_time": recipe.cooking_time,
                "servings": "4",  # Add default servings
                "created_at": recipe.created_at.isoformat()
            } for recipe in recipes]
        }), 200
    except Exception as e:
        logger.error(f"Get recipes error: {e}")
        return jsonify({"error": "Failed to get recipes"}), 500

@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    try:
        recipe = Recipe.query.get_or_404(recipe_id)
        db.session.delete(recipe)
        db.session.commit()
        return jsonify({"message": "Recipe deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Delete recipe error: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to delete recipe"}), 500

# Initialize database
def init_db():
    """Initialize database with error handling"""
    try:
        with app.app_context():
            db.create_all()
            logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Continue without database for now

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Get port from environment (Railway sets PORT)
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=False)
