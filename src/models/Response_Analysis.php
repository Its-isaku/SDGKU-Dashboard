<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');


//! <|-------------------------------- Filter Logic --------------------------------|>
//?-----Get totala amount of linkert 5 per program
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
        if (empty($results)) {
            throw new Exception("No data found for the given parameters");
        }

        echo json_encode([
            'status' => 'success',
            'data' => $results
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




//! <|-------------------------------- Graph Logic --------------------------------|>







//! <|-------------------------------- Tables Logic --------------------------------|>






?>


