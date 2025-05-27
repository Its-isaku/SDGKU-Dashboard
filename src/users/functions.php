<?php
require_once __DIR__.'/../config/config.php';
require_once __DIR__. '/../mail/mailer.php';
use SDGKU\Mail\Mailer;

$mailer = Mailer::getMailer();

global $pdo;
if (!isset($pdo) || !$pdo){
    die("Database connection not established.");
}

//? generate and verify csrf -------------------------
function generateCSRFToken(): string {
    if(empty($_SESSION['csrf_token'])){
        $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
    } return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

//? authentication and authorization -------------------------
function isAuthenticated(): bool {return isset($_SESSION['user_id']);}

function getUserRole(): string {return $_SESSION['user_role'] ?? 'faculty';}

function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: /login.php');
        exit;
    }
}

function requireRole(string $role){
    requireAuth();
    $hierarchy = ['faculty' => 1, 'admin' => 2, 'super_admin' => 3];
    if (($hierarchy[getUserRole()] ?? 0) < ($hierarchy[$role] ?? 0)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied.']);
        exit;
    }
}

function addNewUser($fullName, $email, $role = 'faculty'){
    global $pdo;

    if(!preg_match('/@sdgku\.edu$/i', $email)){
        return [
            'success' => false,
            'message' => 'Only @sdgku.edu email domains are allowed'
        ];
    }
}

//? security -------------------------
function hashPassword($password): string {return password_hash($password, PASSWORD_BCRYPT);}

function sanitize($data){
    if (is_array($data)) {return array_map('sanitize', $data);} 
    else {return htmlspecialchars(strip_tags(trim($data)));}
}

function sanitizeEmail(string $email) {
    $clean = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    return filter_var($clean, FILTER_VALIDATE_EMAIL) ? $clean : false;
}

//? log records -------------------------
function logAction(string $action, string $description, ?int $userId = null){
    global $pdo;
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $stmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, description, ip_address, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$userId, $action, $description, $ip]);
}

//? locked acc functions -------------------------
function handleFailedLogin(string $email): void {
    global $pdo;
    
    //~ updating failed attempts and last failed time
    $pdo->prepare("
        UPDATE users SET failed_login_attempts = failed_login_attempts + 1, last_failed_login = NOW() WHERE email = ?")->execute([$email]);

    //~ checking if acc should be locked
    $stmt = $pdo->prepare("SELECT id, full_name, failed_login_attempts FROM users WHERE email = ? AND status != 'locked'
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && $user['failed_login_attempts'] >= 4) {
        //~generate a reset token when locking the account
        $token = bin2hex(random_bytes(16));
        $expires = date('Y-m-d H:i:s', strtotime('+12 hours'));
        
        //~ lock acc after 4 failed login attempts
        $pdo->prepare("UPDATE users SET status = 'locked', reset_token = ?, reset_token_expires = ? WHERE id = ?")
            ->execute([$token, $expires, $user['id']]);
        
        //~ log acc lock
        logAction('account_locked', "Account locked due to multiple failed login attempts for email: {$email}", $user['id']);
        
        //~ send locked acc email
        $mailer = SDGKU\Mail\Mailer::getMailer();
        $mailer->sendLockedAcc($email, $user['full_name'], $token);
    }
}
?>