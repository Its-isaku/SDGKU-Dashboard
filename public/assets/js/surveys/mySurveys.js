const Surveys = [
    {
        title: "Pre-Course",
        status:"Active",
        description: "Introduction to Computer Science Pre-Course Assessment",
        notes: "Please complete this survey before the course",
        createdDate: "01/04/2025",
        expires: "4/23/2025",
        questions: 5,
        program: "Bootcamp",
        cohort: "Spring 2024",
    },
    {
        title: "Teacher-Eval",
        status:"Inactive",
        description: "Teacher-Evaluation - Programming Fundamentals", 
        notes: "Please evaluate your instructor for this course",
        createdDate: "03/23/2025",
        expires: "4/23/2025",
        questions: 3,
        program: "Bachelor",
        cohort: "Summer 2024",
        
    },
    {
        title: "Pre-Course",
        status:"Inactive",
        description: "Introduction to Computer Science Pre-Course Assessment",
        notes: "Please complete this survey before the course",
        createdDate: "01/04/2025",
        expires: "5/22/2025",
        questions: 3,
        program: "Bachelor",
        cohort: "Winter 2024",
    },
    {
        title: "Teacher-Eval",
        status:"Inactive",
        description: "Teacher-Evaluation - Programming Fundamentals",
        notes: "Please evaluate your instructor for this course",
        createdDate: "03/23/2025",
        expires: "4/23/2025",
        questions: 4,
        program: "Bootcamp",
        cohort: "Fall 2024",
        
    },{
        title: "Pre-Course",
        status:"Active",
        description: "Introduction to Computer Science Pre-Course Assessment",
        notes: "Please complete this survey before the course",
        createdDate: "01/04/2025",
        expires: "4/23/2025",
        questions: 5,
        program: "Bootcamp",
        cohort: "Spring 2024",
    },
    {
        title: "Teacher-Eval",
        status:"Active",
        description: "Teacher-Evaluation - Programming Fundamentals",
        notes: "Please evaluate your instructor for this course",
        createdDate: "03/23/2025",
        expires: "4/23/2025",
        questions: 3,
        program: "Bachelor",
        cohort: "Summer 2024",
        
    },
    {
        title: "Pre-Course",
        status:"Active",
        description: "Introduction to Computer Science Pre-Course Assessment",
        notes: "Please complete this survey before the course",
        createdDate: "01/04/2025",
        expires: "5/22/2025",
        questions: 3,
        program: "Bachelor",
        cohort: "Winter 2024",
    },
    // Mas encuestas...
];

function getActiveSurveys() {
    return Surveys.filter(survey => survey.status === "Active");
}

function getInactiveSurveys() {
    return Surveys.filter(survey => survey.status === "Inactive");
}

function renderInactiveSurveys() {
    const inactiveList = document.getElementById('inactiveListId');
    const inactiveSurveys = getInactiveSurveys();
    inactiveSurveys.forEach((survey,index) => {
        const surveyItem = document .createElement("div");
        surveyItem.className = "surveyInactive-item";
// visualizacion de cada encuesta
        surveyItem.innerHTML = ` 
            <div class = "inactiveTitleStatus"> 
                <div class = "surveytitle">
                    <p>${survey.title}</p>
                </div>
                <div class = "surveyInactiveStatus">
                    <p>${survey.status}</p>
                </div>
            </div>

            <h3>${survey.description}</h3>
            <p>${survey.notes}</p>
            <div class="survey-details">
                <span><i class="fa-solid fa-calendar-plus"></i> Created: ${survey.createdDate}</span>
                <span><i class="fa-solid fa-clock"></i> Expires: ${survey.expires}</span>
                <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} questions</span>
                <span>Program: ${survey.program}</span>
                <span>Cohort: ${survey.cohort}</span>
            </div>
            
            
            <div class="survey-actions">
                <button class="activate-btn" data-index="${index}"><i class="fa-solid fa-circle-check"></i> Activate</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        inactiveList.appendChild(surveyItem);
        //Enlazar el evento al boton de activar
        const activateBtn = surveyItem.querySelector('.activate-btn');
        activateBtn.addEventListener('click', () => {
            activateSurvey(survey);
        });
    });
}


function activateSurvey(surveyToActivate) {
    // cambiar el estado de la encuesta a activa
    surveyToActivate.status = "Active";
    //limpiar la lista de encuestas inactivas
    document.getElementById('inactiveListId').innerHTML = '';
    document.getElementById('activeListId').innerHTML = '';
    // volver a renderizar las encuestas inactivas y activas
    renderInactiveSurveys();
    renderActiveSurveys();
}


document.addEventListener("DOMContentLoaded", function() {
    // Render inicial
    renderInactiveSurveys();
    renderActiveSurveys();

    // Selección de botones y paneles
    const btnActive = document.getElementById('activeBtnId');
    const btnInactive = document.getElementById('inactiveBtnId');
    const panel1 = document.getElementById('panel1');
    const panel2 = document.getElementById('panel2');

    // Función para cambiar de pestaña
    function switchTab(isActive) {
        if (isActive) {
            btnActive.classList.add('selectedOption');
            btnInactive.classList.remove('selectedOption');
            panel1.classList.add('visible');
            panel2.classList.remove('visible');
            // Renderiza encuestas activas
            document.getElementById('activeListId').innerHTML = '';
            renderActiveSurveys();
        } else {
            btnInactive.classList.add('selectedOption');
            btnActive.classList.remove('selectedOption');
            panel2.classList.add('visible');
            panel1.classList.remove('visible');
            // Renderiza encuestas inactivas
            document.getElementById('inactiveListId').innerHTML = '';
            renderInactiveSurveys();
        }
    }

    // Listeners
    btnActive.addEventListener('click', function() {
        btnActive.classList.add('selectedOption');
        btnInactive.classList.remove('selectedOption');
        switchTab(true);
    });
    btnInactive.addEventListener('click', function() {
        switchTab(false);
    });

    // Estado inicial
    switchTab(true);
});

// Activate Surveys


function renderActiveSurveys() {
    const activeList = document.getElementById('activeListId');
    const activeSurveys = getActiveSurveys();
    activeSurveys.forEach((survey) => {
    const activeSurveyItem = document .createElement("div");
        activeSurveyItem.className = "survey-item";
    // visualizacion de cada encuesta
    activeSurveyItem.innerHTML = ` 
        <div class = "activeTitleStatus">
                <div class = "surveytitle">
                    <p>${survey.title}</p>
                </div>
                <div class = "surveyStatus">
                    <p>${survey.status}</p>
                </div>
                
            </div>
            <h3>${survey.description}</h3>
            <p>${survey.notes}</p>
            <div class="survey-details">
                <span><i class="fa-solid fa-calendar-plus"></i> Created: ${survey.createdDate}</span>
                <span><i class="fa-solid fa-clock"></i> Expires: ${survey.expires}</span>
                <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} questions</span>
                <span>Program: ${survey.program}</span>
                <span>Cohort: ${survey.cohort}</span>
            </div>
            
        <div class="surveyActive-actions">
            <div class="actions-container" onmouseleave="closeDropdown(this)">
                <button class = "actions-btn" onclick="toggleDropdown(this)" >Actions</button>
                <div class="dropdown">
                    <a href="#">Copy Access Link</a>
                    <a href="#">Edit Survey</a>
                    <a href="#">Duplicate</a>
                    <a href="#">Deactivate</a>
                    <a href="#" style="color: red;">Delete</a>
                </div>
            </div>
                <button class="results-btn">Results</button>
            </div>
        `;
        activeList.appendChild(activeSurveyItem);
    });
}

const sections = {
    activeBtnId: 'activeSectionId',
    inactiveBtnId: 'inactiveSectionId'
};


function handleSectionClick(clickedId) {
    hideAll('.activeSurveysId, .inactiveSurveysId');

    document.querySelectorAll('.surveyOption').forEach(opt => {
        opt.classList.remove('selectedOption');
    });

    const sectionId = sections[clickedId];
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'flex';

    const clickedBtn = document.getElementById(clickedId);
    if (clickedBtn) clickedBtn.classList.add('selectedOption');
}

function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    const isVisible = dropdown.style.display === 'flex';

    // Cierra todos los dropdowns
    document.querySelectorAll('.dropdown').forEach(menu => {
        menu.style.display = 'none';
    });

    if (!isVisible) {
        dropdown.style.display = 'flex';
    }
}

function closeDropdown(container) {
    const dropdown = container.querySelector('.dropdown');
    dropdown.style.display = 'none';
}
