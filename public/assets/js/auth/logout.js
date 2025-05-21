
function validLogin() {
    var user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = "../auth/login.html";
    }
}

function logout() {
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
}

function init() {
    // validLogin();
    logout();
}

document.addEventListener('DOMContentLoaded', init);
