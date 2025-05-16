<?php
require '../config/config.php';
require_once __DIR__ . '/../users/functions.php'; 

header('Content-Type: application/json');

/* ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL); */

$input = json_decode(file_get_contents('php://input'), true); 
$password = $input['password'] ?? null;
$token = $input['token'] ?? null;

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !$password || !$token) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request.'
    ]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()");
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid or expired token.'
    ]);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, status = 'active', failed_login_attempts = 0 WHERE id = ?");
$stmt->execute([$hashedPassword, $user['id']]);

logAction('password_reset', "Password reset processed for user ID: {$user['id']}, status updated to active", $user['id']);

echo json_encode([
    'success' => true,
    'message' => 'Password has been reset successfully.'
]);
?>