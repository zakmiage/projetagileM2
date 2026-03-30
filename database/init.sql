-- Création et sélection de la base de données
CREATE DATABASE IF NOT EXISTS gestion_assos;
USE gestion_assos;

-- 1. Table users (Authentification du Bureau)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table members (Annuaire & Suivi Légal)
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table events (Gestion des événements)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table budget_lines (Finances, FSDIE et Justificatifs)
CREATE TABLE IF NOT EXISTS budget_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    type ENUM('REVENUE', 'EXPENSE') NOT NULL,
    label VARCHAR(200) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    is_fsdie_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    file_path VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ==========================================
-- JEU DE DONNÉES DE TEST (FIXTURES)
-- ==========================================

-- Insertion des membres du bureau
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES 
('clement@pulse.fr', 'hash_factice_ici', 'PRESIDENT', 'Clément', 'Dupont'),
('melanie@pulse.fr', 'hash_factice_ici', 'TREASURER', 'Mélanie', 'Martin');

-- Insertion d'adhérents de test (issus de votre export HelloAsso)
INSERT INTO members (first_name, last_name, email, t_shirt_size, allergies, is_certificate_ok, is_waiver_ok) VALUES 
('Pauline', 'Fournier', 'pauline.f@exemple.fr', 'XM', 'Arachides', TRUE, TRUE),
('Victor', 'Vincent', 'victor.v@exemple.fr', 'L', NULL, FALSE, TRUE),
('Sarah', 'Michel', 'sarah.michel@exemple.fr', NULL, NULL, FALSE, FALSE);

-- Insertion des événements
INSERT INTO events (name) VALUES 
('Week-End Intégration 2027'), 
('Week-End Ski 2026');

-- Insertion de lignes budgétaires pour tester le Calculateur FSDIE
INSERT INTO budget_lines (event_id, type, label, amount, is_fsdie_eligible) VALUES 
(1, 'REVENUE', 'Billetterie HelloAsso WEI', 15000.00, FALSE),
(1, 'EXPENSE', 'Location Autocars Médoc', 2500.00, TRUE),
(1, 'EXPENSE', 'Achat Nourriture (Non éligible)', 2000.00, FALSE),
(2, 'EXPENSE', 'Forfaits Ski Gourette', 4500.00, FALSE);
