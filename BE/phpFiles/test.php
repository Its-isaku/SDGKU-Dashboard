<?php
// Include the configuration file
require_once 'config.php';

// Set response header to JSON
header('Content-Type: application/json');

try {
    // Check if the connection is working by executing a simple query
    $stmt = $pdo->query('SELECT 1 as connection_test');
    $result = $stmt->fetch();
    
    // Check if we can access the sdgku_db database
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll();
    
    // If we get here, the connection is working
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful!',
        'details' => [
            'database' => $db,
            'host' => $host,
            'connection_test' => $result['connection_test'],
            'tables_count' => count($tables),
            'tables' => array_map(function($table) {
                return reset($table); // Get the first value from each row
            }, $tables)
        ]
    ]);
} catch (PDOException $e) {
    // If there's an error, return it
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection test failed: ' . $e->getMessage()
    ]);
}
?>

