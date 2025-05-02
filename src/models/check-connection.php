<?php
require_once __DIR__ . '/../config/config.php';
/**
 * function to check database connectivity
 * 
 * @return array result of the database check
 */
function checkDatabaseConnection() {
    global $pdo;

    try {
        // attempt a simple query
        $stmt = $pdo->query('SELECT 1');
    
        if ($stmt) {
            return [
                'success' => true,
                'message' => 'Database connection successful!',
                'time' => date('Y-m-d H:i:s'),
                'db_info' => [
                    'host' => $_ENV['DB_HOST'],
                    'database' => $_ENV['DB_NAME'],
                    'user' => $_ENV['DB_USER'],
                    'port' => $_ENV['DB_PORT']
                ]
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Could not execute test query.'
            ];
        }
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Database connection error: ' . $e->getMessage()
        ];
    }
}

// if this file is accessed directly, output the connection status
if (basename($_SERVER['PHP_SELF']) === 'check-connection.php') {
    header('Content-Type: application/json');
    echo json_encode(checkDatabaseConnection(), JSON_PRETTY_PRINT);
}
?>