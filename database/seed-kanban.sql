-- =============================================================================
-- seed-kanban.sql — Données de test pour le tableau Kanban
-- Usage : source ./database/seed-kanban.sql
-- =============================================================================
USE gestion_assos;

-- Colonnes pour l'événement 1
INSERT INTO kanban_columns (event_id, title, position, color) VALUES
(1, 'À faire',   0, '#6366f1'),
(1, 'En cours',  1, '#f59e0b'),
(1, 'Terminé',   2, '#10b981');

-- Cartes
INSERT INTO kanban_cards (column_id, title, description, position, label, due_date) VALUES
(1, 'Réserver la salle',       'Appeler le gestionnaire avant le 15', 0, 'logistique', '2025-05-01'),
(1, 'Commander les goodies',   NULL,                                   1, 'achats',     '2025-05-10'),
(2, 'Préparer le programme',   'Draft v1 à valider en réunion',       0, 'communication', '2025-05-20'),
(3, 'Envoyer les invitations', NULL,                                   0, 'communication', NULL);

-- Kanban pour l'événement 2
INSERT INTO kanban_columns (event_id, title, position, color) VALUES
(2, 'Backlog',  0, '#8b5cf6'),
(2, 'En cours', 1, '#f59e0b'),
(2, 'Done',     2, '#10b981');

INSERT INTO kanban_cards (column_id, title, description, position, label) VALUES
(4, 'Préparer les badges', 'Impression + plastification', 0, 'logistique'),
(5, 'Tester le sono',      NULL,                          0, 'logistique');
