<?php
//! <|-------------------------------- Config & Headers --------------------------------|>
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');
//! <|-------------------------------- Helper Functions --------------------------------|>

//?----Get all results when POST results exists 
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getResultsPerProgram') {
    try {
        $required_params = ['from', 'to', 'surveyType'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }

        if (!isset($_GET['program_id'])) {
            throw new Exception("Missing required parameter: program_id");
        }

        $program_ids = is_array($_GET['program_id']) ? $_GET['program_id'] : [$_GET['program_id']];
        $from = $_GET['from'];
        $to = $_GET['to'];
        $surveyType = $_GET['surveyType'];

        $results = [];
        if($surveyType ==1){
            $surveyType2 = 2;
        }else{
            $surveyType2 = 1;
        }
        foreach ($program_ids as $program_id) {
        $sql1 = "SELECT responses.responses_id
        FROM responses
        INNER JOIN surveys ON surveys.survey_id = responses.survey_id
        WHERE surveys.program_id = ?
        AND surveys.survey_type_id = ?
        AND surveys.status = 'active'
        AND responses.respondent_email IN (
            SELECT DISTINCT r2.respondent_email
            FROM responses r2
            INNER JOIN surveys s2 ON s2.survey_id = r2.survey_id
            WHERE s2.program_id = ? AND s2.survey_type_id = ? AND s2.status = 'active' AND r2.submitted_at BETWEEN ? AND ?  )
        AND (responses.submitted_at BETWEEN ? AND ? )
        UNION
        SELECT responses.responses_id
        FROM responses
        INNER JOIN surveys ON surveys.survey_id = responses.survey_id
        WHERE surveys.program_id = ?
        AND surveys.survey_type_id = ?
        AND surveys.status = 'active'
        AND (responses.submitted_at BETWEEN ? AND ?)
        AND NOT EXISTS (
            SELECT ?
            FROM responses r2
            INNER JOIN surveys s2 ON s2.survey_id = r2.survey_id
            WHERE s2.program_id = ? AND s2.survey_type_id = ? AND s2.status = 'active' AND r2.submitted_at BETWEEN ? AND ?
        )";
            $stmt1 = $pdo->prepare($sql1);
        
            $stmt1->execute([
                $program_id, 
                $surveyType,
                $program_id,
                $surveyType2, 
                $from, 
                $to,
                
                $from, 
                $to,
                
                $program_id, 
                $surveyType,
                $from, 
                $to,
                1,
                $program_id, 
                $surveyType2, 
                $from, 
                $to
            ]);

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

            $results[$program_id] = $grades;
        }

        echo json_encode([
            'status' => 'success',
            'data' => $results // Objeto con program_id como keys
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
?>