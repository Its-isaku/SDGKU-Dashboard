<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../users/functions.php';

class SetPasswordController {
    private $token;
    private $error;
    private $isProduction;
    
    public function __construct() {
        $this->isProduction = defined('ENVIRONMENT') && ENVIRONMENT === 'production';

        if (session_status() === PHP_SESSION_NONE) {session_start();}
    }
    
    public function handleRequest() {
        $this->token = isset($_GET['token']) ? sanitize($_GET['token']) : '';
        
        if (empty($this->token)) {
            $this->error = 'Invalid or missing token';
            $this->displayForm();
            return;
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->processFormSubmission();
        } else {
            generateCSRFToken();
            $this->displayForm();
        }
    }
    
    private function processFormSubmission() {
        if (!$this->isProduction) {
            error_log("Processing form submission with POST data: " . print_r($_POST, true));
        } else {error_log("Password reset form submission initiated");}
        
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirm-password'] ?? '';
        $submittedToken = $_POST['token'] ?? '';
        
        if ($this->token !== $submittedToken) {
            error_log("Token mismatch: {$this->token} vs $submittedToken");
            $this->error = 'Invalid token';
            $this->displayForm();
            return;
        }
        
        if (strlen($password) < 8) {
            $this->error = 'Password must be at least 8 characters long';
            $this->displayForm();
            return;
        }
        
        if ($password !== $confirmPassword) {
            $this->error = 'Passwords do not match';
            $this->displayForm();
            return;
        }

        global $pdo;
        $stmt = $pdo->prepare("SELECT id FROM users WHERE invite_token = ? AND invite_token_expires > NOW()");
        $stmt->execute([$this->token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            error_log("Invalid or expired token: {$this->token}");
            $this->error = 'Invalid or expired token';
            $this->displayForm();
            return;
        }
        
        error_log("User found with ID: " . $user['id']);

        $hashedPassword = hashPassword($password);
        
        try {
            $stmt = $pdo->prepare("
            UPDATE users SET password_hash = ?, status = 'active', invite_token = NULL,invite_token_expires = NULL, updated_at = NOW() WHERE id = ?");
            $result = $stmt->execute([$hashedPassword, $user['id']]);
            
            if ($result) {
                error_log("User updated successfully");

                logAction('account_activated', "User completed registration", $user['id']);

                header('Location: /SDGKU-Dashboard/public/views/auth/login.html?status=registered'); //TODO: LINK TO LOGIN PAGE
                exit;
            } else {
                error_log("Update query executed but no rows affected");
                $this->error = 'Failed to update your account';
                $this->displayForm();
            }
        } catch (PDOException $e) {
            error_log("Database exception: " . $e->getMessage());
            $this->error = 'Database error occurred. Please try again or contact support.';
            $this->displayForm();
        }
    }
    
    private function displayForm() {
        $token = $this->token;
        $error = $this->error ?? null;

        define('CONTROLLER_INCLUDED', true);
        
        include __DIR__ . '/../../public/views/auth/set-password.php';
        exit;
    }
}
?>