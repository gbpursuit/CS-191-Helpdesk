import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", function () {

    function summary_open() {
        const sumTitle = document.getElementById('summaryTitle');
        const summaryContainer = document.getElementById('summaryContainer');

        sumTitle.innerText = "IT Management - Summary";
        summaryContainer.style.display = 'block';
    }
    
    UI.handle_darkmode(".toggle-switch");
    UI.page_navigation("dashboard", "/internal/dashboard.html")
    UI.notificationPop();
    UI.dropdownToggle();
    summary_open();

});
