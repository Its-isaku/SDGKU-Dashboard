<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../models/responseHelper.php';
require_once __DIR__ . '/../controllers/surveyControllers.php';

header('Content-Type: application/json');

$controller = new SurveyController($pdo);

// Manejo de GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? null;

    switch ($action) {
        case 'getSurvey':
            $controller->getSurvey($_GET['token'] ?? null);
            break;
        case 'getCohorts':
            $controller->getCohorts($_GET['programId'] ?? null);
            break;
        case 'getQuestionOptions':
            $controller->getQuestionOptions($_GET['questionId'] ?? null, $_GET['type'] ?? null);
            break;
        default:
            jsonError('Invalid action', 404);
    }
}

// Manejo de POST (envío de respuestas)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $controller->submitResponse($data);
}
