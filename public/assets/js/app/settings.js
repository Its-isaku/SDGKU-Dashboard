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

//? Pupulate Manage Data Section

//? get Program Types and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('programType');
    if (!select) {
        console.error('programType select not found');
        return;
    }
    select.innerHTML = '<option value="" disabled selected hidden>Chose a program type</option>';
    fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getProgramTypes')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.status === 'success') {
                data.data.forEach(programType => {
                    const option = document.createElement('option');
                    option.value = programType.program_type_id;
                    option.textContent = programType.program_name;
                    select.appendChild(option);
                });
            } else {
                console.error('Error fetching program types:', data.message);
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
        });
});

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
                    <option value="" disabled selected hidden>Chose a program</option>
                    <option value="" disabled>Select program type first</option>
                `;
            }
        });
        // *Reset program select when program type changes
        programTypeSelect.addEventListener('change', function() {
            programSelect.innerHTML = '<option value="" disabled selected hidden>Chose a program</option>';
        });
    }

    if (programSelect && subjectSelect) {
        //* Show message if subject is clicked before program is selected
        subjectSelect.addEventListener('mousedown', function() {
            if (!programSelect.value) {
                subjectSelect.innerHTML = `
                    <option value="" disabled selected hidden>Chose a Course</option>
                    <option value="" disabled>Select program first</option>
                `;
            }
        });
        //* Reset subject select when program changes
        programSelect.addEventListener('change', function() {
            subjectSelect.innerHTML = '<option value="" disabled selected hidden>Chose a Course</option>';
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
            programSelect.innerHTML = '<option value="" disabled selected hidden>Chose a program</option>';
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

//? get survey types and send them to the frontend
document.addEventListener('DOMContentLoaded', function() {
    fetch('/SDGKU-Dashboard/src/models/manageSurveyData.php?action=getSurveyTypes')
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById('surveyType');
        if (!select) return;
        if (data.status === 'success') {
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
                        programSelect.innerHTML = '<option value="" disabled selected hidden>Chose a program</option>';
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
                        cohortSelect.innerHTML = '<option value="" disabled selected hidden>Chose a Cohort</option>';
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
                        subjectSelect.innerHTML = '<option value="" disabled selected hidden>Chose a Course</option>';
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
