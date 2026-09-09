<?php

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function is_admin_logged_in(): bool
{
    return !empty($_SESSION['is_admin']);
}

function require_admin_session(): void
{
    if (!is_admin_logged_in()) {
        json_response(401, ['message' => 'Admin authentication required.']);
    }
}
