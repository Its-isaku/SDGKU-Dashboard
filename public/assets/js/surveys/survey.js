let surveyStartTime = null; // Marca el tiempo en que el usuario inicia el cuestionario

// Muestra una notificación (éxito o error) en pantalla
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Tipos de preguntas: cada función crea un input específico
function createTextAreaInput(questionId, container) {
    const textarea = document.createElement('textarea');
    textarea.name = `question_${questionId}`;
    textarea.required = true;
    textarea.rows = 3;
    textarea.placeholder = 'Write your answer...';
    container.appendChild(textarea);
}

function createTrueFalseInput(questionId, container) {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    ['True', 'False'].forEach((text, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `question_${questionId}`;
        input.value = index === 0 ? '1' : '0';
        input.required = true;

        const label = document.createElement('label');
        label.textContent = text;

        optionDiv.appendChild(label);
        optionDiv.appendChild(input);
        optionsContainer.appendChild(optionDiv);
    });

    container.appendChild(optionsContainer);
}

// Obtiene opciones desde el backend para preguntas de opción múltiple
function createMultipleChoiceInput(questionId, container) {
    fetch(`/SDGKU-Dashboard/src/models/survey.php?action=getQuestionOptions&questionId=${questionId}&type=multiple`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.options.length > 0) {
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'options-container';

                data.options.forEach(opt => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';

                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = `question_${questionId}`;
                    input.value = opt.question_opt_id;
                    input.required = true;

                    const label = document.createElement('label');
                    label.textContent = opt.option_text;

                    optionDiv.appendChild(label);
                    optionDiv.appendChild(input);
                    optionsContainer.appendChild(optionDiv);
                });

                container.appendChild(optionsContainer);
            } else {
                container.innerHTML += `<p>No options available.</p>`;
            }
        })
        .catch(() => {
            container.innerHTML += `<p>Error loading options.</p>`;
        });
}

// Escala de Likert para preguntas tipo 1-5 o 1-3
function createLikertScaleInput(questionId, scaleSize, container) {
    const type = scaleSize === 5 ? 'Linkert_1_5' : 'Linkert_1_3';
    fetch(`/SDGKU-Dashboard/src/models/survey.php?action=getQuestionOptions&questionId=${questionId}&type=${type}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.options.length > 0) {
                const wrapper = document.createElement('div');
                wrapper.className = 'likert-container';

                const table = document.createElement('table');
                table.className = 'likert-scale';

                // Cabecera
                const header = document.createElement('tr');
                header.appendChild(document.createElement('th'));

                data.options.forEach(opt => {
                    const th = document.createElement('th');
                    th.textContent = opt.scale_option_text;
                    header.appendChild(th);
                });

                // Fila con opciones
                const row = document.createElement('tr');
                const labelCell = document.createElement('td');
                labelCell.textContent = 'Your answer:';
                row.appendChild(labelCell);

                data.options.forEach(opt => {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = `question_${questionId}`;
                    input.value = opt.scale_num;
                    input.required = true;
                    td.appendChild(input);
                    row.appendChild(td);
                });

                table.appendChild(header);
                table.appendChild(row);
                wrapper.appendChild(table);
                container.appendChild(wrapper);
            } else {
                container.innerHTML += `<p>No scale options available.</p>`;
            }
        })
        .catch(() => {
            container.innerHTML += `<p>Error loading Likert scale.</p>`;
        });
}

// Carga y renderiza preguntas del cuestionario
function loadQuestions(questions) {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    if (!questions || questions.length === 0) {
        container.innerHTML = '<p>No questions available.</p>';
        return;
    }

    questions.forEach((question, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'question-item';
        wrapper.dataset.questionId = question.questions_id;
        wrapper.dataset.questionType = question.question_type_id;

        const label = document.createElement('label');
        label.innerHTML = `<strong>${index + 1}. ${question.question_text}</strong>`;
        wrapper.appendChild(label);

        // Decide qué tipo de input mostrar
        switch (parseInt(question.question_type_id)) {
            case 1:
                createMultipleChoiceInput(question.questions_id, wrapper);
                break;
            case 2:
                createLikertScaleInput(question.questions_id, 5, wrapper);
                break;
            case 3:
                createLikertScaleInput(question.questions_id, 3, wrapper);
                break;
            case 4:
                createTextAreaInput(question.questions_id, wrapper);
                break;
            case 5:
                createTrueFalseInput(question.questions_id, wrapper);
                break;
            default:
                wrapper.innerHTML += `<p class="error">Unknown question type.</p>`;
        }

        container.appendChild(wrapper);
    });
}

// Carga los cohorts disponibles para el programa
function loadCohorts(programId) {
    fetch(`/SDGKU-Dashboard/src/models/survey.php?action=getCohorts&programId=${programId}`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('optSelect');
            select.innerHTML = '';

            const selectLabel = document.getElementById('optLabel');
            selectLabel.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';

            defaultOption.disabled = true;
            defaultOption.selected = true;

            if (data.success && data.cohorts.length > 0) {
                data.cohorts.forEach(cohort => {
                    console.log(cohort.program_type_id)
                    if (cohort.program_type_id === 2 || cohort.program_type_id === 3) {
                        defaultOption.textContent = 'Select your section';
                        selectLabel.innerHTML = 'Your Section <span class="required">*</span>';
                        select.appendChild(defaultOption);
                    }
                    else {
                        defaultOption.textContent = 'Select your cohort';
                        selectLabel.innerHTML = 'Your Cohort <span class="required">*</span>';
                        select.appendChild(defaultOption);
                    }
                    const option = document.createElement('option');
                    option.value = cohort.cohort_id;
                    option.textContent = cohort.cohort;
                    select.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.textContent = 'No option available';
                option.disabled = true;
                select.appendChild(option);
            }
        })
        .catch(() => {
            showNotification('Error loading.', 'error');
        });
}

// Verifica si el token es válido para mostrar la encuesta
function validateToken(token) {
    fetch(`/SDGKU-Dashboard/src/models/survey.php?action=getSurvey&token=${token}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderSurvey(data);
            } else {
                showNotification(data.message || 'Invalid or expired survey token.', 'error');
                document.getElementById('surveyContent').style.display = 'none';
                document.querySelector('.survey-meta').style.display = 'none';
                document.getElementById('surveyExpired').style.display = 'block';
            }
        })
        .catch(() => {
            showNotification('An error occurred validating the token.', 'error');
            document.getElementById('surveyContent').style.display = 'none';
            document.querySelector('.survey-meta').style.display = 'none';
            document.getElementById('surveyExpired').style.display = 'block';
        });
}

// Renderiza los datos básicos y preguntas del cuestionario
function renderSurvey(data) {
    document.querySelector('.survey-meta').style.display = 'block';
    document.getElementById('surveyTitle').textContent = `${data.title}`;
    document.getElementById('surveyDescription').textContent = `${data.description}`;
    document.getElementById('expiryDateText').textContent = `Expires at ${data.expires_at}`;
    document.getElementById('surveyContent').dataset.surveyId = data.survey_id;
    loadCohorts(data.program_id);
    loadQuestions(data.questions);
}

// Cambia a la sección de preguntas tras validar correo y cohort
function handleNext() {
    const email = document.getElementById('respondentEmail').value.trim();
    const cohort = document.getElementById('cohortSelect').value;
    const isValidEmail = email.endsWith('@sdgku.edu');

    if (!email || !isValidEmail) {
        showNotification('Please enter a valid institutional email (@sdgku.edu).', 'error');
        return;
    }

    if (!cohort) {
        showNotification('Please select your cohort.', 'error');
        return;
    }

    surveyStartTime = Date.now(); // Marca tiempo de inicio

    document.getElementById('infoSection').style.display = 'none';
    document.getElementById('questionSection').style.display = 'block';
    document.querySelector('.survey-meta').style.display = 'block';
    showNotification('Your information has been validated.', 'success');
}

// Regresa a la sección de información
function handleBack() {
    document.getElementById('questionSection').style.display = 'none';
    document.querySelector('.survey-meta').style.display = 'none';
    document.getElementById('infoSection').style.display = 'block';
}

// Muestra mensaje de éxito final
function successSurvey() {
    document.getElementById('surveyContent').style.display = 'none';
    document.getElementById('surveySuccess').style.display = 'block';
}

// Obtiene todas las respuestas seleccionadas por el usuario
function getAnswers() {
    const answers = [];
    const questionItems = document.querySelectorAll('.question-item');

    questionItems.forEach(item => {
        const questionId = item.dataset.questionId;
        const questionType = parseInt(item.dataset.questionType);
        let answer = null;

        switch (questionType) {
            case 1: case 2: case 3: case 5:
                const selected = item.querySelector('input[type="radio"]:checked');
                if (selected) answer = selected.value;
                break;
            case 4:
                const textarea = item.querySelector('textarea');
                if (textarea) answer = textarea.value.trim();
                break;
        }

        if (answer !== null) {
            answers.push({ questionId, answer, questionType });
        }
    });

    return answers;
}

// Envía el cuestionario completo al backend
function submitSurvey() {
    const email = document.getElementById('respondentEmail').value.trim();
    const cohortId = document.getElementById('cohortSelect').value;
    const surveyId = document.getElementById('surveyContent').dataset.surveyId;
    const token = new URLSearchParams(window.location.search).get('token');
    const responses = getAnswers();

    if (!email || !cohortId || !surveyId || !token || responses.length === 0) {
        showNotification('Missing required data or unanswered questions.', 'error');
        return;
    }

    const completionTime = surveyStartTime ? Math.floor((Date.now() - surveyStartTime) / 1000) : null;

    const allAnswers = {
        surveyId,
        token,
        email,
        cohortId,
        responses,
        completionTime
    };

    fetch('/SDGKU-Dashboard/src/models/survey.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allAnswers)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showNotification('Survey submitted successfully!', 'success');
                successSurvey();
            } else {
                showNotification(data.message || 'Submission failed.', 'error');
            }
        })
        .catch(() => {
            showNotification('Network error while submitting.', 'error');
        });
}

// Inicializa el sistema al cargar la página
function init() {
    document.querySelector('.survey-meta').style.display = 'none';

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        document.getElementById('surveyTitle').textContent = 'Invalid or expired survey token.';
        showNotification('Invalid or expired survey token.', 'error');
        document.getElementById('surveyContent').style.display = 'none';
        return;
    }

    validateToken(token);

    // Configura los botones
    document.getElementById('nextBtn').addEventListener('click', function (e) {
        e.preventDefault();
        handleNext();
    });

    document.getElementById('backBtn').addEventListener('click', function () {
        handleBack();
    });

    document.getElementById('submitSurvey').addEventListener('click', function (e) {
        e.preventDefault();
        submitSurvey();
    });
}

document.addEventListener('DOMContentLoaded', init);
