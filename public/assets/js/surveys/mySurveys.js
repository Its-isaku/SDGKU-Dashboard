//lista de datos: variables: type, status, title, description, 
// createdDate, expires, questions, program, cohort.
const Surveys = [];


//get de las surveys
// -------------------------------------------------------------------------------

fetch('/SDGKU-Dashboard/src/models/mySurveys.php?action=getSurveys') //archivo PHP
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al obtener los datos");
        }
        return response.json();
    })
    .then(data => {
        // Suponiendo que data es un array de objetos
        data.forEach(item => {
            Surveys.push({
                id: item.id,
                type: item.type,
                status: item.status,
                title: item.title,
                description: item.description,
                createdDate: item.createdDate,
                expires: item.expires,
                questions: parseInt(item.questions),
                program: item.program,
                cohort: item.cohort
            });
        });
        // Renderizar encuestas
        renderInactiveSurveys();
        renderActiveSurveys();
    })
    .catch(error => {
        console.error("Hubo un problema al cargar las encuestas:", error);
    });

//funciones para obtener las surveys correspondientes
// -------------------------------------------------------------------------------
//obtiene los surveys activos
function getActiveSurveys() {
    
    return Surveys.filter(survey => survey.status === "active");
}
//obtiene los inactivos
function getInactiveSurveys() {
    return Surveys.filter(survey => survey.status === "inactive");
}


//render de inactivas
// -------------------------------------------------------------------------------

function renderInactiveSurveys() {
    const inactiveList = document.getElementById('inactiveListId');
    const inactiveSurveys = getInactiveSurveys();
    inactiveSurveys.forEach((survey,index) => {
        const surveyItem = document .createElement("div");
        surveyItem.className = "surveyInactive-item";
// visualizacion de cada encuesta
        surveyItem.innerHTML = ` 
        <div class = "principalInformationInactives">    
            <div class = "inactiveTitleStatus"> 
                <div class = "surveytitle">
                    <p>${survey.type}</p>
                </div>
                <div class = "surveyInactiveStatus">
                    <p>${survey.status}</p>
                </div>
            </div>
            <h3>${survey.title}</h3>
            <p>${survey.description}</p>
        </div>
            
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
    surveyToActivate.status = "active";
    //limpiar la lista de encuestas inactivas
    document.getElementById('inactiveListId').innerHTML = '';
    document.getElementById('activeListId').innerHTML = '';
    // volver a renderizar las encuestas inactivas y activas
    renderInactiveSurveys();
    renderActiveSurveys();
}


//panel change logic
// -------------------------------------------------------------------------------

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


//El boton delete en dropdown
    // -------------------------------------------------------------------------------
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const id = e.target.getAttribute('data-id');
        
        if (confirm(`¿Estás seguro de eliminar esta encuesta?`)) {
            fetch(`/SDGKU-Dashboard/src/models/mySurveys.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    action: 'deleteSurvey',
                    id: id 
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.text();
            })
            .then(data => {
                console.log('Respuesta:', data);
                // Eliminar de la lista local
                const index = Surveys.findIndex(s => s.id == id);
                if (index !== -1) {
                    Surveys.splice(index, 1);
                }
                // Volver a renderizar
                document.getElementById('activeListId').innerHTML = '';
                renderActiveSurveys();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar la encuesta: ' + (error.message || error));
            });
        }
    }
});

//Desactivar encuesta
// -------------------------------------------------------------------------------
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('deactivate-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const id = e.target.getAttribute('data-id');
        
        if (confirm(`Are you sure you want to deactivate this survey?`)) {
            fetch(`/SDGKU-Dashboard/src/models/mySurveys.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    action: 'deactivateSurvey',
                    id: id 
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.text();
            })
            .then(data => {
                console.log('Respuesta:', data);
                // Eliminar de la lista local
                const index = Surveys.findIndex(s => s.id == id);
                if (index !== -1) {
                    Surveys.splice(index, 1);
                }
                // Volver a renderizar
                document.getElementById('activeListId').innerHTML = '';
                renderActiveSurveys();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar la encuesta: ' + (error.message || error));
            });
        }
    }
});
});

// Activate Surveys render
// -------------------------------------------------------------------------------

function renderActiveSurveys() {
    
    const activeList = document.getElementById('activeListId');
    activeList.innerHTML = '';
    
    const activeSurveys = getActiveSurveys();
    activeSurveys.forEach((survey) => {
    console.log('activos');
    const activeSurveyItem = document .createElement("div");
        activeSurveyItem.className = "survey-item";
    // visualizacion de cada encuesta
    activeSurveyItem.innerHTML = ` 
        <div class = "principalInformation">
            <div class = "activeTitleStatus">
                    <div class = "surveytitle">
                        <p>${survey.type}</p>
                    </div>
                    <div class = "surveyStatus">
                        <p>${survey.status}</p>
                    </div>
                    
                </div>
            <h3>${survey.title}</h3>
            <p>${survey.description}</p>
        </div>
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
                        <button class="dropdown-action">Copy Access Link</button>
                        <button class="dropdown-action">Edit Survey</button>
                        <button class="dropdown-action">Duplicate</button>
                        <button class="dropdown-action deactivate-survey" data-id="${survey.id}"">Deactivate</button>
                        <button class="dropdown-delete delete-survey" data-id="${survey.id}" style="color: red;">Delete</button>
                </div>
            </div>
                <button class="results-btn">Results</button>
            </div>
        `;
        activeList.appendChild(activeSurveyItem);
    });
}


//drop down logic
// -------------------------------------------------------------------------------
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


//search
// -------------------------------------------------------------------------------

// let allSurveys = [];

// async function fetchSurveys() {
//     try {
//         const response = await fetch('../../../src/models/mySurveys.php?action=getSurveys');
//         const data = await response.json();
//         allSurveys = data;
//         renderSurveys(data);
//     } catch (error) {
//         console.error('Error fetching surveys:', error);
//     }
// }

// function renderSurveys(surveys) {
//     const activeContainer = document.getElementById('activeListId');
//     const inactiveContainer = document.getElementById('inactiveListId');

//     activeContainer.innerHTML = '';
//     inactiveContainer.innerHTML = '';

//     if (surveys.length === 0) {
//         const msg = document.createElement('p');
//         msg.textContent = 'Sin resultados';
//         msg.style.padding = '2rem';
//         msg.style.fontSize = '1.2rem';
//         msg.style.gridColumn = '1 / -1';
//         activeContainer.appendChild(msg);
//         inactiveContainer.appendChild(msg.cloneNode(true));
//         return;
//     }

//     surveys.forEach(survey => {
//         const card = document.createElement('div');
//         card.className = survey.status === 'active' ? 'survey-item' : 'surveyInactive-item';

//         card.innerHTML = `
//             <div class="${survey.status === 'active' ? 'activeTitleStatus' : 'inactiveTitleStatus'}">
//                 <div class="surveytitle">
//                     <p>${survey.type}</p>
//                 </div>
//                 <div class="${survey.status === 'active' ? 'surveyStatus' : 'surveyInactiveStatus'}">
//                     <p>${survey.status}</p>
//                 </div>
//             </div>
//             <h3>${survey.title}</h3>
//             <p>${survey.description}</p>
//             <div class="survey-details">
//                 <span><i class="fa-solid fa-calendar-plus"></i> Created: ${survey.createdDate}</span>
//                 <span><i class="fa-solid fa-clock"></i> Expires: ${survey.expires}</span>
//                 <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} questions</span>
//                 <span><i class="fa-solid fa-layer-group"></i> Program: ${survey.program}</span>
//                 <span><i class="fa-solid fa-users"></i> Cohort: ${survey.cohort}</span>
//             </div>
//             <div class="${survey.status === 'active' ? 'surveyActive-actions' : 'survey-actions'}">
//                 ${
//                     survey.status === 'active' 
//                     ? `<div class="actions-container">
//                             <button class="actions-btn">Actions</button>
//                             <div class="dropdown">
//                                 <a href="#">Copy Access Link</a>
//                                 <a href="#">Edit Survey</a>
//                                 <a href="#">Duplicate</a>
//                                 <a href="#">Deactivate</a>
//                                 <a href="#" style="color: red;">Delete</a>
//                             </div>
//                         </div>
//                         <button class="results-btn">Results</button>`
//                     : `<button class="activate-btn">Activate</button><button class="delete-btn">Delete</button>`
//                 }
//             </div>
//         `;

//         if (survey.status === 'active') {
//             activeContainer.appendChild(card);
//         } else {
//             inactiveContainer.appendChild(card);
//         }
        
//     });

//     setupActionDropdowns();

// }

function setupSearchBar() {
    const searchInput = document.getElementById('searchSurveyId');
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const term = searchInput.value.trim().toLowerCase();

            if (term === '') {
                renderSurveys(allSurveys);
                return;
            }

            const filtered = allSurveys.filter(s =>
                s.title.toLowerCase().includes(term) || s.type.toLowerCase().includes(term)
            );

            renderSurveys(filtered);
        }
    });
}

// document.addEventListener('DOMContentLoaded', () => {
//     fetchSurveys();
//     setupSearchBar();
// });



// -------------------------------------------------------------------------------

function setupActionDropdowns() {
    document.querySelectorAll('.actions-btn').forEach(button => {
        const container = button.closest('.actions-container');
        const dropdown = container.querySelector('.dropdown');


        button.addEventListener('click', (e) => {
            e.stopPropagation();


            document.querySelectorAll('.dropdown').forEach(menu => {
                menu.style.display = 'none';
            });

            dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
        });
    });

}

