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
                CONCAT(
                    ROUND(SUM(CASE WHEN answers.answer_text IN ('4', '5') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
                    '%') AS average
                    FROM answers
                    INNER JOIN questions ON questions.questions_id = answers.question_id
                    INNER JOIN surveys ON surveys.survey_id = questions.survey_id
                    INNER JOIN responses ON responses.responses_id = answers.response_id
                    WHERE surveys.program_id = ?  AND (responses.submitted_at 
                    BETWEEN ? AND ?) AND surveys.status = 'active' 
                    AND (questions.question_type_id IN (2, 3))";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_type_id, $start_date, $end_date]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $row = $results[0] ?? ['total_Programa' => 0];

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
//! anadir tiempo
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
                AND surveys.program_id = ? AND surveys.survey_type_id = 2 AND surveys.status = 'active' AND (responses.submitted_at 
                    BETWEEN ? AND ?) ";

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
//?Get question Text from every Linkerts 
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getProgramInfo') {
    try {
        $required_params = ['program_id', 'start_date', 'end_date'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }

        $program_id = $_GET['program_id'];
        $start_date = $_GET['start_date'];
        $end_date = $_GET['end_date'];

        $sql = "SELECT 
                questions.question_text AS texts,
                COUNT(answers.answers_id) AS total_students,
                SUM(CASE WHEN answers.answer_text IN ('4', '5') THEN 1 ELSE 0 END) AS acceptable,
                CONCAT(
                ROUND(SUM(CASE WHEN answers.answer_text IN ('4', '5') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
                '%') AS average
                FROM answers
                INNER JOIN questions ON questions.questions_id = answers.question_id
                INNER JOIN surveys ON surveys.survey_id = questions.survey_id
                INNER JOIN responses ON responses.responses_id = answers.response_id
                WHERE surveys.program_id = ? AND surveys.status='active' AND (responses.submitted_at BETWEEN ? AND ?)
                AND (questions.question_type_id IN (2, 3)) AND surveys.survey_type_id = 3
                GROUP BY answers.question_id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id, $start_date, $end_date]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calcular totales
        $total_approved = array_sum(array_column($results, 'acceptable'));
        $total_responses = array_sum(array_column($results, 'total_students'));

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $results,
            'total_approved' => $total_approved,
            'total_responses' => $total_responses
        ]);
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}

//?---Get survey
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getAllSurveyType') {
    try {
        $sql = "SELECT survey_type_id, type_name 
                FROM survey_types 
                WHERE survey_type_id IN (4, 5)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'status' => 'success',
            'data' => $results
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error no found survey type: ' . $e->getMessage()
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
                WHERE programs.program_type_id = ? AND programs.status='active'";
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
//?To get all programs for Overview
//!Survey Overview  panel
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getAllPrograms') {
    try {
        $sql = "SELECT programs.prog_id, programs.name
                FROM programs
                WHERE  programs.status='active'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
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

//?---Get programs averages
//!AGREGAR BETWEEN RANGE
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getProgramsAverages') {
    try {
        $required_params = ['program_id', 'start_date', 'end_date'];
        foreach ($required_params as $param) {
            if (!isset($_GET[$param])) {
                throw new Exception("Missing required parameter: $param");
            }
        }

        $program_id = $_GET['program_id'];
        $start_date = $_GET['start_date'];
        $end_date = $_GET['end_date'];

        $sql = "SELECT          
                CONCAT(
                    ROUND(SUM(CASE WHEN answers.answer_text IN ('4', '5') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
                    '%') AS average
                    FROM answers
                    INNER JOIN questions ON questions.questions_id = answers.question_id
                    INNER JOIN surveys ON surveys.survey_id = questions.survey_id
                    INNER JOIN responses ON responses.responses_id = answers.response_id
                    WHERE surveys.program_id = ? AND surveys.status ='active'  AND (responses.submitted_at 
                    BETWEEN ? AND ?)
                    AND (questions.question_type_id IN (2, 3))
                ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$program_id, $start_date, $end_date]);
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
