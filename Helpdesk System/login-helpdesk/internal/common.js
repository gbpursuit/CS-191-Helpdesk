export const UI = {

    handle_sidebar: function() {
        const sidebarCheckbox = document.getElementById("check");
    
        if (!sidebarCheckbox) return; 
    
        // Set the checkbox based on the stored state
        if (localStorage.getItem("sidebarState") === "open") {
            sidebarCheckbox.checked = true;
        } else {
            sidebarCheckbox.checked = false;
        }
    
        // Listen for checkbox change events
        sidebarCheckbox.addEventListener("change", () => {
            if (sidebarCheckbox.checked) {
                localStorage.setItem("sidebarState", "open");
            } else {
                localStorage.setItem("sidebarState", "closed");
            }
        });
    
        let lastWidth = window.innerWidth;

        window.addEventListener('resize', () => {
            if (lastWidth !== window.innerWidth) {
                localStorage.setItem("sidebarState", "closed");
                sidebarCheckbox.checked = false; 
                lastWidth = window.innerWidth; 
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

    close_modal: function(modalId, check) {
        const modal = document.getElementById(modalId);
        const form = document.getElementById('newTaskForm'); // Assuming form is the same for task modal
        console.log("Modal:", modal);
        if (modal) {
            // console.log("Modal:", modal);
            modal.style.display = "none";
            if (check && form) {
                form.reset(); // Reset form if check is true
            }
        }
    },

    close_outside_modal: function(event, content, close) {
        const targetContent = document.getElementById(content);
        if (event) {
    
            if (event.target != targetContent) {
                console.log(event.target, targetContent, close);
                UI.close_modal(close, close === 'taskModal');
            }
        }
    },

    logout_function: function(bool=false) {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                localStorage.setItem("sidebarState", "closed");
                
                window.location.replace('/internal/welcome');
    
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error logging out:', error);
        });
    },

    dropdown_toggle: function() {
        const logoutButton = document.querySelector(".logout-btn");
        const profile = document.querySelector(".user-profile");
        const dropdownMenu = document.getElementById("dropdownMenu");
        const logoutText = document.getElementById('logoutText');

        function toggle_dropdown(event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle("show");
        }

        logoutButton.addEventListener("click", toggle_dropdown);
        profile.addEventListener("click", toggle_dropdown);

        document.addEventListener("click", function(event) {
            if (!dropdownMenu.contains(event.target) && !logoutButton.contains(event.target)) {
                dropdownMenu.classList.remove("show");
            }
        });

        logoutText.addEventListener("click", function(event) {
            event.preventDefault();
            UI.logout_function();
            ["searchQuery", "filterBy", "filterValue"].forEach(item => localStorage.removeItem(item));
        });

    },

    // reflect_username: async function() {
    //     try {
    //         const response = await fetch('/api/session-user');
    //         const data = await response.json();

    //         if (data.fullName) {
    //             // Dynamically update the user's full name
    //             console.log(data);
    //             const firstName = data.fullName.split(' ')[0];
    //             document.getElementById('userFullName').textContent = firstName; 
    //             document.getElementById("pagename").textContent = data.username;
    //         } 
    //     } catch (err) {
    //         console.error('Error fetching session user:', err);
    //         window.location.replace('/internal/welcome');
    //     }
    // },

    // make async soon if may backend na
    // show_profile: function () {
    //     const profile = document.getElementById('profileText');
    //     profile.addEventListener('click', (event) => {
    //         event.preventDefault();
    //         window.location.replace('/internal/profile')
    //     });
    // }
};
