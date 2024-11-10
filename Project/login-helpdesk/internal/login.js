document.addEventListener("DOMContentLoaded", function() {

    /* ========= DARK MODE TOGGLE ========= */
    const toggleSwitch = document.querySelector(".toggle-switch");
    const loginSwitch = document.querySelector(".dark-mode");
    const body = document.body;

    function darkmode(event){
        event.preventDefault();
        body.classList.toggle("dark-mode");
    }

    toggleSwitch.addEventListener("click", darkmode);
    loginSwitch.addEventListener("click", darkmode);

    /* ========= ELEMENT SELECTION ========= */
    const login = document.getElementById('login');
    const loginContainer = document.getElementById('loginContainer');
    const loginNew = document.getElementById('loginToNew');
    const taskModal = document.getElementById("taskModal");
    const dashElements = document.getElementById('dashElements');

    // Initial UI Setup
    loginNew.style.display = 'none';
    taskModal.style.display = 'none';

    /* ========= LOGIN & USER PAGE NAVIGATION ========= */
    loginContainer.addEventListener('submit', function(event) {
        event.preventDefault(); 
        login.style.display = 'none';
        forgot.style.display = 'none';
        loginNew.style.display = 'block';
        dashElements.style.display = 'none';

        const enterName = document.getElementById('username').value;
        
        function updateUserInfo(user) {
            document.getElementById("userFullName").textContent = user;
            document.getElementById("pagename").textContent = user;
        }
        
        updateUserInfo(enterName);
        // const audio = new Audio('audio.mp3'); // Replace with your audio file path
        // audio.loop = true; // Make the audio loop
        // audio.autoplay = true; // Auto-play the audio when the page loads
    });

    /* ========= FORGOT PASSWORD ========= */
    const password = document.getElementById('forgotPassword');
    const forgot = document.getElementById('forgotContainer');

    password.addEventListener('click', function(event){
        event.preventDefault();
        login.style.display = 'none';
        forgot.style.visibility = 'visible';
    });

    /* ========= DASHBOARD NAVIGATION ========= */
    const headerBar = document.getElementById('headerbar');
    const dashboard = document.getElementById('dashboard');
    const summary = document.getElementById('summary');
    const dashTitle = document.getElementById('dashTitle');
    const dashContainer = document.getElementById('dashboardContainer');
    const taskTable = document.querySelector('.task-table');
    const searchAndTask = document.querySelector('.fixed-head');

    summary.addEventListener('click', function(event){
        event.preventDefault();
        dashTitle.innerText = "IT Summary";
        dashContainer.style.display = 'block';
    
        taskTable.style.display = 'none';
        searchAndTask.style.display = 'none';
        dashElements.style.display = 'block';
    });
    
    dashboard.addEventListener('click', function(event){
        event.preventDefault();
        dashTitle.innerText = "IT Dashboard";
        dashContainer.style.display = 'block';
    
        taskTable.style.display = 'block';
        searchAndTask.style.display = 'block';
        dashElements.style.display = 'block';
    });
    
    headerBar.addEventListener('click', function(event){
        event.preventDefault();
        dashTitle.innerText = 'IT Management - Helpdesk';
        dashContainer.style.display = 'block';

        dashElements.style.display = 'none';
        taskTable.style.display = 'none';
        searchAndTask.style.display = 'none';
    });

    /* ========= MODAL HANDLING ========= */
    window.openModal = function() {
        taskModal.style.display = "flex";
    };

    window.closeModal = function() {
        taskModal.style.display = "none";
    };

    /* ========= ADD TASK TO TABLE ========= */
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

        // Create a new row in the table
        const tableBody = document.getElementById("taskTableBody");
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
        
        tableBody.appendChild(newRow);
        closeModal();
        document.getElementById("newTaskForm").reset();
    };

    /* ========= NOTIFICATION POP-UP ========= */
    const notificationPopup = document.getElementById("notificationPopup");

    window.openNotificationPopup = function() {
        notificationPopup.style.display = "block";
    };

    window.closeNotificationPopup = function() {
        notificationPopup.style.display = "none";
    };

    window.addEventListener('click', function(event) {
        if (event.target === notificationPopup) {
            closeNotificationPopup();
        }
    });

    /* ========= DROPDOWN TOGGLE ========= */
    const logoutButton = document.querySelector(".logout-btn");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const profile = document.querySelector(".user-profile");
    
    function toggleDropdown(event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle("show");
    }
    
    logoutButton.addEventListener("click", toggleDropdown);
    profile.addEventListener("click", toggleDropdown);

    document.addEventListener("click", function(event) {
        if (!dropdownMenu.contains(event.target) && !logoutButton.contains(event.target)) {
            dropdownMenu.classList.remove("show");
        }
    });

    /* ========= LOGOUT FUNCTION ========= */
    window.logout = function() {
        location.reload();
    };

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

});