<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/admin_auth.php';

require_method('POST');

$_SESSION = [];
if (ini_get('session.use_cookies')) {
	$params = session_get_cookie_params();
	setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) $params['secure'], (bool) $params['httponly']);
}
session_destroy();

json_response(200, ['message' => 'Logged out.']);
