const labels = ['Tijuana', 'Mexicali', 'Ensenada', 'Tecate', 'Rosarito'];
const data = [25, 18, 12, 5, 8];

const ctx = document.getElementById('studentChart').getContext('2d');

const studentChart = new Chart(ctx, {
type: 'pie', // 'line', 'pie', 'doughnut'
data: {
    labels: labels,
    datasets: [{
    label: 'Número de Estudiantes',
    data: data,
    backgroundColor: 'rgba(183, 36, 10, 0.6)',
    borderColor: 'rgb(243, 231, 0)',
    borderWidth: 1
    }]
},
options: {
    responsive: true,
    scales: {
    y: {
        beginAtZero: true,
        title: {
        display: true,
        text: 'Cantidad'
        }
    },
    x: {
        title: {
        display: true,
        text: 'Ciudad'
        }
    }
    }
}
});



// funcion para cambiar de panel

function showOptionSelected(id) {
    // Ocultar todos los paneles
    const paneles = document.querySelectorAll('.panel');
    paneles.forEach(panel => panel.classList.remove('visible'));

    // Quitar clase de botón activo
    const buttons = document.querySelectorAll('.surveyOption');
    buttons.forEach(button => button.classList.remove('selectedOption'));

    // Mostrar panel seleccionado
    const panelSeleccionado = document.getElementById(id);
    panelSeleccionado.classList.add('visible');

    // Marcar botón como activo
    const selectedButton = document.querySelector(`button[onclick="showOptionSelected('${id}')"]`);
    if (selectedButton) selectedButton.classList.add('selectedOption');

    // 👉 Solo en el panel de reports, cargamos los datos
    if (id === 'panel4' && typeof fetchReports === 'function') {
        fetchReports();
    }
}