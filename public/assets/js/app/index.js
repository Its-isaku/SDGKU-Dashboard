  //? botones de login 
    if (typeof $ !== "undefined") {
        $(".loginBtn").click(function () {
            window.location.href = "views/auth/login.html";
        });

        $(".headerBtnlogin").click(function () {
            window.location.href = "views/auth/login.html";
        });
    } else {
        console.error("jQuery is not loaded. Please include jQuery in your project.");
    }