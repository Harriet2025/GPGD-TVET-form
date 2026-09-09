<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST' && $method !== 'PUT') {
    json_response(405, ['message' => 'Method not allowed. Expected POST or PUT.']);
}

$body = read_json_body();

function validate_grade_payload(array $body): array
{
    $errors = [];

    $enrollmentId = filter_var($body['enrollment_id'] ?? null, FILTER_VALIDATE_INT);
    if ($enrollmentId === false) $errors['enrollment_id'] = 'A valid enrollment_id is required.';

    $assessmentType = $body['assessment_type'] ?? null;
    if (!in_array($assessmentType, ASSESSMENT_TYPES, true)) {
        $errors['assessment_type'] = 'A valid assessment_type is required.';
    }

    $score = filter_var($body['score'] ?? null, FILTER_VALIDATE_FLOAT);
    if ($score === false || $score < 0 || $score > 100) {
        $errors['score'] = 'Score must be between 0 and 100.';
    }

    $status = $body['status'] ?? null;
    if (!in_array($status, GRADE_STATUSES, true)) {
        $errors['status'] = 'A valid status is required.';
    }

    return [$errors, $enrollmentId, $assessmentType, $score, $status];
}

[$errors, $enrollmentId, $assessmentType, $score, $status] = validate_grade_payload($body);

try {
    $pdo = get_db_connection();

    if ($method === 'POST') {
        if (!empty($errors)) {
            json_response(400, ['message' => 'Please correct the errors in your submission.', 'errors' => $errors]);
        }

        $enrollmentStmt = $pdo->prepare('SELECT enrollment_id FROM Enrollments_table WHERE enrollment_id = ?');
        $enrollmentStmt->execute([$enrollmentId]);
        if ($enrollmentStmt->fetch() === false) {
            json_response(404, ['message' => 'Enrollment not found.']);
        }

        $existingStmt = $pdo->prepare('SELECT grade_id FROM Member_Grades_table WHERE enrollment_id = ?');
        $existingStmt->execute([$enrollmentId]);
        if ($existingStmt->fetch() !== false) {
            json_response(409, ['message' => 'This enrollment already has a grade. Use PUT /api/grades to update it.']);
        }

        $insertStmt = $pdo->prepare(
            'INSERT INTO Member_Grades_table (enrollment_id, assessment_type, score, status) VALUES (?, ?, ?, ?)'
        );
        $insertStmt->execute([$enrollmentId, $assessmentType, $score, $status]);

        json_response(201, ['message' => 'Score saved.', 'grade_id' => (int) $pdo->lastInsertId()]);
    }

    // PUT: update an existing grade record.
    $gradeId = filter_var($body['grade_id'] ?? null, FILTER_VALIDATE_INT);
    if ($gradeId === false) $errors['grade_id'] = 'A valid grade_id is required.';

    if (!empty($errors)) {
        json_response(400, ['message' => 'Please correct the errors in your submission.', 'errors' => $errors]);
    }

    $updateStmt = $pdo->prepare(
        'UPDATE Member_Grades_table SET assessment_type = ?, score = ?, status = ?
         WHERE grade_id = ? AND enrollment_id = ?'
    );
    $updateStmt->execute([$assessmentType, $score, $status, $gradeId, $enrollmentId]);

    if ($updateStmt->rowCount() === 0) {
        json_response(404, ['message' => 'Grade record not found.']);
    }

    json_response(200, ['message' => 'Score updated.', 'grade_id' => $gradeId]);
} catch (Throwable $e) {
    error_log('/api/grades failed: ' . $e->getMessage());
    json_response(500, ['message' => 'Something went wrong while saving this score.']);
}
