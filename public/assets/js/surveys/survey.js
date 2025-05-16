document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("survey-container");
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
        container.innerHTML = "<p style='color: red;'>Token not provided.</p>";
        return;
    }

    const loadSurvey = async () => {
        try {
            const response = await fetch(`../../../src/models/mySurveys.php?action=getSurvey&token=${encodeURIComponent(token)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                container.innerHTML = `<p style="color: red;">${result.message || 'Invalid token or survey not found.'}</p>`;
                return;
            }

            const questions = result.questions;

            if (!questions.length) {
                container.innerHTML = "<p>No questions found for this survey.</p>";
                return;
            }

            let html = `<h2>Survey ID: ${result.survey_id}</h2><ul>`;
            questions.forEach(q => {
                html += `<li><strong>Question ${q.questions_id}:</strong> ${q.question_text}</li>`;
            });
            html += "</ul>";

            container.innerHTML = html;

        } catch (error) {
            container.innerHTML = "<p style='color: red;'>Network error. Try again later.</p>";
        }
    };

    loadSurvey();
});
