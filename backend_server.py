import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import openai
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///recipe_db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    cooking_time = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize OpenAI client
def get_openai_client():
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OpenAI API key not found in environment variables")
    return openai.OpenAI(api_key=api_key)

# Mock recipe generator for when OpenAI is unavailable
def generate_mock_recipes(ingredients):
    """Generate mock recipes when OpenAI API is unavailable"""
    ingredient_str = ', '.join(ingredients)
    mock_recipes = [
        {
            'title': f'Simple {ingredients[0].title()} Stir Fry',
            'ingredients': f'{ingredient_str}, soy sauce, garlic, oil, salt, pepper',
            'instructions': f'1. Heat oil in a pan\n2. Add {ingredients[0]} and stir fry\n3. Add other ingredients\n4. Season with soy sauce, salt, and pepper\n5. Cook until tender',
            'cooking_time': '15 minutes',
            'difficulty': 'Easy'
        },
        {
            'title': f'{ingredients[0].title()} and Vegetable Soup',
            'ingredients': f'{ingredient_str}, vegetable broth, onion, herbs, salt',
            'instructions': f'1. Boil vegetable broth\n2. Add chopped vegetables\n3. Simmer for 20 minutes\n4. Season with herbs and salt\n5. Serve hot',
            'cooking_time': '25 minutes',
            'difficulty': 'Medium'
        },
        {
            'title': f'Roasted {ingredients[0].title()} Medley',
            'ingredients': f'{ingredient_str}, olive oil, herbs, garlic, salt, pepper',
            'instructions': f'1. Preheat oven to 400°F\n2. Toss vegetables with oil and seasonings\n3. Spread on baking sheet\n4. Roast for 25-30 minutes\n5. Serve as side dish',
            'cooking_time': '30 minutes',
            'difficulty': 'Medium'
        }
    ]
    return mock_recipes

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'openai_available': bool(os.environ.get('OPENAI_API_KEY'))
    })

@app.route('/api/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        password_hash = generate_password_hash(password)
        new_user = User(username=username, email=email, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': new_user.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return jsonify({'error': 'Missing username or password'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            return jsonify({
                'message': 'Login successful',
                'user_id': user.id,
                'username': user.username
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-recipes', methods=['POST'])
def generate_recipes():
    """Generate recipes using OpenAI API"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', [])
        user_id = data.get('user_id')
        
        if not ingredients:
            return jsonify({'error': 'No ingredients provided'}), 400
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Try OpenAI API first
        try:
            client = get_openai_client()
            ingredient_str = ', '.join(ingredients)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful cooking assistant. Generate 3 simple, delicious recipes using the provided ingredients. Each recipe should include a title, ingredients list, step-by-step instructions, cooking time, and difficulty level."
                    },
                    {
                        "role": "user",
                        "content": f"Create 3 recipes using these ingredients: {ingredient_str}. Make them simple and delicious."
                    }
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            # Parse OpenAI response
            content = response.choices[0].message.content
            recipes = parse_openai_response(content, ingredients)
            
        except Exception as openai_error:
            print(f"OpenAI API error: {str(openai_error)}")
            # Fallback to mock recipes
            recipes = generate_mock_recipes(ingredients)
        
        # Save recipes to database
        saved_recipes = []
        for recipe_data in recipes:
            recipe = Recipe(
                title=recipe_data['title'],
                ingredients=recipe_data['ingredients'],
                instructions=recipe_data['instructions'],
                cooking_time=recipe_data['cooking_time'],
                difficulty=recipe_data['difficulty'],
                user_id=user_id
            )
            db.session.add(recipe)
            saved_recipes.append(recipe)
        
        db.session.commit()
        
        # Return recipe data
        return jsonify({
            'message': 'Recipes generated successfully',
            'recipes': [
                {
                    'id': recipe.id,
                    'title': recipe.title,
                    'ingredients': recipe.ingredients,
                    'instructions': recipe.instructions,
                    'cooking_time': recipe.cooking_time,
                    'difficulty': recipe.difficulty
                }
                for recipe in saved_recipes
            ]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in generate_recipes: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to generate recipes'}), 500

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """Get user's recipes"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        recipes = Recipe.query.filter_by(user_id=user_id).order_by(Recipe.created_at.desc()).all()
        
        return jsonify([
            {
                'id': recipe.id,
                'title': recipe.title,
                'ingredients': recipe.ingredients,
                'instructions': recipe.instructions,
                'cooking_time': recipe.cooking_time,
                'difficulty': recipe.difficulty,
                'created_at': recipe.created_at.isoformat()
            }
            for recipe in recipes
        ]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    """Delete a recipe"""
    try:
        recipe = Recipe.query.get_or_404(recipe_id)
        db.session.delete(recipe)
        db.session.commit()
        
        return jsonify({'message': 'Recipe deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def parse_openai_response(content, ingredients):
    """Parse OpenAI response into structured recipe data"""
    try:
        # Simple parsing - split by recipe titles and extract information
        lines = content.split('\n')
        recipes = []
        current_recipe = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detect recipe title (usually starts with a number or is in caps)
            if line.startswith(('1.', '2.', '3.', 'Recipe', 'RECIPE')) or line.isupper():
                if current_recipe:
                    recipes.append(current_recipe)
                current_recipe = {'title': line.replace('1.', '').replace('2.', '').replace('3.', '').strip()}
            
            # Detect ingredients
            elif 'ingredients' in line.lower() or ':' in line and any(ing in line.lower() for ing in ingredients):
                current_recipe['ingredients'] = line.split(':', 1)[1].strip() if ':' in line else line
            
            # Detect instructions
            elif 'instructions' in line.lower() or 'steps' in line.lower():
                current_recipe['instructions'] = line.split(':', 1)[1].strip() if ':' in line else line
            
            # Detect cooking time
            elif 'time' in line.lower() or 'minutes' in line.lower() or 'hours' in line.lower():
                current_recipe['cooking_time'] = line.split(':', 1)[1].strip() if ':' in line else line
            
            # Detect difficulty
            elif 'difficulty' in line.lower() or 'level' in line.lower():
                current_recipe['difficulty'] = line.split(':', 1)[1].strip() if ':' in line else line
        
        # Add the last recipe
        if current_recipe:
            recipes.append(current_recipe)
        
        # Ensure we have at least 3 recipes with default values
        while len(recipes) < 3:
            recipes.append(generate_mock_recipes(ingredients)[len(recipes)])
        
        # Ensure all recipes have required fields
        for recipe in recipes:
            if 'ingredients' not in recipe:
                recipe['ingredients'] = ', '.join(ingredients)
            if 'instructions' not in recipe:
                recipe['instructions'] = 'Follow the recipe steps carefully.'
            if 'cooking_time' not in recipe:
                recipe['cooking_time'] = '30 minutes'
            if 'difficulty' not in recipe:
                recipe['difficulty'] = 'Medium'
        
        return recipes[:3]  # Return only 3 recipes
        
    except Exception as e:
        print(f"Error parsing OpenAI response: {e}")
        return generate_mock_recipes(ingredients)

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
