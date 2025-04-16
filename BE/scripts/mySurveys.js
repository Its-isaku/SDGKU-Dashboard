const inactiveSurveys = [
    {
        title: "Introduction to Computer Science Pre-Course Assessment",
        description: "Please complete this survey before the course",
        createdDate: "Jan 04 2025",
        questions: 5,
    },
    {
        title: "Teacher-Evaluation - Programming Fundamentals",
        description: "Please evaluate your instructor for this course",
        createdDate: "Jan 04 2025",
        questions: 3,
    },
    // Mas encuestas...
];

function renderInactiveSurveys() {
    const inactiveList = document.getElementById("inactiveListId");
    inactiveSurveys.forEach((survey) => {
        const surveyItem = document .createElement("div");
        surveyItem.className = "survey-item";
// visualizacion de cada encuesta
        surveyItem.innerHTML = ` 
            <h3>${survey.title}</h3>
            <p>${survey.description}</p>
            <div class="survey-details">
                <span><i class="fa-solid fa-clipboard-list"></i> Created: ${survey.createdDate}</span>
                <span><i class="fa-solid fa-calendar-week"></i> ${survey.questions} questions</span>
            </div>
            
            <div class="survey-actions">
                <button class="activate-btn"><i class="fa-solid fa-circle-check"></i> Activate</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        inactiveList.appendChild(surveyItem);
    });
}

document.addEventListener("DOMContentLoaded", renderInactiveSurveys);
// Agregar eventos a los botones de activar y eliminar
