-- =============================================================================
-- seed-shifts.sql — Données de test pour les créneaux de staffing
-- Usage : source ./database/seed-shifts.sql
-- =============================================================================
USE gestion_assos;

-- Shifts pour l'événement 1
INSERT INTO shifts (event_id, label, start_time, end_time, capacity) VALUES
(1, 'Accueil matin',        '2025-06-15 08:00:00', '2025-06-15 12:00:00', 5),
(1, 'Animation après-midi', '2025-06-15 13:00:00', '2025-06-15 17:00:00', 8),
(1, 'Rangement soir',       '2025-06-15 17:00:00', '2025-06-15 20:00:00', 4);

-- Shifts pour l'événement 2
INSERT INTO shifts (event_id, label, start_time, end_time, capacity) VALUES
(2, 'Ouverture stands',     '2025-09-20 09:00:00', '2025-09-20 12:00:00', 6),
(2, 'Conférence',           '2025-09-20 14:00:00', '2025-09-20 16:00:00', 3);

-- Inscriptions test (sans conflits)
INSERT INTO shift_registrations (shift_id, member_id) VALUES
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 5);
