document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const loginButton = document.getElementById("form-btn");

    const showMessage = (message, isSuccess = false) => {
        loginError.textContent = message;
        loginError.style.color = isSuccess ? "green" : "red";
        loginError.style.display = "block";
    };

    const validateFields = (email, password) => {
        if (!email || !password) {
            showMessage("Please fill in all fields");
            return false;
        }
        if (!email.endsWith("@sdgku.edu")) {
            showMessage("Only institutional emails allowed");
            return false;
        }
        return true;
    };

    loginForm?.addEventListener("submit", async function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!validateFields(email, password)) return;

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {
            const response = await fetch("../BE/phpFiles/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Login failed");

            if (data.success) {
                showMessage("Login successful! Redirecting...", true);
                sessionStorage.setItem("user", JSON.stringify(data.user));
                setTimeout(() => window.location.href = "dashboard.html", 1500);
            } else {
                showMessage(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            showMessage(error.message || "Something went wrong. Please try again.");
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    });

    document.querySelectorAll(".loginBtn, .headerBtnlogin").forEach(button => {
        button.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    });
});