<?php
session_start();
require_once '../config/config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$currentPassword = $input['currentPassword'] ?? null;
$newPassword = $input['newPassword'] ?? null;

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

if (!$currentPassword || !$newPassword) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

$stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
    echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
    exit;
}

$newHashed = password_hash($newPassword, PASSWORD_DEFAULT);
$update = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
$update->execute([$newHashed, $_SESSION['user_id']]);

echo json_encode(['success' => true, 'message' => 'Password changed successfully.']);
?>
