<?php
require_once '../config/config.php';

if (!isset($_GET['id'])) {
    http_response_code(400);
    exit('Missing survey ID');
}

$surveyId = intval($_GET['id']);

// Obtener todas las preguntas del survey ordenadas
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

// Obtener respuestas junto con el correo y timestamp
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

// Agrupar por responses_id
$grouped = [];
foreach ($rawAnswers as $row) {
    $responseId = $row['responses_id'];
    if (!isset($grouped[$responseId])) {
        $grouped[$responseId] = [
            'email' => $row['respondent_email'],
            'timestamp' => $row['submitted_at'],
            'answers' => []
        ];
    }
    $grouped[$responseId]['answers'][$row['question_id']] = $row['answer_text'];
}

// Preparar salida CSV
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="survey_' . $surveyId . '_responses.csv"');

$output = fopen('php://output', 'w');

// Escribir encabezados: Email, Timestamp, luego preguntas
$headers = array_merge(['Email', 'Timestamp'], array_column($questions, 'question_text'));
fputcsv($output, $headers);

// Escribir respuestas
foreach ($grouped as $response) {
    $row = [$response['email'], $response['timestamp']];
    foreach ($questions as $q) {
        $row[] = $response['answers'][$q['questions_id']] ?? '';
    }
    fputcsv($output, $row);
}

fclose($output);
exit;
