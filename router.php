<?php
// Front controller for PHP's built-in server (php -S).
// Routes /api/* requests to their handler script; everything else is served
// as a static file straight from disk (index.html, css, js, images, ...).

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$routes = [
    '/api/register'          => __DIR__ . '/api/register.php',
    '/api/tracks'             => __DIR__ . '/api/tracks.php',
    '/api/enroll'             => __DIR__ . '/api/enroll.php',
    '/api/grades'             => __DIR__ . '/api/grades.php',
    '/api/admin/enrollments'  => __DIR__ . '/api/admin_enrollments.php',
];

if (isset($routes[$path])) {
    require $routes[$path];
    return true;
}

// Let the built-in server serve the file directly if it exists.
$requestedFile = __DIR__ . $path;
if ($path !== '/' && file_exists($requestedFile) && !is_dir($requestedFile)) {
    return false;
}

if ($path === '/' || $path === '') {
    require __DIR__ . '/index.html';
    return true;
}

http_response_code(404);
echo '404 Not Found';
return true;
