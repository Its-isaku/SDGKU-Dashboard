//& lista de datos: variables: type, status, title, description, 
//? createdDate, expires, questions, program, cohort.
const Surveys = [];

//! <-------------------------------- GET --------------------------------> - Get surveys 

fetch('/SDGKU-Dashboard/src/models/mySurveys.php?action=getSurveys') //archivo PHP
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al obtener los datos");
        }
        return response.json();
    })
    .then(data => {
        //* Suponiendo que data es un array de objetos
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

        //* Renderizar encuestas
        renderInactiveSurveys();
        renderActiveSurveys();
    })
    .catch(error => {
        console.error("Hubo un problema al cargar las encuestas:", error);
    });

//! <----------------------- funciones para obtener las surveys correspondientes -----------------------> 

//? obtiene los surveys activos
function getActiveSurveys() {
    
    return Surveys.filter(survey => survey.status === "active");
}
//? obtiene los inactivos
function getInactiveSurveys() {
    return Surveys.filter(survey => survey.status === "inactive");
}

//! <----------------------- panel change logic -----------------------> 

document.addEventListener("DOMContentLoaded", function() {
    //? Render inicial
    
    renderInactiveSurveys();
    renderActiveSurveys();
    //? Selección de botones y paneles
    const btnActive = document.getElementById('activeBtnId');
    const btnInactive = document.getElementById('inactiveBtnId');
    const panel1 = document.getElementById('panel1');
    const panel2 = document.getElementById('panel2');
    
    //? Función para cambiar de pestaña
    function switchTab(isActive) {
        if (isActive) {
            btnActive.classList.add('selectedOption');
            btnInactive.classList.remove('selectedOption');
            panel1.classList.add('visible');
            panel2.classList.remove('visible');
            //? Renderiza encuestas activas
            document.getElementById('activeListId').innerHTML = '';
            renderActiveSurveys();
        } else {
            btnInactive.classList.add('selectedOption');
            btnActive.classList.remove('selectedOption');
            panel2.classList.add('visible');
            panel1.classList.remove('visible');
            //? Renderiza encuestas inactivas
            document.getElementById('inactiveListId').innerHTML = '';
            renderInactiveSurveys();
        }
    }

    //? Listeners
    btnActive.addEventListener('click', function() {
        btnActive.classList.add('selectedOption');
        btnInactive.classList.remove('selectedOption');
        switchTab(true);
    });
    btnInactive.addEventListener('click', function() {
        switchTab(false);
    });

    //? Estado inicial
    switchTab(true);

    //! <----------------------- DELETE Survey -----------------------> 

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openDeleteSurveyModal(id);
        }
    });

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const id = document.getElementById('delete-survey').value;
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
                const index = Surveys.findIndex(s => s.id == id);
                if (index !== -1) {
                    Surveys.splice(index, 1);
                }
                showNotification('Encuesta eliminada correctamente');
                document.getElementById('activeListId').innerHTML = '';
                renderActiveSurveys();
                closeAllModals();
            })
            .catch(error => {
                showNotification('Error al eliminar la encuesta: ' + (error.message || error), 'error');
                closeAllModals();
            });
        });
    }

    //! <----------------------- DUPLICATE Survey-----------------------> 
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('duplicate-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openDuplicateModal(id);
        }
    });

    if (confirmDuplicateBtn) {
    confirmDuplicateBtn.addEventListener('click', function() {
        const id = document.getElementById('duplicate-survey').value;
        fetch(`/SDGKU-Dashboard/src/models/mySurveys.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                action: 'duplicateSurvey',
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
            showNotification('Encuesta duplicada correctamente');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            closeAllModals();
        })
        .catch(error => {
            showNotification('Error al duplicar la encuesta: ' + (error.message || error), 'error');
            closeAllModals();
        });
    });
}

    //! <----------------------- DEACTIVATE Survey -----------------------> 

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('deactivate-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openDeactivateSurveyModal(id);
        }
    });

    if (confirmDeactivateBtn) {
        confirmDeactivateBtn.addEventListener('click', function() {
            const id = document.getElementById('deactivate-survey').value;
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
                const index = Surveys.findIndex(s => s.id == id);
                if (index !== -1) {
                    Surveys[index].status = 'inactive';
                }
                showNotification('Encuesta desactivada correctamente');
                document.getElementById('activeListId').innerHTML = '';
                renderActiveSurveys();
                closeAllModals();
            })
            .catch(error => {
                showNotification('Error al desactivar la encuesta: ' + (error.message || error), 'error');
                closeAllModals();
            });
        });
    }

    //! <----------------------- EDIT Survey -----------------------> 

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openEditSurveyModal(id);
        }
    });

    const confirmEditBtn = document.getElementById('confirm-edit'); 

    if (confirmEditBtn) {
        
        //* redirect to editSUrvey with SurveyId
    
    }

    //! <----------------------- ACTIVATE encuesta -----------------------> 

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('activate-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openActivateModal(id);
        }
    });

    if (confirmActivateBtn) {
        confirmActivateBtn.addEventListener('click', function() {
            const id = document.getElementById('activate-survey').value;
            fetch(`/SDGKU-Dashboard/src/models/mySurveys.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    action: 'activateSurvey',
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
                const index = Surveys.findIndex(s => s.id == id);
                if (index !== -1) {
                    Surveys[index].status = 'active';
                }
                showNotification('Encuesta activada correctamente');
                document.getElementById('inactiveListId').innerHTML = '';
                renderInactiveSurveys();
                closeAllModals();
            })
            .catch(error => {
                showNotification('Error al activar la encuesta: ' + (error.message || error), 'error');
                closeAllModals();
            });
        });
    }
    
});

//! <----------------------- Activate Surveys render -----------------------> 

function renderActiveSurveys() {
    
    const activeList = document.getElementById('activeListId');
    activeList.innerHTML = '';
    
    const activeSurveys = getActiveSurveys();
    activeSurveys.forEach((survey) => {
    console.log('activos');
    const activeSurveyItem = document.createElement("div");
        activeSurveyItem.className = "survey-item";

    //* visualizacion de cada encuesta
    activeSurveyItem.innerHTML = /* HTML */` 
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
                        <button class="dropdown-copyLink copy-link">Copy Access Link</button>
                        <button class="dropdown-action edit-survey" data-id="${survey.id}">Edit Survey</button>
                        <button class="dropdown-action duplicate-survey" data-id="${survey.id}">Duplicate</button>
                        <button class="dropdown-action deactivate-survey" data-id="${survey.id}">Deactivate</button>
                        <button class="dropdown-delete delete-survey" data-id="${survey.id}" style="color: red;">Delete</button>
                </div>
            </div>
                <button class="results-btn">Results</button>
            </div>
        `;
        activeList.appendChild(activeSurveyItem);
    });
}

//! <----------------------- render de inactivas -----------------------> 

function renderInactiveSurveys() {
    const inactiveList = document.getElementById('inactiveListId');
    const inactiveSurveys = getInactiveSurveys();
    inactiveSurveys.forEach((survey,index) => {
        const surveyItem = document .createElement("div");
        surveyItem.className = "surveyInactive-item";
        //* visualizacion de cada encuesta
        surveyItem.innerHTML =  /* HTML */` 
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
                <button class="activate-btn activate-survey" data-id="${survey.id}"><i class="fa-solid fa-circle-check"></i> Activate</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        inactiveList.appendChild(surveyItem);
        //* Enlazar el evento al boton de activar
    });
}

//! <----------------------- drop down logic ----------------------->

function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    const isVisible = dropdown.style.display === 'flex';

    //* Cierra todos los dropdowns
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

//! <----------------------- Notifications & Modals ----------------------->

//^ <|-----------notification Logic-----------|>
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

//^ <|-----------modal Logic-----------|>
//? elems
const deleteSurveyModal = document.getElementById('delete-survey-modal');
const deactivateSurveyModal = document.getElementById('deactivate-survey-modal');
const duplicateSurveyModal = document.getElementById('duplicate-survey-modal');
const editSurveyModal = document.getElementById('edit-survey-modal');
const activateSurveyModal = document.getElementById('activate-survey-modal');

//?modal elems for btns
const closeButtons = document.querySelectorAll('.close-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const confirmDeactivateBtn = document.getElementById('confirm-deactivate');
const confirmDuplicateBtn = document.getElementById('confirm-duplicate');
const confirmActivateBtn = document.getElementById('confirm-activate');

//? Add event listeners to open modals for delete actions in Manage Data section
const deleteSurveyBtn = document.getElementById('deleteSurveyBtn');
const deactivateSurveyBtn = document.getElementById('deactivateSurveyBtn');
const duplicateSurveyBtn = document.getElementById('duplicateSurveyBtn');
const editSurveyBtn = document.getElementById('editSurveyBtn');
const activateSurveyBtn = document.getElementById('activateSurveyBtn');

if (deleteSurveyBtn) {
    deleteSurveyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const surveyId = document.getElementById('delete-survey').value;
        if (surveyId) {openDeleteSurveyModal(surveyId);}
    });
}
if (deactivateSurveyBtn) {
    deactivateSurveyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const surveyId = document.getElementById('duplicate-survey').value;
        if (surveyId) { openDeactivateSurveyModal(surveyId);}
    });
}

if (duplicateSurveyBtn) {
    duplicateSurveyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const surveyId = document.getElementById('deactivate-survey').value;
        if (surveyId) { openDuplicateModal(surveyId);}
    });
}

if (editSurveyBtn) {
    editSurveyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const surveyId = document.getElementById('edit-survey').value;
        if (surveyId) { openEditSurveyModal(surveyId);}
    });
}

if (activateSurveyBtn) {
    editSurveyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const surveyId = document.getElementById('activate-survey').value;
        if (surveyId) { openActivateModal(surveyId);}
    });
}

//? open delete Survey modal
function openDeleteSurveyModal(surveyId) {
    document.getElementById('delete-survey').value = surveyId;
    deleteSurveyModal.style.display = 'flex';
}

//? open deactivate Survey modal
function openDeactivateSurveyModal(surveyId) {
    document.getElementById('deactivate-survey').value = surveyId;
    deactivateSurveyModal.style.display = 'flex';
}

//? open duplicate Survey modal
function openDuplicateModal(surveyId) {
    document.getElementById('duplicate-survey').value = surveyId;
    duplicateSurveyModal.style.display = 'flex';
}

//? open edit Survey modal
function openEditSurveyModal(surveyId) {
    document.getElementById('edit-survey').value = surveyId;
    editSurveyModal.style.display = 'flex';
}

//? open activate Survey modal
function openActivateModal(surveyId) {
    document.getElementById('activate-survey').value = surveyId;
    activateSurveyModal.style.display = 'flex';
}

//? close modals
function closeAllModals() {
    if (deleteSurveyModal) deleteSurveyModal.style.display = 'none';
    if (deactivateSurveyModal) deactivateSurveyModal.style.display = 'none';
    if (duplicateSurveyModal) duplicateSurveyModal.style.display = 'none';
    if (editSurveyModal) editSurveyModal.style.display = 'none';
    if (activateSurveyModal) activateSurveyModal.style.display = 'none';
}

//? close modals on close (X) buttons
closeButtons.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
});

//? close modals on cancel buttons
const cancelDeleteBtns = document.querySelectorAll('.btn-cancel');
cancelDeleteBtns.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
});

//? close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target === deleteSurveyModal || e.target === deactivateSurveyModal || e.target === duplicateSurveyModal || e.target === editSurveyModal || e.target === activateSurveyModal) {
        closeAllModals();
    }
});

//! <----------------------- Event delegation for survey action buttons ----------------------->

document.addEventListener('click', function(e) {
    //* Delete Survey modal
    if (e.target.classList.contains('delete-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const surveyId = e.target.getAttribute('data-id');
        openDeleteSurveyModal(surveyId);
    }
    //* Deactivate Survey modal
    if (e.target.classList.contains('deactivate-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const surveyId = e.target.getAttribute('data-id');
        openDeactivateSurveyModal(surveyId);
    }
    //* Duplicate Survey modal
    if (e.target.classList.contains('duplicate-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const surveyId = e.target.getAttribute('data-id');
        openDuplicateModal(surveyId);
    }
    //* Edit Survey modal
    if (e.target.classList.contains('edit-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const surveyId = e.target.getAttribute('data-id');
        openEditSurveyModal(surveyId);
    }
    //* Activate Survey modal
    if (e.target.classList.contains('activate-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const surveyId = e.target.getAttribute('data-id');
        openActivateModal(surveyId);
    }
});



