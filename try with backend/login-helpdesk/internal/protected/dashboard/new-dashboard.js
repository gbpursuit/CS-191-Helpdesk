import { UI } from '../../common.js';

document.addEventListener("DOMContentLoaded", async function() {
    requestIdleCallback(async() => {
        await load.load_html("/internal/protected/taskModal.html", "dashboardContainer"); // dashboardContainer instead of dashElements
        await load.load_html("/internal/protected/taskEditModal.html", "dashboardContainer"); //since position is absolute

        document.getElementById('containerTable').addEventListener('wheel', (event) => {
            event.preventDefault();
            event.currentTarget.scrollLeft += event.deltaY; 
        });
    
        document.getElementById("printButton").addEventListener("click", async function () {
            if (!generatedPDF) {
                console.log("Generating new PDF...");
                generatedPDF = await pdf.generate_pdf();
            }
            if (generatedPDF) {
                generatedPDF.save("summary_report.pdf");
            }
        });

        document.querySelectorAll(".look-btn").forEach(button => {
            button.addEventListener("click", function () {
                const buttonId = this.id;
        
                switch (buttonId) {
                    case "taskBtn":
                    case "editTaskBtn":
                        btn.open_table("taskTypeAdd");
                        break;
                    case "dprtBtn":
                    case "editDprtBtn":
                        btn.open_table("departmentAdd");
                        break;
                    case "itChargeBtn":
                    case "editItChargeBtn":
                        btn.open_table("itAdd");
                        break;
                    case "deviceBtn":
                    case "editDeviceBtn":
                        btn.open_table("deviceAdd"); 
                        break;
                    case "itemBtn":
                    case "editItemBtn":
                        btn.open_table("itemAdd"); 
                        break;
                    case "appBtn":
                    case "editAppBtn":
                        btn.open_table("applicationAdd");
                        break;
                    case "taskTypeBtn": 
                        btn.open_table("taskTypeAdd");
                        break;
                    case "requestedByBtn":
                        btn.open_table("requestedByAdd");
                        break;
                    case "approvedByBtn": 
                        btn.open_table("approvedByAdd");
                        break;
                    default:
                        console.warn(`No function assigned for this button: ${buttonId}`);
                }
            });
        });
    
        // Layout Functions
        layout.list_navigation();
        layout.notification_popup();
    
        // Add Functions
        add.modal_handling();
    
        // Load Functions
        await load.load_tasks();
    
        // Filter Functions
        search.search_filter();
        search.filter_dropdown();
    
        // Period Functions
        period.setup_updates();

        // Fetch Functions

        // Util Functions
        util.window_listeners();
        await util.session_ends();
    
        // UI Functions
        UI.handle_darkmode(".toggle-switch");
        UI.dropdown_toggle();
        UI.handle_sidebar();
        UI.show_profile();
        await UI.reflect_username();


    });
})

// Layout Page Logic
const layout = {
    dashboard_open: async function() {
       layout.setup_elem(1);
       generatedPDF = null;
       await page.update_tasks_per_page();
    }, 

    summary_open: async function() {
        layout.setup_elem(2);
        await pdf.generate_pdf();
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

    list_navigation: function() {
        const dashboard = document.getElementById('dashboard');
        const dashboardContainer = document.getElementById('dashboardContainer');
        const summary = document.getElementById('summary');
        const summaryContainer = document.getElementById('summaryContainer');

        if (summaryContainer.style.display === 'block') {
            layout.summary_open(); 
        } else {
            layout.dashboard_open(); 
        }

        summary.addEventListener('click', async function(event){
            event.preventDefault();

            dashboardContainer.style.display = 'none';
            await layout.summary_open();
        });
        
        dashboard.addEventListener('click', async function(event){
            event.preventDefault();

            await layout.dashboard_open();
            summaryContainer.style.display = 'none';
        });
    },

    notification_popup: function() {
        const dashboardPopup = document.getElementById('dashboard-notificationPopup');
        const summaryPopup = document.getElementById('summary-notificationPopup');
        const dashboardContainer = document.getElementById('dashboardContainer');
        const pop = document.querySelector('.notification-popup');
    
        function is_dashboard_active() {
            return dashboardContainer.style.display === 'block';
        }

        pop.addEventListener('click', (event) => {
            let notif = is_dashboard_active() ? dashboardPopup.id : summaryPopup.id;
            UI.close_outside_modal(event, 'popupContent', notif);
        })
    
        window.openNotificationPopup = function() {
            dashboardPopup.style.display = is_dashboard_active() ? 'block' : 'none';
            summaryPopup.style.display = is_dashboard_active() ? 'none' : 'block';
        };
    
        window.closeNotificationPopup = function() {
            (is_dashboard_active() ? dashboardPopup : summaryPopup).style.display = 'none';
        };
    }
}

// PDF Generation
let generatedPDF;

const pdf = {
    fetch_summary_data: async function() {
        try {
            const response = await fetch('/api/tasks'); 
            if (!response.ok) throw new Error('Failed to fetch summary data');
    
            const data = await response.json();
            return data; // Return fetched data
        } catch (error) {
            console.error('Error fetching summary data:', error);
            return [];
        }
    },

    generate_pdf: async function() {
        if (generatedPDF) {
            console.log("Using generated PDF.");
            return generatedPDF;
        }

        if (!window.jspdf) {
            console.error("jsPDF is not loaded!");
            return null; // Return null if jsPDF is not loaded
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [420, 594] }); // Large A2 format

        // Add title
        const title = document.getElementById("summaryTitle").textContent || "Summary Report";
        doc.setFontSize(14);
        doc.text(title, 20, 20);

        // Fetch summary data from API
        const tasks = await pdf.fetch_summary_data();

        // Define table headers
        const tableHeaders = [
            "Task ID", "Task Type", "Task Description", "Requested By", "Approved By", "Department",
            "Department No", "IT In Charge", "Device Name", "Item Name", "Application Name", "Status",
            "Severity", "Transaction Date", "Date Requested", "Date Received", "Date Started", "Date Finished", "Problem Details", "Remarks"
        ];

        // Convert API data into table format
        const tableData = tasks.map(task => [
            task.taskId, task.taskType, task.taskDescription, task.requestedBy, task.approvedBy,
            task.department, task.departmentNo, task.itInCharge, task.deviceName, task.itemName,
            task.applicationName, task.status, task.severity, task.transactionDate, task.dateRequested,
            task.dateReceived, task.dateStarted, task.dateFinished, task.problemDetails, task.remarks
        ]);

        if (doc.autoTable) {
            doc.autoTable({
                head: [tableHeaders],
                body: tableData,
                startY: 30,
                theme: "grid", 
                styles: { fontSize: 10, cellPadding: 4 },
                headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: "bold" },
                columnStyles: { 
                    2: { cellWidth: 80 }, // Task Description (wider)
                    5: { cellWidth: 50 }, // Department
                    6: { cellWidth: 50 }, // IT In Charge
                    8: { cellWidth: 50 }, // Item Name
                    11: { cellWidth: 30 } // Status
                }
            });

            const pdfBlob = doc.output("blob");
            const pdfUrl = URL.createObjectURL(pdfBlob);
            document.getElementById("pdfPreview").src = pdfUrl;

            generatedPDF = doc;

            return doc; 
        } else {
            console.error("jsPDF autoTable plugin is not loaded!");
            return null;
        }
    }
}

const search = {
    search_filter: function() {
        let timeout;
        const searchInput = document.querySelector(".search-input");

        // Restore search input value from localStorage
        const savedSearch = localStorage.getItem("searchQuery");
        if (savedSearch) searchInput.value = savedSearch;

        searchInput.addEventListener("input", function () {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const queryValue = searchInput.value.trim();
                localStorage.setItem("searchQuery", queryValue);
                
                const newUrl = new URL(window.location.href);
                queryValue ? newUrl.searchParams.set("search", queryValue) : newUrl.searchParams.delete("search");

                window.history.pushState({}, "", newUrl);
                await load.load_tasks(null, true); // Reload tasks with the new search query
            }, 500);
        });
    },

    filter_dropdown: function() {
        const filterSelect = document.querySelector(".filter-select");

        const dropdowns = {
            taskStatus: document.querySelector(".status-options"),
            taskDate: document.querySelector(".date-options"),
            severity: document.querySelector(".severity-options"),
            department: document.querySelector(".dept-options"),
        };

        // Hide all dropdowns initially
        Object.values(dropdowns).forEach(dropdown => dropdown.style.display = "none");

        // Restore previous filter state
        const savedFilterBy = localStorage.getItem("filterBy");
        const savedValue = localStorage.getItem("filterValue");

        if (savedFilterBy && dropdowns[savedFilterBy]) {
            filterSelect.value = savedFilterBy;
            dropdowns[savedFilterBy].style.display = "block";
            dropdowns[savedFilterBy].value = savedValue;
        }

        // Handle filter selection change
        filterSelect.addEventListener("change", function () {
            const selectedFilter = this.value;

            // Hide all dropdowns and reset values
            Object.values(dropdowns).forEach(dropdown => {
                dropdown.style.display = "none";
                dropdown.value = "filter";
            });

            if (dropdowns[selectedFilter]) {
                dropdowns[selectedFilter].style.display = "block";
            }
        });

        document.addEventListener("change", async function (event) {
            const selectedDropdown = Object.values(dropdowns).find(dropdown => dropdown === event.target);
            if (!selectedDropdown) return;

            const selectedFilter = filterSelect.value;
            const newValue = selectedDropdown.value;
            const newUrl = new URL(window.location.href);

            if (newValue !== "stop") {
                localStorage.setItem("filterBy", selectedFilter);
                localStorage.setItem("filterValue", newValue);
                newUrl.searchParams.set("filterBy", selectedFilter);
                newUrl.searchParams.set("value", newValue);
            } else {
                localStorage.removeItem("filterBy");
                localStorage.removeItem("filterValue");

                Object.values(dropdowns).forEach(dropdown => dropdown.style.display = "none");
                filterSelect.value = "filter";
                selectedDropdown.value = "none";

                newUrl.searchParams.delete("filterBy");
                newUrl.searchParams.delete("value");
            }

            window.history.pushState({}, "", newUrl);
            await load.load_tasks(null, true); 
        });
    }
}

// Database Logic -- Adding
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
    
        let statusClass = util.get_status_class(task.taskStatus);
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
            <td>${task.problemDetails}</td>
            <td>${task.remarks}</td>
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
            await add.open_task_modal(task);
        });
    
        // Append row to the table body
        tableBody.appendChild(row);
    },

    open_task_modal:  async function(taskData) {
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
                <td>${util.format_date(taskData.dateReq)}</td>
                <td><strong>Date Received:</strong></td>
                <td>${util.format_date(taskData.dateRec)}</td>
            </tr>
            <tr>
                <td><strong>Date Started:</strong></td>
                <td>${util.format_date(taskData.dateStart)}</td>
                <td><strong>Date Finished:</strong></td>
                <td>${util.format_date(taskData.dateFin)}</td>
            </tr>
            <tr>
                <td><strong>Problem Details:</strong></td>
                <td colspan="3">${taskData.problemDetails}</td>
            </tr>
            <tr>
                <td><strong>Problem Remarks:</strong></td>
                <td colspan="3">${taskData.remarks}</td>
            </tr>
        </table>
    `;
    
        taskInfoModal.style.display = "flex";       

        // Set up cancel button event listener
        const cancelTask = document.getElementById('cancelTaskButton');
        cancelTask.onclick = async () => {
            await cancel.cancel_task(taskData.taskId);
        };

        const editTaskButton = document.getElementById('editTaskButton');
        editTaskButton.onclick = async () => {
            Object.values(fetch_data).forEach(fn => {
                fn(true);      
            });
            taskInfoModal.style.display = 'none';
            await update.open_edit_modal(taskData);
        };
    },

    modal_handling: function() {
        const taskModal = document.getElementById('taskModal');
        const taskInfoModal = document.getElementById('taskInfoModal');
        const closeTaskButton = document.querySelector('.close-task');
        const closeButton = document.querySelector('.close');
        const topbar = document.getElementById('topbar');
        const pop = document.querySelector('.notification-popup');
        const currentDate = new Date().toISOString().split('T')[0];

        window.openModal = async function (event) {
            try {

                Object.values(fetch_data).forEach(fn => {
                    fn();      
                });

                const select = document.getElementById('itInCharge');
                const newResponse = await fetch('/api/session-user');
                const newData = await newResponse.json();

                if (newData.fullName) {
                    select.value = newData.fullName;
                }

                taskModal.style.display = "flex";
                document.getElementById('taskDate').value = currentDate;
                document.getElementById('taskId').value = util.generate_unique_id();

            } catch(err) {
                console.error("Error fetching session user:", err);
            }
        };

        const statusField = document.getElementById("new-task");
        const dateReqField = document.getElementById("dateReq");
    
        // Listen for status changes to auto-fill Date Finished
        statusField.addEventListener("click", function () {
            dateReqField.value = currentDate;
        });

        window.addTask = async (event) => {
            event.preventDefault();

            const taskData = {
                taskId: document.getElementById('taskId').value,
                taskDate: currentDate,
                taskStatus: util.get_field_value("taskStatus"),
                severity: util.get_field_value("severity"),
                taskType: util.get_field_value("taskType"),
                taskDescription: util.get_field_value("taskDescription"),
                itInCharge: util.get_field_value("itInCharge"),
                department: util.get_field_value("department"),
                departmentNo: util.get_field_value("departmentNo"),
                requestedBy: util.get_field_value("requestedBy"),
                approvedBy: util.get_field_value("approvedBy"),
                itemName: util.get_field_value("itemName"),
                deviceName: util.get_field_value("deviceName"),
                applicationName: util.get_field_value("applicationName"),
                dateReq: util.get_field_value("dateReq"),
                dateRec: util.get_field_value("dateRec"),
                dateStart: util.get_field_value("dateStart"),
                dateFin: util.get_field_value("dateFin"),
                problemDetails: util.get_field_value("problemDetails"),
                remarks: util.get_field_value("remarks")
            };

            console.log(taskData);
            const newTask = await add.add_to_database(taskData);
            if (newTask) {
                console.log('Task saved:', newTask);
                await load.load_tasks();
                UI.close_modal('taskModal', true);
            } else {
                console.error('Failed to save task');
            }
        };

        // taskInfoModal.addEventListener('click', (event) => UI.close_outside_modal(event, 'submittedContent', 'taskInfoModal'));
        // taskModal.addEventListener('click', (event) => UI.close_outside_modal(event, 'modalContent', 'taskModal'));
        pop.addEventListener('click', (event) => UI.close_outside_modal(event, 'popupContent', 'notificationPopup'));

        if (closeButton) closeButton.addEventListener('click', () => UI.close_modal('taskModal', true));
        if (closeTaskButton) {
            closeTaskButton.addEventListener('click', () => {
                taskInfoModal.style.display = "none";
            });
        }
    }
}

// const mini_table = {
//     it_modal: function() {
//         const taskTypeBtn = document.getElementById('taskTypeBtn');

//         taskTypeBtn.addEventListener("click", async (event) => {
//             event.preventDefault();

//             try {
//                 const response = await fetch('/api/ref-table/task_types');
//                 const data = await response.json();

                
            

//             } catch(err) {
//                 console.error("Error fetching data:", err);
//             }


//         } )
//     },

//     load_small_modal: async function(value) {
//         try {
//             console.e


//         } catch (err) {
//             console.error("Error loading data", err);
//         }
//     }
// }

// Database Logic -- Cancel / Delete
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


// Database Logic -- Updating
const update = {
    open_edit_modal: async function(taskData){
        const editModal = document.getElementById('taskEditModal');
        const editTaskForm = document.getElementById('editTaskForm');
    
        // Define task fields mapping
        const editTaskFields = {
            taskId: "editTaskId", taskStatus: "editTaskStatus", taskDate: "editTaskDate",
            itInCharge: "editItInCharge", department: "editDepartment", departmentNo: "editDepartmentNo",
            taskType: "editTaskType", taskDescription: "editTaskDescription", severity: "editSeverity",
            requestedBy: "editRequestedBy", approvedBy: "editApprovedBy", itemName: "editItemName",
            deviceName: "editDeviceName", applicationName: "editApplicationName", dateReq: "editDateReq",
            dateRec: "editDateRec", dateStart: "editDateStart", dateFin: "editDateFin", problemDetails: "editProblemDetails", remarks: "editRemarks"
        };
    
        const taskFields = {
            taskId: "taskId", taskStatus: "taskStatus", taskDate: "taskDate",
            itInCharge: "itInCharge", department: "department", departmentNo: "departmentNo",
            taskType: "taskType", taskDescription: "taskDescription", severity: "severity",
            requestedBy: "requestedBy", approvedBy: "approvedBy", itemName: "itemName",
            deviceName: "deviceName", applicationName: "applicationName", dateReq: "dateReq",
            dateRec: "dateRec", dateStart: "dateStart", dateFin: "dateFin", problemDetails: "problemDetails", remarks: "remarks"
        };

        util.populate_form_fields(editTaskFields, taskData, taskFields);            
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
    
        const selectedStatus = taskData.taskStatus === "New" ? "Pending" : taskData.taskStatus;
    
        Array.from(statusField.options).forEach(option => option.disabled = false);
        const selectedOption = statusField.querySelector(`option[value="${selectedStatus}"]`);
        if (selectedOption) selectedOption.disabled = true;
    
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
            taskDate: util.get_field_value("editTaskDate"),
            taskStatus: util.get_field_value("editTaskStatus"),
            severity: util.get_field_value("editSeverity"),
            taskType: util.get_field_value("editTaskType"),
            taskDescription: util.get_field_value("editTaskDescription"),
            itInCharge: util.get_field_value("editItInCharge"),
            department: util.get_field_value("editDepartment"),
            departmentNo: util.get_field_value("editDepartmentNo"),
            requestedBy: util.get_field_value("editRequestedBy"),
            approvedBy: util.get_field_value("editApprovedBy"),
            itemName: util.get_field_value("editItemName"),
            deviceName: util.get_field_value("editDeviceName"),
            applicationName: util.get_field_value("editApplicationName"),
            dateReq: util.get_field_value("editDateReq"),
            dateRec: util.get_field_value("editDateRec"),
            dateStart: util.get_field_value("editDateStart"),
            dateFin: util.get_field_value("editDateFin"),
            problemDetails: util.get_field_value("editProblemDetails"),
            remarks: util.get_field_value("editRemarks"),
        };

        if (formData.taskStatus === "New") {
            formData.taskStatus = "Pending";
        }

        console.log("Form data:", formData);
    
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

// HTML/Database Logic -- Loading tasks and page
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

            console.log("Tasks: ", tasks);
    
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
    },

    load_html: async function(url, targetId) {
        try {
            const response = await fetch(url);
            if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const html = await response.text();
            document.getElementById(targetId).insertAdjacentHTML("beforeend", html);

        } catch(err) {
            console.error(`Error loading content from ${url}:`, err);
        }
    }
}

const fetch_data = {
    task_datalist: async function(isEdit = false) {
        try {
            const response = await fetch('/api/ref-table/task_types');
            const data = await response.json();
    
            const container = document.getElementById('taskTypeAdd');
            const select = isEdit ? document.getElementById('editTaskType') : document.getElementById('taskType');
    
            const body = document.getElementById("taskTypeTable");
            body.innerHTML = "";
    
            data.forEach(val => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${val.name}</td>
                    <td>${val.description}</td>
                `;
                row.addEventListener('click', function(event) {
                    event.preventDefault();
                    select.value = val.name;
                    container.style.display = 'none';
                })
                body.appendChild(row);
            });

        } catch (err) {
            console.error("Error loading task data:", err);
        }
    },

    request_datalist: async function(isEdit = false) {
        try {
            const response = await fetch('/api/ref-table/users');
            const data = await response.json();
    
            const container = document.getElementById('requestedByAdd');
            const select = isEdit ? document.getElementById('editRequestedBy') : document.getElementById('requestedBy');
            // select.innerHTML = `<option selected disabled>Select Task Type</option>`; 
    
            const body = document.getElementById("requestTable");
            body.innerHTML = "";
    
            data.forEach(val => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${val.full_name}</td>
                    <td>${val.dep_name}</td>
                    <td>${val.dep_no}</td>
                `;
                row.addEventListener('click', function(event) {
                    event.preventDefault();
                    select.value = val.full_name;
                    container.style.display = 'none';
                })
                body.appendChild(row);
            });

        } catch (err) {
            console.error("Error loading task data:", err);
        }
    },

    approve_datalist: async function(isEdit = false) {
        try {
            const response = await fetch('/api/ref-table/users');
            const data = await response.json();
    
            const container = document.getElementById('approvedByAdd');
            const select = isEdit ? document.getElementById('editApprovedBy') : document.getElementById('approvedBy');
            // select.innerHTML = `<option selected disabled>Select Task Type</option>`; 
    
            const body = document.getElementById("approveTable");
            body.innerHTML = "";
    
            data.forEach(val => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${val.full_name}</td>
                    <td>${val.dep_name}</td>
                `;
                row.addEventListener('click', function(event) {
                    event.preventDefault();
                    select.value = val.full_name;
                    container.style.display = 'none';
                })
                body.appendChild(row);
            });

        } catch (err) {
            console.error("Error loading task data:", err);
        }
    },
            // data.forEach(dept => {
        //     const option = document.createElement("option");
        //     option.value = dept.id;
        //     option.textContent = dept.name;
        //     option.setAttribute("dept-no", dept.department_no);
        //     select.appendChild(option);
        // });

        // // Automatically update departmentNo input when selecting a department
        // select.addEventListener("change", function() {
        //     const selectedOption = select.options[select.selectedIndex]; 
        //     const deptNo = selectedOption.getAttribute("dept-no"); 
        //     departmentNo.value = deptNo || ""; 
        // });
    
    dept_datalist: async function(isEdit = false) {
        try {
            const response = await fetch('/api/ref-table/departments');
            const data = await response.json();
    
            const container = document.getElementById('departmentAdd');
            const select = isEdit ? document.getElementById('editDepartment') : document.getElementById('department');
            const departmentNo = isEdit ? document.getElementById('editDepartmentNo') : document.getElementById('departmentNo');
            // select.innerHTML = `<option selected disabled>Select Department</option>`;    
            
            const body = document.getElementById("deptTable");
            body.innerHTML = "";
    
            data.forEach(val => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${val.name}</td>
                    <td>${val.department_no}</td>
                `;
                row.addEventListener('click', function(event) {
                    event.preventDefault();
                    select.value = val.name;                    
                    departmentNo.value = val.department_no;
                    container.style.display = 'none';
                })
                body.appendChild(row);
            });
            
        } catch(err) {
            console.error("Error loading dept data:", err);
        }
    },

    it_datalist: async function(isEdit = false) {
        try {
            const response = await fetch('/api/ref-table/users');
            const data = await response.json();   
    
            const container = document.getElementById('itAdd');
            const select = isEdit ? document.getElementById('editItInCharge') : document.getElementById('itInCharge');
    
            const body = document.getElementById("itTable");
            body.innerHTML = "";
       
            data.forEach(val => {
                let row = document.createElement("tr");
                row.innerHTML = `<td>${val.full_name}</td>`;
    
                row.addEventListener('click', function(event) {
                    event.preventDefault();
                    select.value = val.full_name; 
                    container.style.display = 'none';
                });
    
                body.appendChild(row);
            });
            
    
        } catch (err) {
            console.error("Error loading IT data:", err);
        }
    },
    

    device_datalist: async function(isEdit = false) {
        try {
            const response = await fetch('/api/ref-table/devices');
            const data = await response.json();

            const container = document.getElementById('deviceAdd');
            const select = isEdit ? document.getElementById('editDeviceName') : document.getElementById('deviceName');

            const body = document.getElementById("deviceTable");
            body.innerHTML = "";
    
            data.forEach(val => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${val.name}</td>
                `;
                row.addEventListener('click', function(event) {
                    event.preventDefault();
                    select.value = val.name;
                    container.style.display = 'none';
                })
                body.appendChild(row);
            });

        } catch(err) {
            console.error("Error loading device data:", err);
        }
    },

    item_datalist: async function(isEdit = false) {
        try {
            const response = await fetch('/api/ref-table/items');
            const data = await response.json();

            const container = document.getElementById('itemAdd');
            const select = isEdit ? document.getElementById('editItemName') : document.getElementById('itemName');

            const body = document.getElementById("itemTable");
            body.innerHTML = "";
    
            data.forEach(val => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${val.name}</td>
                `;
                row.addEventListener('click', function(event) {
                    event.preventDefault();
                    select.value = val.name;
                    container.style.display = 'none';
                })
                body.appendChild(row);
            });

        } catch(err) {
            console.error("Error loading item data:", err);
        }
    },

    app_datalist: async function(isEdit = false) {
        try {
            const response = await fetch('/api/ref-table/applications');
            const data = await response.json();
            
            const container = document.getElementById('applicationAdd');
            const select = isEdit ? document.getElementById('editApplicationName') : document.getElementById('applicationName');

            const body = document.getElementById("appTable");
            body.innerHTML = "";
    
            data.forEach(val => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${val.name}</td>
                `;
                row.addEventListener('click', function(event) {
                    event.preventDefault();
                    select.value = val.name;
                    container.style.display = 'none';
                })
                body.appendChild(row);
            });

        } catch(err) {
            console.error("Error loading item data:", err);
        }
    }
}


// Database Logic -- Page
const prevButton = document.getElementById("prevPage");
const nextButton = document.getElementById("nextPage");
let resizeTimeout;
let currentPage = 1;
let tasksPerPage = 1;
let totalTasks = 0;

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

setTimeout(page.update_tasks_per_page, 150);

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

// Periodic task update Functions --- baguhin pa using Websockets para mas efficient and mas mabilis
let updateInterval; 

const period = {
    check_user: async function() {
        try {
            const response = await fetch('/api/session-user');
            if(!response.ok) return false;

            const data = await response.json();
            return !!data.username;
        } catch (err) {
            console.error("Error checking login status:", err);
            return false;
        } 
    },

    periodic_updates: function() {
        if (!updateInterval) {
            updateInterval = setInterval( async () => {
                if(!document.hidden && await period.check_user()) {
                    await load.load_tasks();
                }
            }, 30000)
        } 
    },

    setup_updates: function() {
        document.addEventListener("visibilitychange", async () => {
            if (document.hidden) {
                clearInterval(updateInterval);
                updateInterval = null;
            } else if (await period.check_user()){
                period.periodic_updates();
            }
        });
        period.periodic_updates();
    }
}

const btn = {
    open_table: function(id) {
        const dept = document.getElementById(id);
        dept.style.display = 'flex';
    }
}

// Helper functions
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

    populate_form_fields: function(fieldMap, taskData, oldMap) {
        console.log(taskData);
        Object.entries(fieldMap).forEach(([key, id]) => {
            const field = document.getElementById(id);
            if (!field) return;
    
            if (field.tagName === "SELECT") {
                util.set_selected_option(field, taskData[key], key === "taskStatus");
            } 
            // else if (field.hasAttribute("data-select")){
            //     const oldField = document.getElementById(oldMap[key]); 
            //     field.value = oldField ? oldField.value : "";
            //     console.log(oldField);
            // } 
            else {
                field.value = taskData[key] || "";
            }
        });
    },

    set_selected_option: function(field, value, isStatusField) {
        for (let i = 0; i < field.options.length; i++) {
            if (field.options[i].textContent === value) {
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
    },

    generate_unique_id: function() {
        return Array.from({ length: 4 }, () => '0123456789'[Math.floor(Math.random() * 10)]).join('');
    },

    get_field_value: function(id) {
        const field = document.getElementById(id);

        if (!field) return "--";
        if (field.getAttribute("data-id") !== null) return field.getAttribute("data-id").trim();

        return field.value.trim() || "--";  
    },

    window_listeners: function() {
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
        
        // Fix back button issue (e.g., after login/logout)
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                window.location.reload();
            }
        });
    },

    session_ends: async function() {
        let sessionInterval;

        fetch('/session-info') // make request
        .then(response => response.json()) // converts to json
        .then(data => { // process
            if (data.expiresAt) {
                const expiresAt = new Date(data.expiresAt).getTime();
                // const warningTime = 5 * 60 * 1000; // 5 minutes before expiration
    
                const checkSession = () => {
                    const now = Date.now();
                    const timeLeft = expiresAt - now;

                    if (timeLeft <= 1) {
                        alert('Your session has expired. Please log in again.');
                        clearInterval(sessionInterval);
                        window.location.replace('/internal/welcome');
                    }
                };
    
                // Check session time every 10 seconds
                sessionInterval = setInterval(checkSession, 10 * 1000);
            }
        })
        .catch(error => console.error('Error fetching session info:', error)); // handle errors
    }
}

// // Function to open the "Add" modal
// const openAddModal = (modalId) => {
//     const modal = document.getElementById(modalId);
//     const table = modal.querySelector('table');
//     const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText);
    
//     // Remove any existing form before adding a new one
//     const existingForm = modal.querySelector('form');
//     if (existingForm) existingForm.remove();

//     const formHtml = headers.map(header => `
//         <label for="${header}">${header}</label>
//         <input type="text" id="${header}" name="${header}" required>
//     `).join('');

//     modal.querySelector('.groups').insertAdjacentHTML('afterend', `<form>${formHtml}<button type="submit">Submit</button></form>`);
//     modal.style.display = 'block';
// };

// // Function to open the "Edit" modal (prefilling is not implemented here but can be added)
// const openEditModal = (modalId) => {
//     openAddModal(modalId); // Reuse add modal logic
// };

// // Function to delete a selected row
// const deleteEntry = (modalId) => {
//     const modal = document.getElementById(modalId);
//     const selectedRow = modal.querySelector('table tbody tr.selected');

//     if (selectedRow) {
//         selectedRow.remove();
//     } else {
//         alert('Please select a row to delete.');
//     }
// };