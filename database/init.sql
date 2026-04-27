-- =============================================================================
-- init.sql — Création du schéma complet
-- Usage : source ./database/init.sql
-- =============================================================================
CREATE DATABASE IF NOT EXISTS gestion_assos;
USE gestion_assos;

-- ==========================================
-- 1. UTILISATEURS & MEMBRES
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    t_shirt_size VARCHAR(5) NULL,
    allergies TEXT NULL,
    is_certificate_ok BOOLEAN NOT NULL DEFAULT FALSE,
    is_waiver_ok BOOLEAN NOT NULL DEFAULT FALSE,
    is_image_rights_ok BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS member_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT fk_attachment_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- ==========================================
-- 2. ÉVÉNEMENTS & INSCRIPTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    capacity INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS event_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    is_image_rights_ok BOOLEAN NOT NULL DEFAULT FALSE,
    has_deposit BOOLEAN NOT NULL DEFAULT FALSE,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT fk_participant_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE(event_id, email)
);

-- ==========================================
-- 3. FINANCES & JUSTIFICATIFS
-- ==========================================
CREATE TABLE IF NOT EXISTS budget_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    type ENUM('REVENUE', 'EXPENSE') NOT NULL,
    category VARCHAR(50) NOT NULL,
    label VARCHAR(200) NOT NULL,
    forecast_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    actual_amount DECIMAL(10, 2) NULL,
    is_fsdie_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    validation_status ENUM('SOUMIS', 'APPROUVE', 'REFUSE') NOT NULL DEFAULT 'SOUMIS',
    created_by INT NOT NULL,
    updated_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    CONSTRAINT fk_budget_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_budget_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS budget_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_line_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT fk_attachment_budget FOREIGN KEY (budget_line_id) REFERENCES budget_lines(id) ON DELETE CASCADE
);