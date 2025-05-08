<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once __DIR__ . '/../config/config.php'; 

function respond($status, $message, $data = null) {
    $response = ['status' => $status, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

//! <-------------------------------- GET --------------------------------> - get program, cohort and subject
//?GET programs
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getPrograms') {
    $programTypeId = isset($_GET['program_type_id']) ? trim($_GET['program_type_id']) : null;

    try {
        if ($programTypeId) {
            $sql = "SELECT prog_id, name, program_type_id FROM programs WHERE program_type_id = ?";
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

//? GET cohorts
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getCohorts') {
    try {
        $sql = "SELECT cohort_id, cohort FROM cohort";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $cohort = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $cohort]);
    } catch (Exception $e) {
        respond('error', 'Could not fetch cohorts.');
    }
    exit;
}

//? GET subjects
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getSubjects') {
    $programId = isset($_GET['program_id']) ? trim($_GET['program_id']) : null;
    try {
        if ($programId) {
            $sql = "SELECT DISTINCT s.subject_id, s.subject
                    FROM subjects s
                    INNER JOIN surveys v ON v.subject_id = s.subject_id
                    WHERE v.program_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$programId]);
        } else {
            $sql = "SELECT subject_id, subject FROM subjects";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
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

//? GET program types
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getProgramTypes') {
    try {
        $sql = "SELECT program_type_id, program_name FROM program_types";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $programTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$programTypes) {
            error_log('No program types found in the database.');
        }

        echo json_encode(['status' => 'success', 'data' => $programTypes]);
    } catch (Exception $e) {
        error_log('Error fetching program types: ' . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => 'Could not fetch program types.']);
    }
    exit;
}

//! <-------------------------------- POST --------------------------------> - add program, Cohort and subject
//? Add program
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'addProgram') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $programName = $data['programName'] ?? null;
        $programTypeId = $data['programTypeId'] ?? null;

        if (!$programName || !$programTypeId) {
            error_log('Invalid data received for addProgram: ' . json_encode($data));
            respond('error', 'Invalid data received!');
        }

        $sql = "INSERT INTO programs (name, program_type_id) VALUES(?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$programName, $programTypeId]);
        respond('success', 'Program added successfully!');
    } catch (Exception $e) {
        error_log('Error adding program: ' . $e->getMessage());
        respond('error', 'Database error: ' . $e->getMessage());
    }
    exit;
}

//? Add cohort
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'addCohort') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $cohortName = $data['cohortName'] ?? null;
        $programId = $data['programId'] ?? null;

        if (!$cohortName) {
            error_log('Invalid data received for addCohort: ' . json_encode($data));
            respond('error', 'Invalid data received!');
        }

        $sql = "INSERT INTO cohort (cohort, program_id) VALUES(?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$cohortName, $programId]);
        respond('success', 'Cohort added successfully!');
    } catch (Exception $e) {
        error_log('Error adding cohort: ' . $e->getMessage());
        respond('error', 'Database error: ' . $e->getMessage());
    }
    exit;
}

//? Add subject
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'addSubject') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $subjectName = $data['subjectName'] ?? null;
        $programId = $data['programId'] ?? null;

        if (!$subjectName) {
            error_log('Invalid data received for addSubject: ' . json_encode($data));
            respond('error', 'Invalid data received!');
        }

        $sql = "INSERT INTO subjects (subject, program_id) VALUES(?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$subjectName, $programId]);
        respond('success', 'Subject added successfully!');
    } catch (Exception $e) {
        error_log('Error adding subject: ' . $e->getMessage());
        respond('error', 'Database error: ' . $e->getMessage());
    }
    exit;
}

?>