

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


    if (id === 'panel4' && typeof loadReports === 'function') {
        loadReports();
    }
}//? <|----------------------------------- async? -----------------------------------|>

async function loadAnalyticsStats() {
    try {
        const response = await fetch('../../../src/models/get_analytics_stats.php');
        const result = await response.json();

        if (result.status === 'success') {
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
    renderOverviewTable();
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

async function renderOverviewTable() {
    try {
        const response = await fetch('../../../src/models/getOverviewData.php');
        const result = await response.json();

        if (result.status !== 'success') {
            console.warn("No overview data found.");
            return;
        }

        const tableSelector = '#overviewTable';
        const tbody = document.querySelector(`${tableSelector} tbody`);
        const averageBox = document.getElementById('overallAverageDisplay');

        // Limpia tabla si ya existe
        if ($.fn.DataTable.isDataTable(tableSelector)) {
            $(tableSelector).DataTable().destroy();
            $(tableSelector).empty(); // Limpia la tabla completa (incluye thead/tbody)
            $(tableSelector).html(`
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Label</th>
                        <th>Survey Type</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `);
        }

        // Rellenar la tabla
        const tbodyElement = document.querySelector(`${tableSelector} tbody`);
        result.data.forEach(row => {
            tbodyElement.innerHTML += `
                <tr>
                    <td>${row.no}</td>
                    <td>${row.label}</td>
                    <td>${row.category}</td>
                    <td>${row.value}</td>
                </tr>
            `;
        });

        // Mostrar el promedio general
        averageBox.textContent = `Overall Average: ${result.average}`;

        // Inicializar DataTable con botones
        const table = $(tableSelector).DataTable({
            paging: true,
            searching: true,
            ordering: true,
            lengthMenu: [5, 10, 25, 50],
            pageLength: 10,
            // columnDefs: [
            //     { className: "dt-center", targets: "_all" }
            // ],
            buttons: [
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel' },
                {
                    extend: 'pdf',
                    customize: function (doc) {
                        // Cambiar estilos de la tabla
                        doc.styles.tableHeader.fillColor = '#1E3C5A'; // azul oscuro (como tu tabla)
                        doc.styles.tableHeader.color = 'white';
                        doc.styles.tableBodyEven.fillColor = '#F0F0F0';

                        // Footer personalizado
                        const pageCount = doc.pages.length;
                        for (let i = 1; i <= pageCount; i++) {
                            doc.pages[i].footer = function (currentPage, pageCount) {
                                return {
                                    columns: [
                                        {
                                            text: `Página ${currentPage} de ${pageCount}`,
                                            alignment: 'center',
                                            margin: [0, 10],
                                            color: 'white',
                                            fillColor: '#C81E2D' // rojo similar a cabecera
                                        }
                                    ]
                                };
                            };
                        }

                        // Para pdfmake se usa un método diferente para footer, lo siguiente es lo recomendado:
                        doc['footer'] = function (currentPage, pageCount) {
                            return {
                                columns: [
                                    {
                                        text: `Página ${currentPage} de ${pageCount}`,
                                        alignment: 'center',
                                        margin: [0, 10],
                                        color: 'white',
                                        fillColor: '#C81E2D'
                                    }
                                ]
                            };
                        };
                    }
                },
                { extend: 'print' }
            ],
            responsive: true,
            // scrollY: "400px",
            scrollCollapse: true,
            // dom: 'Bfrtip',
            initComplete: function () {
                $(window).on('resize', function () {
                    table.columns.adjust();
                });
            }
        });

        // Desvincular eventos antiguos (por si acaso)
        $('#btnOverviewCopy, #btnOverviewCsv, #btnOverviewExcel, #btnOverviewPdf, #btnOverviewPrint').off('click');

        // Asignar botones externos
        $('#btnOverviewCopy').on('click', function () {
            table.button('.buttons-copy').trigger();
        });
        $('#btnOverviewCsv').on('click', function () {
            table.button('.buttons-csv').trigger();
        });
        $('#btnOverviewExcel').on('click', function () {
            table.button('.buttons-excel').trigger();
        });
        $('#btnOverviewPDF').on('click', function () {
            table.button('.buttons-pdf').trigger();
        });
        $('#btnOverviewPrint').on('click', function () {
            table.button('.buttons-print').trigger();
        });

    } catch (error) {
        console.error("Error fetching overview data:", error);
    }
}