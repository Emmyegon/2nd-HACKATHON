from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import openai
import os
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables
load_dotenv()

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

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost/recipe_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# OpenAI API key will be used in client initialization

# Initialize database
db = SQLAlchemy(app)
CORS(app)

# Database Models
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
    cooking_time = db.Column(db.String(50))
    difficulty = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully', 'user_id': user.id}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        return jsonify({
            'message': 'Login successful',
            'user_id': user.id,
            'username': user.username
        }), 200
    
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/generate-recipes', methods=['POST'])
def generate_recipes():
    data = request.get_json()
    
    if not data or not data.get('ingredients') or not data.get('user_id'):
        return jsonify({'error': 'Missing ingredients or user_id'}), 400
    
    ingredients = data['ingredients']
    user_id = data['user_id']
    
    try:
        # Try OpenAI first
        try:
            # Generate recipes using OpenAI
            prompt = f"""Suggest 3 simple recipes using these ingredients: {', '.join(ingredients)}.
            For each recipe, provide:
            1. A creative title
            2. List of ingredients (including the ones provided plus any additional ones needed)
            3. Step-by-step cooking instructions
            4. Estimated cooking time
            5. Difficulty level (Easy/Medium/Hard)
            
            Format the response as a JSON array with objects containing: title, ingredients, instructions, cooking_time, difficulty"""
            
            client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful cooking assistant. Provide recipe suggestions in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            # Parse OpenAI response
            content = response.choices[0].message.content
            recipes_data = json.loads(content)
            
        except Exception as openai_error:
            print(f"OpenAI API error: {str(openai_error)}")
            # Fallback to mock recipes
            recipes_data = generate_mock_recipes(ingredients)
        
        # Save recipes to database
        saved_recipes = []
        for recipe_data in recipes_data:
            recipe = Recipe(
                title=recipe_data['title'],
                ingredients=recipe_data['ingredients'],
                instructions=recipe_data['instructions'],
                cooking_time=recipe_data['cooking_time'],
                difficulty=recipe_data['difficulty'],
                user_id=user_id
            )
            db.session.add(recipe)
            saved_recipes.append({
                'id': recipe.id,
                'title': recipe.title,
                'ingredients': recipe.ingredients,
                'instructions': recipe.instructions,
                'cooking_time': recipe.cooking_time,
                'difficulty': recipe.difficulty
            })
        
        db.session.commit()
        
        return jsonify({
            'message': 'Recipes generated successfully',
            'recipes': saved_recipes
        }), 201
        
    except Exception as e:
        import traceback
        print(f"Error in generate_recipes: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Error generating recipes: {str(e)}'}), 500

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    user_id = request.args.get('user_id')
    
    if user_id:
        recipes = Recipe.query.filter_by(user_id=user_id).order_by(Recipe.created_at.desc()).all()
    else:
        recipes = Recipe.query.order_by(Recipe.created_at.desc()).all()
    
    recipes_list = []
    for recipe in recipes:
        recipes_list.append({
            'id': recipe.id,
            'title': recipe.title,
            'ingredients': recipe.ingredients,
            'instructions': recipe.instructions,
            'cooking_time': recipe.cooking_time,
            'difficulty': recipe.difficulty,
            'created_at': recipe.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify(recipes_list)

@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    recipe = Recipe.query.get_or_404(recipe_id)
    db.session.delete(recipe)
    db.session.commit()
    return jsonify({'message': 'Recipe deleted successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
