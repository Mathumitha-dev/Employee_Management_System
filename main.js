// frontend/js/main.js
const API_URL = 'http://localhost:5000/api';

// Get token from storage
function getToken() {
    return localStorage.getItem('token');
}

// Set token in storage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove token
function removeToken() {
    localStorage.removeItem('token');
}

// Get user data
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Set user data
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// API call helper
async function apiCall(endpoint, method = 'GET', data = null) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Check authentication
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '../pages/login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = '../pages/login.html';
}

// Show message
function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
        setTimeout(() => {
            element.className = 'message';
        }, 5000);
    }
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Initialize user info in header
function initUserInfo() {
    const user = getUser();
    if (user) {
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        
        if (userNameEl) {
            userNameEl.textContent = user.email;
        }
        
        if (userRoleEl) {
            userRoleEl.textContent = user.role.toUpperCase();
            userRoleEl.className = `badge badge-${user.role === 'admin' ? 'danger' : 'info'}`;
        }
    }
}

// Check if user has permission
function hasPermission(requiredRoles) {
    const user = getUser();
    return user && requiredRoles.includes(user.role);
}