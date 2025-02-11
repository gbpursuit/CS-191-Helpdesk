import { UI } from '../protected/common.js';

// Document Page
document.addEventListener("DOMContentLoaded", function() {
    sign_account();
    UI.handle_darkmode('.d-mode');
});

// Functions
function sign_account() {
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
    });

    addAccount.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.replace("/internal/register");
    });
}