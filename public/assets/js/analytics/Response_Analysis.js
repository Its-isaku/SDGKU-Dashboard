//! <|-------------------------------- Fetch Logic --------------------------------|>





//! <|-------------------------------- Filter Logic --------------------------------|>



//! <|-------------------------------- Graph Logic --------------------------------|>
//? Testing Data
    const dbLabels = ['MSIM', 'MSCT', 'BSGM', 'FSDI', 'MSIM', 'MSCT'];
    const dbValues = [4.37, 4.79, 4.69, 4.38, 4.37, 4.79];

//? Render the Response Analysis Chart
function renderResponseAnalysisChart() {

    //* Check if the canvas element exists
    const ctx = document.getElementById('responseAnalysisChart').getContext('2d');
    const labels = dbLabels;
    const values = dbValues;

    

    //* Create a vertical red gradient for the bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#b6240a');
    gradient.addColorStop(1, '#660000');

    //*  Data for the chart
    const data = {
        labels: labels,
        datasets: [{
            label: 'Average',
            data: values,
            backgroundColor: gradient,
            borderColor: '#660000',
            borderWidth: 1,
            borderRadius: 5,
        }]
    };

    //* Chart configuration
    const config = {
        type: 'bar',
        data: data,
        options: {
            plugins: {
                legend: { display: false },
                datalabels: { //* Display data labels on top of the bars */
                    anchor: 'end',
                    align: 'start',
                    color: '#222',
                    font: { weight: 'bold', size: 14 },
                    formatter: function(value) {
                        return value.toFixed(2);
                    }
                }
            },
            scales: {
                y: {  //* Adjust the y-axis scale */
                    min: 4.0,
                    max: 5.0,
                    ticks: {
                        stepSize: 0.1
                    }
                },
                x: { //* Adjust the x-axis scale */
                    ticks: {
                        font: { size: 20 }
                    }
                }
            },
            barPercentage: 1,  //* Make bars thinner
            categoryPercentage: 0.5  //* Adjust bar spacing
        },
        plugins: [window.ChartDataLabels || {}],
    };

    //* Erase the previous chart instance if it exists
    if (window.responseAnalysisChartInstance) {
        window.responseAnalysisChartInstance.destroy();
    }
    //* Create a new chart instance
    window.responseAnalysisChartInstance = new Chart(ctx, config);
}

//! <|-------------------------------- Tables Logic --------------------------------|>
//? Variable to populate with DB 
const programs = [
    {   
        //* Dynamic Program Name
        name: 'FSDI',

        //* Table Conttent
        measures: [
            { //* Row 1
                //* Static
                type: 'Direct Measure',
                target: '70% of students must receive a proficient (C grade) or distinguished evaluation (A or B grade) on relevant content criteria mapped to this PLO.',

                //* Dynamic
                observed: 58,
                met: 55,
                percent: '95%'
            },
            { //* Row 2
                //* Static
                type: 'Indirect Measure',
                target: '70% or more of students completing the program will express satisfaction on the Final Program Survey by indicating either “Agree” or “Strongly Agree”',

                //* Dynamic
                observed: 15,
                met: 15,
                percent: '100%'
            }
        ]
    },
    {   
        //* Dynamic Program Name
        name: 'FSDI',

        //* Table Conttent
        measures: [
            { //* Row 1
                //* Static
                type: 'Direct Measure',
                target: '70% of students must receive a proficient (C grade) or distinguished evaluation (A or B grade) on relevant content criteria mapped to this PLO.',

                //* Dynamic
                observed: 58,
                met: 55,
                percent: '95%'
            },
            { //* Row 2
                //* Static
                type: 'Indirect Measure',
                target: '70% or more of students completing the program will express satisfaction on the Final Program Survey by indicating either “Agree” or “Strongly Agree”',

                //* Dynamic
                observed: 15,
                met: 15,
                percent: '100%'
            }
        ]
    },
    {   
        //* Dynamic Program Name
        name: 'FSDI',

        //* Table Conttent
        measures: [
            { //* Row 1
                //* Static
                type: 'Direct Measure',
                target: '70% of students must receive a proficient (C grade) or distinguished evaluation (A or B grade) on relevant content criteria mapped to this PLO.',

                //* Dynamic
                observed: 58,
                met: 55,
                percent: '95%'
            },
            { //* Row 2
                //* Static
                type: 'Indirect Measure',
                target: '70% or more of students completing the program will express satisfaction on the Final Program Survey by indicating either “Agree” or “Strongly Agree”',

                //* Dynamic
                observed: 15,
                met: 15,
                percent: '100%'
            }
        ]
    },
];

//? function to render the program tables
function renderProgramTables() {

    //* Check if the container element exists
    const container = document.getElementById('responseAnalysisTable');
    if (!container) return;

    //* Clear the container before rendering
    container.innerHTML = '';

    //* Loop through each program and create a table
    programs.forEach(program => {

        //* Create a wrapper div for each program
        const tableContainer = document.createElement('div');
        tableContainer.className = 'tableContainer';

        //* Create a title for the program
        const titleContainer = document.createElement('div');   
        titleContainer.className = 'titleContainer';
        const title = document.createElement('h3');
        title.textContent = program.name;
        titleContainer.appendChild(title);
        tableContainer.appendChild(titleContainer);

        //* Create the table
        const table = document.createElement('table');
        table.className = 'display';

        //* Table head
        const thead = document.createElement('thead');
        thead.className = 'theadContainer';
        thead.innerHTML = /*HTML */ `
            <tr>
                <th>Measure</th>
                <th>Acceptable Target</th>
                <th>Total Number of student records observed</th>
                <th>Total number of students records meeting acceptable target</th>
                <th>Assessment results: Percentage of student records meeting acceptable target</th>
            </tr>
        `;
        table.appendChild(thead);

        //* Table body
        const tbody = document.createElement('tbody');
        program.measures.forEach(measure => {
            const tr = document.createElement('tr');
            tr.className = 'tbodyContainer';
            tr.innerHTML = `
                <td>${measure.type}</td>
                <td>${measure.target}</td>
                <td><span class="analytics-number-badge observed">${measure.observed}</span></td>
                <td><span class="analytics-number-badge met">${measure.met}</span></td>
                <td><span class="analytics-number-badge percent">${measure.percent}</span></td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
    });
}

//! <|-------------------------------- Load Logic --------------------------------|>
//? Load the the Respoinse Analysis Chart 
document.addEventListener('DOMContentLoaded', () => {
    renderResponseAnalysisChart();
    renderProgramTables();
});