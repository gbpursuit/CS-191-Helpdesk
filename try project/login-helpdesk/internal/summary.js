import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", function () {

    function summary_open() {
        const sumElements = {
            sumTitle: document.getElementById('summaryTitle'),
            sumContainer: document.getElementById('summaryContainer')
        };

        sumElements.sumTitle.innerText = "IT Management - Summary";
        sumElements.sumContainer.style.display = 'block';
    }

    const pop = document.querySelector('.notification-popup');
    pop.addEventListener('click', (event) => UI.closeOutsideModal(event, 'popupContent', 'notificationPopup'));

    // UI Actions
    UI.handle_darkmode(".toggle-switch");
    UI.page_navigation("dashboard", "/internal/dashboard.html")
    UI.notificationPop();
    UI.dropdownToggle();
    UI.handleSidebarState();

    // Call Functions
    summary_open();

});
