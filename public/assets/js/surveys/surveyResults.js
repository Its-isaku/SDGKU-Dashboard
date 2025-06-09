//? This script fetches survey results and renders them in a table format


function getCurrentYearDateRange() {
    const currentYear = new Date().getFullYear();
    return {
        from: `${currentYear}-01-01`,
        to: `${currentYear}-12-31`
    };
}

document.addEventListener('DOMContentLoaded', async function () {
    try {
        surveyResultsFilterLogic();
        const urlParams = new URLSearchParams(window.location.search);
        const surveyId = urlParams.get('id');
        
        if (!surveyId) {
            console.error('No survey ID in URL');
            showNotification('No survey ID provided', 'error');
            return;
        }
        const surveyInfomation = await getSurveyData(surveyId);
        const defaultDates = getCurrentYearDateRange();
            if(surveyInfomation.survey_type_id == 3 || surveyInfomation.survey_type_id == 4 || surveyInfomation.survey_type_id == 5) {
                    // showLoadingModal();
                    const array = await getLinkertSurveyResults(surveyId, defaultDates.from, defaultDates.to);
                    renderProgramTables(array, surveyInfomation);
                    // hideLoadingModal();
                } else if(surveyInfomation.survey_type_id == 1 || surveyInfomation.survey_type_id == 2) {
                    const pre_post = await getResultsPerSurvey(surveyId, defaultDates.from, defaultDates.to);
                    const array2 = await fetchSurveyResults(surveyId, defaultDates.from, defaultDates.to, pre_post);
                    renderProgramTables(array2, surveyInfomation);
                }
        const boton = document.getElementById('submitFilterbtnResults');
        boton.addEventListener('click', async function () {
            try {
                const completeDateSelected = getDateRangeSelectedResults();
                const from = completeDateSelected[0];
                const to = completeDateSelected[1];
                const selectYear = document.getElementById('selectYearRangeIdResults');
                const yearIndex = selectYear.selectedIndex;
                
                if(yearIndex === 0) {
                    showNotification("Please select a year", "error");
                    return;
                }

                if(surveyInfomation.survey_type_id == 3 || surveyInfomation.survey_type_id == 4 || surveyInfomation.survey_type_id == 5) {
                    // showLoadingModal();
                    const array = await getLinkertSurveyResults(surveyId, from, to);
                    renderProgramTables(array, surveyInfomation);
                    // hideLoadingModal();
                } else if(surveyInfomation.survey_type_id == 1 || surveyInfomation.survey_type_id == 2) {
                    const pre_post = await getResultsPerSurvey(surveyId, from, to);
                    const array2 = await fetchSurveyResults(surveyId, from, to, pre_post);
                    renderProgramTables(array2, surveyInfomation);
                }
            } catch (error) {
                console.error('Error processing results:', error);
                showNotification(error.message || 'Error processing results', 'error');
            }
        });
    } catch (error) {
        console.error('Error loading survey data:', error);
        showNotification(error.message || 'Error loading survey data', 'error');
    }
});
//? function to render the program tables
function calculateAverageScore(answers) {
    if (!answers || answers.length === 0) return '0%';
    const total = answers.reduce((sum, answer) => {
        const percentage = parseInt(answer.average ? answer.average.replace('%', '') : 0);
        return sum + (isNaN(percentage) ? 0 : percentage);
    }, 0);
    return Math.round(total / answers.length) + '%';
}

function renderProgramTables(answers,surveyInfomation) {
    
    // Update summary information
    document.getElementById('surveyType').textContent = `${surveyInfomation.survey_type}`;
    document.getElementById('surveyStatus').textContent = `${surveyInfomation.status}`;
    document.getElementById('surveyTitle').textContent = `${surveyInfomation.title}`;
    document.getElementById('surveyDescription').textContent = `${surveyInfomation.description}`;
    document.getElementById('porgramType').textContent = `${surveyInfomation.programType}: ${surveyInfomation.program}`;
    // document.getElementById('program').textContent = `${surveyInfomation.program}`;
    document.getElementById('averageInfo').textContent = `Score: ${calculateAverageScore(answers)}`;
    document.getElementById('typeInfo').textContent = `Responses: ${answers.length}`;
    
    //* Check if the container element exists
    const container = document.getElementById('AllProgramsTable');
    if (!container) {
        console.error('Container not found');
        return;
    }

    //* Clear the container before rendering
    container.innerHTML = '';

    //* Loop through each answer and create a table
    answers.forEach(answer => {
        //* Create a wrapper div for each program
        const tableContainer = document.createElement('div');
        tableContainer.className = 'tableContainer';        //* Create a title for the response
        const titleContainer = document.createElement('div');   
        titleContainer.className = 'titleContainer';
        const title = document.createElement('h3');
        title.textContent = `Response from: ${answer.email}`;
        title.className = 'analytics-program-badge';
        titleContainer.appendChild(title);
        const infoContainer = document.createElement('div');
        infoContainer.className = 'program-info';
        infoContainer.innerHTML = `
            <p>Average: ${answer.average}</p>
            <p>Submitted: ${answer.submitted}</p>
        `;
        titleContainer.appendChild(infoContainer);
        tableContainer.appendChild(titleContainer);

        //* Create the table
        const table = document.createElement('table');
        table.className = 'display';

        //* Table head
        const thead = document.createElement('thead');
        thead.className = 'theadContainer';
        thead.innerHTML = /*HTML */ `
            <tr>
                <th>Question</th>
                <th>Answer</th>
            </tr>
        `;
        table.appendChild(thead);

        //* Table body
        const tbody = document.createElement('tbody');
        answer.measures.forEach(measure => {
            const tr = document.createElement('tr');
            tr.className = 'tbodyContainer';
            tr.innerHTML = `
                <td style="width: 40%; word-wrap: break-word;">${measure.openQuestion}</td>
                <td style="width: 60%; word-wrap: break-word;">${measure.answer}</td>
            `;
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
    });
}

//? backend function to get the answers
async function getLinkertSurveyResults(surveyId, fromDate, toDate) {
    const url = new URL(window.location.origin);
    url.pathname = '/SDGKU-Dashboard/src/models/surveyResults.php';
    url.searchParams.append('action', 'getLinkertSurveyResults');
    url.searchParams.append('surveyId', surveyId);
    url.searchParams.append('from', fromDate);
    url.searchParams.append('to', toDate);

    try {
        const response = await fetch(url.toString());
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Error fetching data');
        }

        const formattedAnswers = data.data.map(student => ({
            email: student.email,
            average: student.average + '%',
            submitted: student.date,
            measures: student.questions.map(q => ({
                openQuestion: q.question_text,
                answer: q.answer_text
            }))
        }));


        if (!formattedAnswers || formattedAnswers.length === 0) {
            console.error('No se encontraron resultados');
        }

        return formattedAnswers;

    } catch (error) {
        console.error('Error al obtener resultados:', error);
        throw error;
    }
}

//?get Survey Data from mySurveys.php
async function getSurveyData(surveyId) {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=getSurveyData&survey_id=${surveyId}`);
        const result = await response.json();
        
        if (result.status === 'error') {
            throw new Error(result.message);
        }
        
        return result.data;

    } catch (error) {
        console.error('Error getting survey data:', error);
        throw error;
    }
}


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


async function getResultsPerSurvey(surveyId, from, to) {
    const url = new URL('/SDGKU-Dashboard/src/models/surveyResultsPrePost.php', window.location.origin);
    url.searchParams.append('action', 'getResultsPerSurvey');
    url.searchParams.append('surveyId', surveyId);
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);

    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);
        const data = await res.json();
        
        if (data.status === 'success') {
            if (!data.data || !Array.isArray(data.data)) {
                console.warn('No survey results found or invalid data format');
                return null;
            }
            
            if (data.data.length === 0) {
                console.warn('No survey results found for the given period');
                return null;
            }

            return data;
        }
        
        throw new Error(data.message || 'Error retrieving survey results');
    } catch (error) {
        console.error('Error in getResultsPerSurvey:', error);
        showNotification('Error retrieving survey results', 'error');
        return null;
    }
}


//? get Pre and Post Survey Results
async function fetchSurveyResults(surveyId, fromDate, toDate, prePostScores) {
    try {
        const params = new URLSearchParams({
            action: 'getPrePostSurveyResults',
            surveyId: surveyId,
            from: fromDate,
            to: toDate
        });

        const response = await fetch(`/SDGKU-Dashboard/src/models/surveyResultsPrePost.php?${params.toString()}`);
        const data = await response.json();

        if (!data.success) {
            console.error('Error:', data.error);
            return;
        }
        const structuredData = data.data.map((respondent, index) => {
            return {
                email: respondent.email,
                date: respondent.submitted_at,
                average: prePostScores?.data ? prePostScores.data[index] + '%' || '0%' : '0%',
                submitted: respondent.submitted_at,
                measures: respondent.answers.map(answer => ({
                    openQuestion: answer.question_text,
                    answer: answer.answer_text
                })),
                answers: respondent.answers.reduce((acc, answer) => {
                    acc[answer.question_text] = answer.answer_text;
                    return acc;
                }, {})
            };
        });

        return structuredData;

    } catch (error) {
        console.error('Error fetching survey results:', error);
    }
}