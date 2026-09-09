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
