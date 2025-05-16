document.addEventListener("DOMContentLoaded", function() {
    const togglePassword = document.getElementById("toggle-password");
    if (togglePassword) {
        togglePassword.addEventListener("click", function() {
            const passwordInput = document.getElementById("password");
            if (passwordInput) {
                const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
                passwordInput.setAttribute("type", type);

                this.classList.toggle("fa-eye");
                this.classList.toggle("fa-eye-slash");
                this.classList.toggle("active");
            }
        });
    }
    
    document.querySelectorAll(".toggle-password[data-target]").forEach(icon => {
        icon.addEventListener("click", () => {
            const targetId = icon.getAttribute("data-target");
            const input = document.getElementById(targetId);
            
            if (input) {
                const isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";
                
                icon.classList.toggle("fa-eye");
                icon.classList.toggle("fa-eye-slash");
                icon.classList.toggle("active");
            }
        });
    });
});