import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", function() {

    function showError(input, errorElement, message) {
        errorElement.style.display = 'block';
        errorElement.textContent = message;
        input.classList.add('error');
    }

    function forgotPasswordLink() {
        const passwordLink = document.getElementById('forgotPassword');
        const forgotContainer = document.getElementById('forgotContainer');
        const login = document.getElementById('login');

        passwordLink.addEventListener('click', function(event) {
            event.preventDefault();
            login.style.display = 'none';
            forgotContainer.style.visibility = 'visible';
        });
    }

    function handleLogin() {
        const loginContainer = document.getElementById('loginContainer');
        const usernameInput = document.getElementById('username');
        const usernameError = document.getElementById('usernameError');
        const validUsernames = ["Lorraine Castrillon", "Weng Castrillon", "Gavril Coronel", "Marcus Pilapil"]; // Predefined usernames

        /* ========= LOGIN FORM SUBMISSION ========= */
        loginContainer.addEventListener('submit', function(event) {
            event.preventDefault();

            const enteredUsername = usernameInput.value.trim();

            if (!validUsernames.includes(enteredUsername)) {
                showError(usernameInput, usernameError, "Invalid username or password. Please try again.");
                return;
            }
            window.location.href = "/internal/dashboard.html";
        });

        forgotPasswordLink();
    }

    // Initialize login and UI functions
    handleLogin();
    UI.handle_darkmode('.d-mode');

});


            // Update the user info on the page
            // function updateUserInfo(user) {
            //     document.getElementById("userFullName").textContent = user;
            //     document.getElementById("pagename").textContent = user;
            // }

            // updateUserInfo(enteredUsername);
            // const audio = new Audio('audio.mp3'); // Replace with your audio file path
            // audio.loop = true; // Make the audio loop
            // audio.autoplay = true; // Auto-play the audio when the page loads

    /* ========= TOPBAR RESIZE ========= */
    // window.addEventListener('resize', function() {
    //     if (window.innerWidth < 768) {
    //       dashContainer.style.marginTop = '400px';
    //     } 
    //   });
      
    /*
    let currentPage = 1;
    const rowsPerPage = 10; // Adjust as needed for the number of tasks displayed per page

    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            displayTablePage(currentPage);
        }
    }

    function goToNextPage() {
        const totalRows = document.querySelectorAll("#taskTableBody tr").length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayTablePage(currentPage);
        }
    }

    function displayTablePage(page) {
        const rows = document.querySelectorAll("#taskTableBody tr");
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        rows.forEach((row, index) => {
            row.style.display = index >= start && index < end ? "table-row" : "none";
        });

        document.getElementById("currentPage").textContent = page; // Update page indicator
    }
    */