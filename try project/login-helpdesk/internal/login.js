document.addEventListener("DOMContentLoaded", function() {

    // need logic to check if nakalogin na -- backend ata 

    function handleDarkModeToggle() {
        /* ========= DARK MODE TOGGLE ========= */
        const toggleSwitch = document.querySelector(".toggle-switch");
        const loginSwitch = document.querySelector(".dark-mode");
        const body = document.body;

        toggleSwitch.addEventListener('click', function(event){
            event.preventDefault();
            body.classList.toggle("dark-mode");
        })

        loginSwitch.addEventListener('click', function(event){
            event.preventDefault();
            body.classList.toggle("dark-mode");
        });
    }

    function handleLogin() {
        /* ========= ELEMENT SELECTION ========= */
        const login = document.getElementById('login');
        const loginContainer = document.getElementById('loginContainer');
        const loginNew = document.getElementById('loginToNew');
        const taskModal = document.getElementById("taskModal");
        const dashElements = document.getElementById('dashElements');
        const usernameInput = document.getElementById('username');
        const usernameError = document.getElementById('usernameError'); 
        const validUsernames = ["Lorraine Castrillon", "Weng Castrillon", "Gavril Coronel", "Marcus Pilapil"];  // Predefined usernames

        // Initial UI Setup
        loginNew.style.display = 'none';
        taskModal.style.display = 'none';

        /* ========= LOGIN & USER PAGE NAVIGATION ========= */
        loginContainer.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const enteredUsername = usernameInput.value.trim();  // Get the entered username

            // Validate the entered username
            if (!validUsernames.includes(enteredUsername)) {
                usernameError.style.display = 'block';
                // Show error message if the username is invalid
                usernameError.textContent = "Invalid username or password. Please try again.";
                usernameInput.classList.add('error'); 
                return; 
            }

            // If the username is valid, proceed with the login flow
            usernameError.textContent = ""; 
            usernameInput.classList.remove('error'); 

            dashTitle.innerText = "IT Management - Dashboard";
            login.style.display = 'none';
            forgot.style.display = 'none';
            loginNew.style.display = 'block';
            dashElements.style.display = 'block';

            // Update the user info on the page
            function updateUserInfo(user) {
                document.getElementById("userFullName").textContent = user;
                document.getElementById("pagename").textContent = user;
            }

            updateUserInfo(enteredUsername);
            // const audio = new Audio('audio.mp3'); // Replace with your audio file path
            // audio.loop = true; // Make the audio loop
            // audio.autoplay = true; // Auto-play the audio when the page loads
        });

        /* ========= FORGOT PASSWORD ========= */
        const passwordLink = document.getElementById('forgotPassword');
        const forgot = document.getElementById('forgotContainer');

        passwordLink.addEventListener('click', function(event){
            event.preventDefault();
            login.style.display = 'none';
            forgot.style.visibility = 'visible';
        });

    }

    function handleDashBoard() {
        /* ========= DASHBOARD NAVIGATION ========= */
        const headerBar = document.getElementById('headerbar');
        const dashboard = document.getElementById('dashboard');
        const summary = document.getElementById('summary');
        const dashTitle = document.getElementById('dashTitle');
        const dashContainer = document.getElementById('dashboardContainer');
        const taskTable = document.querySelector('.task-table');
        const searchAndTask = document.querySelector('.fixed-head');
        
        const topbar = document.getElementById('topbar');
        const sidebar = document.getElementById('sidebar');

        const logoutButton = document.querySelector(".logout-btn");
        const dropdownMenu = document.getElementById("dropdownMenu");
        const profile = document.querySelector(".user-profile");        

        let modalcheck = false;
        
        function dashBoardclick(event){
            event.preventDefault();
            dashTitle.innerText = "IT Management - Dashboard";
            dashContainer.style.display = 'block';
        
            taskTable.style.display = 'table';
            searchAndTask.style.display = 'block';
            dashElements.style.display = 'block';
        }

        dashboard.addEventListener('click', dashBoardclick);
        headerBar.addEventListener('click', dashBoardclick);

        summary.addEventListener('click', function(event){
            event.preventDefault();

            dashTitle.innerText = "IT Summary";
            dashContainer.style.display = 'block';
        
            taskTable.style.display = 'none';
            searchAndTask.style.display = 'none';
            dashElements.style.display = 'block';
        });

        /* ========= MODAL HANDLING ========= */
        const form = document.getElementById('newTaskForm')
        const currentDate = new Date().toISOString().split('T')[0];

        function toggleDropdown(event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle("show");
        }

        function getFieldValue(id) {
            let value = document.getElementById(id).value;
            return value.trim() ? value : "--";
        }

        function closeOutsideModal(event) {
            const modalcontent = document.querySelector(".modal-content");
            if (event) {
                console.log("Event target:", event.target);
        
                if (event.target != modalcontent && modalcheck) {
                    closeModal();
                }
            }
        }

        taskModal.addEventListener('click', closeOutsideModal);
        topbar.addEventListener('click', closeOutsideModal);
        profile.addEventListener('click', closeOutsideModal);

        window.openModal = function() {
            modalcheck = true;
            console.log("hello");
            taskModal.style.display = "flex";
            document.getElementById('taskDate').value = currentDate;
        };

        window.closeModal = function() {
            modalcheck = false;
            taskModal.style.display = "none";
            form.reset()
        };

        /* ========= ADD TASK TO TABLE ========= -> need ata tong naka backend na para nakastore every time nagaadd ng task*/ 
        window.addTask = function(event) {
            event.preventDefault();

            let taskStatus = getFieldValue("taskStatus");
            let taskDate = currentDate;  
            let itInCharge = getFieldValue("itInCharge");
            let taskType = getFieldValue("taskType");
            let taskDescription = getFieldValue("taskDescription");
            let severity = getFieldValue("severity");
            let requestedBy = getFieldValue("requestedBy");
            let approvedBy = getFieldValue("approvedBy");
            let dateReq = getFieldValue("dateReq");
            let dateRec = getFieldValue("dateRec");
            let dateStart = getFieldValue("dateStart");
            let dateFin = getFieldValue("dateFin");

            // Create a new row in the table
            let tableBody = document.getElementById("taskTableBody");
            let newRow = document.createElement("tr");

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
        };

        /* ========= NOTIFICATION POP-UP ========= */
        const notificationPopup = document.getElementById("notificationPopup");

        window.openNotificationPopup = function() {
            notificationPopup.style.display = "block";
        };

        window.closeNotificationPopup = function() {
            notificationPopup.style.display = "none";
        };

        /* ========= DROPDOWN TOGGLE ========= */
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
    }

    handleDarkModeToggle();
    handleLogin();
    handleDashBoard();

});



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