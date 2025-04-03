document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const loginButton = document.getElementById("form-btn");

    loginForm?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        loginError.textContent = "";

        if (!email.endsWith("@sdgku.edu")) {
            loginError.textContent = "Only institutional emails are allowed.";
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {
            const response = await fetch("../BE/phpFiles/login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "dashboard.html";
            } else {
                loginError.textContent = data.message || "Invalid credentials.";
            }
        } catch (error) {
            console.error("Login error:", error);
            loginError.textContent = "Something went wrong. Please try again.";
        }

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    });

    //? botones de login 
    if (typeof $ !== "undefined") {
        $(".loginBtn").click(function () {
            window.location.href = "login.html";
        });

        $(".headerBtnlogin").click(function () {
            window.location.href = "login.html";
        });
    } else {
        console.error("jQuery is not loaded. Please include jQuery in your project.");
    }
});

console.log("TESTING");
