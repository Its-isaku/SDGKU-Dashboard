document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".headerBtnOut").forEach(button => {
        button.addEventListener("click", async () => {
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
                }
            } catch (error) {
                console.error("Logout error:", error);
            }
        });
    });
});