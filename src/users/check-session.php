<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../users/functions.php';

// Validate that session user exists in database
$userId = $_SESSION['user_id'] ?? null;
$isValid = false;
$userData = null;

if ($userId) {
    $stmt = $pdo->prepare("SELECT id, full_name, email, role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userData) {
        // Update session with current database values
        $_SESSION['user_role'] = $userData['role'];
        $_SESSION['user_name'] = $userData['full_name'];
        $_SESSION['email'] = $userData['email'];
        $isValid = true;
    } else {
        // User doesn't exist anymore
        session_destroy();
    }
}

echo json_encode([
    'authenticated' => $isValid,
    'user' => $userData ? [
        'id' => $userData['id'],
        'name' => $userData['full_name'],
        'email' => $userData['email'],
        'role' => $userData['role']
    ] : null
]);