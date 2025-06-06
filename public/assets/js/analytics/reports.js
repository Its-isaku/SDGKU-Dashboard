function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

//! <|----------------------- Get Data Logic -----------------------|>

// ? Get data and load to report cards
async function loadReports() {
    try {
        const response = await fetch('../../../src/models/getReportsData.php');
        const result = await response.json();

        if (result.status === 'success') {
            renderReportCards(result.data);
        } else {
            console.error('Error fetching reports:', result.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

//! <----------------------- Render Cards Logic ----------------------->

// ? Renderiza las tarjetas de los reportes
function renderReportCards(surveys) {
    const container = document.querySelector('.reports');
    container.innerHTML = '';
    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'reportCardsContainer';

    surveys.forEach(survey => {
        const card = document.createElement('div');
        card.className = 'reportCard';
        if (survey.status.toLowerCase() === 'inactive') {
            card.classList.add('inactive');
        }
        card.innerHTML = `
            <div class = "principalInformation">
                <div class = "activeTitleStatus">
                        <div class = "surveytitle">
                            <div class = "typeTitle">
                                <p>${survey.type}</p>
                            </div>
                        </div>
                        <div class = "surveyStatus">
                            <p>${survey.status}</p>
                        </div>
                    </div>
                <h3>${survey.title}</h3>
            </div>
                <div class="survey-details">
                    <span><i class="fa-solid fa-calendar-plus"></i> Created: ${survey.createdDate}</span>
                    <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} Questions</span>
                    <span><i class="fa-solid fa-clipboard-list"></i> ${survey.responses} Responses</span>
                    <span><i class="fa-solid fa-circle-question"></i> Program: ${survey.program}</span>
                </div>
                <button class="downloadBtn" data-id="${survey.id}"><i class="fa-solid fa-download"></i> Download results</button>
        `;
        cardsWrapper.appendChild(card);
    });

    container.appendChild(cardsWrapper);
    attachDownloadListeners();
}

//! <----------------------- MOodal Logic ----------------------->
function attachDownloadListeners() {
    document.querySelectorAll('.downloadBtn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const surveyId = btn.getAttribute('data-id');
            openReportDownloadModal(surveyId);
        });
    });
}

const reportDownloadModal = document.getElementById('report-download-modal');
const downloadCSVBtn = document.getElementById('download-CSV');
const downloadExcelBtn = document.getElementById('download-EXCEL');
const downloadReportIdInput = document.getElementById('downloadReportId');
const closeDownloadModalBtns = document.querySelectorAll('#report-download-modal .close-modal, #report-download-modal .btn-cancel');

function openReportDownloadModal(surveyId) {
    if (downloadReportIdInput) downloadReportIdInput.value = surveyId;
    if (reportDownloadModal) reportDownloadModal.style.display = 'flex';
}

function closeReportDownloadModal() {
    if (reportDownloadModal) reportDownloadModal.style.display = 'none';
}

//? Attach close events
function setupDownloadModalEvents() {
    const closeDownloadModalBtns = document.querySelectorAll('#report-download-modal .close-modal, #report-download-modal .btn-cancel');
    closeDownloadModalBtns.forEach(btn => {
        btn.addEventListener('click', closeReportDownloadModal);
    });
    //? Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
        const reportDownloadModal = document.getElementById('report-download-modal');
        if (e.target === reportDownloadModal) closeReportDownloadModal();
    });
    //? Descargar CSV
    const downloadCSVBtn = document.getElementById('download-CSV');
    if (downloadCSVBtn) {
        downloadCSVBtn.addEventListener('click', () => {
            const surveyId = document.getElementById('downloadReportId').value;
            window.location.href = `../../../src/models/exportSurvey.php?id=${surveyId}&action=csv`;
            closeReportDownloadModal();
        });
    }
    //? Descargar EXCEL
    const downloadExcelBtn = document.getElementById('download-EXCEL');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', () => {
            const surveyId = downloadReportIdInput.value;
            window.location.href = `../../../src/models/exportSurvey.php?id=${surveyId}&action=excel`;
            closeReportDownloadModal();
        });
    }
}

//? Llama a esta función una sola vez al cargar el archivo JS
setupDownloadModalEvents();