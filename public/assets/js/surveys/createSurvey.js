//? Imports and Initial Data
import { hideAll } from '../../js/auth/formUtils.js';

const surveyData = {
    details: {
        title: '',
        description: '',
        type: '',
        programType: '',
        program: '',
        cohort: '',
        subject: '',
        expirationDate: '',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    },
    questions: [] 
};

const sections = {
    optionSurveyDetails: 'surveyDetailsSection',
    optionQuestions: 'surveyQuestionsSection',
    optionPreview: 'surveyPreviewSection',
};

//? Validation for Survey Details
function validateSurveyDetails() {
    const title = document.getElementById('surveyTitle').value.trim();
    const description = document.getElementById('surveyDescription').value.trim();
    const type = document.getElementById('surveyType').value;
    const programType = document.getElementById('programType').value;
    const program = document.getElementById('program').value;
    const cohort = document.getElementById('cohort').value;
    const subject = document.getElementById('subject').value;
    const expirationDate = document.getElementById('expirationDate').value.trim();

    if (!title || !description || !type || !programType || !program || !cohort || !subject || !expirationDate) {
        showNotification('Please fill in all required survey details before continuing.', 'error'); 
        return false;
    }
    return true;
}

//? notification Logic
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

//? Preview Logic
function validateQuestions() {
    let isValid = true;
    const questionForms = document.querySelectorAll('.QuestionContent');

    questionForms.forEach((form, index) => {
        const titleInput = form.querySelector('.questionTitleInput');
        const typeSelect = form.querySelector('.questionTypeSelect');
        const title = titleInput.value.trim();
        const type = typeSelect.value;

        if (!title) {
            isValid = false;
            showNotification(`Question ${index + 1}: Title is required.`, 'error');
        }
        if (!type) {
            isValid = false;
            showNotification(`A question Type is required.`, 'error');
        }
        if (type === '1') { //* Multiple Choice
            const options = form.querySelectorAll('.optionInput input[type="text"]');
            let allFilled = true;
            options.forEach(opt => {
                if (!opt.value.trim()) allFilled = false;
            });
            if (!allFilled) {
                isValid = false;
                showNotification(`Question ${index + 1}: All multiple choice options must be filled.`, 'error');
            }
            const correct = form.querySelector('.optionInput input[type="radio"]:checked');
            if (!correct) {
                isValid = false;
                showNotification(`Question ${index + 1}: A correct answer must be selected for multiple choice.`, 'error');
            }
        }
        if (type === '5') { //* True/False
            const correct = form.querySelector('.QuestionTrueFalse input[type="radio"]:checked');
            if (!correct) {
                isValid = false;
                showNotification(`Question ${index + 1}: A correct answer must be selected for true/false.`, 'error');
            }
        }
    });
    return isValid;
}

//? Section Navigation Logic
function handleSectionClick(clickedId) {
    //* Prevent navigation to Questions or Preview if details are incomplete
    if ((clickedId === 'optionQuestions' || clickedId === 'optionPreview') && !validateSurveyDetails()) {
        return;
    }
    //* Prevent navigation to Preview if questions are incomplete
    if (clickedId === 'optionPreview') {
        const isValidQuestions = validateQuestions();
        if (!isValidQuestions) {
            showNotification('Please complete all questions before previewing.', 'error'); 
            return;
        }
    }
    //* Hide all main survey sections
    hideAll('.SurveyInfo, .SurveyQuestions, .SurveyPreview');

    //* Remove selected style from all options
    document.querySelectorAll('.surveyOption').forEach(opt => {
        opt.classList.remove('selectedOption');
    });

    //* Show the selected section
    const sectionId = sections[clickedId];
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'flex';

    //* Highlight the clicked button
    const clickedBtn = document.getElementById(clickedId);
    if (clickedBtn) clickedBtn.classList.add('selectedOption');
}

//? Navigation Button Logic
function navButton(buttonId, targetSectionKey) {
    //* Attach navigation event to button
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => handleSectionClick(targetSectionKey));
    }
}

//? Add click event for each navigation option
Object.keys(sections).forEach(buttonId => {
    //* Add click event for each navigation option
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => handleSectionClick(buttonId));
    }
});

//? navButton in createSuvery
navButton('btnContinueToQuestions', 'optionQuestions');
navButton('btnBackToDetails', 'optionSurveyDetails');
navButton('btnPreviewSurvey', 'optionPreview');
navButton('btnBackToQuestions', 'optionQuestions');

//? Set default section to display
handleSectionClick('optionSurveyDetails');

//? Survey Details Collection
document.getElementById('btnContinueToQuestions').addEventListener('click', () => {
    //* Collect survey details from form
    const title = document.getElementById('surveyTitle').value.trim();
    const description = document.getElementById('surveyDescription').value.trim();
    const type = document.getElementById('surveyType').value;
    const programType = document.getElementById('programType').value;
    const program = document.getElementById('program').value;
    const cohort = document.getElementById('cohort').value;
    const subject = document.getElementById('subject').value;
    const expirationDate = document.getElementById('expirationDate').value.trim();

    surveyData.details.title = title;
    surveyData.details.description = description;
    surveyData.details.type = type;
    surveyData.details.programType = programType;
    surveyData.details.program = program;
    surveyData.details.expirationDate = expirationDate; 
    surveyData.details.cohort = cohort;
    surveyData.details.subject = subject;
});

//? Question Form Logic
let questionCounter = 1;

function createQuestionForm(id) {
    //* Create a new question form element
    const container = document.createElement('div');
    container.className = 'QuestionContent';
    container.id = `QuestionContent${id}`;

    container.innerHTML =  /* HTML */ ` 

        <!--* Question title and type selection UI -->
        <div class="QuestionTitle">
            <h4 id="questionNumberTitle">Question #${id}</h4>

            <div class="QuestionInput">
                <label for="questionTitle${id}">Question Title</label>
                <input type="text" id="questionTitle${id}" class="questionTitleInput" placeholder="Enter survey name" required>
            </div>

            <div class="QuestionInput selectInput">
                <label for="questionType${id}">Question Type</label>
                <select id="questionType${id}" class="questionTypeSelect" required>
                    <option value="" disabled selected hidden>Select type</option>
                    <option value="1">Multiple Choice</option>
                    <option value="2">likert scale 1-5</option>
                    <option value="3">likert scale 1-3</option>
                    <option value="4">Open</option>
                    <option value="5">True/False</option>
                </select>
            </div>
        </div>

        <!--* Multiple choice options section -->
        <div class="QuestionMultiple questionOptions" id="questionMultipleSection${id}" style="display: none;">
            <h4>Options</h4>
            <P class="answerDiscpription">Select the correct answer</P>    

                <div id="optionsContainer${id}">
                    <div class="QuestionInput optionInput"> 
                        <div class="CorrectAnswerContainer correctAnswer">
                            <label>
                                <input type="radio" name="correctAnswer${id}" class="correctAnswerRadio">
                            </label>
                        </div>
                        <input type="text" placeholder="Enter option" required>
                        <i class="fa-solid fa-trash"></i>   
                    </div>

                    <div class="QuestionInput optionInput">
                        <div class="CorrectAnswerContainer correctAnswer">
                            <label>
                                <input type="radio" name="correctAnswer${id}" class="correctAnswerRadio">
                            </label>
                        </div>
                        <input type="text" placeholder="Enter option" required>
                        <i class="fa-solid fa-trash"></i>   
                    </div>
                </div>
            <button class="btnAddOption" data-id="${id}"><i class="fa-solid fa-plus"></i> add Option</button>
        </div>

        <!--* Likert scale 1-5 section -->
        <div class="QuestionGrade questionOptions" id="questionGradeSection5${id}" style="display: none;">
            <h4>Grade</h4>

            <div class="gradeContainer">
                <label><input type="radio" name="gradeOption${id}" value="1">Strongly Disagree</label>
                <label><input type="radio" name="gradeOption${id}" value="2">Disagree</label>
                <label><input type="radio" name="gradeOption${id}" value="3">Neutral</label>
                <label><input type="radio" name="gradeOption${id}" value="4">Agree</label>
                <label><input type="radio" name="gradeOption${id}" value="5">Strongly Agree</label>
            </div>
        </div>

        <!--* Likert scale 1-3 section -->
        <div class="QuestionGrade questionOptions" id="questionGradeSection3${id}" style="display: none;">
            <h4>Grade</h4>

            <div class="gradeContainer">
                <label><input type="radio" name="gradeOption${id}" value="1">Disagree</label>
                <label><input type="radio" name="gradeOption${id}" value="2">Neutral</label>
                <label><input type="radio" name="gradeOption${id}" value="3">Agree</label>
            </div>
        </div>

        <!--* Open text section -->
        <div class="QuestionOpen questionOptions" id="questionOpenSection${id}" style="display: none;">
            <h4>Open text</h4>
            <div class="OpenInput">
                <textarea id="Open" placeholder="Type answer here" required></textarea>
            </div>
        </div>

        <!--* True/False section -->
        <div class="QuestionTrueFalse questionOptions" id="questionTrueFalseSection${id}" style="display: none;">
            <h4>Grade</h4>
            <P class="answerDiscpription">Select the correct answer</P>

            <div class="TrueFalseContainer">
                <label><input type="radio" name="trueFalse${id}" value=1>True</label>
                <label><input type="radio" name="trueFalse${id}" value=0>False</label>
            </div>
        </div>

        <!--* Delete question button -->
        <button class="deleteQuestionBtn deleteBtn">Delete Question</button>

        `;

    //? Add event listener for question type selection
    const select = container.querySelector(`#questionType${id}`);
    select.addEventListener('change', () => {
        //* Show only the selected question type section
        container.querySelectorAll('.questionOptions').forEach(el => el.style.display = 'none');
        const type = select.value;
        if (type === '1') container.querySelector(`#questionMultipleSection${id}`).style.display = 'block';
        if (type === '2') container.querySelector(`#questionGradeSection5${id}`).style.display = 'block';
        if (type === '3') container.querySelector(`#questionGradeSection3${id}`).style.display = 'block';
        if (type === '4') container.querySelector(`#questionOpenSection${id}`).style.display = 'block';
        if (type === '5') container.querySelector(`#questionTrueFalseSection${id}`).style.display = 'block';
    });

    //? Add event listener for the add option button
    const addOptionBtn = container.querySelector('.btnAddOption');
    addOptionBtn.addEventListener('click', (e) => {
        //* Add a new option input for multiple choice
        e.preventDefault();
        const optionsContainer = container.querySelector(`#optionsContainer${id}`);
        const opt = document.createElement('div');
        opt.className = 'QuestionInput optionInput';
        opt.innerHTML = /* HTML */`

            <div class="CorrectAnswerContainer correctAnswer">
                <label>
                    <input type="radio" name="correctAnswer${id}" class="correctAnswerRadio">
                </label>
            </div>
            <input type="text" placeholder="Enter option" required>
            <i class="fa-solid fa-trash"></i>

        `;
        opt.querySelector('i').addEventListener('click', () => opt.remove());
        optionsContainer.appendChild(opt);
    });

    //? Add event listener for the delete icon in each option input
    container.querySelectorAll('.optionInput i').forEach(icon => {
        //* Remove option input on trash icon click
        icon.addEventListener('click', () => {
            icon.parentElement.remove();
        });
    });

    //? Add event listener for the delete question button
    container.querySelector('.deleteQuestionBtn').addEventListener('click', () => {
        const totalQuestions = document.querySelectorAll('.QuestionContent').length;
        if (totalQuestions === 1) {
            showNotification('There must be at least one question in the survey.', 'error');
            return;
        }
        container.remove();
        questionCounter -= 1;
    });

    return container;
}

//? Add initial question form on page load
document.getElementById('btnAddQuestion').addEventListener('click', () => {
    //* Add a new question form to the container
    const form = createQuestionForm(questionCounter);
    document.getElementById('questionFormsContainer').appendChild(form);
    questionCounter++;
});

// Ensure at least one question form is loaded on page load
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('questionFormsContainer');
    if (container && container.children.length === 0) {
        const form = createQuestionForm(questionCounter);
        container.appendChild(form);
        questionCounter++;
    }
});

//? Format Expiration Date
function formatExpirationDate(dateString) {
    if (!dateString) return '';
    //* Format: YYYY-MM-DDTHH:mm (from input type="datetime-local")
    const [date, time] = dateString.split('T');
    if (!date || !time) return dateString;
    return `${date} : ${time}`;
}

//? Helper to get local datetime string in 'YYYY-MM-DD HH:mm:ss' format
function getLocalDateTimeString() {
    const now = new Date();
    return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');
}

//? Helper to format expiration date from input type="datetime-local" to 'YYYY-MM-DD HH:mm:ss'
function formatExpirationDateToLocal(dateString) {
    if (!dateString) return '';
    const [date, time] = dateString.split('T');
    if (!date || !time) return dateString;
    const timeWithSeconds = time.length === 5 ? time + ':00' : time;
    return `${date} ${timeWithSeconds}`;
}

function updatePreview() {
    //* Update the survey preview section with current data
    const container = document.getElementById('previewContainer');
    container.innerHTML =  '';

    const titleEl = document.createElement('h3');
    titleEl.textContent = surveyData.details.title || 'Untitled Survey';
    container.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.textContent = surveyData.details.description || 'No description provided.';
    container.appendChild(descEl);

    //* Always get the expiration date directly from the input
    const expirationInput = document.getElementById('expirationDate');
    const expirationDateValue = expirationInput ? expirationInput.value : '';
    const formattedExpiration = formatExpirationDate(expirationDateValue);
    const expirationDatePreview = document.getElementById('expirationDatePreview');
    if (expirationDatePreview) {
        expirationDatePreview.textContent = formattedExpiration || 'No expiration date set.';
    }

    const Likert5 = [
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree"
    ];

    const Likert3 = [
        "Disagree",
        "Neutral",
        "Agree"
    ];

    surveyData.questions.forEach((q, idx) => {
        //* Render each question in the preview
        const qEl = document.createElement('div');
        qEl.className = 'previewQuestion';

        const qTitle = document.createElement('h4');
        qTitle.textContent = q.title;
        qEl.appendChild(qTitle);

        if (q.type === '1') {
            //* Multiple choice preview
            const optContainer = document.createElement('div');
            optContainer.className = 'previewMultipleOptions';
            q.options.forEach((opt, i) => {
                const label = document.createElement('label');
                label.innerHTML =   `<input type="radio" name="previewQ${idx}" value="${i}"> ${opt}`;
                optContainer.appendChild(label);
            });
            qEl.appendChild(optContainer);
        }

        if (q.type === '2') {
            //* Likert scale 1-5 preview
            const grade = document.createElement('div');
            grade.className = 'previewGrade5';
            Likert5.forEach((labelText, i) => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="radio" name="previewQ${idx}" value="${i + 1}"> ${labelText}`;
                grade.appendChild(label);
            });
            qEl.appendChild(grade);
        }

        if (q.type === '3') {
            //* Likert scale 1-3 preview
            const grade = document.createElement('div');
            grade.className = 'previewGrade3';
            Likert3.forEach((labelText, i) => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="radio" name="previewQ${idx}" value="${i + 1}"> ${labelText}`;
                grade.appendChild(label);
            });
            qEl.appendChild(grade);
        }

        if (q.type === '4') {
            //* Open text preview
            const open = document.createElement('div');
            open.className = 'previewOpenText';
            open.innerHTML =  `<textarea placeholder="Your response..."></textarea>`;
            qEl.appendChild(open);
        }

        if (q.type === '5') {
            //* True/False preview
            const tf = document.createElement('div');
            tf.className = 'previewTrueFalse';
            tf.innerHTML =  `
                <label><input type="radio" name="previewQ${idx}" value=1> True</label>
                <label><input type="radio" name="previewQ${idx}" value=0> False</label>
            `;
            qEl.appendChild(tf);
        }

        container.appendChild(qEl);
    });
}

//? Add event listener for the preview button
document.getElementById('btnPreviewSurvey').addEventListener('click', () => {
    const questionForms = document.querySelectorAll('.QuestionContent');
    if (questionForms.length === 0) {
        showNotification('You must add at least one question before previewing.', 'error');
        return false;
    }
    surveyData.questions = [];
    const isValid = validateQuestions();
    if (!isValid) {
        showNotification('Please complete all questions before previewing.', 'error');
        return;
    }

    questionForms.forEach((form, index) => {
        const titleInput = form.querySelector('.questionTitleInput');
        const typeSelect = form.querySelector('.questionTypeSelect');
        const question = {
            title: titleInput.value.trim(),
            type: typeSelect.value,
            options: []
        };
        if (question.type === '1') {
            const options = form.querySelectorAll(`#optionsContainer${question.id} input[type="text"]`);
            options.forEach(opt => {
                if (opt.value.trim()) question.options.push(opt.value.trim());
            });
        }
        surveyData.questions.push(question);
        console.log(JSON.stringify(surveyData, null, 2));
    });
    
    updatePreview();
});

//? update preview when switching to preview section
const previewOption = document.getElementById('optionPreview');
if (previewOption) {
    previewOption.addEventListener('click', (e) => {
        //* Run validation before allowing navigation to preview
        const isValid = validateQuestions();
        if (!isValid) {
            //* Prevent navigation to preview if validation fails
            e.preventDefault();
            showNotification('Please complete all questions before previewing.', 'error');
            return;
        }
        updatePreview();
        handleSectionClick('optionPreview');
    });
}

//? Submit Survey Logic
document.getElementById('btnCreateSurvey').addEventListener('click', function() {
    //* Collect survey details
    const surveyDetails = {
        title: document.getElementById('surveyTitle').value.trim(),
        description: document.getElementById('surveyDescription').value.trim(),
        programType: document.getElementById('programType').value,
        program: document.getElementById('program').value,
        cohort: document.getElementById('cohort').value,
        subject: document.getElementById('subject').value,
        surveyType: document.getElementById('surveyType').value,
        createdAt: getLocalDateTimeString(),
        expirationDate: formatExpirationDateToLocal(document.getElementById('expirationDate').value.trim()),
        email: document.getElementById('studentEmail').value.trim()
    };

    //? Collect all questions
    const questions = [];
    const questionForms = document.querySelectorAll('.QuestionContent');
    questionForms.forEach((form, index) => {
        const titleInput = form.querySelector('.questionTitleInput');
        const typeSelect = form.querySelector('.questionTypeSelect');
        const type = typeSelect.value;
        const question = {
            title: titleInput.value.trim(),
            type: type,
            options: [],
            correctAnswer: null
        };
        if (type === '1') { //* Multiple Choice
            //* Collect options
            const options = form.querySelectorAll('.optionInput input[type="text"]');
            options.forEach(opt => {
                question.options.push(opt.value.trim());
            });
            //* Find correct answer (index)
            const radios = form.querySelectorAll('.optionInput input[type="radio"]');
            radios.forEach((radio, i) => {
                if (radio.checked) question.correctAnswer = i;
            });
        } else if (type === '5') { //* True/False
            const tf = form.querySelector('.QuestionTrueFalse input[type="radio"]:checked');
            if (tf) question.correctAnswer = Number(tf.value) === 1 ? 1 : 0;
        }
        //* For other types, you can add more logic if needed
        questions.push(question);
    });

    //? Data object
    const surveyPayload = {
        details: surveyDetails,
        questions: questions
    };

    //? Send to backend
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyPayload)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error creating survey: ' + response.statusText);
        }
    })
    .then(data => {
        console.log('Survey created successfully:', data);
        showNotification('Survey created successfully!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    })
    .catch(error => {
        console.error(error);
        if(data.status === 'error') {showNotification('Error creating survey: ' + data.message, 'error');}
    });
});

//? get Program Types and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=getProgramTypes')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const select = document.getElementById('programType');
            data.data.forEach(programType => {
                const option = document.createElement('option');
                option.value = programType.program_type_id;
                option.textContent = programType.program_name;
                select.appendChild(option);

            });
        }
        else {console.error('Error fetching program types:', data.message);}
    });
});

//? get Programs and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=getPrograms')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const select = document.getElementById('program');
            data.data.forEach(program => {
                const option = document.createElement('option');
                option.value = program.prog_id;
                option.textContent = program.name;
                select.appendChild(option);

            });
        }
        else {console.error('Error fetching program types:', data.message);}
    });
});
        

//? get cohorts and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=getCohorts')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const select = document.getElementById('cohort');
            data.data.forEach(cohort => {
                const option = document.createElement('option');
                option.value = cohort.cohort_id;
                option.textContent = cohort.cohort;
                select.appendChild(option);

            });
        }
        else {console.error('Error fetching program types:', data.message);}
    });
});

//? get subjects and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=getSubjects')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const select = document.getElementById('subject');
            data.data.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.subject_id;
                option.textContent = subject.subject;
                select.appendChild(option);
            });
        }
        else {console.error('Error fetching subjects:', data.message);}
    });
});

//? get survey types and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=getSurveyTypes')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const select = document.getElementById('surveyType');
            data.data.forEach(surveyType => {
                const option = document.createElement('option');
                option.value = surveyType.survey_type_id;
                option.textContent = surveyType.type_name;
                select.appendChild(option);
            });
        }
        else {console.error('Error fetching program types:', data.message);}
    });
});

function populateSelect({ url, selectId, valueKey, textKey }) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const select = document.getElementById(selectId);
                select.innerHTML = ''; 
                data.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[valueKey];
                    option.textContent = item[textKey];
                    select.appendChild(option);
                });
            } else {
                console.error('Error fetching data:', data.message);
            }
        });
}

//? Add Program button to send data to the backend
document.getElementById('addProgram').addEventListener('click', function() {
    console.log('Add Program button clicked'); // Add this line
    const programName = document.getElementById('newProgram').value.trim();
    const programTypeId = document.getElementById('programType').value;
    if (!programTypeId) {
        showNotification('Please select a program type before adding a new program.', 'error');
        return;
    }
    if (!programName) {
        showNotification('Please enter a program name.', 'error');
        return;
    }
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=addProgram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programName, programTypeId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            populateSelect({
                url: '/SDGKU-Dashboard/src/models/createSurvey.php?action=getPrograms',
                selectId: 'program',
                valueKey: 'prog_id',
                textKey: 'name'
            });
        }
    });
});

//? Add Cohort button to send data to the backend
document.getElementById('addCohort').addEventListener('click', function() {
    const cohortName = document.getElementById('newCohort').value.trim();
    if (!cohortName) {
        showNotification('Please enter a cohort name.', 'error');
        return;
    }
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=addCohort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            populateSelect({
                url: '/SDGKU-Dashboard/src/models/createSurvey.php?action=getCohorts',
                selectId: 'cohort',
                valueKey: 'cohort_id',
                textKey: 'cohort'
            });
        }
    });
});

//? Add Subject button to send data to the backend
document.getElementById('addSubject').addEventListener('click', function() {
    const subjectName = document.getElementById('newSubject').value.trim();
    if (!subjectName) {
        showNotification('Please enter a subject name.', 'error');
        return;
    }
    fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=addSubject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            populateSelect({
                url: '/SDGKU-Dashboard/src/models/createSurvey.php?action=getSubjects',
                selectId: 'subject',
                valueKey: 'subject_id',
                textKey: 'subject'
            });
        }
    });
});