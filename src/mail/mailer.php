<?php
namespace SDGKU\Mail;

require_once __DIR__. '/../lib/phpmailer/PHPMailer.php';
require_once __DIR__. '/../lib/phpmailer/SMTP.php';
require_once __DIR__. '/../lib/phpmailer/Exception.php';
require_once __DIR__. '/../config/config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;


class Mailer {

    public static function getMailer(){
        $config = [
            'app_name' => $_ENV['APP_NAME'] ?? 'SDGKU',
            'app_url' => $_ENV['APP_URL'] ?? 'http://localhost/SDGKU-Dashboard'
        ];

        return new self($config);
    }

    private $mailer;
    private $config;
    
    public function __construct(array $config){
        $this->mailer = new PHPMailer(true);
        $this->config = $config;
        $this->configure();
    }   
    
    private function configure(){
        $this->mailer->isSMTP();
        $this->mailer->Host = $_ENV['SMTP_HOST'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $_ENV['SMTP_USER'];
        $this->mailer->Password = $_ENV['SMTP_PASS'];
        $this->mailer->SMTPSecure = $_ENV['SMTP_SECURE'];
        $this->mailer->Port = $_ENV['SMTP_PORT'];
        $this->mailer->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
        $this->mailer->isHTML(true);
        //$this->mailer->SMTPTimeout = 5;
    }

    public function sendInvitation($email, $name, $token){
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);

            $this->mailer->Subject = "Invitation to Join {$_ENV['MAIL_FROM_NAME']}";
            $emailBody = $this->generateInvitationEmail($name, $token);
            $this->mailer->Body = $emailBody;

            //TODO: Remove this in production
            /* error_log("SMTP Host: {$this->mailer->Host}");
            error_log("SMTP User: {$this->mailer->Username}");
            error_log("SMTP Port: {$this->mailer->Port}");
            error_log("Email recipient: $email");
            error_log("Email subject: {$this->mailer->Subject}"); */
            
            $result = $this->mailer->send();
            
            if ($result) {
                error_log("Email sent successfully to $email");
                return true;
            } else {
                error_log("PHPMailer send() failed for $email: " . $this->mailer->ErrorInfo);
                return false;
            }
        } catch (Exception $e) {
            error_log("Email exception in sendInvitation: " . $e->getMessage());
            error_log("PHPMailer error: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    public function sendPasswordReset($email, $token){
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);

            $this->mailer->Subject = "Password Reset Request";
            $this->mailer->Body = $this->generatePasswordResetEmail($token);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email failed. Error: {$this->mailer->ErrorInfo}");
            return false;
        }
    }

    public function sendLockedAcc($email, $name, $token){
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);

            $this->mailer->Subject = "Account Locked";
            $this->mailer->Body = $this->generateLockedAccEmail($name, $token);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email failed. Error: {$this->mailer->ErrorInfo}");
            return false;
        }
    }

    public function sendForgotPasswordEmail($email, $name, $token){
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);

            $this->mailer->Subject = "Password Recovery - {$this->config['app_name']}";
            $this->mailer->Body = $this->generateForgotPasswordEmail($name, $token);

            error_log("Attempting to send password recovery email to: $email with token: $token");

            $result = $this->mailer->send();

            if ($result){
                error_log("Forgot password email sent successfully to: $email");
                return true;
            } else {
                error_log("Failed to send forgot password email to: $email. Error: {$this->mailer->ErrorInfo}");
                return false;
            }
        } catch (Exception $e) {
            error_log("Exception occurred while sending forgot password email: {$e->getMessage()}");
            error_log("PHPMailer error: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    private function generatePasswordResetEmail(string $token): string {
        $url = $this->config['app_url'] . "/public/views/auth/set-password.php?token=$token";
        return "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap' rel='stylesheet'>
            </head>
            <body style='margin: 0; padding: 0; font-family: \"Inter\", sans-serif; background-color: #f1f5f9; line-height: 1.6;'>
                <div style='max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 0.375rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;'>
                    <div style='padding: 25px; background-color: #7B1315; color: #FFFFFF;'>
                        <h1 style='margin: 0; font-weight: 700; font-size: 24px;'>Password Reset</h1>
                    </div>
                    
                    <div style='padding: 30px 25px;'>
                        <p style='margin-bottom: 16px; font-size: 16px;'>Hello,</p>
                        <p style='margin-bottom: 16px; font-size: 16px;'>You have requested to reset your password. Please click the button below to set a new password:</p>
                        
                        <div style='text-align: center; margin: 25px 0;'>
                            <a href='$url' style='display: inline-block; padding: 12px 24px; background-color: #BB2626; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 0.375rem;'>Reset Password</a>
                        </div>
                        
                        <p style='margin-bottom: 10px; font-size: 14px; color: #64748b;'>This link expires in 12 hours.</p>
                        <p style='margin-bottom: 10px; font-size: 14px; color: #64748b;'>If you did not request this, please ignore this email.</p>
                        
                        <p style='margin-top: 25px; margin-bottom: 0;'>Best regards,<br>{$this->config['app_name']} Team</p>
                    </div>
                    
                    <div style='padding: 15px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b;'>
                        &copy; " . date('Y') . " {$this->config['app_name']}. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        ";
    }

    private function generateInvitationEmail(string $name, string $token): string {
        $url = $this->config['app_url'] . "/public/views/auth/set-password.php?token=$token";
        return "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap' rel='stylesheet'>
            </head>
            <body style='margin: 0; padding: 0; font-family: \"Inter\", sans-serif; background-color: #f1f5f9; line-height: 1.6;'>
                <div style='max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 0.375rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;'>
                    <div style='padding: 25px; background-color: #7B1315; color: #FFFFFF;'>
                        <h1 style='margin: 0; font-weight: 700; font-size: 24px;'>Welcome to {$this->config['app_name']}</h1>
                    </div>
                    
                    <div style='padding: 30px 25px;'>
                        <p style='margin-bottom: 16px; font-size: 16px;'>Hello {$name},</p>
                        <p style='margin-bottom: 16px; font-size: 16px;'>You have been invited to join the {$this->config['app_name']}. Please click the button below to set up your account:</p>
                        
                        <div style='text-align: center; margin: 25px 0;'>
                            <a href='$url' style='display: inline-block; padding: 12px 24px; background-color: #BB2626; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 0.375rem;'>Set Up Your Account</a>
                        </div>
                        
                        <p style='margin-bottom: 10px; font-size: 14px; color: #64748b;'>This invitation is valid for 12 hours.</p>
                        
                        <p style='margin-top: 25px; margin-bottom: 0;'>Best regards,<br>{$this->config['app_name']} Team</p>
                    </div>
                    
                    <div style='padding: 15px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b;'>
                        &copy; " . date('Y') . " {$this->config['app_name']}. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        ";
    }

    private function generateLockedAccEmail(string $name, string $token): string {
        $url = $this->config['app_url'] . "/public/views/auth/reset-password.html?token=$token";
        return "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap' rel='stylesheet'>
            </head>
            <body style='margin: 0; padding: 0; font-family: \"Inter\", sans-serif; background-color: #f1f5f9; line-height: 1.6;'>
                <div style='max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 0.375rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;'>
                    <div style='padding: 25px; background-color: #7B1315; color: #FFFFFF;'>
                        <h1 style='margin: 0; font-weight: 700; font-size: 24px;'>Account Locked</h1>
                    </div>
                    
                    <div style='padding: 30px 25px;'>
                        <p style='margin-bottom: 16px; font-size: 16px;'>Hello {$name},</p>
                        <p style='margin-bottom: 16px; font-size: 16px;'>Your account has been locked due to multiple failed login attempts. Please click the button below to reset your password:</p>
                        
                        <div style='text-align: center; margin: 25px 0;'>
                            <a href='$url' style='display: inline-block; padding: 12px 24px; background-color: #BB2626; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 0.375rem;'>Reset Password</a>
                        </div>
                        
                        <p style='margin-bottom: 10px; font-size: 14px; color: #64748b;'>This link expires in 12 hours.</p>
                        <p style='margin-bottom: 10px; font-size: 14px; color: #64748b;'>If you did not request this, please ignore this email.</p>
                        
                        <p style='margin-top: 25px; margin-bottom: 0;'>Best regards,<br>{$this->config['app_name']} Team</p>
                    </div>
                    
                    <div style='padding: 15px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b;'>
                        &copy; " . date('Y') . " {$this->config['app_name']}. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        ";
    }

    private function generateForgotPasswordEmail(string $name, string $token): string {
        $url = $this->config['app_url'] . "/public/views/auth/reset-password.html?token=$token";
        return "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <link href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap' rel='stylesheet'>
            </head>
            <body style='margin: 0; padding: 0; font-family: \"Inter\", sans-serif; background-color: #f1f5f9; line-height: 1.6;'>
                <div style='max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 0.375rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;'>
                    <div style='padding: 25px; background-color: #7B1315; color: #FFFFFF;'>
                        <h1 style='margin: 0; font-weight: 700; font-size: 24px;'>Password Recovery</h1>
                    </div>
                    
                    <div style='padding: 30px 25px;'>
                        <p style='margin-bottom: 16px; font-size: 16px;'>Hello {$name},</p>
                        <p style='margin-bottom: 16px; font-size: 16px;'>You have requested to recover your password. Please click the button below to reset it:</p>
                        
                        <div style='text-align: center; margin: 25px 0;'>
                            <a href='$url' style='display: inline-block; padding: 12px 24px; background-color: #BB2626; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 0.375rem;'>Reset Password</a>
                        </div>
                        
                        <p style='margin-bottom: 10px; font-size: 14px; color: #64748b;'>This link expires in 12 hours.</p>
                        <p style='margin-bottom: 10px; font-size: 14px; color: #64748b;'>If you did not request this, please ignore this email.</p>
                        
                        <p style='margin-top: 25px; margin-bottom: 0;'>Best regards,<br>{$this->config['app_name']} Team</p>
                    </div>
                    
                    <div style='padding: 15px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b;'>
                        &copy; " . date('Y') . " {$this->config['app_name']}. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        ";
    }
}
?>