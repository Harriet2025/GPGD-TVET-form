<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

require_method('POST');

$body = read_json_body();

$memberId = filter_var($body['member_id'] ?? null, FILTER_VALIDATE_INT);
$trackId  = filter_var($body['track_id'] ?? null, FILTER_VALIDATE_INT);

if ($memberId === false || $trackId === false) {
    json_response(400, ['message' => 'A valid member_id and track_id are required.']);
}

try {
    $pdo = get_db_connection();

    $memberStmt = $pdo->prepare('SELECT member_id FROM Members_table WHERE member_id = ?');
    $memberStmt->execute([$memberId]);
    if ($memberStmt->fetch() === false) {
        json_response(404, ['message' => 'Member not found.']);
    }

    $trackStmt = $pdo->prepare('SELECT track_id FROM Tracks_table WHERE track_id = ? AND is_active = 1');
    $trackStmt->execute([$trackId]);
    if ($trackStmt->fetch() === false) {
        json_response(404, ['message' => 'Track not found or is not currently active.']);
    }

    $existingStmt = $pdo->prepare(
        'SELECT enrollment_id FROM Enrollments_table WHERE member_id = ? AND track_id = ?'
    );
    $existingStmt->execute([$memberId, $trackId]);
    if ($existingStmt->fetch() !== false) {
        json_response(409, ['message' => 'You are already enrolled in this track.']);
    }

    $insertStmt = $pdo->prepare('INSERT INTO Enrollments_table (member_id, track_id) VALUES (?, ?)');
    $insertStmt->execute([$memberId, $trackId]);

    json_response(201, [
        'message' => 'Enrollment successful.',
        'enrollment_id' => (int) $pdo->lastInsertId(),
    ]);
} catch (Throwable $e) {
    error_log('POST /api/enroll failed: ' . $e->getMessage());
    json_response(500, ['message' => 'Something went wrong while enrolling in this track.']);
}
