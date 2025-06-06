<?php
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../users/functions.php';

session_write_close();

$userId = $_SESSION['user_id'] ?? null;
$response = ['authenticated' => false, 'user' => null];

$isAuthenticated = isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);

if ($isAuthenticated) {
    try {
        $stmt = $pdo->prepare("SELECT id, full_name, email, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($userData) {
            $response = [
                'authenticated' => true,
                'user' => [
                    'id' => $userData['id'],
                    'full_name' => $userData['full_name'],
                    'email' => $userData['email'],
                    'role' => $userData['role']
                ]
            ];
        }
    } catch (PDOException $e) {
        error_log("Database error in check-session: " . $e->getMessage());
        $response['error'] = 'Database error';
    }
}

echo json_encode($response);
exit;
?>