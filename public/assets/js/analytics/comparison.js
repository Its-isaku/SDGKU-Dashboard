//! <|-------------------------------- Global Variables --------------------------------|>

//? Variables to store the data for the chart
let dbPreSurveyId = 0
let dbPostSurveyId = 0

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

//! <|-------------------------------- Filter Logic --------------------------------|>
//? Fill select with years 
document.addEventListener('DOMContentLoaded', function() {
        filterLogic();

    });
function filterLogic(){
    let dateRangeOption = ['Annual', 'Semiannual','Quarterly'];
 const select = document.getElementById('selectYearRangeIdComparison');
        const currentYear = new Date().getFullYear();
        const startYear = 2020;
        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        }
        select.addEventListener('change', async function () {
            console.log("event1");
        const dateRange = document.getElementById('selectRangeTypeIdComparison');
        const selectedRange = dateRange.selectedIndex;
        dateRange.innerHTML = '';
            dateRangeOption.forEach(range => {
            const option = document.createElement('option');
            option.value = range;
            option.textContent = range;
            dateRange.appendChild(option);
        });
        });

let quarterlyRange=['Select quarterly range','January - March','April - June','July - September','October - December'];
let semiannualRange=['Select semiannual range','January - June','July - December'];
 const selectElement = document.getElementById('selectRangeTypeIdComparison');
    selectElement.addEventListener('change', async function () {
        console.log("event3");
    const selectedValue = selectElement.selectedIndex;
    console.log("select",selectedValue);
    
    if(selectedValue== '0'){
        const rangeOption = document.getElementById('selectDateRangeIdComparison');
        rangeOption.innerHTML = ''; 
    }
    if(selectedValue=='1'){
        console.log("Semiannual");
        const rangeOption = document.getElementById('selectDateRangeIdComparison');
        rangeOption.innerHTML = ''; 
        semiannualRange.forEach(range => {
            const option = document.createElement('option');

            option.value = range;
            option.textContent = range;
            rangeOption.appendChild(option);
        });
    }
    if(selectedValue=='2'){
        
        const rangeOption = document.getElementById('selectDateRangeIdComparison');
        rangeOption.innerHTML = ''; 
        quarterlyRange.forEach(range => {
            const option = document.createElement('option');
            console.log("Range",range);
            option.value = range;
            option.textContent = range;
            rangeOption.appendChild(option);
        });
    }
    });

    const selectElementType = document.getElementById('programTypeIdComparison');
    selectElementType.addEventListener('change', async function () {
        console.log("event4");
    const selectedValue = selectElementType.selectedIndex;
    const dbLabels = await getProgramNamesComparison(selectedValue);
    const programOption = document.getElementById('programIdComparison');
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
}
//?Get Date selected on filters
function getDateRangeSelectedComparison(){
        const selectRange = document.getElementById('selectDateRangeIdComparison');
        const selectYear = document.getElementById('selectYearRangeIdComparison');
        const SelectRangeSemi = document.getElementById('selectRangeTypeIdComparison');
        const TypeIndex = selectYear.selectedIndex;
        const index = selectRange.selectedIndex;
        const valorYear = selectYear.value;
        const completeDateSelected =[];
        const semiOrQuarterly = SelectRangeSemi.selectedIndex;
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

    function confirmSelectionComparison(){

        const selectType = document.getElementById('programTypeIdComparison');
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


//! <|-------------------------------- Chart Logic --------------------------------|>
function getGap(preValues, postValues){
    if (!preValues || !postValues || preValues.length === 0 || postValues.length === 0) {
        return [];
    }

    const gap = [];
    for (let i = 0; i < preValues.length; i++) {
        const pre = Number(preValues[i]);
        const post = Number(postValues[i] || 0);
        let difference = Number((pre - post).toFixed(2));
        if(difference == pre){
            difference = 0;
        }
        if(difference!=0){
            difference = difference * (-1);
        }
        
        gap.push(difference);
    }
    console.log("GAP values:", gap);
    return gap;
}
function getAverage(results) {
        if (!results || results.length === 0) {
            return 0;
        }
        
        let sum = 0;
        results.forEach(r => {
            sum += Number(r);
        });
        
        const promedio = Number((sum / results.length).toFixed(2));
        console.log("Average calculated:", promedio);
        return promedio;
}

function getAvgGap(pre, post){
    let gap = Number((pre - post).toFixed(2));
    if(gap == pre){
        gap = 0;
    }
    if(gap != 0){
        gap = gap * (-1);
    }

    return gap;
}
// comparisonChart



//! <|-------------------------------- Table Logic --------------------------------|>

//? Table Rendering
document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('submitFilterbtnComparison');
    boton.addEventListener('click', async function () {
        const pre = 1;
        const post = 2;
        const selectProgram = document.getElementById('programIdComparison');
        const selectYear = document.getElementById('selectYearRangeIdComparison');
        const TypeIndex = selectYear.selectedIndex;
        const programIndex = selectProgram.selectedIndex;
        try{
            if(TypeIndex!=0){
                const completeDateSelected = getDateRangeSelectedComparison();
                const programTypeId = confirmSelectionComparison();
                const ids = await getProgramIdsComparison(programTypeId);
                const labels = await getProgramNamesComparison(programTypeId);
                console.log("IDS: ",ids);
                console.log("LABELS: ",labels);
                const indexProgramId = programIndex-1;
                const programId = ids[indexProgramId];
                //Fechas
                const from = completeDateSelected[0];
                const to = completeDateSelected[1];
                console.log("DATE: ",completeDateSelected);
                console.log("programId: ",programId);
                console.log("Responses: ",from);
                console.log("Responses: ",to);
                const preResponses_id = await getResponses(programId,pre,from, to);
                console.log("Responses: ",preResponses_id);
                const postResponses_id = await getResponses(programId,post,from, to);
                console.log("Responses: ",postResponses_id);
                const preValues =  await Promise.all(
                    preResponses_id.map(responses => getResults(programId, from,to,pre,responses))
                );
                const postValues =  await Promise.all(
                    postResponses_id.map(responses => getResults(programId, from, to,post,responses))
                );
                console.log("preValues: ",preValues);
                console.log("postValues: ",postValues);
                const averagePre = getAverage(preValues);
                console.log("Pre AVG: ", averagePre);
                const averagePost = getAverage(postValues);
                console.log("Post AVG: ",averagePost);
                const gap = getGap(preValues,postValues);
                console.log("GAP: ", gap);
                const avgGap = getAvgGap(averagePre,averagePost);
                console.log("AVGGAP: ",avgGap);
                analisisTable(labels,preValues,postValues,gap);
                const allPreResponses = await getAllProgramsPreResponses(ids, from, to);
                console.log("allPreResponses: ", allPreResponses);
                const allPostResponses = await getAllProgramsPostResponses(ids, from, to); // Corregido: llamar a PostResponses en lugar de PreResponses
                console.log("allPostResponses: ", allPostResponses);
                const r1 = getResults(21,from,to,pre,920);
                const r2 = getResults(21,from,to,pre,919);
                const r3 = getResults(20,from,to,pre,918);
                const r4 = getResults(20,from,to,pre,917);
                const r5 = getResults(19,from,to,pre,903);  
                console.log("R: ",r1);
                console.log("R: ",r2);
                console.log("R: ",r3);
                console.log("R: ",r4);
                console.log("R: ",r5);             
            }
        }catch(err){
            console.error("Fetch error:", err);
        }
    });

});


async function processAllProgramsResponses(programIds, from, to, surveyType, allResponses) {
    try {
        // Validación de parámetros
        if (!Array.isArray(programIds)) throw new Error('programIds debe ser un array');
        if (!Array.isArray(allResponses)) throw new Error('allResponses debe ser un array de arrays');
        
        // Asegurar que ambos arrays tengan la misma longitud
        const length = Math.min(programIds.length, allResponses.length);
        
        // Procesar todos los programas
        const results = [];
        
        for (let i = 0; i < length; i++) {
            const programId = programIds[i];
            const responseGroup = allResponses[i];
            
            // Validar el grupo actual
            if (!programId || !Array.isArray(responseGroup)) {
                console.warn(`Datos inválidos en índice ${i}`);
                results.push([0]);
                continue;
            }
            
            // Procesar cada respuesta del grupo actual
            const groupResults = [];
            
            for (const responseId of responseGroup) {
                try {
                    const response = await getResults(programId, from, to, surveyType, responseId);
                    // Extraer el primer valor de grade o usar 0 como fallback
                    const grade = response?.[0]?.grade ?? 0;
                    groupResults.push(grade);
                } catch (error) {
                    console.error(`Error procesando programa ${programId}, respuesta ${responseId}:`, error);
                    groupResults.push(0);
                }
            }
            
            results.push(groupResults.length > 0 ? groupResults : [0]);
        }
        
        return results;
        
    } catch (error) {
        console.error('Error en processAllProgramsResponses:', error);
        // Devolver estructura consistente en caso de error
        return allResponses.map(() => [0]);
    }
}

//? Get all programs pre responses
async function getAllProgramsPreResponses(allProgramId,from,to){
    const allPrograms = []; 
    const pre = 1;
    
    for(let i = 0; i < allProgramId.length; i++){
        // Obtener respuestas pre
        const preResponses = await getResponses(allProgramId[i], pre, from, to);
        if (preResponses && preResponses.length > 0) {
            allPrograms.push(preResponses); 
        }
    }
    
    console.log("Program responses:", allPrograms);
    return allPrograms;
}


//? Get all programs post responses
async function getAllProgramsPostResponses(allProgramId,from,to){
    const allPrograms = []; 
    const post = 2;
    
    for(let i = 0; i < allProgramId.length; i++){
        // Obtener respuestas pre
        const preResponses = await getResponses(allProgramId[i], post, from, to);
        if (preResponses && preResponses.length > 0) {
            allPrograms.push(preResponses); 
        }
    }
    
    console.log("Program responses:", allPrograms);
    return allPrograms;
}
async function loadComparisonTable() {
    try {
        const response = await fetch(`../../../src/models/get_comparison_chart_data.php?pre_survey_id=${preSurveyId}&post_survey_id=${postSurveyId}`);
        const result = await response.json();

        if (result.status === 'success') {
            const tbody = document.querySelector("#comparisonResultsTable tbody");
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td>Overall</td>
                        <td>${result.data.pre_avg}</td>
                        <td>${result.data.post_avg}</td>
                        <td>${result.data.change}%</td>
                    </tr>
                `;
            }
        } else {
            console.error("Error:", result.message);
        }
    } catch (err) {
        
    }
}

//! <|-------------------------------- Load Logic --------------------------------|>
function analisisTable(labels, preValues = [], postValues = [], gapValues = []) {
    // Verificar que el canvas exista
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) {
        console.error(`No se encontró el canvas con ID`);
        return;
    }
// Obtener la instancia del gráfico existente
    const chartInstance = Chart.getChart(canvas);
    
    // Destruir el gráfico anterior si existe
    if (chartInstance) {
        chartInstance.destroy();
    }
    // Configuración de la gráfica
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pre',
                    backgroundColor: '#BB2626',
                    data: preValues,
                    hidden: !preValues || preValues.length === 0 || preValues.every(val => val === null || val === undefined),
                    barPercentage: 0.50,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Post',
                    backgroundColor: '#F4971D',
                    data: postValues,
                    hidden: !postValues || postValues.length === 0 || postValues.every(val => val === null || val === undefined),
                    barPercentage: 0.50,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Gap',
                    backgroundColor: '#10b981',
                    data: gapValues,
                    hidden: !gapValues || gapValues.length === 0 || gapValues.every(val => val === null || val === undefined),
                    barPercentage: 0.50,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Average (%)'
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Programs'
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        color: function(context) {
                            // Dibujar línea divisoria solo entre diferentes grupos
                            return context.index === labels.length - 1 ? 'transparent' : 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: 1,
                        borderDash: [3, 3]
                    },
                    ticks: {
                        padding: 10
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            elements: {
                bar: {
                    borderWidth: 0,
                    borderRadius: 4
                }
            }
        }
    };

    // Crear la gráfica
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, config);
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('panel3')) {
        // renderComparisonChart();
        // loadComparisonTable();
    }
});
//?Get programs Names
async function getProgramNamesComparison(programTypeId) {
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
//?Get Programs ID
async function getProgramIdsComparison(programTypeId) {
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
//?-----get the PRE results of every survey multi and true/false
async function getResults(program_id, from, to, surveyType, responses_id) {
    console.log('getResults called with:', {
        program_id,
        from,
        to,
        surveyType,
        responses_id
    });

    const url = new URL('/SDGKU-Dashboard/src/models/get_comparison_chart_data.php', window.location.origin);
    url.searchParams.append('action', 'getResults');
    url.searchParams.append('program_id', program_id);
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);
    url.searchParams.append('surveyType', surveyType);
    url.searchParams.append('responses_id', responses_id);

    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Error HTTP! estado: ${res.status}`);
        const data = await res.json();
        if (data.status === 'success') {
            if (Array.isArray(data.data)) {
                return data.data.map(item => item.grade);
            } else if (data.data && Array.isArray(data.data.grade)) {
                return data.data.grade;
            } else if (data.data && data.data.grade !== undefined) {
                return [data.data.grade];
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
//? Get Responses
async function getResponses(program_id, surveyType,from, to) {
    const url = new URL('/SDGKU-Dashboard/src/models/get_comparison_chart_data.php', window.location.origin);
    url.searchParams.append('action', 'getResponses');
    url.searchParams.append('program_id', program_id);
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);
    url.searchParams.append('surveyType', surveyType);
    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Error HTTP! estado: ${res.status}`);
        const data = await res.json();
        if (data.status === 'success') {
            if (Array.isArray(data.data)) {
                return data.data.map(item => item.responses);
            } else if (data.data && Array.isArray(data.data.responses)) {
                return data.data.responses;
            } else if (data.data && data.data.responses !== undefined) {
                return [data.data.responses];
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