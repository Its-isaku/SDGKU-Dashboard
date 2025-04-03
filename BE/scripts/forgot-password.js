document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("forgot-password-form");
    const messageDiv = document.getElementById("forgot-msg");
    const submitBtn = document.getElementById("form-btn");

    const showMessage = (message, isSuccess = false) => {
        messageDiv.textContent = message;
        messageDiv.style.color = isSuccess ? 'green' : 'red';
        messageDiv.style.display = 'block'; 
    };

    form?.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const email = document.getElementById("email").value.trim();
        
        if (!email) {
            showMessage("Please enter your email");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const response = await fetch("../BE/phpFiles/forgot-password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Request failed");

            if (data.success) {
                showMessage(data.message || "Reset link sent to your email", true);
            } else {
                showMessage(data.message || "Email not found");
            }
        } catch (error) {
            console.error("Error:", error);
            showMessage(error.message || "Network error. Try again later.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Reset Password";
        }
    });
});