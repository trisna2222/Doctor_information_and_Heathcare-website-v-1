// Auth Logic using localStorage

const USERS_KEY = 'medicoz_users';
const CURRENT_USER_KEY = 'medicoz_current_user';

// Helper to get users
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// Helper to set users
function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Helper to find user
function findUser(email) {
    const users = getUsers();
    return users.find(u => u.email === email);
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirm_password.value;
    const errorDiv = document.getElementById('auth-error');

    if (password !== confirmPassword) {
        showError(errorDiv, "Passwords do not match");
        return;
    }

    if (findUser(email)) {
        showError(errorDiv, "User already exists with this email");
        return;
    }

    const newUser = {
        name,
        email,
        password, // In a real app, never store plain text passwords!
        joined: new Date().toISOString()
    };

    saveUser(newUser);
    loginUser(newUser); // Auto login
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('auth-error');

    // Check for Admin Login first
    if (email === 'admin@medicoz.com' && password === '1234') {
        // Create an admin session object
        const adminUser = {
            name: 'Administrator',
            email: 'admin@medicoz.com',
            role: 'admin'
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
        window.location.href = 'admin.html';
        return;
    }

    const user = findUser(email);

    if (user && user.password === password) {
        loginUser(user);
    } else {
        showError(errorDiv, "Invalid email or password");
    }
}

function loginUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.location.href = 'index.html';
}

function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}


// Navbar injection logic - Runs on every page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});

function updateNavbar() {
    const navMenu = document.querySelector('.nav-links');
    if (!navMenu) return;

    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    // Remove existing auth items if any (to prevent duplicates)
    const existingAuthItem = document.getElementById('auth-nav-item');
    if (existingAuthItem) existingAuthItem.remove();

    const li = document.createElement('li');
    li.id = 'auth-nav-item';

    if (currentUser) {
        li.innerHTML = `<a href="profile.html" class="nav-link-item" style="color: var(--bs-primary); font-weight: bold;">Hello, ${currentUser.name.split(' ')[0]}</a>`;
    } else {
        li.innerHTML = `<a href="login.html" class="nav-link-item nav-cta-btn" style=" font-weight: bold;">Login</a>`;
    }

    navMenu.appendChild(li);
}
