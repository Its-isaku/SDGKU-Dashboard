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
            s.survey_id AS id,
            st.type_name AS type,
            s.status,
            s.title,
            s.description,
            DATE_FORMAT(s.created_at, '%m-%d-%Y') AS createdDate,
            DATE_FORMAT(s.expires_at, '%m-%d-%Y') AS expires,
            pt.program_name AS program,
            DATE_FORMAT(s.last_edited, '%m-%d-%Y') AS last_edit,
            (SELECT COUNT(*) FROM questions q WHERE q.survey_id = s.survey_id) AS questions,
            (SELECT COUNT(*) FROM responses r WHERE r.survey_id = s.survey_id) AS responses
        FROM surveys s
        JOIN survey_types st ON s.survey_type_id = st.survey_type_id
        JOIN program_types pt ON s.program_type_id = pt.program_type_id";
        
        $params = [];
        if ($search !== '') {
            $sql .= " WHERE s.title LIKE ? OR s.description LIKE ?";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        $sql .= " GROUP BY 
            s.survey_id, 
            st.type_name, 
            s.status, 
            s.title,
            s.description, 
            s.created_at, 
            s.expires_at, 
            pt.program_name, 
            s.last_edited
        ORDER BY s.created_at DESC";

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
    $stmt = $pdo->prepare("SELECT token, expires_at FROM surveys WHERE survey_id = ?");
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

    //? <-------------------------------- Switch for generate new token and update data -------------------------------->
switch ($input['action']) {
        case 'updateTokenData':
            $id = $input['id'];
            $newToken = bin2hex(random_bytes(16));
            $expiresAt = $input['expires_at'];
            if($expiresAt === '0000-00-00 00:00:00' || empty($expiresAt)){
                $stmt = $pdo->prepare("UPDATE surveys SET token = null, expires_at = null WHERE survey_id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Link and date were deleted']);
            }else{
                $stmt = $pdo->prepare("UPDATE surveys SET token = ?, expires_at = ? WHERE survey_id = ?");
                $stmt->execute([$newToken, $expiresAt, $id]);
                echo json_encode(['token' => $newToken]);
            }
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


            $sql = "INSERT INTO surveys (
                    title, description, program_type_id, program_id, subject_id, 
                    last_edited, created_at, expires_at, status, survey_type_id 
                )
                SELECT 
                    CONCAT(title, ' (copy)'), 
                    description, program_type_id, program_id, subject_id, 
                    last_edited, created_at, expires_at, status, survey_type_id
                FROM surveys
                WHERE survey_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([ $id]);

            $newSurveyId = $pdo->lastInsertId();

            $sqlQuestions = "INSERT INTO questions (survey_id, question_text, question_type_id, display_order)
                        SELECT ?, question_text, question_type_id, display_order
                        FROM questions WHERE survey_id = ?";
            $stmtQuestions = $pdo->prepare($sqlQuestions);
            $stmtQuestions->execute([$newSurveyId, $id]);
            
            //* Obtener IDs de preguntas originales y nuevas
            $sqlGetOldQuestions = "SELECT questions_id, question_type_id FROM questions WHERE survey_id = ? ORDER BY display_order";
            $stmtOldQ = $pdo->prepare($sqlGetOldQuestions);
            $stmtOldQ->execute([$id]);
            $oldQuestions = $stmtOldQ->fetchAll(PDO::FETCH_ASSOC);

            $sqlGetNewQuestions = "SELECT questions_id, question_type_id FROM questions WHERE survey_id = ? ORDER BY display_order";
            $stmtNewQ = $pdo->prepare($sqlGetNewQuestions);
            $stmtNewQ->execute([$newSurveyId]);
            $newQuestions = $stmtNewQ->fetchAll(PDO::FETCH_ASSOC);

            //* Mapear old->new question_id por orden
            $questionIdMap = [];
            foreach ($oldQuestions as $idx => $oq) {
                if (isset($newQuestions[$idx])) {
                    $questionIdMap[$oq['questions_id']] = $newQuestions[$idx]['questions_id'];
                }
            }

            //* Duplicar opciones Multiple Choice
            foreach ($questionIdMap as $oldQid => $newQid) {
                //* Multiple Choice
                $sqlGetOptions = "SELECT option_text, correct_answer, display_order FROM multiple_options WHERE id_question = ?";
                $stmtOpt = $pdo->prepare($sqlGetOptions);
                $stmtOpt->execute([$oldQid]);
                $options = $stmtOpt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($options as $opt) {
                    $sqlInsertOpt = "INSERT INTO multiple_options (id_question, option_text, correct_answer, display_order) VALUES (?, ?, ?, ?)";
                    $stmtInsertOpt = $pdo->prepare($sqlInsertOpt);
                    $stmtInsertOpt->execute([$newQid, $opt['option_text'], $opt['correct_answer'], $opt['display_order']]);
                }
                //* True/False
                $sqlGetTF = "SELECT true_false_text, type, correct_answer FROM true_false_options WHERE question_id = ?";
                $stmtTF = $pdo->prepare($sqlGetTF);
                $stmtTF->execute([$oldQid]);
                $tfOptions = $stmtTF->fetchAll(PDO::FETCH_ASSOC);
                foreach ($tfOptions as $tf) {
                    $sqlInsertTF = "INSERT INTO true_false_options (question_id, true_false_text, type, correct_answer) VALUES (?, ?, ?, ?)";
                    $stmtInsertTF = $pdo->prepare($sqlInsertTF);
                    $stmtInsertTF->execute([$newQid, $tf['true_false_text'], $tf['type'], $tf['correct_answer']]);
                }
            }

            $pdo->commit();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Survey duplicated successfully',
                'new_survey_id' => $newSurveyId,
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
            
            $sql = "UPDATE surveys SET surveys.status = 'active' WHERE survey_id = ?";
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
//? <-------------------------------- GET --------------------------------> - Get survey data by ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getSurveyData') {
    try {
        if (!isset($_GET['survey_id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Survey ID not provided']);
            exit;
        }

        $query = "
            SELECT 
                surveys.title, 
                surveys.description,
                program_types.program_name AS programType,
                programs.name AS program, 
                surveys.survey_type_id, 
                survey_types.type_name AS survey_type, 
                surveys.status
            FROM surveys
            INNER JOIN programs ON programs.prog_id = surveys.program_id
            INNER JOIN program_types ON program_types.program_type_id = surveys.program_type_id
            INNER JOIN survey_types ON survey_types.survey_type_id = surveys.survey_type_id
            WHERE surveys.survey_id = ?;
        ";

        $stmt = $pdo->prepare($query);
        $stmt->execute([$_GET['survey_id']]); 
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Survey not found']);
            exit;
        }

        echo json_encode(['status' => 'success', 'data' => $result]);

    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error occurred']);
    }
    exit;
}

?>
