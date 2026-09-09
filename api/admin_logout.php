<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/admin_auth.php';

require_method('POST');

$_SESSION = [];
session_destroy();

json_response(200, ['message' => 'Logged out.']);
