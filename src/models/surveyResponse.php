<?php 
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ERROR | E_PARSE);

require_once __DIR__ . '/../config/config.php';

//? ---------------- processing GET request ----------------

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'getSurvey') {
        if (!isset($_GET['token']) || empty($_GET['token'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Token not provided']);
            exit;
        }

        $token = $_GET['token'];

        try {
            $sqlSurvey = "SELECT 
                s.survey_id, 
                s.title,
                s.description,
                s.expires_at,
                pt.program_name as program_type,
                p.prog_id as program_id,
                p.name as program_name,
                st.type_name as survey_type
                FROM surveys s
                JOIN program_types pt ON s.program_type_id = pt.program_type_id
                JOIN programs p ON s.program_id = p.prog_id
                JOIN survey_types st ON s.survey_type_id = st.survey_type_id
                WHERE s.token = ? AND s.status = 'active'
                LIMIT 1";
            
            $stmtSurvey = $conn->prepare($sqlSurvey);
            $stmtSurvey->execute([$token]);
            $survey = $stmtSurvey->fetch(PDO::FETCH_ASSOC);

            if(!$survey) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Invalid or unknown token']);
                exit;
            }

            $currentDare = new DateTime();
            $expiresAt = new DateTime($survey['expires_at']);

            if ($currentDate > $expiresAt) {
                echo json_encode(['success' => false, 'message' => 'This survey has expired.']);
                exit;
            }

            $sqlQuestions = "SELECT 
                q.questions_id, 
                q.question_text, 
                q.question_type_id,
                q.display_order
                FROM questions q 
                WHERE q.survey_id = ? 
                ORDER BY q.display_order";
            
            $stmtQuestions = $conn->prepare($sqlQuestions);
            $stmtQuestions->execute([$survey['survey_id']]);
            $questions = $stmtQuestions->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'survey_id' => $survey['survey_id'],
                'title' => $survey['title'],
                'description' => $survey['description'],
                'program_type' => $survey['program_type'],
                'program_id' => $survey['program_id'],
                'program_name' => $survey['program_name'],
                'survey_type' => $survey['survey_type'],
                'expires_at' => $survey['expires_at'],
                'questions' => $questions
            ]);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            exit;
        }
    }

    //? ---------------- getting cohorts for program ----------------
    if(isset($_GET['action']) && $_GET['action'] === 'getCohorts') {
        if (!isset($_GET['programId'])){
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Program ID not provided']);
            exit;
        }
        $programId = $_GET['programId'];

        try {
            $sql = "SELECT cohort_id, cohort
                FROM cohort
                WHERE program_id = ? 
                AND status = 'active'
                ORDER BY cohort";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$programId]);
            $cohorts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'cohorts' => $cohorts
            ]);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            exit;
        }
    }

    if(isset($_GET['action']) && $_GET['action'] === 'getQuestionOptions'){
        if (!isset($_GET['questionId']) || !isset($_GET['type'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing parameters']);
            exit;
        }
    }

    $questionId = intval($_GET['questionId']);
    $type = $_GET['type'];

    try {
        $sql = '';
        $params = [$questionId];

        switch ($type) {
            case 'multiple':
                $sql = "SELECT question_opt_id, option_text, display_order
                    FROM multiple_options 
                    WHERE id_question = ?
                    ORDER BY display_order";
                break;
            case 'Linkert_1_5':
                $sql = "SELECT scale_id, scale_option_text 
                    FROM Linkert_1_5 
                    ORDER BY scale_id";
                $params = [];
                break;
            case 'Linkert_1_3':
                $sql = "SELECT scale_id, scale_option_text 
                    FROM Linkert_1_3 
                    ORDER BY scale_id";
                $params = [];
                break;
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid question type']);
                exit;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $options = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'options' => $options
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        exit;
    }
}

//? ---------------- processing post req for survey responses ----------------
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['surveyId']) || !isset($data['token']) || !isset($data['email']) 
        || !isset($data['responses']) || !isset($data['cohortId'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing parameters']);
        exit;
    }

    try {
        //~ ----- validations for survey and token -----
        $sqlValidate = "SELECT survey_id, expires_at, status FROM surveys WHERE survey_id = ? AND token = ? LIMIT 1";
        $stmtValidate = $conn->prepare($sqlValidate);
        $stmtValidate->execute([$data['surveyId'], $data['token']]);
        $survey = $stmtValidate->fetch(PDO::FETCH_ASSOC);

        if (!$survey) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Invalid survey ID or token']);
            exit;
        }

        if ($survey['status'] !== 'active') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Survey is not active']);
            exit;
        }

        $currentDate = new DateTime();
        $expiresAt = new DateTime($survey['expires_at']);

        if ($currentDate > $expiresAt) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'This survey has expired.']);
            exit;
        }

        //~ ----- check if the user (email) has already submitted the survey -----
        $sqlCheckExisting = "SELECT responses_id FROM responses WHERE survey_id = ? AND respondent_email = ? LIMIT 1";
        $stmtCheckExisting = $conn->prepare($sqlCheckExisting);
        $stmtCheckExisting->execute([$data['surveyId'], $data['email']]);
        $existingResponse = $stmtCheckExisting->fetch(PDO::FETCH_ASSOC);

        if ($existingResponse) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'You have already submitted this survey.']);
            exit;
        }

        //~ ----- begin transaction -----
        $pdo->beginTransaction();

        $sqlResponse = "INSERT INTO responses (survey_id, respondent_email, cohort_id, submitted_at) VALUES (?, ?, ?, NOW())";
        $stmtResponse = $pdo->prepare($sqlResponse);
        $stmtResponse->execute([$data['surveyId'], $data['email'], $data['cohortId']]);
        $responseId = $pdo->lastInsertId();

        //~ ----- process each question response -----
        foreach ($data['responses'] as $response){
            $sqlAnswer = "INSERT INTO answers (responses_id, question_id, answer_text, question_type_id) VALUES (?, ?, ?, ?)";
            $stmtAnswer = $pdo->prepare($sqlAnswer);
            $stmtAnswer->execute([
                $responseId,
                $response['questionId'],
                $response['answer'],
                $response['questionType']
            ]);
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Response submitted successfully',
            'responseId' => $responseId
        ]);
        exit;
    } catch (PDOException $e) {
        if($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
exit;