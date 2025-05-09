<?php
require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

try {
    // Total surveys
    $stmtTotal = $pdo->query("SELECT COUNT(*) AS total FROM surveys");
    $totalSurveys = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total'];

    // Active surveys
    $stmtActive = $pdo->query("SELECT COUNT(*) AS active FROM surveys WHERE status = 'active'");
    $activeSurveys = $stmtActive->fetch(PDO::FETCH_ASSOC)['active'];

    // Inactive surveys
    $stmtInactive = $pdo->query("SELECT COUNT(*) AS inactive FROM surveys WHERE status = 'inactive'");
    $inactiveSurveys = $stmtInactive->fetch(PDO::FETCH_ASSOC)['inactive'];

    // Responses (ejemplo: supón que hay una tabla llamada responses o submissions)
    $stmtResponses = $pdo->query("SELECT COUNT(*) AS responses FROM responses");
    $responses = $stmtResponses->fetch(PDO::FETCH_ASSOC)['responses'];

    // Completion rate (puedes ajustarlo más adelante) / *se cambio a inactive surveys
    //$completionRate = "87%"; // Placeholder

    echo json_encode([
        "totalSurveys" => $totalSurveys,
        "activeSurveys" => $activeSurveys,
        "inactiveSurveys" => $inactiveSurveys,
        "responses" => $responses

        //"completionRate" => $completionRate / se cambio a inactive surveys
    ]);

} catch (PDOException $e) {
    echo json_encode(["error" => "Error fetching dashboard stats: " . $e->getMessage()]);
}
