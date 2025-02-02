import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", async function () {

    // UI Actions
    UI.handle_darkmode(".toggle-switch");
    UI.page_navigation("summary");
    UI.notificationPop();
    UI.dropdownToggle();
    UI.handleSidebarState();
    await UI.reflectUsername();

    // Initialize
    modal.dashboard_open();
    modal.openModal();
    modal.clickOutsideModal();
    task.addTaskModal();
    filter.searchFilter();
    filter.filterDropdown();
    task.goToPreviousPage();
    task.goToNextPage();
    await task.loadTasks();

}); 

const modal = {
    taskModal: document.getElementById('taskModal'),
    taskInfoModal: document.getElementById('taskInfoModal'),
    closeTaskButton: document.querySelector('.close-task'),
    closeButton: document.querySelector('.close'),
    topbar: document.getElementById('topbar'),
    pop: document.querySelector('.notification-popup'),
    currentDate: new Date().toISOString().split('T')[0],

    openEditModal: async function (taskData) {
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
            const formData = {};

            Object.entries(taskFields).forEach(([key, id]) => {
                if (key !== 'taskId') {
                    formData[key] = document.getElementById(id).value;
                }
            });
    
            await updateTask(taskId, formData);
        };
    
        // Show the modal
        editModal.style.display = "flex";
    },

    generateUniqueId: function() {
        return Array.from({ length: 4 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
    },

    openModal: function() {
        const newTaskButton = document.querySelector('.new-task-button');
        newTaskButton.addEventListener('click', () => {
            modal.taskModal.style.display = "flex";
            document.getElementById('taskDate').value = modal.currentDate;
            document.getElementById('taskId').value = modal.generateUniqueId();
        })
    },

    clickOutsideModal: function() {
        modal.taskInfoModal.addEventListener('click', (event) => UI.closeOutsideModal(event, 'submittedContent', 'taskInfoModal'));
        modal.taskModal.addEventListener('click', (event) => UI.closeOutsideModal(event, 'modalContent', 'taskModal'));
        modal.pop.addEventListener('click', (event) => UI.closeOutsideModal(event, 'popupContent', 'notificationPopup'));
        modal.topbar.addEventListener('click', (event) => UI.closeOutsideModal(event, 'modalContent', 'taskModal'));
        modal.topbar.addEventListener('click', (event) => UI.closeOutsideModal(event, 'submittedContent', 'taskInfoModal'));

        if (modal.closeButton) modal.closeButton.addEventListener('click', () => UI.closeModal('taskModal', true));
        if (modal.closeTaskButton) {
            modal.closeTaskButton.addEventListener('click', () => {
                modal.taskInfoModal.style.display = "none";
            });
        }
    },

    openTaskInfoModal: async function(taskData) {
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
                <td>${task.formatDate(taskData.dateReq)}</td>
                <td><strong>Date Received:</strong></td>
                <td>${task.formatDate(taskData.dateRec)}</td>
            </tr>
            <tr>
                <td><strong>Date Started:</strong></td>
                <td>${task.formatDate(taskData.dateStart)}</td>
                <td><strong>Date Finished:</strong></td>
                <td>${task.formatDate(taskData.dateFin)}</td>
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

}

const task = {

    currentPage: 1, 
    tasksPerPage: 9,
    prevButton: document.getElementById("prevPage"),
    nextButton: document.getElementById("nextPage"),

    dashboard_open: function() {
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
    },

    formatDate: function(date) {
        return date && date !== "null" ? date : "--";
    },

    getFieldValue: function(id) {
        const field = document.getElementById(id);
        if(!field) return "--";

        let value;

        if (field.tagName == "SELECT") {
            value = field.options[field.selectedIndex]?.text || "--";
        } else {
            value = field.value.trim();
        }

        return value ? value : "--";
    },

    fetchTasksFromDatabase: async function () {
        try {
            const response = await fetch('/api/tasks');
            return await response.json();
        } catch (err) {
            console.error('Error fetching tasks:', err);
            return [];
        }
    }, 

    addTaskToDatabase: async function (taskData) {
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
    },

    updateTask: async function(taskId, formData) {
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
    },

    deleteTask: async function (taskId) {
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
                await task.loadTasks(); // Refresh the task list
            } else {
                console.error("Failed to delete task.");
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    },

    updatePagination: function(totalPages) {
        const currentPageSpan = document.getElementById("currentPage");    
        currentPageSpan.textContent = `${currentPage}`;
    
        // Enable/disable buttons based on page limits
        task.prevButton.disabled = (currentPage === 1);
        task.nextButton.disabled = (currentPage === totalPages);
    },

    goToPreviousPage: function() {
        task.prevButton.addEventListener('click', async () => {
            if (currentPage > 1) {
                currentPage--;
                await task.loadTasks(); // Reload tasks for new page
            }
        })
    },

    addTaskModal: function() {
        const newTaskForm = document.getElementById('newTaskForm');
        newTaskForm.addEventListener('submit', async function(event) {
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
                taskStatus: task.getFieldValue("taskStatus"),
                severity: task.getFieldValue("severity"),
                taskType: task.getFieldValue("taskType"),
                taskDescription: task.getFieldValue("taskDescription"),
                itInCharge: task.getFieldValue("itInCharge"),
                department: task.getFieldValue("department"),
                departmentNo: task.getFieldValue("departmentNo"),
                requestedBy: task.getFieldValue("requestedBy"),
                approvedBy: task.getFieldValue("approvedBy"),
                itemName: task.getFieldValue("itemName"),
                deviceName: task.getFieldValue("deviceName"),
                applicationName: task.getFieldValue("applicationName"),
                dateReq: task.getFieldValue("dateReq"),
                dateRec: task.getFieldValue("dateRec"),
                dateStart: task.getFieldValue("dateStart"),
                dateFin: task.getFieldValue("dateFin")
            };

            const newTask = await task.addTaskToDatabase(taskData);
            if (newTask) {
                console.log('Task saved:', newTask);
                await task.loadTasks();
                UI.closeModal('taskModal', true);
            } else {
                console.error('Failed to save task');
            }
        })
    },

    loadTasks: async function(query = null) {
        try {
            const tasks = (query) ? query : await task.fetchTasksFromDatabase();
            const tableBody = document.getElementById("taskTableBody");
            const totalPages = Math.ceil(tasks.length / task.tasksPerPage);
    
            tableBody.innerHTML = ""; 

            const startIndex = (task.currentPage - 1) * task.tasksPerPage;
            const endIndex = startIndex + task.tasksPerPage;
            const paginatedTasks = tasks.slice(startIndex, endIndex);

            // console.log('formatted date', task.formatDate(tasks[0].taskDate));
    
            paginatedTasks.forEach(task => {
                const newRow = document.createElement("tr");
                    newRow.innerHTML = `
                    <td>${task.taskId}</td>
                    <td>${task.formatDate(task.taskDate)}</td>
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
                    <td>${task.formatDate(task.dateReq)}</td>
                    <td>${task.formatDate(task.dateRec)}</td>
                    <td>${task.formatDate(task.dateStart)}</td>
                    <td>${task.formatDate(task.dateFin)}</td>
                `;
            
                newRow.addEventListener('click', async function(event) {
                    event.preventDefault();
                    await modal.openTaskInfoModal(task); 
                });
    
                tableBody.appendChild(newRow);
            });

            task.task.updatePagination(totalPages);
    
        } catch (err) {
            console.error('Error loading tasks:', err);
        }
    },


}

const filter = {
    searchFilter: function() {
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
                                    <td>${task.formatDate(task.taskDate)}</td>
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
                                    <td>${task.formatDate(task.dateReq)}</td>
                                    <td>${task.formatDate(task.dateRec)}</td>
                                    <td>${task.formatDate(task.dateStart)}</td>
                                    <td>${task.formatDate(task.dateFin)}</td>
                                `;
                                newRow.addEventListener('click', async function(event) {
                                    event.preventDefault();
                                    await modal.openTaskInfoModal(task); 
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
                task.updatePagination(totalPages);
            }, 500);
        });
    },

    filterDropdown: function() {
        const filterSelect = document.querySelector('.filter-select');  
    
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
                    await task.loadTasks(data);
                }
            } catch (error) {
                console.error('Error:', error.message);
            }
        });
    }
}