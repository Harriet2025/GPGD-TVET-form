<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

require_method('GET');

try {
    $pdo = get_db_connection();
    $stmt = $pdo->query(
        'SELECT track_id, code, title, duration FROM Tracks_table WHERE is_active = 1 ORDER BY code ASC'
    );
    json_response(200, $stmt->fetchAll());
} catch (Throwable $e) {
    error_log('GET /api/tracks failed: ' . $e->getMessage());
    json_response(500, ['message' => 'Something went wrong while loading tracks.']);
}
