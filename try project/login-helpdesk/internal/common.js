export const UI = {

    // Functions
    handleSidebarState: function() {
        const sidebarCheckbox = document.getElementById("check");
        console.log("sidebar is: ", localStorage.getItem("sidebarState"));
        if (!sidebarCheckbox) return; 

        if (localStorage.getItem("sidebarState") === "open") {
            sidebarCheckbox.checked = true;
        } else {
            sidebarCheckbox.checked = false;
        }

        sidebarCheckbox.addEventListener("change", () => {
            if (sidebarCheckbox.checked) {
                localStorage.setItem("sidebarState", "open");
            } else {
                localStorage.setItem("sidebarState", "closed");
            }
        });
    },

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

    closeModal: function(modalId, check) {
        const modal = document.getElementById(modalId);
        const form = document.getElementById('newTaskForm'); // Assuming form is the same for task modal

        if (modal) {
            modal.style.display = "none";
            if (check && form) {
                form.reset(); // Reset form if check is true
            }
        }
    },

    closeOutsideModal: function(event, content, close) {
        const targetContent = document.getElementById(content);
        if (event) {
            console.log("Event target:", event.target);
    
            if (event.target != targetContent) {
                UI.closeModal(close, close === 'taskModal');
            }
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
            localStorage.setItem("sidebarState", "closed");
        };
    }
};
