document.addEventListener("DOMContentLoaded", async function () {

    // const createBack = document.querySelector('.create-back');
    // createBack.addEventListener('click', function(event){
    //     event.preventDefault();
    //     window.location.replace('/internal/dashboard');
    // });

    // const prevButtons = document.querySelectorAll('.prev');
    const homeButton = document.querySelector('.t-home');

    homeButton.addEventListener('click', function(event){
        event.preventDefault();
        window.location.replace('/internal/dashboard');
    });

    async function neww () {
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
    
    function applyListener() {
        // Initially hide all previous buttons
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
    
    // applyListener();
    await neww();
    
});


    // const viewList = document.getElementById('overBiewButton');
    // const profList = document.getElementById("profileButton");
    // const acctList = document.getElementById("accountButton");
    // const secList = document.getElementById("securityButton");

    // const pages = {
    //     summarized: document.getElementById('summarizedContent'),
    //     profile: document.getElementById("personalPage"),
    //     account: document.getElementById("accountPage"),
    //     security: document.getElementById("securityPage"),
    // };

    // function replacePage(targetPage) {
    //     Object.values(pages).forEach(page => page.style.display = "none");
        
    //     if (targetPage === 'summarized') {
    //         pages[targetPage].style.display = "flex";
    //         return;
    //     }
    //     pages[targetPage].style.display = "block";
    // }

    // viewList.addEventListener("click", function (event) {
    //     event.preventDefault();
    //     replacePage("summarized");
    // });

    // profList.addEventListener("click", function (event) {
    //     event.preventDefault();
    //     replacePage("profile");
    // });

    // acctList.addEventListener("click", function (event) {
    //     event.preventDefault();
    //     replacePage("account");
    // });

    // secList.addEventListener("click", function (event) {
    //     event.preventDefault();
    //     replacePage("security");
    // });
