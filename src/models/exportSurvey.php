<?php
require_once '../config/config.php';

if (!isset($_GET['id'])) {
    http_response_code(400);
    exit('Missing survey ID');
}

$surveyId = intval($_GET['id']);
$action = $_GET['action'] ?? 'csv'; // Por defecto descarga CSV

// Función para obtener datos agrupados y preguntas (para no repetir código)
function getSurveyData($pdo, $surveyId) {
    // Obtener preguntas
    $sql = "
        SELECT q.questions_id, q.question_text
        FROM questions q
        WHERE q.survey_id = :survey_id
        ORDER BY q.display_order
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['survey_id' => $surveyId]);
    $questions = $stmt->fetchAll();

    if (!$questions) {
        http_response_code(404);
        exit('No questions found for this survey.');
    }

    // Obtener respuestas
    $sql = "
        SELECT 
            r.responses_id,
            r.respondent_email,
            r.submitted_at,
            a.question_id,
            a.answer_text
        FROM responses r
        INNER JOIN answers a ON r.responses_id = a.response_id
        INNER JOIN questions q ON a.question_id = q.questions_id
        WHERE r.survey_id = :survey_id
        ORDER BY r.responses_id, q.display_order
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['survey_id' => $surveyId]);
    $rawAnswers = $stmt->fetchAll();

    $grouped = [];
    foreach ($rawAnswers as $row) {
        $email = $row['respondent_email'];
        if (!isset($grouped[$email])) {
            $grouped[$email] = [
                'email' => $email,
                'timestamp' => $row['submitted_at'], 
                'answers' => []
            ];
        }
        $grouped[$email]['answers'][$row['question_id']] = $row['answer_text'];
    }

    return [$questions, $grouped];
}

// Obtener título encuesta para nombre de archivo
$titleQuery = "SELECT title FROM surveys WHERE survey_id = :survey_id";
$stmt = $pdo->prepare($titleQuery);
$stmt->execute(['survey_id' => $surveyId]);
$survey = $stmt->fetch();

$surveyTitle = $survey ? $survey['title'] : 'survey';
$sanitizedTitle = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $surveyTitle);

// Switch según acción
switch ($action) {
    case 'csv':
        list($questions, $grouped) = getSurveyData($pdo, $surveyId);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $sanitizedTitle . '-answers.csv"');

        $output = fopen('php://output', 'w');

        $headers = array_merge(['Email', 'Timestamp'], array_column($questions, 'question_text'));
        fputcsv($output, $headers);

        foreach ($grouped as $response) {
            $row = [$response['email'], $response['timestamp']];
            foreach ($questions as $q) {
                $row[] = $response['answers'][$q['questions_id']] ?? '';
            }
            fputcsv($output, $row);
        }

        fclose($output);
        exit;

    case 'excel':
        list($questions, $grouped) = getSurveyData($pdo, $surveyId);

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment; filename="' . $sanitizedTitle . '-answers.xls"');

        $output = fopen('php://output', 'w');

        $headers = array_merge(['Email', 'Timestamp'], array_column($questions, 'question_text'));
        fputcsv($output, $headers, "\t");

        foreach ($grouped as $response) {
            $row = [$response['email'], $response['timestamp']];
            foreach ($questions as $q) {
                $row[] = $response['answers'][$q['questions_id']] ?? '';
            }
            fputcsv($output, $row, "\t");
        }

        fclose($output);
        exit;

    default:
        http_response_code(400);
        exit('Invalid action');
}
