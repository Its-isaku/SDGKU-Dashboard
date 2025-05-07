export function showMessage(element, message, isSuccess = false, autoHide = true) {
    element.textContent = message;

    element.classList.remove("error-msg", "success-msg");

    if (isSuccess) {
        element.style.color = "green";
        element.classList.add("success-msg");
    } else {
        element.style.color = "red";
        element.classList.add("error-msg");
    }

    element.style.display = "block";

    setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
    }, 30);

    if (autoHide) {
        setTimeout(() => {
            element.style.opacity = "0";
            element.style.transform = "translateY(-7px)";
            setTimeout(() => {
                element.style.display = "none";
                element.classList.remove("error-msg", "success-msg");
            }, 400);
        }, 3500);
    }
}

export function highlightInput(input, status = "none") {
    // status: 'success', 'error', or 'none'
    input.classList.remove("input-error", "input-success");

    if (status === "success") {
        input.classList.add("input-success");
    } else if (status === "error") {
        input.classList.add("input-error");
    }
    input.classList.add("input-animate");
    setTimeout(() => input.classList.remove("input-animate"), 300);
    setTimeout(() => input.classList.remove("input-error", "input-success"), 3500);
}

export function toggleDisplay(element, displayType = 'flex') { //Opcion para utilizar solo tipo acordeones, dropdowns, collapsibles, etc.
    const isVisible = element.style.display === displayType;
    element.style.display = isVisible ? 'none' : displayType;
}


export function hideAll(selectors) {
    document.querySelectorAll(selectors).forEach(el => {
        el.style.display = 'none';
    });
}