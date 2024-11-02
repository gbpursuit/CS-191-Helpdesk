// login.js

/*
click - User clicks an element - Buttons, links, and interactive elements
submit - Form submission is initiated - Forms, to validate or handle submission with JS
DOMContentLoaded - Initial HTML is fully loaded and parsed - Ensuring DOM is ready before running scripts
*/

document.addEventListener("DOMContentLoaded", function() {
    const loginContainer = document.getElementById('loginContainer');
    const postLoginContent = document.getElementById('postLoginContent');
    const header = document.querySelector('h2');

    loginContainer.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Remove the login form completely
        loginContainer.remove(); // This removes the entire login form
        header.remove();

        // Show the post-login content
        postLoginContent.classList.remove('hidden'); // This shows the content after login
        // postLoginContent.style.display = 'flex';
        /*
        // Get the input values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Here you can handle what happens when the form is submitted
        console.log('Username:', username);
        console.log('Password:', password);

        // You can add your logic here, such as sending the data to a server
        // For example, using fetch to send a POST request:
        
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
