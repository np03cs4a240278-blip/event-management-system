<?php

function isPrivateOrLoopbackAddress($host)
{
    if (!filter_var($host, FILTER_VALIDATE_IP)) {
        return false;
    }

    if ($host === '127.0.0.1' || $host === '::1') {
        return true;
    }

    return !filter_var(
        $host,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    );
}

function getAllowedOrigins()
{
    $rawOrigins = getenv('ALLOWED_ORIGINS') ?: '';

    if ($rawOrigins === '') {
        return [];
    }

    return array_values(array_filter(array_map('trim', explode(',', $rawOrigins))));
}

function isAllowedFrontendOrigin($origin)
{
    if ($origin === '') {
        return false;
    }

    if (in_array($origin, getAllowedOrigins(), true)) {
        return true;
    }

    $parts = parse_url($origin);

    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
        return false;
    }

    if (!in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
        return false;
    }

    $host = strtolower($parts['host']);

    if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
        return true;
    }

    if (substr($host, -6) === '.local') {
        return true;
    }

    if (isPrivateOrLoopbackAddress($host)) {
        return true;
    }

    $serverHostHeader = $_SERVER['HTTP_HOST'] ?? '';
    $serverHost = strtolower(explode(':', $serverHostHeader)[0] ?? '');

    return $serverHost !== '' && $host === $serverHost;
}

$sessionLifetime = (int)(getenv('SESSION_LIFETIME') ?: 86400);
$isSecureRequest = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

session_set_cookie_params([
    'lifetime' => $sessionLifetime,
    'path' => '/',
    'domain' => '',
    'secure' => $isSecureRequest,
    'httponly' => true,
    'samesite' => 'Lax',
]);

session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (isAllowedFrontendOrigin($origin)) {
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
require 'helpers/mailer.php';
require 'config/db.php';
require 'middleware/auth.php';
require 'models/User.php';
require 'models/Event.php';
require 'models/Booking.php';
require 'models/ContactMessage.php';
require 'controllers/AuthController.php';
require 'controllers/UserController.php';
require 'controllers/EventController.php';
require 'controllers/BookingController.php';
require 'controllers/ContactMessageController.php';
require 'routes/api.php';

try {
    // Connect DB
    $db = getDatabaseConnection();

    // Create objects
    $userModel = new User($db);
    $auth = new AuthController($userModel);
    $users = new UserController($userModel);
    $eventModel = new Event($db);
    $event = new EventController($eventModel);
    $booking = new BookingController(new Booking($db), $eventModel);
    $contact = new ContactMessageController(new ContactMessage($db));

    // Get URL path
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $apiPosition = strpos($path, '/api');

    if ($apiPosition !== false) {
        $path = substr($path, $apiPosition);
    }

    // Handle request
    handleApiRequest($_SERVER['REQUEST_METHOD'], $path, $auth, $users, $event, $booking, $contact);

} catch (Exception $e) {
    jsonResponse(['message' => 'Server error', 'error' => $e->getMessage()], 500);
}
