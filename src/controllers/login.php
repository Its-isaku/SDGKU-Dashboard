<?php
session_start();

require '../config/config.php';
require_once __DIR__ . '/auth-functions.php';
require_once __DIR__ . '/../users/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {    
    if (isset($_POST['email']) && isset($_POST['password'])) {
        $email = sanitizeEmail($_POST['email']);
        $password = $_POST['password'];
    } else {
        $input = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($input['email']) || !isset($input['password'])) {
            echo json_encode(['success' => false, 'message' => 'Missing email or password.']);
            exit;
        }
        
        $email = sanitizeEmail($input['email']);
        $password = $input['password'];
    }

    if ($email === false) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && $user['status'] === 'locked') {
        echo json_encode([
            'success' => false,  
            'message' => 'Account is locked due to multiple failed login attempts. Please check your email for instructions.'
        ]);
        exit;
    }

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['email'] = $user['email'];

        $_SESSION['user'] = [
            'id' => $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        //? reset failed login attempts after successful login
        $resetStmt = $pdo->prepare("UPDATE users SET failed_login_attempts = 0, last_login = NOW() WHERE email = ?");
        $resetStmt->execute([$email]);

        echo json_encode([
            'success' => true,
            'message' => 'Login successful.',
            'user' => [
                'id' => $_SESSION['user_id'],
                'email' => $_SESSION['email'] ?? $email,
                'name' => $_SESSION['user_name'],
                'role' => $_SESSION['user_role']
            ]
        ]);
        exit;
    } else {
        // Failed login attempt
        handleFailedLogin($email);
        logAction('login_failed', "Failed login attempt for email: $email", null);

        if ($user) {
            $checkStmt = $pdo->prepare("SELECT failed_login_attempts, status FROM users WHERE email = ?");
            $checkStmt->execute([$email]);
            $updatedUser = $checkStmt->fetch();

            if ($updatedUser && ($updatedUser['failed_login_attempts'] >= 3 || $updatedUser['status'] === 'locked')) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Account is locked due to multiple failed login attempts. Please check your email for instructions.'
                ]);
                exit;
            }
        } else {
            logAction('login_failed', "Failed login attempt for non-existent email: $email", null);
        }

        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}