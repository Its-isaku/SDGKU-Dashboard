<?php
//? Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

//? Get the raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

//? For testing, just return what you received
echo json_encode([
    'status' => 'success',
    'received' => $data
]);
?>