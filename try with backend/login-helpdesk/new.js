import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", async function () {

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
    
    const taskInfoModal = document.getElementById('taskInfoModal');
    
    async function openTaskInfoModal(taskData) {
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

    async function loadTasks(taskData) {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();
            const tableBody = document.getElementById("taskTableBody");

            console.log(taskData);

            tableBody.innerHTML = ""; 

            tasks.forEach(task => {
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
                newRow.addEventListener('click', async function(event) {
                    event.preventDefault();
                    console.log('helloooooooooooooooooooossss');
                    await openTaskInfoModal(taskData); 
                    console.log('helloooooooooooooooooooossss5743583476');
                 });
                tableBody.appendChild(newRow);
            });

        } catch (err) {
            console.error('Error loading tasks:', err);
        }
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

        // View Task Content
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

        window.addTask = async (event) => {
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

            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskData)
                });
        
                if (response.ok) {
                    const newTask = await response.json();
                    console.log('Task saved:', newTask);
                    await loadTasks(taskData); 
                    UI.closeModal('taskModal', true);
                } else {
                    console.error('Failed to save task');
                }
            } catch (err) {
                console.error('Error submitting task:', err);
            }

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

            // newRow.addEventListener('click', function(event) {
            //    event.preventDefault();
            //    console.log('helloooooooooooooooooooo');
            //    openTaskInfoModal(taskData); 
            // });
            tableBody.appendChild(newRow);
            UI.closeModal('taskModal', true);
        };
//       
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
    UI.page_navigation("summary", "/internal/summary")
    UI.notificationPop();
    UI.dropdownToggle();
    UI.handleSidebarState();
    await UI.reflectUsername();

    // Call Functions
    dashboard_open();
    modal_handling();
    await loadTasks();
    
});