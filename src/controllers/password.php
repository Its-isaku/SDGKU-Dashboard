<?php
require_once '../config/config.php';
require '../vendor/autoload.php';

session_start();
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$method = $_SERVER['REQUEST_METHOD'];

//! ---------------------------- ACCIONES GET ----------------------------
if ($method === 'GET') {
    $action = $_GET['action'] ?? null;
    
    switch ($action) {
        // 
        // ! Acción GET no válida
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Unknown action']);
            break;
    }
    exit;
}

//! ---------------------------- ACCIONES POST ----------------------------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? null;

    if (!$action) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
        exit;
    }

    switch ($action) {
        // ? Recuperar contraseña
        case 'forgotPassword':
            $email = $input['email'] ?? null;
            if (!$email) {
                echo json_encode(['success' => false, 'message' => 'Email is required.']);
                break;
            }

            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user) {
                $token = bin2hex(random_bytes(32));
                $expires = date("Y-m-d H:i:s", strtotime('+1 hour'));
                $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?");
                $stmt->execute([$token, $expires, $email]);

                $mail = new PHPMailer(true);
                try {
                    $mail->isSMTP();
                    $mail->Host = 'smtp.gmail.com';
                    $mail->SMTPAuth = true;
                    $mail->Username = $_ENV['MAIL_USERNAME'];
                    $mail->Password = $_ENV['MAIL_PASSWORD'];
                    $mail->SMTPSecure = 'tls';
                    $mail->Port = 587;

                    $mail->setFrom('sdgku@sdgku.com', 'SDGKU');
                    $mail->addAddress($email);
                    $mail->isHTML(true);
                    $mail->Subject = 'Password Reset Request';
                    $mail->Body = "
                        <p>Reset your password:</p>
                        <a href='http://localhost/SDGKU-Dashboard/public/views/auth/reset-password.html?token=$token'>Click here</a>
                    ";
                    $mail->send();

                    echo json_encode(['success' => true, 'message' => 'Email sent successfully.']);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'message' => 'Failed to send email: ' . $mail->ErrorInfo]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'No account found with that email.']);
            }
            break;

        // ? Restablecer contraseña
        case 'resetPassword':
            $password = $input['password'] ?? null;
            $token = $input['token'] ?? null;

            if (!$password || !$token) {
                echo json_encode(['success' => false, 'message' => 'Missing data.']);
                break;
            }

            $stmt = $pdo->prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()");
            $stmt->execute([$token]);
            $user = $stmt->fetch();

            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Invalid or expired token.']);
                break;
            }

            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?");
            $stmt->execute([$hashed, $user['id']]);

            echo json_encode(['success' => true, 'message' => 'Password has been reset successfully.']);
            break;

        // ? Cambiar contraseña desde perfil
        case 'securityPassword':
            $current = $input['currentPassword'] ?? null;
            $new = $input['newPassword'] ?? null;

            if (!isset($_SESSION['user_id'])) {
                echo json_encode(['success' => false, 'message' => 'User not logged in.']);
                break;
            }

            if (!$current || !$new) {
                echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
                break;
            }

            $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($current, $user['password_hash'])) {
                echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
                break;
            }

            $newHashed = password_hash($new, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $stmt->execute([$newHashed, $_SESSION['user_id']]);

            echo json_encode(['success' => true, 'message' => 'Password changed successfully.']);
            break;

        // ! Acción POST no válida
        default:
            echo json_encode(['success' => false, 'message' => 'Unknown action.']);
            break;
    }
}
