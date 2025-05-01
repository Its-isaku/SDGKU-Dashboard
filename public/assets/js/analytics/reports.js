const reportsData = [
    {
        title: "Introduction to Computer Science Pre-Course Assessment",
        tag1: { label: "Pre-Course", class: "pre-course" },
        tag2: { label: "Inactive", class: "inactive" },
        description: "Please complete this survey before the course",
        created: "Jan 04 2025",
        questions: 3
    },
    {
        title: "Teacher-Evaluation - Programming Fundamentals",
        tag1: { label: "Teacher-Eval", class: "teacher-eval" },
        tag2: { label: "Inactive", class: "inactive" },
        description: "Please evaluate your instructor for this course",
        created: "Jan 04 2025",
        questions: 3
    },
    {
        title: "Introduction to Computer Science Pre-Course Assessment",
        tag1: { label: "Pre-Course", class: "pre-course" },
        tag2: { label: "Inactive", class: "inactive" },
        description: "Please complete this survey before the course",
        created: "Jan 04 2025",
        questions: 3
    },
    {
        title: "Teacher-Evaluation - Programming Fundamentals",
        tag1: { label: "Teacher-Eval", class: "teacher-eval" },
        tag2: { label: "Inactive", class: "inactive" },
        description: "Please evaluate your instructor for this course",
        created: "Jan 04 2025",
        questions: 3
    }
];

function renderReportCards() {
    const container = document.querySelector('.reports');
    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'reportCardsContainer';

    reportsData.forEach(report => {
        const card = document.createElement('div');
        card.className = 'reportCard';

        card.innerHTML = `
            <div class="reportTags">
                <span class="reportTag ${report.tag1.class}">${report.tag1.label}</span>
                <span class="reportTag ${report.tag2.class}">${report.tag2.label}</span>
            </div>
            <h4>${report.title}</h4>
            <p>${report.description}</p>
            <div class="reportCardDetails">
                <span><i class="fa-solid fa-calendar-plus"></i> Created: ${report.created}</span>
                <span><i class="fa-solid fa-clipboard-list"></i> ${report.questions} questions</span>
            </div>
            <button class="downloadBtn">Download results</button>
        `;

        cardsWrapper.appendChild(card);
    });

    container.appendChild(cardsWrapper);
}

document.addEventListener("DOMContentLoaded", () => {
    renderReportCards();
});