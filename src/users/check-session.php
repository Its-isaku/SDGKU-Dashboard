<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../users/functions.php';

$userId = $_SESSION['user_id'] ?? null;
$isValid = false;
$userData = null;
$response = ['authenticated' => false, 'user' => null];

$isAuthenticated = isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);

if ($isAuthenticated) {
    $stmt = $pdo->prepare("SELECT id, full_name, email, role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userData) {
        $_SESSION['user_role'] = $userData['role'];
        $_SESSION['user_name'] = $userData['full_name'];
        $_SESSION['user_email'] = $userData['email'];
        $isValid = true;
        
        $response = [
            'authenticated' => true,
            'user' => [
                'id' => $userData['id'],
                'full_name' => $userData['full_name'],
                'email' => $userData['email'],
                'role' => $userData['role']
            ]
        ];
    } else {
        //* if invalid user id in session, destroy session
        session_destroy();
    }
}

echo json_encode($response);
exit;
?>