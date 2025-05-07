document.addEventListener('DOMContentLoaded', () => {
    fetch('../../../src/models/dashboardMetrics.php')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
          return;
        }
  
        document.getElementById('totalSurveys').textContent = data.totalSurveys;
        document.getElementById('activeSurveys').textContent = data.activeSurveys;
        document.getElementById('responses').textContent = data.responses;
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
      });
  });
  