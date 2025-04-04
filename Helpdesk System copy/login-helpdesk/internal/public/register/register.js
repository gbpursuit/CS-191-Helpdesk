import { UI } from '../../common.js';

document.addEventListener("DOMContentLoaded", async function() {

    function toggle_viedw() {
        const path = window.location.pathname.split('/').pop();

        const createAccountPage = document.getElementById('createAccountPage');
        createAccountPage.style.display = 'none';

        if (path === 'register') {
            createAccountPage.style.display = 'block';
        } 
    }

    function handle_new_account() {
        const newAccForm = document.getElementById('newAccForm');
        const usernameInput = document.getElementById('new-user');
        const nameInput = document.getElementById('new-name');
        const passwordInput = document.getElementById('new-pass');
        const usernameError = document.getElementById('newError');
        const createBack = document.getElementById('createBack');

        function check_password(password) {
            return /^[a-zA-Z0-9]+$/.test(password);
        }

        newAccForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const enteredUsername = usernameInput.value.trim();
            const enteredName = nameInput.value.trim();
            const enteredPassword = passwordInput.value.trim();

            if (!check_password(enteredPassword)) {
                showError(usernameInput, usernameError, "Password must contain only alphanumeric characters!");
                return;
            }

            fetch('/api/auth/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: enteredUsername, name: enteredName, password: enteredPassword }),
            })
            .then(response => {
                if (response.ok) {
                    window.location.replace("/internal/login/logged-in");
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

    toggle_viedw();
    handle_new_account();
    UI.handle_darkmode('.d-mode-again');
})