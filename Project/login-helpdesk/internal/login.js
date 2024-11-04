// login.js

/*
click - User clicks an element - Buttons, links, and interactive elements
submit - Form submission is initiated - Forms, to validate or handle submission with JS
DOMContentLoaded - Initial HTML is fully loaded and parsed - Ensuring DOM is ready before running scripts
*/

document.addEventListener("DOMContentLoaded", function() {
    const toggleSwitch = document.querySelector(".toggle-switch");
    const body = document.body;

    toggleSwitch.addEventListener('click', function() {
        body.classList.toggle("dark-mode");
    })

    const loginSwitch = document.querySelector(".dark-mode");

    loginSwitch.addEventListener('click', function() {
        body.classList.toggle("dark-mode");
    })

    const password = document.getElementById('forgotPassword');
    const forgot = document.getElementById('forgotContainer');
    const login = document.getElementById('login');
    const setup = document.getElementById('newSetup'); // Use `sideBar` here

    password.addEventListener('click', function(event){
        event.preventDefault();
        login.remove();
        forgot.classList.remove('forgot-container');
        forgot.style.visibility = 'visible';
    })

    loginContainer.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        login.remove();
        setup.classList.remove('newSetup'); 
        setup.style.visibility = 'visible';

        /*
        // Get the input values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Here you can handle what happens when the form is submitted
        console.log('Username:', username);
        console.log('Password:', password);

        example lang to
        
        fetch('/your-login-endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => {
            if (response.ok) {
                // Handle success
                console.log('Login successful!');
            } else {
                // Handle error
                console.log('Login failed!');
            }
        })
        .catch(error => console.error('Error:', error));
        */
    });
});

