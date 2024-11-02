// login.js

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        
        // Get the input values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Here you can handle what happens when the form is submitted
        console.log('Username:', username);
        console.log('Password:', password);

        // You can add your logic here, such as sending the data to a server
        // For example, using fetch to send a POST request:
        /*
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
