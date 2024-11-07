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
    const loginNew = document.getElementById('loginToNew');
    const taskModal = document.getElementById("taskModal");

    // Initial setup
    loginNew.style.display = 'none';
    taskModal.style.display = 'none';

    // Handle the login form submission
    loginContainer.addEventListener('submit', function(event) {
        event.preventDefault(); 

        login.style.display = 'none';
        forgot.style.display = 'none';
        loginNew.style.display = 'block';

        const enterName = document.getElementById('username').value;
        
        function updateUserInfo(user) {
            document.getElementById("userFullName").textContent = user
            document.getElementById("pagename").textContent = user
        }
        
        updateUserInfo(enterName);
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

    // Open modal
    window.openModal = function() {
        taskModal.style.display = "flex";
    };

    // Close modal
    window.closeModal = function() {
        taskModal.style.display = "none";
    };

    // Add task to table
    window.addTask = function(event) {
        event.preventDefault();
        
        // Get values from the form fields
        const taskStatus = document.getElementById("taskStatus").value;
        const taskDate = document.getElementById("taskDate").value;
        const itInCharge = document.getElementById("itInCharge").value;
        const taskType = document.getElementById("taskType").value;
        const taskDescription = document.getElementById("taskDescription").value;
        const severity = document.getElementById("severity").value;
        const requestedBy = document.getElementById("requestedBy").value;
        const approvedBy = document.getElementById("approvedBy").value;
        const dateReq = document.getElementById("dateReq").value;
        const dateRec = document.getElementById("dateRec").value;
        const dateStart = document.getElementById("dateStart").value;
        const dateFin = document.getElementById("dateFin").value;
        
        // Create a new row
        const tableBody = document.getElementById("taskTableBody"); // Ensure <tbody id="taskTableBody"> is in the HTML
        const newRow = document.createElement("tr");
        
        newRow.innerHTML = `
            <td>${taskStatus}</td>
            <td>${taskDate}</td>
            <td>${itInCharge}</td>
            <td>${taskType}</td>
            <td>${taskDescription}</td>
            <td>${severity}</td>
            <td>${requestedBy}</td>
            <td>${approvedBy}</td>
            <td>${dateReq}</td>
            <td>${dateRec}</td>
            <td>${dateStart}</td>
            <td>${dateFin}</td>
        `;
        
        // Append the new row to the table
        tableBody.appendChild(newRow);
        
        // Close the modal and reset the form
        closeModal();
        document.getElementById("newTaskForm").reset();
    };

    // Notification Pop-up
    const notificationPopup = document.getElementById("notificationPopup");

    // Function to open the notification pop-up
    window.openNotificationPopup = function() {
        notificationPopup.style.display = "block";
    };

    // Function to close the notification pop-up
    window.closeNotificationPopup = function() {
        notificationPopup.style.display = "none";
    };

    // Close the notification pop-up if clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === notificationPopup) {
            closeNotificationPopup();
        }
    });

    // Dropdown toggle for user profile
    const logoutButton = document.querySelector(".logout-btn");
    const dropdownMenu = document.getElementById("dropdownMenu");

    logoutButton.addEventListener("click", function(event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle("show");
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", function(event) {
        if (!dropdownMenu.contains(event.target) && !logoutButton.contains(event.target)) {
            dropdownMenu.classList.remove("show");
        }
    });

    // Logout function
    window.logout = function() {
        loginNew.style.display = "none";
        login.style.display = "block";
    };
    
});