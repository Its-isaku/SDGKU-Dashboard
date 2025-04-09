import { showMessage, highlightInput } from './formUtils.js';
document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const loginButton = document.getElementById("form-btn");

    const validateFields = (email, password) => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    let valid = true;

    if (!email) {
        showMessage(loginError, "Please enter your email");
        highlightInput(emailInput, "error");
        valid = false;
        }


        if (!email.endsWith("@sdgku.edu")) {
            showMessage(loginError, "Only institutional emails allowed");
            highlightInput(emailInput, "error");
            valid = false;
        }
        if (!password) {
            showMessage(loginError, "Please enter your password");
            highlightInput(passwordInput, "error");
            valid = false;
        }

        return valid;

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

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");


            if (!response.ok || !data.success) {

                highlightInput(emailInput, "error");
                highlightInput(passwordInput, "error");
                throw new Error(data.message || "Invalid credentials");

            }
            


            if (data.success) {
                showMessage("Login successful! Redirecting...", true);
                sessionStorage.setItem("user", JSON.stringify(data.user));
                setTimeout(() => window.location.href = "dashboard.html", 1500);
            } else {
                showMessage(data.message || "Invalid credentials");
            }

            highlightInput(emailInput, "success");
            highlightInput(passwordInput, "success");
            showMessage(loginError, "Login successful! Redirecting...", true);
            sessionStorage.setItem("user", JSON.stringify(data.user));
            setTimeout(() => window.location.href = "dashboard.html", 1500);

        } catch (error) {
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