import { UI } from '../common.js';

document.addEventListener("DOMContentLoaded", async function() {



    UI.handle_darkmode(".toggle-switch");
})

let generatedPDF;

const layout = {
    dashboard_open: async function() {
       layout.setup_elem(1);
       generatedPDF = null;
       await page.update_tasks_per_page();
    }, 

    summary_open: async function() {
        layout.setup_elem(2);
        await generate_pdf();
    },

    setup_elem: function(int) {
        if (int === 1) {
            const dashElements = layout.get_elem(1);
            dashElements.dashTitle.innerText = "IT Management - Dashboard";
            dashElements.dashContainer.style.display = 'block';
            dashElements.taskTable.style.display = 'table';
            dashElements.searchAndTask.style.display = 'block';
        } else {
            const sumElements = layout.get_elem(2);
            sumElements.sumTitle.innerText = "IT Management - Summary";
            sumElements.sumContainer.style.display = 'block';
        }
    },

    get_elem: function(int) {
        if (int === 1) {
            return {
                dashTitle: document.getElementById('dashTitle'),
                dashContainer: document.getElementById('dashboardContainer'),
                taskTable: document.querySelector('.task-table'),
                searchAndTask: document.querySelector('.fixed-head')
            };   
        } else {
            return {
                sumTitle: document.getElementById('summaryTitle'),
                sumContainer: document.getElementById('summaryContainer')
            };
        }
    },
}

const add = {
    add_to_database: async function(taskData){
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

    add_to_table: function(task) {
        let tableBody = document.getElementById("taskTableBody");
    
        // Create row
        let row = document.createElement("tr");
    
        // Assign a class based on task status
        let statusClass = util.get_status_class(task.taskStatus); // Ensure correct property
        if (statusClass) row.classList.add(statusClass);
    
        // Populate row with task data
        row.innerHTML = `
            <td>${task.taskId}</td>
            <td>${util.format_date(task.taskDate)}</td>
            <td class="status status-${task.taskStatus.toLowerCase().replace(/\s+/g, '-')}">
                ${task.taskStatus}
            </td>
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
            <td>${util.format_date(task.dateReq)}</td>
            <td>${util.format_date(task.dateRec)}</td>
            <td>${util.format_date(task.dateStart)}</td>
            <td>${util.format_date(task.dateFin)}</td>
        `;
    
        // Add event listener for row click
        row.addEventListener('click', async function(event) {
            event.preventDefault();
            await open_task_modal(task);
        });
    
        // Append row to the table body
        tableBody.appendChild(row);
    }

}

const cancel = {
    is_cancelled: async function(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch task details");
            }
    
            const taskData = await response.json();
            
            return taskData.taskStatus === "Cancelled"; 
        } catch (err) {
            console.error("Error checking task status:", err);
            return false; 
        }
    },

    cancel_task: async function(taskId) {
        const taskInfoModal = document.getElementById('taskInfoModal');
        try {
            const isCancelled = await cancel.is_cancelled(taskId);
            if (isCancelled) {
                alert(`Task ${taskId} is already cancelled.`);
                return;
            }
    
            const response = await fetch(`/api/tasks/${taskId}/cancel`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ taskStatus: "Cancelled" })
            });
    
            const data = await response.json();
            
            if (response.ok) {
                console.log("Task cancelled successfully:", data);
                alert(`Task ${taskId} cancelled successfully!`); 
                await load.load_tasks();
                taskInfoModal.style.display = "none";
            } else {
                console.error("Error cancelling task:", data.error);
                alert("Error cancelling task: " + data.error);
            }
        } catch (error) {
            console.error("Network or server error:", error);
            alert("Network error. Please try again.");
        }
    },

    // Admin role
    // async function delete_task(taskId) {
    //     if (!confirm("Are you sure you want to delete this task?")) return;
    
    //     try {
    //         const response = await fetch(`/api/tasks/${taskId}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         });
    
    //         if (response.ok) {
    //             console.log("Task deleted successfully.");
    //             UI.close_modal('taskInfoModal', true); // Close the modal
    //             await load.load_tasks(); // Refresh the task list
    //         } else {
    //             console.error("Failed to delete task.");
    //         }
    //     } catch (err) {
    //         console.error("Error deleting task:", err);
    //     }
    // }
}

const update = {
    open_edit_modal: async function(taskData){
        const editModal = document.getElementById('taskEditModal');
        const editTaskForm = document.getElementById('editTaskForm');
    
        // Define task fields mapping
        const taskFields = {
            taskId: "editTaskId", taskStatus: "editTaskStatus", taskDate: "editTaskDate",
            itInCharge: "editItInCharge", department: "editDepartment", departmentNo: "editDepartmentNo",
            taskType: "editTaskType", taskDescription: "editTaskDescription", severity: "editSeverity",
            requestedBy: "editRequestedBy", approvedBy: "editApprovedBy", itemName: "editItemName",
            deviceName: "editDeviceName", applicationName: "editApplicationName", dateReq: "editDateReq",
            dateRec: "editDateRec", dateStart: "editDateStart", dateFin: "editDateFin"
        };
    
        util.populate_form_fields(taskFields, taskData);
        update.setup_status_logic(taskData);
    
        editTaskForm.onsubmit = async (event) => {
            event.preventDefault();
            await update.submit_edited_task(taskData.taskId);
        };
    
        editModal.style.display = "flex";
    },

    setup_status_logic: function(taskData) {
        const statusField = document.getElementById("editTaskStatus");
        const dateFinField = document.getElementById("editDateFin");
        const dateStartField = document.getElementById("editDateStart");
    
        // Ensure the "New" status changes to "Pending" when opening the modal
        const selectedStatus = taskData.taskStatus === "New" ? "Pending" : taskData.taskStatus;
    
        // Enable all options first, then disable the selected one
        Array.from(statusField.options).forEach(option => option.disabled = false);
        const selectedOption = statusField.querySelector(`option[value="${selectedStatus}"]`);
        if (selectedOption) selectedOption.disabled = true;
    
        // Auto-fill Date Finished or Date Started when status changes
        statusField.addEventListener("change", function () {
            const currentDate = new Date().toISOString().split('T')[0];
    
            if (statusField.value === "Completed" && !dateFinField.value) {
                dateFinField.value = currentDate;
            } else if (statusField.value === "In Progress" && !dateStartField.value) {
                dateStartField.value = currentDate;
            }
        });
    },

    submit_edited_task: async function(taskId) {
        const formData = {
            taskDate: get_field_value("editTaskDate"),
            taskStatus: get_field_value("editTaskStatus"),
            severity: get_field_value("editSeverity"),
            taskType: get_field_value("editTaskType"),
            taskDescription: get_field_value("editTaskDescription"),
            itInCharge: get_field_value("editItInCharge"),
            department: get_field_value("editDepartment"),
            departmentNo: get_field_value("editDepartmentNo"),
            requestedBy: get_field_value("editRequestedBy"),
            approvedBy: get_field_value("editApprovedBy"),
            itemName: get_field_value("editItemName"),
            deviceName: get_field_value("editDeviceName"),
            applicationName: get_field_value("editApplicationName"),
            dateReq: get_field_value("editDateReq"),
            dateRec: get_field_value("editDateRec"),
            dateStart: get_field_value("editDateStart"),
            dateFin: get_field_value("editDateFin")
        };
    
        // Ensure "New" changes to "Pending" before submitting
        if (formData.taskStatus === "New") {
            formData.taskStatus = "Pending";
        }
    
        await update.update_task(taskId, formData);
    },

    update_task: async function(taskId, formData) {
        const editModal = document.getElementById('taskEditModal');
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
    
            if (!response.ok) {  
                throw new Error(data.error || "Failed to update task");
            }
    
            alert(data.message);
    
            if (!data.success) return;
            console.log(data.message, data);

            const newTasksPerPage = page.task_per_page();
            if (newTasksPerPage !== tasksPerPage) tasksPerPage = newTasksPerPage;
    
            await load.load_tasks(null, true);
            editModal.style.display = "none";

        } catch (error) {
            console.error("Error:", error);
            alert(error.message.includes("Failed to fetch") 
                ? "Network error. Please check your connection and try again." 
                : error.message
            );
        }
    }
}

const load = {
    load_tasks: async function(query = null, resetPage = false) {
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

            const table = document.querySelector('.task-table');
            const noData = document.getElementById('noData');
            
            if (totalTasks === 0) {
                table.style.display = 'none';
                noData.style.display = 'flex';  
            } else {
                table.style.display = 'table';
                noData.style.display = 'none';  
            }
    
            const startIndex = (currentPage - 1) * tasksPerPage;
            const endIndex = startIndex + tasksPerPage;
            const paginatedTasks = tasks.slice(startIndex, endIndex);
    
            paginatedTasks.forEach(task => {
                add.add_to_table(task);
            });
    
            page.update_pagination(totalPages);
    
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
}

const prevButton = document.getElementById("prevPage");
const nextButton = document.getElementById("nextPage");
let resizeTimeout;
let currentPage = 1;
let tasksPerPage = 1;
let totalTasks = 0;

setTimeout(page.update_tasks_per_page, 150);

const page = {
    update_tasks_per_page: async function() {
        const newTasksPerPage = page.task_per_page();
        if (newTasksPerPage !== tasksPerPage) {
            tasksPerPage = newTasksPerPage;
            await load.load_tasks();
        }
    },

    task_per_page: function() {
        const tableContainer = document.getElementById('containerTable'); 
        const sampleRow = document.querySelector('.task-table tbody tr');
    
        if (!tableContainer) return 1; 
    
        const containerHeight = tableContainer.clientHeight || 1;
        const rowHeight = sampleRow ? sampleRow.clientHeight || 1 : 40
    
        return Math.max(1, Math.floor((containerHeight / rowHeight) - 1));
    },

    update_pagination: function(totalPages) {
        const currentPageSpan = document.getElementById("currentPage");    
        currentPageSpan.textContent = `${currentPage}`;
    
        prevButton.disabled = (currentPage <= 1);
        nextButton.disabled = (currentPage >= totalPages);
    },

    update_page_buttons: function() {
        if (window.innerWidth <= 800) {
            prevButton.textContent = "«";
            prevButton.style.fontSize = "18px";
            nextButton.textContent = "»";
            nextButton.style.fontSize = "18px";
        } else {
            prevButton.textContent = "Previous";
            nextButton.textContent = "Next";
            prevButton.style.fontSize = "";
            nextButton.style.fontSize = "";
        }
    },
}

if (prevButton && nextButton) {
    prevButton.onclick = async () => {
        if (currentPage > 1) {
            currentPage--;
            util.update_url();
            await load.load_tasks(null, false);
        }
    };

    nextButton.onclick = async () => {
        currentPage++;
        util.update_url();
        await load.load_tasks(null, false);
    };
}

(function () {
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(async () => {
            const newTasksPerPage = page.task_per_page();

            if (newTasksPerPage !== tasksPerPage) {
                tasksPerPage = newTasksPerPage;
                const totalPages = Math.max(1, Math.ceil(totalTasks / tasksPerPage));

                if (currentPage > totalPages) {
                    currentPage = totalPages;
                    util.update_url();
                }

                await load.load_tasks(null, false);
            }
            page.update_page_buttons();
        }, 100);
    });

    window.addEventListener('load', page.update_page_buttons);
})();

const util = {
    format_date: function(date) {
        return date && date !== "null" ? date : "--";
    },

    get_status_class: function(status) {
        if (!status) return "";
        switch (status.toLowerCase()) {
            case "new": return "status-new";
            case "pending": return "status-pending";
            case "in progress": return "status-in-progress";
            case "on hold": return "status-on-hold";
            case "completed": return "status-completed";
            case "cancelled": return "status-cancelled";
            case "open": return "status-open"; 
            case "closed": return "status-closed"; 
            default: return "";
        }
    },

    populate_form_fields: function(fieldMap, taskData) {
        Object.entries(fieldMap).forEach(([key, id]) => {
            const field = document.getElementById(id);
            if (!field) return;
    
            if (field.tagName === "SELECT") {
                util.set_selected_option(field, taskData[key], key === "taskStatus");
            } else {
                field.value = taskData[key] || "";
            }
        });
    },

    set_selected_option: function(field, value, isStatusField) {
        for (let i = 0; i < field.options.length; i++) {
            if (field.options[i].value === value) {
                field.selectedIndex = i;
                break;
            }
        }

        if (isStatusField && value === "New") {
            field.selectedIndex = [...field.options].findIndex(opt => opt.value === "Pending");
        }
    },

    update_url: function() {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('page', currentPage);
        window.history.pushState({}, '', newUrl);
    }
}

// Hanggang load_tasks palang naayos