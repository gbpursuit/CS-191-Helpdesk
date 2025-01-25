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
        const dashElements = {
            dashTitle: document.getElementById('dashTitle'),
            dashContainer: document.getElementById('dashboardContainer'),
            taskTable: document.querySelector('.task-table'),
            searchAndTask: document.querySelector('.fixed-head')
        };

        dashElements.dashTitle.innerText = "IT Management - Dashboard";
        dashElements.dashContainer.style.display = 'block';
        dashElements.taskTable.style.display = 'table';
        dashElements.searchAndTask.style.display = 'block';
    }

    function getFieldValue(id) {
        let value = document.getElementById(id).value;
        return value.trim() ? value : "--";
    }

    function modal_handling() {
        const taskModal = document.getElementById('taskModal');
        const currentDate = new Date().toISOString().split('T')[0];
        const topbar = document.getElementById('topbar');
        const pop = document.querySelector('.notification-popup');
        const closeButton = document.querySelector('.close');

        const taskInfoModal = document.getElementById('taskInfoModal');
        const closeTaskButton = document.querySelector('.close-task');
        

        function generateUniqueId() {
            return Array.from({ length: 4 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
        }

        window.openModal = function () {
            taskModal.style.display = "flex";
            document.getElementById('taskDate').value = currentDate;

            const taskIdInput = document.getElementById('taskId');
            if (taskIdInput) {
                taskIdInput.value = generateUniqueId();
            }
        };

        window.addTask = (event) => {
            event.preventDefault();

            const taskData = {
                taskId: document.getElementById('taskId').value,
                taskStatus: getFieldValue("taskStatus"),
                taskDate: currentDate,
                itInCharge: getFieldValue("itInCharge"),
                taskType: getFieldValue("taskType"),
                taskDescription: getFieldValue("taskDescription"),
                severity: getFieldValue("severity"),
                requestedBy: getFieldValue("requestedBy"),
                approvedBy: getFieldValue("approvedBy"),
                dateReq: getFieldValue("dateReq"),
                dateRec: getFieldValue("dateRec"),
                dateStart: getFieldValue("dateStart"),
                dateFin: getFieldValue("dateFin")
            };

            const tableBody = document.getElementById("taskTableBody");
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${taskData.taskId}</td>
                <td>${taskData.taskStatus}</td>
                <td>${taskData.taskDate}</td>
                <td>${taskData.itInCharge}</td>
                <td>${taskData.taskType}</td>
                <td>${taskData.taskDescription}</td>
                <td>${taskData.severity}</td>
                <td>${taskData.requestedBy}</td>
                <td>${taskData.approvedBy}</td>
                <td>${taskData.dateReq}</td>
                <td>${taskData.dateRec}</td>
                <td>${taskData.dateStart}</td>
                <td>${taskData.dateFin}</td>
            `;

            newRow.addEventListener('click', () => openTaskInfoModal(taskData));
            tableBody.appendChild(newRow);
            UI.closeModal('taskModal', true);
        };

        function openTaskInfoModal(taskData) {
            const taskInfoContent = document.getElementById('taskInfoContent');
            taskInfoContent.innerHTML = `
                <table class="task-info-table">
                    <tr>
                        <td><strong>Task ID:</strong></td>
                        <td>${taskData.taskId}</td>
                        <td><strong>Status:</strong></td>
                        <td>${taskData.taskStatus}</td>
                    </tr>
                    <tr>
                        <td><strong>Transaction Date:</strong></td>
                        <td>${taskData.taskDate}</td>
                        <td><strong>IT In Charge:</strong></td>
                        <td>${taskData.itInCharge}</td>
                    </tr>
                    <tr>
                        <td><strong>Task Type:</strong></td>
                        <td>${taskData.taskType}</td>
                        <td><strong>Task Description:</strong></td>
                        <td>${taskData.taskDescription}</td>
                    </tr>
                    <tr>
                        <td><strong>Severity:</strong></td>
                        <td>${taskData.severity}</td>
                        <td><strong>Requested By:</strong></td>
                        <td>${taskData.requestedBy}</td>
                    </tr>
                    <tr>
                        <td><strong>Approved By:</strong></td>
                        <td>${taskData.approvedBy}</td>
                        <td><strong>Department:</strong></td>
                        <td>${taskData.department || "--"}</td>
                    </tr>
                    <tr>
                        <td><strong>Department No:</strong></td>
                        <td>${taskData.departmentNo || "--"}</td>
                        <td><strong>Device Name:</strong></td>
                        <td>${taskData.deviceName || "--"}</td>
                    </tr>
                    <tr>
                        <td><strong>Item Name:</strong></td>
                        <td>${taskData.itemName || "--"}</td>
                        <td><strong>Application Name:</strong></td>
                        <td>${taskData.applicationName || "--"}</td>
                    </tr>
                    <tr>
                        <td><strong>Date Requested:</strong></td>
                        <td>${taskData.dateReq}</td>
                        <td><strong>Date Received:</strong></td>
                        <td>${taskData.dateRec}</td>
                    </tr>
                    <tr>
                        <td><strong>Date Started:</strong></td>
                        <td>${taskData.dateStart}</td>
                        <td><strong>Date Finished:</strong></td>
                        <td>${taskData.dateFin}</td>
                    </tr>
                </table>
            `;
            taskInfoModal.style.display = "flex";
        }
            
        taskModal.addEventListener('click', (event) => UI.closeOutsideModal(event, 'modalContent', 'taskModal'));
        pop.addEventListener('click', (event) => UI.closeOutsideModal(event, 'popupContent', 'notificationPopup'));
        topbar.addEventListener('click', (event) => UI.closeOutsideModal(event, 'modalContent', 'taskModal'));

        if (closeButton) closeButton.addEventListener('click', () => UI.closeModal('taskModal', true));
        if (closeTaskButton) {
            closeTaskButton.addEventListener('click', () => {
                taskInfoModal.style.display = "none"; // Hide the modal
            });
        }

    }

    // UI Actions
    UI.handle_darkmode(".toggle-switch");
    UI.page_navigation("summary", "/internal/summary.html")
    UI.notificationPop();
    UI.dropdownToggle();
    UI.handleSidebarState();

    // Call Functions
    dashboard_open();
    modal_handling();
    
});
