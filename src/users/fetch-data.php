<?php
ob_start();

header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

if (session_status() === PHP_SESSION_NONE) {session_start();}

require_once __DIR__. '/functions.php';
require_once __DIR__. '/../config/config.php';

error_log("SESSION DATA IN FETCH-DATA: " . json_encode($_SESSION));
$action = $_GET['action'] ?? '';

try {
    $currentUserId = $_SESSION['user_id'] ?? null;
    $currentUserRole = $_SESSION['user_role'] ?? 'faculty';

    if ($currentUserId) {
        error_log("Validating session for user ID: $currentUserId");
        $checkStmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
        $checkStmt->execute([$currentUserId]);
        $dbUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($dbUser) {
            $_SESSION['user_role'] = $dbUser['role'];
            $currentUserRole = $dbUser['role'];
            error_log("Updated role from DB: " . $currentUserRole);
        } else {
            error_log("User ID $currentUserId not found in database");
            //~ invalid user ID in session
            session_destroy();
            throw new Exception('Invalid user session', 401);
        }
    }

    error_log("User ID from session: $currentUserId");
    error_log("User role from session: $currentUserRole");
    
    //TODO: Force super_admin role for testing - REMOVE THIS IN PRODUCTION
    /* $currentUserRole = $_SESSION['user_role'] ?? 'super_admin'; */
    //$currentUserRole = 'super_admin';
    //error_log("Action: $action, Role: $currentUserRole, ID: $currentUserId");

    if ($currentUserRole === 'master admin') {$currentUserRole = 'super_admin';}

    //! comment this for testing
    if (!isAuthenticated()){throw new Exception('Unauthorized', 401);} // verify auth

    switch ($action){
        case 'fetch_users':
            $search = $_GET['search'] ?? '';
            $query = "SELECT id, full_name, email, role, status FROM users WHERE 1=1";
            $params = [];
            
            //~search filter
            if (!empty($search)) {
                $query .= " AND (full_name LIKE ? OR email LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%"; //! DO NOT delete this line 
            }
            
            //~filters based on role
            if ($currentUserRole === 'admin') {$query .= " AND role != 'super_admin'";} 
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'users' => $users]);
            break;
            
        case 'add_user':
            //~check permissions
            if ($currentUserRole === 'faculty') {throw new Exception('Forbidden', 403);}
            
            //TODO: REMOVE THIS IN PRODUCTION (this was removed)
            error_log("add_user: Starting to process request");
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);

            $fullName = $data['full_name'] ?? '';
            $email = $data['email'] ?? '';
            $role = $data['role'] ?? 'faculty';

            error_log("fullName: $fullName, email: $email, role: $role");
            
            //~validation
            if (empty($fullName) || empty($email)) {
                error_log("Validation failed: name or email empty");
                throw new Exception('Name and email are required');
            }
            
            //~check if email exists in db
            $stmt = $pdo->prepare("SELECT email FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->rowCount() > 0) {
                throw new Exception('Email already exists');
            }
            
            //~invitation token
            $token = bin2hex(random_bytes(16));
            $expires = date('Y-m-d H:i:s', strtotime('+12 hours'));
            
            //~adding user to db ------------------------>
            $pdo->beginTransaction();
            
            try {
                //~insert directly into users table with the token fields
                $stmt = $pdo->prepare("INSERT INTO users (full_name, email, role, status, created_at, updated_at, invite_token, invite_token_expires) VALUES (?, ?, ?, 'pending', NOW(), NOW(), ?, ?)");
                $stmt->execute([$fullName, $email, $role, $token, $expires]);
                $userId = $pdo->lastInsertId();

                logAction('user_created', "Created new $role user: $email", $currentUserId);

                $pdo->commit();
                
                $emailSent = false; //~default value
                
                try {
                    //* call mailer class
                    $mailer = SDGKU\Mail\Mailer::getMailer();
                    
                    error_log("About to send invitation email to $email with token $token");
                    
                    //~sending invitation email
                    if (!$mailer->sendInvitation($email, $fullName, $token)) {
                        error_log("Mailer->sendInvitation returned false for $email");
                        $emailSent = false;
                    } else {
                        error_log("Invitation email successfully sent to $email");
                        $emailSent = true;
                    }
                } catch (Exception $emailEx) {
                    error_log("Email exception: " . $emailEx->getMessage());
                    $emailSent = false;
                }
                
                $message = 'User added successfully';
                if (!$emailSent) {$message .= ', but invitation email could not be sent';} else {$message .= ' and invitation sent';}
                
                echo json_encode(['success' => true, 'message' => $message]);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                error_log("Database error in add_user: " . $e->getMessage());
                throw new Exception('Database error: ' . $e->getMessage());
            }
            break;

        case 'update_user_role':
            if ($currentUserRole !== 'super_admin') {throw new Exception('Forbidden', 403);}

            $data = json_decode(file_get_contents('php://input'), true);
            $userId = (int)($data['user_id'] ?? 0);
            $newRole = sanitize($data['role'] ?? 'faculty');

            //~ validate new role
            if (!in_array($newRole, ['faculty', 'admin', 'super_admin'])){throw new Exception('Invalid role');}
            
            //~ fetch target user current role
            $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {throw new Exception('User not found');}
            $currentRole = $user['role'];

            //* validations -------------------------------->
            //~ prevent self-demotion 
            if ($userId === $currentUserId && $newRole !== 'super_admin'){throw new Exception('Cannot remove your own main admin status');}

            //~ update user role
            $stmt = $pdo->prepare("UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$newRole, $userId]);

            //~ log action
            logAction('user_role_update', "Updated user $userId role from $currentRole to $newRole", $currentUserId);

            echo json_encode(['success' => true, 'message' => 'User role updated']);
            break;        
        
        case 'resend_invite':
            if ($currentUserRole === 'faculty') {throw new Exception('Forbidden', 403);}
            
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = (int)($data['user_id'] ?? 0);

            $stmt = $pdo->prepare("SELECT email, full_name FROM users WHERE id = ? AND status = 'pending'");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {throw new Exception('User not found or already accepted');}

            //~ generate new token
            $token = bin2hex(random_bytes(16));
            $expires = date('Y-m-d H:i:s', strtotime('+12 hours'));            
            
            $pdo->beginTransaction();

            try {
                $stmt = $pdo->prepare("UPDATE users SET invite_token = ?, invite_token_expires = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$token, $expires, $userId]);

                logAction('user_invite_resend', "Resent invitation to user $userId", $currentUserId);
                $pdo->commit();

                $emailSent = true;

                try {
                    $mailer = SDGKU\Mail\Mailer::getMailer();
                    if (!$mailer->sendInvitation($user['email'], $user['full_name'], $token)) {
                        $emailSent = false;
                    }
                } catch (Exception $e) {
                    error_log("Email exception in resend_invite: " . $e->getMessage());
                    $emailSent = false;
                }

                $message = 'Invitation resent';
                if (!$emailSent) {
                    $message .= ', but email could not be delivered';
                }

                echo json_encode(['success' => true, 'message' => 'Invitation resent']);
            } catch (Exception $e) {
                $pdo->rollBack();
                error_log("Error in resend_invite: " . $e->getMessage());
                throw $e;
            }
            break;

        case 'delete_user':
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = (int)($data['user_id'] ?? 0);

            //~ fetch target user current role
            $stmt = $pdo->prepare("SELECT role, email FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {throw new Exception('User not found');}
            $targetRole = $user['role'];

            //* validations --------------------------------
            //~ check perms
            if ($targetRole === 'super_admin' && $currentUserRole !== 'super_admin'){throw new Exception('Only master admin can delete master admin accounts');}
            if ($targetRole === 'admin' && $currentUserRole !== 'super_admin'){throw new Exception('Only master admin can delete admin accounts');}
            if ($targetRole === 'faculty' && $currentUserRole === 'faculty'){throw new Exception('Faculty cannot delete other users');}

            /* if ($userId === $currentUserId){throw new Exception('Cannot delete your own account');} */ 
            //~ allow self-deletion for master admin
            if ($userId === $currentUserId && $currentUserRole === 'super_admin'){
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'super_admin'");
                $stmt->execute();
                $superAdminCount = $stmt->fetchColumn();

                if ($superAdminCount <= 1) {throw new Exception('Cannot delete the last master admin account');}
            } else if ($userId === $currentUserId){throw new Exception('Cannot delete your own account');}

            //~ delete user
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("UPDATE audit_logs SET user_id = NULL WHERE user_id = ?");
            $stmt->execute([$userId]); //? delete from foreign key table

            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            //~ log action
            logAction('user_delete', "Deleted user $userId", $currentUserId);
            $pdo->commit();            
            
            echo json_encode(['success' => true, 'message' => 'User deleted']);
            break;
        
        default:
            throw new Exception('Invalid action', 400);
    }
} catch (Exception $e) {
    ob_clean();

    error_log("Error in fetch-data.php: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
    
    http_response_code($e->getCode() >= 400 ? $e->getCode() : 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3)
    ]);
}

exit();
?>