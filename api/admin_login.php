<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/db.php';

require_method('POST');

$body = read_json_body();
$username = $body['username'] ?? '';
$password = $body['password'] ?? '';

$pdo = get_db_connection();
$stmt = $pdo->prepare(
    'SELECT password_hash FROM AdminUsers_table WHERE username = ? AND is_active = 1 LIMIT 1'
);
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (
    is_non_empty_string($username) &&
    is_non_empty_string($password) &&
    $admin !== false &&
    password_verify($password, $admin['password_hash'])
) {
    session_regenerate_id(true);
    $_SESSION['is_admin'] = true;
    json_response(200, ['message' => 'Logged in.']);
}

json_response(401, ['message' => 'Invalid username or password.']);
