export const UI = {

    handle_darkmode: function(toggleSelector) {
        let darkmode = localStorage.getItem('dark-mode');
        const toggleSwitch = document.querySelector(toggleSelector);
        
        const enableDarkMode = () => {
            document.body.classList.add('dark-mode');
            localStorage.setItem('dark-mode', 'active');
        }
        
        const disableDarkMode = () => {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('dark-mode', null);
        }
    
        if(darkmode === 'active') enableDarkMode()
        
        toggleSwitch.addEventListener('click', function(event) {
            event.preventDefault();
            darkmode = localStorage.getItem('dark-mode');
            darkmode !== 'active' ? enableDarkMode() : disableDarkMode();
        })
    
    },
    
    page_navigation: function(buttonId, targetUrl) {
        const button = document.getElementById(buttonId);
    
        if (button) {
            button.addEventListener('click', function () {
                window.location.href = targetUrl;
            });
        }
    },

    notificationPop: function() {
        const notificationPopup = document.getElementById("notificationPopup");

        window.openNotificationPopup = function() {
            notificationPopup.style.display = "block";
        };

        window.closeNotificationPopup = function() {
            notificationPopup.style.display = "none";
        };
    },

    dropdownToggle: function() {
        const logoutButton = document.querySelector(".logout-btn");
        const profile = document.querySelector(".user-profile");
        const dropdownMenu = document.getElementById("dropdownMenu");

        function toggleDropdown(event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle("show");
        }

        logoutButton.addEventListener("click", toggleDropdown);
        profile.addEventListener("click", toggleDropdown);

        document.addEventListener("click", function(event) {
            if (!dropdownMenu.contains(event.target) && !logoutButton.contains(event.target)) {
                dropdownMenu.classList.remove("show");
            }
        });

        window.logout = function() {
            window.location.href = "/internal/login.html";
        };
    }
};
