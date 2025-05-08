//? Sections
const sections = {
    security: 'securitySection',
    manageData: 'manageDataSection',
};

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
    fetch('../../../src/models/manageSurveyData.php?action=getProgramTypes')
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById('programType');
        if (!select) return;
        if (data.status === 'success') {
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
            if (!programSelect) return;
            programSelect.innerHTML = '<option value="" disabled selected hidden>Chose a program</option>';
            if (!programTypeId) return;
            console.log('Fetching programs for programTypeId:', programTypeId);
            fetch(`../../../src/models/manageSurveyData.php?action=getPrograms&program_type_id=${programTypeId}`)
                .then(res => res.json())
                .then(data => {
                    console.log('Programs fetch response:', data);
                    console.log(data.data); 
                    data.data.forEach(program => {
                        console.log(program); 
                        console.log(program.program_type_id); 
                        console.log(program.prog_type_id);
                    });
                    if (data.status === 'success') {
                        if (data.data.length === 0) {
                            const option = document.createElement('option');
                            option.value = '';
                            option.textContent = 'No programs found';
                            option.disabled = true;
                            programSelect.appendChild(option);
                        } else {
                            data.data.forEach(program => {
                                console.log(program.prog_id, program.name, program.program_type_id);
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
    fetch('../../../src/models/manageSurveyData.php?action=getCohorts')
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
    fetch('../../../src/models/manageSurveyData.php?action=getSubjects')
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
    fetch('../../../src/models/manageSurveyData.php?action=getSurveyTypes')
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

// Helper to show notifications (implement as needed)
function showNotification(message, type = 'info') {
    alert(message); // Replace with your notification system if you have one
}

// Add Program
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
        fetch('../../../src/models/manageSurveyData.php?action=addProgram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ programName, programTypeId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Program added successfully!', 'success');
                // Refresh the program list
                fetch(`../../../src/models/manageSurveyData.php?action=getPrograms&program_type_id=${programTypeId}`)
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

// Add Cohort
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
        fetch('../../../src/models/manageSurveyData.php?action=addCohort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cohortName, programId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Cohort added successfully!', 'success');
                // Refresh the cohort list
                fetch('../../../src/models/manageSurveyData.php?action=getCohorts')
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

// Add Course
const addCourseBtn = document.getElementById('addCourse');
if (addCourseBtn) {
    addCourseBtn.addEventListener('click', function() {
        const courseName = document.getElementById('newCourse').value.trim();
        const programId = document.getElementById('program').value;
        if (!programId) {
            alert('Please select a program before adding a course.');
            return;
        }
        if (!courseName) {
            alert('Please enter a course name.');
            return;
        }
        fetch('../../../src/models/manageSurveyData.php?action=addSubject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjectName: courseName, programId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Course added successfully!');
                //* Optionally refresh the course list here
                fetch('../../../src/models/manageSurveyData.php?action=getSubjects')
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
                alert('Error adding course: ' + data.message);
            }
        });
    });
}
