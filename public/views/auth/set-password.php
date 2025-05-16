<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Only start the session if it hasn't been started already
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// THIS IS THE KEY CHANGE: Check if this file is being included by the controller
if (!defined('CONTROLLER_INCLUDED')) {
    // Only require the controller if not already included
    require_once __DIR__ . '/../../../src/controllers/setPassword.php';
    
    error_log("Public set-password.php accessed with token: " . ($_GET['token'] ?? 'none'));
    error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
    
    $controller = new SetPasswordController();
    $controller->handleRequest();
    exit; // Exit here to prevent the rest of the file from executing
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--? FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!--? Main Style -->
    <link rel="stylesheet" href="../../assets/css/app/mainStyle.css">
    <!--? Login Style -->
    <link rel="stylesheet" href="../../assets/css/auth/login.css">

    <title>SDGKU Invite Link</title>
</head>

<body>
    <!--? Login -->
    <div class="login-container">

        <div class="homepage-link">
            <a href="../auth/login.html" class="homepage-link-btn">← Back to Login</a>
        </div>

        <div class="login-form-container">
            
            <div class="form-header">
                <h1>Complete Your Registration</h1>
                <p>Welcome to SDGKU! Please create a password to activate your account</p>
                <p class="form-sub-header">Your password must be at least 8 characters long.</p>
            </div>

            <?php if(isset($error)): ?>
            <div class="message error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <form id="invite-form" method="POST" action="">
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($token ?? ''); ?>">
                <!-- <div class="form-group">
                    <label for="password">Create Password</label>
                    <input type="password" name="password" id="password" required minlength="8" maxlength="20">
                </div> -->
                <div class="form-group password-field">
                    <label for="password">Password</label>
                    <div class="password-input-container">
                        <input type="password" name="password" id="password" required>
                        <i class="fas fa-eye-slash toggle-password" id="toggle-password"></i>
                    </div>
                </div>

                <div class="form-group password-field">
                    <label for="confirm-password">Confirm Password</label>
                    <div class="password-input-container">
                        <input type="password" name="confirm-password" id="confirm-password" required>
                        <i class="fas fa-eye-slash toggle-password" data-target="confirm-password"></i>
                    </div>
                </div>
                
                <!-- <div class="form-group password-field">
                    <label for="confirm-password">Confirm Password</label>
                    <div class="password-input-container">
                        <input type="password" name="confirm-password" id="confirm-password" required required minlength="8" maxlength="20"> 
                        <button type="button" class="toggle-password" id="toggler">
                            <i class="fa-solid fa-eye-slash" aria-hidden="true"></i>
                        </button>
                    </div>
                </div> -->

                <div class="form-action">
                    <button type="submit" class="form-btn" id="form-btn">Complete Registration</button>
                </div>
            </form>
        </div>  
    </div>  
    <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
    <script>
        document.getElementById('invite-form').addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                e.preventDefault(); 
                alert('Passwords do not match. Please try again.');
                return false;
            }

            if (password.length < 8) {
                e.preventDefault();
                alert('Password must be at least 8 characters long.');
                return false;
            }
            
            // If validation passes, allow the form to submit
            return true;
        });
    </script>
    <script src="../../assets/js/auth/toggle-visibility.js"></script>
</body>
</html>