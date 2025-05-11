//! <|--------------------------NAV--------------------------|>

//? Sections
const sections = {
    security: 'securitySection',
    manageData: 'manageDataSection',
};

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

//? Helper to hide all tab-content sections
function hideAll() {
    Object.values(sections).forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
    });
}

//? Section Navigation Logic
function handleSectionClick(clickedId) {
    //* Hide all main survey sections
    hideAll(); 

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

document.addEventListener('DOMContentLoaded', function() {
    //* Hide all sections, then show only Security by default
    hideAll();
    document.getElementById('securitySection').style.display = 'flex';
    //* Set selected style on the Security button
    document.querySelectorAll('.surveyOption').forEach(opt => {
        opt.classList.remove('selectedOption');
    });
    const securityBtn = document.getElementById('security');
    if (securityBtn) securityBtn.classList.add('selectedOption');
});

//! <|--------------------------ADD--------------------------|>

//? get Program Types and send them to the frontend
(function() {
    let programTypePopulated = false;
    document.addEventListener('DOMContentLoaded', function() {
        if (programTypePopulated) return;
        programTypePopulated = true;
        const select = document.getElementById('programType');
        if (!select) {
            console.error('programType select not found');
            return;
        }
        //* Clear options before populating to avoid duplicates
        select.innerHTML = '<option value="" disabled selected hidden>Choose a program type</option>';
        fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getProgramTypes')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    //* Use a Set to avoid duplicate program type names
                    const seenNames = new Set();
                    data.data.forEach(programType => {
                        if (!seenNames.has(programType.program_name)) {
                            seenNames.add(programType.program_name);
                            const option = document.createElement('option');
                            option.value = programType.program_type_id;
                            option.textContent = programType.program_name;
                            select.appendChild(option);
                        }
                    });
                } else {
                    console.error('Error fetching program types:', data.message);
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
            });
    });
})();

//? Add event listeners for programType, program, and subject selects (cleaned up)
document.addEventListener('DOMContentLoaded', function() {
    const programTypeSelect = document.getElementById('programType');
    const programSelect = document.getElementById('program');
    const subjectSelect = document.getElementById('subject');

    if (programTypeSelect && programSelect) {
        //* Show message if program is clicked before program type is selected
        programSelect.addEventListener('mousedown', function() {
            if (!programTypeSelect.value) {
                programSelect.innerHTML = `
                    <option value="" disabled selected hidden>Choose a program</option>
                    <option value="" disabled>Select program type first</option>
                `;
            }
        });
        // *Reset program select when program type changes
        programTypeSelect.addEventListener('change', function() {
            programSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
        });
    }

    if (programSelect && subjectSelect) {
        //* Show message if subject is clicked before program is selected
        subjectSelect.addEventListener('mousedown', function() {
            if (!programSelect.value) {
                subjectSelect.innerHTML = `
                    <option value="" disabled selected hidden>Choose a Course</option>
                    <option value="" disabled>Select program first</option>
                `;
            }
        });
        //* Reset subject select when program changes
        programSelect.addEventListener('change', function() {
            subjectSelect.innerHTML = '<option value="" disabled selected hidden>Choose a Course</option>';
        });
    }
});

//? Add event listener to programType select to fetch programs for selected type
document.addEventListener('DOMContentLoaded', function() {
    const programTypeSelect = document.getElementById('programType');
    if (programTypeSelect) {
        programTypeSelect.addEventListener('change', function() {
            const programTypeId = this.value;
            const programSelect = document.getElementById('program');
            if (!programSelect) return;
            programSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
            if (!programTypeId) return;
            fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getPrograms&program_type_id=' + programTypeId)
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

//? Add Program
const addProgramBtn = document.getElementById('addProgram');
if (addProgramBtn) {
    addProgramBtn.addEventListener('click', function() {
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
        fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=addProgram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ programName, programTypeId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Program added successfully!', 'success');
                //* Refresh the program list
                fetch(`/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getPrograms&program_type_id=${programTypeId}`)
                    .then(res => res.json())
                    .then(data => {
                        const programSelect = document.getElementById('program');
                        if (!programSelect) return;
                        programSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
                        if (data.status === 'success') {
                            data.data.forEach(program => {
                                const option = document.createElement('option');
                                option.value = program.prog_id;
                                option.textContent = program.name;
                                programSelect.appendChild(option);
                            });
                        }
                    });
            } else {
                showNotification('Error adding program: ' + data.message, 'error');
            }
        });
    });
}

//? Add Cohort
const addCohortBtn = document.getElementById('addCohort');
if (addCohortBtn) {
    addCohortBtn.addEventListener('click', function() {
        const cohortName = document.getElementById('newCohort').value.trim();
        const programId = document.getElementById('program').value;
        if (!programId) {
            showNotification('Please select a program before adding a cohort.', 'error');
            return;
        }
        if (!cohortName) {
            showNotification('Please enter a cohort name.', 'error');
            return;
        }
        fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=addCohort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cohortName, programId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Cohort added successfully!', 'success');
                //* Refresh the cohort list
                fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getCohorts')
                    .then(res => res.json())
                    .then(data => {
                        const cohortSelect = document.getElementById('cohort');
                        if (!cohortSelect) return;
                        cohortSelect.innerHTML = '<option value="" disabled selected hidden>Choose a Cohort</option>';
                        if (data.status === 'success') {
                            data.data.forEach(cohort => {
                                const option = document.createElement('option');
                                option.value = cohort.cohort_id;
                                option.textContent = cohort.cohort;
                                cohortSelect.appendChild(option);
                            });
                        }
                    });
            } else {
                showNotification('Error adding cohort: ' + data.message, 'error');
            }
        });
    });
}

//? Add Course
const addCourseBtn = document.getElementById('addCourse');
if (addCourseBtn) {
    addCourseBtn.addEventListener('click', function() {
        const courseName = document.getElementById('newCourse').value.trim();
        const programId = document.getElementById('program').value;
        if (!programId) {
            showNotification('Please select a program before adding a course.', 'error');
            return;
        }
        if (!courseName) {
            showNotification('Please enter a course name.', 'error');
            return;
        }
        fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=addSubject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjectName: courseName, programId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Course added successfully!', 'success');
                //* Optionally refresh the course list here
                fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getSubjects')
                    .then(res => res.json())
                    .then(data => {
                        const subjectSelect = document.getElementById('subject');
                        if (!subjectSelect) return;
                        subjectSelect.innerHTML = '<option value="" disabled selected hidden>Choose a Course</option>';
                        if (data.status === 'success') {
                            data.data.forEach(subject => {
                                const option = document.createElement('option');
                                option.value = subject.subject_id;
                                option.textContent = subject.subject;
                                subjectSelect.appendChild(option);
                            });
                        }
                    });
            } else {
                showNotification('Error adding course: ' + data.message, 'error');
            }
        });
    });
}

//! <|--------------------------DELETE--------------------------|>

//? get cohorts and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getCohorts')
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById('cohort');
        if (!select) return;
        if (data.status === 'success') {
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
    fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getSubjects')
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById('subject');
        if (!select) return;
        if (data.status === 'success') {
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

//? Populate deleteProgramType dropdown
const deleteProgramTypeSelect = document.getElementById('deleteProgramType');
if (deleteProgramTypeSelect) {
    deleteProgramTypeSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program type</option>';
    fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getProgramTypes')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                data.data.forEach(programType => {
                    const option = document.createElement('option');
                    option.value = programType.program_type_id;
                    option.textContent = programType.program_name;
                    deleteProgramTypeSelect.appendChild(option);
                });
            } else {
                console.error('Error fetching program types:', data.message);
            }
        })
        .catch(err => console.error('Fetch error:', err));
}

//? Delete Program Logic
const deleteProgramSelect = document.getElementById('deleteProgram');

if (deleteProgramTypeSelect && deleteProgramSelect) {
    deleteProgramSelect.addEventListener('mousedown', function() {
        if (!deleteProgramTypeSelect.value) {
            deleteProgramSelect.innerHTML = `
                <option value="" disabled selected hidden>Choose a program</option>
                <option value="" disabled>Select program type first</option>
            `;
        }
    });

    deleteProgramTypeSelect.addEventListener('change', function() {
        deleteProgramSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
        const programTypeId = this.value;
        if (!programTypeId) return;

        fetch(`/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getPrograms&program_type_id=${programTypeId}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    if (data.data.length === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'No programs found';
                        option.disabled = true;
                        deleteProgramSelect.appendChild(option);
                    } else {
                        data.data.forEach(program => {
                            const option = document.createElement('option');
                            option.value = program.prog_id;
                            option.textContent = program.name;
                            deleteProgramSelect.appendChild(option);
                        });
                    }
                } else {
                    console.error('Error fetching programs:', data.message);
                }
            })
            .catch(err => console.error('Fetch error:', err));
    });
}

//? Delete Cohort Logic
const deleteCohortSelect = document.getElementById('deleteCohort');
if (deleteProgramSelect && deleteCohortSelect) {
    deleteCohortSelect.addEventListener('mousedown', function() {
        if (!deleteProgramSelect.value) {
            deleteCohortSelect.innerHTML = `
                <option value="" disabled selected hidden>Choose a cohort</option>
                <option value="" disabled>Select program first</option>
            `;
        }
    });

    deleteProgramSelect.addEventListener('change', function() {
        //* Limpiar el select antes de llenarlo
        deleteCohortSelect.innerHTML = '<option value="" disabled selected hidden>Choose a cohort</option>';
        const programId = this.value;
        if (!programId) return;
        //* Solo hacer fetch si hay un programa seleccionado
        fetch(`/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getCohorts&program_id=${programId}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    if (data.data.length === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'No cohorts found';
                        option.disabled = true;
                        deleteCohortSelect.appendChild(option);
                    } else {
                        data.data.forEach(cohort => {
                            const option = document.createElement('option');
                            option.value = cohort.cohort_id;
                            option.textContent = cohort.cohort;
                            deleteCohortSelect.appendChild(option);
                        });
                    }
                } else {
                    console.error('Error fetching cohorts:', data.message);
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Error loading cohorts';
                option.disabled = true;
                deleteCohortSelect.appendChild(option);
            });
    });
}

//? Delete Course Logic
const deleteCourseSelect = document.getElementById('deleteCourse');
if (deleteProgramSelect && deleteCourseSelect) {
    deleteCourseSelect.addEventListener('mousedown', function() {
        if (!deleteProgramSelect.value) {
            deleteCourseSelect.innerHTML = `
                <option value="" disabled selected hidden>Choose a course</option>
                <option value="" disabled>Select program first</option>
            `;
        }
    });

    deleteProgramSelect.addEventListener('change', function() {
        //* Limpiar el select antes de llenarlo
        deleteCourseSelect.innerHTML = '<option value="" disabled selected hidden>Choose a course</option>';
        const programId = this.value;
        if (!programId) return;
        //* Solo hacer fetch si hay un programa seleccionado
        fetch(`/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getSubjects&program_id=${programId}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    if (data.data.length === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'No courses found';
                        option.disabled = true;
                        deleteCourseSelect.appendChild(option);
                    } else {
                        data.data.forEach(subject => {
                            const option = document.createElement('option');
                            option.value = subject.subject_id;
                            option.textContent = subject.subject;
                            deleteCourseSelect.appendChild(option);
                        });
                    }
                } else {
                    console.error('Error fetching courses:', data.message);
                }
            })
            .catch(err => console.error('Fetch error:', err));
    });
}

//? <|--------------------------Modals--------------------------|>

//? elems
const deleteProgramModal = document.getElementById('delete-program-modal');
const deleteCohortModal = document.getElementById('delete-cohort-modal');
const deleteCourseModal = document.getElementById('delete-course-modal');

//?modal elems for btns
const closeButtons = document.querySelectorAll('.close-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');

//? Add event listeners to open modals for delete actions in Manage Data section
const deleteProgramBtn = document.getElementById('deleteProgramBtn');
const deleteCohortBtn = document.getElementById('deleteCohortBtn');
const deleteCourseBtn = document.getElementById('deleteCourseBtn');

if (deleteProgramBtn) {
    deleteProgramBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const programId = document.getElementById('deleteProgram').value;
        if (programId) {
            openDeleteProgramModal(programId);
        } else {
            showNotification('Please select a program to delete.', 'error');
        }
    });
}
if (deleteCohortBtn) {
    deleteCohortBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const cohortId = document.getElementById('deleteCohort').value;
        if (cohortId) {
            openDeleteCohortModal(cohortId);
        } else {
            showNotification('Please select a cohort to delete.', 'error');
        }
    });
}
if (deleteCourseBtn) {
    deleteCourseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const courseId = document.getElementById('deleteCourse').value;
        if (courseId) {
            openDeleteCourseModal(courseId);
        } else {
            showNotification('Please select a course to delete.', 'error');
        }
    });
}

//? open delete Program modal
function openDeleteProgramModal(programId) {
    document.getElementById('delete-Program-id').value = programId;
    deleteProgramModal.style.display = 'flex';
}

//? open delete Cohort modal
function openDeleteCohortModal(cohortId) {
    document.getElementById('delete-Cohort-id').value = cohortId;
    deleteCohortModal.style.display = 'flex';
}

//? open delete Course modal
function openDeleteCourseModal(courseId) {
    document.getElementById('delete-Course-id').value = courseId;
    deleteCourseModal.style.display = 'flex';
}

//? close modals
function closeAllModals() {
    deleteProgramModal.style.display = 'none';
    deleteCohortModal.style.display = 'none';
    deleteCourseModal.style.display = 'none';
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
    if (e.target === deleteProgramModal || e.target === deleteCohortModal || e.target === deleteCourseModal) {
        closeAllModals();
    }
});

//? Delete Program Logic
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'confirm-delete-program') {
        const programId = document.getElementById('delete-Program-id').value;
        console.log('Deleting program with ID:', programId);
        fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=deleteProgram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ programId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Program deleted successfully!', 'success');
                closeAllModals();
                //* Refresh the program list in Add Data
                fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getPrograms')
                    .then(res => res.json())
                    .then(data => {
                        const programSelect = document.getElementById('program');
                        if (!programSelect) return;
                        programSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
                        if (data.status === 'success') {
                            data.data.forEach(program => {
                                const option = document.createElement('option');
                                option.value = program.prog_id;
                                option.textContent = program.name;
                                programSelect.appendChild(option);
                            });
                        }
                    });
                //* Refresh the program list in Delete Data
                const deleteProgramTypeSelect = document.getElementById('deleteProgramType');
                const deleteProgramSelect = document.getElementById('deleteProgram');
                if (deleteProgramTypeSelect && deleteProgramSelect) {
                    const programTypeId = deleteProgramTypeSelect.value;
                    if (programTypeId) {
                        fetch(`/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getPrograms&program_type_id=${programTypeId}`)
                            .then(res => res.json())
                            .then(data => {
                                deleteProgramSelect.innerHTML = '<option value="" disabled selected hidden>Choose a program</option>';
                                if (data.status === 'success') {
                                    data.data.forEach(program => {
                                        const option = document.createElement('option');
                                        option.value = program.prog_id;
                                        option.textContent = program.name;
                                        deleteProgramSelect.appendChild(option);
                                    });
                                }
                            });
                    }
                }
            } else {
                showNotification('Error deleting program: ' + data.message, 'error');
            }
        })
        .catch(err => {
            showNotification('Network or server error while deleting program.', 'error');
            console.error('Delete program fetch error:', err);
        });
    }
});

//? Delete Cohort Logic
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'confirm-delete-cohort') {
        const cohortId = document.getElementById('delete-Cohort-id').value;
        console.log('Deleting cohort with ID:', cohortId);
        fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=deleteCohort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cohortId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Cohort deleted successfully!', 'success');
                closeAllModals();
                //* Refresh the cohort list in Add Data
                fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getCohorts')
                    .then(res => res.json())
                    .then(data => {
                        const cohortSelect = document.getElementById('cohort');
                        if (!cohortSelect) return;
                        cohortSelect.innerHTML = '<option value="" disabled selected hidden>Choose a Cohort</option>';
                        if (data.status === 'success') {
                            data.data.forEach(cohort => {
                                const option = document.createElement('option');
                                option.value = cohort.cohort_id;
                                option.textContent = cohort.cohort;
                                cohortSelect.appendChild(option);
                            });
                        }
                    });
                //* Refresh the cohort list in Delete Data
                const deleteProgramSelect = document.getElementById('deleteProgram');
                const deleteCohortSelect = document.getElementById('deleteCohort');
                if (deleteProgramSelect && deleteCohortSelect) {
                    const programId = deleteProgramSelect.value;
                    if (programId) {
                        fetch(`/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getCohorts&program_id=${programId}`)
                            .then(res => res.json())
                            .then(data => {
                                deleteCohortSelect.innerHTML = '<option value="" disabled selected hidden>Choose a cohort</option>';
                                if (data.status === 'success') {
                                    data.data.forEach(cohort => {
                                        const option = document.createElement('option');
                                        option.value = cohort.cohort_id;
                                        option.textContent = cohort.cohort;
                                        deleteCohortSelect.appendChild(option);
                                    });
                                }
                            });
                    }
                }
            } else {
                showNotification('Error deleting cohort: ' + data.message, 'error');
            }
        });
    }
});

//? Delete Course Logic
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'confirm-delete-course') {
        const courseId = document.getElementById('delete-Course-id').value;
        console.log('Deleting course with ID:', courseId); 
        fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=deleteCourse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId })
        })  
        .then(res => res.json())
        .then(data => {
            console.log('Backend response:', data); 
            if (data.status === 'success') {
                showNotification('Course deleted successfully!', 'success');
                closeAllModals();
                fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getSubjects')
                    .then(res => res.json())
                    .then(data => {
                        const subjectSelect = document.getElementById('subject');
                        if (!subjectSelect) return;
                        subjectSelect.innerHTML = '<option value="" disabled selected hidden>Choose a Course</option>';
                        if (data.status === 'success') {
                            data.data.forEach(subject => {
                                const option = document.createElement('option');
                                option.value = subject.subject_id;
                                option.textContent = subject.subject;
                                subjectSelect.appendChild(option);
                            });
                        }
                    });
                
                const deleteProgramSelect = document.getElementById('deleteProgram');
                const deleteCourseSelect = document.getElementById('deleteCourse');
                if (deleteProgramSelect && deleteCourseSelect) {
                    const programId = deleteProgramSelect.value;
                    if (programId) {
                        fetch(`/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getSubjects&program_id=${programId}`)
                            .then(res => res.json())
                            .then(data => {
                                deleteCourseSelect.innerHTML = '<option value="" disabled selected hidden>Choose a course</option>';
                                if (data.status === 'success') {
                                    data.data.forEach(subject => {
                                        const option = document.createElement('option');
                                        option.value = subject.subject_id;
                                        option.textContent = subject.subject;
                                        deleteCourseSelect.appendChild(option);
                                    });
                                }
                            });
                    }
                }
            } else {
                showNotification('Error deleting course: ' + data.message, 'error');
            }
        });    
    }
});