document.addEventListener('DOMContentLoaded', function() {
    const options = document.querySelectorAll(".surveyOption");
    const tabContents = document.querySelectorAll(".tab-content");

    // Función para cambiar de pestaña
    function switchTab(selectedOption, tabId) {
        // Remover la clase selectedOption de todas las opciones
        options.forEach(option => {
            option.classList.remove("selectedOption");
        });
        
        // Añadir la clase selectedOption a la opción seleccionada
        selectedOption.classList.add("selectedOption");
        
        // Ocultar todos los contenidos de pestañas
        tabContents.forEach(content => {
            content.style.display = "none";
        });
        
        // Mostrar solo el contenido de la pestaña seleccionada
        document.getElementById(tabId).style.display = "block";
    }

    // Asignar eventos a cada opción
    options.forEach(option => {
        option.addEventListener("click", function() {
            const tabId = this.id === "optionSurveyDetails" ? "profile" : "security";
            switchTab(this, tabId);
        });
    });

    // Establecer la pestaña de perfil como seleccionada por defecto
    document.getElementById("optionSurveyDetails").classList.add("selectedOption");
    document.getElementById("profile").style.display = "block";
});