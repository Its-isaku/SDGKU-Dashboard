//! <----------------------- panel change logic -----------------------> 

document.addEventListener("DOMContentLoaded", function () {
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
    if (btnActive && btnInactive) {
        btnActive.addEventListener('click', function () {
            btnActive.classList.add('selectedOption');
            btnInactive.classList.remove('selectedOption');
            switchTab(true);
        });
        btnInactive.addEventListener('click', function () {
            switchTab(false);
        });
    }

    //? Estado inicial
    if (btnActive && btnInactive && panel1 && panel2) {
        switchTab(true);
    }

    //! <----------------------- DELETE Survey(Active) -----------------------> 

    document.addEventListener('click', function (e) {
        if (e.target.classList && e.target.classList.contains('delete-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            if (typeof openDeleteSurveyModal === 'function') {
                openDeleteSurveyModal(id);
            }
        }
    });

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            const id = document.getElementById('delete-survey').value;
            const activeList = document.getElementById('activeListId');
            const surveyItem = Array.from(activeList.getElementsByClassName('survey-item')).find(item => {
                return item.querySelector('.dropdown-delete.delete-survey[data-id="' + id + '"]');
            });
            if (surveyItem) {
                animateSurveyItemLeave(surveyItem, function () {
                    handleSurveyAction(
                        '/SDGKU-Dashboard/src/models/mySurveys.php',
                        { action: 'deleteSurvey', id: id },
                        () => {
                            showNotification('Survery deleted successfully!');
                            renderActiveSurveys();
                            closeAllModals();
                        },
                        (error) => {
                            showNotification('Error deleting the survey: ' + (error.message || error), 'error');
                            closeAllModals();
                        }
                    );
                });
            } else {
                handleSurveyAction(
                    '/SDGKU-Dashboard/src/models/mySurveys.php',
                    { action: 'deleteSurvey', id: id },
                    () => {
                        showNotification('Survey deleted successfully!');
                        renderActiveSurveys();
                        closeAllModals();
                    },
                    (error) => {
                        showNotification('Error deleting the survey: ' + (error.message || error), 'error');
                        closeAllModals();
                    }
                );
            }
        });
    }

    //! <----------------------- DUPLICATE Survey-----------------------> 
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('duplicate-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openDuplicateModal(id);
        }
    });

    if (confirmDuplicateBtn) {
        confirmDuplicateBtn.addEventListener('click', function () {
            const id = document.getElementById('duplicate-survey').value;
            handleSurveyAction(
                '/SDGKU-Dashboard/src/models/mySurveys.php',
                { action: 'duplicateSurvey', id: id },
                () => {
                    showNotification('Survey duplicated successfully!');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    closeAllModals();
                },
                (error) => {
                    showNotification('Error duplicating the survey: ' + (error.message || error), 'error');
                    closeAllModals();
                }
            );
        });

    }

    //! <----------------------- DEACTIVATE Survey -----------------------> 

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('deactivate-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openDeactivateSurveyModal(id);
        }
    });


    if (confirmDeactivateBtn) {
        confirmDeactivateBtn.addEventListener('click', function () {
            const id = document.getElementById('deactivate-survey').value;
            handleSurveyAction(
                '/SDGKU-Dashboard/src/models/mySurveys.php',
                { action: 'deactivateSurvey', id: id },
                () => {
                    showNotification('Survey deactivated successfully!');
                    renderActiveSurveys();
                    closeAllModals();
                },
                (error) => {
                    showNotification('Error deactivating the survey: ' + (error.message || error), 'error');
                    closeAllModals();
                }
            );
        });
    }

    //! <----------------------- EDIT Survey -----------------------> 

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openEditSurveyModal(id);
        }
    });

    const confirmEditBtn = document.getElementById('confirm-edit');

    if (confirmEditBtn) {
        confirmEditBtn.addEventListener('click', function () {
            const id = document.getElementById('edit-survey').value;
            if (id) {
                window.location.href = `editSurvey.html?id=${id}`;
            }
        });
    }

    //! <----------------------- ACTIVATE encuesta -----------------------> 

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('activate-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openActivateModal(id);
        }
    });

    const confirmActivateSurveyBtn = document.getElementById('confirm-activate-survey');
    const confirmAccessLinkBtn = document.getElementById('confirm-activate');

    if (confirmActivateSurveyBtn) {
        confirmActivateSurveyBtn.addEventListener('click', function () {
            const id = document.getElementById('activate-survey').value;
            handleSurveyAction(
                '/SDGKU-Dashboard/src/models/mySurveys.php',
                { action: 'activateSurvey', id: id },
                () => {
                    showNotification('Survey activated successfully!');
                    renderInactiveSurveys();
                    closeAllModals();
                },
                (error) => {
                    showNotification('Error activating the survey: ' + (error.message || error), 'error');
                    closeAllModals();
                }
            );
        });
    }


    //! <----------------------- COPY ACCESS LINK -----------------------> 

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('access-link-survey')) {
            e.preventDefault();
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            openActivateModal(id);
        }
    });

    //* Add a listener for the Copy button in the access link modal
    if (confirmAccessLinkBtn && accessLinkSurveyModal) {
        confirmAccessLinkBtn.addEventListener('click', function () {
            const linkInput = document.getElementById('access-link-input');
            const expirationInput = document.getElementById('expirationDate');

            if (!expirationInput.value) {
                showNotification('Please set an expiration date before copying the link', 'error');
                return;
            }

            if (linkInput) {
                linkInput.select();
                document.execCommand('copy');
                showNotification('Access link copied to clipboard');
                closeAllModals();
            }
        });
    }
});
//! <----------------------- SEARCH BAR -----------------------> 

const searchInput = document.getElementById('searchSurveyId');

//? Helper to check if a panel is visible
function isActiveTabVisible() {
    const panel1 = document.getElementById('panel1');
    return panel1 && panel1.classList.contains('visible');
}

//? Listener for search input
if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
        if (isActiveTabVisible()) {
            renderActiveSurveys(searchInput.value);
        } else {
            renderInactiveSurveys(searchInput.value);
        }
    }, 300));
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

//! <----------------------- Active Surveys render -----------------------> 

//* Animate survey item entering
function animateSurveyItemEnter(element) {
    element.classList.add('enter');
    void element.offsetWidth;
    element.classList.add('enter-active');
    element.addEventListener('transitionend', function handler() {
        element.classList.remove('enter', 'enter-active');
        element.removeEventListener('transitionend', handler);
    });
}

//* Animate survey item leaving
function animateSurveyItemLeave(element, callback) {
    element.classList.add('leave');
    void element.offsetWidth;
    element.classList.add('leave-active');
    element.addEventListener('transitionend', function handler() {
        element.removeEventListener('transitionend', handler);
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        if (typeof callback === 'function') callback();
    });
}

function renderActiveSurveys(searchTerm = '') {
    const activeList = document.getElementById('activeListId');
    //* Animate leave for all current items before clearing
    const currentItems = Array.from(activeList.getElementsByClassName('survey-item'));
    if (currentItems.length > 0) {
        let leftCount = 0;
        currentItems.forEach(item => {
            animateSurveyItemLeave(item, () => {
                leftCount++;
                if (leftCount === currentItems.length) {
                    //* After all have left, render new
                    renderActiveSurveysAfterLeave(searchTerm);
                }
            });
        });
        return; //* Wait for leave animations before rendering new
    }
    renderActiveSurveysAfterLeave(searchTerm);
}

function renderActiveSurveysAfterLeave(searchTerm = '') {
    const activeList = document.getElementById('activeListId');
    activeList.innerHTML = '';
    fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=getSurveys${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`)
        .then(response => response.json())
        .then(data => {
            const activeSurveys = data.filter(survey => survey.status === "active");
            activeSurveys.forEach((survey) => {
                const activeSurveyItem = document.createElement("div");
                activeSurveyItem.className = "survey-item";
                if (survey.responses > 0) {
                    activeSurveyItem.innerHTML = /* HTML */` 
                    <div class = "principalInformation">
                        <div class = "activeTitleStatus">
                                <div class = "surveytitle">
                                    <div class = "typeTitle">
                                        <p>${survey.type}</p>
                                    </div>
                                </div>
                                <div class = "surveyStatus">
                                    <p>${survey.status}</p>
                                </div>
                            </div>
                        <h3>${survey.title}</h3>
                        <p>${survey.description}</p>
                    </div>
                        <div class="survey-details">
                            <span><i class="fa-solid fa-calendar-check"></i> Created: ${survey.createdDate}</span>
                            <span><i class="fa-solid fa-pen-to-square"></i> Last Edited: ${survey.last_edit}</span>
                            <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} questions</span>
                            <span><i class="fa-solid fa-circle-question"></i> Program: ${survey.program}</span>
                        </div>
                    <div class="surveyActive-actions">
                        <div class="actions-container" onmouseleave="closeDropdown(this)">
                            <button class = "actions-btn" onclick="toggleDropdown(this)" >Actions</button>
                            <div class="dropdown  dropdown3">
                                    <button class="dropdown-copyLink copy-link" data-id="${survey.id}">Copy Access Link</button>
                                    <button class="dropdown-action duplicate-survey" data-id="${survey.id}">Duplicate</button>
                                    <button class="dropdown-action deactivate-survey" data-id="${survey.id}">Deactivate</button>
                            </div>
                        </div>
                        <button class="results-btn">Results</button>
                    </div>
                `;
                }
                else {
                    activeSurveyItem.innerHTML = /* HTML */` 
                    <div class = "principalInformation">
                        <div class = "activeTitleStatus">
                                <div class = "surveytitle">
                                    <div class = "editableTypeTitle">
                                        <p>${survey.type}</p>
                                    </div>
                                </div>
                                <div class = "surveyStatus">
                                    <p>${survey.status}</p>
                                </div>
                            </div>
                        <h3>${survey.title}</h3>
                        <p>${survey.description}</p>
                    </div>
                        <div class="survey-details">
                            <span><i class="fa-solid fa-calendar-check"></i> Created: ${survey.createdDate}</span>
                            <span><i class="fa-solid fa-pen-to-square"></i> Last Edited: ${survey.last_edit}</span>
                            <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} questions</span>
                            <span><i class="fa-solid fa-circle-question"></i> Program: ${survey.program}</span>
                        </div>
                    <div class="surveyActive-actions">
                        <div class="actions-container" onmouseleave="closeDropdown(this)">
                            <button class = "actions-btn" onclick="toggleDropdown(this)" >Actions</button>
                            <div class="dropdown">
                                    <button class="dropdown-copyLink copy-link" data-id="${survey.id}">Copy Access Link</button>
                                    <button class="dropdown-action edit-survey" data-id="${survey.id}">Edit Survey</button>
                                    <button class="dropdown-action duplicate-survey" data-id="${survey.id}">Duplicate</button>
                                    <button class="dropdown-action deactivate-survey" data-id="${survey.id}">Deactivate</button>
                                    <button class="dropdown-delete delete-survey" data-id="${survey.id}" style="color: red;">Delete</button>
                            </div>
                        </div>
                        <button class="results-btn">Results</button>
                    </div>
                `;
                }
                activeList.appendChild(activeSurveyItem);
                animateSurveyItemEnter(activeSurveyItem);
            });
        });
}

//! <----------------------- render de inactivas -----------------------> 

function renderInactiveSurveys(searchTerm = '') {
    const inactiveList = document.getElementById('inactiveListId');
    //* Animate leave for all current items before clearing
    const currentItems = Array.from(inactiveList.getElementsByClassName('surveyInactive-item'));
    if (currentItems.length > 0) {
        let leftCount = 0;
        currentItems.forEach(item => {
            //* Add leave classes for animation
            item.classList.add('survey-item'); //* Add survey-item class for animation
            animateSurveyItemLeave(item, () => {
                leftCount++;
                if (leftCount === currentItems.length) {
                    renderInactiveSurveysAfterLeave(searchTerm);
                }
            });
        });
        return;
    }
    renderInactiveSurveysAfterLeave(searchTerm);
}

function renderInactiveSurveysAfterLeave(searchTerm = '') {
    const inactiveList = document.getElementById('inactiveListId');
    inactiveList.innerHTML = '';
    fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=getSurveys${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`)
        .then(response => response.json())
        .then(data => {
            const inactiveSurveys = data.filter(survey => survey.status === "inactive");
            inactiveSurveys.forEach((survey, index) => {
                const surveyItem = document.createElement("div");
                surveyItem.className = "surveyInactive-item survey-item"; // Add both classes for animation
                if (survey.responses > 0) {
                    surveyItem.innerHTML =  /* HTML */` 
                <div class = "principalInformationInactives">    
                    <div class = "inactiveTitleStatus"> 
                        <div class = "surveytitle">
                            <div class = "typeTitle">
                                <p>${survey.type}</p>
                            </div>
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
                        <span><i class="fa-solid fa-calendar-plus"></i> Last Edit: ${survey.last_edit}</span>
                        <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} questions</span>
                        <span>Program: ${survey.program}</span>
                    </div>
                    <div class="survey-actions">
                        <button class="activate-btn activate-survey" data-id="${survey.id}"><i class="fa-solid fa-circle-check"></i> Activate</button>
                        <button class="delete-btn delete-inactive-survey" data-id="${survey.id}">Delete</button>
                    </div>
                `;
                } else {
                    surveyItem.innerHTML = ` 
                <div class = "principalInformationInactives">    
                    <div class = "inactiveTitleStatus"> 
                        <div class = "surveytitle">
                            <div class = "editableTypeTitle">
                                <p>${survey.type}</p>
                            </div>
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
                        <span><i class="fa-solid fa-calendar-plus"></i> Last Edit: ${survey.last_edit}</span>
                        <span><i class="fa-solid fa-clipboard-list"></i> ${survey.questions} questions</span>
                        <span>Program: ${survey.program}</span>
                    </div>
                    <div class="survey-actions">
                        <button class="activate-btn activate-survey" data-id="${survey.id}"><i class="fa-solid fa-circle-check"></i> Activate</button>
                        <button class="delete-btn delete-inactive-survey" data-id="${survey.id}">Delete</button>
                    </div>
                `;
                }
                inactiveList.appendChild(surveyItem);
                animateSurveyItemEnter(surveyItem);
            });
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
//?-------------------------DropDown no Editable--------------------------

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
const accessLinkSurveyModal = document.getElementById('access-link-survey-modal');
const deleteInactiveSurveyModal = document.getElementById('delete-inactive-survey-modal');

//?modal elems for btns
const closeButtons = document.querySelectorAll('.close-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const confirmDeactivateBtn = document.getElementById('confirm-deactivate');
const confirmDuplicateBtn = document.getElementById('confirm-duplicate');
const confirmActivateSurveyBtn = document.getElementById('confirm-activate-survey');
const confirmActivateBtn = document.getElementById('confirm-activate');
const confirmDeleteInactiveBtn = document.getElementById('confirm-delete-inactive');

//? Add event listeners to open modals for delete actions in Manage Data section
const deleteSurveyBtn = document.getElementById('deleteSurveyBtn');
const deactivateSurveyBtn = document.getElementById('deactivateSurveyBtn');
const activateSurveyBtn = document.getElementById('activateSurveyBtn');
const duplicateSurveyBtn = document.getElementById('duplicateSurveyBtn');
const editSurveyBtn = document.getElementById('editSurveyBtn');

if (deleteSurveyBtn) {
    deleteSurveyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const surveyId = document.getElementById('delete-survey').value;
        if (surveyId) { openDeleteSurveyModal(surveyId); }
    });
}
if (deactivateSurveyBtn) {
    deactivateSurveyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const surveyId = document.getElementById('duplicate-survey').value;
        if (surveyId) { openDeactivateSurveyModal(surveyId); }
    });
}
if (activateSurveyBtn) {
    activateSurveyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const surveyId = document.getElementById('active-survey').value;
        if (surveyId) { openActivateModal(surveyId); }
    });
}

if (duplicateSurveyBtn) {
    duplicateSurveyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const surveyId = document.getElementById('deactivate-survey').value;
        if (surveyId) { openDuplicateModal(surveyId); }
    });
}

if (editSurveyBtn) {
    editSurveyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const surveyId = document.getElementById('edit-survey').value;
        if (surveyId) { openEditSurveyModal(surveyId); }
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



//? open access link Survey modal
function openAccessLinkModal(surveyId) {
    fetch(`/SDGKU-Dashboard/src/models/mySurveys.php?action=getSurveyById&id=${surveyId}`)
        .then(response => response.json())
        .then(data => {
            const linkInput = document.getElementById('access-link-input');
            const expirationInput = document.getElementById('expirationDate');
            const copyBtn = document.getElementById('confirm-activate');
            const generateBtn = document.getElementById('confirm-newData');

            const hasValidToken = data.token && data.expires_at;

            if (linkInput) {
                linkInput.value = hasValidToken
                    ? `https://citecuvp.tij.uabc.mx/SDGKU-Dashboard/public/views/surveys/survey.html?token=${data.token}`
                    : '';
            }

            if (copyBtn) {
                copyBtn.disabled = !hasValidToken;
            }

            if (expirationInput) {
                if (data.expires_at) {
                    const expiresAt = new Date(data.expires_at);
                    if (!isNaN(expiresAt.getTime())) {
                        const formattedDate = expiresAt.toISOString().slice(0, 16);
                        expirationInput.value = formattedDate;
                        document.getElementById('expire-date-label').textContent = expiresAt.toLocaleString();
                        expirationInput.dataset.original = formattedDate;
                    }
                } else {
                    expirationInput.value = '';
                    document.getElementById('expire-date-label').textContent = 'Put expiration date to get a link';
                    expirationInput.dataset.original = '';
                }
            }

            document.getElementById('access-link-survey').value = surveyId;
            accessLinkSurveyModal.style.display = 'flex';

            const newGenerateBtn = generateBtn.cloneNode(true);
            generateBtn.parentNode.replaceChild(newGenerateBtn, generateBtn);
            newGenerateBtn.disabled = true;

            expirationInput.dataset.original = expirationInput.value;

            expirationInput.addEventListener('input', () => {
                newGenerateBtn.disabled = expirationInput.value === expirationInput.dataset.original;
            });

            newGenerateBtn.addEventListener('click', () => {
                if (expirationInput.value === expirationInput.dataset.original) {
                    showNotification('You need to modify the expiration date before generating a new link', 'error');
                    return;
                }

                const token = (linkInput.value.split('token=')[1] || '');
                const expiresAt = expirationInput.value;

                fetch('/SDGKU-Dashboard/src/models/mySurveys.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'updateTokenData',
                        id: surveyId,
                        token: token,
                        expires_at: expiresAt
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (!data.token) {
                            linkInput.value = '';
                            copyBtn.disabled = true;
                            document.getElementById('expire-date-label').textContent = 'Put expiration date to get a link';
                            expirationInput.value = '';
                            expirationInput.dataset.original = '';
                            showNotification('Link and date deleted!');
                        } else {
                            showNotification('Expiration date and token saved successfully!');
                            expirationInput.dataset.original = expirationInput.value;
                            const newAccessLink = `https://citecuvp.tij.uabc.mx/SDGKU-Dashboard/public/views/surveys/survey.html?token=${data.token}`;
                            linkInput.value = newAccessLink;
                            document.getElementById('access-link-survey').value = data.id;
                            document.getElementById('expire-date-label').textContent = new Date(expirationInput.value).toLocaleString();
                            copyBtn.disabled = false;
                        }
                        newGenerateBtn.disabled = true;
                    })
                    .catch(err => {
                        showNotification('Error saving token: ' + err.message, 'error');
                    });
            });

            copyBtn.addEventListener('click', () => {
                if (copyBtn.disabled) {
                    showNotification('You must generate a new link before copying it', 'error');
                    return;
                }

                linkInput.select();
                document.execCommand('copy');
                showNotification('Link copied!', 'success');
            });
        })
        .catch(error => {
            showNotification('Error fetching survey link: ' + (error.message || error), 'error');
        });
}


//? open delete Inactive Survey modal
function openDeleteInactiveSurveyModal(surveyId) {
    document.getElementById('delete-inactive-survey').value = surveyId;
    if (deleteInactiveSurveyModal) deleteInactiveSurveyModal.style.display = 'flex';
}

//? close modals
function closeAllModals() {
    if (deleteSurveyModal) deleteSurveyModal.style.display = 'none';
    if (deactivateSurveyModal) deactivateSurveyModal.style.display = 'none';
    if (duplicateSurveyModal) duplicateSurveyModal.style.display = 'none';
    if (editSurveyModal) editSurveyModal.style.display = 'none';
    if (activateSurveyModal) activateSurveyModal.style.display = 'none';
    if (accessLinkSurveyModal) accessLinkSurveyModal.style.display = 'none';
    if (deleteInactiveSurveyModal) deleteInactiveSurveyModal.style.display = 'none';
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
    if (e.target === deleteSurveyModal || e.target === deactivateSurveyModal || e.target === duplicateSurveyModal || e.target === editSurveyModal || e.target === activateSurveyModal || e.target === accessLinkSurveyModal || e.target === deleteInactiveSurveyModal) {
        closeAllModals();
    }
});

//! <----------------------- Event delegation for survey action buttons ----------------------->

document.addEventListener('click', function (e) {
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
    //* Copy Access Link modal
    if (e.target.classList.contains('copy-link')) {
        e.preventDefault();
        e.stopPropagation();
        const surveyId = e.target.getAttribute('data-id');
        if (surveyId) {
            openAccessLinkModal(surveyId);
        }
    }
    //* Delete Inactive Survey
    if (e.target.classList.contains('delete-inactive-survey')) {
        e.preventDefault();
        e.stopPropagation();
        const surveyId = e.target.getAttribute('data-id');
        openDeleteInactiveSurveyModal(surveyId);
    }
});

//* Delete Inactive Survey
if (confirmDeleteInactiveBtn) {
    confirmDeleteInactiveBtn.addEventListener('click', function () {
        const surveyId = document.getElementById('delete-inactive-survey').value;
        handleSurveyAction(
            '/SDGKU-Dashboard/src/models/mySurveys.php',
            { action: 'deleteSurvey', id: surveyId },
            () => {
                showNotification('Survey deleted successfully'); cera
                renderInactiveSurveys();
                closeAllModals();
            },
            (error) => {
                showNotification('Error deleting the Survey: ' + (error.message || error), 'error');
                closeAllModals();
            }
        );
    });
}

//* Improved POST fetch handler for actions (delete, activate, deactivate, etc.)
function handleSurveyAction(url, body, onSuccess, onError) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(async response => {
            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
                throw new Error(data);
            }
            if (!response.ok) {
                throw new Error(data.message || 'Error en la acción');
            }
            onSuccess(data);
        })
        .catch(error => {
            onError(error);
        });
}