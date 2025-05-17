document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {showNotification('Invalid survey link. Please check your URL.', 'error'); return;}

    fetchSurveyData(token);

    document.getElementById('surveyResponseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitSurveyResponse();
    });
});

function fetchSurveyData(token) {
    fetch(`/SDGKU-Dashboard/src/models/surveyResponse.php?action=getSurvey&token=${token}`)
    .then(response => {
        if (!response.ok) {throw new Error('Network response was not ok');}
        return response.json();
    })
    .then(data => {
        if(data.success) {
            //~ load survey info
            document.getElementById('surveyTitle').textContent = data.title || 'Survey';
            document.getElementById('surveyDescription').textContent = data.description || '';

            //~ condition to set expiry date if available
            if (data.expires_at) {
                const expiresAt = new Date(data.expires_at);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const hours = expiresAt.getHours();
                const minutes = expiresAt.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
                
                document.getElementById('expiryDateText').textContent = 
                    `Expires: ${expiresAt.toLocaleDateString('en-US', options)} at ${formattedTime}`;
            } else {
                document.getElementById('expiryDate').style.display = 'none';
            }

            //~ store survey id in form for submission
            document.getElementById('surveyResponseForm').dataset.surveyId = data.survey_id;

            //? --------------- handlers for cohort/session field ---------------
            updateCohortLabel(data.program_type);

            loadCohortOptions(data.program_id);

            //~ load questions
            loadQuestions(data.questions);
        } else {
            if (data.message === 'This survey has expired.') {
                document.getElementById('surveyContent').style.display = 'none';
                document.getElementById('surveyExpired').style.display = 'block';
            } else {showNotification(data.message || 'Error loading survey. Please try again later.', 'error');}
        }
    })
    .catch(error => {
        console.error('Error fetching survey data:', error);
        showNotification('Error: ' + error.message, 'error');
    });
}

function updateCohortLabel(programType) {
    const label = document.getElementById('cohortLabel');
    const select = document.getElementById('cohortSelect');

    if (programType === 'Certificate Program') {
        label.innerHTML = 'Your Cohort <span class="required">*</span>';
        select.setAttribute('placeholder', 'Select your cohort');
    } else {
        label.innerHTML = 'Your Session <span class="required">*</span>'; //~ for bachelor's or master's programs
        select.setAttribute('placeholder', 'Select your session');
    }
}

function loadCohortOptions(programId) {
    fetch(`/SDGKU-Dashboard/src/models/surveyResponse.php?action=getCohorts&programId=${programId}`)
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('cohortSelect');
        select.innerHTML = '';

        //~ default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select your cohort';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        if (data.success && data.cohorts && data.cohorts.length > 0) {
            data.cohorts.forEach(cohort => {
                const option = document.createElement('option');
                option.value = cohort.cohort_id;
                option.textContent = cohort.cohort;
                select.appendChild(option);
            });
        } else {
            const noOptions = document.createElement('option');
            noOptions.value = '';
            noOptions.textContent = 'No options available';
            noOptions.disabled = true;
            select.appendChild(noOptions);
        }
    })
    .catch(error => {
        console.error('Error loading cohort options:', error);
        const select = document.getElementById('cohortSelect');
        select.innerHTML = '<option value="" disabled selected>Error loading options</option>';
    });
}

function loadQuestions(questions) {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    if (!questions || questions.length === 0){
        container.innerHTML = '<p class="no-questions">No questions available for this survey.</p>';
        return;
    }

    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';

        questionDiv.dataset.questionId = question.questions_id;
        questionDiv.dataset.questionType = question.question_type_id;
        
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.innerHTML = `<strong>${index + 1}. ${question.question_text}</strong>`;

        questionDiv.appendChild(questionText);
        createQuestionInput(question, questionDiv);
        container.appendChild(questionDiv);
    });
}

function createQuestionInput(question, container) {
    switch (parseInt(question.question_type_id)){
        case 1: createMultipleChoiceInput(question, container); break; //~ multiple choice
        case 2: createLikertScale(question, container, 5); break; //~ likert 1-5
        case 3: createLikertScale(question, container, 3); break; //~ likert 1-3
        case 4: createOpenEndedInput(question, container); break; //~ open-ended
        case 5: createTrueFalseInput(question, container); break; //~ rating scale
        default: const unknownType = document.createElement('p');
            unknownType.className = 'error-message';
            unknownType.textContent = 'Unknown question type';
            container.appendChild(unknownType);
    }
}

function createMultipleChoiceInput(question, container) {
    fetch(`/SDGKU-Dashboard/src/models/surveyResponse.php?action=getQuestionOptions&questionId=${question.questions_id}&type=multiple`)
    .then(response => response.json())
    .then(data=> {
        if (data.success && data.options) {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';

            data.option.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question_${question.questions_id}`;
                radio.value = option.question_opt_id;
                radio.id = `option_${option.question_opt_id}`;
                radio.required = true;

                const label = document.createElement('label');
                label.htmlFor = radio.id;
                label.textContent = option.option_text;
                
                optionDiv.appendChild(radio);
                optionDiv.appendChild(label);
                optionsContainer.appendChild(optionDiv);
            });
            container.appendChild(optionsContainer);
        } else {
            const errorMsg = document.createElement('p');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'No options available for this question.';
            container.appendChild(errorMsg);
        }
    })
    .catch(error => {
        console.error('Error loading options:', error);
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Error loading options.';
        container.appendChild(errorMsg);
    });
}

function createLikertScale(question, container, scaleSize) {
    const tableName = scaleSize === 5 ? 'Linkert_1_5' : 'Linkert_1_3';

    fetch(`/SDGKU-Dashboard/src/models/surveyResponse.php?action=getQuestionOptions&questionId=${question.questions_id}&type=${tableName}`)
    .then(response => response.json())
    .then(data => {
        if (data.sucess && data.options) {
            const scaleContainer = document.createElement('div');
            scaleContainer.className = 'likert-container';
            
            const table = document.createElement('table');
            table.className = 'likert-scale';
            
            const headerRow = document.createElement('tr');
            headerRow.appendChild(document.createElement('th')); 

            data.options.forEach(option => {
                const th = document.createElement('th');
                th.textContent = option.scale_option_text;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            const responseRow = document.createElement('tr');
            const questionCell = document.createElement('td');
            questionCell.textContent = 'Your response:';
            responseRow.appendChild(questionCell);

            //~radio buttons for each scale point
            data.options.forEach(option => {
                const td = document.createElement('td');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question_${question.questions_id}`;
                radio.value = option.scale_id;
                radio.required = true;
                td.appendChild(radio);
                responseRow.appendChild(td);
            });
            
            table.appendChild(responseRow);
            scaleContainer.appendChild(table);
            container.appendChild(scaleContainer);
        } else {
            const errorMsg = document.createElement('p');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'No scale options available.';
            container.appendChild(errorMsg);
        }
    })
    .catch(error => {
        console.error('Error loading Likert scale:', error);
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Error loading scale options.';
        container.appendChild(errorMsg);
    })
}

function createOpenEndedInput(question, container) {
    const textarea = document.createElement('textarea');
    textarea.name = `question_${question.questions_id}`;
    textarea.required = true;
    textarea.placeholder = 'Enter your response here...';
    textarea.rows = 4;
    container.appendChild(textarea);
}

function createTrueFalseInput(question, container) {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'true-false-options';
    
    //~true option
    const trueDiv = document.createElement('div');
    trueDiv.className = 'option';
    const trueRadio = document.createElement('input');
    trueRadio.type = 'radio';
    trueRadio.name = `question_${question.questions_id}`;
    trueRadio.value = '1';
    trueRadio.id = `true_${question.questions_id}`;
    trueRadio.required = true;
    
    const trueLabel = document.createElement('label');
    trueLabel.htmlFor = trueRadio.id;
    trueLabel.textContent = 'True';
    
    trueDiv.appendChild(trueRadio);
    trueDiv.appendChild(trueLabel);
    
    //~false option
    const falseDiv = document.createElement('div');
    falseDiv.className = 'option';
    const falseRadio = document.createElement('input');
    falseRadio.type = 'radio';
    falseRadio.name = `question_${question.questions_id}`;
    falseRadio.value = '0';
    falseRadio.id = `false_${question.questions_id}`;
    falseRadio.required = true;
    
    const falseLabel = document.createElement('label');
    falseLabel.htmlFor = falseRadio.id;
    falseLabel.textContent = 'False';
    
    falseDiv.appendChild(falseRadio);
    falseDiv.appendChild(falseLabel);
    
    optionsDiv.appendChild(trueDiv);
    optionsDiv.appendChild(falseDiv);
    container.appendChild(optionsDiv);
}

function submitSurveyResponse() {
    const form = document.getElementById('surveyResponseForm');
    const surveyId = form.dataset.surveyId;
    const email = document.getElementById('respondentEmail').value;
    const cohortId = document.getElementById('cohortSelect').value;
    const token = new URLSearchParams(window.location.search).get('token');

    if(!cohortId){
        showNotification('Please select your cohort/session.', 'error');
        return;
    }
    //~collecting responses
    const responses = [];
    const questions = document.querySelectorAll('.question-container');

    questions.forEach(questionDiv => {
        const questionId = questionDiv.dataset.questionId;
        const questionType = questionDiv.dataset.questionType;
        let answer = null;

        switch (parseInt(questionType)) {
            case 1: const selectedOption = questionDiv.querySelector(`input[name="question_${questionId}"]:checked`);
                answer = selectedOption ? selectedOption.value : null;
                break;
            case 2:
            case 3: 
                const likertOption = questionDiv.querySelector(`input[name="question_${questionId}"]:checked`);
                answer = likertOption ? likertOption.value : null;
                break;
            case 4: const textarea = questionDiv.querySelector(`textarea[name="question_${questionId}"]`);
                answer = textarea ? textarea.value : null;
                break;
            case 5: const tfOption = questionDiv.querySelector(`input[name="question_${questionId}"]:checked`);
                answer = tfOption ? tfOption.value : null;
                break;
        }

        if (answer !== null) {
            responses.push({
                questionId: questionId,
                questionType: questionType,
                answer: answer
            });
        }
    });

    const submitData = {
        surveyId: surveyId,
        token: token,
        email: email,
        cohortId: cohortId,
        responses: responses
    };

    //* ---------- submitting responses ----------
    fetch('/SDGKU-Dashboard/src/models/surveyResponse.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Thank you! Your response has been submitted.', 'success');
            
            form.innerHTML = `<div class="success-message">
                <h3>Thank you for your feedback!</h3>
                <p>Your response has been recorded successfully.</p>
            </div>`;
        } else {
            showNotification(data.message || 'Error submitting response', 'error');
        }
    })
    .catch(error => {
        showNotification('Error: ' + error.message, 'error');
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}