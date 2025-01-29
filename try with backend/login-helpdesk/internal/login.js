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
        const loginBack = document.getElementById('loginBack');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const enteredUsername = usernameInput.value.trim();
            const enteredPassword = passwordInput.value.trim();

            // Send POST request to the server for login
            fetch('/login/sign-in', {
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

        loginBack.addEventListener('click', function(event){
            event.preventDefault();
            window.location.replace('/internal/welcome');
        })

        forgotPasswordLink();
    }

    function handleNewAccount() {
        const newAccForm = document.getElementById('newAccForm');
        const usernameInput = document.getElementById('new-user');
        const nameInput = document.getElementById('new-name');
        const passwordInput = document.getElementById('new-pass');
        const usernameError = document.getElementById('newError');
        const createBack = document.getElementById('createBack');

        function checkPassword(password) {
            return /^[a-zA-Z0-9]+$/.test(password);
        }

        newAccForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const enteredUsername = usernameInput.value.trim();
            const enteredName = nameInput.value.trim();
            const enteredPassword = passwordInput.value.trim();

            if (!checkPassword(enteredPassword)) {
                showError(usernameInput, usernameError, "Password must contain only alphanumeric characters!");
                return;
            }

            fetch('/login/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: enteredUsername, name: enteredName, password: enteredPassword }),
            })
            .then(response => {
                if (response.ok) {
                    window.location.replace("/internal/dashboard");
                } else {
                    showError(usernameInput, usernameError, "Please try a different username.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError(usernameInput, usernameError, "An error occurred during login. Please try again later.");
            });
        });

        createBack.addEventListener('click', function(event){
            event.preventDefault();
            window.location.replace('/internal/welcome');
        })
    }

    toggleView();
    handleLogin();
    handleNewAccount();
    UI.handle_darkmode('.d-mode');
    UI.handle_darkmode('.d-mode-again');
});