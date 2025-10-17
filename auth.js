document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const result = await apiCall('/auth/login', 'POST', { email, password });
        
        if (result.success) {
            setToken(result.token);
            setUser(result.user);
            window.location.href = 'dashboard.html';
        } else {
            showMessage('message', result.message, 'error');
        }
    } catch (error) {
        showMessage('message', error.message, 'error');
    }
});