
const answers = [
    {
        email: "student1@sdgku.edu",
        average: "80%",
        submitted: "2025-06-02",
        measures: [
            {
                openQuestion: "What was the best part of this course",
                answer: "I think the best part of this course was the enviroment",
            },
            {
                openQuestion: "Do you think we need to improve something?",
                answer: "Everything was perfect to me",
            }
        ]
    },
    {
        email: "student2@sdgku.edu",
        average: "60%",
        submitted: "2025-06-05",
        measures: [
            {
                openQuestion: "What was the best part of this course",
                answer: "I think the best part of this course was the enviroment",
            },
            {
                openQuestion: "Do you think we need to improve something?",
                answer: "Everything was perfect to me",
            }
        ]
    }
];
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, answers:', answers);
    renderProgramTables(answers);
});

//? function to render the program tables
function calculateAverageScore(answers) {
    if (!answers || answers.length === 0) return '0%';
    const total = answers.reduce((sum, answer) => {
        const percentage = parseInt(answer.average.replace('%', ''));
        return sum + percentage;
    }, 0);
    return Math.round(total / answers.length) + '%';
}

function renderProgramTables(answers) {
    console.log('Rendering tables...');
    
    // Update summary information
    document.getElementById('typeInfo').textContent = `Total Responses: ${answers.length}`;
    document.getElementById('averageInfo').textContent = `Average Score: ${calculateAverageScore(answers)}`;
    document.getElementById('responsesInfo').textContent = `Last Response: ${answers[answers.length - 1].submitted}`;
    
    //* Check if the container element exists
    const container = document.getElementById('AllProgramsTable');
    if (!container) {
        console.error('Container not found');
        return;
    }

    //* Clear the container before rendering
    container.innerHTML = '';

    //* Loop through each answer and create a table
    answers.forEach(answer => {
        //* Create a wrapper div for each program
        const tableContainer = document.createElement('div');
        tableContainer.className = 'tableContainer';        //* Create a title for the response
        const titleContainer = document.createElement('div');   
        titleContainer.className = 'titleContainer';
        const title = document.createElement('h3');
        title.textContent = `Response from: ${answer.email}`;
        title.className = 'analytics-program-badge';
        titleContainer.appendChild(title);
        const infoContainer = document.createElement('div');
        infoContainer.className = 'program-info';
        infoContainer.innerHTML = `
            <p>Average: ${answer.average}</p>
            <p>Submitted: ${answer.submitted}</p>
        `;
        titleContainer.appendChild(infoContainer);
        tableContainer.appendChild(titleContainer);

        //* Create the table
        const table = document.createElement('table');
        table.className = 'display';

        //* Table head
        const thead = document.createElement('thead');
        thead.className = 'theadContainer';
        thead.innerHTML = /*HTML */ `
            <tr>
                <th>Question</th>
                <th>Answer</th>
            </tr>
        `;
        table.appendChild(thead);

        //* Table body
        const tbody = document.createElement('tbody');
        answer.measures.forEach(measure => {
            const tr = document.createElement('tr');
            tr.className = 'tbodyContainer';
            tr.innerHTML = `
                <td>${measure.openQuestion}</td>
                <td>${measure.answer}</td>
            `;
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
    });
}