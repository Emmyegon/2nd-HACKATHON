// Global variables
let currentUser = null;
let selectedIngredients = [];
let allRecipes = [];

// Common ingredients with icons
const ingredients = [
    { name: 'Chicken', icon: 'fas fa-drumstick-bite' },
    { name: 'Beef', icon: 'fas fa-hamburger' },
    { name: 'Fish', icon: 'fas fa-fish' },
    { name: 'Eggs', icon: 'fas fa-egg' },
    { name: 'Milk', icon: 'fas fa-wine-bottle' },
    { name: 'Cheese', icon: 'fas fa-cheese' },
    { name: 'Butter', icon: 'fas fa-butter' },
    { name: 'Onions', icon: 'fas fa-circle' },
    { name: 'Garlic', icon: 'fas fa-circle' },
    { name: 'Tomatoes', icon: 'fas fa-circle' },
    { name: 'Potatoes', icon: 'fas fa-circle' },
    { name: 'Carrots', icon: 'fas fa-circle' },
    { name: 'Broccoli', icon: 'fas fa-seedling' },
    { name: 'Spinach', icon: 'fas fa-seedling' },
    { name: 'Rice', icon: 'fas fa-seedling' },
    { name: 'Pasta', icon: 'fas fa-utensils' },
    { name: 'Bread', icon: 'fas fa-bread-slice' },
    { name: 'Flour', icon: 'fas fa-wheat-awn' },
    { name: 'Sugar', icon: 'fas fa-cookie-bite' },
    { name: 'Salt', icon: 'fas fa-circle' },
    { name: 'Pepper', icon: 'fas fa-circle' },
    { name: 'Olive Oil', icon: 'fas fa-tint' },
    { name: 'Lemon', icon: 'fas fa-lemon' },
    { name: 'Mushrooms', icon: 'fas fa-seedling' },
    { name: 'Bell Peppers', icon: 'fas fa-circle' },
    { name: 'Cucumber', icon: 'fas fa-seedling' },
    { name: 'Avocado', icon: 'fas fa-seedling' },
    { name: 'Banana', icon: 'fas fa-banana' },
    { name: 'Apple', icon: 'fas fa-apple-alt' },
    { name: 'Strawberries', icon: 'fas fa-seedling' }
];

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const userSection = document.getElementById('userSection');
const userInfo = document.getElementById('userInfo');
const username = document.getElementById('username');
const logoutBtn = document.getElementById('logoutBtn');
const recipeGenerator = document.getElementById('recipeGenerator');
const myRecipes = document.getElementById('myRecipes');
const ingredientGrid = document.getElementById('ingredientGrid');
const selectedIngredientsDiv = document.getElementById('selectedIngredients');
const generateRecipesBtn = document.getElementById('generateRecipesBtn');
const recipeResults = document.getElementById('recipeResults');
const recipeGrid = document.getElementById('recipeGrid');
const myRecipeGrid = document.getElementById('myRecipeGrid');
const difficultyFilter = document.getElementById('difficultyFilter');
const timeFilter = document.getElementById('timeFilter');
const recipeModal = document.getElementById('recipeModal');
const modalBody = document.getElementById('modalBody');
const loading = document.getElementById('loading');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showLoggedInState();
    }
    
    // Populate ingredient grid
    populateIngredientGrid();
    
    // Load recipes if user is logged in
    if (currentUser) {
        loadUserRecipes();
    }
}

function setupEventListeners() {
    // Authentication buttons
    loginBtn.addEventListener('click', () => showForm('login'));
    registerBtn.addEventListener('click', () => showForm('register'));
    logoutBtn.addEventListener('click', logout);
    
    // Form submissions
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
    
    // Recipe generation
    generateRecipesBtn.addEventListener('click', generateRecipes);
    
    // Filter changes
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', filterRecipes);
    }
    if (timeFilter) {
        timeFilter.addEventListener('change', filterRecipes);
    }
    
    // Modal close
    if (recipeModal) {
        window.addEventListener('click', function(event) {
            if (event.target === recipeModal) {
                recipeModal.style.display = 'none';
            }
        });
    }
}

function showForm(type) {
    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    console.log('Login attempt started');
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('Login response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showLoggedInState();
            showMessage('Login successful!', 'success');
            
            // Clear form
            document.getElementById('loginFormElement').reset();
            loginForm.style.display = 'none';
            
            // Load user's recipes
            loadUserRecipes();
        } else {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            showMessage(errorData.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    console.log('Register attempt started');
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        console.log('Register response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Registration successful:', data);
            
            showMessage('Registration successful! Please login.', 'success');
            
            // Clear form and show login
            document.getElementById('registerFormElement').reset();
            showForm('login');
        } else {
            const errorData = await response.json();
            console.error('Registration failed:', errorData);
            showMessage(errorData.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoggedOutState();
    showMessage('Logged out successfully', 'success');
}

function showLoggedInState() {
    if (userSection) {
        userSection.innerHTML = `
            <span class="user-info" id="userInfo">
                Welcome, <span id="username">${currentUser.username}</span>
                <button class="btn btn-outline" id="logoutBtn">Logout</button>
            </span>
        `;
        
        // Re-attach logout event listener
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
    
    if (recipeGenerator) {
        recipeGenerator.style.display = 'block';
    }
    if (myRecipes) {
        myRecipes.style.display = 'block';
    }
}

function showLoggedOutState() {
    if (userSection) {
        userSection.innerHTML = `
            <button class="btn btn-primary" id="loginBtn">Login</button>
            <button class="btn btn-secondary" id="registerBtn">Register</button>
        `;
        
        // Re-attach event listeners
        document.getElementById('loginBtn').addEventListener('click', () => showForm('login'));
        document.getElementById('registerBtn').addEventListener('click', () => showForm('register'));
    }
    
    if (recipeGenerator) {
        recipeGenerator.style.display = 'none';
    }
    if (myRecipes) {
        myRecipes.style.display = 'none';
    }
}

function populateIngredientGrid() {
    if (!ingredientGrid) return;
    
    ingredientGrid.innerHTML = '';
    ingredients.forEach(ingredient => {
        const ingredientItem = document.createElement('div');
        ingredientItem.className = 'ingredient-item';
        ingredientItem.innerHTML = `
            <i class="${ingredient.icon}"></i>
            <span>${ingredient.name}</span>
        `;
        ingredientItem.addEventListener('click', () => toggleIngredient(ingredient.name));
        ingredientGrid.appendChild(ingredientItem);
    });
}

function toggleIngredient(ingredientName) {
    const index = selectedIngredients.indexOf(ingredientName);
    if (index > -1) {
        selectedIngredients.splice(index, 1);
    } else {
        selectedIngredients.push(ingredientName);
    }
    
    updateIngredientSelection();
    updateGenerateButton();
}

function updateIngredientSelection() {
    // Update visual selection
    const ingredientItems = document.querySelectorAll('.ingredient-item');
    ingredientItems.forEach(item => {
        const ingredientName = item.querySelector('span').textContent;
        if (selectedIngredients.includes(ingredientName)) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Update selected ingredients display
    if (selectedIngredientsDiv) {
        selectedIngredientsDiv.innerHTML = '';
        selectedIngredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.className = 'selected-tag';
            tag.innerHTML = `
                ${ingredient}
                <span class="remove" onclick="removeIngredient('${ingredient}')">&times;</span>
            `;
            selectedIngredientsDiv.appendChild(tag);
        });
    }
}

function removeIngredient(ingredientName) {
    const index = selectedIngredients.indexOf(ingredientName);
    if (index > -1) {
        selectedIngredients.splice(index, 1);
        updateIngredientSelection();
        updateGenerateButton();
    }
}

function updateGenerateButton() {
    if (generateRecipesBtn) {
        generateRecipesBtn.disabled = selectedIngredients.length === 0;
    }
}

async function generateRecipes() {
    if (!currentUser || selectedIngredients.length === 0) {
        showMessage('Please login and select ingredients', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/generate-recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ingredients: selectedIngredients,
                user_id: currentUser.id
            })
        });
        
        console.log('Generate recipes response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Recipes generated:', data);
            
            displayGeneratedRecipes(data.recipes);
            showMessage('Recipes generated successfully!', 'success');
            
            // Clear selection
            selectedIngredients = [];
            updateIngredientSelection();
            updateGenerateButton();
            
            // Reload user recipes
            loadUserRecipes();
        } else {
            const errorData = await response.json();
            console.error('Recipe generation failed:', errorData);
            showMessage(errorData.error || 'Failed to generate recipes', 'error');
        }
    } catch (error) {
        console.error('Recipe generation error:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function displayGeneratedRecipes(recipes) {
    if (!recipeResults || !recipeGrid) return;
    
    recipeResults.style.display = 'block';
    recipeGrid.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeGrid.appendChild(recipeCard);
    });
}

async function loadUserRecipes() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/recipes?user_id=${currentUser.id}`);
        console.log('Load recipes response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('User recipes loaded:', data);
            allRecipes = data.recipes;
            displayUserRecipes(allRecipes);
        } else {
            console.error('Failed to load recipes');
        }
    } catch (error) {
        console.error('Load recipes error:', error);
    }
}

function displayUserRecipes(recipes) {
    if (!myRecipeGrid) return;
    
    myRecipeGrid.innerHTML = '';
    
    if (recipes.length === 0) {
        myRecipeGrid.innerHTML = '<p>No recipes yet. Generate some recipes to get started!</p>';
        return;
    }
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        myRecipeGrid.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
        <div class="recipe-card-header">
            <h3>${recipe.title}</h3>
            <div class="recipe-meta">
                <span>Difficulty: ${recipe.difficulty}</span>
                <span>Time: ${recipe.cooking_time}</span>
            </div>
        </div>
        <div class="recipe-card-body">
            <div class="recipe-ingredients">
                <h4>Ingredients:</h4>
                <ul>
                    ${Array.isArray(recipe.ingredients) ? 
                        recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('') :
                        `<li>${recipe.ingredients}</li>`
                    }
                </ul>
            </div>
            <div class="recipe-actions">
                <button class="btn btn-primary btn-small" onclick="viewRecipe(${recipe.id})">View Details</button>
                <button class="btn btn-danger btn-small" onclick="deleteRecipe(${recipe.id})">Delete</button>
            </div>
        </div>
    `;
    return card;
}

function viewRecipe(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    if (recipeModal && modalBody) {
        modalBody.innerHTML = `
            <h2>${recipe.title}</h2>
            <div class="recipe-meta">
                <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
                <p><strong>Cooking Time:</strong> ${recipe.cooking_time}</p>
            </div>
            <h3>Ingredients:</h3>
            <ul>
                ${Array.isArray(recipe.ingredients) ? 
                    recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('') :
                    `<li>${recipe.ingredients}</li>`
                }
            </ul>
            <h3>Instructions:</h3>
            <p>${recipe.instructions}</p>
        `;
        recipeModal.style.display = 'block';
    }
}

async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Recipe deleted successfully', 'success');
            loadUserRecipes();
        } else {
            showMessage('Failed to delete recipe', 'error');
        }
    } catch (error) {
        console.error('Delete recipe error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function filterRecipes() {
    if (!difficultyFilter || !timeFilter) return;
    
    const difficulty = difficultyFilter.value;
    const time = timeFilter.value;
    
    let filteredRecipes = allRecipes;
    
    if (difficulty) {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficulty);
    }
    
    if (time) {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.cooking_time === time);
    }
    
    displayUserRecipes(filteredRecipes);
}

function showLoading(show) {
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the main content
    const main = document.querySelector('.main');
    if (main) {
        main.insertBefore(messageDiv, main.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

