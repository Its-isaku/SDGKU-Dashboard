//? Imports and Initial Data
import { hideAll } from '../../js/auth/formUtils.js';
let questionCounter = 1;
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
    const subject = document.getElementById('subject').value;
    const expirationDate = document.getElementById('expirationDate').value.trim();

    if (!title || !description || !type || !programType || !program || !subject || !expirationDate) {
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


//? Question Form Logic
function createQuestionForm(id) {
    //* Create a new question form element
    const container = document.createElement('div');
    container.className = 'QuestionContent';
    container.id = `QuestionContent${id}`;

    // Generate a unique identifier for this question form
    const uniqueId = `q_${Date.now()}_${Math.floor(Math.random()*100000)}`;

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
                    <option value="2">Linkert Scale 1-5</option>
                    <option value="3">Linkert Scale 1-3</option>
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
                                <input type="radio" name="correctAnswer_${uniqueId}" class="correctAnswerRadio">
                            </label>
                        </div>
                        <input type="text" placeholder="Enter option" required>
                        <i class="fa-solid fa-trash"></i>   
                    </div>

                    <div class="QuestionInput optionInput">
                        <div class="CorrectAnswerContainer correctAnswer">
                            <label>
                                <input type="radio" name="correctAnswer_${uniqueId}" class="correctAnswerRadio">
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
                <label><input type="radio" name="gradeOption_${uniqueId}" value="1">Strongly Disagree</label>
                <label><input type="radio" name="gradeOption_${uniqueId}" value="2">Disagree</label>
                <label><input type="radio" name="gradeOption_${uniqueId}" value="3">Neutral</label>
                <label><input type="radio" name="gradeOption_${uniqueId}" value="4">Agree</label>
                <label><input type="radio" name="gradeOption_${uniqueId}" value="5">Strongly Agree</label>
            </div>
        </div>

        <!--* Likert scale 1-3 section -->
        <div class="QuestionGrade questionOptions" id="questionGradeSection3${id}" style="display: none;">
            <h4>Grade</h4>

            <div class="gradeContainer">
                <label><input type="radio" name="gradeOption_${uniqueId}" value="1">Disagree</label>
                <label><input type="radio" name="gradeOption_${uniqueId}" value="2">Neutral</label>
                <label><input type="radio" name="gradeOption_${uniqueId}" value="3">Agree</label>
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
                <label><input type="radio" name="trueFalse_${uniqueId}" value=1>True</label>
                <label><input type="radio" name="trueFalse_${uniqueId}" value=0>False</label>
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
                    <input type="radio" name="correctAnswer_${uniqueId}" class="correctAnswerRadio">
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
        updateQuestionNumbers()
        //! -------put id into delete array
        const questions_id=questions[id - 1].question_id
        questionToDelete.push({question_id: questions_id});
        console.log(questionToDelete);
        
    });
    return container;
}

function updateQuestionNumbers() {
    const questionForms = document.querySelectorAll('.QuestionContent');
    questionForms.forEach((form, idx) => {
        const title = form.querySelector('#questionNumberTitle');
        if (title) {
            title.textContent = `Question #${idx + 1}`;
        }
    });
}
//!---------Array to delete questions------
let questionToDelete = [];

//? Add initial question form on page load
document.getElementById('btnAddQuestion').addEventListener('click', () => {
    //* Add a new question form to the container
    const form = createQuestionForm(questionCounter);
    document.getElementById('questionFormsContainer').appendChild(form);
    updateQuestionNumbers();
});


//? Ensure at least one question form is loaded on page load
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
        //? Collect current questions into surveyData.questions (same as btnPreviewSurvey)
        const questionForms = document.querySelectorAll('.QuestionContent');
        surveyData.questions = [];
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
                //? Multiple Choice
                const options = form.querySelectorAll('.optionInput input[type="text"]');
                options.forEach(opt => {
                    if (opt.value.trim()) question.options.push(opt.value.trim());
                });
            }
            //? For other types, just push the question
            surveyData.questions.push(question);
        });
        updatePreview();
    });
}


//? Submit Survey Logic

const btnEditSurvey = document.getElementById('btnEditSurvey');
btnEditSurvey.addEventListener('click', function() {
    btnEditSurvey.disabled = true;
    //* Collect survey details
    console.log('Survey Data:',surveyData2.survey_id);
    const surveyDetails = {
        survey_id: surveyData2.survey_id, //? This should be set to the ID sent from the HTML 
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
            console.log(questionToDelete);
        }
    });

    //? Data object
    const surveyPayload = {
        details: surveyDetails,
        questions: questions
    };
    const id = surveyData2.survey_id;
// Validación del ID
if (!id || isNaN(id)) {
    showNotification('Invalid survey ID', 'error');
    return;
}

//!---------------Delete All Questions--------------

deleteAllQuestions(surveyPayload,id);
    console.log("deletea");
   

console.log("load: ",surveyPayload);
//!--------------- New Questions-------------------

//!---------------Delete Questions Selected-----------------
deleteSelectedQuestions();

});

function updateEdit(surveyPayload,id){
     fetch(`/SDGKU-Dashboard/src/models/submitEdit.php?action=SendEditSurvey&id=${id}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(surveyPayload)
})
.then(response => {
    if (!response.ok) {
        return response.json().then(err => { throw err; });
    }
    return response.json();
})
.then(data => {
    if (data.status === 'error') {
        throw new Error(data.message);
    }
    console.log('Survey updated successfully:', data);
    showNotification('Survey updated successfully!', 'success');
    setTimeout(() => {
        deleteSelectedQuestions();
        window.location.reload();
        window.location.href = `mySurveys.html`;
    }, 1500);
})
.catch(error => {
    console.error('Fetch error:', error);
    showNotification('Error updating survey: ' + error.message, 'error');
});
}


function deleteAllQuestions(surveyPayload,id){
    fetch(`/SDGKU-Dashboard/src/models/editSurvey.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ 
            action: 'deleteAllQuestions',
            id: id  
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();  
    })
    .then(data => {
        console.log('Respuesta:', data);
        questions_id = [];
        updateEdit(surveyPayload,id);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar la pregunta: ' + (error.message || error));

    });
}


function deleteSelectedQuestions(){
    if (questionToDelete.length > 0) {
    console.log("deletea");
    fetch(`/SDGKU-Dashboard/src/models/editSurvey.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ 
            action: 'deleteQuestion',
            questionsToDelete: questionToDelete  // Changed to array
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();  // Changed to json()
    })
    .then(data => {
        console.log('Respuesta:', data);
        // Handle question deletion in your UI
        // You might need to update your questions list here
        questionToDelete = [];
        
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar la pregunta: ' + (error.message || error));
    });
}
}



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


//? Add event listener to programType select to fetch programs for selected type
document.addEventListener('DOMContentLoaded', function() {
    const programTypeSelect = document.getElementById('programType');
    if (programTypeSelect) {
        programTypeSelect.addEventListener('change', function() {
            const programTypeId = this.value;
            const programSelect = document.getElementById('program');
            programSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
            if (!programTypeId) return;
            fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=getPrograms&program_type_id=' + programTypeId)
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


//? get subjects and send them to the frontend
const programSelect = document.getElementById('program');
if (programSelect) {
    programSelect.addEventListener('change', function() {
        const programId = this.value;
        const subjectSelect = document.getElementById('subject');
        subjectSelect.innerHTML = '<option value="" disabled selected hidden>Choose a Course</option>';
        if (!programId) return;
        fetch('/SDGKU-Dashboard/src/models/createSurvey.php?action=getSubjects&program_id=' + programId)
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

// Estructuras de datos
const surveyData2 = {
    survey_id : '',
    title : '',
    type : '',
    description : '',
    programType : '',
    program : '',
    subject : '',
    expirationDate : '',
    createdAt : ''
};
let questions = [
];

const questionsInfo = {
    Likert3: [],
    Likert5: [],
    multipleChoice: [],
    openEnded: [],
    trueFalse: []
};
//questions_id
let questions_id=[];

// reset Arrays
function resetSurveyData() {
    surveyData2.survey_id = '';
    surveyData2.title = '';
    surveyData2.type = '';
    surveyData2.description = '';
    surveyData2.programType = '';
    surveyData2.program = '';
    surveyData2.subject = '';
    surveyData2.expirationDate = '';
    surveyData2.createdAt = '';

    questions.question_id = '';
    questions.question_text = '';
    questions.question_type_id = '';
    questions.display_order = '';
    // ... resetear todas las propiedades

    
    questionsInfo.Likert3 = [];
    questionsInfo.Likert5 = [];
    // questions_id = [];
    // questions = [];
    // ... resetear todos los arrays de questionsInfo
}
let programType;
// Manejador de eventos
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');
    
    if (!surveyId) {
        console.error('No survey ID in URL');
        return;
    }
    fetchSurveyData(surveyId);


});




//!---------------------GetSurveyDataToEdit---------------------
async function fetchSurveyData(sid) {
    
    try {
        // resetSurveyData(); // Limpiar datos anteriores
        
        const id = sid; // Obtener el ID de la encuesta desde la URL
        // 1. Cargar datos básicos de la encuesta
        const surveyRes = await fetch(`/SDGKU-Dashboard/src/models/editSurvey.php?action=editSurvey&id=${encodeURIComponent(id)}`);
        if (!surveyRes.ok) throw await surveyRes.json();
        const surveyData = await surveyRes.json();
        surveyData2.survey_id = surveyData[0].survey_id;
        surveyData2.title = surveyData[0].title;
        surveyData2.type = surveyData[0].type;
        surveyData2.description = surveyData[0].description;
        surveyData2.programType = surveyData[0].program_name;
        surveyData2.program = surveyData[0].name;
        surveyData2.subject = surveyData[0].subject;
        surveyData2.expirationDate = surveyData[0].expires_at;
        surveyData2.createdAt = surveyData[0].created_At;

        // 2. Cargar preguntas y sus opciones (en paralelo)
        const [questionsRes, tfRes, openRes, multipleRes, linkert3, linkert5] = await Promise.all([
            fetch(`/SDGKU-Dashboard/src/models/editSurvey.php?action=questionsSurvey&id=${id}`),
            fetch(`/SDGKU-Dashboard/src/models/editSurvey.php?action=trueFalseQuestions&id=${id}`),
            fetch(`/SDGKU-Dashboard/src/models/editSurvey.php?action=openQuestions&id=${id}`),
            fetch(`/SDGKU-Dashboard/src/models/editSurvey.php?action=multipleQuestions&id=${id}`),
            fetch(`/SDGKU-Dashboard/src/models/editSurvey.php?action=likert3Questions&id=${id}`),
            fetch(`/SDGKU-Dashboard/src/models/editSurvey.php?action=likert5Questions&id=${id}`)
        ]);

        // Verificar respuestas
        if (!questionsRes.ok || !tfRes.ok || !openRes.ok || !multipleRes.ok|| !linkert3.ok || !linkert5.ok) {
            throw new Error('Error al cargar algunas partes de la encuesta');
        }

        // Procesar datos
        const questionsOb = await questionsRes.json();
        
        const tfData = await tfRes.json();
        const openData = await openRes.json();
        const multipleData = await multipleRes.json();
        const Likert1_3 = await linkert3.json();
        const Likert1_5 = await linkert5.json();

        // Mapear preguntas
        
        questionsOb.forEach(item => {
        questions.push({
            question_id: item.question_id,
            question_text: item.question_text,
            question_type_id: item.question_type_id,
            display_order: item.display_order
            });
        });
        questionsOb.forEach(item => {
        questions_id.push({
            question_id: item.question_id,
            });
        });

        // Mapear opciones por tipo
        questionsInfo.trueFalse = tfData.map(item => ({
            question_id: item.question_id,
            true_false_text: item.true_false_text,
            type: item.type,
            correct_answer: item.correct_answer,
        }));

        questionsInfo.openEnded = openData.map(item => ({
            open_id: item.open_id,
            question_id: item.question_id,
            open_option_text: item.open_option_text
        }));

        questionsInfo.multipleChoice = multipleData.map(item => ({
            question_id: item.question_id,
            option_text: item.option_text,
            display_order: item.display_order,
            correct_answer: item.correct_answer            
        }));

            questionsInfo.Likert3 = Likert1_3.map(item => ({
            question_id: item.question_id,
            question_text: item.question_text,
            question_type_id: item.question_type_id,
            display_order: item.display_order,
        }));

        questionsInfo.Likert5 = Likert1_5.map(item => ({
            question_id: item.question_id,
            question_text: item.question_text,
            question_type_id: item.question_type_id,
            display_order: item.display_order,
        }));

    } catch (error) {
        console.error('Error al cargar la encuesta:', error);
        alert(`Error al cargar la encuesta: ${error.message}`);
    }
}

// Add console logs to debug the data structures
console.log('surveyEditData:', surveyData2);
console.log('questions:', questions);
console.log('questionsInfo:', questionsInfo);
console.log("IDS: ", questions_id);


function editSurvey() {
    // Establecer título y descripción
    document.getElementById('surveyTitle').value = surveyData2.title;
    document.getElementById('surveyDescription').value = surveyData2.description;

    // Program Type
    
    let programTypeOption = document.getElementById('programType');
    let found = false;

    for (let option of programTypeOption.options) {
        if (option.text === surveyData2.programType || option.value === surveyData2.programType) {
        option.selected = true;
        found = true;
        break;
        }
    }

    if (!found) {
        // Si no se encuentra la opción, se crea una nueva
        let newOption = new Option(surveyData2.programType, surveyData2.programType, true, true);
        programTypeOption.add(newOption);
    }
    

    // Program
    let programOption = document.getElementById('program');
    let found2 = false;
    for (let option of programOption.options) {
        if (option.text === surveyData2.program || option.value === surveyData2.program) {
        option.selected = true;
        found2 = true;
        break;
        }
    }

    if (!found2) {
        // Si no se encuentra la opción, se crea una nueva
        let newOption = new Option(surveyData2.program, surveyData2.program, true, true);
        programOption.add(newOption);
    }

    // Course (Subject)
    let subjectOption = document.getElementById('subject');
    let found3 = false;
    for (let option of subjectOption.options) {
        if (option.text === surveyData2.subject || option.value === surveyData2.subject) {
        option.selected = true;
        found2 = true;
        break;
        }
    }

    if (!found3) {
        // Si no se encuentra la opción, se crea una nueva
        let newOption = new Option(surveyData2.subject, surveyData2.subject, true, true);
        subjectOption.add(newOption);
    }
    

    // Survey Type
    let surveyTypeOption = document.getElementById('surveyType');
    let found4 = false;
    for (let option of surveyTypeOption.options) {
        if (option.text === surveyData2.type || option.value === surveyData2.type) {
        option.selected = true;
        found2 = true;
        break;
        }
    }

    if (!found4) {
        // Si no se encuentra la opción, se crea una nueva
        let newOption = new Option(surveyData2.type, surveyData2.type, true, true);
        surveyTypeOption.add(newOption);
    }

    // Expiration Date
    // Asegúrate de que surveyData2.expirationDate esté en el formato correcto (YYYY-MM-DDTHH:MM)
    document.getElementById('expirationDate').value = surveyData2.expirationDate;
}


function editQuestions(basicQuestions) {
    
    const questionFormsContainer = document.getElementById('questionFormsContainer');
    questionFormsContainer.innerHTML = ``; //* Clear existing questions

    //? Loop through the basicQuestions array and create question forms
    basicQuestions.forEach((questions, index) => {
        //* Create a new question form
        const questionForm = createQuestionForm(index + 1);
        
        //* Set the question title
        const titleInput = questionForm.querySelector('.questionTitleInput');
        if (titleInput) titleInput.value = questions.question_text || '';

        //* Set the question type
        const typeSelect = questionForm.querySelector('.questionTypeSelect');
        if (typeSelect) {
            typeSelect.value = questions.question_type_id;
            typeSelect.dispatchEvent(new Event('change')); //* Trigger change event to show the correct section
        }
        
        //* Set the data for Multiple Choice questions
        if (questions.question_type_id == '1')  {
            console.log('datos:');
            //* Find options for this question
            const options = questionsInfo.multipleChoice.filter(opt => opt.question_id === questions.question_id);
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
        if(questions.question_type_id == '5') {
            const tf = questionsInfo.trueFalse.find(opt => opt.question_id === questions.question_id); //* Find the true/false question
            if (tf) {
                const radio = questionForm.querySelector(`input[name="trueFalse${index + 1}"][value="${tf.correct_answer}"]`); //* Find the radio button for the correct answer
                if (radio) radio.checked = true; //* Set the correct answer
            }
        }

        questionFormsContainer.appendChild(questionForm);
    });
}

window.openQuestions = [
    { open_id: 4, question_id: 4, open_option_text: "" }
];

window.addEventListener('load', function() {
    //* call the editSurvey function to set the initial values
    setTimeout(() => {
        editSurvey();
        editQuestions(questions);
    }, 500); // Pequeño retraso por si hay carga asíncrona editSurvey();


    // //* call the editQuestions function to set the initial values
    
});

console.log("log: ", questions_id);