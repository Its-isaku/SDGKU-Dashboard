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


//! <|-------------------------------- Chart Logic --------------------------------|>



//? Chart.js Initialization
async function renderComparisonChart() {
    const preSurveyId = 221
    const postSurveyId =220
    
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    try {
        const response = await fetch(`../../../src/models/get_comparison_chart_data.php?pre_survey_id=${preSurveyId}&post_survey_id=${postSurveyId}`);
        const result = await response.json();

        const { labels, pre, post, preAvg, postAvg, change } = result.data;

        document.getElementById("preAvgValue").textContent = `${preAvg.toFixed(2)}%`;
        document.getElementById("postAvgValue").textContent = `${postAvg.toFixed(2)}%`;
        document.getElementById("changeValue").textContent = `${change.toFixed(2)}%`;


        if (labels.length === 0) {
            document.getElementById("comparisonChart").style.display = "none";
            console.warn("No data available for the selected surveys.");
            return;
        }
        else {
            document.getElementById("comparisonChart").style.display = "block";
        }

        if (window.comparisonChartInstance) {
            window.comparisonChartInstance.destroy();
        }

        window.comparisonChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Pre",
                        data: pre,
                        backgroundColor: '#a01c1c',
                        borderRadius: 6
                    },
                    {
                        label: "Post",
                        data: post,
                        backgroundColor: '#f28c28',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            callback: function (value) {
                                return value + "%";
                            }
                        },
                        title: {
                            display: true,
                            text: "Correct Answer Rate (%)"
                        }
                    }
                }
            }
        });
    } catch (error) { //* Mostrar datos falsos si falla el fetch
        console.error("Error loading chart data:", error);
        const labels = ["What is ModelForm used for?",
                        "What is the purpose of settings.py?",
                        "How do you install python flask? ",];
        const pre = [60, 70, 80];
        const post = [80, 85, 90];
        const preAvg = pre.reduce((a, b) => a + b, 0) / pre.length;
        const postAvg = post.reduce((a, b) => a + b, 0) / post.length;
        const change = preAvg > 0 ? ((postAvg - preAvg) / preAvg) * 100 : 0;

        document.getElementById("preAvgValue").textContent = `${preAvg.toFixed(2)}%`;
        document.getElementById("postAvgValue").textContent = `${postAvg.toFixed(2)}%`;
        document.getElementById("changeValue").textContent = `${change.toFixed(2)}%`;

        if (window.comparisonChartInstance) {
            window.comparisonChartInstance.destroy();
        }
        window.comparisonChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Pre",
                        data: pre,
                        backgroundColor: '#a01c1c',
                        borderRadius: 6
                    },
                    {
                        label: "Post",
                        data: post,
                        backgroundColor: '#f28c28',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            callback: function (value) {
                                return value + "%";
                            }
                        },
                        title: {
                            display: true,
                            text: "Correct Answer Rate (%)"
                        }
                    }
                }
            }
        });
    }
}

//! <|-------------------------------- Table Logic --------------------------------|>

//? Table Rendering
async function loadComparisonTable() {
    const preSurveyId = dbPreSurveyId
    const postSurveyId = dbPostSurveyId

    if (!preSurveyId || !postSurveyId) return;

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
        console.error("Fetch error:", err);
    }
}

//! <|-------------------------------- Load Logic --------------------------------|>
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('panel3')) {
        renderComparisonChart();
        loadComparisonTable();
    }
});
