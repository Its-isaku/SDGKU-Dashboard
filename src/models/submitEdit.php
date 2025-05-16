<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

if (isset($_GET['action']) && $_GET['action'] === 'SendEditSurvey') {
    $id = (int)($_GET['id'] ?? 0);
    
    if ($id <= 0) {
        http_response_code(400); // Bad Request
        die(json_encode(['error' => 'ID de encuesta inválido']));
    }

    // Obtiene los datos enviados en el body (JSON)
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data === null) {
        http_response_code(400);
        die(json_encode(['error' => 'Datos JSON inválidos']));
    }

    // Definiciones iniciales
    $response = [];
    $Linkert5 = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
    $Linkert3 = ["Disagree", "Neutral", "Agree"];

    try {
        //? Survey Details Section
        if (isset($data['details'])) {
            $details = $data['details'];
            $title = $details['title'] ?? null;
            $description = $details['description'] ?? null;
            $type = $details['surveyType'] ?? null;
            $programType = $details['programType'] ?? null;
            $program = $details['program'] ?? null;
            $subject = $details['subject'] ?? null; 
            $expirationDate = $details['expirationDate'] ?? null;
            $createdAt = $details['createdAt'] ?? null;
            $status = "active";
            
            $sql = "UPDATE surveys s
                    JOIN programs p ON s.program_id = p.prog_id
                    JOIN program_types pt ON s.program_type_id = pt.program_type_id
                    JOIN survey_types st ON s.survey_type_id = st.survey_type_id
                    JOIN subjects sj ON s.subject_id = sj.subject_id
                    SET s.title = ?,
                        s.description = ?,
                        s.program_id = (SELECT prog_id FROM programs WHERE name = ? LIMIT 1),
                        s.program_type_id = (SELECT program_type_id FROM program_types WHERE program_type_id = ? OR program_name = ? LIMIT 1),
                        s.survey_type_id = (SELECT survey_type_id FROM survey_types WHERE type_name = ? LIMIT 1),
                        s.subject_id = (SELECT subject_id FROM subjects WHERE subject = ? LIMIT 1)
                    WHERE s.survey_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $title,
                $description,
                $program,
                $programType,
                $programType,
                $type,
                $subject,
                $id  // Añadido el ID para el WHERE
            ]);

            $response['details'] = [
                'status' => 'success',
                'message' => 'Detalles de la encuesta actualizados correctamente'
            ];
        }

        //? Questions Section
        if (isset($data['questions'])) {
            $questions = $data['questions'];
            $surveyId = $id;

            foreach ($questions as $qIndex => $question) {
                $questionTitle = $question['title'] ?? null;
                $questionType = $question['type'] ?? $question['questionType'] ?? null;
                $correctAnswer = $question['correctAnswer'] ?? null;
                $options = $question['options'] ?? [];

                //? Multiple Choice (type 1)
                if ($questionType == 1 || $questionType == "1") {
                    // Insertar pregunta
                    $sql = "INSERT INTO questions (survey_id, question_text, question_type_id, display_order) VALUES(?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$surveyId, $questionTitle, $questionType, $qIndex + 1]);
                    $questionId = $pdo->lastInsertId();

                    // Insertar opciones
                    foreach ($options as $i => $option) {
                        $displayOrder = $i + 1;
                        $sql = "INSERT INTO multiple_options (id_question, option_text, display_order) VALUES(?, ?, ?)";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([$questionId, $option, $displayOrder]);
                    }

                    // Actualizar respuesta correcta
                    $sql = "SELECT question_opt_id FROM multiple_options WHERE id_question = ? ORDER BY question_opt_id ASC";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$questionId]);
                    $optionIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

                    foreach ($optionIds as $index => $optionId) {
                        $isCorrect = ($index == $correctAnswer) ? 1 : 0;
                        $sql = "UPDATE multiple_options SET correct_answer = ? WHERE question_opt_id = ?";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([$isCorrect, $optionId]);
                    }
                }
                 //? if question_type = 2 (Linkert 1 -5)
                if($questionType == 2 || $questionType == "2") { 
                    //* Insert the question into the question table
                    $sql = "INSERT INTO questions (survey_id, question_text, question_type_id, display_order) VALUES(?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$surveyId, $questionTitle, $questionType, $qIndex + 1]);

                    //* Get the last inserted question ID
                    $questionId = $pdo->lastInsertId();

                    //* Insert the Linkert options into the Linkert_1_5 table
                    foreach ($Linkert5 as $i => $option) {
                        $scale_num = $i + 1;
                        $sql = "INSERT INTO Linkert_1_5 (question_id, scale_num, scale_option_text) VALUES(?, ?, ?)";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([$questionId, $scale_num, $option]);
                    }
                }

                //? if question_type = 3 (Linkert 1 -3) -> Pending to be made
                if($questionType == 3 || $questionType == "3") {
                    //* Insert the question into the question table
                    $sql = "INSERT INTO questions (survey_id, question_text, question_type_id, display_order) VALUES(?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$surveyId, $questionTitle, $questionType, $qIndex + 1]);

                    //* Get the last inserted question ID
                    $questionId = $pdo->lastInsertId();

                    //* Insert the Linkert options into the Linkert_1_3 table
                    foreach ($Linkert3 as $i => $option) {
                        $scale_num = $i + 1;
                        $sql = "INSERT INTO Linkert_1_3 (question_id, scale_num, scale_option_text) VALUES(?, ?, ?)";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([$questionId, $scale_num, $option]);
                    }
                }

                
                
                //? if question_type = 4 (Open ended)
                if($questionType == 4) {
                    //* Insert the question into the question table
                    $sql = "INSERT INTO questions (survey_id, question_text, question_type_id, display_order) VALUES(?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$surveyId, $questionTitle, $questionType, $qIndex + 1]);

                    //* Get the last inserted question ID
                    $questionId = $pdo->lastInsertId();

                    //* Insert the open ended options into the open_options table
                    $openOptionText = isset($question['open_option_text']) ? $question['open_option_text'] : null;
                    $sql = "INSERT INTO open_options (question_id, open_option_text) VALUES(?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$questionId, $openOptionText]);
                }
                
                //? if question_type = 5 (True/False)
                if($questionType == 5 || $questionType == "5") {
                    //* Insert the question into the question table
                    $sql = "INSERT INTO questions (survey_id, question_text, question_type_id, display_order) VALUES(?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$surveyId, $questionTitle, $questionType, $qIndex + 1]);

                    //* Get the last inserted question ID
                    $questionId = $pdo->lastInsertId();

                    //* Insert two rows: one for true (type=1), one for false (type=0), both with the question text
                    $sql = "INSERT INTO true_false_options (question_id, true_false_text, type, correct_answer) VALUES(?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    //* Set correct_answer = 1 for the correct option, 0 for the other
                    $correctAnswer = isset($question['correctAnswer']) ? $question['correctAnswer'] : null;
                    $stmt->execute([$questionId, $questionTitle, 1, ($correctAnswer == 1 ? 1 : 0)]); //* True
                    $stmt->execute([$questionId, $questionTitle, 0, ($correctAnswer == 0 ? 1 : 0)]); //* False
                }

                // Resto de tipos de pregunta (Linkert 5, Linkert 3, Open ended, True/False)
                // ... (mantener tu lógica actual para estos tipos)
            }

            $response['questions'] = [
                'status' => 'success',
                'message' => 'Preguntas actualizadas correctamente'
            ];
        }

        echo json_encode($response);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error de base de datos: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Acción no válida']);
}
?>