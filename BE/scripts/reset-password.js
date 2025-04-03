document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-form");
    const messageDiv = document.getElementById("reset-msg");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            messageDiv.textContent = "Passwords don't match";
            messageDiv.style.color = "red";
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
                messageDiv.textContent = "Password updated! Redirecting...";
                messageDiv.style.color = "green";
                setTimeout(() => window.location.href = "login.html", 2000);
            } else {
                messageDiv.textContent = result.message || "Error resetting password";
                messageDiv.style.color = "red";
            }
        } catch (error) {
            messageDiv.textContent = "Network error. Try again later.";
            messageDiv.style.color = "red";
        } finally {
            btn.disabled = false; 
        }
    });
});