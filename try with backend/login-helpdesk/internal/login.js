import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", function() {

    function showError(input, errorElement, message) {
        errorElement.style.display = 'block';
        errorElement.textContent = message;
        input.classList.add('error');
    }

    function forgotPasswordLink() {
        const passwordLink = document.getElementById('forgotPassword');
        const forgotContainer = document.getElementById('forgotContainer');
        const login = document.getElementById('login');

        passwordLink.addEventListener('click', function(event) {
            event.preventDefault();
            login.style.display = 'none';
            forgotContainer.style.visibility = 'visible';
        });
    }

    function toggleView() {
        const path = window.location.pathname.split('/').pop();

        // const urlParams = new URLSearchParams(window.location.search);
        // const view = urlParams.get('view'); // Get the "view" parameter

        const loginContainer = document.getElementById('login');
        const createAccountPage = document.getElementById('createAccountPage');

        if (path === 'sign-in') {
            loginContainer.style.display = 'block';
            createAccountPage.style.display = 'none';
        } else if (path === 'create-account') {
            loginContainer.style.display = 'none';
            createAccountPage.style.display = 'block';
        } 
    }

    function handleLogin() {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const usernameError = document.getElementById('usernameError');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const enteredUsername = usernameInput.value.trim();
            const enteredPassword = passwordInput.value.trim();

            // Send POST request to the server for login
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: enteredUsername, password: enteredPassword }),
            })
            .then(response => {
                if (response.ok) {
                    window.location.replace("/internal/dashboard");
                } else {
                    showError(usernameInput, usernameError, "Invalid username or password. Please try again.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError(usernameInput, usernameError, "An error occurred during login. Please try again later.");
            });
        });

        forgotPasswordLink();
    }

    function handleNewAccount() {
        // dont mind but dont delete 
    }

    toggleView();
    handleLogin();
    UI.handle_darkmode('.d-mode');
});