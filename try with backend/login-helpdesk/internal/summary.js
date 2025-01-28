import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", async function () {

    try {
        const response = await fetch('/api/session-user');
        const data = await response.json();

        if (data.username) {
            // Dynamically update the user's full name
            const firstName = data.username.split(' ')[0];
            document.getElementById('userFullName').textContent = firstName; 
            document.getElementById("pagename").textContent = data.username;
        } 
        // else {
        //     // Redirect to login page if no username is found
        //     window.location.href = '/internal/login/sign-in';
        // }
    } catch (err) {
        console.error('Error fetching session user:', err);
        window.location.href = '/internal/welcome';
    }

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
    UI.page_navigation("dashboard", "/internal/dashboard")
    UI.notificationPop();
    UI.dropdownToggle();
    UI.handleSidebarState();

    // Call Functions
    summary_open();

});
