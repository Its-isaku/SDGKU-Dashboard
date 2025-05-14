<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');


if (isset($_GET['action']) && in_array($_GET['action'], [
    'editSurvey', 
    'questionsSurvey', 
    'trueFalseQuestions', 
    'openQuestions', 
    'multipleQuestions', 
    'likert3Questions', 
    'likert5Questions'
])) {
    try {
       
        $action = $_GET['action'];
        $id = (int)$_GET['id'];
        
        // Validar ID
        if ($id <= 0) {
            throw new Exception("ID de encuesta inválido");
        }

        switch ($action) {
            case 'editSurvey':
                $stmt = $pdo->prepare("SELECT 
                    s.title,
                    st.type_name AS 'type',
                    s.description,
                    pt.program_name,
                    p.name,
                    sub.subject,
                    s.expires_at,
                    s.created_at,
                    s.survey_type_id
                    FROM surveys s
                    JOIN survey_types st ON st.survey_type_id = s.survey_type_id
                    JOIN program_types pt ON pt.program_type_id = s.program_type_id
                    JOIN programs p ON p.prog_id = s.program_id
                    JOIN subjects sub ON sub.subject_id = s.subject_id
                    WHERE s.survey_id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;

            case 'questionsSurvey':
                $stmt = $pdo->prepare("SELECT 
                    q.questions_id as question_id,
                    q.question_text,
                    q.question_type_id,
                    q.display_order
                    FROM questions q
                    WHERE q.survey_id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;

            case 'trueFalseQuestions':
                $stmt = $pdo->prepare("SELECT 
                    q.questions_id as question_id,
                    t.true_false_text,
                    t.type,
                    t.correct_answer
                    FROM true_false_options t
                    JOIN questions q ON q.questions_id = t.question_id
                    WHERE q.survey_id = ? AND t.type = 1");
                $stmt->execute([$id]);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;

            case 'openQuestions':
                $stmt = $pdo->prepare("SELECT 
                    o.open_id,
                    q.questions_id as question_id,
                    o.open_option_text
                    FROM open_options o
                    JOIN questions q ON q.questions_id = o.question_id
                    WHERE q.survey_id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;

            case 'multipleQuestions':
                $stmt = $pdo->prepare("SELECT
                    q.questions_id as question_id,
                    m.option_text,
                    q.display_order,
                    m.correct_answer
                    FROM multiple_options m
                    JOIN questions q ON q.questions_id = m.id_question
                    WHERE q.survey_id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;

            case 'likert3Questions':
                $stmt = $pdo->prepare("SELECT
                    q.questions_id as question_id,
                    q.question_text,
                    q.question_type_id,
                    q.display_order
                    FROM questions q
                    WHERE q.survey_id = ? AND q.question_type_id = 3");
                $stmt->execute([$id]);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;

            case 'likert5Questions':
                $stmt = $pdo->prepare("SELECT
                    q.questions_id as question_id,
                    q.question_text,
                    q.question_type_id,
                    q.display_order
                    FROM questions q
                    WHERE q.survey_id = ? AND q.question_type_id = 2");
                $stmt->execute([$id]);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                break;

            default:
                throw new Exception("Acción no válida");
        }

        // Enviar respuesta JSON
        echo json_encode($result ?: []);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    exit; // Terminar ejecución para evitar interferencias
}

// Si llega aquí, no era una petición de edición de encuesta
http_response_code(404);
echo json_encode(['error' => 'Endpoint no encontrado']);
?>
