<?php

const TARGET_GROUPS = ['Student', 'IT Professional', 'Job Seeker', 'Career Changer', 'Entrepreneur', 'Other'];
const ASSESSMENT_TYPES = ['Quiz', 'Project', 'Exam', 'Assignment'];
const GRADE_STATUSES = ['Pending', 'In Review', 'Passed', 'Failed'];

// Artisans Registration Form
const WORK_TYPES = ['Auto Mechanic', 'Electricals', 'Electronics', 'Plumbing', 'Masonry', 'Carpentry', 'Other'];
const TRAINING_PURPOSES = ['Upgrade Skills', 'Learn Modern Technology', 'Certification', 'Start Own Business', 'Employment Opportunity'];
const GENDERS = ['Male', 'Female'];
const TRAINING_CATEGORIES = ['Master Trainer', 'Apprentice Trainee'];
const EDUCATION_LEVELS = ['Tertiary', 'Vocational/Technical', 'SHS', 'JHS', 'Primary', 'Other', 'None'];
const APPRENTICESHIP_DURATIONS = ['Less than 1 year', '1 to 2 years', '3 to 4 years', '5 or more years'];
const MASTER_SPECIALIZATIONS = ['General Repairs & Maintenance', 'Engine Works', 'Auto Electrical', 'Body Works', 'Diagnostics', 'Other'];
const MAIN_SKILL_AREAS = [
    'Maintenance & Repairs', 'Electrical/Lighting Systems', 'Transmission', 'Body Work', 'Fault Diagnostics',
    'Industrial Installation', 'Domestic Wiring', 'Solar Installation', 'Meter Installation', 'ECU Diagnostics',
    'Pipe Fitting & Installation', 'Leak Detection & Repair', 'Drainage Systems',
    'Blockwork & Bricklaying', 'Plastering & Rendering', 'Tiling',
    'Furniture Making', 'Roofing & Framing', 'Wood Finishing',
    'Other',
];
const TOOLS_OWNED_OPTIONS = ['Basic Electrical Tools', 'Multimeter/Testing Instruments', 'Diagnostic Scanner', 'Full Professional Kit'];
const ABILITY_STATUSES = ['Abled', 'Disabled'];

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
