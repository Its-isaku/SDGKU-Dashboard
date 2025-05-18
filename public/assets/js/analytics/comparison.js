document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('panel3')) {
        renderComparisonChart();
        loadComparisonTable();
    }
});

async function renderComparisonChart() {
    const preSurveyId = document.getElementById("selectCourseId").value;
    const postSurveyId = document.getElementById("selectTypeId").value;
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
    } catch (error) {
        console.error("Error loading chart data:", error);
    }
}


async function loadComparisonTable() {
    const preSurveyId = document.getElementById("selectCourseId").value;
    const postSurveyId = document.getElementById("selectTypeId").value;

    if (!preSurveyId || !postSurveyId) return;

    try {
        const response = await fetch(`../../../src/models/get_survey_comparison.php?pre_survey_id=${preSurveyId}&post_survey_id=${postSurveyId}`);
        const result = await response.json();

        if (result.status === 'success') {
            const tbody = document.querySelector("#comparisonResultsTable tbody");
            tbody.innerHTML = `
                <tr>
                    <td>Overall</td>
                    <td>${result.data.pre_avg}</td>
                    <td>${result.data.post_avg}</td>
                    <td>${result.data.change}%</td>
                </tr>
            `;
        } else {
            console.error("Error:", result.message);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

