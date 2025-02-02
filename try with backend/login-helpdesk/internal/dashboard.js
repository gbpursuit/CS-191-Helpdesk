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


    function formatDate(date) {
        return date && date !== "null" ? date : "--";
    }        

    async function fetchTasksFromDatabase() {
        try {
            const response = await fetch('/api/tasks');
            return await response.json();
        } catch (err) {
            console.error('Error fetching tasks:', err);
            return [];
        }
    }

    async function addTaskToDatabase(taskData) {
        try {
            // console.log('addTasktoDatabase', taskData);
            const response = await fetch('/api/tasks/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            return response.ok ? await response.json() : null;
        } catch (err) {
            console.error('Error adding task:', err);
            return null;
        }
    }

    async function deleteTask(taskId) {
        if (!confirm("Are you sure you want to delete this task?")) return;
    
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.ok) {
                console.log("Task deleted successfully.");
                UI.closeModal('taskInfoModal', true); // Close the modal
                await loadTasks(); // Refresh the task list
            } else {
                console.error("Failed to delete task.");
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    }

    async function openEditModal(taskData) {
        const editModal = document.getElementById('taskEditModal');
        const editTaskForm = document.getElementById('editTaskForm');

       
        const taskFields = {
            taskId: "editTaskId",
            taskStatus: "editTaskStatus",
            taskDate: "editTaskDate",
            itInCharge: "editItInCharge",
            department: "editDepartment",
            departmentNo: "editDepartmentNo",
            taskType: "editTaskType",
            taskDescription: "editTaskDescription",
            severity: "editSeverity",
            requestedBy: "editRequestedBy",
            approvedBy: "editApprovedBy",
            itemName: "editItemName",
            deviceName: "editDeviceName",
            applicationName: "editApplicationName",
            dateReq: "editDateReq",
            dateRec: "editDateRec",
            dateStart: "editDateStart",
            dateFin: "editDateFin"
        };
        
        Object.entries(taskFields).forEach(([key, id]) => {
            document.getElementById(id).value = taskData[key] || "";
        });
    
        // Submission of Editted Task
        editTaskForm.onsubmit = async function (event) {
            event.preventDefault();
    
            const taskId = taskData.taskId;
            const formData = {
                taskDate: document.getElementById("editTaskDate").value,
                taskStatus: document.getElementById("editTaskStatus").value,
                severity: document.getElementById("editSeverity").value,
                taskType: document.getElementById("editTaskType").value,
                taskDescription: document.getElementById("editTaskDescription").value,
                itInCharge: document.getElementById("editItInCharge").value,
                department: document.getElementById("editDepartment").value,
                departmentNo: document.getElementById("editDepartmentNo").value,
                requestedBy: document.getElementById("editRequestedBy").value,
                approvedBy: document.getElementById("editApprovedBy").value,
                itemName: document.getElementById("editItemName").value,
                deviceName: document.getElementById("editDeviceName").value,
                applicationName: document.getElementById("editApplicationName").value,
                dateReq: document.getElementById("editDateReq").value,
                dateRec: document.getElementById("editDateRec").value,
                dateStart: document.getElementById("editDateStart").value,
                dateFin: document.getElementById("editDateFin").value
            };
    
            await updateTask(taskId, formData);
        };
    
        // Show the modal
        editModal.style.display = "flex";
    }
    
    // Handle submitting edited task
    async function updateTask(taskId, formData) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log("Task updated successfully:", data);
                alert("Task updated successfully!"); // Feedback to user
                location.reload(); // Reload to reflect changes
            } else {
                console.error("Error updating task:", data.error);
                alert("Error updating task: " + data.error);
            }
        } catch (error) {
            console.error("Network or server error:", error);
            alert("Network error. Please try again.");
        }
    }

    let currentPage = 1;
    const tasksPerPage = 9;

    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");

    function updatePagination(totalPages) {
        const currentPageSpan = document.getElementById("currentPage");    
        currentPageSpan.textContent = `${currentPage}`;
    
        // Enable/disable buttons based on page limits
        prevButton.disabled = (currentPage === 1);
        nextButton.disabled = (currentPage === totalPages);
    }

    function goToPreviousPage() {
        prevButton.addEventListener('click', async () => {
            if (currentPage > 1) {
                currentPage--;
                await loadTasks(); // Reload tasks for new page
            }
        })
    }
    
    function goToNextPage() {
        nextButton.addEventListener('click', async () => {
            currentPage++;
            await loadTasks(); // Reload tasks for new page
        })
    }
       
    async function loadTasks(query = null) {
        try {
            const tasks = (query) ? query : await fetchTasksFromDatabase();
            const tableBody = document.getElementById("taskTableBody");
            const totalPages = Math.ceil(tasks.length / tasksPerPage);
    
            tableBody.innerHTML = ""; 

            const startIndex = (currentPage - 1) * tasksPerPage;
            const endIndex = startIndex + tasksPerPage;
            const paginatedTasks = tasks.slice(startIndex, endIndex);

            // console.log('formatted date', formatDate(tasks[0].taskDate));
    
            paginatedTasks.forEach(task => {
                const newRow = document.createElement("tr");
                    newRow.innerHTML = `
                    <td>${task.taskId}</td>
                    <td>${formatDate(task.taskDate)}</td>
                    <td>${task.taskStatus}</td>
                    <td>${task.severity}</td>
                    <td>${task.taskType}</td>
                    <td>${task.taskDescription}</td>
                    <td>${task.itInCharge}</td>
                    <td>${task.department}</td>
                    <td>${task.departmentNo}</td>
                    <td>${task.requestedBy}</td>
                    <td>${task.approvedBy}</td>
                    <td>${task.itemName}</td>
                    <td>${task.deviceName}</td>
                    <td>${task.applicationName}</td>
                    <td>${formatDate(task.dateReq)}</td>
                    <td>${formatDate(task.dateRec)}</td>
                    <td>${formatDate(task.dateStart)}</td>
                    <td>${formatDate(task.dateFin)}</td>
                `;
            
                newRow.addEventListener('click', async function(event) {
                    event.preventDefault();
                    await openTaskInfoModal(task); 
                });
    
                tableBody.appendChild(newRow);
            });

            updatePagination(totalPages);
    
        } catch (err) {
            console.error('Error loading tasks:', err);
        }
    }

    async function openTaskInfoModal(taskData) {
        const taskInfoModal = document.getElementById('taskInfoModal');
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
                <td><strong>IT in Charge:</strong></td>
                <td>${taskData.itInCharge}</td>
            </tr>
            <tr>
                <td><strong>Department:</strong></td>
                <td>${taskData.department}</td>
                <td><strong>Department No:</strong></td>
                <td>${taskData.departmentNo}</td>
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
                <td><strong>Item Name:</strong></td>
                <td>${taskData.itemName}</td>
            </tr>
            <tr>
                <td><strong>Device Name:</strong></td>
                <td>${taskData.deviceName}</td>
                <td><strong>Application Name:</strong></td>
                <td>${taskData.applicationName}</td>
            </tr>
            <tr>
                <td><strong>Date Requested:</strong></td>
                <td>${formatDate(taskData.dateReq)}</td>
                <td><strong>Date Received:</strong></td>
                <td>${formatDate(taskData.dateRec)}</td>
            </tr>
            <tr>
                <td><strong>Date Started:</strong></td>
                <td>${formatDate(taskData.dateStart)}</td>
                <td><strong>Date Finished:</strong></td>
                <td>${formatDate(taskData.dateFin)}</td>
            </tr>
        </table>
    `;
    
        taskInfoModal.style.display = "flex";       

        // Set up delete button event listener
        const deleteTaskButton = document.getElementById('deleteTaskButton');
        deleteTaskButton.onclick = async () => {
            await deleteTask(taskData.taskId);
        };

        const editTaskButton = document.getElementById('editTaskButton');
        editTaskButton.onclick = async () => {
            taskInfoModal.style.display = 'none';
            await openEditModal(taskData);
        };
        console.log("Editing Task Data:", taskData);

    }

    function modal_handling() {
        const taskModal = document.getElementById('taskModal');
        const taskInfoModal = document.getElementById('taskInfoModal');
        const closeTaskButton = document.querySelector('.close-task');
        const closeButton = document.querySelector('.close');
        const topbar = document.getElementById('topbar');
        const pop = document.querySelector('.notification-popup');
        const currentDate = new Date().toISOString().split('T')[0];

        function generateUniqueId() {
            return Array.from({ length: 4 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
        }

        function getFieldValue(id) {
            const field = document.getElementById(id);
            if(!field) return "--";

            let value;

            if (field.tagName == "SELECT") {
                value = field.options[field.selectedIndex]?.text || "--";
            } else {
                value = field.value.trim();
            }

            return value ? value : "--";
        }

        window.openModal = function () {
            taskModal.style.display = "flex";
            document.getElementById('taskDate').value = currentDate;
            document.getElementById('taskId').value = generateUniqueId();
        };

        window.addTask = async (event) => {
            event.preventDefault();

            const response = await fetch('/check-session');
            const data = await response.json();
            
            console.log(data);

            if (!data.loggedIn) {
                alert("Session expired. Please log in again.");
                window.location.replace('/internal/login/sign-in');
                return;
            }
            
            const taskData = {
                taskId: document.getElementById('taskId').value,
                taskDate: currentDate,
                taskStatus: getFieldValue("taskStatus"),
                severity: getFieldValue("severity"),
                taskType: getFieldValue("taskType"),
                taskDescription: getFieldValue("taskDescription"),
                itInCharge: getFieldValue("itInCharge"),
                department: getFieldValue("department"),
                departmentNo: getFieldValue("departmentNo"),
                requestedBy: getFieldValue("requestedBy"),
                approvedBy: getFieldValue("approvedBy"),
                itemName: getFieldValue("itemName"),
                deviceName: getFieldValue("deviceName"),
                applicationName: getFieldValue("applicationName"),
                dateReq: getFieldValue("dateReq"),
                dateRec: getFieldValue("dateRec"),
                dateStart: getFieldValue("dateStart"),
                dateFin: getFieldValue("dateFin")
            };

            const newTask = await addTaskToDatabase(taskData);
            if (newTask) {
                console.log('Task saved:', newTask);
                await loadTasks();
                UI.closeModal('taskModal', true);
            } else {
                console.error('Failed to save task');
            }
        };

        taskInfoModal.addEventListener('click', (event) => UI.closeOutsideModal(event, 'submittedContent', 'taskInfoModal'));
        taskModal.addEventListener('click', (event) => UI.closeOutsideModal(event, 'modalContent', 'taskModal'));
        pop.addEventListener('click', (event) => UI.closeOutsideModal(event, 'popupContent', 'notificationPopup'));
        topbar.addEventListener('click', (event) => UI.closeOutsideModal(event, 'modalContent', 'taskModal'));
        topbar.addEventListener('click', (event) => UI.closeOutsideModal(event, 'submittedContent', 'taskInfoModal'));

        if (closeButton) closeButton.addEventListener('click', () => UI.closeModal('taskModal', true));
        if (closeTaskButton) {
            closeTaskButton.addEventListener('click', () => {
                taskInfoModal.style.display = "none";
            });
        }
    }

    function searchFilter() {
        let timeout;
        const searchInput = document.querySelector('.search-input');
        // const savedQuery = localStorage.getItem('searchQuery');
        // if (savedQuery) {
        //     searchInput.value = savedQuery;
        //     applySear
        // }
        
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout); // search requests only after the users stop typing for 500ms
    
            timeout = setTimeout(async () => {
                let totalPages;
                try {
                    const queryValue = searchInput.value.trim();
    
                    const response = await fetch('/api/tasks/search-input', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: queryValue })
                    });
    
                    if (!response.ok) {
                        console.error("No equivalent task found.", response.status);
                    } else {
                        const data = await response.json();
                        console.log("Search Results:", data);

                        const tableBody = document.getElementById("taskTableBody");
                        totalPages = Math.ceil(data.length / tasksPerPage);
                        currentPage = 1;
                
                        tableBody.innerHTML = ""; 
            
                        const startIndex = (currentPage - 1) * tasksPerPage;
                        const endIndex = startIndex + tasksPerPage;
                        const paginatedTasks = data.slice(startIndex, endIndex);

                        // If search results are available, display them
                        if (paginatedTasks.length > 0) {
                            paginatedTasks.forEach(task => {
                                const newRow = document.createElement("tr");
                                newRow.innerHTML = `
                                    <td>${task.taskId}</td>
                                    <td>${formatDate(task.taskDate)}</td>
                                    <td>${task.taskStatus}</td>
                                    <td>${task.severity}</td>
                                    <td>${task.taskType}</td>
                                    <td>${task.taskDescription}</td>
                                    <td>${task.itInCharge}</td>
                                    <td>${task.department}</td>
                                    <td>${task.departmentNo}</td>
                                    <td>${task.requestedBy}</td>
                                    <td>${task.approvedBy}</td>
                                    <td>${task.itemName}</td>
                                    <td>${task.deviceName}</td>
                                    <td>${task.applicationName}</td>
                                    <td>${formatDate(task.dateReq)}</td>
                                    <td>${formatDate(task.dateRec)}</td>
                                    <td>${formatDate(task.dateStart)}</td>
                                    <td>${formatDate(task.dateFin)}</td>
                                `;
                                newRow.addEventListener('click', async function(event) {
                                    event.preventDefault();
                                    await openTaskInfoModal(task); 
                                });
    
                                tableBody.appendChild(newRow);
                            });
                        } else {
                            tableBody.innerHTML = "<tr><td colspan='16'>No matching tasks found.</td></tr>";
                        }
                    }
                } catch (error) {
                    console.error('Error:', error.message);
                }
                updatePagination(totalPages);
            }, 500);
        });
    }

    function filterDropdown() {
        const filterSelect = document.querySelector('.filter-select');  // Target the <select> inside the div
    
        filterSelect.addEventListener('change', async function() {  
            const newValue = this.value;
            try {
                const response = await fetch(`/api/tasks/filterBy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: newValue })
                });

                if (!response.ok) {
                    console.error("Error sorting tasks: ", response.status);
                } else {
                    const data = await response.json();
                    console.log("Search Results:", data);
                    await loadTasks(data);
                }
            } catch (error) {
                console.error('Error:', error.message);
            }
        });
    }

    // UI Actions
    UI.handle_darkmode(".toggle-switch");
    UI.page_navigation("summary");
    UI.notificationPop();
    UI.dropdownToggle();
    UI.handleSidebarState();
    await UI.reflectUsername();

    // Initialize
    dashboard_open();
    modal_handling();
    searchFilter();
    filterDropdown();
    goToPreviousPage();
    goToNextPage();
    await loadTasks();

}); 