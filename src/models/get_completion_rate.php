<?php
header('Content-Type: application/json');
require_once __DIR__ . '../config/config.php'; 

try {
    $sql = "
        SELECT 
            DATE_FORMAT(submitted_at, '%b') AS month,
            COUNT(*) AS completed
        FROM responses
        WHERE submitted_at IS NOT NULL
        GROUP BY month
        ORDER BY FIELD(month, 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec')
    ";

    $stmt = $pdo->query($sql);
    $labels = [];
    $data = [];

    while ($row = $stmt->fetch()) {
        $labels[] = $row['month'];
        $data[] = (int) $row['completed'];
    }

    echo json_encode([
        "status" => "success",
        "labels" => $labels,
        "data" => $data
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
