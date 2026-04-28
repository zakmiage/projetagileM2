-- =============================================================================
-- seed-shifts.sql — Données de test réalistes calées sur les vrais événements
-- Événements réels : Gala KUBIK 2024 (id=1), WEI 2024 (id=2), WES 2024 (id=3)
--                   Saint-Valentin 2025 (id=4), Tournoi 2025 (id=5)
-- Membres réels   : Alice(1), Baptiste(2), Camille(3), David(4), Emma(5)
-- =============================================================================
USE gestion_assos;

-- Nettoyage propre avant insertion
DELETE FROM shift_registrations WHERE shift_id IN (SELECT id FROM shifts WHERE event_id IN (1,2,3,4,5));
DELETE FROM shifts WHERE event_id IN (1,2,3,4,5);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 1 : Gala KUBIK 2024 — Sam 14 déc 2024 19h → Dim 15 déc 04h
-- Planning soirée + nuit (cas réel de soirée étudiante)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO shifts (event_id, label, start_time, end_time, capacity) VALUES
  (1, 'Montage & Déco',      '2024-12-14 14:00:00', '2024-12-14 18:30:00', 6),
  (1, 'Accueil & Billetterie','2024-12-14 18:30:00', '2024-12-14 21:00:00', 4),
  (1, 'Bar — 1er service',   '2024-12-14 19:00:00', '2024-12-14 22:00:00', 5),
  (1, 'Bar — 2ème service',  '2024-12-14 22:00:00', '2024-12-15 01:00:00', 5),
  (1, 'Sécurité entrée',     '2024-12-14 18:00:00', '2024-12-15 00:00:00', 3),
  (1, 'Nettoyage & Rangement','2024-12-15 01:00:00', '2024-12-15 04:00:00', 4);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 2 : WEI 2025 — Ven 19 sep → Dim 21 sep 2025
-- Planning week-end d'intégration (3 jours) TRÈS DENSE
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO shifts (event_id, label, start_time, end_time, capacity) VALUES
  -- Vendredi
  (2, 'Chargement des cars (Bordeaux)', '2025-09-19 06:30:00', '2025-09-19 08:30:00', 8),
  (2, 'Accueil arrivées (Domaine)',     '2025-09-19 10:00:00', '2025-09-19 12:30:00', 10),
  (2, 'Préparation repas midi',         '2025-09-19 11:00:00', '2025-09-19 14:00:00', 6),
  (2, 'Installation des Tentes',        '2025-09-19 14:00:00', '2025-09-19 17:00:00', 12),
  (2, 'Sécurité / Croix Rouge (Jour 1)','2025-09-19 14:00:00', '2025-09-19 20:00:00', 4),
  (2, 'Animation soirée d''ouverture',  '2025-09-19 20:00:00', '2025-09-20 02:00:00', 8),
  (2, 'Buvette — Shift 1',              '2025-09-19 21:00:00', '2025-09-20 00:00:00', 5),
  (2, 'Buvette — Shift 2',              '2025-09-20 00:00:00', '2025-09-20 03:00:00', 5),
  (2, 'Garde nuit / Ronde',             '2025-09-20 02:00:00', '2025-09-20 07:00:00', 4),
  -- Samedi
  (2, 'Service Petit-déjeuner',         '2025-09-20 07:30:00', '2025-09-20 10:30:00', 6),
  (2, 'Olympiades — Arbitrage',         '2025-09-20 09:30:00', '2025-09-20 13:00:00', 12),
  (2, 'Olympiades — Logistique',        '2025-09-20 09:00:00', '2025-09-20 14:00:00', 6),
  (2, 'Grand BBQ du midi',              '2025-09-20 11:30:00', '2025-09-20 15:00:00', 8),
  (2, 'Activités libres / Sécurité',    '2025-09-20 15:00:00', '2025-09-20 19:00:00', 5),
  (2, 'Préparation Soirée de Gala',     '2025-09-20 17:00:00', '2025-09-20 20:00:00', 10),
  (2, 'Soirée DJ Guest — Sécurité',     '2025-09-20 21:00:00', '2025-09-21 04:00:00', 6),
  (2, 'Buvette Gala — Shift 1',         '2025-09-20 21:00:00', '2025-09-21 01:00:00', 6),
  (2, 'Buvette Gala — Shift 2',         '2025-09-21 01:00:00', '2025-09-21 04:00:00', 6),
  -- Dimanche
  (2, 'Nettoyage du domaine (Urgent)',  '2025-09-21 09:00:00', '2025-09-21 14:00:00', 20),
  (2, 'Démontage Sono / Lumière',       '2025-09-21 10:00:00', '2025-09-21 13:00:00', 6),
  (2, 'Départ des cars (Retour)',       '2025-09-21 14:00:00', '2025-09-21 17:00:00', 8);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 3 : WES 2024 — Ven 8 nov → Dim 10 nov 2024
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO shifts (event_id, label, start_time, end_time, capacity) VALUES
  (3, 'Installation matériel', '2024-11-08 10:00:00', '2024-11-08 14:00:00', 5),
  (3, 'Conférences jour 1',    '2024-11-08 14:00:00', '2024-11-08 20:00:00', 3),
  (3, 'Soirée networking',     '2024-11-08 20:00:00', '2024-11-09 00:00:00', 4),
  (3, 'Ateliers matin',        '2024-11-09 09:00:00', '2024-11-09 13:00:00', 6),
  (3, 'Clôture & rangement',   '2024-11-10 10:00:00', '2024-11-10 12:00:00', 4);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 4 : Soirée Saint-Valentin 2025 — Ven 14 fév 20h → Sam 15 fév 01h
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO shifts (event_id, label, start_time, end_time, capacity) VALUES
  (4, 'Décoration & mise en place', '2025-02-14 16:00:00', '2025-02-14 19:30:00', 4),
  (4, 'Accueil & placement',        '2025-02-14 19:30:00', '2025-02-14 22:00:00', 3),
  (4, 'Service dîner',              '2025-02-14 20:00:00', '2025-02-14 23:30:00', 5),
  (4, 'Animation danse',            '2025-02-14 22:00:00', '2025-02-15 01:00:00', 3),
  (4, 'Nettoyage fin de soirée',    '2025-02-15 01:00:00', '2025-02-15 03:00:00', 3);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 5 : Tournoi sportif 2025 — Sam 4 oct 2025 09h → 18h
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO shifts (event_id, label, start_time, end_time, capacity) VALUES
  (5, 'Arbitrage — Terrain A matin', '2025-10-04 09:00:00', '2025-10-04 13:00:00', 3),
  (5, 'Arbitrage — Terrain B matin', '2025-10-04 09:00:00', '2025-10-04 13:00:00', 3),
  (5, 'Buvette matin',              '2025-10-04 09:00:00', '2025-10-04 13:30:00', 4),
  (5, 'Arbitrage — Terrain A aprèm','2025-10-04 13:00:00', '2025-10-04 18:00:00', 3),
  (5, 'Arbitrage — Terrain B aprèm','2025-10-04 13:00:00', '2025-10-04 18:00:00', 3),
  (5, 'Buvette après-midi',         '2025-10-04 13:00:00', '2025-10-04 18:30:00', 4),
  (5, 'Remise des prix',            '2025-10-04 17:00:00', '2025-10-04 18:30:00', 5);

-- ─────────────────────────────────────────────────────────────────────────────
-- INSCRIPTIONS réalistes (membres 1-10 sur les shifts du Gala et WEI)
-- ─────────────────────────────────────────────────────────────────────────────

-- Récupère les IDs dynamiquement
SET @gala_montage   = (SELECT id FROM shifts WHERE event_id=1 AND label='Montage & Déco' LIMIT 1);
SET @gala_accueil   = (SELECT id FROM shifts WHERE event_id=1 AND label='Accueil & Billetterie' LIMIT 1);
SET @gala_bar1      = (SELECT id FROM shifts WHERE event_id=1 AND label='Bar — 1er service' LIMIT 1);
SET @gala_bar2      = (SELECT id FROM shifts WHERE event_id=1 AND label='Bar — 2ème service' LIMIT 1);
SET @gala_secu      = (SELECT id FROM shifts WHERE event_id=1 AND label='Sécurité entrée' LIMIT 1);
SET @gala_range     = (SELECT id FROM shifts WHERE event_id=1 AND label='Nettoyage & Rangement' LIMIT 1);

SET @wei_accueil    = (SELECT id FROM shifts WHERE event_id=2 AND label='Accueil arrivées (Domaine)' LIMIT 1);
SET @wei_sport      = (SELECT id FROM shifts WHERE event_id=2 AND label='Olympiades — Arbitrage' LIMIT 1);
SET @wei_bbq        = (SELECT id FROM shifts WHERE event_id=2 AND label='Grand BBQ du midi' LIMIT 1);
SET @wei_range      = (SELECT id FROM shifts WHERE event_id=2 AND label='Nettoyage du domaine (Urgent)' LIMIT 1);
SET @wei_buvette    = (SELECT id FROM shifts WHERE event_id=2 AND label='Buvette — Shift 1' LIMIT 1);
SET @wei_nuit       = (SELECT id FROM shifts WHERE event_id=2 AND label='Garde nuit / Ronde' LIMIT 1);

-- Inscriptions Gala
INSERT INTO shift_registrations (shift_id, member_id) VALUES
  (@gala_montage, 1), (@gala_montage, 3), (@gala_montage, 6),
  (@gala_accueil, 2), (@gala_accueil, 5),
  (@gala_bar1, 4), (@gala_bar1, 7), (@gala_bar1, 9),
  (@gala_bar2, 8), (@gala_bar2, 10),
  (@gala_secu, 1), (@gala_secu, 2),
  (@gala_range, 3), (@gala_range, 4);

-- Inscriptions WEI
INSERT INTO shift_registrations (shift_id, member_id) VALUES
  (@wei_accueil, 5), (@wei_accueil, 6), (@wei_accueil, 7), (@wei_accueil, 1), (@wei_accueil, 2),
  (@wei_sport, 1), (@wei_sport, 2), (@wei_sport, 3), (@wei_sport, 4), (@wei_sport, 5), (@wei_sport, 8), (@wei_sport, 9), (@wei_sport, 10),
  (@wei_bbq, 8), (@wei_bbq, 9), (@wei_bbq, 11), (@wei_bbq, 12),
  (@wei_range, 1), (@wei_range, 3), (@wei_range, 5), (@wei_range, 7), (@wei_range, 9), (@wei_range, 10), (@wei_range, 12), (@wei_range, 14), (@wei_range, 15), (@wei_range, 18), (@wei_range, 20),
  (@wei_buvette, 4), (@wei_buvette, 5), (@wei_buvette, 6),
  (@wei_nuit, 18), (@wei_nuit, 19), (@wei_nuit, 20);
