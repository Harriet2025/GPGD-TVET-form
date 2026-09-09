<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

require_method('POST');

$body = read_json_body();

$firstName   = $body['first_name'] ?? null;
$lastName    = $body['last_name'] ?? null;
$email       = $body['email'] ?? null;
$phoneNumber = $body['phone_number'] ?? null;
$targetGroup = $body['target_group'] ?? null;
$levelId     = $body['level_id'] ?? null;

$errors = [];
if (!is_non_empty_string($firstName)) $errors['first_name'] = 'First name is required.';
if (!is_non_empty_string($lastName)) $errors['last_name'] = 'Last name is required.';
if (!is_valid_email($email)) $errors['email'] = 'A valid email address is required.';
if (!is_valid_phone($phoneNumber)) $errors['phone_number'] = 'A valid phone number is required.';
if (!in_array($targetGroup, TARGET_GROUPS, true)) $errors['target_group'] = 'A valid target group is required.';

$levelIdInt = filter_var($levelId, FILTER_VALIDATE_INT);
if ($levelIdInt === false || $levelIdInt < 1 || $levelIdInt > 5) {
    $errors['level_id'] = 'Level must be between 1 and 5.';
}

if (!empty($errors)) {
    json_response(400, ['message' => 'Please correct the errors in your submission.', 'errors' => $errors]);
}

try {
    $pdo = get_db_connection();

    $checkStmt = $pdo->prepare('SELECT member_id FROM Members_table WHERE email = ?');
    $checkStmt->execute([trim($email)]);
    if ($checkStmt->fetch() !== false) {
        json_response(409, ['message' => 'This email address is already registered.']);
    }

    $insertStmt = $pdo->prepare(
        'INSERT INTO Members_table (first_name, last_name, email, phone_number, target_group, level_id)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $insertStmt->execute([
        trim($firstName),
        trim($lastName),
        trim($email),
        trim($phoneNumber),
        $targetGroup,
        $levelIdInt,
    ]);

    json_response(201, [
        'message' => 'Registration successful.',
        'member_id' => (int) $pdo->lastInsertId(),
    ]);
} catch (Throwable $e) {
    error_log('POST /api/register failed: ' . $e->getMessage());
    json_response(500, ['message' => 'Something went wrong while saving your registration.']);
}
