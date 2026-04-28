-- =============================================================================
-- seed-kanban.sql — Données Kanban réalistes calées sur les vrais événements
-- Événements réels : Gala KUBIK 2024 (id=1), WEI 2024 (id=2), WES 2024 (id=3)
-- =============================================================================
USE gestion_assos;

-- Nettoyage
DELETE FROM kanban_card_members WHERE card_id IN (SELECT id FROM kanban_cards WHERE column_id IN (SELECT id FROM kanban_columns WHERE event_id IN (1,2,3,4,5)));
DELETE FROM kanban_cards WHERE column_id IN (SELECT id FROM kanban_columns WHERE event_id IN (1,2,3,4,5));
DELETE FROM kanban_columns WHERE event_id IN (1,2,3,4,5);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 1 : Gala KUBIK 2024
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kanban_columns (event_id, title, position, color) VALUES
  (1, 'À organiser', 0, '#6366f1'),
  (1, 'En cours',    1, '#f59e0b'),
  (1, 'Validé ✓',   2, '#10b981');

SET @g_todo  = (SELECT id FROM kanban_columns WHERE event_id=1 AND title='À organiser');
SET @g_wip   = (SELECT id FROM kanban_columns WHERE event_id=1 AND title='En cours');
SET @g_done  = (SELECT id FROM kanban_columns WHERE event_id=1 AND title='Validé ✓');

INSERT INTO kanban_cards (column_id, title, description, position, label, due_date) VALUES
  (@g_todo, 'Réserver la salle Le Rooftop',   'Contacter M. Dupont — 06 12 34 56 78', 0, 'logistique',    '2024-11-01'),
  (@g_todo, 'Commander 200 verres à cocktail', 'Budget max 80€ — Amazon ou fournisseur', 1, 'achats',       '2024-11-15'),
  (@g_todo, 'Recruter DJ Résidents KUBIK',     'Demander à Florian s''il connaît quelqu''un', 2, 'animation', '2024-11-20'),
  (@g_wip,  'Design flyer & affiches',         'En cours chez Gaëlle — Format A2 + story IG', 0, 'communication', '2024-11-10'),
  (@g_wip,  'Devis sono & éclairage',         'Demande de devis envoyée à 3 prestataires', 1, 'logistique', '2024-11-05'),
  (@g_done, 'Ouverture billetterie HelloAsso', 'Lien partagé sur Instagram le 28/10', 0, 'communication',  NULL),
  (@g_done, 'Demande subvention FSDIE',        'Dossier soumis le 25/10 — en attente réponse', 1, 'admin',  NULL),
  (@g_done, 'Réunion kick-off bureau',         NULL, 2, 'admin', NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 2 : WEI 2025 — Weekend d'intégration
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kanban_columns (event_id, title, position, color) VALUES
  (2, 'Backlog',   0, '#8b5cf6'),
  (2, 'En cours',  1, '#f59e0b'),
  (2, 'Terminé',   2, '#10b981');

SET @w_todo = (SELECT id FROM kanban_columns WHERE event_id=2 AND title='Backlog');
SET @w_wip  = (SELECT id FROM kanban_columns WHERE event_id=2 AND title='En cours');
SET @w_done = (SELECT id FROM kanban_columns WHERE event_id=2 AND title='Terminé');

INSERT INTO kanban_cards (column_id, title, description, position, label, due_date) VALUES
  (@w_todo, 'Louer minibus x4',           'Devis Hertz & Europcar pour 9 places', 0, 'logistique', '2025-08-15'),
  (@w_todo, 'Acheter matériel jeux',       'Ballons, frisbee, tongs, etc.', 1, 'achats', '2025-09-01'),
  (@w_todo, 'Préparer playlist bus',       'Ajouter les classiques MIAGE', 2, 'animation', '2025-09-10'),
  (@w_todo, 'Faire les courses petit-déj', 'Super U : 200 croissants', 3, 'achats', '2025-09-18'),
  (@w_todo, 'Point sécurité croix rouge',  'Vérifier les habilitations', 4, 'admin', '2025-09-05'),
  (@w_wip,  'Planifier programme 3 jours', 'Voir doc partagé Google Drive', 0, 'animation', '2025-08-20'),
  (@w_wip,  'Répartir les chambres',       'Listes des inscrits à trier par promo', 1, 'logistique', '2025-09-10'),
  (@w_wip,  'Briefing des capitaines',     'Réunion sur Discord ce soir', 2, 'communication', '2025-09-15'),
  (@w_wip,  'Récupérer chèques caution',   'Encore 15 personnes manquantes', 3, 'admin', '2025-09-16'),
  (@w_done, 'Envoyer mail de confirmation','Mail envoyé le 10 sept à 150 inscrits', 0, 'communication', NULL),
  (@w_done, 'Réserver le domaine des Pins','Contrat signé le 1er août avec acompte 30%', 1, 'logistique', NULL),
  (@w_done, 'Valider devis traiteur',      'Menu validé pour les 3 repas', 2, 'logistique', NULL),
  (@w_done, 'Achat des fûts de bière',     '20 fûts livrés au local BDE', 3, 'achats', NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 3 : WES 2024
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kanban_columns (event_id, title, position, color) VALUES
  (3, 'À faire',  0, '#6366f1'),
  (3, 'En cours', 1, '#f59e0b'),
  (3, 'Fait',     2, '#10b981');

SET @s_todo = (SELECT id FROM kanban_columns WHERE event_id=3 AND title='À faire');
SET @s_wip  = (SELECT id FROM kanban_columns WHERE event_id=3 AND title='En cours');
SET @s_done = (SELECT id FROM kanban_columns WHERE event_id=3 AND title='Fait');

INSERT INTO kanban_cards (column_id, title, description, position, label, due_date) VALUES
  (@s_todo, 'Inviter intervenants extérieurs', 'Contacter 3 entreprises partenaires', 0, 'communication', '2024-10-01'),
  (@s_wip,  'Préparer supports conférences',   'PPT + vidéo de présentation KUBIK', 0, 'communication', '2024-10-20'),
  (@s_done, 'Réserver salle amphi M300',       'Confirmé avec la scolarité', 0, 'logistique', NULL),
  (@s_done, 'Créer formulaire inscriptions',   'Google Form — 95 inscrits', 1, 'communication', NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 4 : Soirée Saint-Valentin 2025
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kanban_columns (event_id, title, position, color) VALUES
  (4, 'À prévoir', 0, '#ec4899'),
  (4, 'En cours',  1, '#f59e0b'),
  (4, 'OK',        2, '#10b981');

SET @v_todo = (SELECT id FROM kanban_columns WHERE event_id=4 AND title='À prévoir');
SET @v_wip  = (SELECT id FROM kanban_columns WHERE event_id=4 AND title='En cours');
SET @v_done = (SELECT id FROM kanban_columns WHERE event_id=4 AND title='OK');

INSERT INTO kanban_cards (column_id, title, description, position, label, due_date) VALUES
  (@v_todo, 'Fleurs & décoration table', 'Roses rouges — Interflora ou marché', 0, 'achats', '2025-02-10'),
  (@v_wip,  'Menu dîner assis 3 services', 'Traiteur Gascogne — devis en attente', 0, 'logistique', '2025-01-20'),
  (@v_done, 'Billetterie ouverte',        '48 places à 25€ — complet en 3h', 0, 'communication', NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT 5 : Tournoi sportif 2025
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO kanban_columns (event_id, title, position, color) VALUES
  (5, 'À faire',  0, '#6366f1'),
  (5, 'En cours', 1, '#f59e0b'),
  (5, 'Terminé',  2, '#10b981');

SET @t_todo = (SELECT id FROM kanban_columns WHERE event_id=5 AND title='À faire');
SET @t_wip  = (SELECT id FROM kanban_columns WHERE event_id=5 AND title='En cours');
SET @t_done = (SELECT id FROM kanban_columns WHERE event_id=5 AND title='Terminé');

INSERT INTO kanban_cards (column_id, title, description, position, label, due_date) VALUES
  (@t_todo, 'Acheter trophées & médailles', 'Budget 60€ — Amazon Sport', 0, 'achats', '2025-09-01'),
  (@t_todo, 'Réserver terrains municipaux', 'Mairie de Bordeaux — 2 terrains', 1, 'logistique', '2025-08-01'),
  (@t_wip,  'Créer bracket tournoi',        'Outil Challonge — 24 équipes inscrites', 0, 'animation', '2025-09-15'),
  (@t_done, 'Ouvrir inscriptions équipes',  '24 équipes — formulaire fermé', 0, 'communication', NULL),
  (@t_done, 'Demande sono & micro',         'Prêt BDE confirmé', 1, 'logistique', NULL);
