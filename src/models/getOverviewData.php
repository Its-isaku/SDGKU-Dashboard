<?php
require_once '../config/config.php';

try {
    $data = [];

    $from = $_GET['from'] ?? null;
    $to = $_GET['to'] ?? null;
    $surveyTypeId = $_GET['programId'] ?? 'all';

    $sql = "
        SELECT 
            q.questions_id AS id,
            q.question_text AS question,
            st.type_name AS survey_type,
            ROUND(AVG(CAST(a.answer_text AS DECIMAL(3,2))), 2) AS average
        FROM answers a
        JOIN questions q ON a.question_id = q.questions_id
        JOIN surveys s ON q.survey_id = s.survey_id
        JOIN survey_types st ON s.survey_type_id = st.survey_type_id
        JOIN responses r ON a.response_id = r.responses_id
        WHERE q.question_type_id = 2
        AND (st.survey_type_id = 4 OR st.survey_type_id = 5)
    ";

    $params = [];

    if ($from && $to) {
        $sql .= " AND r.submitted_at BETWEEN :from AND :to";
        $params[':from'] = $from . ' 00:00:00';
        $params[':to'] = $to . ' 23:59:59';
    }

    if ($surveyTypeId !== 'all') {
        $sql .= " AND s.survey_type_id = :surveyTypeId";
        $params[':surveyTypeId'] = $surveyTypeId;
    }

    $sql .= " GROUP BY q.questions_id, q.question_text, st.type_name ORDER BY q.questions_id";

    $stmt = $pdo->prepare($sql);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

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
