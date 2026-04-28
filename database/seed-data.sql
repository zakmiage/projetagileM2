-- =============================================================================
-- seed-data.sql — Jeu de données complet et diversifié (ÉTAPE 1 : Users + Members + Events)
-- Usage : source ./database/seed-data.sql
-- =============================================================================
USE gestion_assos;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE budget_attachments;
TRUNCATE TABLE budget_lines;
TRUNCATE TABLE event_participants;
TRUNCATE TABLE member_attachments;
TRUNCATE TABLE events;
TRUNCATE TABLE members;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. UTILISATEURS
--    Mots de passe (bcrypt $2b$10$, salt=10) :
--    toto@mail.com  → toto
--    admin@kubik.fr → admin
--    bureau@kubik.fr → bureau
--    tresorier@kubik.fr → tresorier
-- =============================================================================
INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
(1, 'admin@kubik.fr',
 '$2b$10$7AV1ZLVIqfA15RVvQqcDHe7QHpRxmATtFV5NhPsmZj23e6nXfi/MK',
 'ADMIN', 'Admin', 'KUBIK'),
(2, 'bureau@kubik.fr',
 '$2b$10$3i9qS/H8plwq1dZwWuB3l.CR.j20t/FxF566yUyXZshNnCweXAeum',
 'ADMIN', 'Bureau', 'KUBIK'),
(3, 'tresorier@kubik.fr',
 '$2b$10$66WzycINraUuqcrExydQFOI6W4RlD6NSOI5ycWRiRVmrcVikjrGEO',
 'MEMBER', 'Sarah', 'Trésorière'),
(4, 'toto@mail.com',
 '$2b$10$kKMQ/t3rvyb9dfasLT5Zqe9XeBLF8ddczLy7U3eMDvxvySm5de5.2',
 'ADMIN', 'Toto', 'Test');

-- =============================================================================
-- 2. MEMBRES (20 profils — tailles variées, allergies, docs partiels)
-- =============================================================================
INSERT INTO members (id, first_name, last_name, email, t_shirt_size, allergies, is_certificate_ok, is_waiver_ok, is_image_rights_ok) VALUES
(1,  'Alice',    'Martin',    'alice.martin@etu.univ.fr',    'S',   NULL,            1, 1, 1),
(2,  'Baptiste', 'Moreau',    'baptiste.moreau@etu.univ.fr', 'M',   NULL,            1, 0, 1),
(3,  'Camille',  'Bernard',   'camille.bernard@etu.univ.fr', 'XS',  'Lactose',       0, 1, 0),
(4,  'David',    'Thomas',    'david.thomas@etu.univ.fr',    'L',   NULL,            1, 1, 1),
(5,  'Emma',     'Laurent',   'emma.laurent@etu.univ.fr',    'M',   'Gluten',        1, 1, 1),
(6,  'Florian',  'Robert',    'florian.robert@etu.univ.fr',  'XL',  NULL,            1, 1, 0),
(7,  'Gaëlle',   'Simon',     'gaelle.simon@etu.univ.fr',    'S',   'Arachides',     1, 1, 1),
(8,  'Hugo',     'Michel',    'hugo.michel@etu.univ.fr',     'L',   NULL,            0, 0, 0),
(9,  'Inès',     'Garcia',    'ines.garcia@etu.univ.fr',     'M',   NULL,            1, 1, 1),
(10, 'Julien',   'Martinez',  'julien.martinez@etu.univ.fr', 'XXL', NULL,            1, 1, 1),
(11, 'Kevin',    'Dupuis',    'kevin.dupuis@etu.univ.fr',    'M',   'Noix, Kiwi',    1, 0, 1),
(12, 'Lucie',    'Petit',     'lucie.petit@etu.univ.fr',     'XS',  NULL,            1, 1, 1),
(13, 'Manon',    'Richard',   'manon.richard@etu.univ.fr',   'S',   NULL,            1, 1, 1),
(14, 'Nathan',   'Garnier',   'nathan.garnier@etu.univ.fr',  'L',   'Lactose',       0, 0, 1),
(15, 'Océane',   'Blanchard', 'oceane.blanchard@etu.univ.fr','M',   NULL,            1, 1, 0),
(16, 'Paul',     'Renaud',    'paul.renaud@etu.univ.fr',     'M',   NULL,            1, 1, 1),
(17, 'Rachel',   'Dupuis',    'rachel.dupuis@etu.univ.fr',   'XS',  'Fruits de mer', 1, 1, 1),
(18, 'Simon',    'Arnaud',    'simon.arnaud@etu.univ.fr',    'L',   NULL,            0, 1, 1),
(19, 'Théo',     'Vigneron',  'theo.vigneron@etu.univ.fr',   'M',   NULL,            1, 0, 0),
(20, 'Yasmine',  'Chaoui',    'yasmine.chaoui@etu.univ.fr',  'S',   'Arachides',     1, 1, 1);

-- =============================================================================
-- 3. EVENTS
--    Passés (1-5) : données réelles + budget complet
--    Futurs (6-8) : inscriptions ouvertes, budget prévisionnel
-- =============================================================================
INSERT INTO events (id, name, description, start_date, end_date, capacity) VALUES

-- PASSÉS
(1, 'Gala KUBIK 2024',
 'Soirée de gala annuelle — salle de prestige, traiteur, DJ. 500 personnes.',
 '2024-12-14 19:00:00', '2024-12-15 04:00:00', 500),

(2, 'WEI 2025',
 'Week-end d''intégration — 3 jours en domaine privé, 150 étudiants.',
 '2025-09-19 08:00:00', '2025-09-21 18:00:00', 150),

(3, 'WES 2024',
 'Week-end des étudiants en stage — détente, outdoor, soirée.',
 '2024-11-08 14:00:00', '2024-11-10 12:00:00', 80),

(4, 'Soirée Saint-Valentin 2025',
 'Soirée thématique — quiz, blind test, animations.',
 '2025-02-14 20:00:00', '2025-02-15 01:00:00', 100),

(5, 'Tournoi sportif inter-promo 2025',
 'Tournoi de foot, badminton et ping-pong entre promos MIAGE.',
 '2025-10-04 09:00:00', '2025-10-04 18:00:00', 30),

-- FUTURS
(6, 'WEI 2026',
 'Le WEI annuel : 3 jours pour accueillir la promo 2026 en immersion totale.',
 '2026-09-18 08:00:00', '2026-09-20 18:00:00', 120),

(7, 'Gala KUBIK 2026',
 'Soirée de prestige de fin d''année. Réservation de la salle en cours.',
 '2026-12-12 19:00:00', '2026-12-13 04:00:00', 200),

(8, 'Week-end ski Alpes 2027',
 'Séjour ski 4 jours à Chamrousse. Forfait + hébergement + navette.',
 '2027-02-05 07:00:00', '2027-02-08 20:00:00', 40);
