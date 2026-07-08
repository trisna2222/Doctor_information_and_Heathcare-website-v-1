// Auth Logic using MongoDB Backend APIs
const AUTH_API_URL = 'http://127.0.0.1:5000/api/auth';
const CURRENT_USER_KEY = 'medicoz_current_user';

// Handle Register
async function handleRegister(event) {
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

    try {
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Auto login after registration
        loginUser(data);
    } catch (err) {
        showError(errorDiv, err.message);
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('auth-error');



    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Invalid email or password');
        }

        loginUser(data);
    } catch (err) {
        showError(errorDiv, err.message);
    }
}

function loginUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'index.html';
    }
}

async function logoutUser() {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem('currentUser'));
    if (currentUser && currentUser.email && currentUser.role !== 'admin') {
        try {
            // Log logout to MongoDB
            await fetch(`${AUTH_API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: currentUser.email })
            });
        } catch (err) {
            console.error('Logout logging failed:', err);
        }
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('currentUser');
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

    let currentUser = null;
    try {
        const stored = localStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error parsing stored user:', e);
    }

    // Remove existing auth items if any (to prevent duplicates)
    const existingAuthItem = document.getElementById('auth-nav-item');
    if (existingAuthItem) existingAuthItem.remove();

    const isUL = navMenu.tagName.toUpperCase() === 'UL';
    let container;

    if (isUL) {
        container = document.createElement('li');
    } else {
        container = document.createElement('span');
    }
    container.id = 'auth-nav-item';

    let avatarHTML = '';
    if (currentUser) {
        if (currentUser.profilePicture) {
            avatarHTML = `<img src="${currentUser.profilePicture}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 2px solid var(--bs-primary); margin-right: 8px; vertical-align: middle;">`;
        } else {
            avatarHTML = `<i class="fas fa-user-circle" style="color: var(--bs-primary); font-size: 1.25rem; margin-right: 8px; vertical-align: middle;"></i>`;
        }

        const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'User';
        container.innerHTML = `<a href="profile.html" class="nav-link-item" style="color: var(--bs-primary); font-weight: bold; display: inline-flex; align-items: center;">${avatarHTML}Hello, ${firstName}</a>`;
    } else {
        container.innerHTML = `<a href="login.html" class="nav-link-item nav-cta-btn" style="font-weight: bold;">Login</a>`;
    }

    navMenu.appendChild(container);
}
