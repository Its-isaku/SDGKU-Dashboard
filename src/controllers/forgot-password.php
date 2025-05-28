<?php
require_once '../config/config.php';
require_once __DIR__ . '/auth-functions.php';
require_once __DIR__ . '/../users/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? null;

    if (!$email) {
        echo json_encode([
            'success' => false,
            'message' => 'Email is required.'
        ]);
        exit;
    }

    error_log("Processing password reset request for email: $email");

    $result = handleForgotPassword($email);
    
    error_log("Password reset result for $email: " . ($result ? 'Success' : 'Failed'));

    if ($result === true) {
        echo json_encode([
            'success' => true,
            'message' => 'Password reset instructions have been sent to your email.'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'If your email is registered with our system, you will receive reset instructions shortly.'
        ]);
        error_log("Password reset failed for $email: " . ($result ?: 'Unknown error'));
    }

    exit;
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}