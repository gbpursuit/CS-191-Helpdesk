// login.js

/*
click - User clicks an element - Buttons, links, and interactive elements
submit - Form submission is initiated - Forms, to validate or handle submission with JS
DOMContentLoaded - Initial HTML is fully loaded and parsed - Ensuring DOM is ready before running scripts
*/

document.addEventListener("DOMContentLoaded", function() {
    const password = document.getElementById('forgotPassword');
    const forgot = document.getElementById('forgotContainer');

    password.addEventListener('submit', function(event){
        event.preventDefault();
        loginContainer.remove();
        header.remove();
        forgot.classList.remove('forgot-container');
        forgot.style.display = visible;
    })


    const loginContainer = document.getElementById('loginContainer');
    const setup = document.getElementById('newSetup'); // Use `sideBar` here
    const header = document.querySelector('h2');

    

    loginContainer.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Remove the login form and header
        loginContainer.remove();
        header.remove();

        // Show the sidebar content
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
