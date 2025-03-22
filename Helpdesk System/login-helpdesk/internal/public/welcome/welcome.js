import { UI } from '../../common.js';

// Document Page
document.addEventListener("DOMContentLoaded", async function() {
    const container = document.getElementById("container");
    const registerButton = document.getElementById("register");
    const signInButton = document.getElementById("signIn");

    registerButton.addEventListener("click", () => {
        container.classList.add("right-panel-active");
        const usernameError = document.getElementById("usernameError");

        setTimeout(() => {
            usernameError.style.display = "none";
            usernameError.textContent = "";
        }, 500); 
    });

    signInButton.addEventListener("click", () => {
        container.classList.remove("right-panel-active");
        const usernameInput = document.getElementById('new-user');
        const nameInput = document.getElementById('new-name');
        const passwordInput = document.getElementById('new-pass');

        setTimeout(() => {
            usernameInput.value = "";
            nameInput.value = "";
            passwordInput.value = "";
        }, 500); 
    });

    // sign_account();
    handle_login();
    handle_new_account();
    UI.handle_darkmode('.d-mode');

    await username_datalist();
});

// Functions
function show_error(errorElement, message) {
    const pass = document.getElementById("password");
    const usernameSelect = document.getElementById("username");

    errorElement.style.display = 'block';
    errorElement.textContent = message;

    usernameSelect.value = "";  
    usernameSelect.selectedIndex = 0;
    pass.value = "";
}

function handle_login() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    // const loginBack = document.getElementById('loginBack');

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
                show_error(usernameError, "Invalid username or password. Please try again.");
                return;
            }
            window.location.replace("/internal/dashboard");
        } catch (error) {
            console.error('Error:', error);
            show_error(usernameError, "An error occurred during login. Please try again later.");
        }

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

function handle_new_account() {
    const newAccForm = document.getElementById('newAccForm');
    const usernameInput = document.getElementById('new-user');
    const nameInput = document.getElementById('new-name');
    const passwordInput = document.getElementById('new-pass');
    const usernameError = document.getElementById('newError');

    function check_password(password) {
        return /^[a-zA-Z0-9]+$/.test(password);
    }

    newAccForm.addEventListener('submit', function(event) {
        event.preventDefault();

        console.log("helloooo");
        const enteredUsername = usernameInput.value.trim();
        const enteredName = nameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        if (!check_password(enteredPassword)) {
            show_error(usernameInput, usernameError, "Password must contain only alphanumeric characters!");
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
                show_error(usernameInput, usernameError, "Please try a different username.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            show_error(usernameInput, usernameError, "An error occurred during login. Please try again later.");
        });
    });
}


    // function sign_account() {
    //     const signAcc = document.getElementById('signAccount');
    //     const addAccount = document.getElementById('addAccount');
    
    //     signAcc.addEventListener('click', async function(event) {
    //         event.preventDefault();
    
    //         try {
    //             const response = await fetch('/api/session-user');
    //             if (response.ok) {
    //                 window.location.replace('/internal/login/logged-in')
    //             } else {
    //                 window.location.replace("/internal/login/sign-in");
    //             }
    //         } catch (err) {
    //             console.error("Error:", err);
    //         }
    //     });
    
    //     addAccount.addEventListener('click', function(event) {
    //         event.preventDefault();
    //         window.location.replace("/internal/register");
    //     });
    // }