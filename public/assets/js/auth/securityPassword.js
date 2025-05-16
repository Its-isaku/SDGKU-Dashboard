import { showMessage, highlightInput } from '../../js/auth/formUtils.js';

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("security-form");
    const messageDiv = document.getElementById("security-msg");
    const submitBtn = document.getElementById("change-password-btn");

    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    form?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        [currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(input =>
            highlightInput(input, ""));

        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage(messageDiv, "All fields are required.");
            if (!currentPassword) highlightInput(currentPasswordInput, "error");
            if (!newPassword) highlightInput(newPasswordInput, "error");
            if (!confirmPassword) highlightInput(confirmPasswordInput, "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage(messageDiv, "New passwords do not match.");
            highlightInput(newPasswordInput, "error");
            highlightInput(confirmPasswordInput, "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const response = await fetch("../../../src/controllers/securityPassword.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "securityPassword",
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                highlightInput(currentPasswordInput, "error");
                throw new Error(data.message || "Failed to change password.");
            }

            showMessage(messageDiv, data.message || "Password changed successfully", true);
            highlightInput(currentPasswordInput, "success");
            highlightInput(newPasswordInput, "success");
            highlightInput(confirmPasswordInput, "success");
            setTimeout(() => {
                [currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(input =>
                    input.value = ""
                );
            }, 3500);

        } catch (error) {
            showMessage(messageDiv, error.message || "Network error. Try again later.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Change Password";
        }
    });
});
