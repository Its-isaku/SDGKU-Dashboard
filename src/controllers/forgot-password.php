<?php
require_once '../config/config.php';
require_once __DIR__ . '/auth-functions.php';
require_once __DIR__ . '/../users/functions.php';


header('Content-Type: application/json');


$input = json_decode(file_get_contents('php://input'), true); 
$email = $input['email'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? null;

    if (!$email) {
        echo json_encode([
            'success' => false,
            'message' => 'Email is required.'
        ]);
        exit;
    }

    handleForgotPassword($email);

    echo json_encode([
        'success' => true,
        'message' => 'Password reset email sent successfully.'
    ]);

    exit;
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}
?>