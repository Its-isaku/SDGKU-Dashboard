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


//?-----Get total amount of students for direct measure
//! async function getStudentsPerProgram(program_id) {
//     const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
//     url.searchParams.append('action', 'programs_id');
//     url.searchParams.append('program_id', program_id);

//     try {
//         const response = await fetch(url.toString());
//         if (!response.ok) throw new Error(`Error HTTP! estado: ${response.status}`);
        
//         const data = await response.json();
//         if (data.status !== 'success') throw new Error(data.message || 'Error en los datos recibidos');

//         const students = parseInt(data.total_students) || 0;
//         return students; 

//     } catch (error) {
//         console.error('Error en getStudentsPerProgram:', error);
//         return 0; 
//     }
// }
//?-----Get total amount of students for indirect measure
//! async function getStudentsIndirectMeasure(program_id) {
//     const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
//     url.searchParams.append('action', 'getStudentsIndirectMeasure');
//     url.searchParams.append('program_id', program_id);

//     try {
//         const response = await fetch(url.toString());
//         if (!response.ok) throw new Error(`Error HTTP! estado: ${response.status}`);
        
//         const data = await response.json();
//         if (data.status !== 'success') throw new Error(data.message || 'Error en los datos recibidos');

//         const students = parseInt(data.total_students) || 0;
//         return students; 

//     } catch (error) {
//         console.error('Error en getStudentsPerProgram:', error);
//         return 0;
//     }
// }

//?---------------------------------------------
async function getByProgramType(programTypeId, startDate, endDate) {
    const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
    url.searchParams.append('action', 'getByProgramTypes');
    url.searchParams.append('program_type_id', programTypeId);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);

    try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.status !== 'success') throw new Error(data.message || 'Error fetching data');

        if (data.data && data.data.length > 0) {
            
            if (data.data[0].average) {
                return parseFloat(data.data[0].average.replace('%', ''));
            }

            if (data.data[0].sumaLinkert5 !== undefined && data.data[0].total_Programa > 0) {
                return parseFloat((data.data[0].sumaLinkert5 / data.data[0].total_Programa).toFixed(2));
            }
        }
        return 0;
    } catch (error) {
        console.error('Error in getByProgramType:', error);
        return 0;
    }
}
//?---------Get and store the programs
async function getProgramIds(programTypeId) {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getPrograms&program_type_id=${programTypeId}`);
        const data = await response.json();

        if (data.status === 'success') {
            const ids = data.data.map(item => item.prog_id);
            return ids;
        }

        throw new Error(data.message || 'Error en los datos');
    } catch (error) {
        console.error("Error en getProgramIds:", error);
        throw error;
    }
}
//?---Get programs averages
async function getProgramAvg(programTypeId) {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getProgramsAverages&program_type_id=${programTypeId}`);
        const data = await response.json();

        if (data.status === 'success') {
            const ids = data.data.map(item => item.prog_id);
            return ids;
        }

        throw new Error(data.message || 'Error en los datos');
    } catch (error) {
        console.error("Error en getProgramIds:", error);
        throw error;
    }
}


//?-----------Get program names
async function getProgramNames(programTypeId) {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getPrograms&program_type_id=${programTypeId}`);
        const data = await response.json();

        if (data.status === 'success') {
            const names = data.data.map(item => item.name);
            return names;
        }

        throw new Error(data.message || 'Error en los datos');
    } catch (error) {
        console.error("Error en getProgramNames:", error);
        throw error;
    }
}


//?-----get the results of every survey multi and true/false
//! async function getsurveyResults(program_id, responses_id) {
//     const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
//     url.searchParams.append('action', 'getsurveyResults');
//     url.searchParams.append('program_id', program_id);
//     url.searchParams.append('responses_id', responses_id);

//     try {
//         const res = await fetch(url.toString());
//         if (!res.ok) throw new Error(`Error HTTP! estado: ${res.status}`);
//         const data = await res.json();
//         if (data.status === 'success') {
//             if (Array.isArray(data.data)) {
//                 return data.data.map(item => item.correct_answer);
//             } else if (data.data && Array.isArray(data.data.correct_answer)) {
//                 return data.data.correct_answer;
//             } else if (data.data && data.data.correct_answer !== undefined) {
//                 return [data.data.correct_answer];
//             } else {
//                 return [];
//             }
//         }

//         throw new Error(data.message || 'Error en los datos recibidos');
//     } catch (error) {
//         console.error('Error en getsurveyResults:', error);
//         return [];
//     }
// }

//?-----get the results of every Linkert Survey Final Assisment
//! async function getsurveyIndirectResults( responses_id) {
//     const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
//     url.searchParams.append('action', 'getsurveyIndirectResults');
//     url.searchParams.append('responses_id', responses_id);

//     try {
//         const res = await fetch(url.toString());
//         if (!res.ok) throw new Error(`Error HTTP! estado: ${res.status}`);

//         const data = await res.json();

//         if (data.status === 'success') {

//             if (Array.isArray(data.data)) {

//                 return data.data.map(item => item.answer_text);
//             } else if (data.data && Array.isArray(data.data.answer_text)) {
//                 return data.data.answer_text;
//             } else if (data.data && data.data.answer_text !== undefined) {

//                 return [data.data.answer_text];
//             } else {
//                 return [];
//             }
//         }

//         throw new Error(data.message || 'Error en los datos recibidos');
//     } catch (error) {
//         console.error('Error en getsurveyResults:', error);
//         return [];
//     }
// }

//?-Get Group of answers FINAL ASSESSMENT for Indirect Analisis
//! async function getAnswerPerStudentIndirect(programId, startDate, endDate) {
//     const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
//     url.searchParams.append('action', 'getAnswersPerStudentIndirect');
//     url.searchParams.append('program_id', programId);
//     url.searchParams.append('start_date', startDate);
//     url.searchParams.append('end_date', endDate);
    
//     try {
//         const response = await fetch(url.toString());
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         const data = await response.json();
        
//         if (data.status === 'success') {
//             // data.data ya contiene los arrays directamente
            
//             return data.data; // Retorna los arrays directamente
//         }

//         throw new Error(data.message || 'Respuesta sin éxito');
//     } catch (error) {
//         console.error("Error completo:", error);
//         return []; 
//     }
// }
//?---Get Group of answers POST TEST for Direct Analisis
//! async function getAnswerPerStudent(programId) {
//     try {
//         const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getAnswersPerStudent&program_id=${programId}`);
        
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
//         const data = await response.json();
//         console.log("Datos crudos recibidos:", data); // Depuración
        
//         if (data.status === 'success') {
//             if (!Array.isArray(data.data)) {
//                 throw new Error("data.data no es un array");
//             }
            
            
//             const studentsList = data.data.map(item => {
//                 if (item.responseIds && typeof item.responseIds === 'string') {
//                     return item.responseIds.split(',').map(id => {
//                         const num = Number(id);
//                         return isNaN(num) ? id : num;
//                     });
//                 }
//                 return []; 
//             });

//             // console.log("studentsList generado:", studentsList);
//             return studentsList;
//         }

//         throw new Error(data.message || 'Respuesta sin éxito');
//     } catch (error) {

//         console.error("Error completo:", error);
//         return [];

//     }
// }
//? get the information questions texts and average
async function getProgramData(programId, startDate, endDate) {
    try {
        const params = new URLSearchParams({
            action: 'getProgramInfo',
            program_id: programId,
            start_date: startDate,
            end_date: endDate
        });

        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Error desconocido');
        }

        return data.data.map(q => ({
    question_text: q.texts,
    measures: [{
        type: 'Indirect Measure',
        target: '70% or more of students completing the program will express satisfaction on the Final Program Survey by indicating either “Agree” or “Strongly Agree”',
        observed: q.total_students,
        met: q.acceptable,
        percent: (typeof q.average !== 'undefined' && q.average !== null) ? q.average : ''
    }]
}));
                
    } catch (error) {
        console.error('Error fetching program data:', error);
        throw error; 
    }
}
//! <|-------------------------------- Filter Logic --------------------------------|>
//? Fill select with years 
let dateRangeOption = ['Annual', 'Semiannual','Quarterly'];
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
        select.addEventListener('change', async function () {
        const dateRange = document.getElementById('selectRangeTypeId');
        const selectedRange = dateRange.selectedIndex;
        dateRange.innerHTML = '';
            dateRangeOption.forEach(range => {
            const option = document.createElement('option');
            option.value = range;
            option.textContent = range;
            dateRange.appendChild(option);
        });
        });
       
    });
    
// document.addEventListener('DOMContentLoaded', function () {
//     const selectElement = document.getElementById('programTypeId');
//     selectElement.addEventListener('change', async function () {
//     const selectedValue = selectElement.selectedIndex;
//     const dbLabels = await getProgramNames(selectedValue);
//     const programOption = document.getElementById('selectProgramId');
//         programOption.innerHTML = '';
//             const allOption = document.createElement('option');
//             allOption.value = 'all'; 
//             allOption.textContent = 'All Programs';
//             programOption.appendChild(allOption);
//             dbLabels.forEach(programName => {
//             const option = document.createElement('option');
//             option.value = programName;
//             option.textContent = programName;
//             programOption.appendChild(option);
//         });       
        
//     });
// });

let quarterlyRange=['Select quarterly range','January - March','April - June','July - September','October - December'];
let semiannualRange=['Select semiannual range','January - June','July - December'];
//? auto fill date range when range type is selected
document.addEventListener('DOMContentLoaded', function () {
    const selectElement = document.getElementById('selectRangeTypeId');
    selectElement.addEventListener('change', async function () {
    const selectedValue = selectElement.selectedIndex;
    console.log("select",selectedValue);
    if(selectedValue== '0'){
        const rangeOption = document.getElementById('selectDateRangeId');
        rangeOption.innerHTML = ''; 
    }
    if(selectedValue=='1'){
        const rangeOption = document.getElementById('selectDateRangeId');
        rangeOption.innerHTML = ''; 
        semiannualRange.forEach(range => {
            const option = document.createElement('option');
            option.value = range;
            option.textContent = range;
            rangeOption.appendChild(option);
        });
    }
    if(selectedValue=='2'){
        const rangeOption = document.getElementById('selectDateRangeId');
        rangeOption.innerHTML = ''; 
        quarterlyRange.forEach(range => {
            const option = document.createElement('option');
            option.value = range;
            option.textContent = range;
            rangeOption.appendChild(option);
        });
    }
    });
});

//? auto fill programs when program type is selected
document.addEventListener('DOMContentLoaded', function () {
    const selectElement = document.getElementById('programTypeId');
    selectElement.addEventListener('change', async function () {
    const selectedValue = selectElement.selectedIndex;
    const dbLabels = await getProgramNames(selectedValue);
    const programOption = document.getElementById('selectProgramId');
        programOption.innerHTML = '';
            const allOption = document.createElement('option');
            allOption.value = 'all'; 
            allOption.textContent = 'All Programs';
            programOption.appendChild(allOption);
            dbLabels.forEach(programName => {
            const option = document.createElement('option');
            option.value = programName;
            option.textContent = programName;
            programOption.appendChild(option);
        });
        
    });
});

function getDateRangeSelected(){
        const selectRange = document.getElementById('selectDateRangeId');
        const selectYear = document.getElementById('selectYearRangeId');
        const SelectRangeSemi = document.getElementById('selectRangeTypeId');
        const TypeIndex = selectYear.selectedIndex;
        const index = selectRange.selectedIndex;
        const valorYear = selectYear.value;
        const completeDateSelected =[];
        const semiOrQuarterly = SelectRangeSemi.selectedIndex;
        console.log("YEAR: ", valorYear);
        let startDateSelect;
        let endDateSelect;
        let startDateMonths;
        let endDateMonths;
        if(semiOrQuarterly === 0 ){
            startDateMonths = '-01-01';
            endDateMonths = '-12-31';
            startDateSelect = `${valorYear}${startDateMonths}`;
            endDateSelect = `${valorYear}${endDateMonths}`;
            completeDateSelected[0] = startDateSelect;
            completeDateSelected[1] = endDateSelect;
            return  completeDateSelected;
        }else if(semiOrQuarterly===2){
                switch (index) {
                    case 1:
                    startDateMonths = '-01-01';
                endDateMonths = '-04-01';
                    break;
                    case 2:
                    startDateMonths = '-04-01';
                endDateMonths = '-07-01';
                    break;
                    case 3:
                    startDateMonths = '-07-01';
                endDateMonths = '-010-01';
                    break;
                    case 4:
                    startDateMonths = '-10-01';
                endDateMonths = '-12-31';
                    break;
                default:
                    startDateMonths = '-01-01';
                endDateMonths = '-12-31';
                }
                startDateSelect = `${valorYear}${startDateMonths}`;
                endDateSelect = `${valorYear}${endDateMonths}`;
                completeDateSelected[0] = startDateSelect;
                completeDateSelected[1] = endDateSelect;
                return  completeDateSelected;
        }else if(semiOrQuarterly === 1){
            switch (index) {
                    case 1:
                    startDateMonths = '-01-01';
                endDateMonths = '-07-01';
                    break;
                    case 2:
                    startDateMonths = '-07-01';
                endDateMonths = '-12-31';
                    break;
                default:
                    startDateMonths = '-01-01';
                endDateMonths = '-12-31';
                }
            startDateSelect = `${valorYear}${startDateMonths}`;
            endDateSelect = `${valorYear}${endDateMonths}`;
            completeDateSelected[0] = startDateSelect;
            completeDateSelected[1] = endDateSelect;
            return  completeDateSelected;
            }   
    }

    function confirmSelection(){

        const selectType = document.getElementById('programTypeId');
        const valorType = selectType.value;
            if (valorType === 'opcion1') {
                return  1;
            } else if (valorType === 'opcion2') {
                return  2;
            } else if (valorType === 'opcion3') {
                return 3;
            } else {
                console.warn("No se seleccionó un tipo válido");
                return; 
            }

}

//?--submit btn listener 
document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('submitFilterbtn');
    boton.addEventListener('click', async function () {
        const selectProgram = document.getElementById('selectProgramId');
        const selectType = document.getElementById('programTypeId');
        const selectYear = document.getElementById('selectYearRangeId');
        const TypeIndex = selectYear.selectedIndex;
        const programIndex = selectProgram.selectedIndex;
        
        if(TypeIndex!=0){
            
            const programTypeId = confirmSelection();
            const completeDateSelected = getDateRangeSelected();
            const ids = await getProgramIds(programTypeId);
            const dbLabels = await getProgramNames(programTypeId);
            const from = completeDateSelected[0];
            const to = completeDateSelected[1];
            const dbValuesRaw=  await Promise.all(
                ids.map(id => getByProgramType(id, completeDateSelected[0], completeDateSelected[1]))
            );
            const id = programIndex-1;
            const program = ids[id];
            const programData = await getProgramData(program,from,to);
            renderProgramTables(programData);
            renderResponseAnalysisChart(dbLabels, dbValuesRaw);
        }else{
            //!Notificacion
            showNotification("Please select a year", "error");
        }
        
    });
});
//?--Confirmation


//! <|-------------------------------- Graph Logic --------------------------------|>

//? Render the Response Analysis Chart
function renderResponseAnalysisChart(dbLabels, dbValues) {
    
    console.log("promedios actualizados: ", dbValues);
    // const dbValues = JSON.stringify(dbValues2);
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
        datasets: [
            {
            label: 'Average',
            data: values,
            backgroundColor: gradient,
            borderColor: '#660000',
            borderWidth: 1,
            borderRadius: 5,
        }
    ]
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
                    min: 0.0,
                    max: 100.0,
                    ticks: {
                        stepSize: 0
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

//? function to render the program tables
function renderProgramTables(questions) {

    //* Check if the container element exists
    const container = document.getElementById('responseAnalysisTable');
    if (!container) return;

    //* Clear the container before rendering
    container.innerHTML = '';

    //* Loop through each question and create a table
    questions.forEach(question => {

        //* Create a wrapper div for each program
        const tableContainer = document.createElement('div');
        tableContainer.className = 'tableContainer';

        //* Create a title for the program
        const titleContainer = document.createElement('div');   
        titleContainer.className = 'titleContainer';
        const title = document.createElement('h3');
        title.textContent = question.question_text;
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
    question.measures.forEach(measure => {
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