import { hideAll } from '../../js/auth/formUtils.js';

const surveyData = {
    details: {
        title: '',
        description: '',
        type: ''
    },
    questions: []
};

const sections = {
    optionSurveyDetails: 'surveyDetailsSection',
    optionQuestions: 'surveyQuestionsSection',
    optionPreview: 'surveyPreviewSection',
};

function handleSectionClick(clickedId) {
    hideAll('.SurveyInfo, .SurveyQuestions, .SurveyPreview');

    document.querySelectorAll('.surveyOption').forEach(opt => {
        opt.classList.remove('selectedOption');
    });

    const sectionId = sections[clickedId];
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'flex';

    const clickedBtn = document.getElementById(clickedId);
    if (clickedBtn) clickedBtn.classList.add('selectedOption');
}

function navButton(buttonId, targetSectionKey) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => handleSectionClick(targetSectionKey));
    }
}

Object.keys(sections).forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => handleSectionClick(buttonId));
    }
});

// navButton in createSuvery
navButton('btnContinueToQuestions', 'optionQuestions');
navButton('btnBackToDetails', 'optionSurveyDetails');
navButton('btnPreviewSurvey', 'optionPreview');
navButton('btnBackToQuestions', 'optionQuestions');

handleSectionClick('optionSurveyDetails');

// Survey Details.
document.getElementById('btnContinueToQuestions').addEventListener('click', () => {
    const title = document.getElementById('surveyTitle').value.trim();
    const description = document.getElementById('surveyDescription').value.trim();
    const type = document.getElementById('surveyType').value;

    surveyData.details.title = title;
    surveyData.details.description = description;
    surveyData.details.type = type;
});


// Questions.
let questionCounter = 1;

function createQuestionForm(id) {
    const container = document.createElement('div');
    container.className = 'QuestionContent';
    container.id = `QuestionContent${id}`;

    container.innerHTML = `
        <div class="QuestionTitle">
            <h4 id="questionNumberTitle">Question #${id}</h4>

            <div class="QuestionInput">
                <label for="questionTitle${id}">Survey Title</label>
                <input type="text" id="questionTitle${id}" class="questionTitleInput" placeholder="Enter survey name" required>
            </div>

            <div class="QuestionInput selectInput">
                <label for="questionType${id}">Survey Type</label>
                <select id="questionType${id}" class="questionTypeSelect" required>
                    <option value="" disabled selected hidden>Select type</option>
                    <option value="1">Multiple Choice</option>
                    <option value="2">Grade 1-5</option>
                    <option value="3">Open</option>
                    <option value="4">True/False</option>
                </select>
            </div>
        </div>

        <div class="QuestionMultiple questionOptions" id="questionMultipleSection${id}" style="display: none;">
            <h4>Options</h4>
            <div id="optionsContainer${id}">
                <div class="QuestionInput optionInput">
                    <input type="text" placeholder="Enter option" required>
                    <i class="fa-solid fa-trash"></i>
                </div>
                <div class="QuestionInput optionInput">
                    <input type="text" placeholder="Enter option" required>
                    <i class="fa-solid fa-trash"></i>
                </div>
            </div>
            <button class="btnAddOption" data-id="${id}"><i class="fa-solid fa-plus"></i> add Option</button>
        </div>

        <div class="QuestionGrade questionOptions" id="questionGradeSection${id}" style="display: none;">
            <h4>Grade</h4>
            <div class="gradeContainer">
                <label><input type="radio" name="gradeOption${id}" value="1">1</label>
                <label><input type="radio" name="gradeOption${id}" value="2">2</label>
                <label><input type="radio" name="gradeOption${id}" value="3">3</label>
                <label><input type="radio" name="gradeOption${id}" value="4">4</label>
                <label><input type="radio" name="gradeOption${id}" value="5">5</label>
            </div>
        </div>

        <div class="QuestionOpen questionOptions" id="questionOpenSection${id}" style="display: none;">
            <h4>Open text</h4>
            <div class="OpenInput">
                <textarea placeholder="Type answer here" required></textarea>
            </div>
        </div>

        <div class="QuestionTrueFalse questionOptions" id="questionTrueFalseSection${id}" style="display: none;">
            <h4>Grade</h4>
            <div class="TrueFalseContainer">
                <label><input type="radio" name="trueFalse${id}" value="1">True</label>
                <label><input type="radio" name="trueFalse${id}" value="2">False</label>
            </div>
        </div>

        <button class="deleteQuestionBtn deleteBtn">Delete Question</button>
    `;

    const select = container.querySelector(`#questionType${id}`);
    select.addEventListener('change', () => {
        container.querySelectorAll('.questionOptions').forEach(el => el.style.display = 'none');
        const type = select.value;
        if (type === '1') container.querySelector(`#questionMultipleSection${id}`).style.display = 'block';
        if (type === '2') container.querySelector(`#questionGradeSection${id}`).style.display = 'block';
        if (type === '3') container.querySelector(`#questionOpenSection${id}`).style.display = 'block';
        if (type === '4') container.querySelector(`#questionTrueFalseSection${id}`).style.display = 'block';
    });

    const addOptionBtn = container.querySelector('.btnAddOption');
    addOptionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const optionsContainer = container.querySelector(`#optionsContainer${id}`);
        const opt = document.createElement('div');
        opt.className = 'QuestionInput optionInput';
        opt.innerHTML = `<input type="text" placeholder="Enter option" required> <i class="fa-solid fa-trash"></i>`;
        opt.querySelector('i').addEventListener('click', () => opt.remove());
        optionsContainer.appendChild(opt);
    });

    container.querySelectorAll('.optionInput i').forEach(icon => {
        icon.addEventListener('click', () => {
            icon.parentElement.remove();
        });
    });

    container.querySelector('.deleteQuestionBtn').addEventListener('click', () => {
        container.remove();
        if (questionCounter == 0){
            questionCounter = 1;
        }else{
            questionCounter-=1;
        }
            
    });

    return container;
}



document.getElementById('btnAddQuestion').addEventListener('click', () => {
    const form = createQuestionForm(questionCounter);
    document.getElementById('questionFormsContainer').appendChild(form);
    questionCounter++;
});

// Preview.
function updatePreview() {
    const container = document.getElementById('previewContainer');
    container.innerHTML = '';

    const titleEl = document.createElement('h3');
    titleEl.textContent = surveyData.details.title || 'Untitled Survey';
    container.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.textContent = surveyData.details.description || 'No description provided.';
    container.appendChild(descEl);

    surveyData.questions.forEach((q, idx) => {
        const qEl = document.createElement('div');
        qEl.className = 'previewQuestion';

        const qTitle = document.createElement('h4');
        qTitle.textContent = q.title;
        qEl.appendChild(qTitle);

        if (q.type === '1') {
            const optContainer = document.createElement('div');
            optContainer.className = 'previewMultipleOptions';
            q.options.forEach((opt, i) => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="radio" name="previewQ${idx}" value="${i}"> ${opt}`;
                optContainer.appendChild(label);
            });
            qEl.appendChild(optContainer);
        }

        if (q.type === '2') {
            const grade = document.createElement('div');
            grade.className = 'previewGrade';
            for (let i = 1; i <= 5; i++) {
                const label = document.createElement('label');
                label.innerHTML = `<input type="radio" name="previewQ${idx}" value="${i}"> ${i}`;
                grade.appendChild(label);
            }
            qEl.appendChild(grade);
        }

        if (q.type === '3') {
            const open = document.createElement('div');
            open.className = 'previewOpenText';
            open.innerHTML = `<textarea placeholder="Your response..."></textarea>`;
            qEl.appendChild(open);
        }

        if (q.type === '4') {
            const tf = document.createElement('div');
            tf.className = 'previewTrueFalse';
            tf.innerHTML = `
                <label><input type="radio" name="previewQ${idx}" value="true"> True</label>
                <label><input type="radio" name="previewQ${idx}" value="false"> False</label>
            `;
            qEl.appendChild(tf);
        }

        container.appendChild(qEl);
    });
}

document.getElementById('btnPreviewSurvey').addEventListener('click', () => {
    surveyData.questions = [];

    const questionForms = document.querySelectorAll('.QuestionContent');

    questionForms.forEach((form, index) => {
        const titleInput = form.querySelector('.questionTitleInput');
        const typeSelect = form.querySelector('.questionTypeSelect');

        const question = {
            id: index + 1,
            title: titleInput.value.trim(),
            type: typeSelect.value,
            options: []
        };

        if (question.type === '1') {
            const options = form.querySelectorAll(`#optionsContainer${question.id} input`);
            options.forEach(opt => {
                if (opt.value.trim()) question.options.push(opt.value.trim());
            });
        }

        surveyData.questions.push(question);
        console.log(JSON.stringify(surveyData, null, 2));

    });

    updatePreview();
});
