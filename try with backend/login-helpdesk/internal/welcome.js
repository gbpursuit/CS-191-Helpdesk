import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", function() {
    function signAccount() {
        const signAcc = document.getElementById('signAccount');
        const addAccount = document.getElementById('addAccount');

        signAcc.addEventListener('click', async function(event) {
            event.preventDefault();

            try {
                const response = await fetch('/api/session-user');
                if (response.ok) {
                    window.location.replace('/internal/login/logged-in')
                } else {
                    window.location.replace("/internal/login/sign-in");
                }
            } catch (err) {
                console.error("Error:", err);
            }
            // window.location.href = "/internal/login.html?view=sign-in";
        });

        addAccount.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.replace("/internal/login/create-account");
            // window.location.href = "/internal/login.html?view=create-account";
        });
    }

    signAccount();
    UI.handle_darkmode('.d-mode');
});