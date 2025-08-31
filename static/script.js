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
    
    // Filters
    difficultyFilter.addEventListener('change', filterRecipes);
    timeFilter.addEventListener('change', filterRecipes);
    
    // Modal
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            closeModal();
        }
    });
}

// Authentication Functions
function showForm(formType) {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    
    if (formType === 'login') {
        loginForm.style.display = 'block';
    } else {
        registerForm.style.display = 'block';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
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
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = {
                id: data.user_id,
                username: data.username
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showLoggedInState();
            loginForm.style.display = 'none';
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            loadUserRecipes();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error during login: ' + error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
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
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            registerForm.style.display = 'none';
            showForm('login');
            document.getElementById('regUsername').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error during registration: ' + error.message);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoggedOutState();
    allRecipes = [];
    myRecipeGrid.innerHTML = '';
}

function showLoggedInState() {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    userInfo.style.display = 'inline';
    username.textContent = currentUser.username;
    recipeGenerator.style.display = 'block';
    myRecipes.style.display = 'block';
}

function showLoggedOutState() {
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    userInfo.style.display = 'none';
    recipeGenerator.style.display = 'none';
    myRecipes.style.display = 'none';
    recipeResults.style.display = 'none';
}

// Ingredient Functions
function populateIngredientGrid() {
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
    // Update visual selection in grid
    const ingredientItems = ingredientGrid.querySelectorAll('.ingredient-item');
    ingredientItems.forEach(item => {
        const ingredientName = item.querySelector('span').textContent;
        if (selectedIngredients.includes(ingredientName)) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Update selected ingredients display
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

function removeIngredient(ingredientName) {
    const index = selectedIngredients.indexOf(ingredientName);
    if (index > -1) {
        selectedIngredients.splice(index, 1);
        updateIngredientSelection();
        updateGenerateButton();
    }
}

function updateGenerateButton() {
    generateRecipesBtn.disabled = selectedIngredients.length === 0;
}

// Recipe Generation
async function generateRecipes() {
    if (selectedIngredients.length === 0) return;
    
    loading.style.display = 'flex';
    
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
        
        const data = await response.json();
        
        if (response.ok) {
            displayGeneratedRecipes(data.recipes);
            loadUserRecipes(); // Refresh the user's recipe collection
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error generating recipes: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function displayGeneratedRecipes(recipes) {
    recipeResults.style.display = 'block';
    recipeGrid.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe, true);
        recipeGrid.appendChild(recipeCard);
    });
    
    // Scroll to results
    recipeResults.scrollIntoView({ behavior: 'smooth' });
}

// Recipe Management
async function loadUserRecipes() {
    try {
        const response = await fetch(`/api/recipes?user_id=${currentUser.id}`);
        const recipes = await response.json();
        allRecipes = recipes;
        displayUserRecipes(recipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
}

function displayUserRecipes(recipes) {
    myRecipeGrid.innerHTML = '';
    
    if (recipes.length === 0) {
        myRecipeGrid.innerHTML = '<p style="text-align: center; color: #666;">No recipes yet. Generate some recipes to get started!</p>';
        return;
    }
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe, false);
        myRecipeGrid.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe, isGenerated = false) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    card.innerHTML = `
        <div class="recipe-card-header">
            <h3>${recipe.title}</h3>
            <div class="recipe-meta">
                <span><i class="fas fa-clock"></i> ${recipe.cooking_time}</span>
                <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
            </div>
        </div>
        <div class="recipe-card-body">
            <div class="recipe-ingredients">
                <h4>Ingredients:</h4>
                <ul>
                    ${recipe.ingredients.split(',').map(ing => `<li>${ing.trim()}</li>`).join('')}
                </ul>
            </div>
            <div class="recipe-actions">
                <button class="btn btn-primary btn-small" onclick="viewRecipe(${recipe.id})">
                    <i class="fas fa-eye"></i> View Recipe
                </button>
                ${!isGenerated ? `<button class="btn btn-danger btn-small" onclick="deleteRecipe(${recipe.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

function viewRecipe(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    modalBody.innerHTML = `
        <h2>${recipe.title}</h2>
        <div class="recipe-meta" style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
            <span style="margin-right: 2rem;"><i class="fas fa-clock"></i> ${recipe.cooking_time}</span>
            <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
        </div>
        <h3>Ingredients:</h3>
        <ul>
            ${recipe.ingredients.split(',').map(ing => `<li>${ing.trim()}</li>`).join('')}
        </ul>
        <h3>Instructions:</h3>
        <ol>
            ${recipe.instructions.split('.').filter(step => step.trim()).map(step => `<li>${step.trim()}</li>`).join('')}
        </ol>
    `;
    
    recipeModal.style.display = 'block';
}

function closeModal() {
    recipeModal.style.display = 'none';
}

async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadUserRecipes(); // Refresh the list
        } else {
            alert('Error deleting recipe');
        }
    } catch (error) {
        alert('Error deleting recipe: ' + error.message);
    }
}

// Filtering Functions
function filterRecipes() {
    const difficulty = difficultyFilter.value;
    const time = timeFilter.value;
    
    let filteredRecipes = allRecipes;
    
    if (difficulty) {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficulty);
    }
    
    if (time) {
        filteredRecipes = filteredRecipes.filter(recipe => {
            const cookingTime = recipe.cooking_time.toLowerCase();
            if (time === '15' && cookingTime.includes('15')) return true;
            if (time === '30' && cookingTime.includes('30')) return true;
            if (time === '45' && cookingTime.includes('45')) return true;
            if (time === '60' && (cookingTime.includes('1 hour') || cookingTime.includes('60'))) return true;
            return false;
        });
    }
    
    displayUserRecipes(filteredRecipes);
}

