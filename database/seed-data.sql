USE gestion_assos;

SET FOREIGN_KEY_CHECKS = 0;

-- Vidage des tables existantes
TRUNCATE TABLE users;
TRUNCATE TABLE members;
TRUNCATE TABLE events;
TRUNCATE TABLE event_registrations;
TRUNCATE TABLE budget_lines;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. Utilisateurs Administrateurs
-- ============================================
INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES 
(1, 'admin@asso.fr', 'hashed123', 'ADMIN', 'Admin', 'Asso');

-- ============================================
-- 2. Membres de l'association (Annuaire)
-- ============================================
INSERT INTO members (id, first_name, last_name, email, t_shirt_size, allergies, is_certificate_ok, is_waiver_ok, is_image_rights_ok) VALUES 
(1, 'Jean', 'Dupont', 'jean.dupont@etu.univ.fr', 'L', 'Arachides', 1, 0, 1),
(2, 'Marie', 'Curie', 'marie.curie@etu.univ.fr', 'M', '', 1, 1, 1),
(3, 'Alan', 'Turing', 'alan.turing@etu.univ.fr', 'XL', 'Pommes', 0, 1, 0);

-- ============================================
-- 3. Événements
-- ============================================
INSERT INTO events (id, name, description, start_date, end_date, capacity) VALUES 
(1, 'Gala KUBIK 2024', 'Gala annuel de fin d''année', '2024-12-15 19:00:00', '2024-12-16 04:00:00', 500),
(2, 'Week-end d''intégration (WEI)', 'Événement d''accueil des nouveaux', '2024-09-20 08:00:00', '2024-09-22 18:00:00', 150);

-- ============================================
-- 4. Inscriptions aux événements (Participants)
-- ============================================
INSERT INTO event_registrations (event_id, member_id, has_deposit) VALUES 
(1, 1, 1), -- Jean inscrit au Gala
(1, 2, 0), -- Marie inscrite au Gala
(2, 2, 1), -- Marie inscrite au WEI
(2, 3, 0); -- Alan inscrit au WEI

-- ============================================
-- 5. Lignes de Budget (Ici Gala KUBIK ID=1)
-- ============================================
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES 
(1, 'EXPENSE', 'Logistique', 'Salle des Fêtes', 2536.00, 2536.00, 1, 1),
(1, 'EXPENSE', 'Logistique', 'Transport', 1078.00, 1078.00, 1, 1),
(1, 'EXPENSE', 'Nourriture', 'Traiteur VIP', 1500.00, 1450.00, 1, 1),
(1, 'REVENUE', 'Participants', 'Billetterie', 5900.00, 5000.00, 0, 1);
