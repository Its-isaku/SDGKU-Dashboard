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
        const preAvgValue = document.getElementById('preAvgValue');
        const postAvgValue = document.getElementById('postAvgValue');
        const changeValue = document.getElementById('changeValue');
        const completeDateSelected = getDateRangeSelectedComparison();
        const programTypeId = confirmSelectionComparison();
        const ids = await getProgramIdsComparison(programTypeId);
        const labels = await getProgramNamesComparison(programTypeId);
        const from = completeDateSelected[0];
        const to = completeDateSelected[1];

        try{
            if(TypeIndex===0){

            }
            else if(programIndex!=0 && TypeIndex>0){
                const indexProgramId = programIndex-1;
                const programId = ids[indexProgramId];
                const preResponses_id = await getResponses(programId,pre,from, to);
                const postResponses_id = await getResponses(programId,post,from, to);
                const preValues =  await Promise.all(
                    preResponses_id.map(responses => getResults(programId, from,to,pre,responses))
                );
                const postValues =  await Promise.all(
                    postResponses_id.map(responses => getResults(programId, from, to,post,responses))
                );
                const averagePre = getAverage(preValues);
                const averagePost = getAverage(postValues);
                const gap = getGap(preValues,postValues);
                const avgGap = getAvgGap(averagePre,averagePost);           
                preAvgValue.textContent = averagePre + "%";
                postAvgValue.textContent = averagePost + "%";
                changeValue.textContent = avgGap + "%";
                if(avgGap<0){
                    changeValue.style.color = "red";
                }else{
                    changeValue.style.color = "green";
                }
                const preToSend = buildArrayIdsNulls(ids, indexProgramId, averagePre);
                const postToSend = buildArrayIdsNulls(ids, indexProgramId, averagePost);
                const avgToSend = buildArrayIdsNulls(ids, indexProgramId, avgGap);
                analisisTable(labels,preToSend,postToSend,avgToSend);
                }else if(programIndex===0 && TypeIndex>0){

                    const allPreResponses = await getAllProgramsPreResponses(ids, from, to);
                    const allPostResponses = await getAllProgramsPostResponses(ids, from, to); // Corregido: llamar a PostResponses en lugar de PreResponses
                    const allAveragesPre = await getAllAverages(ids, from, to, pre, allPreResponses);
                    const allAveragesPost = await getAllAverages(ids, from, to, post, allPostResponses);
                    const resultAvgPre=getAllAveragesByProgram(allAveragesPre);
                    const resultAvgPost=getAllAveragesByProgram(allAveragesPost);
                    const resultGat = getGap(resultAvgPre,resultAvgPost);
                    const getPreGlobalAverages=getAverage(resultAvgPre);
                    const getPostGlobalAverages=getAverage(resultAvgPost);
                    const getGlobalAverage = getAvgGap(getPreGlobalAverages,getPostGlobalAverages);
                    preAvgValue.textContent = getPreGlobalAverages + "%";
                    postAvgValue.textContent = getPostGlobalAverages + "%";
                    changeValue.textContent = getGlobalAverage + "%";
                    if(getGlobalAverage<0){
                        changeValue.style.color = "red";
                    }else{
                        changeValue.style.color = "green";
                    }
                    analisisTable(labels,resultAvgPre,resultAvgPost,resultGat);
                    
            }

        }catch(err){
            console.error("Fetch error:", err);
        }
    });

});
//?calculate the complete Avergages of each program
function getAllAveragesByProgram(programAvg){
    const result = [];
    for(let i = 0; i < programAvg.length; i++){
        let sum = 0;
        let count = 0;
        
        if (!Array.isArray(programAvg[i]) || programAvg[i].length === 0) {
            result[i] = 0;
            continue;
        }


        const flatValues = programAvg[i].flat();
        
        for(let j = 0; j < flatValues.length; j++){
            const value = Number(flatValues[j]);
    
            if (!isNaN(value)) {
                sum += value;
                count++;
            }
        }
        
    
        result[i] = count > 0 ? Number((sum / count).toFixed(2)) : 0;
        
        console.log(`Program ${i}: sum=${sum}, count=${count}, avg=${result[i]}`);
    }
    

    return result;
}

//? build the array needed when a specific program has been chosen
function buildArrayIdsNulls(ids, indexProgramId, programId){
    const toSend = [];
    for(let i = 0; i < ids.length; i++) {
        if(i === indexProgramId) {
            toSend[i] = programId;
        } else {
            toSend[i] = 0;
        }
    }
    return toSend;
}
//? get all averages when of all programs availables
async function getAllAverages(programId, from, to, type, allPreResponses) {

    if (!Array.isArray(programId) || !Array.isArray(allPreResponses)) {
        return [];
    }

    const maxLength = Math.max(programId.length, allPreResponses.length);
    
    const normalizedProgramIds = Array(maxLength).fill(0).map((_, i) => programId[i] || 0);
    const normalizedResponses = Array(maxLength).fill(0).map((_, i) => allPreResponses[i] || []);

    const allAverages = [];

    for (let i = 0; i < maxLength; i++) {
        const currentProgramId = normalizedProgramIds[i];
        const currentResponses = normalizedResponses[i];

        if (!currentProgramId || !currentResponses || currentResponses.length === 0) {
            allAverages.push([0]);
            continue;
        }

        const programResults = [];
        
        for (const responseId of currentResponses) {
            try {
                const results = await getResults(
                    currentProgramId, 
                    from, 
                    to, 
                    type, 
                    responseId
                );
                
        
                if (results && results.length > 0) {
                    programResults.push(...results);
                } else {
                    programResults.push(0);
                }
            } catch (error) {
                console.error(`Error obteniendo resultados para programa ${currentProgramId}, respuesta ${responseId}:`, error);
                programResults.push(0); // Agregar 0 en caso de error
            }
        }


        allAverages.push(programResults.length > 0 ? programResults : [0]);
    }

    return allAverages;
}

//? Get all programs pre responses
async function getAllProgramsPreResponses(allProgramId,from,to){
    const allPrograms = []; 
    const pre = 1;
    
    for(let i = 0; i < allProgramId.length; i++){
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
// Obtener la instancia del grafico existente
    const chartInstance = Chart.getChart(canvas);
    
    // Destruir el grfico anterior si existe
    if (chartInstance) {
        chartInstance.destroy();
    }
    // Configuracio de la grafica
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