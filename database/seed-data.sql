-- =============================================================================
-- seed-data.sql  —  Jeu de données de test complet pour projetagileM2
-- Usage : source ./database/seed-data.sql (après avoir exécuté init.sql)
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
-- 1. UTILISATEURS ADMINISTRATEURS
-- =============================================================================
INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
(1, 'admin@kubik.fr',    '$2b$10$hashedpassword1', 'ADMIN',    'Admin',    'KUBIK'),
(2, 'bureau@kubik.fr',   '$2b$10$hashedpassword2', 'ADMIN',    'Bureau',   'KUBIK'),
(3, 'tresorier@kubik.fr','$2b$10$hashedpassword3', 'MEMBER',   'Sarah',    'Trésorière');

-- =============================================================================
-- 2. MEMBRES (12 profils variés : tailles, allergies, docs)
-- =============================================================================
INSERT INTO members (id, first_name, last_name, email, t_shirt_size, allergies, is_certificate_ok, is_waiver_ok, is_image_rights_ok) VALUES
(1,  'Alice',   'Martin',    'alice.martin@etu.univ.fr',    'S',   NULL,               1, 1, 1),
(2,  'Baptiste','Moreau',    'baptiste.moreau@etu.univ.fr', 'M',   NULL,               1, 0, 1),
(3,  'Camille', 'Bernard',   'camille.bernard@etu.univ.fr', 'XS',  'Lactose',          0, 1, 0),
(4,  'David',   'Thomas',    'david.thomas@etu.univ.fr',    'L',   NULL,               1, 1, 1),
(5,  'Emma',    'Laurent',   'emma.laurent@etu.univ.fr',    'M',   'Gluten',           1, 1, 1),
(6,  'Florian', 'Robert',    'florian.robert@etu.univ.fr',  'XL',  NULL,               1, 1, 0),
(7,  'Gaëlle',  'Simon',     'gaelle.simon@etu.univ.fr',    'S',   'Arachides',        1, 1, 1),
(8,  'Hugo',    'Michel',    'hugo.michel@etu.univ.fr',     'L',   NULL,               0, 0, 0),
(9,  'Inès',    'Garcia',    'ines.garcia@etu.univ.fr',     'M',   NULL,               1, 1, 1),
(10, 'Julien',  'Martinez',  'julien.martinez@etu.univ.fr', 'XXL', NULL,               1, 1, 1),
(11, 'Kevin',   'Dupuis',    'kevin.dupuis@etu.univ.fr',    'M',   'Noix, Kiwi',       1, 0, 1),
(12, 'Lucie',   'Petit',     'lucie.petit@etu.univ.fr',     'XS',  NULL,               1, 1, 1);

-- =============================================================================
-- 3. ÉVÉNEMENTS
--    Passés  (1-5) : budget réel + prévisionnel, cas variés
--    Futurs  (6-8) : budget prévisionnel uniquement
-- =============================================================================
INSERT INTO events (id, name, description, start_date, end_date, capacity) VALUES

-- ---- ÉVÉNEMENTS PASSÉS ----

-- #1 : Gala emblématique, presque plein, budget bien justifié
(1, 'Gala KUBIK 2024',
    'Soirée de gala annuelle — salle de prestige, traiteur, DJ. Fond de salle 500 personnes.',
    '2024-12-14 19:00:00', '2024-12-15 04:00:00', 500),

-- #2 : WEI — bonne participation, aucun justificatif joint (cas pire)
(2, 'Week-end d''intégration (WEI) 2024',
    'Week-end d''accueil des nouveaux étudiants MIAGE. 3 jours en domaine privé.',
    '2024-09-20 08:00:00', '2024-09-22 18:00:00', 150),

-- #3 : WES — partiellement justifié, quelques lignes sans pièce
(3, 'Week-end des étudiants en stage (WES) 2024',
    'Week-end détente pour les M1 en alternance. Activités outdoor, soirée.',
    '2024-11-08 14:00:00', '2024-11-10 12:00:00', 80),

-- #4 : Petite soirée — complète, budget simple
(4, 'Soirée Saint-Valentin 2025',
    'Soirée thématique Saint-Valentin au campus. Quiz, blind test, animations.',
    '2025-02-14 20:00:00', '2025-02-15 01:00:00', 100),

-- #5 : Tournoi BDE — très peu d''inscrits, budget minuscule
(5, 'Tournoi sportif inter-promo 2025',
    'Tournoi de foot, badminton et ping-pong entre promos MIAGE.',
    '2025-10-04 09:00:00', '2025-10-04 18:00:00', 30),

-- ---- ÉVÉNEMENTS FUTURS ----

-- #6 : WEI à venir — inscriptions en cours, ~7 % rempli, budget prévisionnel
(6, 'Week-end d''intégration (WEI) 2026',
    'Le WEI annuel : 3 jours pour accueillir la promo 2026 en immersion totale.',
    '2026-09-18 08:00:00', '2026-09-20 18:00:00', 120),

-- #7 : Gala 2026 — presque complet (80 %), budget partiellement réservé
(7, 'Gala KUBIK 2026',
    'Soirée de prestige de fin d''année. Réservation de la salle en cours.',
    '2026-12-12 19:00:00', '2026-12-13 04:00:00', 15),

-- #8 : Week-end ski — loin dans le futur, très peu d''inscrits, budget esquissé
(8, 'Week-end ski Alpes 2027',
    'Séjour ski 4 jours à Chamrousse. Forfait + hébergement + navette.',
    '2027-02-05 07:00:00', '2027-02-08 20:00:00', 40);

-- =============================================================================
-- 4. INSCRITS AUX ÉVÉNEMENTS (event_participants)
--    Les inscrits NE SONT PAS forcément des adhérents.
--    Seule la décharge droit à l'image est trackée ici.
-- =============================================================================

-- Gala KUBIK 2024 (id=1) — 10 inscrits / 500
-- dont 6 adhérents (même email) et 4 externes
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(1, 'Alice',    'Martin',   'alice.martin@etu.univ.fr',      1, 1),
(1, 'Baptiste', 'Moreau',   'baptiste.moreau@etu.univ.fr',   1, 0),
(1, 'David',    'Thomas',   'david.thomas@etu.univ.fr',      1, 1),
(1, 'Emma',     'Laurent',  'emma.laurent@etu.univ.fr',      1, 1),
(1, 'Florian',  'Robert',   'florian.robert@etu.univ.fr',    0, 1),
(1, 'Hugo',     'Michel',   'hugo.michel@etu.univ.fr',       0, 0),
-- Externes non-adhérents
(1, 'Thomas',   'Leblanc',  'thomas.leblanc@gmail.com',      1, 1),
(1, 'Mathilde', 'Durand',   'mathilde.durand@gmail.com',     1, 1),
(1, 'Arthur',   'Faure',    'arthur.faure@yahoo.fr',         0, 0),
(1, 'Léa',      'Garnier',  'lea.garnier@outlook.com',       1, 1);

-- WEI 2024 (id=2) — 9 inscrits / 150
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(2, 'Alice',    'Martin',   'alice.martin@etu.univ.fr',      1, 1),
(2, 'Baptiste', 'Moreau',   'baptiste.moreau@etu.univ.fr',   1, 0),
(2, 'Camille',  'Bernard',  'camille.bernard@etu.univ.fr',   0, 1),
(2, 'Emma',     'Laurent',  'emma.laurent@etu.univ.fr',      1, 0),
(2, 'Gaëlle',   'Simon',    'gaelle.simon@etu.univ.fr',      1, 1),
(2, 'Julien',   'Martinez', 'julien.martinez@etu.univ.fr',   1, 0),
-- Externes
(2, 'Clément',  'Marchand', 'clement.marchand@gmail.com',    1, 1),
(2, 'Noémie',   'Renard',   'noemie.renard@gmail.com',       0, 0),
(2, 'Romain',   'Brun',     'romain.brun@hotmail.fr',        1, 1);

-- WES 2024 (id=3) — 6 inscrits / 80
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(3, 'Baptiste', 'Moreau',   'baptiste.moreau@etu.univ.fr',   1, 1),
(3, 'David',    'Thomas',   'david.thomas@etu.univ.fr',      1, 1),
(3, 'Gaëlle',   'Simon',    'gaelle.simon@etu.univ.fr',      1, 1),
(3, 'Lucie',    'Petit',    'lucie.petit@etu.univ.fr',       1, 1),
-- Externes
(3, 'Paul',     'Bernard',  'paul.bernard@gmail.com',        1, 1),
(3, 'Chloé',    'Vincent',  'chloe.vincent@gmail.com',       0, 0);

-- Soirée Saint-Valentin 2025 (id=4) — 5 inscrits / 100
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(4, 'Camille',  'Bernard',  'camille.bernard@etu.univ.fr',   1, 1),
(4, 'Florian',  'Robert',   'florian.robert@etu.univ.fr',    0, 0),
(4, 'Inès',     'Garcia',   'ines.garcia@etu.univ.fr',       1, 1),
-- Externes
(4, 'Sophie',   'Morel',    'sophie.morel@gmail.com',        1, 1),
(4, 'Nicolas',  'Petit',    'nicolas.petit@icloud.com',      1, 1);

-- Tournoi sportif 2025 (id=5) — 7 inscrits / 30
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(5, 'Alice',    'Martin',   'alice.martin@etu.univ.fr',      1, 1),
(5, 'Emma',     'Laurent',  'emma.laurent@etu.univ.fr',      1, 1),
(5, 'Hugo',     'Michel',   'hugo.michel@etu.univ.fr',       1, 1),
(5, 'Kevin',    'Dupuis',   'kevin.dupuis@etu.univ.fr',      1, 1),
(5, 'Lucie',    'Petit',    'lucie.petit@etu.univ.fr',       1, 1),
-- Externes
(5, 'Alexis',   'Fontaine', 'alexis.fontaine@gmail.com',     1, 1),
(5, 'Camille',  'Aubert',   'camille.aubert@yahoo.fr',       0, 0);

-- WEI 2026 (id=6) — 11 inscrits / 120, inscriptions ouvertes
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(6, 'Alice',    'Martin',   'alice.martin@etu.univ.fr',      1, 1),
(6, 'Baptiste', 'Moreau',   'baptiste.moreau@etu.univ.fr',   0, 0),
(6, 'Camille',  'Bernard',  'camille.bernard@etu.univ.fr',   0, 0),
(6, 'David',    'Thomas',   'david.thomas@etu.univ.fr',      1, 1),
(6, 'Emma',     'Laurent',  'emma.laurent@etu.univ.fr',      1, 1),
(6, 'Florian',  'Robert',   'florian.robert@etu.univ.fr',    0, 0),
(6, 'Inès',     'Garcia',   'ines.garcia@etu.univ.fr',       1, 1),
(6, 'Julien',   'Martinez', 'julien.martinez@etu.univ.fr',   0, 0),
(6, 'Lucie',    'Petit',    'lucie.petit@etu.univ.fr',       1, 1),
-- Externes encore en phase d'inscription
(6, 'Yasmine',  'Chaoui',   'yasmine.chaoui@gmail.com',      0, 0),
(6, 'Ethan',    'Roux',     'ethan.roux@gmail.com',          1, 0);

-- Gala KUBIK 2026 (id=7) — 14 inscrits / 15
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(7, 'Alice',    'Martin',   'alice.martin@etu.univ.fr',      1, 1),
(7, 'Baptiste', 'Moreau',   'baptiste.moreau@etu.univ.fr',   1, 1),
(7, 'Camille',  'Bernard',  'camille.bernard@etu.univ.fr',   0, 0),
(7, 'David',    'Thomas',   'david.thomas@etu.univ.fr',      1, 1),
(7, 'Emma',     'Laurent',  'emma.laurent@etu.univ.fr',      0, 0),
(7, 'Florian',  'Robert',   'florian.robert@etu.univ.fr',    1, 1),
(7, 'Gaëlle',   'Simon',    'gaelle.simon@etu.univ.fr',      0, 0),
(7, 'Hugo',     'Michel',   'hugo.michel@etu.univ.fr',       0, 0),
(7, 'Inès',     'Garcia',   'ines.garcia@etu.univ.fr',       1, 1),
(7, 'Julien',   'Martinez', 'julien.martinez@etu.univ.fr',   1, 1),
(7, 'Kevin',    'Dupuis',   'kevin.dupuis@etu.univ.fr',      1, 1),
(7, 'Lucie',    'Petit',    'lucie.petit@etu.univ.fr',       1, 1),
-- Externes
(7, 'Jade',     'Bonnet',   'jade.bonnet@gmail.com',         1, 1),
(7, 'Louis',    'Girard',   'louis.girard@outlook.com',      0, 0);

-- Week-end ski 2027 (id=8) — 3 inscrits / 40
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(8, 'David',    'Thomas',   'david.thomas@etu.univ.fr',      1, 1),
(8, 'Inès',     'Garcia',   'ines.garcia@etu.univ.fr',       1, 0),
-- Externe enthousiaste
(8, 'Maxime',   'Perrin',   'maxime.perrin@gmail.com',       1, 1);

-- =============================================================================
-- 5. BUDGET
-- =============================================================================

-- -------------------------------------------------------------------
-- Gala KUBIK 2024 (id=1) — Budget complet, réel > prév. pour certains
--   FSDIE : 3 lignes éligibles dont 2 avec justificatifs joints
-- -------------------------------------------------------------------
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES
(1, 'EXPENSE', 'Logistique',            'Location salle des fêtes',   2536.00, 2536.00, 1, 1),
(1, 'EXPENSE', 'Logistique',            'Transport (navettes)',        1078.00, 1120.00, 1, 1),
(1, 'EXPENSE', 'Nourriture',            'Traiteur VIP',               1500.00, 1450.00, 1, 1),
(1, 'EXPENSE', 'Animations',            'DJ & sono',                   975.00,  975.00, 0, 1),
(1, 'EXPENSE', 'Communication',         'Flyers & affiches',           150.00,  132.50, 0, 1),
(1, 'REVENUE', 'Billetterie',           'Vente de billets (476 pax)', 5900.00, 5200.00, 0, 1),
(1, 'REVENUE', 'Financements',          'Subvention BDE',             1000.00, 1000.00, 0, 1);

-- -------------------------------------------------------------------
-- WEI 2024 (id=2) — Budget réel renseigné, AUCUN justificatif (pire cas)
-- -------------------------------------------------------------------
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES
(2, 'EXPENSE', 'Logistique',            'Domaine Peyreguilhot',       2536.00, 2536.00, 1, 1),
(2, 'EXPENSE', 'Logistique',            'Transport (bus)',             1078.00, 1078.00, 1, 1),
(2, 'EXPENSE', 'Logistique',            'Protection civile',           815.00,  815.00, 1, 1),
(2, 'EXPENSE', 'Logistique',            'Essences et péages',          151.88,  151.88, 1, 1),
(2, 'EXPENSE', 'Nourriture et boissons','Nourriture et petit-déj',    760.85,  760.85, 1, 1),
(2, 'EXPENSE', 'Nourriture et boissons','Bière (8 fûts)',              790.00,  790.00, 0, 1),
(2, 'EXPENSE', 'Animations',            'DJ',                          975.00,  975.00, 1, 1),
(2, 'EXPENSE', 'Animations',            'Gonflables',                  150.00,  150.00, 1, 1),
(2, 'REVENUE', 'Billetterie',           'Cotisations participants',   5900.00, 5900.00, 0, 1),
(2, 'REVENUE', 'Financements',          'FSDIE obtenu',               1500.00, 1500.00, 0, 1),
(2, 'REVENUE', 'Financements',          'UF MIAGE',                    850.00,  850.00, 0, 1);

-- -------------------------------------------------------------------
-- WES 2024 (id=3) — Budget partiellement justifié (2 lign. sur 4 FSDIE)
-- -------------------------------------------------------------------
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES
(3, 'EXPENSE', 'Logistique',   'Gîte de groupe',           1200.00, 1180.00, 1, 1),
(3, 'EXPENSE', 'Logistique',   'Covoiturage & essence',     220.00,  235.00, 1, 1),
(3, 'EXPENSE', 'Animations',   'Activité accrobranche',     320.00,  320.00, 1, 1),
(3, 'EXPENSE', 'Nourriture',   'Courses alimentaires',      410.00,  398.00, 1, 1),
(3, 'EXPENSE', 'Logistique',   'Matériel de soirée',         80.00,   65.00, 0, 1),
(3, 'REVENUE', 'Billetterie',  'Cotisations (4 pax × 55€)',  220.00,  220.00, 0, 1),
(3, 'REVENUE', 'Financements', 'FSDIE demandé',             1500.00, 1200.00, 0, 1);

-- -------------------------------------------------------------------
-- Soirée Saint-Valentin 2025 (id=4) — Budget simple, tout justifié
-- -------------------------------------------------------------------
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES
(4, 'EXPENSE', 'Logistique',  'Sono & micro',                200.00,  195.00, 1, 1),
(4, 'EXPENSE', 'Nourriture',  'Snacks & boissons',           150.00,  162.00, 0, 1),
(4, 'EXPENSE', 'Animations',  'Supports blind test',          30.00,   28.00, 0, 1),
(4, 'REVENUE', 'Billetterie', 'Entrées (3 × 10€)',            30.00,   30.00, 0, 1);

-- -------------------------------------------------------------------
-- Tournoi sportif 2025 (id=5) — Budget minimal, tout réel, tout justifié
-- -------------------------------------------------------------------
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES
(5, 'EXPENSE', 'Logistique',  'Réservation gymnase',          80.00,   80.00, 1, 1),
(5, 'EXPENSE', 'Nourriture',  'Collations & eau',             60.00,   55.00, 0, 1),
(5, 'EXPENSE', 'Animations',  'Trophées & médailles',         45.00,   48.00, 0, 1),
(5, 'REVENUE', 'Billetterie', 'Inscriptions (5 × 5€)',        25.00,   25.00, 0, 1);

-- -------------------------------------------------------------------
-- WEI 2026 (id=6) — Budget prévisionnel uniquement (actual_amount NULL)
-- -------------------------------------------------------------------
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES
(6, 'EXPENSE', 'Logistique',            'Domaine privatisé',          2800.00, NULL, 1, 1),
(6, 'EXPENSE', 'Logistique',            'Transport (2 bus)',           1200.00, NULL, 1, 1),
(6, 'EXPENSE', 'Logistique',            'Protection civile',           900.00, NULL, 1, 1),
(6, 'EXPENSE', 'Nourriture et boissons','Repas & petit-déj',           850.00, NULL, 1, 1),
(6, 'EXPENSE', 'Animations',            'DJ & animations',            1050.00, NULL, 1, 1),
(6, 'EXPENSE', 'Communication',         'Goodies & tote-bags',         200.00, NULL, 0, 1),
(6, 'REVENUE', 'Billetterie',           'Cotisations (120 pax)',      4800.00, NULL, 0, 1),
(6, 'REVENUE', 'Financements',          'FSDIE sollicité',            2000.00, NULL, 0, 1),
(6, 'REVENUE', 'Financements',          'UF MIAGE (demandé)',          900.00, NULL, 0, 1);

-- -------------------------------------------------------------------
-- Gala KUBIK 2026 (id=7) — Budget prévisionnel, quelques acomptes versés
-- -------------------------------------------------------------------
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES
(7, 'EXPENSE', 'Logistique',    'Location salle prestige',    3200.00, 1600.00, 1, 1), -- acompte 50%
(7, 'EXPENSE', 'Logistique',    'Transport VIP',              1100.00,    NULL, 1, 1),
(7, 'EXPENSE', 'Nourriture',    'Traiteur gastronomique',     2000.00,    NULL, 1, 1),
(7, 'EXPENSE', 'Animations',    'DJ + light show',            1200.00,    NULL, 0, 1),
(7, 'EXPENSE', 'Communication', 'Flyers & billets imprimés',   180.00,    NULL, 0, 1),
(7, 'REVENUE', 'Billetterie',   'Ventes prévisionnelles',     6000.00,    NULL, 0, 1),
(7, 'REVENUE', 'Financements',  'FSDIE (dossier en cours)',   2000.00,    NULL, 0, 1);

-- -------------------------------------------------------------------
-- Week-end ski 2027 (id=8) — Budget esquissé, rien de réservé
-- -------------------------------------------------------------------
INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by) VALUES
(8, 'EXPENSE', 'Logistique',  'Hébergement (chalet)',        2400.00, NULL, 1, 1),
(8, 'EXPENSE', 'Logistique',  'Forfaits ski (40 pax)',       3600.00, NULL, 1, 1),
(8, 'EXPENSE', 'Logistique',  'Location de matériel',         800.00, NULL, 1, 1),
(8, 'EXPENSE', 'Logistique',  'Navette aller-retour',         600.00, NULL, 1, 1),
(8, 'EXPENSE', 'Nourriture',  'Repas sur place',              960.00, NULL, 0, 1),
(8, 'REVENUE', 'Billetterie', 'Cotisations (40 × 195€)',     7800.00, NULL, 0, 1),
(8, 'REVENUE', 'Financements','Aide FSDIE envisagée',        2000.00, NULL, 0, 1);

-- =============================================================================
-- 6. JUSTIFICATIFS (budget_attachments)
--    Simule des fichiers déjà uploadés pour certains events passés
-- =============================================================================

-- Gala KUBIK 2024 (budget_line ids 1,2,3 = FSDIE eligible)
-- → 2 justificatifs sur 3  (ligne 3 "Traiteur VIP" sans justificatif)
INSERT INTO budget_attachments (budget_line_id, file_name, file_path) VALUES
(1, 'facture_salle_2024.pdf',    'uploads/budget/facture_salle_2024.pdf'),
(2, 'facture_transport_2024.pdf','uploads/budget/facture_transport_2024.pdf');

-- WES 2024 (budget_line ids : gîte=15, covoiturage=16, accrobranche=17, courses=18 = FSDIE)
-- → 2 justificatifs sur 4 (accrobranche + courses sans justificatif)
INSERT INTO budget_attachments (budget_line_id, file_name, file_path) VALUES
(15, 'facture_gite_wes.pdf',    'uploads/budget/facture_gite_wes.pdf'),
(16, 'justif_covoiturage.pdf',  'uploads/budget/justif_covoiturage.pdf');

-- Soirée Saint-Valentin 2025 (budget_line id=26 = sono, FSDIE)
-- → 1 justificatif sur 1 = tout bon
INSERT INTO budget_attachments (budget_line_id, file_name, file_path) VALUES
(26, 'facture_sono_valentin.pdf','uploads/budget/facture_sono_valentin.pdf');

-- Tournoi 2025 (budget_line id=30 = gymnase, FSDIE)
-- → 1 sur 1 = tout bon
INSERT INTO budget_attachments (budget_line_id, file_name, file_path) VALUES
(30, 'facture_gymnase_2025.pdf','uploads/budget/facture_gymnase_2025.pdf');
