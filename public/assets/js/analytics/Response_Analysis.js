//! <|-------------------------------- Fetch Logic --------------------------------|>







//! <|-------------------------------- Graph Logic --------------------------------|>
//? 
function renderResponseAnalysisChart() {
    const ctx = document.getElementById('responseAnalysisChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                "Q1: Teaching effectiveness",
                "Q2: Course materials",
                "Q3: Assignments",
                "Q4: Feedback quality",
                "Q5: Overall satisfaction"
            ],
            datasets: [{
                label: 'Rating',
                data: [4.3, 4.1, 4.2, 3.9, 4.5],
                backgroundColor: '#f28c28',
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

//! <|-------------------------------- Tables Logic --------------------------------|>

//? Initialize DataTable for the response analysis table
$(document).ready(function() { 
    $('#myTable').DataTable();
});


//! <|-------------------------------- Load Logic --------------------------------|>
//? Load the the Respoinse Analysis Chart 
document.addEventListener("DOMContentLoaded", () => {
    renderResponseAnalysisChart();
});



//! <|--------------------------------  --------------------------------|>