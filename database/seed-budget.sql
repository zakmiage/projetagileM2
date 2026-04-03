USE gestion_assos;

-- Assurons-nous d'avoir au moins un utilisateur (ID=1) pour la contrainte created_by
INSERT IGNORE INTO users (id, email, password_hash, role, first_name, last_name)
VALUES (1, 'admin@asso.fr', 'hashed123', 'ADMIN', 'Admin', 'Asso');

-- Assurons-nous d'avoir au moins un événement (ID=1) pour la contrainte event_id
INSERT IGNORE INTO events (id, name, start_date, end_date, capacity) 
VALUES (1, 'WEI 2026', '2026-09-10', '2026-09-12', 150);

-- Insertion des données de test pour le budget (provenant de l'ancien mock Angular)
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES 
(1, 'EXPENSE', 'Logistique', 'Domaine Peyreguilhot', 2536.00, 2536.00, TRUE, 1),
(1, 'EXPENSE', 'Logistique', 'Transport', 1078.00, 1078.00, TRUE, 1),
(1, 'EXPENSE', 'Logistique', 'Protec civil', 815.00, 815.00, TRUE, 1),
(1, 'EXPENSE', 'Logistique', 'Essences et péages', 151.88, 151.88, TRUE, 1),
(1, 'EXPENSE', 'Nourriture et boissons', 'Nourriture', 760.85, 760.85, TRUE, 1),
(1, 'EXPENSE', 'Nourriture et boissons', 'Bière (8 fûts)', 790.00, 790.00, FALSE, 1),
(1, 'EXPENSE', 'Animations', 'DJ', 975.00, 975.00, TRUE, 1),
(1, 'EXPENSE', 'Animations', 'Gonflables', 150.00, 150.00, TRUE, 1),
(1, 'REVENUE', 'Participants', 'Participants', 5900.00, 5900.00, FALSE, 1),
(1, 'REVENUE', 'Financements', 'FSDIE', 1500.00, 1500.00, FALSE, 1),
(1, 'REVENUE', 'Financements', 'UF MIAGE', 850.00, 850.00, FALSE, 1);
