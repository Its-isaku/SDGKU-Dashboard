<?php
//! <|-------------------------------- Config & Headers --------------------------------|>
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//! <|-------------------------------- Helper Functions --------------------------------|>
// ?----Get PRE correct answers per student
// if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getResults') {
//     try {
//         $required_params = ['program_id','from','to','surveyType' ,'responses_id'];
//         foreach ($required_params as $param) {
//             if (!isset($_GET[$param])) {
//                 throw new Exception("Missing required parameter: $param");
//             }
//         }

//         $program_id = $_GET['program_id'];
//         $from = $_GET['from'];
//         $to = $_GET['to'];
//         $surveyType = $_GET['surveyType'];
//         $responses_id = $_GET['responses_id'];

//         $sql = "SELECT 
//         ROUND((SUM(answers) * 100.0 / COUNT(*)), 2) AS grade
//     FROM (
//             SELECT 
//                 CASE 
//                     WHEN answers.question_type_id = 1 THEN multiple_options.correct_answer
//                     WHEN answers.question_type_id = 5 THEN true_false_options.correct_answer
//                 END AS answers
//             FROM answers
//             INNER JOIN responses ON responses.responses_id = answers.response_id 
//             INNER JOIN questions ON questions.questions_id = answers.question_id
//             LEFT JOIN multiple_options ON multiple_options.id_question = questions.questions_id
//             LEFT JOIN true_false_options ON true_false_options.question_id = questions.questions_id
//             INNER JOIN surveys ON surveys.survey_id = responses.survey_id 
//             WHERE surveys.program_id = ?
//             AND (answers.question_type_id = 1 OR answers.question_type_id = 5)
//             AND (
//                 (answers.question_type_id = 1 AND answers.answer_text = multiple_options.display_order)
//                 OR 
//                 (answers.question_type_id = 5 AND answers.answer_text = true_false_options.type)
//             ) 
//             AND (responses.submitted_at BETWEEN ? AND ?) 
//             AND surveys.survey_type_id = ? 
//             AND answers.response_id = ?
//         ) AS evaluated_answers;";

//         $stmt = $pdo->prepare($sql);
//         $stmt->execute([$program_id, $from, $to,$surveyType, $responses_id]);
//         $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
//         if ($results === false || !is_array($results)) {
//             $results = [];
//         }

//         echo json_encode([
//             'status' => 'success',
//             'data' => $results // Siempre un array, aunque vacío
//         ]);

//     } catch (Exception $e) {
//         http_response_code(400); 
//         echo json_encode([
//             'status' => 'error',
//             'message' => $e->getMessage(),
//             'data' => []
//         ]);
//     }
//     exit;
// }
//?Get all califications for a specific program
// if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getResultsPerProgram') {
//     try {
//         $required_params = ['from', 'to', 'surveyType'];
//         foreach ($required_params as $param) {
//             if (!isset($_GET[$param])) {
//                 throw new Exception("Missing required parameter: $param");
//             }
//         }

//         if (!isset($_GET['program_id'])) {
//             throw new Exception("Missing required parameter: program_id");
//         }

//         $program_ids = is_array($_GET['program_id']) ? $_GET['program_id'] : [$_GET['program_id']];
//         $from = $_GET['from'];
//         $to = $_GET['to'];
//         $surveyType = $_GET['surveyType'];

//         $results = [];

//         foreach ($program_ids as $program_id) {
//             // Primera consulta: obtener todos los responses_id para este programa
//             $sql1 = "SELECT responses.responses_id
//                     FROM responses
//                     INNER JOIN surveys ON surveys.survey_id = responses.survey_id
//                     WHERE surveys.program_id = ?
//                     AND surveys.survey_type_id = ?
//                     AND (responses.submitted_at BETWEEN ? AND ?)";

//             $stmt1 = $pdo->prepare($sql1);
//             $stmt1->execute([$program_id, $surveyType, $from, $to]);
//             $responses = $stmt1->fetchAll(PDO::FETCH_ASSOC);

//             // Segunda consulta para evaluar cada response_id
//             $sql2 = "SELECT 
//                     ROUND((SUM(answers) * 100.0 / COUNT(*)), 2) AS grade
//                 FROM (
//                     SELECT 
//                         CASE 
//                             WHEN answers.question_type_id = 1 THEN multiple_options.correct_answer
//                             WHEN answers.question_type_id = 5 THEN true_false_options.correct_answer
//                         END AS answers
//                     FROM answers
//                     INNER JOIN responses ON responses.responses_id = answers.response_id 
//                     INNER JOIN questions ON questions.questions_id = answers.question_id
//                     LEFT JOIN multiple_options ON multiple_options.id_question = questions.questions_id
//                     LEFT JOIN true_false_options ON true_false_options.question_id = questions.questions_id
//                     INNER JOIN surveys ON surveys.survey_id = responses.survey_id 
//                     WHERE (answers.question_type_id = 1 OR answers.question_type_id = 5)
//                     AND (
//                         (answers.question_type_id = 1 AND answers.answer_text = multiple_options.display_order)
//                         OR 
//                         (answers.question_type_id = 5 AND answers.answer_text = true_false_options.type)
//                     ) 
//                     AND answers.response_id = ?
//                 ) AS evaluated_answers";

//             $stmt2 = $pdo->prepare($sql2);
            
//             $grades = [];
//             foreach ($responses as $response) {
//                 $stmt2->execute([$response['responses_id']]);
//                 $grade = $stmt2->fetch(PDO::FETCH_ASSOC);
                
//                 if ($grade && isset($grade['grade'])) {
//                     $grades[] = (float)$grade['grade'];
//                 }
//             }

//             $results[$program_id] = $grades;
//         }

//         echo json_encode([
//             'status' => 'success',
//             'data' => $results // Objeto con program_id como keys
//         ]);

//     } catch (Exception $e) {
//         http_response_code(400); 
//         echo json_encode([
//             'status' => 'error',
//             'message' => $e->getMessage(),
//             'data' => []
//         ]);
//     }
//     exit;
// }

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
            // Primera consulta: obtener todos los responses_id para este programa
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
        AND responses.submitted_at BETWEEN ? AND ? 
        UNION
        SELECT responses.responses_id
        FROM responses
        INNER JOIN surveys ON surveys.survey_id = responses.survey_id
        WHERE surveys.program_id = ?
        AND surveys.survey_type_id = ?
        AND surveys.status = 'active'
        AND responses.submitted_at BETWEEN ? AND ?
        AND NOT EXISTS (
            SELECT ?
            FROM responses r2
            INNER JOIN surveys s2 ON s2.survey_id = r2.survey_id
            WHERE s2.program_id = ? AND s2.survey_type_id = ? AND s2.status = 'active' AND r2.submitted_at BETWEEN ? AND ?
        )";
            $stmt1 = $pdo->prepare($sql1);
            // Parámetros en el orden CORRECTO para todos los ?
            $stmt1->execute([
                // Parte antes del UNION (6 parámetros)
                $program_id, 
                $surveyType,
                $program_id,
                $surveyType2, 
                $from, 
                $to,
                
                // Fechas del primer BETWEEN (2 parámetros)
                $from, 
                $to,
                
                // Parte después del UNION (6 parámetros)
                $program_id, 
                $surveyType,
                $from, 
                $to,
                1, // Valor para el SELECT ? en NOT EXISTS
                $program_id, 
                $surveyType2, 
                $from, 
                $to
            ]);
            $responses = $stmt1->fetchAll(PDO::FETCH_ASSOC);

            // Segunda consulta para evaluar cada response_id
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
// ?----Get responses from survey program
// if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getResponses') {
//     try {
//         $required_params = ['program_id','from','to','surveyType'];
//         foreach ($required_params as $param) {
//             if (!isset($_GET[$param])) {
//                 throw new Exception("Missing required parameter: $param");
//             }
//         }

//         $program_id = $_GET['program_id'];
//         $from = $_GET['from'];
//         $to = $_GET['to'];
//         $surveyType = $_GET['surveyType'];

//         $sql = "SELECT r.responses_id AS responses
//                 FROM responses r
//                 INNER JOIN surveys ON surveys.survey_id = r.survey_id
//                 WHERE surveys.program_id = ? AND surveys.survey_type_id = ?
//                 AND (r.submitted_at BETWEEN ? AND ?)";

//         $stmt = $pdo->prepare($sql);
//         $stmt->execute([$program_id,$surveyType,$from, $to]);
//         $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
//         if ($results === false || !is_array($results)) {
//             $results = [];
//         }

//         echo json_encode([
//             'status' => 'success',
//             'data' => $results // Siempre un array, aunque vacío
//         ]);

//     } catch (Exception $e) {
//         http_response_code(400); 
//         echo json_encode([
//             'status' => 'error',
//             'message' => $e->getMessage(),
//             'data' => []
//         ]);
//     }
//     exit;
// }
