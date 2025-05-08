async function fetchReports() {
    try {
        const response = await fetch('../../../src/models/get_reports.php');
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

function renderReportCards(reportsData) {
    const container = document.querySelector('.reports');
    container.innerHTML = ''; // limpiar

    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'reportCardsContainer';

    reportsData.forEach(report => {
        const card = document.createElement('div');
        card.className = 'reportCard';

        card.innerHTML = `
            <div class="reportTags">
                <span class="reportTag">${report.type_name}</span>
                <span class="reportTag inactive">Inactive</span>
            </div>
            <h4>${report.title}</h4>
            <p>${report.description}</p>
            <div class="reportCardDetails">
                <span><i class="fa-solid fa-calendar-plus"></i> Created: ${report.created_at}</span>
                <span><i class="fa-solid fa-clipboard-list"></i> ${report.question_count} questions</span>
            </div>
            <button class="downloadBtn" data-id="${report.survey_id}">Download results</button>
        `;

        cardsWrapper.appendChild(card);
    });

    container.appendChild(cardsWrapper);
    attachDownloadListeners();
}

function attachDownloadListeners() {
    document.querySelectorAll('.downloadBtn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const surveyId = btn.getAttribute('data-id');
            window.location.href = `../../../src/models/export_survey_csv.php?id=${surveyId}`;
        });
    });
}
