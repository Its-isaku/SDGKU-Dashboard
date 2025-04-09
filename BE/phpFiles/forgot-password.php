<?php
require 'config.php';
//require _DIR_ . '/../vendor/autoload.php';

//use PHPMailer\PHPMailer\PHPMailer;
//use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$input = json_decode(file_get_contents('php://input'), true); 
$email = $input['email'] ?? null;

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !$email) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request.'
    ]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    $token = bin2hex(random_bytes(32));
    $expires = date("Y-m-d H:i:s", strtotime('+1 hour'));

    $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?");
    $stmt->execute([$token, $expires, $email]);

   // $mail = new PHPMailer(true);

    try {
        // $mail->isSMTP();
        // $mail->Host = 'smtp.gmail.com';
        // $mail->SMTPAuth = true;
        // $mail->Username = 'paola.gomez.faustino@uabc.edu.mx';
        // $mail->Password = '';
        // $mail->SMTPSecure = 'tls';
        // $mail->Port = 587;

        // $mail->setFrom('sdgku@sdgku.com', 'SDGKU');
        // $mail->addAddress($email);

        // $mail->isHTML(true);
        // $mail->Subject = 'Password Reset Request';
        // $mail->Body = "
        //     <h3>Hello,</h3>
        //     <p>We received a request to reset your password.</p>
        //     <p>Click the link below to set a new password:</p>
        //     <p><a href='http://localhost/SDGKU-Dashboard-main/FE/reset-password.html?token=$token'>Reset Password</a></p>
        //     <p>This link will expire in 1 hour.</p>
        // ";

        // $mail->send();

        echo json_encode([
            'success' => true,
            'message' => 'Email sent successfully. Please check your inbox.'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send email: ' . $mail->ErrorInfo
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No account found with that email address.'
    ]);
}
?>