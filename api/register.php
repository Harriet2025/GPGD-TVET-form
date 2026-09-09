<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

require_method('POST');

$body = read_json_body();

function clean_array_field($value): array
{
    if (!is_array($value)) return [];
    return array_values(array_filter(array_map('trim', $value), 'strlen'));
}

$workType         = $body['work_type'] ?? null;
$workTypeOther    = $body['work_type_other'] ?? null;
$trainingPurpose  = clean_array_field($body['training_purpose'] ?? []);
$fullName         = $body['full_name'] ?? null;
$gender           = $body['gender'] ?? null;
$dateOfBirth      = $body['date_of_birth'] ?? null;
$physicalAddress  = $body['physical_address'] ?? null;
$contactNumber    = $body['contact_number'] ?? null;
$email            = $body['email'] ?? null;
$trainingCategory = $body['training_category'] ?? null;

$educationLevel      = $body['education_level'] ?? null;
$educationLevelOther = $body['education_level_other'] ?? null;

$masterName               = $body['master_name'] ?? null;
$masterSpecialization     = clean_array_field($body['master_specialization'] ?? []);
$masterSpecializationOther = $body['master_specialization_other'] ?? null;
$masterContactNumber      = $body['master_contact_number'] ?? null;
$workshopName             = $body['workshop_name'] ?? null;
$workshopLocation         = $body['workshop_location'] ?? null;
$apprenticeshipDuration   = $body['apprenticeship_duration'] ?? null;

$mainSkillArea      = clean_array_field($body['main_skill_area'] ?? []);
$mainSkillAreaOther = $body['main_skill_area_other'] ?? null;
$toolsOwned         = $body['tools_owned'] ?? null;

$abilityStatus = $body['ability_status'] ?? null;

$declarationConfirmed = !empty($body['declaration_confirmed']);
$declarationName       = $body['declaration_name'] ?? null;

$errors = [];

if (!in_array($workType, WORK_TYPES, true)) $errors['work_type'] = 'A valid work type is required.';
if ($workType === 'Other' && !is_non_empty_string($workTypeOther)) $errors['work_type_other'] = 'Please specify the work type.';

if (empty($trainingPurpose) || array_diff($trainingPurpose, TRAINING_PURPOSES)) {
    $errors['training_purpose'] = 'Select at least one valid training purpose.';
}

if (!is_non_empty_string($fullName)) $errors['full_name'] = 'Full name is required.';
if (!in_array($gender, GENDERS, true)) $errors['gender'] = 'A valid gender is required.';

$dob = is_string($dateOfBirth) ? DateTime::createFromFormat('Y-m-d', $dateOfBirth) : false;
if (!$dob) $errors['date_of_birth'] = 'A valid date of birth is required.';

if (!is_non_empty_string($physicalAddress)) $errors['physical_address'] = 'Physical address is required.';
if (!is_valid_phone($contactNumber)) $errors['contact_number'] = 'A valid contact number is required.';
if ($email !== null && $email !== '' && !is_valid_email($email)) $errors['email'] = 'Enter a valid email address, or leave it blank.';
if (!in_array($trainingCategory, TRAINING_CATEGORIES, true)) $errors['training_category'] = 'A valid training category is required.';

if (!in_array($educationLevel, EDUCATION_LEVELS, true)) $errors['education_level'] = 'A valid education level is required.';
if ($educationLevel === 'Other' && !is_non_empty_string($educationLevelOther)) $errors['education_level_other'] = 'Please specify the education level.';

$isApprentice = $trainingCategory === 'Apprentice Trainee';
if ($isApprentice) {
    if (!is_non_empty_string($masterName)) $errors['master_name'] = "Master's name is required for apprentices.";
    if (empty($masterSpecialization) || array_diff($masterSpecialization, MASTER_SPECIALIZATIONS)) {
        $errors['master_specialization'] = "Select at least one valid master's specialization.";
    }
    if (in_array('Other', $masterSpecialization, true) && !is_non_empty_string($masterSpecializationOther)) {
        $errors['master_specialization_other'] = 'Please specify the specialization.';
    }
    if (!is_valid_phone($masterContactNumber)) $errors['master_contact_number'] = "A valid master's contact number is required.";
    if (!is_non_empty_string($workshopName)) $errors['workshop_name'] = 'Workshop or company name is required.';
    if (!is_non_empty_string($workshopLocation)) $errors['workshop_location'] = 'Workshop location is required.';
    if (!in_array($apprenticeshipDuration, APPRENTICESHIP_DURATIONS, true)) $errors['apprenticeship_duration'] = 'A valid apprenticeship duration is required.';
}

if (empty($mainSkillArea) || array_diff($mainSkillArea, MAIN_SKILL_AREAS)) {
    $errors['main_skill_area'] = 'Select at least one valid skill area.';
}
if (in_array('Other', $mainSkillArea, true) && !is_non_empty_string($mainSkillAreaOther)) {
    $errors['main_skill_area_other'] = 'Please specify the skill area.';
}
if (!in_array($toolsOwned, TOOLS_OWNED_OPTIONS, true)) $errors['tools_owned'] = 'A valid tools owned option is required.';

if (!in_array($abilityStatus, ABILITY_STATUSES, true)) $errors['ability_status'] = 'A valid ability status is required.';

if (!$declarationConfirmed) $errors['declaration_confirmed'] = 'You must confirm the declaration.';
if (!is_non_empty_string($declarationName)) $errors['declaration_name'] = 'Your name is required to confirm the declaration.';

if (!empty($errors)) {
    json_response(400, ['message' => 'Please correct the errors in your submission.', 'errors' => $errors]);
}

try {
    $pdo = get_db_connection();

    $stmt = $pdo->prepare(
        'INSERT INTO ArtisanApplicants_table (
            work_type, work_type_other, training_purpose, full_name, gender, date_of_birth,
            physical_address, contact_number, email, training_category,
            education_level, education_level_other,
            master_name, master_specialization, master_specialization_other, master_contact_number,
            workshop_name, workshop_location, apprenticeship_duration,
            main_skill_area, main_skill_area_other, tools_owned,
            ability_status, declaration_confirmed, declaration_name
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?
        )'
    );

    $stmt->execute([
        $workType,
        $workType === 'Other' ? trim($workTypeOther) : null,
        implode(', ', $trainingPurpose),
        trim($fullName),
        $gender,
        $dob->format('Y-m-d'),
        trim($physicalAddress),
        trim($contactNumber),
        ($email !== null && $email !== '') ? trim($email) : null,
        $trainingCategory,
        $educationLevel,
        $educationLevel === 'Other' ? trim($educationLevelOther) : null,
        $isApprentice ? trim($masterName) : null,
        $isApprentice ? implode(', ', $masterSpecialization) : null,
        ($isApprentice && in_array('Other', $masterSpecialization, true)) ? trim($masterSpecializationOther) : null,
        $isApprentice ? trim($masterContactNumber) : null,
        $isApprentice ? trim($workshopName) : null,
        $isApprentice ? trim($workshopLocation) : null,
        $isApprentice ? $apprenticeshipDuration : null,
        implode(', ', $mainSkillArea),
        in_array('Other', $mainSkillArea, true) ? trim($mainSkillAreaOther) : null,
        $toolsOwned,
        $abilityStatus,
        1,
        trim($declarationName),
    ]);

    json_response(201, [
        'message' => 'Registration successful.',
        'applicant_id' => (int) $pdo->lastInsertId(),
    ]);
} catch (Throwable $e) {
    error_log('POST /api/register failed: ' . $e->getMessage());
    json_response(500, ['message' => 'Something went wrong while saving your registration.']);
}
