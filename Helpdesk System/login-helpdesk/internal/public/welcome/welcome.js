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
            toggle_cont('adminContainer', 'newCont', true);
        }, 500); 


    });

    // sign_account();
    handle_login();
    handle_new_account();
    UI.handle_darkmode('.d-mode');

    await username_datalist();
});

// Functions
function show_error(errorElement, message, passId, userId) {
    const pass = document.getElementById(passId);
    const usernameSelect = document.getElementById(userId);

    errorElement.style.display = 'block';
    errorElement.textContent = message;

    usernameSelect.classList.add('error');
    pass.classList.add('error');

    usernameSelect.value = "";  
    usernameSelect.selectedIndex = 0;
    pass.value = "";

    setTimeout(() => {
        pass.classList.remove("error");
        usernameSelect.classList.remove("error");
        errorElement.style.display = 'none';
    }, 2000);
}

function toggle_cont (first, second, isLoggedIn=false) {
    let firstCont = document.getElementById(first);
    let secondCont = document.getElementById(second);

    if(isLoggedIn) {
        firstCont.style.display = 'flex';
        secondCont.style.display = 'none';
    } else {
        firstCont.style.display = 'none';
        secondCont.style.display = 'flex';
    }
}

async function handle_login() {

    // Sign-in form
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById("sign-in");
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');

    // Active and Logout Session
    const activeButton = document.getElementById('continue');
    const logoutSpan = document.getElementById('logoutSpan');

    try {
        const checkActive = await fetch('/api/session-user');
        const nameData = await checkActive.json();

        if(nameData.fullName) {
            toggle_cont('activeAccount', 'outerContainer', true);
            activeButton.textContent += nameData.fullName;

            activeButton.addEventListener('click', () => {
                window.location.replace("/internal/dashboard"); 
            })
        }

        logoutSpan.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    }
                })

                if(!response.ok) {
                    throw new Error ('Failed to log out');
                }

                toggle_cont('activeAccount', 'outerContainer');

            } catch (err) {
                console.error('Error logging out:', err);
            }
        });

        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
    
            const enteredUsername = usernameInput.value.trim();
            const enteredPassword = passwordInput.value.trim();

            if(!enteredUsername || !enteredPassword) {
                return;
            }
    
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
                    throw new Error ('Invalid username or password');
                }
                window.location.replace("/internal/dashboard");
            } catch (error) {
                console.error('Error:', error);
                show_error(usernameError, "Invalid username or password. Please try again.", 'password', 'username');
            }
    
        });

    } catch (err){
        console.error('No active user found: ', err);
    }
}

async function username_datalist(){
    const response = await fetch('/api/users');
    const data = await response.json();

    const select = document.getElementById('username');
    data.forEach(user => {
        const option = document.createElement("option");
        const fullName = user.first_name + (user.last_name ? ` ${user.last_name}` : ""); 
        option.value = user.username;
        option.textContent = fullName;
        select.appendChild(option);
    });
}

function handle_new_account() {

    // Containers
    const adminContainer = document.getElementById("adminContainer");
    const newCont = document.getElementById('newCont');

    adminContainer.style.display = 'flex';

    // New Account Form
    const newAccForm = document.getElementById('newAccForm');
    const usernameInput = document.getElementById('new-user');
    const nameInput = document.getElementById('new-name');
    const passwordInput = document.getElementById('new-pass');
    const usernameError = document.getElementById('newError');

    // Admin Session 
    const adminForm = document.getElementById("adminForm");
    const adminName = document.getElementById("adminName");
    const adminPass = document.getElementById("adminPassword");
    const adminError = document.getElementById("adminError");

    adminForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        let enteredAdmin = adminName.value.trim();
        let enteredPass = adminPass.value.trim();

        if(!enteredAdmin || !enteredPass) {
            return;
        }

        // Modify soon to request for admin table
        try {
            const response = await fetch('/api/isAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: enteredAdmin, password: enteredPass }),
            });

            const data = await response.json();
    
            if (!response.ok) {
                throw new Error ('Error verification. Please try again later.');
            }

            if (data.itExists === 0) {
                throw new Error ('Invalid username or password. Please try again.');
            }

            toggle_cont('adminContainer', 'newCont');
            adminName.value = "";
            adminPass.value = "";
        } catch (error) {
            console.error('Error:', error);
            show_error(adminError, error.message, 'adminPassword', 'adminName');
        }

    })

    function check_password(password) {
        return /^[a-zA-Z0-9]+$/.test(password);
    }

    newAccForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const enteredUsername = usernameInput.value.trim();
        const enteredName = nameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        if(!enteredUsername || !enteredName || !enteredPassword) {
            return;
        }
        
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
            if(!response.ok) {
                throw new Error ('Invalid username or password');
            }
            winddow.location.replace('/internal/login/logged-in');
        })
        .catch(error => {
            console.error('Error:', error);
            show_error(usernameInput, usernameError, "An error occurred during login. Please try again later.");
        });
    });
}