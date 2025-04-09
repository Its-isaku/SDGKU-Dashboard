import { showMessage, highlightInput } from './formUtils.js';
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-form");
    const loginError = document.getElementById("reset-msg"); 
    const showMessage = (message, isSuccess = false) => {
        loginError.textContent = message;
        loginError.style.color = isSuccess ? "green" : "red";
        loginError.style.display = "block";
        
        setTimeout(() => {
            loginError.style.opacity = "1";
            loginError.style.transform = "translateY(0)";
        }, 30);
        
        if (!isSuccess) {
            setTimeout(() => {
                loginError.style.opacity = "0";
                loginError.style.transform = "translateY(-7px)";
                setTimeout(() => {
                    loginError.style.display = "none";
                }, 400); 
            }, 3500);
        }
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            showMessage("Passwords don't match");
            return;
        }

        const btn = document.getElementById("form-btn");
        btn.disabled = true;

        try {
            const response = await fetch("../BE/phpFiles/reset-password.php", {
                method: "POST",
                body: JSON.stringify({
                    token: new URLSearchParams(window.location.search).get("token"),
                    password
                }),
                headers: { "Content-Type": "application/json" }
            });

            const result = await response.json();
            
            if (result.success) {
                showMessage("Password updated! Redirecting...", true);
                setTimeout(() => window.location.href = "login.html", 2000);
            } else {
                showMessage(result.message || "Error resetting password");
            }
        } catch (error) {
            showMessage("Network error. Try again later.");
        } finally {
            btn.disabled = false; 
        }
    });
});