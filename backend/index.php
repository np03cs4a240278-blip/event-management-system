<?php

session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isLocalFrontend = preg_match('/^http:\/\/localhost:\d+$/', $origin) === 1;

if ($isLocalFrontend) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Load files
require 'helpers/response.php';
require 'config/db.php';
require 'middleware/auth.php';
require 'models/User.php';
require 'models/Event.php';
require 'models/Booking.php';
require 'controllers/AuthController.php';
require 'controllers/EventController.php';
require 'controllers/BookingController.php';
require 'routes/api.php';

try {
    // Connect DB
    $db = getDatabaseConnection();

    // Create objects
    $auth = new AuthController(new User($db));
    $eventModel = new Event($db);
    $event = new EventController($eventModel);
    $booking = new BookingController(new Booking($db), $eventModel);

    // Get URL path
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $apiPosition = strpos($path, '/api');

    if ($apiPosition !== false) {
        $path = substr($path, $apiPosition);
    }

    // Handle request
    handleApiRequest($_SERVER['REQUEST_METHOD'], $path, $auth, $event, $booking);

} catch (Exception $e) {
    jsonResponse(['message' => 'Server error', 'error' => $e->getMessage()], 500);
}
