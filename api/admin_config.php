<?php
// Admin login credentials for the Admin Panel.
// Default username: admin | Default password: GPGDadmin2026
// Change these (and regenerate the hash with password_hash()) before real use.

return [
    'username' => getenv('ADMIN_USERNAME') ?: 'admin',
    'password_hash' => getenv('ADMIN_PASSWORD_HASH') ?: '$2y$10$U5an0NFJHycyB/Z5qgJ2s./fvogBFgcV/CgURwevRuEg2X/WZ/z6y',
];
