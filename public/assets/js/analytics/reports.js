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

function renderReportCards(surveys) {
    const container = document.querySelector('.reports');
    container.innerHTML = ''; // limpiar
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
                    <span><i class="fa-solid fa-clock"></i> Expired: ${survey.expires}</span>
                    <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} Questions</span>
                    <span><i class="fa-solid fa-clipboard-list"></i> ${survey.responses} Responses</span>
                    <span>Program: ${survey.program}</span>
                </div>
                <button class="downloadBtn" data-id="${survey.id}">Download results</button>
                
                
                
            
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
