<?php
//? Set error reporting to minimal for production
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ERROR | E_PARSE);
require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

//? Helper function for minimal JSON response
function respond($status, $message = '') {
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}

//! <-------------------------------- GET --------------------------------> - Get surveys data
//? GET program types
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getProgramTypes') {
    try {
        $sql = "SELECT * FROM program_types";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $programTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $programTypes]);
    } catch (Exception $e) {
        respond('error', 'Could not fetch program types.');
    }
    exit;
}

//? GET programs
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getPrograms') {
    $programTypeId = isset($_GET['program_type_id']) ? trim($_GET['program_type_id']) : null;

    try {
        if ($programTypeId) {
            $sql = "SELECT prog_id, name, program_type_id FROM programs WHERE status = 'active' AND program_type_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$programTypeId]);
        } else {
            $sql = "SELECT prog_id, name, program_type_id FROM programs";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
        }
        $programs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $programs]);
    } catch (Exception $e) {
        respond('error', 'Could not fetch programs.');
    }
    exit;
}

//? GET subjects filtered by program directly from subjects table
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getSubjects') {
    $programId = isset($_GET['program_id']) ? trim($_GET['program_id']) : null;
    try {
        if ($programId) {
            $sql = "SELECT subject_id, subject FROM subjects WHERE status = 'active' AND program_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$programId]);
        } else {
            echo json_encode(['status' => 'success', 'data' => []]);
            exit;
        }
        $subject = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $subject]);
    } catch (Exception $e) {
        respond('error', 'Could not fetch subjects.');
    }
    exit;
}

//? GET survey Types
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getSurveyTypes') {
    try {
        $sql = "SELECT survey_type_id, type_name FROM survey_types";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $surveyType = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $surveyType]);
    } catch (Exception $e) {
        respond('error', 'Could not fetch survey types.');
    }
    exit;
}

//! <-------------------------------- POST --------------------------------> - Create a survey
try {
    //? Input Handling
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $response = [];
    $Linkert5 = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
    $Linkert3 = ["Disagree", "Neutral", "Agree"];

    //? Survey Details Section
    if (isset($data['details'])) {
        $details = $data['details'];

        $title = $details['title'] ?? null;
        $description = $details['description'] ?? null;
        $type = $details['surveyType'] ?? null;
        $programType = $details['programType'] ?? null;
        $program = $details['program'] ?? null;
        $subject = $details['subject'] ?? null; 
        $createdAt = $details['createdAt'] ?? null;
        $status = "active";

        $token = bin2hex(random_bytes(16));

        try {
            $sql = "INSERT INTO surveys (title, description, program_type_id, program_id, subject_id, last_edited, created_at, status, token, survey_type_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $title,
                $description,
                $programType,
                $program,
                $subject,
                $createdAt,
                $createdAt,
                $status,
                $token,
                $type
            ]);

            $response = [
                'status' => 'success',
                'message' => 'Survey created successfully!'
            ];
        } catch (Exception $e) {
            respond('error', 'Database error: ' . $e->getMessage());
        }
    } else {
        respond('error', 'Invalid data received!');
    }

    //? Questions Section
    if (isset($data['questions'])) {
        $questions = $data['questions'];

        //? Get the last inserted survey ID
        $sql = "SELECT survey_id FROM surveys ORDER BY survey_id DESC LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $surveyId = $stmt->fetchColumn();

        foreach ($questions as $qIndex => $question) {
            $questionTitle = $question['title'] ?? null;
            $questionType = $question['type'] ?? $question['questionType'] ?? null;
            $correctAnswer = isset($question['correctAnswer']) ? $question['correctAnswer'] : null;
            $options = $question['options'] ?? [];

            try {
                //? Multiple Choice (type 1)
                if ($questionType == 1 || $questionType == "1") {
                    //* Insert the question into the question table
                    $sql = "INSERT INTO questions (survey_id, question_text, question_type_id, display_order) VALUES(?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$surveyId, $questionTitle, $questionType, $qIndex + 1]);

                    //* Get the last inserted question ID
                    $questionId = $pdo->lastInsertId();

                    //* Insert the options into the multiple_options table
                    foreach ($options as $i => $option) {
                        $displayOrder = $i + 1;
                        $sql = "INSERT INTO multiple_options (id_question, option_text, display_order) VALUES(?, ?, ?)";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([$questionId, $option, $displayOrder]);
                    }

                    //* Get the option IDs for this question
                    $sql = "SELECT question_opt_id FROM multiple_options WHERE id_question = ? ORDER BY question_opt_id ASC";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$questionId]);
                    $optionIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

                    //* Loop through the options and set correct_answer = 1 for the correct answer, 0 for others
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

                $response = [
                    'status' => 'success',
                    'message' => 'Survey created successfully!'
                ];
            } catch (Exception $e) {
                respond('error', 'Database error: ' . $e->getMessage());
            }
        }
    } else {
        respond('error', 'Invalid data received!');
    }
    echo json_encode($response);
} catch (Throwable $e) {
    respond('error', 'Fatal error.');
}