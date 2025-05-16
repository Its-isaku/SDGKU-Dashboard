<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');
//!--------------------------------Delete All questions--------------------------------->

// <------------------------------ Delete Question (POST) ------------------------------>
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Acción 1: deleteQuestion
    if (isset($data['action']) && $data['action'] === 'deleteQuestion') {
        // ... (tu código actual de deleteQuestion)
        try {
            if (!isset($data['questionsToDelete']) || !is_array($data['questionsToDelete'])) {
                http_response_code(400);
                echo json_encode(['error' => 'IDs de preguntas no proporcionados o formato incorrecto']);
                exit;
            }
            
            $pdo->beginTransaction();
            $queries = [
                "DELETE FROM true_false_options WHERE question_id = ?",
                "DELETE FROM multiple_options WHERE id_question = ?",
                "DELETE FROM open_options WHERE question_id = ?",
                "DELETE FROM Linkert_1_5 WHERE question_id = ?",
                "DELETE FROM Linkert_1_3 WHERE question_id = ?",
                "DELETE FROM questions WHERE questions_id = ?"
            ];
            
            foreach ($data['questionsToDelete'] as $questionId) {
                $questionId = (int)$questionId;
                foreach ($queries as $sql) {
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$questionId]);
                }
            }
            
            $pdo->commit();
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Preguntas eliminadas correctamente']);
            
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . $e->getMessage()]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
        }
        exit;
    }
    // Acción 2: deleteAllQuestions
    if (isset($data['action']) && $data['action'] === 'deleteAllQuestions') {
        try {
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID no proporcionado']);
                exit;
            }
            
            $id = (int)$data['id']; // Usamos $data, no $input
            $pdo->beginTransaction();
            
            // Consultas separadas (cada DELETE en su propio string)
            $queries = [
                "DELETE true_false_options FROM true_false_options 
                INNER JOIN questions ON true_false_options.question_id = questions.questions_id 
                WHERE questions.survey_id = ?",

                "DELETE multiple_options FROM multiple_options 
                INNER JOIN questions ON multiple_options.id_question = questions.questions_id 
                WHERE questions.survey_id = ?",
                
                "DELETE open_options FROM open_options 
                INNER JOIN questions ON open_options.question_id = questions.questions_id 
                WHERE questions.survey_id = ?",
                
                "DELETE Linkert_1_5 FROM Linkert_1_5 
                INNER JOIN questions ON Linkert_1_5.question_id = questions.questions_id 
                WHERE questions.survey_id = ?",
                
                "DELETE Linkert_1_3 FROM Linkert_1_3 
                INNER JOIN questions ON Linkert_1_3.question_id = questions.questions_id 
                WHERE questions.survey_id = ?",
                
                "DELETE FROM questions WHERE survey_id = ?"
            ];
            
            foreach ($queries as $sql) {
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$id]);
            }
            
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Todas las preguntas eliminadas']);
            
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
        }
        exit;
    }
}

// <------------------------------ Get Survey Data (GET) ------------------------------>
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $validActions = [
        'editSurvey', 
        'questionsSurvey', 
        'trueFalseQuestions', 
        'openQuestions', 
        'multipleQuestions', 
        'likert3Questions', 
        'likert5Questions'
    ];
    
    if (isset($_GET['action']) && in_array($_GET['action'], $validActions)) {
        try {
            $action = $_GET['action'];
            $id = (int)$_GET['id'];
            
            if ($id <= 0) {
                throw new Exception("ID de encuesta inválido");
            }

            switch ($action) {
                case 'editSurvey':
                    $stmt = $pdo->prepare("SELECT 
                        s.survey_id,
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
                    break;

                case 'questionsSurvey':
                    $stmt = $pdo->prepare("SELECT 
                        q.questions_id as question_id,
                        q.question_text,
                        q.question_type_id,
                        q.display_order
                        FROM questions q
                        WHERE q.survey_id = ?");
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
                    break;

                case 'openQuestions':
                    $stmt = $pdo->prepare("SELECT 
                        o.open_id,
                        q.questions_id as question_id,
                        o.open_option_text
                        FROM open_options o
                        JOIN questions q ON q.questions_id = o.question_id
                        WHERE q.survey_id = ?");
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
                    break;

                case 'likert3Questions':
                    $stmt = $pdo->prepare("SELECT
                        q.questions_id as question_id,
                        q.question_text,
                        q.question_type_id,
                        q.display_order
                        FROM questions q
                        WHERE q.survey_id = ? AND q.question_type_id = 3");
                    break;

                case 'likert5Questions':
                    $stmt = $pdo->prepare("SELECT
                        q.questions_id as question_id,
                        q.question_text,
                        q.question_type_id,
                        q.display_order
                        FROM questions q
                        WHERE q.survey_id = ? AND q.question_type_id = 2");
                    break;
            }

            $stmt->execute([$id]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($result ?: []);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
        exit;
    }
}

// <------------------------------ Petición no válida ------------------------------>
http_response_code(404);
echo json_encode(['error' => 'Endpoint no encontrado']);
?>