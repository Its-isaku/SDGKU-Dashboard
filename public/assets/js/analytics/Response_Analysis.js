//! <|-------------------------------- Notification Logic --------------------------------|>

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

//! <|-------------------------------- Fetch Logic --------------------------------|>
let totalLinkert5 = [];
let totalPrograms = [];
let programsList= [];


function getByProgramType(programTypeId, startDate, endDate) {
    const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
    url.searchParams.append('action', 'getByProgramTypes');
    url.searchParams.append('program_type_id', programTypeId);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);

    return fetch(url.toString())
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.status === 'success') {
                let suma = 0;
                let total = 0;
                let avg = 0;

                if (data.data.length > 0) {
                    suma = parseInt(data.data[0].sumaLinkert5) || 0;
                    total = parseInt(data.data[0].total_Programa) || 1; 
                    avg = parseFloat(suma / total); 
                }
                totalLinkert5.push(suma);
                totalPrograms.push(total);
                dbValues.push(avg); 
                return {
                    totalLinkert5: [...totalLinkert5],
                    totalPrograms: [...totalPrograms],
                    dbValues: [...dbValues] 
                };
            }
            throw new Error(data.message || 'Error fetching data');
        })
        .catch(error => {
            console.error('Error:', error);
            totalLinkert5.push(0);
            totalPrograms.push(0);
            dbValues.push(0);
            return {
                totalLinkert5: [...totalLinkert5],
                totalPrograms: [...totalPrograms],
                dbValues: [...dbValues]
            };
        });
}

async function getAndStorePrograms(programTypeId) {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getPrograms&program_type_id=${programTypeId}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            programsList.length = 0;
            programsList.push(...data.data.map(item => ({
                id: item.prog_id,
                program: item.name
            })));
            
            data.data.forEach(e=>{
                dbLabels.push(e.name);
            });

            
            return programsList;
        }
        throw new Error(data.message || 'Error en los datos');
    } catch (error) {
        showNotification("Error:", error);
        programsList = [];
        throw error;
    }
}

//! <|-------------------------------- Filter Logic --------------------------------|>
//? Fill select with years 
document.addEventListener('DOMContentLoaded', function() {
        const select = document.getElementById('selectYearRangeId');
        
        const currentYear = new Date().getFullYear();
        const startYear = 2020;
        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        }
    });

//?--submit btn listener 
document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('submitFilterbtn');
    boton.addEventListener('click', async function () {
        console.log('¡Botón clickeado!');
        const selectRange = document.getElementById('selectDateRangeId');
        const selectYear = document.getElementById('selectYearRangeId');
        const valorRange = selectRange.value;
        const TypeIndex = selectYear.selectedIndex;
        const index = selectRange.selectedIndex;
        const valorYear = selectYear.value;
        let programTypeId;
        let startDateSelect;
        let endDateSelect;
        let startDateMonths;
        let endDateMonths;
        if(TypeIndex!=0){
        programTypeId =confirmSelection();
        if (index === 0) {
            startDateMonths = '-01-01';
            endDateMonths = '-12-31';
        }else if (index === 1) {
            startDateMonths = '-01-01';
            endDateMonths = '-03-31';
        } else if (index === 2) {
            startDateMonths = '-04-01';
            endDateMonths = '-06-30';
        } else if (index === 3) {
            startDateMonths = '-07-01';
            endDateMonths = '-09-30';
        } else if (index === 4) {
            startDateMonths = '-10-01';
            endDateMonths = '-12-31';
        }
        await getAndStorePrograms(programTypeId)
        startDateSelect = `${valorYear}${startDateMonths}`;
        endDateSelect = `${valorYear}${endDateMonths}`;
            await Promise.all(
        programsList.map(p => getByProgramType(p.id, startDateSelect, endDateSelect))
    );
        renderResponseAnalysisChart();
        }else{
            //!Notificacion
            showNotification("Please select a year", "error");
        }
        
    });
});
//?--Confirmation
function confirmSelection(){
    const selectType = document.getElementById('programTypeId');
    const valorType = selectType.value;

    totalLinkert5 = [];
    totalPrograms = [];
    programsList= [];
    dbLabels = [];
    dbValues = [];
    if (!valorType || valorType === 'default') {
        showNotification("Please select a program type", "error");
        return;
    }
    if (valorType === 'opcion1') {
        return  1;
    } else if (valorType === 'opcion2') {
        return  2;
    } else if (valorType === 'opcion3') {
        return 3;
    } else {
        showNotification("Please select a program type", "error");
        return; 
    }
}


//! <|-------------------------------- Graph Logic --------------------------------|>
//? Variables to store the data for the chart
    let dbLabels= [];
    let dbValues = [];

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
                    min: 1.0,
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
        title.className = 'analytics-program-badge';
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