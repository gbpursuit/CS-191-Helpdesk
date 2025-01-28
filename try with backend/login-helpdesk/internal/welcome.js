import { UI } from './common.js';

document.addEventListener("DOMContentLoaded", function() {
    function signAccount() {
        const signAcc = document.getElementById('signAccount');
        const addAccount = document.getElementById('addAccount');

        signAcc.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('test')
            window.location.replace("/internal/login/sign-in");
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