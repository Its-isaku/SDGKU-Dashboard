<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once __DIR__ . '/../config/config.php'; 

error_log('manageSurveyData.php loaded');

function respond($status, $message, $data = null) {
    $response = ['status' => $status, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response); 
    exit;
}

//! <-------------------------------- GET(add) --------------------------------> - get program, cohort and subject
//?GET programs
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

//? GET cohorts
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getCohorts') {
    $programId = isset($_GET['program_id']) ? intval($_GET['program_id']) : null;
    try {
        if ($programId) {
            $stmt = $pdo->prepare("SELECT * FROM cohort WHERE status = 'active' AND program_id = ?");
            $stmt->execute([$programId]);
        } else {
            $stmt = $pdo->query('SELECT * FROM cohort');
        }
        $cohorts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $cohorts]);
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
            $sql = "SELECT subject_id, subject FROM subjects WHERE status = 'active' AND program_id = ?";
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
        
        //* validar si ya existe el cohort/section
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM cohort WHERE cohort = ? AND program_id = ? AND status = 'active'");
        $stmt->execute([$cohortName, $programId]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode(['status' => 'error', 'message' => 'already exists!.']);
            exit;
        }

        //* Insertar el nuevo cohort/section
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

//! <-------------------------------- GET(UPDATE) --------------------------------> - get program, cohort and subject

//? dellete Program
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'deleteProgram') {
    error_log('deleteProgram block entered');
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $programId = $data['programId'] ?? null;

        if (!$programId) {
            error_log('Invalid data received for deleteProgram: ' . json_encode($data));
            respond('error', 'Invalid data received!');
        }

        //* Delete all cohorts and course associated with the program
        $sql = "UPDATE cohort SET status = 'inactive' WHERE program_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$programId]);
        
        $sql = "UPDATE subjects SET status = 'inactive' WHERE program_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$programId]);

        //* Delete the program
        $sql = "UPDATE programs SET status = 'inactive' WHERE prog_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$programId]);
        respond('success', 'Program deleted successfully!');
    } catch (Exception $e) {
        error_log('Error deleting program: ' . $e->getMessage());
        respond('error', 'Database error: ' . $e->getMessage());
    }
    exit;
}

//?dellete Cohort
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'deleteCohort') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $cohortId = $data['cohortId'] ?? null;

        if (!$cohortId) {
            error_log('Invalid data received for deleteCohort: ' . json_encode($data));
            respond('error', 'Invalid data received!');
        }

        $sql = "UPDATE cohort SET status = 'inactive' WHERE cohort_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$cohortId]);
        respond('success', 'Cohort deleted successfully!');
    } catch (Exception $e) {
        error_log('Error deleting cohort: ' . $e->getMessage());
        respond('error', 'Database error: ' . $e->getMessage());
    }
    exit;
}

//? dellete Course
if( $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'deleteCourse') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $courseId = $data['courseId'] ?? null;

        if (!$courseId) {
            error_log('Invalid data received for deleteCourse: ' . json_encode($data));
            respond('error', 'Invalid data received!');
        }

        $sql = "UPDATE subjects SET status = 'inactive' WHERE subject_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$courseId]);
        respond('success', 'Course deleted successfully!');
    } catch (Exception $e) {
        error_log('Error deleting course: ' . $e->getMessage());
        respond('error', 'Database error: ' . $e->getMessage());
    }
    exit;
}

?>