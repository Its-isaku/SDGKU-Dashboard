<?php
require_once '../config/config.php';

try {
    $data = [];

    // Fecha 3 meses atrás desde hoy
    // $threeMonthsAgo = date('Y-m-d H:i:s', strtotime('-3 months'));

    $sql = "
        SELECT 
            q.questions_id AS id,
            q.question_text AS question,
            st.type_name AS survey_type,
            ROUND(AVG(CAST(a.answer_text AS DECIMAL(3,2))), 2) AS average
        FROM 
            answers a
        JOIN 
            questions q ON a.question_id = q.questions_id
        JOIN 
            surveys s ON q.survey_id = s.survey_id
        JOIN 
            survey_types st ON s.survey_type_id = st.survey_type_id
        JOIN 
            responses r ON a.response_id = r.responses_id
        WHERE 
            q.question_type_id = 2 AND (st.survey_type_id = 3 OR st.survey_type_id = 4)
        GROUP BY 
            q.questions_id, q.question_text, st.type_name
        ORDER BY 
            q.questions_id
    ";

    $stmt = $pdo->prepare($sql);
    // $stmt->bindParam(':threeMonthsAgo', $threeMonthsAgo);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total = 0;
    $count = 0;
    $i = 1;

    foreach ($rows as $row) {
        $data[] = [
            'no' => $i++,
            'label' => $row['question'],
            'category' => $row['survey_type'],
            'value' => $row['average']
        ];
        $total += $row['average'];
        $count++;
    }

    $overallAverage = $count > 0 ? round($total / $count, 2) : 0;

    echo json_encode([
        'status' => 'success',
        'data' => $data,
        'average' => $overallAverage
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error retrieving overview data: ' . $e->getMessage()
    ]);
}
