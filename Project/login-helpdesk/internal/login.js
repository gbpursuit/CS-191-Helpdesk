/*
click - User clicks an element - Buttons, links, and interactive elements
submit - Form submission is initiated - Forms, to validate or handle submission with JS
DOMContentLoaded - Initial HTML is fully loaded and parsed - Ensuring DOM is ready before running scripts
*/

document.addEventListener("DOMContentLoaded", function() {

    // Dark Mode
    const toggleSwitch = document.querySelector(".toggle-switch");
    const loginSwitch = document.querySelector(".dark-mode");
    const body = document.body;

    toggleSwitch.addEventListener('click', function() {
        body.classList.toggle("dark-mode");
    });

    loginSwitch.addEventListener('click', function() {
        body.classList.toggle("dark-mode");
    });


    // Login -> User Page
    const login = document.getElementById('login');
    const loginContainer = document.getElementById('loginContainer');

    const topBar = document.getElementById('topbar'); // Top bar
    const setup = document.getElementById('newSetup'); // Sidebar container
    const mainContainer = document.getElementById('mainContainer'); // Dashboard container

    // Initial Setup
    setup.style.display = 'none'

    // Handle the login form submission
    loginContainer.addEventListener('submit', function(event) {
        event.preventDefault(); 

        login.style.display = 'none';
        forgot.style.display = 'none';
        setup.style.display = 'block'

        const userData = {
            fullName: "Gavril Coronel",
            username: "gbpursuit"
        };
        
        function updateUserInfo(user) {
            document.getElementById("userFullName").textContent = user.fullName;
            document.getElementById("pagename").textContent = user.username;
        }
        
        updateUserInfo(userData);

    });

    // Forgot Password
    const password = document.getElementById('forgotPassword');
    const forgot = document.getElementById('forgotContainer');

    // Show the forgot password form when "Forgot password?" is clicked
    password.addEventListener('click', function(event){
        event.preventDefault();
        login.style.display = 'none';
        forgot.style.visibility = 'visible';
    });

});