document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".headerBtnOut").forEach(button => {
        button.addEventListener("click", async () => {
            try {
                const response = await fetch("../BE/phpFiles/logout.php", {
                    method: "POST"
                });

                const data = await response.json();

                if (data.success) {
                    sessionStorage.removeItem("user");
                    window.location.href = "index.html";
                } else {
                    console.error("Logout failed:", data.message);
                }
            } catch (error) {
                console.error("Logout error:", error);
            }
        });
    });
});