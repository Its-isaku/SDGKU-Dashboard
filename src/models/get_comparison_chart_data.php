<?php
//! <|-------------------------------- Config & Headers --------------------------------|>
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//! <|-------------------------------- Helper Functions --------------------------------|>
// ?----Get PRE correct answers per student
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getResults') {
    try {
        $required_params = ['program_id','from','to','surveyType' ,'responses_id'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }

        $program_id = $_GET['program_id'];
        $from = $_GET['from'];
        $to = $_GET['to'];
        $surveyType = $_GET['surveyType'];
        $responses_id = $_GET['responses_id'];

        $sql = "SELECT 
        ROUND((SUM(answers) * 100.0 / COUNT(*)), 2) AS grade
    FROM (
            SELECT 
                CASE 
                    WHEN answers.question_type_id = 1 THEN multiple_options.correct_answer
                    WHEN answers.question_type_id = 5 THEN true_false_options.correct_answer
                END AS answers
            FROM answers
            INNER JOIN responses ON responses.responses_id = answers.response_id 
            INNER JOIN questions ON questions.questions_id = answers.question_id
            LEFT JOIN multiple_options ON multiple_options.id_question = questions.questions_id
            LEFT JOIN true_false_options ON true_false_options.question_id = questions.questions_id
            INNER JOIN surveys ON surveys.survey_id = responses.survey_id 
            WHERE surveys.program_id = ?
            AND (answers.question_type_id = 1 OR answers.question_type_id = 5)
            AND (
                (answers.question_type_id = 1 AND answers.answer_text = multiple_options.display_order)
                OR 
                (answers.question_type_id = 5 AND answers.answer_text = true_false_options.type)
            ) 
            AND (responses.submitted_at BETWEEN ? AND ?) 
            AND surveys.survey_type_id = ? 
            AND answers.response_id = ?
        ) AS evaluated_answers;";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id, $from, $to,$surveyType, $responses_id]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($results === false || !is_array($results)) {
            $results = [];
        }

        echo json_encode([
            'status' => 'success',
            'data' => $results // Siempre un array, aunque vacío
        ]);

    } catch (Exception $e) {
        http_response_code(400); 
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage(),
            'data' => []
        ]);
    }
    exit;
}

// ?----Get responses from survey program
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getResponses') {
    try {
        $required_params = ['program_id','from','to','surveyType'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }

        $program_id = $_GET['program_id'];
        $from = $_GET['from'];
        $to = $_GET['to'];
        $surveyType = $_GET['surveyType'];

        $sql = "SELECT r.responses_id AS responses
                FROM responses r
                INNER JOIN surveys ON surveys.survey_id = r.survey_id
                WHERE surveys.program_id = ? AND surveys.survey_type_id = ?
                AND (r.submitted_at BETWEEN ? AND ?)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id,$surveyType,$from, $to]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($results === false || !is_array($results)) {
            $results = [];
        }

        echo json_encode([
            'status' => 'success',
            'data' => $results // Siempre un array, aunque vacío
        ]);

    } catch (Exception $e) {
        http_response_code(400); 
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage(),
            'data' => []
        ]);
    }
    exit;
}
