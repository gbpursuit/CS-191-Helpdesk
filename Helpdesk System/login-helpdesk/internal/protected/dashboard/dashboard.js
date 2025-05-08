import { UI } from '../../common.js';

document.addEventListener("DOMContentLoaded", async function() {
    requestIdleCallback(async() => {
        await load.load_html("/internal/protected/taskModal.html", "dashboardContainer"); // dashboardContainer instead of dashElements
        await load.load_html("/internal/protected/taskEditModal.html", "dashboardContainer"); //since position is absolute

        document.getElementById('containerTable').addEventListener('wheel', (event) => {
            if (event.deltaY !== 0 || event.deltaX !== 0) {
                event.preventDefault();
                event.currentTarget.scrollLeft += event.deltaX + event.deltaY;
            }
        }, { passive: false });
    
        // document.getElementById("printButton").onclick = async function () {
        //     if (!generatedPDF) {
        //         console.log("Generating new PDF...");
        //         generatedPDF = await pdf.generate_pdf();
        //     }
        //     if (generatedPDF) {
        //         generatedPDF.save("summary_report.pdf");
        //     }
        // }; 

        document.getElementById('headerbar').onclick = () => {
            localStorage.setItem('sidebarState', 'false');
            window.location.reload();
        };

        const mediaQuery = window.matchMedia('(max-width: 1070px)');
        update.update_button_text(mediaQuery);
        mediaQuery.onchange = update.update_button_text;
        // mediaQuery.addEventListener('change', update.update_button_text);

        window.close_modal = close_modal;
        window.closePrintModal = closePrintModal;
    
        // Layout Functions
        layout.list_navigation();
        // layout.notification_popup();
    
        // Add Functions
        add.modal_handling();
    
        // Filter Functions
   
        // Period Functions
        // period.setup_updates();

        // Util Functions
        util.window_listeners();
        await util.session_ends();
    
        // UI Functions
        UI.handle_darkmode(".toggle-switch");
        // UI.dropdown_toggle();
        UI.handle_sidebar();
    });
})

const socket = io();

// Get active user
let activeUser = null;
let requested_by = null;
let modifiedDate = null;
let modifiedBy = null;

// Layout Page Logic
const layout = {
    dashboard_open: async function() {
       layout.setup_elem(1);
       generatedPDF = null;
       await page.update_tasks_per_page();
       search.search_filter();
       search.filter_dropdown();
       search.filter_header(); 
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
        layout.reflect_username();
        layout.dropdown_toggle();
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

        summary.onclick = async function(event) {
            event.preventDefault();

            dashboardContainer.style.display = 'none';
            await layout.summary_open();
        };
        
        dashboard.onclick = async function(event){
            event.preventDefault();

            await layout.dashboard_open();
            summaryContainer.style.display = 'none';
        };
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
    },

    reflect_username: async function() {
        try {
            const response = await fetch('/api/session-user');
            const data = await response.json();

            if (data.fullName) {
                // Dynamically update the user's full name
                console.log(data);
                const firstName = data.fullName.split(' ')[0];
                document.getElementById('userFullName').textContent = firstName; 
                document.getElementById("pagename").textContent = data.username;
            } 
            activeUser = data.username;
            requested_by = data.fullName;
            socket.emit('updateSocket', data.username);
        } catch (err) {
            console.error('Error fetching session user:', err);
            window.location.replace('/internal/welcome');
        }
    },

    dropdown_toggle: function() {
        const logoutButton = document.querySelector(".logout-btn");
        const profile = document.querySelector(".user-profile");
        const dropdownMenu = document.getElementById("dropdownMenu");
        const logoutText = document.getElementById('logoutText');

        function toggle_dropdown(event) {
            event.stopPropagation();
            console.log('hiiii');
            dropdownMenu.classList.toggle("show");
        }

        logoutButton.onclick = (event) => {toggle_dropdown(event)};
        profile.onclick = (event) => {toggle_dropdown(event)};        

        // logoutButton.addEventListener("click", toggle_dropdown);
        // profile.addEventListener("click", toggle_dropdown);

        document.addEventListener("click", function(event) {
            if (!dropdownMenu.contains(event.target) && !logoutButton.contains(event.target)) {
                dropdownMenu.classList.remove("show");
            }
        });

        logoutText.addEventListener("click", async function(event) {
            event.preventDefault();
            await layout.logout_function();
            ["searchQuery", "filterBy", "filterValue", "sort", "dir"].forEach(item => localStorage.removeItem(item));
        });

    },

    logout_function: async function() {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                haaders: {
                    'Content-Type':'application/json'
                }
            });

            if(!response.ok) throw new Error('Logout failed');

            socket.emit('logout', activeUser);
            localStorage.setItem('sidebarState', 'closed');
            window.location.replace('/internal/welcome');

        } catch (err) {
            console.error('Error logging out:', err);
        }
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
            return null;
        }
    
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    
        const currentDate = new Date();
        const testing = await pdf.fetch_summary_data();
    
        // const firstTask = testing[0] || {};
        const requestedBy = (requested_by|| "Unknown").toUpperCase();
        const requestTime = new Date(); // Use current time
    
        const taskDates = testing
            .map(task => new Date(task.taskDate))
            .filter(date => !isNaN(date));
    
        const startDate = new Date(Math.min(...taskDates));
        const endDate = new Date(Math.max(...taskDates));
    
        const formatDate = (date) =>
            date.toLocaleDateString("en-PH", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }).toUpperCase();
    
        const formatTime = (date) =>
            date.toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }).toLowerCase();
    
        const tasks = await pdf.fetch_summary_data();
    
        const tableHeaders = [["Trx Date", "IT in Charge", "Task Type", "Task Description", "Department", "Status"]];
    
        const tableData = tasks.map(task => [
            task.taskDate || "", 
            task.itInCharge || "", 
            task.taskType || "", 
            task.taskDescription || "", 
            task.department || "", 
            task.taskStatus || ""
        ]);
    
        if (doc.autoTable) {
            const totalPagesExp = "{total_pages_count_string}";
            
            doc.autoTable({
                head: tableHeaders,
                body: tableData,
                startY: 42,
                theme: "grid",
                styles: {
                    fontSize: 9,
                    cellPadding: 2
                },
                headStyles: {
                    fillColor: [0, 0, 0],
                    textColor: [255, 255, 255],
                    fontStyle: "bold"
                },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 45 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 90 },
                    4: { cellWidth: 45 },
                    5: { cellWidth: 25 }
                },
                margin: { top: 42 },
                didDrawPage: function () {
                    const pageNumber = doc.internal.getNumberOfPages();
                    
                    // Header
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text("PACIFIC PAINT (BOYSEN) PHILIPPINES, INC", 10, 15);
    
                    doc.setFont("helvetica", "normal");
                    doc.text("IT MANAGEMENT - IT SUMMARY REPORT", 10, 22);
                    doc.text(`Date Ranged: ${formatDate(startDate)} to ${formatDate(endDate)}`, 10, 29);
                    doc.text(`Requested By: ${requestedBy} (${formatDate(requestTime)} ${formatTime(requestTime)})`, 10, 36);

                    // Page Number
                    doc.setFontSize(10);
                    doc.text(`Page ${pageNumber} / ${totalPagesExp}`, 325, 15, { align: "right" });
                }
            });

            if (typeof doc.putTotalPages === 'function') {
                doc.putTotalPages(totalPagesExp);
            }
    
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
// ⡴⠒⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠉⠳⡆⠀
// ⣇⠰⠉⢙⡄⠀⠀⣴⠖⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣆⠁⠙⡆
// ⠘⡇⢠⠞⠉⠙⣾⠃⢀⡼⠀⠀⠀⠀⠀⠀⠀⢀⣼⡀⠄⢷⣄⣀⠀⠀⠀⠀⠀⠀⠀⠰⠒⠲⡄⠀⣏⣆⣀⡍
// ⠀⢠⡏⠀⡤⠒⠃⠀⡜⠀⠀⠀⠀⠀⢀⣴⠾⠛⡁⠀⠀⢀⣈⡉⠙⠳⣤⡀⠀⠀⠀⠘⣆⠀⣇⡼⢋⠀⠀⢱
// ⠀⠘⣇⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⡴⢋⡣⠊⡩⠋⠀⠀⠀⠣⡉⠲⣄⠀⠙⢆⠀⠀⠀⣸⠀⢉⠀⢀⠿⠀⢸
// ⠀⠀⠸⡄⠀⠈⢳⣄⡇⠀⠀⢀⡞⠀⠈⠀⢀⣴⣾⣿⣿⣿⣿⣦⡀⠀⠀⠀⠈⢧⠀⠀⢳⣰⠁⠀⠀⠀⣠⠃
// ⠀⠀⠀⠘⢄⣀⣸⠃⠀⠀⠀⡸⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠈⣇⠀⠀⠙⢄⣀⠤⠚⠁⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⢘⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⢰⣿⣿⣿⡿⠛⠁⠀⠉⠛⢿⣿⣿⣿⣧⠀⠀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡀⣸⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⡀⢀⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡇⠹⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡿⠁⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣤⣞⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢢⣀⣠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠲⢤⣀⣀⠀⢀⣀⣀⠤⠒⠉⠀⠀⠀⠀⠀⠀
let generatedTaskPDF;

const taskPDF = {
    generate_task_pdf: function (taskData) {
        console.log(taskData);
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.error("jsPDF is not loaded.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("PACIFIC PAINT (BOYSEN) PHILIPPINES, INC.", 60, 10);
        doc.text("IT HELPDESK FORM", 90, 18);

        doc.setFontSize(10);

        const leftFields = [
            ["Task Type", taskData.taskType],
            ["Task Description", taskData.taskDescription],
            ["Requested By", taskData.requestedBy],
            ["Approved By", taskData.approvedBy],
            ["Department", taskData.department],
            ["Application Name", taskData.applicationName],
            ["IT in Charged", taskData.itInCharge],
            ["Problem Details", taskData.problemDetails],
        ];

        const rightFields = [
            ["Trx Date", taskData.taskDate],
            ["Date Received", taskData.dateRec],
            ["Date Requested", taskData.dateReq],
            ["Severity", taskData.severity],
            ["", ""],
            ["", ""],
            ["", ""],
            ["Remarks", taskData.remarks],
        ];

        let y = 30;
        const lineHeight = 5;
        const maxWidth = 50;

        for (let i = 0; i < leftFields.length; i++) {
            // LEFT column
            const leftLabel = leftFields[i][0];
            const leftValue = leftFields[i][1] || "";
            const leftLines = doc.splitTextToSize(leftValue, maxWidth);
            const leftHeight = leftLines.length * lineHeight;

            doc.setFont("helvetica", "bold");
            doc.text(`${leftLabel}:`, 10, y + lineHeight - 1);
            doc.setFont("helvetica", "normal");
            doc.text(leftLines, 55, y + lineHeight - 1);
            doc.line(55, y + leftHeight + 1, 105, y + leftHeight + 1); // adjusted underline

            // RIGHT column
            const rightLabel = rightFields[i][0];
            const rightValue = rightFields[i][1] || "";
            if (rightLabel) {
                const rightLines = doc.splitTextToSize(rightValue, maxWidth);
                const rightHeight = rightLines.length * lineHeight;

                doc.setFont("helvetica", "bold");
                doc.text(`${rightLabel}:`, 120, y + lineHeight - 1);
                doc.setFont("helvetica", "normal");
                doc.text(rightLines, 155, y + lineHeight - 1);
                doc.line(155, y + rightHeight + 1, 205, y + rightHeight + 1); // adjusted underline

                y += Math.max(leftHeight, rightHeight) + 4;
            } else {
                y += leftHeight + 4;
            }
        }

        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);

        document.getElementById("pdfPreviewTask").src = pdfUrl;
        document.getElementById("taskInfoModal").style.display = "none";
        document.getElementById("taskPDFPreviewModal").style.display = "block";
    }
};

function closePrintModal() {
    document.getElementById("printModal").style.display = "none";
}

// ⡴⠒⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠉⠳⡆⠀
// ⣇⠰⠉⢙⡄⠀⠀⣴⠖⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣆⠁⠙⡆
// ⠘⡇⢠⠞⠉⠙⣾⠃⢀⡼⠀⠀⠀⠀⠀⠀⠀⢀⣼⡀⠄⢷⣄⣀⠀⠀⠀⠀⠀⠀⠀⠰⠒⠲⡄⠀⣏⣆⣀⡍
// ⠀⢠⡏⠀⡤⠒⠃⠀⡜⠀⠀⠀⠀⠀⢀⣴⠾⠛⡁⠀⠀⢀⣈⡉⠙⠳⣤⡀⠀⠀⠀⠘⣆⠀⣇⡼⢋⠀⠀⢱
// ⠀⠘⣇⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⡴⢋⡣⠊⡩⠋⠀⠀⠀⠣⡉⠲⣄⠀⠙⢆⠀⠀⠀⣸⠀⢉⠀⢀⠿⠀⢸
// ⠀⠀⠸⡄⠀⠈⢳⣄⡇⠀⠀⢀⡞⠀⠈⠀⢀⣴⣾⣿⣿⣿⣿⣦⡀⠀⠀⠀⠈⢧⠀⠀⢳⣰⠁⠀⠀⠀⣠⠃
// ⠀⠀⠀⠘⢄⣀⣸⠃⠀⠀⠀⡸⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠈⣇⠀⠀⠙⢄⣀⠤⠚⠁⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⢘⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⢰⣿⣿⣿⡿⠛⠁⠀⠉⠛⢿⣿⣿⣿⣧⠀⠀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡀⣸⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⡀⢀⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡇⠹⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡿⠁⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣤⣞⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢢⣀⣠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠲⢤⣀⣀⠀⢀⣀⣀⠤⠒⠉⠀⠀⠀⠀⠀⠀

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
                search.filter_logic(true, true);
            }, 500);
        });
    },

    filter_dropdown: function() {
        const filterSelect = document.querySelector(".filter-select");

        const dropdowns = {
            taskStatus: document.querySelector(".status-options"),
            severity: document.querySelector(".severity-options"),
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
        filterSelect.onchange = function() {
            const selectedFilter = this.value;

            // Hide all dropdowns and reset values
            Object.values(dropdowns).forEach(dropdown => {
                dropdown.style.display = "none";
                dropdown.value = "filter";
            });

            if (dropdowns[selectedFilter]) {
                dropdowns[selectedFilter].style.display = "block";
            }
        };

        document.onchange = async function(event) {
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
            search.filter_logic(true, true);
        };
    },

    filter_header: function() {
        const tableHeader = document.getElementById('taskTableHeader');
        const thElements = tableHeader.querySelectorAll('th');
        let taskList = ['Task Type', 'Task Description', 'Task Date', 'Requested By', 'Severity', 'Status', 'Department', 'IT in Charge'];

        const savedSort = localStorage.getItem('sort');
        const savedDir = localStorage.getItem('dir');

        if (savedSort && savedDir) {
            thElements.forEach(th => {
                if (th.getAttribute('data-column') === savedSort) {
                    const icon = document.createElement('i');
                    icon.classList.add('fa-solid', savedDir === 'ASC' ? 'fa-sort-up' : 'fa-sort-down');
                    th.appendChild(icon);
                }
            });
            // Trigger data sorting logic after restoring state
            search.filter_logic(true, true);
        }

        thElements.forEach((th) => {
            if (taskList.includes(th.textContent.trim())) {
                const filterBy = th.getAttribute('data-column');
        
                th.onclick = () => {
                    const url = new URL(window.location.href);
                    const currentSort = url.searchParams.get("sort");
        
                    // Clear all icons first
                    thElements.forEach(otherTh => {
                        if (otherTh !== th) {
                            const otherIcon = otherTh.querySelector('i');
                            if (otherIcon) {
                                otherTh.removeChild(otherIcon);
                            }
                        }
                    });
        
                    let icon = th.querySelector('i');
        
                    if (!icon || currentSort !== filterBy) {
                        // DESC
                        icon = document.createElement('i');
                        icon.classList.add('fa-solid', 'fa-sort-down');
                        th.appendChild(icon);
        
                        search.update_sort(filterBy, 'DESC', true);
                        search.filter_logic(true, true);
                    } else if (icon.classList.contains('fa-sort-down')) {
                        // ASC
                        icon.classList.remove('fa-sort-down');
                        icon.classList.add('fa-sort-up');
        
                        search.update_sort(filterBy, 'ASC', true);
                        search.filter_logic(true, true);
                    } else {
                        // NORMAL
                        icon.remove();
                        search.update_sort(null, null, false);
                        search.filter_logic();
                    }
                };
            }
        });
    },

    filter_logic: function(pass = false, check = false) {
        const url = new URLSearchParams(window.location.search);
        const sort = url.get('sort');
        const dir = url.get('dir');
        const filterBy = url.get("filterBy");
        const value = url.get("value");
        const search = url.get('search');

        if (pass === false && !filterBy && !search) {
            list_update_page();
            return;
        } else {
            let taskCopy = initialTasks.map(task => ({ ...task })); // deepcopy
            let type = ['taskType', 'taskDescription', 'problemDetails', 'remarks'];

            if (search) {
                taskCopy = taskCopy.filter(task => {
                    return type.some(field => 
                        String(task[field]).toLowerCase().includes(search.toLowerCase())  
                    );
                });
            }

            if (filterBy && value !== null) {
                taskCopy = taskCopy.filter(task => String(task[filterBy]).toLowerCase() === value);
                console.log('been here');
            }
            
            if (sort) {
                taskCopy.sort((a, b) => {
                    if (String(a[sort]).toLowerCase() < String(b[sort]).toLowerCase()) return dir === 'ASC' ? -1 : 1;
                    if (String(a[sort]).toLowerCase() > String(b[sort]).toLowerCase()) return dir === 'ASC' ? 1 : -1;
                    return 0;
                });
                // console.log('been hereeee');
                console.log(taskCopy);
            }

            if (check === true) {
                list_update_page(taskCopy);
                return;
            }
        }
        
    },

    update_sort: function(sort, dir, store = true) {
        const url = new URL(window.location.href);
        if (sort && dir) {
            url.searchParams.set("sort", sort);
            url.searchParams.set("dir", dir);
            window.history.pushState({}, "", url);
    
            if (store) {
                localStorage.setItem('sort', sort);
                localStorage.setItem('dir', dir);
            }
        } else {
            url.searchParams.delete("sort");
            url.searchParams.delete("dir");
            window.history.pushState({}, "", url);
    
            if (!store) {
                localStorage.removeItem('sort');
                localStorage.removeItem('dir');
            }
        }
    }
}

// Database Logic -- Adding
const add = {
    add_to_database: async function(taskData){
        try {
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
        row.setAttribute("tabindex", "0");
    
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
        async function row_action(event, row, task) {
            event.preventDefault();
            row.blur();
            await add.open_task_modal(task);
        }

        row.onclick = async function(event) {
            await row_action(event, row, task);
        };
        
        row.onkeydown = async function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                await row_action(event, row, task);
            }
        };

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

        // socket.on('cancelLoadTask', async() => {
        //     console.log('Cancelling load task socket called.');
        //     await load.load_tasks();
        // })

        const bottomId = document.getElementById('bottom');
        bottomId.querySelector('.edit-btn').onclick = async () => {
            Object.values(fetch_data).forEach(fn => {
                fn(true);      
            });
            taskInfoModal.style.display = 'none';
            await update.open_edit_modal(taskData);
        };

        bottomId.querySelector('.print-btn').onclick = () => {
            taskPDF.generate_task_pdf(taskData);
        };

        bottomId.querySelector('.duplicate-btn').onclick = () => {
            update.duplicate_job(taskData);
        };

        bottomId.querySelector('.cancel-btn').onclick = async () => {
            await cancel.cancel_task(taskData.taskId);
        };

        bottomId.querySelector('.modified-btn').onclick = async () => {
            const modifyContent = document.getElementById('modifyContent');
            modifyContent.style.display = 'flex';

            if (!modifiedDate) modifiedDate = 'No modification yet';
            if (!modifiedBy) modifiedBy = 'No modification yet';
        
            const updateContent = () => {
                if (window.innerWidth <= 700) {
                    modifyContent.querySelector('.modifyName').textContent = `${modifiedBy}`;
                    modifyContent.querySelector('.modifyTime').textContent = `${modifiedDate}`;
                } else {
                    modifyContent.querySelector('.modifyName').textContent = `Last Modified By: ${modifiedBy}`;
                    modifyContent.querySelector('.modifyTime').textContent = `Time Modified: ${modifiedDate}`;
                }
            };
        
            updateContent(); 
            window.addEventListener('resize', updateContent);

            const closeTask = modifyContent.querySelector('.close-task');
            closeTask.onclick = () => {
                modifyContent.style.display = 'none';
            }
        } 
    },

    modal_handling: function() {
        const taskModal = document.getElementById('taskModal');
        const taskInfoModal = document.getElementById('taskInfoModal');
        const closeTaskButton = document.querySelector('.close-task');
        const closeButton = document.querySelector('.close');
        const topbar = document.getElementById('topbar');
        const pop = document.querySelector('.notification-popup');
        const currentDate = new Date().toISOString().split('T')[0];

        window.openModal = async function () {
            try {
                Object.values(fetch_data)
                .filter(fn => fn !== fetch_data.it_datalist) 
                .forEach(fn => fn());       

                const select = document.getElementById('ItInCharge');
                const newResponse = await fetch('/api/session-user');
                const newData = await newResponse.json();

                if (newData.fullName) {
                    await fetch_data.it_datalist(false, newData.fullName)
                    select.value = newData.fullName;
                }

                taskModal.style.display = "flex";
                document.getElementById("dateReq").value = currentDate;
                document.getElementById("dateRec").value = currentDate ;
                document.getElementById('taskDate').value = currentDate;
                document.getElementById('taskId').value = util.generate_unique_id();

            } catch(err) {
                console.error("Error fetching session user:", err);
            }
        };

        const statusField = document.getElementById("taskStatus");
        const dateStartField = document.getElementById("dateStart");
        const dateFinField = document.getElementById("dateFin");
    
        statusField.onchange = () => {
            const newStatus = statusField.value;

            if (newStatus === "Completed") {
                if (!dateStartField.value) {
                    dateStartField.value = currentDate;
                }
                dateFinField.value = currentDate;
            } else if (newStatus === "In Progress") {
                if (!dateStartField.value) {
                    dateStartField.value = currentDate;
                }
                dateFinField.value = "";
            } else {
                dateStartField.value = "";
                dateFinField.value = "";
            }
        }



        // Load tasks to other receivers -- prolly mga admin
        socket.on('loadTask', (file) => {
            console.log('Ading load task socket called.');
            initialTasks.unshift(file.taskFile);
            list_update_page();
        })

        window.addTask = async (event) => {
            event.preventDefault();

            const taskData = {
                taskId: document.getElementById('taskId').value,
                taskDate: currentDate,
                taskStatus: util.get_field_value("taskStatus"),
                severity: util.get_field_value("severity"),
                taskType: util.get_field_value("TaskType"),
                taskDescription: util.get_field_value("taskDescription"),
                itInCharge: util.get_field_value("ItInCharge"),
                department: util.get_field_value("department"),
                departmentNo: util.get_field_value("departmentNo"),
                requestedBy: util.get_field_value("RequestedBy"),
                approvedBy: util.get_field_value("ApprovedBy"),
                itemName: util.get_field_value("Item"),
                deviceName: util.get_field_value("Device"),
                applicationName: util.get_field_value("Application"),
                dateReq: util.get_field_value("dateReq"),
                dateRec: util.get_field_value("dateRec"),
                dateStart: util.get_field_value("dateStart"),
                dateFin: util.get_field_value("dateFin"),
                problemDetails: util.get_field_value("problemDetails"),
                remarks: util.get_field_value("remarks")
            };

            const requiredFields = Object.keys(taskData).filter(key => {
                const field = document.getElementById(key);
                return field && field.getAttribute("data-set") === "true";
            });
        
            // Check if any required field is null
            const missingFields = requiredFields.filter(key => !taskData[key]);
        
            if (missingFields.length > 0) {
                console.error("Form contains errors. Please fill all required fields:", missingFields);
                return; // Prevent form submission
            }

            // console.log(taskData);
            const newTask = await add.add_to_database(taskData);
            if (newTask) {
                console.log(taskData);

                const updatedTaskFile = {
                    ...taskData,
                    taskDate: taskData.taskDate ? new Date(taskData.taskDate).toLocaleDateString('en-CA') : null,
                    dateReq: taskData.dateReq ? new Date(taskData.dateReq).toLocaleDateString('en-CA') : null,
                    dateRec: taskData.dateRec ? new Date(taskData.dateRec).toLocaleDateString('en-CA') : null,
                    dateStart: taskData.dateStart ? new Date(taskData.dateStart).toLocaleDateString('en-CA') : null,
                    dateFin: taskData.dateFin ? new Date(taskData.dateFin).toLocaleDateString('en-CA') : null
                };
    
                initialTasks.unshift(updatedTaskFile);
                socket.emit('addTask', { task: updatedTaskFile, user: activeUser });
                list_update_page();

                UI.close_modal('taskModal', true);
            } else {
                console.error('Failed to save task');
            }
        };

        // pop.onclick = function(event) {UI.close_outside_modal(event, 'popupContent', 'notificationPopup')};
        // pop.addEventListener('click', (event) => UI.close_outside_modal(event, 'popupContent', 'notificationPopup'));

        if (closeButton) {
            closeButton.onclick = () => {
                const form = document.getElementById('newTaskForm');
                const rotwo = document.getElementById('rowtwoulit')
                const textarea = document.querySelector('.outside textarea');
                if (taskModal) {
                    taskModal.style.display = "none";
                    textarea.style.height = '50px';
                    if (form) {
                        form.reset(); 
                    }
                }
            };
        }

        if (closeTaskButton) {
            closeTaskButton.onclick = () => {
                taskInfoModal.style.display = "none";
            };
        }
    }
}

// Database Logic -- Cancel / Delete
const cancel = {
    is_cancelled: async function(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch task details");
            }
            console.log(response);
            const taskData = await response.json();
            
            return taskData[0].taskStatus === "Cancelled"; 
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
                socket.emit('updateTask', {check: 'cancel', user: activeUser});
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

        socket.on('updateLoadTask', async() => {
            console.log('Updating load task socket called.');
            await load.load_tasks(null, true);
        })
    
        // Define task fields mapping
        const editTaskFields = {
            taskId: "editTaskId", taskStatus: "editTaskStatus", taskDate: "editTaskDate",
            itInCharge: "editItInCharge", department: "editDepartment", departmentNo: "editDepartmentNo",
            taskType: "editTaskType", taskDescription: "editTaskDescription", severity: "editSeverity",
            requestedBy: "editRequestedBy", approvedBy: "editApprovedBy", itemName: "editItem",
            deviceName: "editDevice", applicationName: "editApplication", dateReq: "editDateReq",
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
    
        statusField.onchange = () => {
            const currentDate = new Date().toISOString().split('T')[0];
            const newStatus = statusField.value;

            if (newStatus === "Completed") {
                if (!dateStartField.value) {
                    dateStartField.value = currentDate;
                }
                dateFinField.value = currentDate;
            } else if (newStatus === "In Progress") {
                if (!dateStartField.value) {
                    dateStartField.value = currentDate;
                }
                dateFinField.value = "";
            } else {
                dateStartField.value = "";
                dateFinField.value = "";
            }
        };
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
            itemName: util.get_field_value("editItem"),
            deviceName: util.get_field_value("editDevice"),
            applicationName: util.get_field_value("editApplication"),
            dateReq: util.get_field_value("editDateReq"),
            dateRec: util.get_field_value("editDateRec"),
            dateStart: util.get_field_value("editDateStart"),
            dateFin: util.get_field_value("editDateFin"),
            problemDetails: util.get_field_value("editProblemDetails"),
            remarks: util.get_field_value("editRemarks"),
        };

        const requiredFields = Object.keys(formData).filter(key => {
            const field = document.getElementById(key);
            return field && field.getAttribute("data-set") === "true";
        });

        // console.log(requiredFields);
    
        // Check if any required field is null
        const missingFields = requiredFields.filter(key => !formData[key]);
    
        if (missingFields.length > 0) {
            console.error("Form contains errors. Please fill all required fields:", missingFields);
            return; // Prevent form submission
        }

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
            // console.log(data.message, data);

            const now = new Date();
            const optionsDate = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            
            const optionsTime = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            
            const date = now.toLocaleDateString('en-US', optionsDate); 
            const time = now.toLocaleTimeString('en-US', optionsTime); 
            const modified = `${date} | ${time}`;
            modifiedDate = modified;
            modifiedBy = formData.itInCharge;


            const newTasksPerPage = page.task_per_page();
            if (newTasksPerPage !== tasksPerPage) tasksPerPage = newTasksPerPage;
    
            socket.emit('updateTask', {check: 'update', user: activeUser});
            await load.load_tasks(null, true);
            editModal.style.display = "none";

        } catch (error) {
            console.error("Error:", error);
            alert(error.message.includes("Failed to fetch") 
                ? "Network error. Please check your connection and try again." 
                : error.message
            );
        }
    },
    // <i class="fa-solid fa-clipboard-list"></i>
    update_button_text: function(mediaQuery) {
        const bottomId = document.getElementById('bottom');
        const buttons = bottomId.querySelectorAll('.update-btn');
        buttons.forEach(btn => {
            if (mediaQuery.matches) {
                if (btn.id.includes('edit')) btn.innerHTML = '<i class="fa-solid fa-pen"></i>';
                if (btn.id.includes('print')) btn.innerHTML = '<i class="fa-solid fa-print"></i>';
                if (btn.id.includes('duplicate')) btn.innerHTML = '<i class="fa-solid fa-copy"></i>';
                if (btn.id.includes('modified')) btn.innerHTML = '<i class="fa-solid fa-clipboard-list"></i>';
                if (btn.id.includes('cancel')) btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                btn.classList.remove('add-gap');
            } else {
                if (btn.id.includes('edit')) btn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
                if (btn.id.includes('print')) btn.innerHTML = '<i class="fa-solid fa-print"></i> Print';
                if (btn.id.includes('duplicate')) btn.innerHTML = '<i class="fa-solid fa-copy"></i> Duplicate';
                if (btn.id.includes('modified')) btn.innerHTML = '<i class="fa-solid fa-clipboard-list"></i> Modified By';
                if (btn.id.includes('cancel')) btn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancel';
                btn.classList.add('add-gap');
            }
        });
    },

    duplicate_job: async function(taskData) {
        const taskInfoModal = document.getElementById('taskInfoModal');

        const { id, taskId, ...rest } = taskData;
        const task_to_submit = {
            ...rest,
            taskId: util.generate_unique_id(),
            taskStatus: "Pending"
        };

        try {
            const response = await fetch('/api/tasks/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task_to_submit)
            });
    
            const data = await response.json();
    
            if (!response.ok) {  
                throw new Error(data.error || "Failed to duplicate task");
            }

            if(!data.success) return;

            alert('Task duplicated successfully');

            const newTasksPerPage = page.task_per_page();
            if (newTasksPerPage !== tasksPerPage) tasksPerPage = newTasksPerPage;
    
            initialTasks.unshift(task_to_submit);
            socket.emit('addTask', { task: task_to_submit, user: activeUser });
            list_update_page();
            taskInfoModal.style.display = 'none';

        } catch (error) {
            console.error("Error:", error);
            alert(error.message.includes("Failed to fetch") 
                ? "Network error. Please check your connection and try again." 
                : error.message
            );
        }
        // update.update_task(taskId, task_to_submit);
        // await update.submit_edited_task(taskData.taskId);
    }
}

// HTML/Database Logic -- Loading tasks and page
let initialTasks = [];
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
            // /api/tasks
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
            const t_pages = Math.ceil(totalTasks / tasksPerPage);
            totalPages = t_pages

            if (currentPage > totalPages) {
                currentPage = 1;
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('page', currentPage);
                window.history.pushState({}, '', newUrl);
            }
    
            tableBody.innerHTML = ""; 

            const table = document.querySelector('.task-table');
            const noData = document.getElementById('noData');
            
            if (totalTasks === 0) {
                table.style.display = 'none';
                noData.style.display = 'flex';  
                document.querySelector('.fixed-bottom').style.display = 'none';
            } else {
                table.style.display = 'table';
                noData.style.display = 'none';  
                document.querySelector('.fixed-bottom').style.display = 'flex';
            }

            initialTasks = tasks;
            console.log(initialTasks);
    
            const startIndex = (currentPage - 1) * tasksPerPage;
            const endIndex = startIndex + tasksPerPage;
            const paginatedTasks = tasks.slice(startIndex, endIndex);
    
            paginatedTasks.forEach(task => {
                add.add_to_table(task);
            });

            page.update_pagination();
    
            // const newUrl = new URL(window.location.href);
            // newUrl.searchParams.set('page', currentPage); // Always update page number
            // if (searchQuery) {
            //     newUrl.searchParams.set('search', searchQuery);
            // } else {
            //     newUrl.searchParams.delete('search');
            // }
            // if (filterBy && filterValue) {
            //     newUrl.searchParams.set('filterBy', filterBy);
            //     newUrl.searchParams.set('value', filterValue);
            // } else {
            //     newUrl.searchParams.delete('filterBy');
            //     newUrl.searchParams.delete('value');
            // }
            // window.history.pushState({}, '', newUrl);
    
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
    },

    load_reference: async function (table, check = 'false') {
        try {    
            const lookupUrl = new URLSearchParams(window.location.search);
            const searchQuery = lookupUrl.get('lookupSearch') || '';

            let url = new URL(`/api/search-table?table=${table}`, window.location.origin);
            if (searchQuery) {
                url.searchParams.set('lookupSearch', searchQuery);
            } else {
                url.searchParams.set('check', 'false');
            }

            // console.log(url.toString());
            const response = await fetch(url.toString());

            if (!response.ok) {
                console.log('testing');
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Error loading reference tasks:", err);
            return null;
        }
    }
}

const edit_button = async (table, id, val) => {
    try {
        const response = await fetch(`/api/edit-table/${table}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id, val })
        });
        const data = await response.json();

        if(!response.ok) {
            alert("Error editing task" + data.error);
            return { success: false };
        };

        return { success: true, value: data };

    } catch (err) {
        console.error(`Error editing lookup table: ${table}`, err);
    }
};

// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠂⠠⣦⢶⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⠤⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⡧⠯⠁⠘⣽⡿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡟⠠⢶⣶⣿⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡛⣩⣵⡂⠀⢐⡒⡆⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠨⣵⣻⣧⣽⣳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢸⡿⣞⡿⣋⡄⠀⠀⢭⣑⢻⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡇⠀⠀⠔⠫⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣸⣾⣧⣶⠟⡋⣀⡀⠀⢀⣀⣯⢎⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣷⠀⠀⠠⢶⣶⣞⣻⢿⣾⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣈⣾⣫⣿⣽⣶⣯⣟⡶⠄⠀⠀⠲⠄⢧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⡆⠀⣴⣓⠚⠛⣿⣿⣿⣾⣿⣿⣷⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⣀⣀⣀⣀⣀⡀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⡿⠟⠉⠁⠀⠀⠀⠂⡧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡀⠉⠉⠉⣳⣿⣶⣿⣿⣿⣿⣿⣿⣿⣷⡶⣴⣴⣶⡛⠛⠉⠉⠉⠉⠉⠀⢠⠛⠛⢿⣟⣯⣷⣾⣿⣿⣿⣿⣿⣿⣟⣛⣭⡴⠄⠀⠀⠀⠀⠈⠆⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡧⠀⠀⠈⢉⣉⣿⣿⣿⣿⣿⠿⣛⣿⡿⠀⠀⠀⠻⢿⣦⢀⣀⡀⠀⠀⣤⣇⣀⣼⡞⠈⠉⠉⠉⣀⠉⠛⠻⢿⣿⣿⣟⠓⣦⠔⠀⠀⠀⠀⠀⠨⡕⠅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣇⠀⣤⣬⣿⣿⠟⠛⠉⠁⠀⠘⣿⣿⠇⠀⠀⠑⠀⠘⠿⠟⠛⠙⠦⡞⠉⠛⠾⠃⠀⠀⠀⠀⠀⢿⣿⣧⠀⠀⠀⠈⠙⢷⣶⣼⡒⠓⠂⠀⢀⠀⠍⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣾⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠘⠿⠀⠀⣀⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠾⡿⠉⠀⠀⠀⠀⠀⠀⠙⠿⣿⣶⡄⠀⢸⡇⡆⠀⠐⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠏⠉⢀⣰⣷⡿⠷⣾⣶⣶⣤⣀⠀⠀⠀⠀⠹⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡰⠈⠀⠀⠀⠁⣀⣤⣶⣾⣽⣿⣷⣤⣄⠀⠉⠛⣧⣿⠽⡀⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡾⠥⠤⠴⣾⡿⠃⢠⣾⣿⡟⠉⠉⣻⡗⢄⠀⠀⠀⠈⠣⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠁⠀⠀⡴⡏⠎⢿⣿⠋⠐⢿⣿⣏⠈⢹⣦⠀⠀⠀⢹⡙⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⢏⠀⠀⠀⠀⢿⣇⠀⢸⣿⣿⣧⣀⣰⣿⡇⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⡈⡇⠀⡀⢸⣦⣤⡀⣼⣿⢿⠀⠀⢀⠈⠁⠀⠣⣄⠘⣳⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⠃⠀⠁⠄⡀⠀⠀⠛⠦⠌⠿⠿⢿⠿⠿⠋⣠⣾⣿⡀⢀⡤⠖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⢸⣿⣄⡀⠈⠻⢿⢿⠿⡿⠁⣀⡸⠃⠀⠀⠀⣠⠀⠻⢮⢥⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠁⠀⠀⠀⠀⠀⠀⠃⠰⠠⢄⡀⠀⠀⠀⠀⠀⠀⠀⣨⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠿⣷⣜⠋⠉⠉⠉⠉⠓⠀⠐⠀⠈⠈⠄⠀⡄⠐⠈⠁⠁⠀⡁⠂⠁⠘⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠐⠒⠠⢀⠠⢺⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢷⣦⡀⠀⠄⠀⠤⠀⠀⠐⠀⠉⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⢀⢀⡑⠝⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡏⠀⣠⣤⣠⣀⡀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠀⠀⠀⠀⣀⣤⣤⣤⣦⣤⣤⣤⣤⣤⣤⣤⣤⣀⠀⠀⠀⠀⠙⠛⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡠⠀⢰⣄⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⢈⣭⣿⠷⠚⠛⠙⢹⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢿⣿⣿⣿⣿⣿⣽⣿⣻⣟⣿⣽⣻⣟⣿⡷⠀⠀⠀⠀⠀⠐⢡⢀⠀⠀⠀⠀⠀⢀⣶⣴⣦⣤⣤⣄⡀⠀⢀⣶⡧⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⠀⠀⠈⠁⠀⠀⠀⠀⢸⣿⡆⠀⠀⠶⠆⢾⠃⠀⠷⠀⠀⠀⠀⠀⠈⠉⠉⢿⣟⣿⣿⣽⣿⡾⣿⡅⠀⠀⠀⠀⠀⠀⠀⢠⡄⢠⢯⠐⣀⠀⢀⣀⡈⠉⠉⠙⠙⠛⠛⠳⢚⡾⣽⡋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⢀⡀⢠⣶⠀⣴⡄⠀⠀⠀⠀⠀⠀⠀⠙⢯⣿⣾⣿⣏⡿⠃⠀⠀⠀⠀⠀⠀⠀⠠⣄⠠⣠⣀⡀⡈⠉⠉⠀⠀⠀⠀⠀⠀⢀⣤⡖⣿⠁⠴⣾⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢧⠀⠀⠀⠀⠀⠀⠀⠀⠹⠃⠀⠀⠀⡀⠀⢀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠉⠐⠀⠀⠀⠀⢠⡴⠞⠋⠁⠀⠀⠀⣠⢂⣥⠡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⣤⣤⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣧⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠀⠈⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠤⢈⡋⠉⠁⠀⠀⠚⠄⠌⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠏⠡⢺⡿⠏⠀⠀⡠⠀⠀⠀⠀⠀⠀⠐⠒⠠⠤⠄⠠⠤⠤⠤⠴⠒⠚⠉⠉⠉⠉⠉⠉⠓⠲⠤⢤⣀⣀⡀⣀⠤⠒⡖⠊⠩⠉⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠁⢴⡃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠏⠀⠀⠼⣅⠀⠀⢩⢶⣿⣿⣿⣶⠶⠚⠀⠀⠀⠀⠀⠐⠤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⡄⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⡑⠘⡮⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠏⠀⠀⢠⠎⠁⠀⠀⠀⠈⠉⠁⠉⠉⠟⠋⠽⢴⣂⣥⣀⣀⣀⣈⡉⢒⡶⠦⣀⣀⣀⣠⣀⣀⣀⣤⣴⣶⠿⠛⠁⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢬⣿⣡⣗⡅⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡏⠀⠀⠀⠀⠀⢡⠔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠁⠉⠉⠉⠀⠀⠀⠉⠉⠉⡍⠉⠉⢉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣄⣹⣿⣿⣖⣹⠨⣏⡐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢷⠀⠀⠀⠀⢰⠃⠤⠊⢠⠴⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⠀⠀⢸⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⣄⣤⣄⣹⣿⠛⡓⠂⠀⠙⠀⢻⠬⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣤⠄⠀⠀⠀⠀⣴⠈⠛⢻⢛⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⠞⠀⠀⠀⠈⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣄⠀⠀⠀⠀⠀⠤⣄⣷⣬⣙⡛⠛⠉⠀⠀⠀⠀⣒⡰⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠃⢼⣿⡇⠀⠀⠀⠀⠈⠁⠀⠟⠉⢩⣭⢉⣠⢀⡤⠀⠀⠀⠀⠀⠀⠀⢀⣾⠇⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣔⢆⢸⡀⠀⢀⣰⣠⡿⠒⠂⠈⠀⠁⠀⠀⠀⢀⠈⢠⣳⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡄⠀⠿⢟⡿⣶⡀⠀⠀⠀⠀⠀⠀⠸⠋⠡⣰⢿⣧⣞⣡⣾⣀⣄⣤⡾⠋⠈⠀⠀⠀⠀⠀⠀⠀⠀⢳⡈⢿⣆⣠⣀⢠⢀⡀⢠⣬⣏⣳⣬⠿⠛⠃⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⡰⣟⣿⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡀⠀⠈⣼⠥⣿⣧⣶⣾⣀⡀⠀⠀⠀⠀⠁⠘⠁⠐⠛⠁⠘⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠃⠀⠉⠉⠛⠿⠿⠟⢻⣿⠉⠛⠙⠒⠒⠀⠀⠀⠀⠀⠀⠀⠀⢈⣷⣾⣾⣧⣎⡯⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⢰⣀⠀⢠⠿⣿⣿⣿⣼⣧⣾⢀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠐⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣝⠒⢶⣿⡿⢿⡏⠁⠼⠁⡋⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣷⡼⣿⣄⠀⠀⠀⢨⠿⢻⣿⣿⣧⣾⣷⣏⣡⢀⣠⣷⣖⣴⣶⣶⣾⠤⢀⣤⣴⡾⠁⠀⠀⠘⣿⡷⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⢰⣶⣀⠰⣿⣷⣾⠏⠉⠀⠸⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⢻⠿⠇⡀⠀⠀⠀⠘⠈⠁⠀⡽⠛⠟⠋⣵⣾⡿⠿⠛⡿⠋⠁⡰⢫⢯⢿⠁⠀⠀⠀⠀⠘⠳⣽⣿⣦⢀⣞⣤⡀⠹⣤⣦⠀⡀⢴⢠⠀⢳⣿⣭⣛⠻⠏⠉⠉⠀⠀⠀⡨⢸⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣟⣾⣿⣷⣿⣧⡄⠀⠀⠀⠀⠀⠀⠀⠀⠒⠚⠉⠀⠀⠈⠀⠀⠊⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠻⣿⢿⡿⣿⡦⣼⣿⡳⣽⣽⣷⠷⢬⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⢀⡨⣠⠴⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⢩⣯⣼⣿⣿⡿⠻⡜⣦⣠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⠀⠀⠈⠙⠋⠉⠉⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢀⠐⣤⣼⣿⢩⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡇⣾⣽⣿⣿⢟⣵⢿⡇⣻⡿⣇⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠲⣤⣀⠀⠀⠀⠀⠀⠀⠀⢠⣠⢤⡀⠀⠤⠀⠀⠐⠀⠐⡐⣤⣿⣂⣿⠿⣷⠿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣻⢿⣿⢯⣾⣿⣿⣷⣿⢗⡙⢃⣷⣾⠀⡆⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠇⠀⠑⠆⠀⠀⠀⠀⠲⠌⠉⠁⠁⠀⠀⢠⡀⢤⣐⣈⣿⣿⣿⣿⣿⣿⣿⠦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣳⢯⣿⣿⢏⣾⣿⣿⣿⣾⣼⡿⠁⡿⠏⢻⡸⣇⣶⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢤⣀⣀⣀⠀⣐⣶⣾⣹⣯⣷⣚⠿⣷⣿⣿⣿⣿⡟⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠇⣾⣿⣿⣿⣿⣿⣿⣿⣿⡟⣁⣼⠟⣐⣬⡷⣠⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢰⣤⣴⣶⣶⠾⣷⣦⣽⡿⢩⣌⠻⣿⣷⣯⣟⡿⣿⣿⣿⣿⣿⣿⠇⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡟⢀⣼⣿⣿⣿⣿⣿⣿⡿⣋⣴⠟⣡⣶⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠿⣿⣷⣹⣿⡷⣿⣦⣻⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⡿⡏⣯⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢘⡇⠸⣿⢋⣿⠟⠋⢁⡿⢠⠛⠠⠌⠉⣿⡿⣿⣿⡿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣷⢿⣿⣿⣿⣿⡟⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢷⣧⣼⡀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀

// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⠀⠀⠀⠀⢀⣠⣀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⡇⠀⠀⣴⣿⠿⣿⠃⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⠀⠀⣸⡿⠈⣼⡏⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⠿⠀⠀⣿⠃⣸⡟⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣠⣶⣶⣿⣶⣶⣤⣾⣠⡿⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⢀⣀⣠⣤⣴⠶⠒⠛⠻⢿⣿⡏⠉⠉⠉⠉⠙⠻⢿⣿⣿⣥⡀⠀⠀⠀⠀⠀⠀⠁
// ⠀⠀⣾⣿⣿⣿⣿⣿⣷⡴⠀⠐⠒⠠⣿⠷⠂⠐⠒⠒⠴⣤⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀
// ⠀⠀⢼⣿⣿⣿⣿⣿⣿⣧⠰⡆⠀⠀⡿⣷⡤⣶⠀⠀⡀⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
// ⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣷⣯⣴⣾⣾⣿⣷⣾⣦⣶⣷⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀
// ⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀
// ⠀⠀⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀
// ⠀⠀⣺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀
// ⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢯⣟⣿⣿⣿⣿⠀⠀⠀⠀⢀⣀
// ⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣟⡾⣯⣿⣿⣿⠀⠀⠀⠀⠀⠀
// ⠀⠀⣼⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠈⠙⢳⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
// ⠀⠀⠪⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠛⠉⣁⣠⣴⣷⣾⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
// ⠀⠀⠸⠟⢿⣿⣿⣿⣿⣿⣿⣥⣤⣔⣲⣾⡽⢳⣿⣿⣿⣿⣿⣿⣿⣿⣿⡃⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣷⣌⣉⣠⣤⣾⣿⣿⣿⣿⣿⣿⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀
// ⡀⠀⠀⠀⢀⠈⢙⠛⠛⠿⠿⠿⠿⠿⠿⠿⠿⠿⠛⠛⠛⢋⡁⠄⠐⣀⣴⣶⣶⣄⠀⠀⠀⠀
// ⠀⠀⠀⢀⡞⣿⣶⣤⣅⣐⠂⠲⠂⠶⠆⠆⠲⠶⠘⠃⣉⣀⣥⣶⣾⣿⡿⣿⣿⣿⣧⠀⠀⠀
// ⠀⠀⠀⣾⢹⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⠙⢁⣾⣿⣿⣿⣧⠀⠀
// ⠀⠀⢰⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠰⣾⣿⣿⣿⣿⣿⣆⠀
// ⠀⠀⣾⠟⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⢻⣿⣿⡿⣿⣿⣿⠀
// ⠀⠀⣷⣤⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡷⢈⣻⠠⢴⣿⣿⣿⡇
// ⠀⠀⢸⣿⡄⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⢠⣾⣿⣶⣿⣿⣿⣿⠁
// ⠀⠀⠀⠻⡗⠀⠙⠛⠛⠿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠃⢺⣿⣿⣿⣿⣿⣿⠃⠀
// ⠀⠀⠀⠀⠀⢸⣷⣦⣄⣀⠒⠐⠄⠠⡀⣄⠠⡀⠄⠄⠀⢀⣂⣤⣆⠀⡙⢿⣿⣿⡟⠃⠀⠀
// ⠀⠀⠀⠀⠀⠈⢻⣿⣿⣄⢈⠤⢤⠐⠒⠀⣖⡶⡶⢾⢿⣿⣿⣿⣿⣷⣤⣀⣠⡅⡖⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣶⣭⣐⣂⠀⠁⠉⠙⠛⣛⣹⣿⣿⣿⣷⣍⡳⢯⣽⡇⣿⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⢀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⣿⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⡏⡜⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⡿⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠸⣿⣧⣑⢝⡛⢿⣿⣷⢡⢹⣿⣿⡛⠻⣿⣿⣿⣿⣿⣿⣿⠀⡗⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣷⣿⣿⣿⣿⡆⡆⣿⣿⣷⣝⢮⣙⣿⣿⣿⣿⣿⠀⡇⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠠⣌⣛⠻⠿⠿⠿⠿⠿⠿⠀⠙⠻⠿⢿⣿⣿⣿⣿⣿⣿⣿⠀⠇⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣶⣶⣶⣶⣾⣿⡈⣷⣶⣤⣤⣄⣀⣁⣨⣤⣤⣴⢰⡆⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠈⠿⣿⡿⢿⣿⣿⣿⣿⣿⡇⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡎⡃⠀⠀
// ⠀⠀⠀⠀⠀⢀⣀⣤⣤⣀⠃⠠⡄⢀⡈⠈⠛⠙⠙⠘⠯⠛⠛⠛⠻⠛⠟⠙⡛⠉⠁⠁⠀⠀
// ⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣷⣄⠹⠀⢠⢤⠲⡜⠯⠁⠀⠀⠀⠤⠀⠀⢀⢀⡈⢙⠧⠀⠀⠀
// ⠀⠀⠀⠀⢸⣿⣿⣯⣷⣿⣿⣿⣧⢀⡜⠎⠳⢀⣤⣾⣿⣿⣿⣶⣄⠀⠀⠆⡹⡌⠫⠀⠀⠀
// ⠀⠀⠀⠀⠀⠙⠛⠛⠛⠛⠛⠛⠛⣂⠹⠀⠁⢸⣿⣿⣿⣻⣥⣿⣿⣷⡄⠶⠁⡀⠂⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠈⢮⣽⣛⣛⣛⣛⣛⣯⣥⣶⠞⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⡉⢉⠉⠉⠀⠀⠀⠀⠀⠀⠀


const fetch_data = {
    task_datalist: (isEdit = false) => fetch_ref_table_full({
        table: 'task_types',
        containerId: 'taskTypeAdd',
        bodyId: 'taskTypeTable',
        // selectId,
        selectId: 'TaskType',
        openBtnId: 'TaskTypeBtn',
        isEdit,
        columns: ['name', 'description'],
        tableMap: { taskTypeAdd: 'task_types' },
        description: true
    }),
    request_datalist: (isEdit = false) => fetch_ref_table_full({
        table: 'requested_by',
        containerId: 'requestedByAdd',
        bodyId: 'requestTable',
        // selectId,
        selectId: 'RequestedBy',
        openBtnId: 'RequestedByBtn',
        isEdit,
        columns: ['full_name', 'name', 'department_no'],
        tableMap: { requestedByAdd: 'requested_by' },
        description: false,
        departmentFields: true
    }),
    approve_datalist: (isEdit = false) => fetch_ref_table_full({
        table: 'approved_by',
        containerId: 'approvedByAdd',
        bodyId: 'approveTable',
        // selectId,
        selectId: 'ApprovedBy',
        openBtnId: 'ApprovedByBtn',
        isEdit,
        columns: ['full_name', 'name'],
        tableMap: { approvedByAdd: 'approved_by' }
    }),
    it_datalist: (isEdit = false, sessionName = null) => fetch_ref_table_full({
        table: 'it_in_charge',
        containerId: 'itAdd',
        bodyId: 'itTable',
        // selectId,
        selectId: 'ItInCharge',
        openBtnId: 'ItInChargeBtn',
        isEdit,
        columns: ['full_name'],
        tableMap: { itAdd: 'it_in_charge' },
        description: false,
        departmentFields: false,
        sessionName
    }),
    device_datalist: (isEdit = false) => fetch_ref_table_full({
        table: 'devices',
        containerId: 'deviceAdd',
        bodyId: 'deviceTable',
        // selectId,
        selectId: 'Device',
        openBtnId: 'DeviceBtn',
        isEdit,
        columns: ['name'],
        tableMap: { deviceAdd: 'devices' }
    }),
    item_datalist: (isEdit = false) => fetch_ref_table_full({
        table: 'items',
        containerId: 'itemAdd',
        bodyId: 'itemTable',
        // selectId,
        selectId: 'Item',
        openBtnId: 'ItemBtn',
        isEdit,
        columns: ['name'],
        tableMap: { itemAdd: 'items' }
    }),
    app_datalist: (isEdit = false) => fetch_ref_table_full({
        table: 'applications',
        containerId: 'applicationAdd',
        bodyId: 'appTable',
        // selectId,
        selectId: 'Application',
        openBtnId: 'ApplicationBtn',
        isEdit,
        columns: ['name'],
        tableMap: { applicationAdd: 'applications' }
    })
};


// ⡴⠒⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠉⠳⡆⠀
// ⣇⠰⠉⢙⡄⠀⠀⣴⠖⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣆⠁⠙⡆
// ⠘⡇⢠⠞⠉⠙⣾⠃⢀⡼⠀⠀⠀⠀⠀⠀⠀⢀⣼⡀⠄⢷⣄⣀⠀⠀⠀⠀⠀⠀⠀⠰⠒⠲⡄⠀⣏⣆⣀⡍
// ⠀⢠⡏⠀⡤⠒⠃⠀⡜⠀⠀⠀⠀⠀⢀⣴⠾⠛⡁⠀⠀⢀⣈⡉⠙⠳⣤⡀⠀⠀⠀⠘⣆⠀⣇⡼⢋⠀⠀⢱
// ⠀⠘⣇⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⡴⢋⡣⠊⡩⠋⠀⠀⠀⠣⡉⠲⣄⠀⠙⢆⠀⠀⠀⣸⠀⢉⠀⢀⠿⠀⢸
// ⠀⠀⠸⡄⠀⠈⢳⣄⡇⠀⠀⢀⡞⠀⠈⠀⢀⣴⣾⣿⣿⣿⣿⣦⡀⠀⠀⠀⠈⢧⠀⠀⢳⣰⠁⠀⠀⠀⣠⠃
// ⠀⠀⠀⠘⢄⣀⣸⠃⠀⠀⠀⡸⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠈⣇⠀⠀⠙⢄⣀⠤⠚⠁⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⢘⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⢰⣿⣿⣿⡿⠛⠁⠀⠉⠛⢿⣿⣿⣿⣧⠀⠀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡀⣸⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⡀⢀⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡇⠹⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡿⠁⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣤⣞⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢢⣀⣠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠲⢤⣀⣀⠀⢀⣀⣀⠤⠒⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

async function fetch_ref_table_full({ table, containerId, bodyId, selectId, openBtnId, isEdit = false, columns = [], tableMap, description = false, departmentFields = false, sessionName = null }) {
    try {

        const container = document.getElementById(containerId);
        const body = document.getElementById(bodyId);
        const tableContainer = container.querySelector('.table-content');
        const noData = container.querySelector('.no-data-table');
        const page = container.querySelector('.page');

        const select = isEdit ? document.getElementById(`edit${selectId}`) : document.getElementById(selectId);
        const taskDescription = description ? (isEdit ? document.getElementById('editTaskDescription'): document.getElementById('taskDescription')) : null;
        const department = departmentFields ? (isEdit ? document.getElementById('editDepartment') : document.getElementById('department')) : null;
        const departmentNo = departmentFields ? (isEdit ? document.getElementById('editDepartmentNo') : document.getElementById('departmentNo')) : null;

        // Buttons and Interactable Elements
        const openButton = isEdit ? document.getElementById(`edit${openBtnId}`) : document.getElementById(openBtnId);
        const closeButton = container.querySelector('.close-cont');
        const addButton = container.querySelector('.c1');
        const editButton = container.querySelector('.c2');
        const deleteButton = container.querySelector('.c3');
        const confirmCancel = container.querySelector('.c4');
        const confirmSelect = container.querySelector('.c5');
        const confirmApply = container.querySelector('.c6');
        const searchInput = container.querySelector('.look-input');

        // Pagination
        let current = 1, taskpage = 0, total = 0;
        const prev = container.querySelector('.pagination-prev');
        const next = container.querySelector('.pagination-next');
        const currentPageNum = container.querySelector('.page-num');

        // Initialization of Values
        confirmCancel.disabled = confirmSelect.disabled = true;

        let selectedRow = null;
        let selectedId = 0;

        let originalRowName = null;

        let des = null;
        let depName = null;
        let depNum = null;

        let containerOpen = false;

        function update_state() {
            confirmCancel.disabled = confirmSelect.disabled = !selectedRow;
            confirmCancel.classList.toggle('confirmed', !!selectedRow);
            confirmSelect.classList.toggle('confirmed', !!selectedRow);
        }

        function remove_highlight() {
            selectedRow = null;
            body.querySelectorAll("tr").forEach(row => row.classList.remove("highlight"));
            confirmCancel.classList.remove('confirmed');
            confirmSelect.classList.remove('confirmed');

            body.querySelectorAll("td").forEach(cell => {
                const input = cell.querySelector("input");
                if (input) {
                    cell.innerHTML = "";
                    cell.textContent = input.value;
                }
            });
        }

        function render_table(data) {
            body.innerHTML = "";
            total = data.length;

            const totalPages = Math.ceil(total/taskpage);

            if (current > totalPages & totalPages > 0) {
                current = totalPages;
            }
            
            const start = (current - 1) * taskpage;
            const end = start + taskpage;
            const paginatedTasks = data.slice(start, end);

            tableContainer.style.display = paginatedTasks.length === 0 ? 'none' : 'table';
            noData.style.display = paginatedTasks.length === 0 ? 'flex' : 'none';
            page.style.display = paginatedTasks.length === 0 ? 'none' : 'flex';

            paginatedTasks.forEach((task, index) => {
                render_row(task, index);
            });

            update_page_num(totalPages);
        }

        function render_row(data, index) {
            const row = document.createElement("tr");
            row.id = `${container.id}-${index}`;
            row.dataset.index = index;
            row.innerHTML = columns.map(col => `<td data-id="${data.id}">${data[col] ?? ''}</td>`).join('');

             if (sessionName && data.full_name === sessionName) {
                row.classList.add("highlight");
                selectedRow =  row;
            }

            row.onclick = () => {
                body.querySelectorAll("tr").forEach(r => r.classList.remove("highlight"));
                row.classList.add("highlight");

                selectedRow = row;
                selectedId = data.id;
                update_state();
            };

            body.appendChild(row);
            body.querySelectorAll("tr").forEach(row => row.classList.remove("highlight"));
        
            if (select) {
                const matchingRow = Array.from(body.querySelectorAll("tr")).find(row => row.cells[0].innerText === select.value);
                if (matchingRow) {
                    matchingRow.classList.add("highlight");
                    selectedRow = matchingRow;
                } else {
                    selectedRow = null;
                }
            }
        }

        function calculate_tasks() {
            const sampleRow = container.querySelector(`.${bodyId} tbody tr`);
            console.log(sampleRow);

            if(!tableContainer) return 1;

            const containerHeight = tableContainer.clientHeight || 1;
            const rowHeight = sampleRow ? sampleRow.clientHeight || 1 : 6;

            console.log(containerHeight, rowHeight);

            return Math.max(1, Math.floor((containerHeight / rowHeight) - 1));
        }

        function update_page_num(page) {
            currentPageNum.textContent = `${current}`;
            prev.disabled = (current <= 1);
            next.disabled = (current >= page);
        }

        socket.on('loadReferenceTable', async() => {
            if (containerOpen) {
                const data = await load.load_reference(table);
                render_table(data);
            }
        })

        const search_table = () => {
            let timeout;
            clearTimeout(timeout);
            timeout = setTimeout(async() => {
                const query = searchInput.value.trim(); 

                const searchUrl = new URL(window.location.href);
                query ? searchUrl.searchParams.set("lookupSearch", query) : searchUrl.searchParams.delete('lookupSearch');
                window.history.pushState({}, "", searchUrl);

                const data = await load.load_reference(table, 'true');
                render_table(data);   
            }, 500);
            
        }

        const open_container = async () => {
            try {
                current = 1;
                containerOpen = true;
                add_event_listeners();

                container.style.display = 'flex';
                taskpage = calculate_tasks();

                const data = await load.load_reference(table);
                console.log(data);
                if(data === null) return alert('Error retrieving data.');
    
                render_table(data);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const close_container = () => {
            const removeQuery = new URL(window.location.href);
            removeQuery.searchParams.delete('lookupSearch');
            window.history.pushState({}, "", removeQuery);

            containerOpen = false;
            container.style.display = 'none';
            searchInput.value = "";
            body.innerHTML = "";
            current = 1;

            tableContainer.style.display = 'table';
            noData.style.display = 'none';  
            page.style.display = 'flex'; 

            if (select) {
                if ((select.value === '' && selectedRow !== null)) {
                    selectedRow.classList.remove("highlight");
                    selectedRow = null;

                    confirmCancel.classList.remove('confirmed');
                    confirmSelect.classList.remove('confirmed');
                }
            }
            if (confirmApply.classList.contains('confirmed')) {
                body.querySelectorAll("tr").forEach(row => {
                    row.style.pointerEvents = "auto";
                    row.classList.remove('disabled-row');
                });
                confirmSelect.style.display = 'flex';
                confirmApply.style.display = 'none';
                confirmApply.classList.remove('confirmed');
                remove_highlight();
            }
        }

        const confirm_row = () => {
            if (!selectedRow) return;
            select.value = selectedRow.cells[0].innerText;

            if (description) {
                taskDescription.value = selectedRow.cells[1]?.innerText || '';
            }

            if (departmentFields) {
                department.value = selectedRow.cells[1]?.innerText || '';
                departmentNo.value = selectedRow.cells[2]?.innerText || '';
            }
            current = 1;
            container.style.display = 'none';
            body.innerHTML = "";
            searchInput.value = "";
        }

        const cancel_select = () => {
            if (editInProgress) {
                const cells = selectedRow.querySelectorAll("td");
                cells.forEach((cell, index) => {
                    cell.textContent = editValues[index];
                });
                editInProgress = false;
            } else {
                if (select.value) select.value = null;
                if(description) {
                    taskDescription.value = '';
                }
                if (departmentFields) {
                    department.value = '';
                    departmentNo.value = '';
                }
                remove_highlight();    
            }

            if (confirmApply.classList.contains('confirmed')) {
                body.querySelectorAll("tr").forEach(row => {
                    row.style.pointerEvents = "auto";
                    row.classList.remove('disabled-row');
                });
                confirmSelect.style.display = 'flex';
                confirmApply.style.display = 'none';
                confirmApply.classList.remove('confirmed');
            }
              
        }

        const add_row = () => {
            let modalId = containerId + "Modal";
            const modal = document.getElementById(modalId);
            if (!modal) return console.error(`Modal with ID '${containerId}' not found.`);

            modal.style.display = 'flex'; // Show modal
            const form = modal.querySelector('form');

            if(form) {
                form.onsubmit = async function (event) {
                    event.preventDefault();
                    const success = await submit_task_type(modalId, form);
                    if(!success) {
                        return alert('Failed to add task. Make sure it’s not a duplicate, or try again later.');
                    };

                    socket.emit('updateTable', true);
                    // const data = await load.load_reference(table);
                    // render_table(data);
                    
                    modal.style.display = 'none';
                    form.reset(); 
                }
            }
        }

        let editInProgress = false;
        let editValues = []

        const edit_row = async (event) => {
            event.preventDefault();

            editInProgress = true;

            if (!selectedRow) {
                return alert('Please select a row to edit.');
            }

            const cells = selectedRow.querySelectorAll("td");
            originalRowName = select.value;

            if (description) des = taskDescription.value;
            if (departmentFields) {
                depName = department.value;
                depNum = departmentNo.value;
            }

            editValues = [...cells].map(cell => cell.innerText.trim());

            cells.forEach((cell, index) => {
                if (!cell.querySelector("input")) {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = editValues[index];
                    input.classList.add('editable-input');

                    input.oninput = () => {
                        const hasChanged = [...selectedRow.querySelectorAll("input")].some(
                            (inp, i) => inp.value.trim() !== editValues[i]
                        );
                        confirmApply.disabled = !hasChanged;
                        confirmApply.style.display = hasChanged ? 'flex' : 'none';
                    };

                    cell.textContent = "";
                    cell.appendChild(input);
                }
            });

            confirmSelect.style.display = 'none';
            confirmApply.classList.add('confirmed');

            body.querySelectorAll("tr").forEach(row => {
                if (row !== selectedRow) {
                    row.style.pointerEvents = "none";
                    row.classList.add('disabled-row');
                };
            });
        }

        const confirm_edit = async () => {
            try {
                const updatedData = {};

                columns.forEach((col, idx) => {
                    const input = selectedRow.querySelectorAll("td")[idx].querySelector("input");
                    if (input) updatedData[col] = input.value.trim();
                });

                const result = await edit_button(table, selectedId, updatedData);
                if (result.success) {
                    selectedRow.querySelectorAll("td").forEach((cell, index) => {
                        if (cell.querySelector("input")) {
                            cell.textContent = updatedData[columns[index]];
                        }
                    });

                    const cells = selectedRow.querySelectorAll("td");
                    // originalData = originalData.map(item => 
                    //     item.id === selectedId ? { ...item, ...updatedData } : item
                    // );


                    editValues = [...cells].map(cell => cell.innerText.trim());
                    editInProgress = false;

                    body.querySelectorAll("tr").forEach(row => {
                        row.style.pointerEvents = "auto";
                        row.classList.remove("disabled-row");
                    });

                    confirmApply.style.display = 'none';
                    confirmSelect.style.display = 'flex';

                    if (originalRowName && select.value === originalRowName) {
                        select.value = updatedData[columns[0]];
                        // select.value = updatedData.name;
                    }

                    if (description && des && taskDescription.value === des) {
                        taskDescription.value = updatedData.description;
                    }

                    if (departmentFields && depName && department.value === depName) {
                        department.value = updatedData.dep_name;
                    }
                    if (departmentFields &&depNum && departmentNo.value === depNum) {
                        departmentNo.value = updatedData.dep_no;
                    }

                    remove_highlight();

                    socket.emit('updateTable', true);
                    await load.load_tasks();

                } else {
                    console.error("Error updating row:", result.error);
                }
                
            } catch (err) {
                console.error(`Error editing row:`, err);
            }
        }

        const delete_row = async () => {
            if (!selectedRow) return alert('Please select a row to delete.');

            if (confirm('Are you sure you want to delete this row?')) {
                const rowId = selectedRow.querySelector("td").dataset.id;

                // changes
                const resolvedTable = tableMap[container.id] || "";
                if (!resolvedTable) {
                    console.error("Invalid table name:", container.id);
                    alert("Error: Unable to determine the correct table name.");
                    return;
                }
                try {
                    const response = await fetch(`/api/delete-table/${resolvedTable}/${rowId}`, { method: "DELETE" });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to delete row.");
                    }

                    socket.emit('updateTable', true);
                    await load.load_tasks();
                    // selectedRow.remove();
                    // selectedRow = null;
                    
                    // const data = await load.load_reference(table);
                    // render_table(data);
                    
                    // originalData = originalData.filter(item => item.id !== selectedId);

                    remove_highlight();
                } catch (err) {
                    console.error('Error deleting row:', err);
                    alert("Failed to delete row. Please try again.");
                }
            }
        }

        if (openButton) {        
            openButton.onclick = open_container;
        }

        function add_event_listeners() {
            if (prev && next) {
                prev.onclick = async () => {
                    if (current > 1) {
                        current--;
                        const data = await load.load_reference(table);
                        render_table(data);
                    }
                };
        
                next.onclick = async () => {
                    current++;
                    const data = await load.load_reference(table);
                    render_table(data);
                };
            }
        
            if (searchInput) {
                searchInput.oninput = search_table;
            }
        
            if (closeButton) {
                closeButton.onclick = close_container;
            }
        
            if (addButton) {
                addButton.onclick = add_row;
            }
        
            if (editButton) {
                editButton.onclick = edit_row;
            }
        
            if (confirmApply) {
                confirmApply.onclick = confirm_edit;
            }
        
            if (confirmSelect) {
                confirmSelect.onclick = confirm_row;
            }
        
            if (confirmCancel) {
                confirmCancel.onclick = cancel_select;
            }
        
            if (deleteButton) {
                deleteButton.onclick = delete_row;
            }
        }        
    } catch (err) {
        console.error(`Error loading ${table}:`, err);
    }
}

// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣶⣶⣲⣶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠁⠀⠀⠉⢿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣶⣿⠿⠿
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣧⣀⠀⠐⣦⡙⣿⣦⡀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⠿⠆⠀⢠
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⠉⣿⣄⠀⠙⡛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⡁⠀⢀⡀⣿
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣷⡽⣿⣦⣀⢷⣝⣿⣿⣷⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⣥⣴⣾⢶⡏
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣤⣤⡤⣤⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣌⣙⣿⡿⣿⣿⣿⣿⣧⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣹⣿⣿⣿⣿⣿⣿⣍⣻⣿⣇⣾⠃
// ⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⣶⣾⣿⣟⣿⣷⣿⣿⣿⣟⠻⠷⣦⣄⠀⠀⠀⠀⠀⣼⣿⣿⡿⡍⠛⣯⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀
// ⠀⠀⠀⠀⠀⢀⣴⣿⠿⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣾⣿⣿⣦⣄⠀⣠⣿⣟⢁⣤⣴⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣤⣿⣿⣿⣿⠇⠀
// ⠀⠀⠀⠀⣴⣿⠛⠁⣿⢛⣽⣿⣿⡏⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⡿⣿⣿⣿⢿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣿⣿⡀⠀
// ⠀⠀⠀⣼⡿⢋⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣼⠿⣿⣿⣯⣿⣯⣿⣿⣿⣿⣿⣿⣿⡇⢿⣿⣿⢰⣿⢿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀
// ⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣣⣾⣿⣽⣿⣷⠿⢿⣟⣿⣿⣽⣿⡿⠀⢸⣿⣿⣿⡟⠁⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣷⡀
// ⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⠟⣹⣶⣿⣿⠱⣿⣿⢛⣶⣿⣿⣶⣶⣮⣭⣭⣀⡹⠧⠀⣼⣿⣿⣿⣯⣀⢀⣿⡿⢋⣍⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⡧
// ⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣡⣾⣿⣿⢿⡇⣰⣿⠛⣿⣿⣿⠟⢻⣿⣿⣿⣿⣿⣿⡆⠸⣿⣿⣿⣿⣿⣿⠿⢿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⠘⣺⣿⣇
// ⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣅⣹⣿⣿⣿⣾⣿⡿⣿⣿⣼⣷⣿⣧⣶⣿⣿⠁⣀⠀⢿⣿⣿⣿⣿⣿⣿⠀⢸⡿⠛⢿⣿⠏⢠⣿⣿⣿⣿⣿⣿⣿⠈⠻⣿⣿⣿⣿⣿⡏
// ⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢫⣾⣿⣿⣿⣿⣿⣇⢠⣾⣿⠉⠉⠉⠻⣿⣿⣿⣦⣌⠙⠛⠛⢿⣿⢀⠋⠀⢸⠃⢉⡀⣿⣿⣿⠿⠿⠿⣛⣥⣾⣿⣿⣿⣿⣿⣿⡇
// ⢸⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣻⣿⣿⣿⣵⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⢹⣆⠀⣀⣠⣌⣻⠿⡿⠿⢿⣷⣶⣾⣿⣿⡀⠀⠀⢀⣨⣿⣿⣿⣀⣤⣶⣿⣿⣿⣿⡿⠟⠀⠹⢿⣿⠃
// ⢸⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣧⠻⣦⠉⣋⠉⠉⠻⣶⣾⣿⣿⣿⣿⣿⣿⡏⠀⠀⢘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣾⣦⣤⣾⣿⠀
// ⢸⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠈⠛⠿⠶⠦⠤⠀⣻⣿⣏⣱⡾⢹⣿⣷⣶⣶⣿⣿⡿⢯⡙⠻⢿⣽⡿⠋⠉⠀⠈⢹⣿⣿⣿⡟⠀
// ⠈⣿⣿⣿⣿⣿⡟⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀⠙⠛⠓⢶⠦⠠⣭⣽⣿⣛⡓⠈⠻⣿⣿⠟⢑⣠⣾⣿⠿⠿⢯⣤⣻⣿⣿⠿⠿⢿⣿⣿⡇⠀
// ⠀⢸⣿⣿⣿⣿⣇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣇⣠⡴⠒⠛⠁⢀⠀⠠⠄⠈⠁⠀⣹⡃⠀⠈⠉⠛⠟⠻⢉⠀⣙⣟⠷⣯⣽⣿⣿⣿⣿⣧⡀
// ⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⡌⠀⠀⠀⠀⠀⠐⠛⠛⠛⠓⠀⠀⠀⠀⠀⠛⠛⠻⣤⣸⣶⣿⣿⣿⣿⣿⣿⡀
// ⠀⢸⣿⣿⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣟⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⡇
// ⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣽⡿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣷⣷⣦⡀⠀⠀⠀⠀⠀⠀⠐⠀⠀⢀⣰⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⢷⣿⡇
// ⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⢛⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀⣀⡀⠀⠀⠀⠈⢳⣤⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡿⠀
// ⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣷⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢫⣿⣿⣿⣿⠃⠀
// ⠀⠀⠘⢿⣿⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠈⠻⣷⣌⡻⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⢛⣿⣿⣿⠟⢻⣿⠟⣡⣿⣿⣿⣿⠏⠀⠀
// ⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣷⣶⣦⣌⣛⠻⠿⢿⣦⣄⣙⡻⠿⣟⡻⣾⡿⣿⣋⣉⢀⣸⣿⣁⣾⣿⣧⣿⣿⡏⠀⠀⠀
// ⠀⠀⠀⠀⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣶⣶⣶⣿⡛⠿⢿⣿⣭⣛⡿⠿⣶⣶⣮⣉⡹⢿⣧⡉⢿⡶⠀⢉⣩⣥⣾⣿⣛⠛⣿⣿⣿⣿⣿⠇⠀⠀⠀
// ⠀⠀⠀⠀⢸⣧⣿⣧⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣾⣿⣝⣃⠀⠉⠛⢿⣿⣷⣸⣷⡍⢿⣧⠈⠉⠷⡘⢷⣰⡿⠉⠿⠏⠉⠉⠀⣼⣿⣿⣿⣿⠀⠀⠀⠀
// ⠀⠀⠀⠀⢸⣿⡄⣿⣿⣟⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⡿⠿⢿⣿⢿⣿⣿⣿⣄⡀⠀⠀⠈⢿⡍⣻⣿⣮⣿⣤⡀⢸⣿⣾⣏⠀⠀⠀⠀⢠⣴⣿⡟⢛⣹⣿⡇⠀⠀⠀⠀
// ⠀⠀⠀⠀⣸⢿⣿⣿⣿⣿⣿⡟⠛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣵⣤⣬⣍⡀⠙⢿⣿⣿⣿⣿⣦⡂⠀⠁⠉⠉⢻⣿⡏⠻⣦⣿⡟⠉⠀⠀⣆⣴⣿⣿⣏⣠⣿⣿⣿⡇⠀⠀⠀⠀
// ⠀⠀⠀⢠⡇⠀⠈⡛⢻⣿⣿⠀⠀⠀⠀⠀⠉⠛⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠙⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⢙⡑⠒⠛⠛⠃⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀
// ⠀⠀⠀⣾⣄⣴⣾⠃⣈⣿⣽⡀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣻⣋⡻⠿⣷⣴⠛⠘⣿⣿⣿⣿⡿⣿⣄⠀⠀⠀⠙⠋⠀⠀⠀⠀⣀⣼⣟⣾⣧⣶⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀
// ⠀⠀⠀⠙⠿⠿⠧⠴⠶⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⡿⣁⣿⣿⣿⣿⣶⣶⣿⣾⣿⣿⣿⣿⡿⠻⠘⠟⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣿⣿⣿⣿⣿⡿⠿⣿⡏⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣛⣋⠙⢛⠛⢻⣿⡿⢿⣿⢿⣿⣿⣠⣤⣤⣤⣤⣤⣤⣤⣤⠶⠛⢻⣿⣿⣏⠉⠀⣭⠀⣾⣿⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⠿⣿⣶⡤⠴⠒⠀⢀⣼⣿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣧⡈⠿⣶⣭⣤⣿⠏⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⣤⡄⠈⠀⠂⢂⣴⠟⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠛⠻⠾⣶⣼⣿⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣷⣶⣶⡾⠟⣡⣾⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⠻⠃⢀⠺⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣇⣿⠛⠿⠿⣛⣛⣵⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣶⠼⠿⢿⣾⣿⡄⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣶⣶⣶⣿⣋⣭⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣶⣶⣶⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣶⣾⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⠟⠛⠏⢷⡀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⠿⠿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⠀⣀⡀⣸⠇⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⣧⠛⠋⠀⠀⠛⠹⠿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠛⠛⠛⠛⠉⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠳⠦⣔⣦⣀⢠⠄⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀


// ⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⣼⣆⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⢠⠹⣆⠀⠀⠀⠀⡸⡇⠘⣦⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⣼⠀⢣⠳⡄⠀⠴⢱⠀⠀⠹⣣⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⢀⠿⠀⢀⠇⠀⠀⠀⠈⠢⢄⣀⣳⣇⠀⠀⠀⠀⠀
// ⠀⠀⠀⣸⠦⠔⠁⠀⠀⠀⠀⠀⠀⢀⣠⣾⣹⡄⠀⠀⠀⠀
// ⠀⠀⠀⡿⢚⣳⣦⣤⣀⠀⠀⠀⢴⣿⣿⡟⠁⢡⠀⠀⠀⠀
// ⠀⠀⠀⡏⢈⣩⡿⠛⠁⣀⣀⣠⣤⡨⠛⠛⠉⣫⡇⠀⠀⠀
// ⠀⠀⠀⠷⣞⠉⠉⠲⢻⡛⠉⠉⢸⡷⠤⠤⠔⣻⠏⢀⡀⢄
// ⣂⠂⠠⠼⣎⡛⠓⠊⠈⢷⣄⢤⡾⢀⣠⡴⢾⣒⣭⠤⠖⠛
// ⠉⠉⠉⠙⠛⠛⠛⠷⡶⠂⠉⠋⠙⢿⠍⠒⠉⠁⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠇⠀⠀⠀⠀⠸⡀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⢸⡀⠀⠀⠀⣀⡇⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⢸⠉⣟⠉⡽⠀⡇⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⡏⠀⡇⢰⠃⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⡆⠰⡇⠀⡏⢸⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠉⠚⠀⠀⠉⠉⠀⠀⠀⠀

const currentPageSpan = document.getElementById('currentPage');
const pagebox = document.getElementById('pagebox');

// Database Logic -- Page
const prevButton = document.getElementById("prevPage");
const nextButton = document.getElementById("nextPage");
let resizeTimeout;
let currentPage = 1;
let tasksPerPage = 1;
let totalTasks = 0;
let totalPages = 0;

pagebox.addEventListener('click', () => {
    currentPageSpan.contentEditable = true;   
    currentPageSpan.classList.add('editable');   
    currentPageSpan.focus();
});

currentPageSpan.addEventListener('blur', async () => {
    currentPageSpan.contentEditable = false; 
    currentPageSpan.classList.remove('editable');
    const newPage = parseInt(currentPageSpan.textContent, 10);


    if (isNaN(newPage) || newPage < 1 || newPage > totalPages) {
        currentPageSpan.textContent = `${currentPage}`;
    } else {
        currentPage = newPage;  
        currentPageSpan.textContent = `${currentPage}`;
    }

    util.update_url();
    list_update_page();
    // await load.load_tasks();
});

currentPageSpan.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        currentPageSpan.blur();  // Trigger blur to save the page number
    }
});

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
    
        const getMeasurements = () => {
            const containerHeight = tableContainer.clientHeight || 1;
            const rowHeight = 42;
            return { containerHeight, rowHeight };
        };
       
        const { containerHeight, rowHeight } = getMeasurements();
        return Math.max(1, Math.floor((containerHeight / rowHeight) - 1));
    },

    update_pagination: function() {
        const currentPageSpan = document.getElementById("currentPage");    
        const totalSpan = document.getElementById('totalPages');

        currentPageSpan.textContent = `${currentPage} `;
        totalSpan.textContent = `of ${totalPages}`;
       
        prevButton.disabled = (currentPage <= 1);
        nextButton.disabled = (currentPage >= totalPages);
    },
    

    // update_page_buttons: function() {
    //     const currentPageSpan = document.getElementById("currentPage"); 

    //     if (window.innerWidth <= 950) {
    //         currentPageSpan.innerHTML = `${currentPage} of ${totalPages}`;
    //     } else {
    //         currentPageSpan.innerHTML = `${currentPage} of ${totalPages}`;
    //     }
    // },
}

// setTimeout(page.update_tasks_per_page, 150);

function list_update_page(value = null) {
    const tableBody = document.getElementById("taskTableBody");
    const table = document.querySelector('.task-table');
    const noData = document.getElementById('noData');
    tableBody.innerHTML = "";

    const length = (value !== null) ? value.length : initialTasks.length;
    const t_pages = Math.ceil(length / tasksPerPage);
    totalPages = t_pages;

    if (length === 0) {
        table.style.display = 'none';
        noData.style.display = 'flex';  
        document.querySelector('.fixed-bottom').style.display = 'none';
    } else {
        table.style.display = 'table';
        noData.style.display = 'none';  
        document.querySelector('.fixed-bottom').style.display = 'flex';
    }

    const startInitial = (currentPage - 1) * tasksPerPage;
    const endInitial = startInitial + tasksPerPage;

    const paginatedInitial = (value !== null) ? value.slice(startInitial, endInitial) : initialTasks.slice(startInitial, endInitial);

    paginatedInitial.forEach((task) => {
        add.add_to_table(task);
    });
    page.update_pagination();
}

if (prevButton && nextButton) {
    prevButton.onclick = async () => {
        if (currentPage > 1) {
            currentPage--;
            util.update_url();
            let value = search.filter_logic(true);
            list_update_page(value);
        }
    };

    nextButton.onclick = async () => {
        if (currentPage < totalPages) {
            currentPage++;
            util.update_url();
            let value = search.filter_logic(true);
            list_update_page(value);
        }
    };
}

// Periodic task update Functions --- baguhin pa using Websockets para mas efficient and mas mabilis
let updateInterval; 

// const period = {
//     check_user: async function() {
//         try {
//             const response = await fetch('/api/session-user');
//             if(!response.ok) return false;

//             const data = await response.json();
//             return !!data.username;
//         } catch (err) {
//             console.error("Error checking login status:", err);
//             return false;
//         } 
//     },

//     periodic_updates: function() {
//         if (!updateInterval) {
//             updateInterval = setInterval( async () => {
//                 if(!document.hidden && await period.check_user()) {
//                     await load.load_tasks();
//                 }
//             }, 30000)
//         } 
//     },

//     setup_updates: function() {
//         document.addEventListener("visibilitychange", async () => {
//             if (document.hidden) {
//                 clearInterval(updateInterval);
//                 updateInterval = null;
//             } else if (await period.check_user()){
//                 period.periodic_updates();
//             }
//         });
//         period.periodic_updates();
//     }
// }

const btn = {
    open_table: function(id) {
        const dept = document.getElementById(id);
        dept.style.display = 'flex';
        console.log(id);
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
        Object.entries(fieldMap).forEach(([key, id]) => {
            const field = document.getElementById(id);
            if (!field) return;
    
            if (field.tagName === "SELECT") {
                util.set_selected_option(field, taskData[key], key === "taskStatus");
            } 
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

    apply_error: function (inputId, label) {
        const field = document.getElementById(inputId);
        field.classList.add("error-input"); // Add red border or styling
    
        if (label) {
            label.classList.add("shake-label"); // Make label shake
        }
    
        setTimeout(() => {
            field.classList.remove("error-input");
            if (label) label.classList.remove("shake-label");
        }, 1300);
    },

    get_field_value: function(id) {
        const field = document.getElementById(id);

        if (!field) return '--'; // Return null instead of "--" if field does not exist
    
        let label = document.querySelector(`label[for="${id}"]`);
        let labelText = label ? label.innerText.trim() : null;
    
        // If data-set="true", check if empty and apply error
        if (field.getAttribute("data-set") === "true" && field.value.trim() === "") {
            console.log(field);
            util.apply_error(id, label);
            return null; // Stop further execution and force re-input
        }
    
        // If data-id exists, return it
        if (field.getAttribute("data-id") !== null) {
            return field.getAttribute("data-id").trim();
        }
    
        return field.value.trim() || '--'; 
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
    
                    // await load.load_tasks();
                    list_update_page();
                }
            }, 100);
        });
        // window.addEventListener('resize', () => {
        //     const currentPageSpan = document.getElementById("currentPage");  
        //     currentPageSpan.textContent = (window.innerWidth >= 800) ? `${currentPage} of ${totalPages}` : `${currentPage}`;
        // });
        // window.addEventListener('load', page.update_page_buttons);
        
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


// ================================== TASK TYPE ==================================

const get_name = (id) => {
    const lowerId = id.toLowerCase(); 

    console.log(lowerId);

    if (lowerId.includes("task")) return "task_types";
    if (lowerId.includes("item")) return "items";
    if (lowerId.includes("device")) return "devices";
    if (lowerId.includes("application")) return "applications";
    if (lowerId.includes("request")) return "requested_by";
    if (lowerId.includes("approve")) return "approved_by";
    if (lowerId.includes("it")) return "it_in_charge";

    return ""; 
}

// Function to open "Add" modal
// const open_add_modal = (modalId) => {
//     const modal = document.getElementById(modalId);
//     if (!modal) return console.error(`Modal with ID '${modalId}' not found.`);
    
//     modal.style.display = 'flex'; // Show modal

//     const modalBody = modal.querySelector('.modal-body');
//     const form = modal.querySelector('form');
    
//     if(form) {
//         form.addEventListener("submit", async function (event) {

//             event.preventDefault();
//             const success = await submit_task_type(modalId, form);
//             if(!success) return;

//             const tableName = get_name(modalId);        
//             const fetchFunctions = {
//                 "task_types": fetch_data.task_datalist,
//                 "items": fetch_data.item_datalist,
//                 "devices": fetch_data.device_datalist,
//                 "applications": fetch_data.app_datalist,
//                 "approved_by":fetch_data.approve_datalist,
//                 "requested_by":fetch_data.request_datalist,
//                 "it_in_charge": fetch_data.it_datalist,
//             };

//             if (fetchFunctions[tableName]) {
//                 await fetchFunctions[tableName]();
//                 console.log(`Datalist for ${tableName} updated.`);
//                 modal.style.display = 'none';
//             } else {
//                 alert(`Error adding to table: ${tableName}`);
//                 console.warn(`No fetch function found for table: ${tableName}`);
//             }
//         })
//     }
// };

// Function to close modal
const close_modal = (modalId) => {
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    if (modal) {
        modal.style.display = 'none';
        form.reset();
    }
};

// Function to submit task type and add row to table
const submit_task_type = async (modalId, form) => {   
    try {
        const formData = new FormData(form);
        const data= Object.fromEntries(formData.entries());

        if (Object.values(data).some(value => value.trim() === "")) {
            alert("Error: All fields must be filled.");
            return false;
        }

        const tableName = get_name(modalId);
        if (!tableName) {
            console.error("Invalid modal ID:", modalId);
            return false;
        }

        const response = await fetch(`/api/ref-table/${tableName}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)            
        });

        if (!response.ok) {
            console.error(`Failed to submit data to ${tableName}:`, await response.text());
            return false;
        }

        return true;
        
    } catch(err) {
        console.error("Error submitting task to referenced table:", err);
    }
};

