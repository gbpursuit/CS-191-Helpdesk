import { UI } from '../../common.js';

// Document Page
document.addEventListener("DOMContentLoaded", async function() {
    const container = document.getElementById("container");
    const registerButton = document.getElementById("register");
    const signInButton = document.getElementById("signIn");
    // const userCont = document.getElementById("dropdownList");
    // const btn = document.getElementById('userBtn');

    registerButton.addEventListener("click", () => {
        container.classList.add("right-panel-active");
        const usernameError = document.getElementById("usernameError");

        userCont.style.display = 'none';
        container.style.pointerEvents = 'auto';
        btn.disabled = false;
        btn.classList.remove('abled');
        current = 1;

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

    username_data();
    // await username_datalist();
});

const socket = io();
socket.emit('message', 'hello');

// Functions
function show_error(errorElement, message, passId, userId, usernameId = null, check = false) {
    const pass = document.getElementById(passId);
    const usernameSelect = document.getElementById(userId);
    const elements = [usernameSelect, pass];

    elements.forEach(element => element.classList.add('error'));

    if (usernameId) {
        const nameSelect = document.getElementById(usernameId);
        nameSelect.classList.add('error');
        elements.push(nameSelect); 
    }

    errorElement.style.display = 'block';
    errorElement.textContent = message;

    if (!check) {
        elements.forEach(element => element.value = "");
    }

    setTimeout(() => {
        elements.forEach(element => element.classList.remove('error'));
        errorElement.style.display = 'none';
    }, 2500);
}
// function show_error(errorElement, message, passId, userId, usernameId = null, check = false) {
//     const pass = document.getElementById(passId);
//     const usernameSelect = document.getElementById(userId);

//     let nameSelect;
//     if (usernameId) {
//         nameSelect = document.getElementById(usernameId);
//         nameSelect.classList.add('error');
//     }

//     errorElement.style.display = 'block';
//     errorElement.textContent = message;

//     usernameSelect.classList.add('error');
//     pass.classList.add('error');

//     if (!check) {
//         usernameSelect.value = "";  
//         pass.value = "";
//         if (usernameId) {
//             nameSelect.value = "";
//         }
//     }

//     setTimeout(() => {
//         pass.classList.remove("error");
//         usernameSelect.classList.remove("error");
//         if(usernameId) nameSelect.classList.remove("error");
//         errorElement.style.display = 'none';
//     }, 2500);
// }

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
    
            const enteredUsername = usernameInput.getAttribute('data-key');
            const enteredPassword = passwordInput.value.trim();

            if(!enteredUsername || !enteredPassword) {
                show_error(usernameError, "Enter the required fields before submitting.", 'password', 'username', null, true);
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

                console.log(response);
        
                if (!response.ok) {
                    throw new Error ("Invalid credentials. Please try again.");
                }

                const data = await response.json();
                socket.emit('registerUser', data.username);
                window.location.replace("/internal/dashboard");
            } catch (error) {
                console.error('Error:', error);
                show_error(usernameError, "Invalid credentials. Please try again.", 'password', 'username', null, true);
            }
    
        });

    } catch (err){
        console.error('No active user found: ', err);
    }
}


let current = 1, taskpage = 5, total = 0;
const container = document.getElementById("container");
const prev = document.getElementById('userPrev');
const next = document.getElementById('userNext');
const currentPageNum = document.getElementById('userNum');
const tableContainer = document.getElementById('userTableCont');
const select = document.getElementById('username'); 
const btn = document.getElementById('userBtn');
const userCont = document.getElementById('dropdownList');
const clsBtn = userCont.querySelector('.close-user');
const body = document.getElementById('userTable');

function update_page_num(page) {
    currentPageNum.textContent = `${current}`;
    prev.disabled = (current <= 1);
    next.disabled = (current >= page);
}

function calculate_tasks() {
    const sampleRow = tableContainer.querySelector(`.userTable tbody tr`);
    console.log(sampleRow);

    if(!tableContainer) return 1;

    const containerHeight = tableContainer.clientHeight || 1;
    const rowHeight = sampleRow ? sampleRow.clientHeight || 1 : 4;
    console.log(containerHeight, rowHeight);

    return Math.max(1, Math.floor((containerHeight / rowHeight) - 1));
}

function render_table(data, body) {
    body.innerHTML = "";
    total = data.length;

    const totalPages = Math.ceil(total / taskpage);

    const start = (current - 1) * taskpage;
    const end = start + taskpage;
    const paginatedTasks = data.slice(start, end);

    paginatedTasks.forEach((task, _) => {
        render_user(task, body);
    });

    update_page_num(totalPages);

}

function render_user(data, body) {
    const row = document.createElement("tr");
    row.innerHTML = `<td class = "user-name" data-key = "${data.username}">${data.full_name}</td>`;

    row.addEventListener('click', () => {
        select.value = row.cells[0].innerText;
        select.setAttribute("data-key", data.username.trim());
        userCont.style.display = 'none';
        container.style.pointerEvents = 'auto';
        btn.disabled = false;
        btn.classList.remove('abled');
        current = 1;
    });

    body.appendChild(row);
}

function username_data() {   
    btn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/users')

            if(!response.ok) {
                throw new Error("Error fetching data.");
            }
            
            userCont.style.display = 'flex';
            container.style.pointerEvents = 'none';            

            const data = await response.json();
            render_table(data, body);

            if (prev && next) {
                prev.onclick = async () => {
                    if (current > 1) {
                        current--;
                        render_table(data, body);
                    }
                }
                next.onclick = async () => {
                    current++
                    render_table(data, body);
            
                }
            }

            btn.disabled = true;
            btn.classList.add('abled');

        } catch (err) {
            console.error("Error:", err);
        }
    });

    clsBtn.addEventListener('click', () => {
        userCont.style.display = 'none';
        container.style.pointerEvents = 'auto';
        current = 1;
        body.innerHTML = "";
        btn.disabled = false;
        btn.classList.remove('abled');
    })
}

// async function username_datalist(){
//     const response = await fetch('/api/users');
//     const data = await response.json();

//     const select = document.getElementById('username');
//     data.forEach(user => {
//         const option = document.createElement("option");
//         const fullName = user.first_name + (user.last_name ? ` ${user.last_name}` : ""); 
//         option.value = user.username;
//         option.textContent = fullName;
//         select.appendChild(option);
//     });
// }

function handle_new_account() {

    // Containers
    const adminContainer = document.getElementById("adminContainer");
    const newCont = document.getElementById('newCont');

    adminContainer.style.display = 'flex';
    // newCont.style.display = 'flex';

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
            show_error(adminError, "Enter the required fields before submitting.", 'adminPassword', 'adminName', null, true);
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
                throw new Error ('Invalid credentials. Please try again.');
            }

            const createPage = document.getElementById('createAccountPage');
            createPage.querySelector('.admin-header').style.display = 'none';
            toggle_cont('adminContainer', 'newCont');
            adminName.value = "";
            adminPass.value = "";
        } catch (error) {
            console.error('Error:', error);
            show_error(adminError, error.message, 'adminPassword', 'adminName', null, true);
        }

    })

    function check_password(password) {
        return /^[a-zA-Z0-9]+$/.test(password);
    }

    newAccForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const enteredUsername = usernameInput.value.trim();
        const enteredName = nameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        if(!enteredUsername || !enteredName || !enteredPassword) {
            show_error(usernameError, "Enter the required fields before submitting.", 'new-pass', 'new-user', 'new-name', true);
            return;
        }

        if(enteredUsername.includes(' ')) {
            show_error(usernameError, "Ensure username doesn't have any spaces.", 'new-pass', 'new-user', 'new-name', true);
            return;
        }
        
        if (!check_password(enteredPassword)) {
            show_error(usernameInput, usernameError, "Password must contain only alphanumeric characters!");
            return;
        }

        try {
            const response = await fetch('/api/auth/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: enteredUsername, name: enteredName, password: enteredPassword }),
            });
            
            if(!response.ok) throw new Error ('Invalid credentials. Please try again.');
            alert('Account Created Successfully! Please Login to Continue.');
            window.location.replace('/internal/welcome');

        } catch (err) {
            console.error('Error:', err);
            show_error(usernameError, "An error occurred during login. Please try again later.", 'new-pass', 'new-user');
        }

    });
}