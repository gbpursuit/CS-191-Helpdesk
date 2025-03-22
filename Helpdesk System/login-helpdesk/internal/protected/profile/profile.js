document.addEventListener("DOMContentLoaded", async function () {

    const profile_container = document.getElementById('profileContainer');
    const header_container = document.getElementById('headerContainer');

    function hide_base_view() {
        profile_container.style.display = 'none';
        header_container.style.display = 'none';
    }

    function show_base_view() {
        profile_container.style.display = 'block';
        header_container.style.display = 'flex';
        document.querySelectorAll('.account-page, .tasks-page')
        .forEach(container => container.style.display = 'none');
    }

    function show_container(view) {
        document.querySelectorAll('.account-page, .tasks-page')
            .forEach(container => container.style.display = 'none');

            const containerMap = {
                'account': 'accountPage',
                // 'security': 'securityPage',
                'tasks': 'tasksPage'
            };
    
            if (containerMap[view]) {
                document.getElementById(containerMap[view]).style.display = 'flex';
            }
    }

    function handle_url() {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        if (view) {
            hide_base_view();
            show_container(view);
        }
    }

    function apply_button(classTag, viewName) {
        const button = document.querySelector(classTag);
        if (!button) return;

        button.addEventListener('click', function (event) {
            event.preventDefault();
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('view', viewName);
            window.history.pushState({}, '', newUrl);

            hide_base_view();
            show_container(viewName);
        });
    }

    async function fetch_profile() {
        try {
            const response = await fetch('/api/session-user');
            const data = await response.json();
            if (data.fullName) {
                document.getElementById("pagename").textContent = data.fullName;
                document.getElementById("user-name").textContent = data.fullName;
            }
        } catch (err) {
            console.error('Error fetching session user:', err);
        }
    }

    async function load_prof_image() {
        try {
            const response = await fetch("/api/session-user");
            const user = await response.json();
            if (user.profile_image) {
                document.getElementById("displayImg").src = user.profile_image;
            }
        } catch (error) {
            console.error("Failed to load profile image:", error);
        }
    }

    const homeButton = document.querySelector('.t-home');
    const backButton = document.querySelector('.create-back');

    if (homeButton) {
        homeButton.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('hello');
            setTimeout(() => {
                window.location.replace('/internal/dashboard');
            }, 250);
        })
    }

    if (backButton) {
        backButton.addEventListener('click', function () {
            console.log('hi');
            window.history.pushState({}, '', '/internal/profile');
            show_base_view();
        });
    }

    document.getElementById('imageUpload').addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById("profileImage").src = event.target.result;
        };
        reader.readAsDataURL(file);
    
        // Automatically upload the file
        const formData = new FormData();
        formData.append("profileImage", file);
    
        try {
            const response = await fetch("/api/upload-profile-image", {
                method: "POST",
                body: formData
            });
    
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Upload failed");
    
            document.getElementById("profileImage").src = result.imageUrl;
            alert("Profile image updated successfully!");
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
        }
    });

    // document.getElementById('imageUpload').addEventListener("change", function () {
    //     const file = this.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (event) => document.getElementById("displayImg").src = event.target.result;
    //         reader.readAsDataURL(file);
    //     }
    // });

    // document.getElementById('uploadBtn').addEventListener("click", async function () {
    //     const file = document.getElementById('imageUpload').files[0];
    //     if (!file) return alert("Please select an image first.");

    //     const formData = new FormData();
    //     formData.append("displayImg", file);

    //     try {
    //         const response = await fetch("/api/upload-profile-image", {
    //             method: "POST",
    //             body: formData
    //         });

    //         const result = await response.json();
    //         if (!response.ok) throw new Error(result.message || "Upload failed");

    //         document.getElementById("displayImg").src = result.imageUrl;
    //         alert("Profile image updated successfully!");
    //     } catch (error) {
    //         console.error("Error uploading image:", error);
    //         alert("Failed to upload image.");
    //     }
    // });

    apply_button('.t-acc', 'account');
    // apply_button('.t-sec', 'security');
    apply_button('.t-task', 'tasks');

    // Handle page load behavior
    handle_url();
    await fetch_profile();
    await load_prof_image();
});




    // const createBack = document.querySelector('.create-back');
    // createBack.addEventListener('click', function(event){
    //     event.preventDefault();
    //     window.location.replace('/internal/dashboard');
    // });

    // const prevButtons = document.querySelectorAll('.prev');


    // prevButtons.forEach(button => {
    //     button.addEventListener('click', function(event) {
    //         event.preventDefault();
    //         window.location.replace('/internal/profile');
    //     });
    // });

    // const boxes = {
    //     profile: 'firstCol',
    //     accountPrimary: 'acctBox',
    //     accountSecondary: 'secBox',
    //     task: 'taskBox',
    //     pending: 'pendingBox'
    // };
    
    // const pages = {
    //     summarized: document.getElementById('summarizedContent'),
    //     profile: document.getElementById("profilePage"),
    //     accountPrimary: document.getElementById("accountPage"),
    //     accountSecondary: document.getElementById("securityPage"),
    //     task: document.getElementById('taskPage'),
    //     pending: document.getElementById('pendingPage')
    // };

// function apply_listener() {
//     prevButtons.forEach(button => button.style.display = "none");

//     Object.entries(boxes).forEach(([key, id]) => {
//         const element = document.getElementById(id);
//         if (element) {
//             element.addEventListener('click', () => {
//                 // Hide all pages
//                 Object.values(pages).forEach(page => page.style.display = "none");

//                 // Hide all previous buttons by defaul                    
//                 if (pages[key]) {
//                     // Show the selected page
//                     pages[key].style.display = "flex";
                    
//                     // Show the previous buttons for the current page
//                     if (key !== 'summarized') {
//                         prevButtons.forEach(button => button.style.display = "inline-block");
//                     }
//                 }
//             });
//         }
//     });
// }