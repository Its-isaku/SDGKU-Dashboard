<?php
//! <|-------------------------------- Config & Headers --------------------------------|>
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//! <|-------------------------------- Filter Logic --------------------------------|>
//?-----Get total amount of linkert 5 per program
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getByProgramTypes') {
    try {
        $required_params = ['program_type_id', 'start_date', 'end_date'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }


        $program_type_id = $_GET['program_type_id'];
        $start_date = $_GET['start_date'];
        $end_date = $_GET['end_date'];

        if (!strtotime($start_date) || !strtotime($end_date)) {
            throw new Exception("Invalid date format");
        }
        

        $sql = "SELECT 
                SUM(CAST(answer_text AS DECIMAL)) AS sumaLinkert5,
                COUNT(*) AS total_Programa
                FROM responses
                INNER JOIN answers ON answers.response_id = responses.responses_id
                INNER JOIN surveys ON surveys.survey_id = responses.survey_id
                WHERE answers.question_type_id = 2 
                AND surveys.program_id = ? 
                AND surveys.created_at BETWEEN ? AND ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_type_id, $start_date, $end_date]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $row = $results[0] ?? ['sumaLinkert5' => 0, 'total_Programa' => 0];
        $row['sumaLinkert5'] = isset($row['sumaLinkert5']) && $row['sumaLinkert5'] !== null ? (float)$row['sumaLinkert5'] : 0;
        $row['total_Programa'] = isset($row['total_Programa']) && $row['total_Programa'] !== null ? (int)$row['total_Programa'] : 0;

        echo json_encode([
            'status' => 'success',
            'data' => [$row]
        ]);

    } catch (Exception $e) {
        http_response_code(400); 
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

//?-----Get total amount of students for direct measure
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'programs_id') {
    try {

        if (!isset($_GET['program_id'])) {
            throw new Exception("Se requiere el parámetro program_id");
        }

        $program_id = (int)$_GET['program_id'];

        $sql = "SELECT COUNT(DISTINCT respondent_email) AS total_students
                FROM responses
                INNER JOIN questions ON questions.questions_id = responses.questions_id
                INNER JOIN surveys ON surveys.survey_id = responses.survey_id
                WHERE (questions.question_type_id = 1 OR questions.question_type_id = 5)
                AND surveys.program_id = ? AND surveys.survey_type_id = 2";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'total_students' => (int)$result['total_students'] ?? 0,
            'data' => $result // 
        ]);

    } catch (Exception $e) {
        http_response_code(400); 
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage(),
            'total_students' => 0 // 
        ]);
    }
    exit;
}
//? get total amount of stundent for indirect measure
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getStudentsIndirectMeasure') {
    try {

        if (!isset($_GET['program_id'])) {
            throw new Exception("Se requiere el parámetro program_id");
        }

        $program_id = (int)$_GET['program_id'];

        $sql = "SELECT COUNT(DISTINCT respondent_email) AS total_students
                FROM responses
                INNER JOIN questions ON questions.questions_id = responses.questions_id
                INNER JOIN surveys ON surveys.survey_id = responses.survey_id
                WHERE (questions.question_type_id = 2 OR questions.question_type_id = 2)
                AND surveys.program_id = ? AND surveys.survey_type_id = 3";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'total_students' => (int)$result['total_students'] ?? 0,
            'data' => $result // 
        ]);

    } catch (Exception $e) {
        http_response_code(400); 
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage(),
            'total_students' => 0 // 
        ]);
    }
    exit;
}
//?---Get Group of answers POST TEST for Direct Analisis

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getAnswersPerStudent') {
    try {
        if (!isset($_GET['program_id'])) {
            throw new Exception('program_id parameter is required');
        }
        $program_id = $_GET['program_id'];
        
        $sql = "SELECT GROUP_CONCAT(responses_id) AS responseIds
                FROM responses
                INNER JOIN surveys ON surveys.survey_id = responses.survey_id
                WHERE surveys.program_id = ? AND surveys.survey_type_id = 2
                GROUP BY respondent_email";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $results
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al obtener respuestas: ' . $e->getMessage()
        ]);
    }
    exit;
}
//?---Get Group of answers FINAL ASSESSMENT for Indirect Analisis

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getAnswersPerStudentIndirect') {
    try {
        if (!isset($_GET['program_id'])) {
            throw new Exception('program_id parameter is required');
        }
        $program_id = $_GET['program_id'];
        
        $sql = "SELECT GROUP_CONCAT(responses_id) AS responseIds
                FROM responses
                INNER JOIN surveys ON surveys.survey_id = responses.survey_id
                WHERE surveys.program_id = ? AND surveys.survey_type_id = 3
                GROUP BY respondent_email";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $results
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al obtener respuestas: ' . $e->getMessage()
        ]);
    }
    exit;
}

//?---Get programs
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getPrograms') {
    try {
        if (!isset($_GET['program_type_id'])) {
            throw new Exception('program_type_id parameter is required');
        }
        $program_type_id = $_GET['program_type_id'];
        $sql = "SELECT programs.prog_id, programs.name
                FROM programs 
                WHERE programs.program_type_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_type_id]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'status' => 'success',
            'data' => $results
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al obtener programas: ' . $e->getMessage()
        ]);
    }
    exit;
}
// //?----Get indirect correct answers per student Final Assisment
// if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getPrograms') {
//     try {
//         if (!isset($_GET['program_type_id'])) {
//             throw new Exception('program_type_id parameter is required');
//         }
//         $program_type_id = $_GET['program_type_id'];
//         $sql = "SELECT programs.prog_id, programs.name
//                 FROM programs 
//                 WHERE programs.program_type_id = ?";
//         $stmt = $pdo->prepare($sql);
//         $stmt->execute([$program_type_id]);
//         $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
//         echo json_encode([
//             'status' => 'success',
//             'data' => $results
//         ]);
//     } catch (Exception $e) {
//         http_response_code(500);
//         echo json_encode([
//             'status' => 'error',
//             'message' => 'Error al obtener programas: ' . $e->getMessage()
//         ]);
//     }
//     exit;
// }


//?----Get direct correct answers per student
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getsurveyResults') {
    try {
        $required_params = ['program_id', 'responses_id'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }

        $program_id = $_GET['program_id'];
        $responses_id = $_GET['responses_id'];

        $sql = "SELECT DISTINCT
                CASE 
                    WHEN answers.question_type_id = 1 THEN multiple_options.correct_answer
                    WHEN answers.question_type_id = 5 THEN true_false_options.correct_answer
                END AS correct_answer
            FROM answers
            INNER JOIN responses ON responses.questions_id = answers.question_id 
            LEFT JOIN multiple_options ON multiple_options.id_question = responses.questions_id 
            LEFT JOIN true_false_options ON true_false_options.question_id = responses.questions_id
            INNER JOIN surveys ON surveys.survey_id = responses.survey_id 
            WHERE surveys.program_id = ?
            AND (answers.question_type_id = 1 OR answers.question_type_id = 5)
            AND (
                (answers.question_type_id = 1 AND answers.answer_text = multiple_options.display_order)
                OR 
                (answers.question_type_id = 5 AND answers.answer_text = true_false_options.type)
            )
            AND answers.response_id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id, $responses_id]);
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

//?----Get indirect answers per student (Likert/Linkert)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getsurveyIndirectResults') {
    try {
        $required_params = ['responses_id'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }
        $responses_id = $_GET['responses_id'];

        $sql = "SELECT answers.answer_text
                FROM answers
                INNER JOIN responses ON responses.responses_id = answers.response_id
                WHERE responses.responses_id = ?
                AND (answers.question_type_id = 2 OR answers.question_type_id = 3)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$responses_id]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($results === false || !is_array($results)) {
            $results = [];
        }

        echo json_encode([
            'status' => 'success',
            'data' => $results // 
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

//! <|-------------------------------- Graph Logic --------------------------------|>







//! <|-------------------------------- Tables Logic --------------------------------|>






?>


