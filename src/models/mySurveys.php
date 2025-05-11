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
    surveys.survey_id AS id,
    survey_types.type_name AS type,
    surveys.status,
    surveys.title,
    surveys.description,
    surveys.created_at AS createdDate,
    surveys.expires_at AS expires,
    program_types.program_name AS program,
    cohort.cohort AS cohort,
    COUNT(DISTINCT questions.questions_id) AS questions
FROM surveys
INNER JOIN survey_types ON surveys.survey_type_id = survey_types.survey_type_id
INNER JOIN program_types ON surveys.program_type_id = program_types.program_type_id
LEFT JOIN (
    SELECT program_id, MIN(cohort) AS cohort 
    FROM cohort 
    GROUP BY program_id
) cohort ON cohort.program_id = surveys.program_id
LEFT JOIN questions ON surveys.survey_id = questions.survey_id
GROUP BY 
    surveys.survey_id, 
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Primero decodificar el input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verificar que el input es válido y tiene acción
    if (!isset($input['action'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Acción no especificada']);
        exit;
    }
    if($input['action'] === 'deleteSurvey'){
    try {
            if (!isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID no proporcionado']);
                exit;
            }
            
        // Validate the ID
        $id = intval($input['id']);

    
        $pdo->beginTransaction();
        // Prepare and execute the delete queries
        $queries = [
            "DELETE FROM true_false_options WHERE question_id IN 
                (SELECT questions_id FROM questions WHERE survey_id = ?)",
            
            "DELETE FROM multiple_options WHERE id_question IN 
                (SELECT questions_id FROM questions WHERE survey_id = ?)",
            
            "DELETE FROM open_options WHERE question_id IN 
                (SELECT questions_id FROM questions WHERE survey_id = ?)",

            "DELETE FROM Linkert_1_5 WHERE question_id IN 
                (SELECT questions_id FROM questions WHERE survey_id = ?)",

            "DELETE FROM Linkert_1_3 WHERE question_id IN 
                (SELECT questions_id FROM questions WHERE survey_id = ?)",

            "DELETE FROM questions WHERE survey_id = ?",

            "DELETE FROM surveys WHERE survey_id = ?"
        ];

        foreach ($queries as $sql) {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
        }

        $pdo->commit();
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Encuesta y datos relacionados eliminados correctamente']);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log('Error deleting survey: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error eliminando la encuesta: ' . $e->getMessage()]);
    }
        exit;
    }
    if($input['action'] === 'duplicateSurvey'){
        try {
            if (!isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID no proporcionado']);
                exit;
            }
            $id = intval($input['id']);
            $pdo->beginTransaction();
            
            $sql = "INSERT INTO surveys (title, description, program_type_id, program_id, subject_id, last_edited, created_at, expires_at,
                    status, survey_type_id)
                    SELECT CONCAT(title, ' (copy)'), 
                    description, program_type_id, program_id, subject_id, last_edited, created_at, expires_at, 
                    status, survey_type_id
                    FROM surveys
                    WHERE survey_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            
            $pdo->commit();
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Encuesta desactivada correctamente']);
            
        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log('Error deactivating survey: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error desactivando la encuesta: ' . $e->getMessage()]);
        }
        exit;
        
    }
    if($input['action'] === 'deactivateSurvey'){
        try {
            if (!isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID no proporcionado']);
                exit;
            }
            $id = intval($input['id']);
            $pdo->beginTransaction();
            
            $sql = "UPDATE surveys SET status = 'inactive' WHERE survey_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            
            $pdo->commit();
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Encuesta desactivada correctamente']);
            
        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log('Error deactivating survey: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error desactivando la encuesta: ' . $e->getMessage()]);
        }
        exit;
        
    }
    if($input['action'] === 'activateSurvey'){
        try {
            if (!isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID no proporcionado']);
                exit;
            }
            $id = intval($input['id']);
            $pdo->beginTransaction();
            
            $sql = "UPDATE surveys SET status = 'active' WHERE survey_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            
            $pdo->commit();
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Encuesta desactivada correctamente']);
            
        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log('Error deactivating survey: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error desactivando la encuesta: ' . $e->getMessage()]);
        }
        exit;
        
    }

    http_response_code(400);
    echo json_encode(['error' => 'Acción no válida']);
    exit;
}



?>
