<?php
// Database connection settings for the GPGD IT Professional Certification Programme.
// XAMPP defaults to the local root account with no password.

return [
    'host'     => getenv('DB_HOST') ?: 'localhost',
    'port'     => getenv('DB_PORT') ?: '3307',
    'database' => getenv('DB_NAME') ?: 'gpgd_it_program',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASSWORD') ?: '',
];