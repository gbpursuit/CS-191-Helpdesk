// login.js

/*
click - User clicks an element - Buttons, links, and interactive elements
submit - Form submission is initiated - Forms, to validate or handle submission with JS
DOMContentLoaded - Initial HTML is fully loaded and parsed - Ensuring DOM is ready before running scripts
*/

document.addEventListener("DOMContentLoaded", function() {
    const toggleSwitch = document.querySelector(".toggle-switch");
    const body = document.body;

    // Toggle dark mode
    toggleSwitch.addEventListener('click', function() {
        body.classList.toggle("dark-mode");
    });

    const loginSwitch = document.querySelector(".dark-mode");
    loginSwitch.addEventListener('click', function() {
        body.classList.toggle("dark-mode");
    });

    const password = document.getElementById('forgotPassword');
    const forgot = document.getElementById('forgotContainer');
    const login = document.getElementById('login');
    const loginContainer = document.getElementById('loginContainer');
    const setup = document.getElementById('newSetup'); // Sidebar container
    const dashboardContainer = document.getElementById('dashboardContainer'); // Dashboard container
    const topBar = document.querySelector('.top-bar'); // Top bar

    // Initially hide the dashboard and sidebar
    setup.style.display = 'none';
    dashboardContainer.style.display = 'none';
    topBar.style.display = 'none';

    // Show the forgot password form when "Forgot password?" is clicked
    password.addEventListener('click', function(event){
        event.preventDefault();
        login.style.display = 'none';
        forgot.style.visibility = 'visible';
    });

    // Handle the login form submission
    loginContainer.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Here you can add validation or authentication checks

        // Hide the login form and show the dashboard and sidebar
        login.style.display = 'none';
        forgot.style.display = 'none';
        dashboardContainer.style.display = 'block';
        setup.style.display = 'block';
        topBar.style.display = 'flex'; // Show the top bar after login

        /*
        // Get the input values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Here you can handle what happens when the form is submitted
        console.log('Username:', username);
        console.log('Password:', password);

        // Example for sending login credentials to a server
        fetch('/your-login-endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => {
            if (response.ok) {
                // On successful login
                login.style.display = 'none';
                dashboardContainer.style.display = 'block';
                setup.style.display = 'block';
                console.log('Login successful!');
            } else {
                // Handle login failure
                console.log('Login failed!');
            }
        })
        .catch(error => console.error('Error:', error));
        */
    });
});