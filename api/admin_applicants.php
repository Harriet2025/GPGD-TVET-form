<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/db.php';

require_method('GET');
require_admin_session();

try {
    $pdo = get_db_connection();
    $stmt = $pdo->query('SELECT * FROM ArtisanApplicants_table ORDER BY submitted_at DESC');
    json_response(200, $stmt->fetchAll());
} catch (Throwable $e) {
    error_log('GET /api/admin/applicants failed: ' . $e->getMessage());
    json_response(500, ['message' => 'Something went wrong while loading applicants.']);
}
