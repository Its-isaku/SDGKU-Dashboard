<?php
function handleLoginAttempts(string $email, string $password): bool {
    global $pdo;
    $stmt = $pdo->prepare("SELECT id, full_name, email, password_hash, role, status, failed_login_attempts FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user){return false;}

    if($user['status'] === 'locked'){return false;}

    if(password_verify($password, $user['password_hash'])){
        $stmt = $pdo->prepare("UPDATE users SET failed_login_attempts = 0 WHERE id = ?");
        $stmt->execute([$user['id']]);

        $_SESSION['user'] = [
            'id' => $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['user_email'] = $user['email'];

        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);

        return true;
    } else {
        handleFailedLogin($email);
        return false;
    }
}

function handlePasswordResetReq(string $email): bool {
    global $pdo;

    $stmt = $pdo->prepare("SELECT id, full_name FROM users WHERE email = ? AND status IN ('active', 'locked')");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user){return false;}

    $token = bin2hex(random_bytes(16));
    $expires = date('Y-m-d H:i:s', strtotime('+12 hour'));

    $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ?, failed_login_attempts = 0, status = 'active' WHERE id = ?");
    $stmt->execute([$token, $expires, $user['id']]);

    $mailer = SDGKU\Mail\Mailer::getMailer();
    return $mailer->sendPasswordReset($email, $token);
}

function handleForgotPassword(string $email): bool {
    global $pdo;

    $email = sanitizeEmail($email);
    if (!$email) {return false;}

    //~checking user status
    $stmt = $pdo->prepare("SELECT id, full_name FROM users WHERE email = ? AND status IN ('active', 'locked')");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {return false;}

    //~generate a reset token
    $token = bin2hex(random_bytes(16));
    $expires = date('Y-m-d H:i:s', strtotime('+12 hours'));

    $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?");
    $success = $stmt->execute([$token, $expires, $user['id']]);

    if (!$success) {return false;}

    logAction('forgot_password_request', "Password recovery requested for user ID: {$user['id']}", $user['id']);

    $mailer = SDGKU\Mail\Mailer::getMailer();
    return $mailer->sendForgotPasswordEmail($email, $user['full_name'], $token);
}

?>