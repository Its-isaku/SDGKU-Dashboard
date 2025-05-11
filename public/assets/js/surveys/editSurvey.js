//? Imports and Initial Data
import { hideAll } from '../../js/auth/formUtils.js';
const surveyData = {
    details: {
        survey_id: '',
        title: '',
        description: '',
        type: '',
        programType: '',
        program: '',
        subject: '',
        expirationDate: '',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    },
    questions: [] 
};

const basicSurveyData = [];
const basicQuestions = [];
//! dont change
const sections = {
    optionSurveyDetails: 'surveyDetailsSection',
    optionQuestions: 'surveyQuestionsSection',
    optionPreview: 'surveyPreviewSection',
};

//! dont change
//? Validation for Survey Details
function validateSurveyDetails() {
    const title = document.getElementById('surveyTitle').value.trim();
    const description = document.getElementById('surveyDescription').value.trim();
    const type = document.getElementById('surveyType').value;
    const programType = document.getElementById('programType').value;
    const program = document.getElementById('program').value;
    const subject = document.getElementById('subject').value;
    const expirationDate = document.getElementById('expirationDate').value.trim();

    if (!title || !description || !type || !programType || !program || !subject || !expirationDate) {
        showNotification('Please fill in all required survey details before continuing.', 'error'); 
        return false;
    }
    return true;
}

//! dont change
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

//! dont change
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

//! dont change
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

//! dont change
//? Add click event for each navigation option
Object.keys(sections).forEach(buttonId => {
    //* Add click event for each navigation option
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => handleSectionClick(buttonId));
    }
});

//! dont change
//? navButton in createSuvery
navButton('btnContinueToQuestions', 'optionQuestions');
navButton('btnBackToDetails', 'optionSurveyDetails');
navButton('btnPreviewSurvey', 'optionPreview');
navButton('btnBackToQuestions', 'optionQuestions');

//! dont change
//? Set default section to display
handleSectionClick('optionSurveyDetails');

//! dont change
//? Survey Details Collection
document.getElementById('btnContinueToQuestions').addEventListener('click', () => {
    //* Collect survey details from form
    const title = document.getElementById('surveyTitle').value.trim();
    const description = document.getElementById('surveyDescription').value.trim();
    const type = document.getElementById('surveyType').value;
    const programType = document.getElementById('programType').value;
    const program = document.getElementById('program').value;
    const subject = document.getElementById('subject').value;
    const expirationDate = document.getElementById('expirationDate').value.trim();

    surveyData.details.title = title;
    surveyData.details.description = description;
    surveyData.details.type = type;
    surveyData.details.programType = programType;
    surveyData.details.program = program;
    surveyData.details.expirationDate = expirationDate; 
    surveyData.details.subject = subject;
});

//! dont change
//? Question Form Logic
let questionCounter = 1;



//^ <----------------Editar para popular el formulario con las preguntas de la encuesta----------------?
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

//! dont change
//? Add initial question form on page load
document.getElementById('btnAddQuestion').addEventListener('click', () => {
    //* Add a new question form to the container
    const form = createQuestionForm(questionCounter);
    document.getElementById('questionFormsContainer').appendChild(form);
    questionCounter++;
});

//! dont change
//? Ensure at least one question form is loaded on page load
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('questionFormsContainer');
    if (container && container.children.length === 0) {
        const form = createQuestionForm(questionCounter);
        container.appendChild(form);
        questionCounter++;
    }
});

//! dont change
//? Format Expiration Date
function formatExpirationDate(dateString) {
    if (!dateString) return '';
    //* Format: YYYY-MM-DDTHH:mm (from input type="datetime-local")
    const [date, time] = dateString.split('T');
    if (!date || !time) return dateString;
    return `${date} : ${time}`;
}

//! dont change
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

//! dont change
//? Helper to format expiration date from input type="datetime-local" to 'YYYY-MM-DD HH:mm:ss'
function formatExpirationDateToLocal(dateString) {
    if (!dateString) return '';
    const [date, time] = dateString.split('T');
    if (!date || !time) return dateString;
    const timeWithSeconds = time.length === 5 ? time + ':00' : time;
    return `${date} ${timeWithSeconds}`;
}

//! dont change
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

//! dont change
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
        const type = typeSelect.value;
        const question = {
            title: titleInput.value.trim(),
            type: type,
            options: []
        };
        if (type === '1') {
            //* Multiple Choice
            const options = form.querySelectorAll('.optionInput input[type="text"]');
            options.forEach(opt => {
                if (opt.value.trim()) question.options.push(opt.value.trim());
            });
        } else if (type === '2') {
            //* Likert 1-5
            //* No options needed, just type
        } else if (type === '3') {
            //* Likert 1-3
            //* No options needed, just type
        } else if (type === '4') {
            //* Open text
            //* No options needed, just type
        } else if (type === '5') {
            //* True/False
            //* No options needed, just type
        }
        surveyData.questions.push(question); //* Always push the question
    });
    updatePreview();
});

//! dont change
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
    });
}

//! dont change
//? Submit Survey Logic
document.getElementById('btnEditSurvey').addEventListener('click', function() {
    //* Collect survey details
    const surveyDetails = {
        survey_id: surveyData.details.survey_id, //? This should be set to the ID sent from the HTML 
        title: document.getElementById('surveyTitle').value.trim(),
        description: document.getElementById('surveyDescription').value.trim(),
        programType: document.getElementById('programType').value,
        program: document.getElementById('program').value,
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
            questions.push(question);
        } else if (type === '5') { //* True/False
            const tf = form.querySelector('.QuestionTrueFalse input[type="radio"]:checked');
            if (tf) question.correctAnswer = Number(tf.value) === 1 ? 1 : 0;
            questions.push(question);
        } else if (type === '2' || type === '3') { //* Likert
            questions.push(question);
        } else if (type === '4') { //* Open-ended
            //* Collect the open-ended placeholder/response (if any)
            const openTextarea = form.querySelector('.QuestionOpen textarea');
            if (openTextarea) {
                question.open_option_text = openTextarea.value.trim();
            } else {
                question.open_option_text = '';
            }
            questions.push(question);
        }
    });

    //? Data object
    const surveyPayload = {
        details: surveyDetails,
        questions: questions
    };

    //? Send to backend
    fetch('/SDGKU-Dashboard/src/models/editSurvey.php', {
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
        showNotification('Survey Update successfully!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    })
    .catch(error => {
        console.error(error);
        if(data.status === 'error') {showNotification('Error creating survey: ' + data.message, 'error');}
    });
});

//! dont change
//? get Program Types and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/editSurvey.php?action=getProgramTypes')
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

//! dont change
//? Add event listener to programType select to fetch programs for selected type
document.addEventListener('DOMContentLoaded', function() {
    const programTypeSelect = document.getElementById('programType');
    if (programTypeSelect) {
        programTypeSelect.addEventListener('change', function() {
            const programTypeId = this.value;
            const programSelect = document.getElementById('program');
            programSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
            if (!programTypeId) return;
            fetch('/SDGKU-Dashboard/src/models/editSurvey.php?action=getPrograms&program_type_id=' + programTypeId)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        if (data.data.length === 0) {
                            const option = document.createElement('option');
                            option.value = '';
                            option.textContent = 'No programs found';
                            option.disabled = true;
                            programSelect.appendChild(option);
                        } else {
                            data.data.forEach(program => {
                                const option = document.createElement('option');
                                option.value = program.prog_id;
                                option.textContent = program.name;
                                programSelect.appendChild(option);
                            });
                        }
                    } else {
                        console.error('Error fetching programs:', data.message);
                    }
                });
        });
    }
});

//! dont change
//? get subjects and send them to the frontend
const programSelect = document.getElementById('program');
if (programSelect) {
    programSelect.addEventListener('change', function() {
        const programId = this.value;
        const subjectSelect = document.getElementById('subject');
        subjectSelect.innerHTML = '<option value="" disabled selected hidden>Choose a Course</option>';
        if (!programId) return;
        fetch('/SDGKU-Dashboard/src/models/editSurvey.php?action=getSubjects&program_id=' + programId)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    if (data.data.length === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'No courses found';
                        option.disabled = true;
                        subjectSelect.appendChild(option);
                    } else {
                        data.data.forEach(subject => {
                            const option = document.createElement('option');
                            option.value = subject.subject_id;
                            option.textContent = subject.subject;
                            subjectSelect.appendChild(option);
                        });
                    }
                } else {
                    console.error('Error fetching courses:', data.message);
                }
            });
    });
}

//! dont change
//? get survey types and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/editSurvey.php?action=getSurveyTypes')
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

//! dont change
//? Add event listeners for programType, program, and subject selects (cleaned up)
document.addEventListener('DOMContentLoaded', function() {
    const programTypeSelect = document.getElementById('programType');
    const programSelect = document.getElementById('program');
    const subjectSelect = document.getElementById('subject');

    if (programTypeSelect && programSelect) {
        // * Show message if program is clicked before program type is selected
        programSelect.addEventListener('mousedown', function() {
            if (!programTypeSelect.value) {
                programSelect.innerHTML = `
                    <option value="" disabled selected hidden>Choose a program</option>
                    <option value="" disabled>Select program type first</option>
                `;
            }
        });
        // * Reset program select when program type changes
        programTypeSelect.addEventListener('change', function() {
            programSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
        });
    }

    if (programSelect && subjectSelect) {
        // * Show message if subject is clicked before program is selected
        subjectSelect.addEventListener('mousedown', function() {
            if (!programSelect.value) {
                subjectSelect.innerHTML = `
                    <option value="" disabled selected hidden>Choose a Course</option>
                    <option value="" disabled>Select program first</option>
                `;
            }
        });
        // * Reset subject select when program changes
        programSelect.addEventListener('change', function() {
            subjectSelect.innerHTML = '<option value="" disabled selected hidden>Choose a Course</option>';
        });
    }
});

    //! <----------------------- Editar encuesta -----------------------> 

document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('edit-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const id = e.target.getAttribute('data-id');
        
        if (confirm(`Are you sure you want to Edit this survey?`)) {
            try {
                const surveyResponse = await fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=editSurvey&id=${id}`);
                if (!surveyResponse.ok) throw await surveyResponse.json();
                const surveyData = await surveyResponse.json();
                
                basicSurveyData = surveyData.map(item => ({
                    survey_id: item.survey_id,
                    title: item.title,  
                    description: item.description,
                    type: item.survey_type_id,
                    programType: item.program_type_id,
                    program: item.program_id,
                    subject: item.subject_id,
                    expirationDate: item.expiration_date,
                    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
                }));
                
                const questionsResponse = await fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=questionsSurvey&id=${id}`);
                if (!questionsResponse.ok) throw await questionsResponse.json();
                const questionsData = await questionsResponse.json();
                
                editQuestions = questionsData.map(item => ({
                    question_id: item.question_id,
                    survey_id: item.survey_id,
                    question_text: item.question_text,
                    question_type_id: item.question_type_id,
                    display_order: item.display_order,
                }));
                
                const tfResponse = await fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=trueFalseQuestions&id=${id}`);
                if (!tfResponse.ok) throw await tfResponse.json();
                const tfData = await tfResponse.json();
                
                true_falseQuestions = tfData.map(item => ({
                    question_id: item.question_id,
                    true_false_text: item.true_false_text,
                    type: item.type,
                    correct_answer: item.correct_answer,
                }));
                
                const openResponse = await fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=openQuestions&id=${id}`);
                if (!openResponse.ok) throw await openResponse.json();
                const openData = await openResponse.json();
                
                openQuestions = openData.map(item => ({
                    open_id: item.question_id,
                    question_id: item.question_id,
                    open_option_text: item.open_option_text,
                }));
                
                const multipleResponse = await fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=multipleQuestions&id=${id}`);
                if (!multipleResponse.ok) throw await multipleResponse.json();
                const multipleData = await multipleResponse.json();
                
                multipleQuestions = multipleData.map(item => ({
                    question_id: item.id_question,
                    option_text: item.option_text,
                    display_order: item.display_order,
                    correct_answer: item.correct_answer,              
                }));
                
                loadEditForm();
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error al cargar los datos de la encuesta: ' + (error.message || JSON.stringify(error)));
            }
        }
    }
});

const surveyData2 = {
        survey_id: 'ExampleSurveyID',
        title: 'test Survey',
        description: 'Test Discription',
        type: 'Survey Type Editable',
        programType: 'TEMPORAl',
        program: 'test Program',
        subject: 'course editable',
        expirationDate: '2025-12-31T23:59',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
};


function editSurvey() {
    document.getElementById('surveyTitle').value = surveyData2.title;
    document.getElementById('surveyDescription').value = surveyData2.description;

    //* Program Type placeholder option
    let programTypeOption = document.getElementById('editProgramType');
    programTypeOption.value = surveyData2.programType;
    programTypeOption.textContent = surveyData2.programType;
    document.getElementById('programType').value = surveyData2.programType;

    //* Program placeholder option
    let programOption = document.getElementById('editProgram');
    programOption.value = surveyData2.program;
    programOption.textContent = surveyData2.program;
    document.getElementById('program').value = surveyData2.program;

    //* Course placeholder option
    let subjectOption = document.getElementById('editCourse');
    subjectOption.value = surveyData2.subject;
    subjectOption.textContent = surveyData2.subject;
    document.getElementById('subject').value = surveyData2.subject;

    //* Survey Type placeholder option
    let surveyTypeOption = document.getElementById('editSurveyType');
    surveyTypeOption.value = surveyData2.type;
    surveyTypeOption.textContent = surveyData2.type;
    document.getElementById('surveyType').value = surveyData2.type;

    //* Expiration Date
    document.getElementById('expirationDate').value = surveyData2.expirationDate;
}



function editQuestions(basicQuestions) {
    const questionFormsContainer = document.getElementById('questionFormsContainer');
    questionFormsContainer.innerHTML = ``; //* Clear existing questions

    //? Loop through the basicQuestions array and create question forms
    basicQuestions.forEach((question, index) => {
        //* Create a new question form
        const questionForm = createQuestionForm(index + 1);
        
        //* Set the question title
        const titleInput = questionForm.querySelector('.questionTitleInput');
        if (titleInput) titleInput.value = question.question_text || '';

        //* Set the question type
        const typeSelect = questionForm.querySelector('.questionTypeSelect');
        if (typeSelect) {
            typeSelect.value = question.question_type_id;
            typeSelect.dispatchEvent(new Event('change')); //* Trigger change event to show the correct section
        }
        
        //* Set the data for Multiple Choice questions
        if (question.question_type_id === '1')  {
            //* Find options for this question
            const options = multipleQuestions.filter(opt => opt.question_id === question.question_id);
            const optionsContainer = questionForm.querySelector(`#optionsContainer${index + 1}`);
            
            //* Remove default options
            optionsContainer.innerHTML = '';

            options.forEach((opt, i) => {
                const optDiv = document.createElement('div');
                optDiv.className = 'QuestionInput optionInput';
                optDiv.innerHTML = /* HTML */`
                    <div class="CorrectAnswerContainer correctAnswer">
                        <label>
                            <input type="radio" name="correctAnswer${index + 1}" class="correctAnswerRadio" ${opt.correct_answer ? 'checked' : ''}>
                        </label>
                    </div>
                    <input type="text" placeholder="Enter option" value="${opt.option_text}" required>
                    <i class="fa-solid fa-trash"></i>
                `;
                //* Add delete event
                optDiv.querySelector('i').addEventListener('click', () => optDiv.remove()); //* Remove option input on trash icon click
                optionsContainer.appendChild(optDiv);
            });
        }

        //* Set the data for True/False questions
        if(question.question_type_id === '5') {
            const tf = true_falseQuestions.find(opt => opt.question_id === question.question_id); //* Find the true/false question
            if (tf) {
                const radio = questionForm.querySelector(`input[name="trueFalse${index + 1}"][value="${tf.correct_answer}"]`); //* Find the radio button for the correct answer
                if (radio) radio.checked = true; //* Set the correct answer
            }
        }

        questionFormsContainer.appendChild(questionForm);
    });
}

const testQuestions = [
    // Multiple Choice
    {
        question_id: 1,
        question_text: "What is 2 + 2?",
        question_type_id: "1",
        display_order: 1
    },
    // Likert 1-5
    {
        question_id: 2,
        question_text: "How satisfied are you with our service?",
        question_type_id: "2",
        display_order: 2
    },
    // Likert 1-3
    {
        question_id: 3,
        question_text: "Was the course helpful?",
        question_type_id: "3",
        display_order: 3
    },
    // Open-ended
    {
        question_id: 4,
        question_text: "Any additional comments?",
        question_type_id: "4",
        display_order: 4,
    },
    // True/False
    {
        question_id: 5,
        question_text: "The sky is blue.",
        type: "1",
        correct_answer: 0,
        question_type_id: "5",
        display_order: 5
    }
];

window.multipleQuestions = [
    { question_id: 1, option_text: "3", display_order: 1, correct_answer: false },
    { question_id: 1, option_text: "4", display_order: 2, correct_answer: true },
    { question_id: 1, option_text: "5", display_order: 3, correct_answer: false }
];
window.true_falseQuestions = [
    { question_id: 5, question_text: "The sky is blue.", type: "1", correct_answer: 0 }
];

window.openQuestions = [
    { open_id: 4, question_id: 4, open_option_text: "" }
];

window.addEventListener('load', function() {
    //* call the editSurvey function to set the initial values
    editSurvey();

    // //* call the editQuestions function to set the initial values
    editQuestions(testQuestions);
});