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
let responses = [];

//?-----Get total amount of students for direct measure
async function getStudentsPerProgram(program_id) {
    const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
    url.searchParams.append('action', 'programs_id');
    url.searchParams.append('program_id', program_id);

    try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Error HTTP! estado: ${response.status}`);
        
        const data = await response.json();
        if (data.status !== 'success') throw new Error(data.message || 'Error en los datos recibidos');

        const students = parseInt(data.total_students) || 0;
        return students; 

    } catch (error) {
        console.error('Error en getStudentsPerProgram:', error);
        return 0; 
    }
}
//?-----Get total amount of students for indirect measure
async function getStudentsIndirectMeasure(program_id) {
    const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
    url.searchParams.append('action', 'getStudentsIndirectMeasure');
    url.searchParams.append('program_id', program_id);

    try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Error HTTP! estado: ${response.status}`);
        
        const data = await response.json();
        if (data.status !== 'success') throw new Error(data.message || 'Error en los datos recibidos');

        const students = parseInt(data.total_students) || 0;
        return students; 

    } catch (error) {
        console.error('Error en getStudentsPerProgram:', error);
        return 0;
    }
}

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

        let suma = 0;
        let total = 0;
        let avg = 0;

        if (data.data && data.data.length > 0) {
            suma = parseFloat(data.data[0].sumaLinkert5) || 0;
            total = parseInt(data.data[0].total_Programa) || 0;
            avg = (total > 0) ? parseFloat((suma / total).toFixed(2)) : 0;
        }

        return avg;
        

    } catch (error) {
        console.error('Error in getByProgramType:', error);
        return {
            average: 0
        };
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
async function getsurveyResults(program_id, responses_id) {
    const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
    url.searchParams.append('action', 'getsurveyResults');
    url.searchParams.append('program_id', program_id);
    url.searchParams.append('responses_id', responses_id);

    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Error HTTP! estado: ${res.status}`);
        const data = await res.json();
        if (data.status === 'success') {
            if (Array.isArray(data.data)) {
                return data.data.map(item => item.correct_answer);
            } else if (data.data && Array.isArray(data.data.correct_answer)) {
                return data.data.correct_answer;
            } else if (data.data && data.data.correct_answer !== undefined) {
                return [data.data.correct_answer];
            } else {
                return [];
            }
        }

        throw new Error(data.message || 'Error en los datos recibidos');
    } catch (error) {
        console.error('Error en getsurveyResults:', error);
        return [];
    }
}

//?-----get the results of every Linkert Survey Final Assisment
async function getsurveyIndirectResults( responses_id) {
    const url = new URL('/SDGKU-Dashboard/src/models/Response_analysis.php', window.location.origin);
    url.searchParams.append('action', 'getsurveyIndirectResults');
    url.searchParams.append('responses_id', responses_id);

    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Error HTTP! estado: ${res.status}`);

        const data = await res.json();

        if (data.status === 'success') {

            if (Array.isArray(data.data)) {

                return data.data.map(item => item.answer_text);
            } else if (data.data && Array.isArray(data.data.answer_text)) {
                return data.data.answer_text;
            } else if (data.data && data.data.answer_text !== undefined) {

                return [data.data.answer_text];
            } else {
                return [];
            }
        }

        throw new Error(data.message || 'Error en los datos recibidos');
    } catch (error) {
        console.error('Error en getsurveyResults:', error);
        return [];
    }
}


//?---Get Group of answers POST TEST for Direct Analisis
async function getAnswerPerStudentIndirect(programId) {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getAnswersPerStudentIndirect&program_id=${programId}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log("Datos crudos recibidos:", data); 
        
        if (data.status === 'success') {
            if (!Array.isArray(data.data)) {
                throw new Error("data.data no es un array");
            }
            
        
            const studentsList = data.data.map(item => {
                if (item.responseIds && typeof item.responseIds === 'string') {
                    return item.responseIds.split(',').map(id => {
                        const num = Number(id);
                        return isNaN(num) ? id : num;
                    });
                }
                return []; 
            });

            console.log("studentsList generado:", studentsList);
            return studentsList;
        }

        throw new Error(data.message || 'Respuesta sin éxito');
    } catch (error) {
        console.error("Error completo:", error);
        return []; 
    }
}
//?-Get Group of answers FINAL ASSESSMENT for Indirect Analisis

async function getAnswerPerStudent(programId) {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getAnswersPerStudent&program_id=${programId}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log("Datos crudos recibidos:", data); // Depuración
        
        if (data.status === 'success') {
            if (!Array.isArray(data.data)) {
                throw new Error("data.data no es un array");
            }
            
            
            const studentsList = data.data.map(item => {
                if (item.responseIds && typeof item.responseIds === 'string') {
                    return item.responseIds.split(',').map(id => {
                        const num = Number(id);
                        return isNaN(num) ? id : num;
                    });
                }
                return []; 
            });

            console.log("studentsList generado:", studentsList);
            return studentsList;
        }

        throw new Error(data.message || 'Respuesta sin éxito');
    } catch (error) {

        console.error("Error completo:", error);
        return [];

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
let quarterlyRange=['Select quarterly range','January - March','April - June','July - September','October - December'];
let semiannualRange=['Select semiannual range','January - June','July - December'];
//? auto fill date range when range type is selected
document.addEventListener('DOMContentLoaded', function () {
    const selectElement = document.getElementById('selectRangeTypeId');
    selectElement.addEventListener('change', async function () {
    const selectedValue = selectElement.selectedIndex;
    if(selectedValue=='1'){
        const rangeOption = document.getElementById('selectDateRangeId');
        rangeOption.innerHTML = ''; 
        quarterlyRange.forEach(range => {
            const option = document.createElement('option');
            option.value = range;
            option.textContent = range;
            rangeOption.appendChild(option);
        });
    }
    if(selectedValue=='2'){
        const rangeOption = document.getElementById('selectDateRangeId');
        rangeOption.innerHTML = ''; 
        semiannualRange.forEach(range => {
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
        const TypeIndex = selectYear.selectedIndex;
        const index = selectRange.selectedIndex;
        const valorYear = selectYear.value;
        const completeDateSelected =[];
        let startDateSelect;
        let endDateSelect;
        let startDateMonths;
        let endDateMonths;
        if (index === 0) {
            startDateMonths = '-01-01';
            endDateMonths = '-12-31';
        }else if (index === 1) {
            startDateMonths = '-01-01';
            endDateMonths = '-04-01';
        } else if (index === 2) {
            startDateMonths = '-04-01';
            endDateMonths = '-07-01';
        } else if (index === 3) {
            startDateMonths = '-07-01';
            endDateMonths = '-010-01';
        } else if (index === 4) {
            startDateMonths = '-10-01';
            endDateMonths = '-12-31';
        }
        startDateSelect = `${valorYear}${startDateMonths}`;
        endDateSelect = `${valorYear}${endDateMonths}`;
        completeDateSelected[0] = startDateSelect;
        completeDateSelected[1] = endDateSelect;

        return  completeDateSelected;
}

//?--submit btn listener 
document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('submitFilterbtn');
    boton.addEventListener('click', async function () {
        console.log('¡Botón clickeado!');
        const selectProgram = document.getElementById('selectProgramId');
        const selectType = document.getElementById('programTypeId');
        const selectYear = document.getElementById('selectYearRangeId');
        const TypeIndex = selectYear.selectedIndex;
        

        if(TypeIndex!=0){
        const programTypeId = confirmSelection();
        const completeDateSelected = getDateRangeSelected();
        console.log("CSK: ", completeDateSelected[0],completeDateSelected[1]);
        const ids = await getProgramIds(programTypeId);
        console.log("dbValues: ", ids);
        const dbLabels = await getProgramNames(programTypeId);
        console.log("dbLabels: ", dbLabels);

        const dbValuesRaw=  await Promise.all(
            ids.map(id => getByProgramType(id, completeDateSelected[0], completeDateSelected[1]))
        );  
        const totalStudents = await Promise.all(
            ids.map(id => getStudentsPerProgram(id))
        );

        const totalStudentsById = {};
        ids.forEach((id, idx) => {
            totalStudentsById[id] = [totalStudents[idx]];
        });
        const totalStudentsIndirect = await Promise.all(
            ids.map(id => getStudentsIndirectMeasure(id))
        );


        const totalStudentsIndirectById = {};
        ids.forEach((id, idx) => {
            totalStudentsIndirectById[id] = [totalStudentsIndirect[idx]];
        });

    console.log("resultsd: ", dbValuesRaw);
    console.log("Total Students Direct: ", totalStudents);
    console.log("Total Students Indirect: ", totalStudentsIndirect);


        const totalAnswersRaw = await Promise.all(
            ids.map(id => getAnswerPerStudent(id))
        );


        const totalAnswersById = {};
        ids.forEach((id, idx) => {
            totalAnswersById[id] = totalAnswersRaw[idx];
        });
        console.log("Total ANSWERS: ", totalAnswersById);

        //*This is for Final ASSESSMENT analisis
        const totalAnswersRawIndirect = await Promise.all(
            ids.map(id => getAnswerPerStudentIndirect(id))
        );


        const totalAnswersByIdIndirect = {};
        ids.forEach((id, idx) => {
            totalAnswersByIdIndirect[id] = totalAnswersRawIndirect[idx];
        });
        console.log("Total ANSWERS INDIRECT: ", totalAnswersByIdIndirect);


        const resultPerStudent = {};
        for (const [idProgram, studentsArrays] of Object.entries(totalAnswersById)) {
            resultPerStudent[idProgram] = [];
            for (const idResponsesArr of studentsArrays) {
                if (Array.isArray(idResponsesArr) && idResponsesArr.length > 0) {
                    const resultsForStudent = [];
                    for (const idResponse of idResponsesArr) {
                        const result = await getsurveyResults(idProgram, idResponse);
                        if (Array.isArray(result)) {
                            resultsForStudent.push(...result);
                        } else if (result !== undefined) {
                            resultsForStudent.push(result);
                        }
                    }
                    resultPerStudent[idProgram].push(resultsForStudent);
                }
            }
}      
        const resultLinkertPerStudent = {};
        for (const [idProgram, studentsArrays] of Object.entries(totalAnswersByIdIndirect)) {
            resultLinkertPerStudent[idProgram] = [];
            for (const idResponsesArr of studentsArrays) {
                if (Array.isArray(idResponsesArr) && idResponsesArr.length > 0) {
                    const resultsForStudent1 = [];
                    for (const idResponse of idResponsesArr) {
                        const result = await getsurveyIndirectResults( idResponse);

                        if (Array.isArray(result)) {
                            resultsForStudent1.push(...result);
                        } else if (result !== undefined) {
                            resultsForStudent1.push(result);
                        }
                    }
                    resultLinkertPerStudent[idProgram].push(resultsForStudent1);
                }
            }
}     

        console.log("resultPerStudent anidado: ", resultPerStudent);
        console.log("Indirect answers L anidado: ", resultLinkertPerStudent);
        console.log("totalStudentsById Direct anidado: ", totalStudentsById);
        console.log("totalStudentsById Indirect anidado: ", totalStudentsIndirectById);
        const porcentajes = calcularPorcentajeAciertos(resultPerStudent);
        console.log("Porcentaje de aciertos por estudiante:", porcentajes);
        renderResponseAnalysisChart(dbLabels,dbValuesRaw);        }else{

            //!Notificacion
            showNotification("Please select a year", "error");
        }
        
    });
});
//?--Confirmation
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


//! <|-------------------------------- Graph Logic --------------------------------|>

//? Testing Data

////? --Calcula los promedios de aciertos para Disrect Measure
function calcularPorcentajeAciertos(resultPerStudent) {
    const porcentajesPorPrograma = {};
    for (const [idProgram, estudiantes] of Object.entries(resultPerStudent)) {
        porcentajesPorPrograma[idProgram] = estudiantes.map(respuestas => {
            if (!Array.isArray(respuestas) || respuestas.length === 0) return 0;
            const total = respuestas.length;
            const aciertos = respuestas.filter(x => x === 1).length;
            return total > 0 ? aciertos / total : 0;
        });
    }
    return porcentajesPorPrograma;
}


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