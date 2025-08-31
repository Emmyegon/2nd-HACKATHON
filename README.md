# AI Recipe Recommender

A modern web application that uses AI to generate personalized recipes based on available ingredients. Built with Flask, MySQL, and OpenAI API integration.

## 🚀 Features

- **AI-Powered Recipe Generation**: Uses OpenAI GPT-3.5 to create unique recipes from selected ingredients
- **User Authentication**: Secure user registration and login system
- **Ingredient Selection**: Interactive grid of common ingredients with visual selection
- **Recipe Management**: Save, view, and delete generated recipes
- **Smart Filtering**: Filter recipes by difficulty level and cooking time
- **Responsive Design**: Modern, mobile-friendly UI with beautiful animations
- **Real-time Generation**: Instant recipe creation with loading indicators

## 🛠️ Technology Stack

### Backend
- **Python Flask**: Web framework for API endpoints
- **MySQL**: Database for storing users and recipes
- **SQLAlchemy**: ORM for database operations
- **OpenAI API**: AI-powered recipe generation

### Frontend
- **HTML5/CSS3**: Modern, responsive design
- **JavaScript (ES6+)**: Interactive functionality and API calls
- **Font Awesome**: Beautiful icons for ingredients and UI elements
- **Google Fonts**: Typography (Poppins)

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Python 3.7+** installed
2. **MySQL Server** running locally or remotely
3. **OpenAI API Key** (free tier available)
4. **Git** for cloning the repository

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd recipe-recommender
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# Flask Configuration
SECRET_KEY=your-secret-key-here-change-this-in-production
FLASK_ENV=development

# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@localhost/recipe_db

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here
```

**Important**: Replace the placeholder values with your actual credentials.

### 4. Set Up MySQL Database
```bash
python setup_database.py
```

This script will:
- Create the `recipe_db` database
- Create necessary tables (`user`, `recipe`)
- Create a sample user for testing

### 5. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file

## 🎯 Usage

### Starting the Application
```bash
python app.py
```

The application will be available at `http://localhost:5000`

### Sample User Account
For testing purposes, a demo account is created:
- **Username**: `demo`
- **Password**: `demo123`
- **Email**: `demo@example.com`

### How to Use

1. **Register/Login**: Create an account or use the demo account
2. **Select Ingredients**: Click on ingredients from the grid to select them
3. **Generate Recipes**: Click "Generate Recipes" to create AI-powered recipes
4. **View Recipes**: Click on recipe cards to see full details
5. **Manage Collection**: View, filter, and delete your saved recipes

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Encrypted password
- `created_at`: Account creation timestamp

### Recipes Table
- `id`: Primary key
- `title`: Recipe name
- `ingredients`: Comma-separated ingredient list
- `instructions`: Step-by-step cooking instructions
- `cooking_time`: Estimated cooking duration
- `difficulty`: Easy/Medium/Hard
- `created_at`: Recipe creation timestamp
- `user_id`: Foreign key to users table

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Recipes
- `POST /api/generate-recipes` - Generate AI recipes from ingredients
- `GET /api/recipes` - Get user's recipes
- `DELETE /api/recipes/<id>` - Delete a recipe

## 🎨 Customization

### Adding New Ingredients
Edit the `ingredients` array in `static/script.js`:
```javascript
const ingredients = [
    { name: 'New Ingredient', icon: 'fas fa-icon-name' },
    // ... existing ingredients
];
```

### Styling
- Main styles: `static/style.css`
- Color scheme: Update CSS variables for primary/secondary colors
- Icons: Replace Font Awesome icons as needed

### AI Prompt Customization
Modify the OpenAI prompt in `app.py` to change recipe generation style:
```python
prompt = f"""Your custom prompt here with {ingredients}"""
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL server is running
   - Check credentials in `.env` file
   - Ensure database exists

2. **OpenAI API Error**
   - Verify API key is correct
   - Check API usage limits
   - Ensure internet connection

3. **Port Already in Use**
   - Change port in `app.py`: `app.run(port=5001)`
   - Kill existing process: `lsof -ti:5000 | xargs kill`

### Error Logs
Check the console output for detailed error messages and stack traces.

## 🔒 Security Features

- Password hashing using Werkzeug
- SQL injection prevention with SQLAlchemy
- CORS configuration for API security
- Input validation and sanitization

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Production Considerations
1. Use a production WSGI server (Gunicorn, uWSGI)
2. Set up a reverse proxy (Nginx, Apache)
3. Use environment variables for sensitive data
4. Enable HTTPS
5. Set up proper logging
6. Configure database connection pooling

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI API
- Font Awesome for beautiful icons
- Google Fonts for typography
- Flask community for the excellent framework

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the error logs
3. Create an issue in the repository
4. Contact the development team

---

**Happy Cooking! 🍳✨**

