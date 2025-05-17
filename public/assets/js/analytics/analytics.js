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


//? <|----------------------------------- cambiar de panel -----------------------------------|>

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
}//? <|----------------------------------- async? -----------------------------------|>

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

//? <|----------------------------------- Graphs -----------------------------------|>

document.addEventListener("DOMContentLoaded", () => {
    loadAnalyticsStats();
    renderAllCharts();
    renderComparisonChart();
    loadComparisonTable();
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



async function renderComparisonChart() {
    const preSurveyId = document.getElementById("selectCourseId").value;
    const postSurveyId = document.getElementById("selectTypeId").value;
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    try {
        const response = await fetch(`../../../src/models/get_comparison_chart_data.php?pre_survey_id=${preSurveyId}&post_survey_id=${postSurveyId}`);
        const result = await response.json();

        const { labels, pre, post, preAvg, postAvg, change } = result.data;

        document.getElementById("preAvgValue").textContent = `${preAvg.toFixed(2)}%`;
        document.getElementById("postAvgValue").textContent = `${postAvg.toFixed(2)}%`;
        document.getElementById("changeValue").textContent = `${change.toFixed(2)}%`;


        if (labels.length === 0) {
            document.getElementById("comparisonChart").style.display = "none";
            console.warn("No data available for the selected surveys.");
            return;
        }
        else {
            document.getElementById("comparisonChart").style.display = "block";
        }

        if (window.comparisonChartInstance) {
            window.comparisonChartInstance.destroy();
        }

        window.comparisonChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Pre",
                        data: pre,
                        backgroundColor: '#a01c1c',
                        borderRadius: 6
                    },
                    {
                        label: "Post",
                        data: post,
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
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            callback: function (value) {
                                return value + "%";
                            }
                        },
                        title: {
                            display: true,
                            text: "Correct Answer Rate (%)"
                        }
                    }
                }

            }
        });
    } catch (error) {
        console.error("Error loading chart data:", error);
    }
}


async function loadComparisonTable() {
    const preSurveyId = document.getElementById("selectCourseId").value;
    const postSurveyId = document.getElementById("selectTypeId").value;

    if (!preSurveyId || !postSurveyId) return;

    try {
        const response = await fetch(`../../../src/models/get_survey_comparison.php?pre_survey_id=${preSurveyId}&post_survey_id=${postSurveyId}`);
        const result = await response.json();

        if (result.status === 'success') {
            const tbody = document.querySelector("#comparisonResultsTable tbody");
            tbody.innerHTML = `
                <tr>
                    <td>Overall</td>
                    <td>${result.data.pre_avg}</td>
                    <td>${result.data.post_avg}</td>
                    <td>${result.data.change}%</td>
                </tr>
            `;
        } else {
            console.error("Error:", result.message);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}
