<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/admin_auth.php';

require_method('GET');

json_response(200, ['authenticated' => is_admin_logged_in()]);
