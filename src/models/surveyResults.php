<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection error'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET' || !isset($_GET['action']) || $_GET['action'] !== 'getLinkertSurveyResults') {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method or action'
    ]);
    exit;
}

$requiredParams = ['surveyId', 'from', 'to'];
$params = [];
foreach ($requiredParams as $param) {
    if (!isset($_GET[$param]) || empty($_GET[$param])) {
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => "Missing required parameter: {$param}"
        ]);
        exit;
    }
    $params[$param] = $_GET[$param];
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            r.respondent_email,
            r.submitted_at,
            COUNT(CASE WHEN a.answer_text IN ('4', '5') THEN 1 END) * 100.0 / COUNT(*) as average
        FROM responses r
        INNER JOIN answers a ON a.response_id = r.responses_id
        INNER JOIN questions q ON q.questions_id = a.question_id
        WHERE q.survey_id = :surveyId
        AND r.submitted_at BETWEEN :fromDate AND :toDate
        AND a.question_type_id = 2
        GROUP BY r.respondent_email, r.submitted_at
    ");

    $stmt->execute([
        ':surveyId' => $params['surveyId'],
        ':fromDate' => $params['from'],
        ':toDate' => $params['to']
    ]);

    $results = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

        $stmtQuestions = $pdo->prepare("
            SELECT 
                q.question_text,
                a.answer_text
            FROM questions q
            INNER JOIN answers a ON a.question_id = q.questions_id
            INNER JOIN responses r ON r.responses_id = a.response_id
            WHERE q.survey_id = :surveyId
            AND r.respondent_email = :email
            AND r.submitted_at = :submittedAt
            AND a.question_type_id = 4
        ");

        $stmtQuestions->execute([
            ':surveyId' => $params['surveyId'],
            ':email' => $row['respondent_email'],
            ':submittedAt' => $row['submitted_at']
        ]);

        $questions = $stmtQuestions->fetchAll(PDO::FETCH_ASSOC);

        $results[] = [
            'email' => $row['respondent_email'],
            'average' => number_format($row['average'], 0), 
            'date' => $row['submitted_at'],
            'questions' => array_map(function($q) {
                return [
                    'question_text' => $q['question_text'],
                    'answer_text' => $q['answer_text']
                ];
            }, $questions)
        ];
    }

    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'data' => $results
    ]);

} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error',
        'debug' => $e->getMessage() 
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}