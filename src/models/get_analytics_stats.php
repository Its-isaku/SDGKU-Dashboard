<?php
require_once '../config/config.php';

try {
    $sql = "SELECT COUNT(*) AS total_surveys FROM surveys WHERE status = 'active'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => [
            'totalSurveys' => $result['total_surveys']
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch analytics stats: ' . $e->getMessage()
    ]);
}
