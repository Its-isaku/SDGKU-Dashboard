<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//! <-------------------------------- GET --------------------------------> - Get surveys data
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getSurveys') {
    try {
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
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
";
    $params = [];
    if ($search !== '') {
        $sql .= " WHERE surveys.title LIKE ? OR surveys.description LIKE ?";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    $sql .= " GROUP BY 
        surveys.survey_id, 
        survey_types.type_name, 
        surveys.status, 
        surveys.title, 
        surveys.description, 
        surveys.created_at, 
        surveys.expires_at, 
        program_types.program_name, 
        cohort.cohort";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $surveys = $stmt->fetchAll();
    echo json_encode($surveys);
    exit;
    
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
        exit;
    }
}

//? <-------------------------------- Get survey an return questions -------------------------------->
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getSurvey') {
    try {
        if (!isset($_GET['token']) || empty($_GET['token'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Token not provided']);
            exit;
        }

        $token = $_GET['token'];

        $sqlSurvey = "SELECT survey_id, expires_at FROM surveys WHERE token = :token LIMIT 1";
        $stmtSurvey = $pdo->prepare($sqlSurvey);
        $stmtSurvey->bindParam(':token', $token);
        $stmtSurvey->execute();

        $survey = $stmtSurvey->fetch(PDO::FETCH_ASSOC);

        if (!$survey) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Invalid or unknown token']);
            exit;
        }

        $currentDate = new DateTime();
        $expiresAt = new DateTime($survey['expires_at']);

        if ($currentDate > $expiresAt) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'This survey has expired.']);
            exit;
        }

        $survey_id = $survey['survey_id'];

        $sqlQuestions = "SELECT questions_id, question_text FROM questions WHERE survey_id = :survey_id";
        $stmtQuestions = $pdo->prepare($sqlQuestions);
        $stmtQuestions->bindParam(':survey_id', $survey_id);
        $stmtQuestions->execute();

        $questions = $stmtQuestions->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'survey_id' => $survey_id,
            'questions' => $questions
        ]);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        exit;
    }
}  

//? <-------------------------------- Get token to survey by id -------------------------------->
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'getSurveyById') {
    $id = intval($_GET['id']);
    $stmt = $pdo->prepare("SELECT token FROM surveys WHERE survey_id = ?");
    $stmt->execute([$id]);
    $survey = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($survey);
    exit;
}
//! <-------------------------------- POST --------------------------------> - Delete, duplicate, deactivate and activate surveys
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //* Primero decodificar el input
    $input = json_decode(file_get_contents('php://input'), true);
    
    //* Verificar que el input es válido y tiene acción
    if (!isset($input['action'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Acción no especificada']);
        exit;
    }

    //? <-------------------------------- DELETE -------------------------------->
    if($input['action'] === 'deleteSurvey'){
    try {
            if (!isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID no proporcionado']);
                exit;
            }
            
        //* Validate the ID
        $id = intval($input['id']);

    
        $pdo->beginTransaction();
        //* Prepare and execute the delete queries
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

    //? <-------------------------------- DUPLICATE -------------------------------->
    if ($input['action'] === 'duplicateSurvey') {
        try {
            if (!isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID not provided']);
                exit;
            }

            $id = intval($input['id']);
            $pdo->beginTransaction();

            $newToken = bin2hex(random_bytes(16));

            $sql = "INSERT INTO surveys (
                    title, description, program_type_id, program_id, subject_id, 
                    last_edited, created_at, expires_at, status, survey_type_id, token
                )
                SELECT 
                    CONCAT(title, ' (copy)'), 
                    description, program_type_id, program_id, subject_id, 
                    last_edited, created_at, expires_at, status, survey_type_id, ?
                FROM surveys
                WHERE survey_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$newToken, $id]);

            $newSurveyId = $pdo->lastInsertId();

            $sqlQuestions = "INSERT INTO questions (survey_id, question_text, question_type_id, display_order)
                        SELECT ?, question_text, question_type_id, display_order
                        FROM questions WHERE survey_id = ?";
            $stmtQuestions = $pdo->prepare($sqlQuestions);
            $stmtQuestions->execute([$newSurveyId, $id]);

            $pdo->commit();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Survey duplicated successfully',
                'new_survey_id' => $newSurveyId,
                'new_token' => $newToken
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log('Error duplicating survey: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error duplicating the survey: ' . $e->getMessage()
            ]);
        }
        exit;
    }

    //? <-------------------------------- DEACTIVATE -------------------------------->
    if($input['action'] === 'deactivateSurvey'){
        try {
            if (!isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID no proporcionado']);
                exit;
            }
            $id = intval($input['id']);
            $pdo->beginTransaction();
            
            $sql = "CALL setInactive(?);
";
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

    //? <-------------------------------- ACTIVATE -------------------------------->
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
