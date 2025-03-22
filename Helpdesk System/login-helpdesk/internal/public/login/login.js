import { UI } from '../../common.js';

// Document Page
document.addEventListener("DOMContentLoaded", async function() {
    toggle_view();
    handle_login();
    username_datalist();
    UI.handle_darkmode('.d-mode');
    await check_if_logged();
});

// Functions
function show_error(input, errorElement, message) {
    errorElement.style.display = 'block';
    errorElement.textContent = message;
    input.classList.add('error');
}

function forgot_password_link() {
    const passwordLink = document.getElementById('forgotPassword');
    const forgotContainer = document.getElementById('forgotContainer');
    const login = document.getElementById('login');

    passwordLink.addEventListener('click', function(event) {
        event.preventDefault();
        login.style.display = 'none';
        forgotContainer.style.visibility = 'visible';
    });
}

function toggle_view() {
    const path = window.location.pathname.split('/').pop();

    const loginContainer = document.getElementById('login');
    const loggedIn = document.getElementById('loggedIn');
    
    loginContainer.style.display = 'none';
    loggedIn.style.display = 'none';

    if (path === 'sign-in') {
        loginContainer.style.display = 'block';
    } else if (path == 'logged-in') {
        loggedIn.style.display = 'block';
    }
}

function handle_login() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    const loginBack = document.getElementById('loginBack');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const enteredUsername = usernameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        // Send POST request to the server for login
        try {
            const response = await fetch('/api/auth/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: enteredUsername, password: enteredPassword }),
            });
    
            if (!response.ok) {
                show_error(usernameInput, usernameError, "Invalid username or password. Please try again.");
                return;
            }
            window.location.replace("/internal/dashboard");
        } catch (error) {
            console.error('Error:', error);
            show_error(usernameInput, usernameError, "An error occurred during login. Please try again later.");
        }

    });

    loginBack.addEventListener('click', function(event){
        event.preventDefault();
        window.location.replace('/internal/welcome');
    })

    forgot_password_link();
}

async function check_if_logged() {
    const loggingIn = document.getElementById('loggingIn');
    const changeAcc = document.getElementById('changeAcc');
    const textLogged = document.getElementById('textLogged');
    const userLogged = document.getElementById('userLogged');

    try {
        const response = await fetch('/api/session-user');
        if (response.ok) {
            const data = await response.json();
            if (data.fullName) {
                userLogged.style.display = 'inline';
                userLogged.innerHTML = `<i>${data.fullName}?</i>`;
                textLogged.appendChild(userLogged);
            }
        } 
    } catch (err) {
        console.error("Error fetching session user:", err);
        document.getElementById('loggedIn').style.display = 'none';
    }

    loggingIn.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.replace('/internal/dashboard');
    });

    changeAcc.addEventListener('click', (event) => {
        event.preventDefault();
        console.log("click no");
        UI.logout_function(true);
    });

}

async function username_datalist(){
    const response = await fetch('/api/users');
    const data = await response.json();

    const select = document.getElementById('username');
    // select.innerHTML = `<option selected disabled></option>`; 

    data.forEach(user => {
        const option = document.createElement("option");
        const fullName = user.first_name + (user.last_name ? ` ${user.last_name}` : ""); 
        option.value = user.username;
        option.textContent = fullName;
        select.appendChild(option);
    });
}