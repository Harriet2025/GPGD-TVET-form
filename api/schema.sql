-- GPGD IT Professional Certification Programme
-- Database schema for MySQL 8.0

CREATE DATABASE IF NOT EXISTS gpgd_it_program
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gpgd_it_program;

CREATE TABLE IF NOT EXISTS Levels_table (
  level_id INT PRIMARY KEY,
  level_name VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO Levels_table (level_id, level_name) VALUES
  (1, 'Level 1'),
  (2, 'Level 2'),
  (3, 'Level 3'),
  (4, 'Level 4'),
  (5, 'Level 5');

CREATE TABLE IF NOT EXISTS Members_table (
  member_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(30) NOT NULL,
  target_group VARCHAR(50) NOT NULL,
  level_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (level_id) REFERENCES Levels_table(level_id)
);

CREATE TABLE IF NOT EXISTS Tracks_table (
  track_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
);

INSERT IGNORE INTO Tracks_table (code, title, duration, is_active) VALUES
  ('TRKA', 'Track A: Web Development Fundamentals', '6 weeks', 1),
  ('TRKB', 'Track B: Data Analysis & Visualization', '6 weeks', 1),
  ('TRKC', 'Track C: Cloud Computing Essentials', '8 weeks', 1),
  ('TRKD', 'Track D: Cybersecurity Foundations', '8 weeks', 1),
  ('TRKE', 'Track E: Mobile App Development', '8 weeks', 1),
  ('TRKF', 'Track F: Database Design & SQL', '6 weeks', 1),
  ('TRKG', 'Track G: Network Administration', '8 weeks', 1),
  ('TRKH', 'Track H: UI/UX Design Principles', '6 weeks', 1),
  ('TRKI', 'Track I: DevOps & Automation', '8 weeks', 1),
  ('TRKJ', 'Track J: IT Project Management', '6 weeks', 1);

CREATE TABLE IF NOT EXISTS Enrollments_table (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  track_id INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES Members_table(member_id),
  FOREIGN KEY (track_id) REFERENCES Tracks_table(track_id),
  UNIQUE KEY uniq_member_track (member_id, track_id)
);

CREATE TABLE IF NOT EXISTS Member_Grades_table (
  grade_id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL UNIQUE,
  assessment_type VARCHAR(50) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES Enrollments_table(enrollment_id)
);

-- Artisans Registration Form (separate GPGD programme: workshop training in
-- skilled trades). Mirrors the sections of the organization's Google Form.
CREATE TABLE IF NOT EXISTS ArtisanApplicants_table (
  applicant_id INT AUTO_INCREMENT PRIMARY KEY,

  -- Section A: Personal Details
  work_type VARCHAR(50) NOT NULL,
  work_type_other VARCHAR(150) NULL,
  training_purpose VARCHAR(500) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  date_of_birth DATE NOT NULL,
  physical_address VARCHAR(255) NOT NULL,
  contact_number VARCHAR(30) NOT NULL,
  email VARCHAR(255) NULL,
  training_category VARCHAR(30) NOT NULL,

  -- Section C: Educational Background
  education_level VARCHAR(50) NOT NULL,
  education_level_other VARCHAR(150) NULL,

  -- Section D: Apprenticeship Details (only when training_category = Apprentice Trainee)
  master_name VARCHAR(150) NULL,
  master_specialization VARCHAR(500) NULL,
  master_specialization_other VARCHAR(150) NULL,
  master_contact_number VARCHAR(30) NULL,
  workshop_name VARCHAR(150) NULL,
  workshop_location VARCHAR(255) NULL,
  apprenticeship_duration VARCHAR(30) NULL,

  -- Section E: Skills & Professional Experience
  main_skill_area VARCHAR(500) NOT NULL,
  main_skill_area_other VARCHAR(150) NULL,
  tools_owned VARCHAR(50) NOT NULL,

  -- Section G: Health & Safety
  ability_status VARCHAR(20) NOT NULL,

  -- Section F: Declaration
  declaration_confirmed TINYINT(1) NOT NULL,
  declaration_name VARCHAR(150) NOT NULL,

  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
