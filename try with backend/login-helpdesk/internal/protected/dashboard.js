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
            const field = document.getElementById(id);
            if (field) {
                if (field.tagName === "SELECT") {
                    // Set the correct selected option
                    for (let i = 0; i < field.options.length; i++) {
                        if (field.options[i].value === taskData[key]) {
                            field.selectedIndex = i;
                            // console.log(field.options[i].value, taskData[key], field.selectedIndex);
                            break;
                        }
                    }
                } else {
                    field.value = taskData[key] || "";
                }
            }
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
    let tasksPerPage = calculateTasksPerPage();
    let totalTasks = 0;

    function calculateTasksPerPage() {
        const tableContainer = document.getElementById('containerTable'); 
        const sampleRow = document.querySelector('.task-table tbody tr');
    
        if (!tableContainer) return 1; 
    
        const containerHeight = tableContainer.clientHeight || 1;
        const rowHeight = sampleRow ? sampleRow.clientHeight || 1 : 40
    
        return Math.max(1, Math.floor((containerHeight / rowHeight) - 1));
    }
    
    let resizeTimeout;

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(async () => {
            const newTasksPerPage = calculateTasksPerPage();
    
            if (newTasksPerPage !== tasksPerPage) {
                tasksPerPage = newTasksPerPage;
                const totalPages = Math.max(1, Math.ceil(totalTasks / tasksPerPage));
    
                if (currentPage > totalPages) {
                    currentPage = totalPages;
                    updateURL();
                }
    
                await loadTasks(null, false);
            }
        }, 100);
    });

    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");
    
    
    function updatePagination(totalPages) {
        const currentPageSpan = document.getElementById("currentPage");    
        currentPageSpan.textContent = `${currentPage}`;
    
        prevButton.disabled = (currentPage <= 1);
        nextButton.disabled = (currentPage >= totalPages);
    }
    
    prevButton.onclick = async () => {
        if (currentPage > 1) {
            currentPage--;
            updateURL();
            await loadTasks(null, false);
        }
    };
    
    nextButton.onclick = async () => {
        currentPage++;
        updateURL();
        await loadTasks(null, false);
    };
    
    function updateURL() {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('page', currentPage);
        window.history.pushState({}, '', newUrl);
    }

    async function loadTasks(query = null, resetPage = false) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = query || urlParams.get('search') || '';
            const filterBy = urlParams.get('filterBy');
            const filterValue = urlParams.get('value');
    
            if (resetPage) {
                currentPage = 1;  
            } else {
                currentPage = parseInt(urlParams.get('page')) || currentPage;
            }
    
            let url = `/api/tasks?page=${currentPage}`;
    
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (filterBy && filterValue) {
                params.set('filterBy', filterBy);
                params.set('value', filterValue);
            }
            if (params.toString()) {
                url += `&${params.toString()}`;
            }
    
            const response = await fetch(url);
            if (!response.ok) {
                console.error("Error fetching tasks:", response.status);
                return;
            }
    
            const tasks = await response.json();
            totalTasks = tasks.length;
            const tableBody = document.getElementById("taskTableBody");
            const totalPages = Math.ceil(totalTasks / tasksPerPage);
    
            tableBody.innerHTML = ""; 

            const table = document.getElementById('containerTable');
            const noData = document.getElementById('noData');

            if(totalTasks === 0) {
                table.style.display = 'none';
                noData.style.display = 'flex';
            } else {
                table.style.display = 'flex';
                noData.style.display = 'none';
            }
    
            const startIndex = (currentPage - 1) * tasksPerPage;
            const endIndex = startIndex + tasksPerPage;
            const paginatedTasks = tasks.slice(startIndex, endIndex);
    
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
                    // openUpdateModal(task);
                    await openTaskInfoModal(task); 
                });
    
                tableBody.appendChild(newRow);
            });
    
            updatePagination(totalPages);
    
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('page', currentPage); // Always update page number
            if (searchQuery) {
                newUrl.searchParams.set('search', searchQuery);
            } else {
                newUrl.searchParams.delete('search');
            }
            if (filterBy && filterValue) {
                newUrl.searchParams.set('filterBy', filterBy);
                newUrl.searchParams.set('value', filterValue);
            } else {
                newUrl.searchParams.delete('filterBy');
                newUrl.searchParams.delete('value');
            }
            window.history.pushState({}, '', newUrl);
    
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
            if (!field) return "--";
        
            return field.value.trim() || "--";  // Always return the value, which is now the full name
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

        const saveSearch = localStorage.getItem('searchQuery');
        if(saveSearch) {
            searchInput.value = saveSearch;
        }
    
        searchInput.addEventListener('input', function () {
            clearTimeout(timeout);
    
            timeout = setTimeout(async () => {
                const queryValue = searchInput.value.trim();
                localStorage.setItem('searchQuery', queryValue);
                const newUrl = new URL(window.location.href);
    
                if (queryValue) {
                    newUrl.searchParams.set('search', queryValue);
                } else {
                    newUrl.searchParams.delete('search');
                }
    
                window.history.pushState({}, '', newUrl);
                await loadTasks(null, true); // Reload tasks with the new search query
            }, 500);
        });
    }

    function filterDropdown() {
        const filterSelect = document.querySelector('.filter-select');
    
        const newDropdown = {
            taskStatus: document.querySelector('.status-options'),
            taskDate: document.querySelector('.date-options'),
            severity: document.querySelector('.severity-options'),
            department: document.querySelector('.dept-options')
        };
    
        Object.values(newDropdown).forEach(dropdown => { dropdown.style.display = 'none'; });

        const saveFilterBy = localStorage.getItem('filterBy');
        const saveValue = localStorage.getItem('filterValue');
        if(saveFilterBy && newDropdown[saveFilterBy]){
            filterSelect.value = saveFilterBy;
            newDropdown[saveFilterBy].style.display = 'block';
            newDropdown[saveFilterBy].value = saveValue;
        }
    
        filterSelect.addEventListener('change', function () {
            const selectedFilter = this.value;
    
            Object.values(newDropdown).forEach(dropdown => {
                dropdown.style.display = 'none';
                dropdown.value = 'filter';
            });
    
            if (newDropdown[selectedFilter]) {
                newDropdown[selectedFilter].style.display = 'block';
    
                newDropdown[selectedFilter].addEventListener('change', async function () {
                    const newValue = this.value;
    
                    const newUrl = new URL(window.location.href);
    
                    if (newValue !== 'stop') {
                        localStorage.setItem('filterBy', selectedFilter);
                        localStorage.setItem('filterValue', newValue);

                        newUrl.searchParams.set('filterBy', selectedFilter);
                        newUrl.searchParams.set('value', newValue);
                    } else {
                        localStorage.removeItem('filterBy');
                        localStorage.removeItem('filterValue');

                        Object.values(newDropdown).forEach(dropdown => { dropdown.style.display = 'none'; });
                        filterSelect.value = 'filter';
                        newDropdown[selectedFilter].value = 'none';

                        newUrl.searchParams.delete('filterBy');
                        newUrl.searchParams.delete('value');
                    }
    
                    window.history.pushState({}, '', newUrl);
                    await loadTasks(null, true); // Reload tasks with the new filter applied
                });
            }
        });
    }

    function listNavigation() {
        const dashboard = document.getElementById('dashboard');
        const dashboardContainer = document.getElementById('dashboardContainer');
        const summary = document.getElementById('summary');
        const summaryContainer = document.getElementById('summaryContainer');

        summary.addEventListener('click', function(event){
            event.preventDefault();
            dashboardContainer.style.display = 'none';
            summaryContainer.style.display = 'block';
        });
        
        dashboard.addEventListener('click', function(event){
            event.preventDefault();
            dashboardContainer.style.display = 'block';
            summaryContainer.style.display = 'none';
        });
    }

    function notificationPop() {
        const dashboardPopup = document.getElementById('dashboard-notificationPopup');
        const summaryPopup = document.getElementById('summary-notificationPopup');
        const dashboardContainer = document.getElementById('dashboardContainer');
        const pop = document.querySelector('.notification-popup');
    
        function isDashboardActive() {
            return dashboardContainer.style.display === 'block';
        }

        pop.addEventListener('click', (event) => {
            let notif = isDashboardActive() ? dashboardPopup.id : summaryPopup.id;
            UI.closeOutsideModal(event, 'popupContent', notif);
        })
    
        window.openNotificationPopup = function() {
            dashboardPopup.style.display = isDashboardActive() ? 'block' : 'none';
            summaryPopup.style.display = isDashboardActive() ? 'none' : 'block';
        };
    
        window.closeNotificationPopup = function() {
            (isDashboardActive() ? dashboardPopup : summaryPopup).style.display = 'none';
        };
    }

    //     window.openNotificationPopup = function() {
    //         console.log(notificationPopup);
    //         notificationPopup.style.display = "block";
    //         console.log('hello');
    //     };

    //     window.closeNotificationPopup = function() {
    //         notificationPopup.style.display = "none";
    //     };
    // }

    // UI Actions
    UI.handle_darkmode(".toggle-switch");
    UI.dropdownToggle();
    UI.handleSidebarState();
    UI.showProfile();
    await UI.reflectUsername();

    // Initialize
    dashboard_open();
    modal_handling();
    searchFilter();
    filterDropdown();
    listNavigation();
    notificationPop();
    await loadTasks();

}); 