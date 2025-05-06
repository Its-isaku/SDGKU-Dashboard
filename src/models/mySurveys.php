<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//el get de las surveys:
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getSurveys') {
    try {
        $sql = "SELECT 
            survey_types.type_name AS type,
            surveys.status,
            surveys.title,
            surveys.description,
            surveys.created_at AS createdDate,
            surveys.expires_at AS expires,
            program_types.program_name AS program,
            cohort.cohort AS cohort,
            COUNT(questions.survey_id) AS questions
        FROM surveys
        INNER JOIN survey_types ON surveys.survey_type_id = survey_types.survey_type_id
        INNER JOIN program_types ON surveys.program_type_id = program_types.program_type_id
        INNER JOIN cohort ON surveys.cohort_id = cohort.cohort_id
        LEFT JOIN questions ON surveys.survey_id = questions.survey_id
        GROUP BY 
            survey_types.type_name,
            surveys.status,
            surveys.title,
            surveys.description,
            surveys.created_at,
            surveys.expires_at,
            program_types.program_name,
            cohort.cohort";
    
        $stmt = $pdo->query($sql);
        $surveys = $stmt->fetchAll();
        echo json_encode($surveys);
    
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
        exit;
    }
}


?>
