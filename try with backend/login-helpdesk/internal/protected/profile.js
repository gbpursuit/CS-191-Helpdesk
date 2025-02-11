document.addEventListener("DOMContentLoaded", async function () {

    // const createBack = document.querySelector('.create-back');
    // createBack.addEventListener('click', function(event){
    //     event.preventDefault();
    //     window.location.replace('/internal/dashboard');
    // });

    // const prevButtons = document.querySelectorAll('.prev');
    const homeButton = document.querySelector('.t-home');

    homeButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        setTimeout(() => {
            window.location.replace('/internal/dashboard');
        }, 250); 
    });

    async function get_user_profile() {
        try {
            const response = await fetch('/api/session-user');
            const data = await response.json();

            if (data.fullName) {
                document.getElementById("pagename").textContent = data.fullName;
            } 
        } catch (err) {
            console.error('Error fetching session user:', err);
        }
    }

    // prevButtons.forEach(button => {
    //     button.addEventListener('click', function(event) {
    //         event.preventDefault();
    //         window.location.replace('/internal/profile');
    //     });
    // });

    const boxes = {
        profile: 'firstCol',
        accountPrimary: 'acctBox',
        accountSecondary: 'secBox',
        task: 'taskBox',
        pending: 'pendingBox'
    };
    
    const pages = {
        summarized: document.getElementById('summarizedContent'),
        profile: document.getElementById("profilePage"),
        accountPrimary: document.getElementById("accountPage"),
        accountSecondary: document.getElementById("securityPage"),
        task: document.getElementById('taskPage'),
        pending: document.getElementById('pendingPage')
    };
    
    function apply_listener() {
        prevButtons.forEach(button => button.style.display = "none");

        Object.entries(boxes).forEach(([key, id]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => {
                    // Hide all pages
                    Object.values(pages).forEach(page => page.style.display = "none");

                    // Hide all previous buttons by defaul                    
                    if (pages[key]) {
                        // Show the selected page
                        pages[key].style.display = "flex";
                        
                        // Show the previous buttons for the current page
                        if (key !== 'summarized') {
                            prevButtons.forEach(button => button.style.display = "inline-block");
                        }
                    }
                });
            }
        });
    }
    
    // apply_listener();
    await get_user_profile();
});