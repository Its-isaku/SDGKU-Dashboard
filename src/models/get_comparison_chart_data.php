<?php
//! <|-------------------------------- Config & Headers --------------------------------|>
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//! <|-------------------------------- Helper Functions --------------------------------|>
//? Obtener todas las preguntas correctas (opción múltiple y true/false) para una encuesta
function getCorrectAnswers($conn, $surveyId) {
    
    $sql = "SELECT 
                q.questions_id,
                q.question_type_id,
                mo.option_text AS correct_option_text,
                tf.true_false_text AS correct_tf_text
            FROM questions q
            LEFT JOIN multiple_options mo ON mo.id_question = q.questions_id AND mo.correct_answer = 1
            LEFT JOIN true_false_options tf ON tf.question_id = q.questions_id AND tf.correct_answer = 1
            WHERE q.survey_id = ?
            AND q.question_type_id IN (1, 5)";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$surveyId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

//? Obtener todas las respuestas dadas por usuarios para una encuesta
function getAnswers($conn, $surveyId) {
    $sql = "SELECT 
                a.question_id,
                a.answer_text
            FROM answers a
            JOIN questions q ON q.questions_id = a.question_id
            WHERE q.survey_id = ?
            AND q.question_type_id IN (1, 5)";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute([$surveyId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

//? Comparar respuestas del usuario con las correctas y calcular porcentajes
function calculateScores($correctAnswers, $userAnswers) {
    $scores = [];
    $counts = [];

    //* hago un map de cual es la respuesta correcta pa cada pregunta
    $correctMap = [];
    foreach ($correctAnswers as $row) {
        $qid = $row['questions_id'];
        $correctValue = $row['correct_option_text'] ?? $row['correct_tf_text'];
        $correctMap[$qid] = $correctValue;
        $scores[$qid] = 0;
        $counts[$qid] = 0;
    }

    //* aqui comparo cada respuesta con la correcta y sumo si esta bien
    foreach ($userAnswers as $ans) {
        $qid = $ans['question_id'];
        $response = trim($ans['answer_text']);
        if (!isset($correctMap[$qid])) continue;

        $correct = trim($correctMap[$qid]);
        $counts[$qid]++;
        if ($response === $correct) {
            $scores[$qid]++;
        }
    }

    //* saco porcentaje de aciertos por pregunta
    $percentages = [];
    foreach ($scores as $qid => $correctCount) {
        $total = $counts[$qid];
        $percentages[$qid] = $total > 0 ? $correctCount / $total : 0;
    }

    return $percentages;
}

//! <|-------------------------------- Data Processing Logic --------------------------------|>

//? Obtener preguntas correctas de pre y post
$preQuestions = getCorrectAnswers($conn, $preSurveyId);
$postQuestions = getCorrectAnswers($conn, $postSurveyId);

//? Mapear preguntas por texto para empatar pre y post
$preMap = [];
foreach ($preQuestions as $q) $preMap[$q['question_text']] = $q;
$postMap = [];
foreach ($postQuestions as $q) $postMap[$q['question_text']] = $q;

//? Encontrar preguntas comunes
$commonQuestions = array_intersect(array_keys($preMap), array_keys($postMap));

//? Obtener respuestas de usuarios
$preAnswers = getAnswers($conn, $preSurveyId);
$postAnswers = getAnswers($conn, $postSurveyId);

//? Calcular scores por pregunta
$preScores = calculateScores($preQuestions, $preAnswers);
$postScores = calculateScores($postQuestions, $postAnswers);

//? Preparar datos para la gráfica
$labels = [];
$preData = [];
$postData = [];

$totalPre = 0;
$totalPost = 0;
$preCount = 0;
$postCount = 0;

//? por cada pregunta comun, saco el % de aciertos y lo guardo pa la grafica
foreach ($commonQuestions as $qtext) {
    $preQ = $preMap[$qtext];
    $postQ = $postMap[$qtext];
    $preId = $preQ['questions_id'];
    $postId = $postQ['questions_id'];

    $preVal = $preScores[$preId] ?? 0;
    $postVal = $postScores[$postId] ?? 0;

    $labels[] = $qtext;
    $preData[] = round($preVal * 100, 2);
    $postData[] = round($postVal * 100, 2);

    $totalPre += $preVal;
    $totalPost += $postVal;
    $preCount++;
    $postCount++;
}

//! <|-------------------------------- Output JSON --------------------------------|>
//? Calcular promedios generales y cambio porcentual
$preAvg = $preCount > 0 ? ($totalPre / $preCount) * 100 : 0;
$postAvg = $postCount > 0 ? ($totalPost / $postCount) * 100 : 0;
$change = $preAvg > 0 ? (($postAvg - $preAvg) / $preAvg) * 100 : 0;

//? Enviar datos en formato JSON para la gráfica
echo json_encode([
    'status' => 'success',
    'data' => [
        'labels' => $labels,
        'pre' => $preData,
        'post' => $postData,
        'preAvg' => $preAvg,
        'postAvg' => $postAvg,
        'change' => $change
    ]
]);
