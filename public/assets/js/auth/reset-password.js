import { showMessage, highlightInput } from '../../js/auth/formUtils.js';

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-form");
    const messageDiv = document.getElementById("reset-msg");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const btn = document.getElementById("form-btn");
    
    // Form submission handler
    form?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!password || !confirmPassword) {
            showMessage(messageDiv, "Please fill in both password fields");
            highlightInput(passwordInput, !password ? "error" : "neutral");
            highlightInput(confirmPasswordInput, !confirmPassword ? "error" : "neutral");
            return;
        }

        if (password !== confirmPassword) {
            showMessage(messageDiv, "Passwords don't match");
            highlightInput(passwordInput, "error");
            highlightInput(confirmPasswordInput, "error");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        try {
            const response = await fetch("../../../src/controllers/reset-password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: 'resetPassword',
                    token: new URLSearchParams(window.location.search).get("token"),
                    password
                })
            });

            const result = await response.json();

            if (!result.success) {
                showMessage(messageDiv, result.message || "Error resetting password");
                highlightInput(passwordInput, "error");
                highlightInput(confirmPasswordInput, "error");
                return;
            }

            highlightInput(passwordInput, "success");
            highlightInput(confirmPasswordInput, "success");
            showMessage(messageDiv, "Password updated! Redirecting...", true);
            setTimeout(() => window.location.href = "../auth/login.html", 2000);

        } catch (error) {
            showMessage(messageDiv, "Network error. Try again later.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = "Reset Password";
        }
    });
});