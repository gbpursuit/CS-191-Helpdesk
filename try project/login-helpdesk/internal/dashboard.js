// document.addEventListener("DOMContentLoaded", function(){

//     /* ========= DARK MODE TOGGLE ========= */
//     function handleDarkModeToggle() {
//         const toggleSwitch = document.querySelector(".toggle-switch")
//         const body = document.body;

//         toggleSwitch.addEventListener('click', function(event){
//             event.preventDefault();
//             body.classList.toggle("toggle-switch");
//         })
//     }

//     function handleDashBoard() {
        
//         /* ========= DASHBOARD NAVIGATION ========= */
//         const headerBar = document.getElementById('headerbar');
//         const dashboard = document.getElementById('dashboard');
//         const dashTitle = document.getElementById('dashTitle');
//         const dashContainer = document.getElementById('dashboardContainer');
//         const dashElements = document.getElementById('dashElements');
//         const taskTable = document.querySelector('.task-table');
//         const searchAndTask = document.querySelector('.fixed-head');  

//         let modalcheck = false;
        
//         function dashBoardclick(event){
//             event.preventDefault();
//             dashTitle.innerText = "IT Management - Dashboard";
//             dashContainer.style.display = 'block';
        
//             taskTable.style.display = 'table';
//             searchAndTask.style.display = 'block';
//             dashElements.style.display = 'block';
//         }

//         dashboard.addEventListener('click', dashBoardclick);
//         headerBar.addEventListener('click', dashBoardclick);

//         summary.addEventListener('click', function() {
//             window.location.href = "/internal/summary.html";
//         })

//         /* ========= MODAL HANDLING ========= */
//         const form = document.getElementById('newTaskForm')
//         const currentDate = new Date().toISOString().split('T')[0];
//         const dropdownMenu = document.getElementById("dropdownMenu");

//         function toggleDropdown(event) {
//             event.stopPropagation();
//             dropdownMenu.classList.toggle("show");
//         }

//         function getFieldValue(id) {
//             let value = document.getElementById(id).value;
//             return value.trim() ? value : "--";
//         }

//         // function checkStatus(status) {
            
//         // }

//         const topbar = document.getElementById('topbar');
//         const logoutButton = document.querySelector(".logout-btn");
//         const profile = document.querySelector(".user-profile"); 
//         const taskModal = document.getElementById('taskModal'); 

//         function closeOutsideModal(event) {
//             const modalcontent = document.querySelector(".modal-content");
//             if (event) {
//                 console.log("Event target:", event.target);
        
//                 if (event.target != modalcontent && modalcheck) {
//                     closeModal();
//                 }
//             }
//         }

//         taskModal.addEventListener('click', closeOutsideModal);
//         topbar.addEventListener('click', closeOutsideModal);
//         profile.addEventListener('click', closeOutsideModal);

//         window.openModal = function() {
//             modalcheck = true;
//             console.log("hello");
//             taskModal.style.display = "flex";
//             document.getElementById('taskDate').value = currentDate;
//         };

//         window.closeModal = function() {
//             modalcheck = false;
//             taskModal.style.display = "none";
//             form.reset()
//         };

//         /* ========= ADD TASK TO TABLE ========= -> need ata tong naka backend na para nakastore every time nagaadd ng task*/ 
//         window.addTask = function(event) {
//             event.preventDefault();
//             const greenCircleEmoji = "🟢";

//             let taskStatus = greenCircleEmoji + getFieldValue("taskStatus");
//             let taskDate = currentDate;  
//             let itInCharge = getFieldValue("itInCharge");
//             let taskType = getFieldValue("taskType");
//             let taskDescription = getFieldValue("taskDescription");
//             let severity = getFieldValue("severity");
//             let requestedBy = getFieldValue("requestedBy");
//             let approvedBy = getFieldValue("approvedBy");
//             let dateReq = getFieldValue("dateReq");
//             let dateRec = getFieldValue("dateRec");
//             let dateStart = getFieldValue("dateStart");
//             let dateFin = getFieldValue("dateFin");

//             // Create a new row in the table
//             let tableBody = document.getElementById("taskTableBody");
//             let newRow = document.createElement("tr");

//             newRow.innerHTML = `
//                 <td>${taskStatus}</td>
//                 <td>${taskDate}</td>
//                 <td>${itInCharge}</td>
//                 <td>${taskType}</td>
//                 <td>${taskDescription}</td>
//                 <td>${severity}</td>
//                 <td>${requestedBy}</td>
//                 <td>${approvedBy}</td>
//                 <td>${dateReq}</td>
//                 <td>${dateRec}</td>
//                 <td>${dateStart}</td>
//                 <td>${dateFin}</td>
//             `;
            
//             tableBody.appendChild(newRow);
//             closeModal();
//         };

//         /* ========= NOTIFICATION POP-UP ========= */
//         const notificationPopup = document.getElementById("notificationPopup");

//         window.openNotificationPopup = function() {
//             notificationPopup.style.display = "block";
//         };

//         window.closeNotificationPopup = function() {
//             notificationPopup.style.display = "none";
//         };

//         /* ========= DROPDOWN TOGGLE ========= */
//         logoutButton.addEventListener("click", toggleDropdown);
//         profile.addEventListener("click", toggleDropdown);

//         document.addEventListener("click", function(event) {
//             if (!dropdownMenu.contains(event.target) && !logoutButton.contains(event.target)) {
//                 dropdownMenu.classList.remove("show");
//             }
//         });

//         /* ========= LOGOUT FUNCTION ========= */
//         window.logout = function() {
//             window.location.href = "/internal/login.html";
//         };
//     }

//     handleDarkModeToggle();
//     handleDashBoard();
// })

import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", function () {

    function dashboard_open() {
        const dashTitle = document.getElementById('dashTitle');
        const dashContainer = document.getElementById('dashboardContainer');
        const taskTable = document.querySelector('.task-table');
        const searchAndTask = document.querySelector('.fixed-head');

        dashTitle.innerText = "IT Management - Dashboard";
        dashContainer.style.display = 'block';
        taskTable.style.display = 'table';
        searchAndTask.style.display = 'block';
    }

    function modal_handling() {
        const taskModal = document.getElementById('taskModal');
        const form = document.getElementById('newTaskForm');
        const currentDate = new Date().toISOString().split('T')[0];

        window.openModal = function () {
            taskModal.style.display = "flex";
            document.getElementById('taskDate').value = currentDate;
        };

        window.closeModal = function () {
            taskModal.style.display = "none";
            form.reset();
        };

        // Add task example
        window.addTask = function (event) {
            event.preventDefault();
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
        };

    }

    const taskModal = document.getElementById('taskModal');
    function closeOutsideModal(event) {
        const modalcontent = document.querySelector(".modal-content");
        if (event) {
            console.log("Event target:", event.target);
    
            if (event.target != modalcontent) {
                closeModal();
            }
        }
    }

    taskModal.addEventListener('click', closeOutsideModal);

    UI.handle_darkmode(".toggle-switch");
    UI.page_navigation("summary", "/internal/summary.html")
    UI.notificationPop();
    UI.dropdownToggle();
    dashboard_open();
    modal_handling();
    
});
