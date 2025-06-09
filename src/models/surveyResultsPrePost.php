<?php
//! <|-------------------------------- Config & Headers --------------------------------|>
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//?Get all califications for a specific survey
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getResultsPerSurvey') {
    try {
        $required_params = ['from', 'to', 'surveyId'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }

        $surveyId = $_GET['surveyId'];
        $from = $_GET['from'];
        $to = $_GET['to'];
        
        $results = [];   
        $sql1 = "SELECT responses.responses_id
                FROM responses
                INNER JOIN surveys ON surveys.survey_id = responses.survey_id
                WHERE surveys.survey_id = ?
                AND (responses.submitted_at BETWEEN ? AND ?)";

        $stmt1 = $pdo->prepare($sql1);
        $stmt1->execute([$surveyId, $from, $to]);
        $responses = $stmt1->fetchAll(PDO::FETCH_ASSOC);

            $sql2 = "SELECT 
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
                    WHERE (answers.question_type_id = 1 OR answers.question_type_id = 5)
                    AND (
                        (answers.question_type_id = 1 AND answers.answer_text = multiple_options.display_order)
                        OR 
                        (answers.question_type_id = 5 AND answers.answer_text = true_false_options.type)
                    ) 
                    AND answers.response_id = ?
                ) AS evaluated_answers";

            $stmt2 = $pdo->prepare($sql2);
        $grades = [];
        foreach ($responses as $response) {
            $stmt2->execute([$response['responses_id']]);
            $grade = $stmt2->fetch(PDO::FETCH_ASSOC);
            
            if ($grade && isset($grade['grade'])) {
                $grades[] = (float)$grade['grade'];
            }
        }

        echo json_encode([
            'status' => 'success',
            'data' => $grades
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


if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getPrePostSurveyResults') {
    try {
        $required_params = ['from', 'to', 'surveyId'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }


        $surveyId = $_GET['surveyId'];
        $from = $_GET['from'];
        $to = $_GET['to'];        // Use the existing PDO connection
        $stmt1 = $pdo->prepare("
            SELECT 
                r.respondent_email,
                r.submitted_at
            FROM responses r
            INNER JOIN answers a ON a.response_id = r.responses_id
            INNER JOIN questions q ON q.questions_id = a.question_id
            WHERE q.survey_id = ? AND r.submitted_at BETWEEN ? AND ?
            GROUP BY r.respondent_email, r.submitted_at
        ");
        $stmt1->execute([$surveyId, $from, $to]);
        $respondents = $stmt1->fetchAll(PDO::FETCH_ASSOC);

        $results = [];

        $stmt2 = $pdo->prepare("
            SELECT 
                q.question_text,
                a.answer_text
            FROM questions q
            INNER JOIN answers a ON a.question_id = q.questions_id
            INNER JOIN responses r ON r.responses_id = a.response_id
            WHERE q.survey_id = ?
            AND r.respondent_email = ?
            AND r.submitted_at = ?
            AND a.question_type_id = 4
        ");

        foreach ($respondents as $respondent) {
            $stmt2->execute([
                $surveyId,
                $respondent['respondent_email'],
                $respondent['submitted_at']
            ]);
            $answers = $stmt2->fetchAll(PDO::FETCH_ASSOC);        
            $resultItem = [
                'email' => $respondent['respondent_email'],
                'submitted_at' => $respondent['submitted_at'],
                'answers' => $answers
            ];

            $results[] = $resultItem;
        }

        // Return success response
        echo json_encode([
            'success' => true,
            'data' => $results
        ]);

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }    exit;
}
