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
    return gap;
}
function getAverage(results) {
        if (!results || results.length === 0) {
            return 0;
        }
        
        let sum = 0;
        let count = 0;

        for(let i = 0; i < results.length; i++) {
            const value = Number(results[i]); 
            if (results[i]!== null && !isNaN(value)) {
                sum += value;
                count++;
            }
        }
        if (count === 0) return 0;
        const promedio = Number((sum / count).toFixed(2));
        return promedio;
}
function getAverageAll(results,indexs) {
        if (!results || results.length === 0) {
            return 0;
        }
        
        let sum = 0;
        let count = 0;

        for(let i = 0; i < results.length; i++) {
            const value = Number(results[i]); 
            if (results[i]!== null && !isNaN(value)) {
                if(indexs[i] != null){
                sum += value;
                count++;
            }
        }
    }
        if (count === 0) return 0;
        const promedio = Number((sum / count).toFixed(2));
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
//? Fill select with years 
document.addEventListener('DOMContentLoaded', function() {
        filterLogic();

    });
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
            if(TypeIndex!=0){
                showLoadingModal();
            if(programIndex!=0){
                const indexProgramId = programIndex-1;
                const allResultPre= await getResultsPerProgram(ids, from, to, pre);
                const allResultPost= await getResultsPerProgram(ids, from, to, post);
                const resultPre = allResultPre[indexProgramId];
                const resultPost = allResultPost[indexProgramId];
                const preToSend = buildArrayIdsNulls(ids, indexProgramId, resultPre);
                const postToSend = buildArrayIdsNulls(ids, indexProgramId,resultPost);
                const avgGap = getAvgGap(resultPre,resultPost);   
                const avgToSend = buildArrayIdsNulls(ids, indexProgramId, avgGap);
                preAvgValue.textContent = resultPre + "%";
                postAvgValue.textContent = resultPost + "%";
                changeValue.textContent = avgGap + "%";
                if(avgGap<0){
                    changeValue.style.color = "red";
                }else{
                    changeValue.style.color = "green";
                }
                analisisTable(labels,preToSend,postToSend,avgToSend);
                
                
                }else if(programIndex===0){
                    const allResultPre= await getResultsPerProgram(ids, from, to, pre);
                    const allResultPost= await getResultsPerProgram(ids, from, to, post);
                    const resultGat = getGap(allResultPre,allResultPost);
                    const getPreGlobalAverages=getAverageAll(allResultPre,allResultPost);
                    const getPostGlobalAverages=getAverageAll(allResultPost,allResultPre);
                    const getGlobalAverage = getAvgGap(getPreGlobalAverages,getPostGlobalAverages);
                    
                    preAvgValue.textContent = getPreGlobalAverages + "%";
                    postAvgValue.textContent = getPostGlobalAverages + "%";
                    changeValue.textContent = getGlobalAverage + "%";
                    if(getGlobalAverage<0){
                        changeValue.style.color = "red";
                    }else{
                        changeValue.style.color = "green";
                    }
                    analisisTable(labels,allResultPre,allResultPost,resultGat);     

            }
            hideLoadingModal();
        }else{
            //!Notificacion
            showNotification("Please select a year", "error");
        }
    });

});

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
//! <|-------------------------------- Load Logic --------------------------------|>
function analisisTable(labels, preValues = [], postValues = [], gapValues = []) {
    // Verificar que el canvas exista
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) {
        console.error(`Canvas Error`);
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
                    barPercentage: 0.80,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Post',
                    backgroundColor: '#F4971D',
                    data: postValues,
                    hidden: !postValues || postValues.length === 0 || postValues.every(val => val === null || val === undefined),
                    barPercentage: 0.80,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Gap',
                    backgroundColor: '#10b981',
                    data: gapValues,
                    hidden: !gapValues || gapValues.length === 0 || gapValues.every(val => val === null || val === undefined),
                    barPercentage: 0.80,
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

    // Crear la grafica
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, config);
}

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
        console.error("Error in getProgramNames:", error);
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

        throw new Error(data.message || 'Error with data');
    } catch (error) {
        console.error("Error in getProgramIds:", error);
        throw error;
    }
}

//? get all the responses result of a specific program
//!----
async function getResultsPerProgram(program_ids, from, to, surveyType) {
    const url = new URL('/SDGKU-Dashboard/src/models/get_comparison_chart_data.php', window.location.origin);
    url.searchParams.append('action', 'getResultsPerProgram');
    
    program_ids.forEach(id => {
        url.searchParams.append('program_id[]', id);
    });
    
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);
    url.searchParams.append('surveyType', surveyType);

    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Error HTTP! estado: ${res.status}`);
        const data = await res.json();
        
        if (data.status === 'success') {
            return program_ids.map(programId => {
                // Verificar explícitamente si la propiedad existe
                if (!data.data.hasOwnProperty(programId)) return null;
                
                const grades = data.data[programId];
                
                // Caso especial: array vacío (no hay datos)
                if (grades.length === 0) return null;
                
                // Calcular promedio incluyendo ceros
                const sum = grades.reduce((acc, grade) => acc + grade, 0);
                const average = parseFloat((sum / grades.length).toFixed(2));
                
                return average;
            });
        }
        
        throw new Error(data.message || 'Error with data');
    } catch (error) {
        console.error('Error en getsurveyResults:', error);
        return program_ids.map(() => null);
    }
}


//? Modal Logic
const loadingModal = document.getElementById('loading-modal');
const closeModalBtn = document.querySelector('#loading-modal .close-modal');

function showLoadingModal() {
    if (loadingModal) loadingModal.style.display = 'flex';
}

function hideLoadingModal() {
    if (loadingModal) loadingModal.style.display = 'none';
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideLoadingModal);
}
