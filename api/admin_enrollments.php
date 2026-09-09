<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

require_method('GET');

try {
    $pdo = get_db_connection();
    $stmt = $pdo->query("
        SELECT
            e.enrollment_id,
            m.member_id AS student_id,
            CONCAT(m.first_name, ' ', m.last_name) AS student_name,
            m.email AS student_email,
            t.track_id,
            t.code AS track_code,
            t.title AS track_title,
            g.grade_id,
            g.assessment_type,
            g.score,
            COALESCE(g.status, e.status) AS status
        FROM Enrollments_table e
        JOIN Members_table m ON m.member_id = e.member_id
        JOIN Tracks_table t ON t.track_id = e.track_id
        LEFT JOIN Member_Grades_table g ON g.enrollment_id = e.enrollment_id
        ORDER BY e.enrolled_at DESC
    ");
    json_response(200, $stmt->fetchAll());
} catch (Throwable $e) {
    error_log('GET /api/admin/enrollments failed: ' . $e->getMessage());
    json_response(500, ['message' => 'Something went wrong while loading enrollments.']);
}
