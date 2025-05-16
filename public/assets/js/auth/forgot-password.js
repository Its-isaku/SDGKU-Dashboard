import { showMessage, highlightInput } from '../../js/auth/formUtils.js';

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("forgot-password-form");
    const messageDiv = document.getElementById("forgot-msg");
    const submitBtn = document.getElementById("form-btn");
    const emailInput = document.getElementById("email");

    form?.addEventListener("submit", async function(e) {
        e.preventDefault();

        const email =  emailInput.value.trim();

        if (!email) {
            showMessage(messageDiv, "Please enter your email");
            highlightInput(emailInput, "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const response = await fetch("../../../src/controllers/forgot-password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "forgotPassword", 
                    email 
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                highlightInput(emailInput, "error");
                throw new Error(data.message || "Email not found");
            }

            highlightInput(emailInput, "success");
            showMessage(messageDiv, data.message || "Reset link sent to your email", true);
            setTimeout(() => window.location.href = "../auth/forgot-password.html", 4000);

        } catch (error) {
            showMessage(messageDiv, error.message || "Network error. Try again later.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Reset Password";
        }
    });
});