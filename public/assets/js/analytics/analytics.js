const labels = ['Tijuana', 'Mexicali', 'Ensenada', 'Tecate', 'Rosarito'];
const data = [25, 18, 12, 5, 8];

//const ctx = document.getElementById('studentChart').getContext('2d');

// const studentChart = new Chart(ctx, {
// type: 'pie', // 'line', 'pie', 'doughnut'
// data: {
//     labels: labels,
//     datasets: [{
//     label: 'Número de Estudiantes',
//     data: data,
//     backgroundColor: 'rgba(183, 36, 10, 0.6)',
//     borderColor: 'rgb(243, 231, 0)',
//     borderWidth: 1
//     }]
// },
// options: {
//     responsive: true,
//     scales: {
//     y: {
//         beginAtZero: true,
//         title: {
//         display: true,
//         text: 'Cantidad'
//         }
//     },
//     x: {
//         title: {
//         display: true,
//         text: 'Ciudad'
//         }
//     }
//     }
// }
// });


// funcion para cambiar de panel

function showOptionSelected(id) {

    const paneles = document.querySelectorAll('.panel');
    paneles.forEach(panel => panel.classList.remove('visible'));


    const buttons = document.querySelectorAll('.surveyOption');
    buttons.forEach(button => button.classList.remove('selectedOption'));


    const panelSeleccionado = document.getElementById(id);
    panelSeleccionado.classList.add('visible');


    const selectedButton = document.querySelector(`button[onclick="showOptionSelected('${id}')"]`);
    if (selectedButton) selectedButton.classList.add('selectedOption');


    if (id === 'panel4' && typeof fetchReports === 'function') {
        fetchReports();
    }
}

async function loadAnalyticsStats() {
    try {
        const response = await fetch('../../../src/models/get_analytics_stats.php');
        const result = await response.json();

        if (result.status === 'success') {
            console.log('Datos recibidos:', result.data);
            document.getElementById('surveyTotalId').textContent = result.data.totalSurveys;
        }
        else {
            console.error('Error fetching analytics stats:', result.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadAnalyticsStats();
    renderAllCharts();
    renderResponseAnalysisChart();
    renderComparisonChart();
});

function renderAllCharts() {
    renderCompletionRateChart();
    renderSurveyTypesChart();
    renderQuestionTypesChart();
    renderRatingDistributionChart();
}

function renderCompletionRateChart() {
    const ctx = document.getElementById('completionRateChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Total',
                    data: [60, 70, 90, 85, 65, 55, 40],
                    backgroundColor: '#d9d9d9'
                },
                {
                    label: 'Completed',
                    data: [50, 55, 80, 75, 50, 45, 30],
                    backgroundColor: '#b6240a'
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderSurveyTypesChart() {
    const ctx = document.getElementById('surveyTypesChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pre-Course', 'Post-Course', 'Teacher Eval', 'University Eval'],
            datasets: [{
                data: [35, 30, 25, 10],
                backgroundColor: ['#660000', '#b6240a', '#f6a623', '#111']
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderQuestionTypesChart() {
    const ctx = document.getElementById('questionTypesChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Multiple Choice', 'Text Response', 'Rating Scale', 'Yes/No'],
            datasets: [{
                data: [45, 20, 25, 10],
                backgroundColor: ['#660000', '#b6240a', '#f6a623', '#111']
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderRatingDistributionChart() {
    const ctx = document.getElementById('ratingDistributionChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1', '2', '3', '4', '5'],
            datasets: [{
                label: 'Ratings',
                data: [8, 14, 24, 28, 19],
                backgroundColor: '#f6a623'
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderResponseAnalysisChart() {
    const ctx = document.getElementById('responseAnalysisChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                "Q1: Teaching effectiveness",
                "Q2: Course materials",
                "Q3: Assignments",
                "Q4: Feedback quality",
                "Q5: Overall satisfaction"
            ],
            datasets: [{
                label: 'Rating',
                data: [4.3, 4.1, 4.2, 3.9, 4.5],
                backgroundColor: '#f28c28',
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Variables", "Functions", "Arrays", "Objects", "Classes"],
            datasets: [
                {
                    label: "Pre",
                    data: [2.3, 1.8, 1.6, 1.4, 1.2],
                    backgroundColor: '#a01c1c',
                    borderRadius: 6
                },
                {
                    label: "Post",
                    data: [4.1, 3.9, 3.7, 3.5, 3.3],
                    backgroundColor: '#f28c28',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
}
