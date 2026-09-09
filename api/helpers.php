<?php

const TARGET_GROUPS = ['Student', 'IT Professional', 'Job Seeker', 'Career Changer', 'Entrepreneur', 'Other'];
const ASSESSMENT_TYPES = ['Quiz', 'Project', 'Exam', 'Assignment'];
const GRADE_STATUSES = ['Pending', 'In Review', 'Passed', 'Failed'];

function json_response($statusCode, array $body): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($body);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        json_response(405, ['message' => "Method not allowed. Expected {$method}."]);
    }
}

function is_non_empty_string($value): bool
{
    return is_string($value) && trim($value) !== '';
}

function is_valid_email($value): bool
{
    return is_string($value) && filter_var(trim($value), FILTER_VALIDATE_EMAIL) !== false;
}

function is_valid_phone($value): bool
{
    return is_string($value) && preg_match('/^[+\d][\d\s\-()]{6,}$/', trim($value)) === 1;
}
