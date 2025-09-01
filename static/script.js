// Global variables
let currentUser = null;
let recipes = [];
let customIngredients = [];

// DOM elements
const navAuth = document.getElementById('navAuth');
const navUser = document.getElementById('navUser');
const userName = document.getElementById('userName');
const recipesGrid = document.getElementById('recipesGrid');
const noRecipes = document.getElementById('noRecipes');
const generateBtn = document.getElementById('generateBtn');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
	console.log('CulinaryAI Website Initialized');
	// Restore user session from localStorage
	try {
		const savedUser = localStorage.getItem('currentUser');
		if (savedUser) {
			currentUser = JSON.parse(savedUser);
			console.log('Restored user from localStorage:', currentUser);
		}
	} catch (_) {}
	// Check if user is logged in
	checkAuthStatus();
	// Load recipes if user is logged in
	if (currentUser) {
		loadRecipes();
	}
	// Initialize navigation
	initNavigation();
	// Initialize ingredient selection
	initIngredientSelection();
	// Show appropriate content based on auth status
	updateUI();
});

// Navigation functions
function initNavigation() {
	// Smooth scrolling for navigation links
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});
			}
		});
	});
	// Active navigation highlighting
	window.addEventListener('scroll', () => {
		const sections = document.querySelectorAll('section[id]');
		const navLinks = document.querySelectorAll('.nav-link');
		let current = '';
		sections.forEach(section => {
			const sectionTop = section.offsetTop;
			const sectionHeight = section.clientHeight;
			if (scrollY >= (sectionTop - 200)) {
				current = section.getAttribute('id');
			}
		});
		navLinks.forEach(link => {
			link.classList.remove('active');
			if (link.getAttribute('href') === `#${current}`) {
				link.classList.add('active');
			}
		});
	});
}

function toggleMenu() {
	const navMenu = document.getElementById('navMenu');
	navMenu.classList.toggle('active');
}

function scrollToSection(sectionId) {
	const section = document.getElementById(sectionId);
	if (section) {
		section.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}
}

// Authentication functions
async function checkAuthStatus() {
	try {
		const response = await fetch('/api/check-auth');
		if (response.ok) {
			const data = await response.json();
			if (data.user) {
				currentUser = data.user;
				try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } catch (_) {}
				console.log('Server session user:', currentUser);
			} else {
				// Do not clear an existing client session; keep localStorage user
				console.log('No server session; keeping client session user:', currentUser);
			}
		} else {
			console.log('Auth check not OK; keeping client session user:', currentUser);
		}
	} catch (error) {
		console.error('Auth check error; keeping client session user:', error);
	}
}

function showLoginModal() {
	document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
	document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
	document.getElementById(modalId).style.display = 'none';
}

async function login(event) {
	event.preventDefault();
	console.log('Login attempt...');
	const username = document.getElementById('loginUsername').value;
	const password = document.getElementById('loginPassword').value;
	console.log('Login credentials:', { username, password: '***' });
	try {
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		console.log('Login response status:', response.status);
		const data = await response.json();
		console.log('Login response data:', data);
		if (response.ok) {
			currentUser = data.user;
			try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } catch (_) {}
			console.log('Current user set to:', currentUser);
			showMessage('Login successful! Welcome back!', 'success');
			closeModal('loginModal');
			updateUI();
			loadRecipes();
		} else {
			console.error('Login failed with status:', response.status);
			showMessage(data.error || data.message || 'Login failed. Please try again.', 'error');
		}
	} catch (error) {
		console.error('Login error:', error);
		showMessage('Network error. Please try again.', 'error');
	}
}

async function register(event) {
	event.preventDefault();
	console.log('Register attempt...');
	const username = document.getElementById('registerUsername').value;
	const email = document.getElementById('registerEmail').value;
	const password = document.getElementById('registerPassword').value;
	console.log('Register credentials:', { username, email, password: '***' });
	try {
		const response = await fetch('/api/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email, password })
		});
		console.log('Register response status:', response.status);
		const data = await response.json();
		console.log('Register response data:', data);
		if (response.ok) {
			currentUser = data.user;
			try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } catch (_) {}
			console.log('Current user set to:', currentUser);
			showMessage('Registration successful! Welcome to CulinaryAI!', 'success');
			closeModal('registerModal');
			updateUI();
		} else {
			console.error('Registration failed with status:', response.status);
			showMessage(data.error || data.message || 'Registration failed. Please try again.', 'error');
		}
	} catch (error) {
		console.error('Register error:', error);
		showMessage('Network error. Please try again.', 'error');
	}
}

async function logout() {
	try {
		const response = await fetch('/api/logout', { method: 'POST' });
		if (response.ok) {
			currentUser = null;
			recipes = [];
			try { localStorage.removeItem('currentUser'); } catch (_) {}
			showMessage('Logged out successfully!', 'success');
			updateUI();
			clearRecipes();
		}
	} catch (error) {
		console.error('Logout error:', error);
		showMessage('Logout failed. Please try again.', 'error');
	}
}

// UI update functions
function updateUI() {
	console.log('Updating UI with currentUser:', currentUser);
	if (currentUser) {
		navAuth.style.display = 'none';
		navUser.style.display = 'flex';
		userName.textContent = currentUser.username;
	} else {
		navAuth.style.display = 'flex';
		navUser.style.display = 'none';
		userName.textContent = '';
	}
}

// Ingredient selection functions
function initIngredientSelection() {
	// Add event listeners to all ingredient checkboxes
	document.querySelectorAll('.ingredient-item input[type="checkbox"]').forEach(checkbox => {
		checkbox.addEventListener('change', updateGenerateButton);
	});
}

function addCustomIngredient() {
	const input = document.getElementById('customIngredient');
	const ingredient = input.value.trim();
	if (ingredient && !customIngredients.includes(ingredient)) {
		customIngredients.push(ingredient);
		displayCustomIngredients();
		input.value = '';
		updateGenerateButton();
	}
}

function removeCustomIngredient(ingredient) {
	customIngredients = customIngredients.filter(item => item !== ingredient);
	displayCustomIngredients();
	updateGenerateButton();
}

function displayCustomIngredients() {
	const container = document.getElementById('customIngredientsList');
	container.innerHTML = '';
	customIngredients.forEach(ingredient => {
		const tag = document.createElement('div');
		tag.className = 'custom-ingredient-tag';
		tag.innerHTML = `
			${ingredient}
			<span class="remove" onclick="removeCustomIngredient('${ingredient}')">&times;</span>
		`;
		container.appendChild(tag);
	});
}

function getSelectedIngredients() {
	const selected = [];
	// Get checked ingredients
	document.querySelectorAll('.ingredient-item input[type="checkbox"]:checked').forEach(checkbox => {
		selected.push(checkbox.value);
	});
	// Add custom ingredients
	selected.push(...customIngredients);
	return selected;
}

function updateGenerateButton() {
	const selectedIngredients = getSelectedIngredients();
	generateBtn.disabled = selectedIngredients.length === 0;
}

// Recipe generation functions
async function generateRecipes() {
	if (!currentUser) {
		showMessage('Please login to generate recipes!', 'warning');
		showLoginModal();
		return;
	}
	const selectedIngredients = getSelectedIngredients();
	if (selectedIngredients.length === 0) {
		showMessage('Please select at least one ingredient!', 'warning');
		return;
	}
	showLoading(true);
	try {
		const response = await fetch('/api/generate-recipes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ingredients: selectedIngredients })
		});
		const data = await response.json();
		if (response.ok) {
			recipes = data.recipes;
			showMessage(`Generated ${recipes.length} delicious recipes!`, 'success');
			displayRecipes();
			scrollToSection('recipes');
		} else {
			showMessage(data.message || 'Failed to generate recipes. Please try again.', 'error');
		}
	} catch (error) {
		console.error('Generate recipes error:', error);
		showMessage('Network error. Please try again.', 'error');
	} finally {
		showLoading(false);
	}
}

function showLoading(show) {
	if (show) {
		generateBtn.style.display = 'none';
		loadingSpinner.style.display = 'flex';
	} else {
		generateBtn.style.display = 'flex';
		loadingSpinner.style.display = 'none';
	}
}

// Recipe display functions
async function loadRecipes() {
	if (!currentUser) return;
	try {
		const response = await fetch('/api/recipes');
		if (response.ok) {
			const data = await response.json();
			recipes = data.recipes;
			displayRecipes();
		}
	} catch (error) {
		console.error('Load recipes error:', error);
	}
}

function displayRecipes() {
	if (recipes.length === 0) {
		recipesGrid.style.display = 'none';
		noRecipes.style.display = 'block';
		return;
	}
	recipesGrid.style.display = 'grid';
	noRecipes.style.display = 'none';
	recipesGrid.innerHTML = '';
	recipes.forEach(recipe => {
		const card = createRecipeCard(recipe);
		recipesGrid.appendChild(card);
	});
}

function createRecipeCard(recipe) {
	const card = document.createElement('div');
	card.className = 'recipe-card';
	const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients;
	card.innerHTML = `
		<div class="recipe-card-header">
			<h3>${recipe.title}</h3>
			<div class="recipe-card-meta">
				<span><i class="fas fa-clock"></i> ${recipe.cooking_time}</span>
				<span><i class="fas fa-user"></i> ${recipe.servings} servings</span>
			</div>
		</div>
		<div class="recipe-card-body">
			<h4>Ingredients</h4>
			<p>${ingredients}</p>
			<h4>Instructions</h4>
			<p>${recipe.instructions.substring(0, 150)}${recipe.instructions.length > 150 ? '...' : ''}</p>
		</div>
		<div class="recipe-card-footer">
			<span class="recipe-difficulty ${recipe.difficulty.toLowerCase()}">${recipe.difficulty}</span>
			<span class="recipe-time">${recipe.cooking_time}</span>
		</div>
	`;
	card.addEventListener('click', () => viewRecipe(recipe));
	return card;
}

function viewRecipe(recipe) {
	const modal = document.getElementById('recipeModal');
	const title = document.getElementById('recipeModalTitle');
	const content = document.getElementById('recipeModalContent');
	const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients;
	title.textContent = recipe.title;
	content.innerHTML = `
		<div class="recipe-details">
			<div class="recipe-meta">
				<span><i class="fas fa-clock"></i> ${recipe.cooking_time}</span>
				<span><i class="fas fa-user"></i> ${recipe.servings} servings</span>
				<span class="recipe-difficulty ${recipe.difficulty.toLowerCase()}">${recipe.difficulty}</span>
			</div>
			<div class="recipe-section">
				<h4><i class="fas fa-carrot"></i> Ingredients</h4>
				<p>${ingredients}</p>
			</div>
			<div class="recipe-section">
				<h4><i class="fas fa-list-ol"></i> Instructions</h4>
				<p>${recipe.instructions}</p>
			</div>
		</div>
	`;
	modal.style.display = 'block';
}

function clearRecipes() {
	recipes = [];
	recipesGrid.style.display = 'none';
	noRecipes.style.display = 'block';
}

// Filter functions
function filterRecipes() {
	const difficultyFilter = document.getElementById('difficultyFilter').value;
	const timeFilter = document.getElementById('timeFilter').value;
	const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
	const filteredRecipes = recipes.filter(recipe => {
		const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter;
		const matchesTime = !timeFilter || recipe.cooking_time === timeFilter;
		const matchesSearch = !searchFilter || recipe.title.toLowerCase().includes(searchFilter) || recipe.ingredients.toLowerCase().includes(searchFilter);
		return matchesDifficulty && matchesTime && matchesSearch;
	});
	displayFilteredRecipes(filteredRecipes);
}

function displayFilteredRecipes(filteredRecipes) {
	if (filteredRecipes.length === 0) {
		recipesGrid.style.display = 'none';
		noRecipes.style.display = 'block';
		noRecipes.innerHTML = `
			<i class="fas fa-search"></i>
			<h3>No recipes found</h3>
			<p>Try adjusting your filters or generate new recipes!</p>
		`;
		return;
	}
	recipesGrid.style.display = 'grid';
	noRecipes.style.display = 'none';
	recipesGrid.innerHTML = '';
	filteredRecipes.forEach(recipe => {
		const card = createRecipeCard(recipe);
		recipesGrid.appendChild(card);
	});
}

// Message display function
function showMessage(message, type = 'info') {
	const container = document.getElementById('messageContainer');
	const messageDiv = document.createElement('div');
	messageDiv.className = `message ${type}`;
	const icon = type === 'success' ? 'fas fa-check-circle' : type === 'error' ? 'fas fa-exclamation-circle' : type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
	messageDiv.innerHTML = `
		<i class="${icon}"></i>
		<span>${message}</span>
	`;
	container.appendChild(messageDiv);
	setTimeout(() => { if (messageDiv.parentNode) { messageDiv.parentNode.removeChild(messageDiv); } }, 5000);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
	const modals = document.querySelectorAll('.modal');
	modals.forEach(modal => { if (event.target === modal) { modal.style.display = 'none'; } });
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
	if (event.key === 'Escape') {
		const modals = document.querySelectorAll('.modal');
		modals.forEach(modal => { if (modal.style.display === 'block') { modal.style.display = 'none'; } });
	}
});

// Prevent form submission on Enter key in custom ingredient input
document.getElementById('customIngredient').addEventListener('keypress', function(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		addCustomIngredient();
	}
});

console.log('CulinaryAI JavaScript loaded successfully!');

