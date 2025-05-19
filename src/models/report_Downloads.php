<?php
//! <|-------------------------------- Config & Headers --------------------------------|>
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//! <|----------------------- Download CSV Logic -----------------------|>
require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

try {
    $sql = "
        SELECT 
            s.survey_id AS id,
            st.type_name AS type,
            s.status,
            s.title,
            s.description,
            DATE_FORMAT(s.created_at, '%m-%d-%Y') AS createdDate,
            DATE_FORMAT(s.expires_at, '%m-%d-%Y') AS expires,
            pt.program_name AS program,
            DATE_FORMAT(s.last_edited, '%m-%d-%Y') AS last_edit,
            (SELECT COUNT(*) FROM questions q WHERE q.survey_id = s.survey_id) AS questions,
            (SELECT COUNT(*) FROM responses r WHERE r.survey_id = s.survey_id) AS responses
        FROM surveys s
        JOIN survey_types st ON s.survey_type_id = st.survey_type_id
        JOIN program_types pt ON s.program_type_id = pt.program_type_id
        INNER JOIN responses ON responses.survey_id = s.survey_id
        WHERE s.survey_id = responses.survey_id
GROUP BY 
            s.survey_id, 
            st.type_name, 
            s.status, 
            s.title,
            s.description, 
            s.created_at, 
            s.expires_at, 
            pt.program_name, 
            s.last_edited
        ORDER BY s.created_at DESC;
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $reports]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

//! <|----------------------- Download EXCEL Logic -----------------------|>


//! <|----------------------- Download PDF Logic -----------------------|>
