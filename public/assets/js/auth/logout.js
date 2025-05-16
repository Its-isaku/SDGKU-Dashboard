document.addEventListener("DOMContentLoaded", function () {
    const allLogoutButtons = document.querySelectorAll(".headerBtnOut, .asideBtnOut");
    
    allLogoutButtons.forEach(button => {
        button.addEventListener("click", async () => {
            localStorage.removeItem('sdgkuUserData');
            
            try {
                const response = await fetch("../../../src/controllers/logout.php", {
                    method: "POST"
                });

                const data = await response.json();

                if (data.success) {
                    sessionStorage.removeItem("user");
                    window.location.href = "../auth/login.html";
                } else {
                    console.error("Logout failed:", data.message);
                    window.location.href = "../auth/login.html";
                }
            } catch (error) {
                console.error("Logout error:", error);
                sessionStorage.removeItem("user");
                window.location.href = "../auth/login.html";
            }
        });
    });
});