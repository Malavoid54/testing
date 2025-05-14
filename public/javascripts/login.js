document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset error messages
    document.querySelectorAll('.error-message').forEach((el) => {
        e.style.display = 'none';
    });

    // Get form values
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate inputs
    let isValid = true;

    if (!username) {
        document.getElementById("username-error").style.display = 'block';
        isValid = false;
    }

    if (!password) {
        document.getElementById("password-error").style.display = 'block';
        isValid = false;
    }

    if (!isValid) return;

    // If validation passes, proceed with login
    const response = await fetch(`/search-userpw?Username=${encodeURIComponent(username)}&Password=${encodeURIComponent(password)}`);
    const isValidLogin = await response.json();

    if (isValidLogin) {
        window.location = '/';
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.display = 'block';
        errorDiv.textContent = "Username or password is incorrect.";
        errorDiv.style.textAlign = 'center';
        errorDiv.style.marginTop = '1rem';
        const form = document.getElementById("login-form");
        form.appendChild(errorDiv);
    }
});

// Add live validation as user types
document.getElementById("username").addEventListener('input', function() {
    if (this.value.trim()) {
        document.getElementById("username-error").style.display = 'none';
    }
});

document.getElementById("password").addEventListener('input', function() {
    if (this.value.trim()) {
        document.getElementById("password-error").style.display = 'none';
    }
});
