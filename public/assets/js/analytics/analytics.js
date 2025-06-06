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
}

//? <|----------------------------------- async? -----------------------------------|>
async function loadAnalyticsStats() {
    try {
        const response = await fetch('../../../src/models/get_analytics_stats.php');
        const result = await response.json();

        if (result.status === 'success') {
            const totalBox = document.getElementById('surveyTotalId');
            if (totalBox) {
                totalBox.textContent = result.data.totalSurveys;
            }
        } else {
            console.error('Error fetching analytics stats:', result.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

//? <|----------------------------------- Graphs -----------------------------------|>
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

//?Btn FILTERS
//!Filters
document.addEventListener("DOMContentLoaded", () => {
    loadAnalyticsStats();
    renderAllCharts();
    overviewFilterLogic();

    const hasOverviewTable = document.querySelector('#overviewTable');
    const hasAverageBox = document.getElementById('overallAverageDisplay');

    if (hasOverviewTable && hasAverageBox) {
        renderOverviewTable(); // inicial sin filtros
    }

    const boton = document.getElementById('submitFilterbtnOverview');
    const selectProgram = document.getElementById('programIdOverview');
    const selectYear = document.getElementById('selectYearRangeIdOverview');

    boton.addEventListener('click', async function () {
        const completeDateSelected = getDateRangeSelectedOverview();
        const getProgramIds = await getAllProgramIds();
        const from = completeDateSelected[0];
        const to = completeDateSelected[1];

        const selectSurvey = document.getElementById('surveyOverview');
        const surveyType = selectSurvey.value;

        const TypeIndex = selectYear.selectedIndex;
        const programIndex = selectProgram.selectedIndex;

        if (TypeIndex !== 0) {
            showLoadingModal();
            if (programIndex !== 0) {
                //*para el programa Seleccionado
                await renderOverviewTable(from, to, getProgramIds[programIndex], surveyType);
            } else if (programIndex === 0) {
                //*para TODOS los programas
                await renderOverviewTable(from, to, 'all', surveyType);
            }
            hideLoadingModal();
        } else {
            //!Notificacion
            showNotification("Please select a year", "error");
        }
    });
});

async function renderOverviewTable(from = null, to = null, programId = null, surveyType = null) {
    try {
        let url = '../../../src/models/getOverviewData.php';

        const params = new URLSearchParams();
        if (from && to) {
            params.append('from', from);
            params.append('to', to);
        }
        if (programId !== null && programId !== '' && programId !== 'all') {
            params.append('programId', programId);
        }
        if (surveyType && surveyType !== 'all') {
            params.append('surveyType', surveyType);
        }
        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);
        const result = await response.json();

        const tableSelector = '#overviewTable';
        const tableEl = $(tableSelector);
        const averageBox = document.getElementById('overallAverageDisplay');

        // Destruir DataTable si ya existe
        if ($.fn.DataTable.isDataTable(tableSelector)) {
            tableEl.DataTable().clear().destroy();
        }

        if (result.status !== 'success' || !result.data || result.data.length === 0) {
            tableEl.html(`
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Label</th>
                        <th>Survey Type</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="4" class="text-center">No data found for selected filters.</td></tr>
                </tbody>
            `);

            averageBox.textContent = 'Overall Average: 0.00';
            return;
        }

        // Crear nueva tabla con datos
        tableEl.html(`
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Label</th>
                    <th>Survey Type</th>
                    <th>Value</th>
                </tr>
            </thead>
        `);

        const dataSet = result.data.map(row => [row.no, row.label, row.category, row.value]);

        const dataTable = tableEl.DataTable({
            data: dataSet,
            columns: [
                { title: "No." },
                { title: "Label" },
                { title: "Survey Type" },
                { title: "Value" }
            ],
            paging: true,
            searching: true,
            ordering: true,
            lengthMenu: [5, 10, 25, 50],
            pageLength: 10,
            buttons: [
                { extend: 'copy' },
                { extend: 'csv' },
                { extend: 'excel' },
                {
                    extend: 'pdf',
                    customize: function (doc) {
                        doc.styles.tableHeader.fillColor = '#1E3C5A';
                        doc.styles.tableHeader.color = 'white';
                        doc.styles.tableBodyEven.fillColor = '#F0F0F0';
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
            scrollCollapse: true,
            initComplete: function () {
                $(window).on('resize', function () {
                    dataTable.columns.adjust();
                });
            }
        });

        averageBox.textContent = `Overall Average: ${result.average}`;

        // Botones
        $('#btnOverviewCopy, #btnOverviewCsv, #btnOverviewExcel, #btnOverviewPdf, #btnOverviewPrint').off('click');

        $('#btnOverviewCopy').on('click', function () {
            dataTable.button('.buttons-copy').trigger();
        });
        $('#btnOverviewCsv').on('click', function () {
            dataTable.button('.buttons-csv').trigger();
        });
        $('#btnOverviewExcel').on('click', function () {
            dataTable.button('.buttons-excel').trigger();
        });
        $('#btnOverviewPDF').on('click', function () {
            dataTable.button('.buttons-pdf').trigger();
        });
        $('#btnOverviewPrint').on('click', function () {
            dataTable.button('.buttons-print').trigger();
        });

    } catch (error) {
        console.error("Error fetching overview data:", error);
    }
}
