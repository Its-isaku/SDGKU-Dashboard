<?php
require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

try {
    $sql = "
        SELECT 
            s.survey_id,
            s.title,
            s.description,
            s.created_at,
            st.type_name,
            (
                SELECT COUNT(*) 
                FROM questions q 
                WHERE q.survey_id = s.survey_id
            ) AS question_count
        FROM surveys s
        LEFT JOIN survey_types st ON s.survey_type_id = st.survey_type_id
        ORDER BY s.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $reports]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
