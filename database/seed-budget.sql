-- =============================================================================
-- seed-budget.sql (généré par generate-budget.js)
-- ÉTAPE 3 : Budget + Justificatifs + Pièces jointes membres
-- =============================================================================
USE gestion_assos;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE budget_attachments;
TRUNCATE TABLE budget_lines;
TRUNCATE TABLE member_attachments;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- BUDGET LINES
-- =============================================================================
INSERT INTO budget_lines
  (event_id, type, category, label, forecast_amount, actual_amount,
   is_fsdie_eligible, validation_status, created_by)
VALUES
(1,'EXPENSE','Logistique','Location salle des fêtes',2536.00,2536.00,1,'APPROUVE',1),
(1,'EXPENSE','Logistique','Transport (navettes)',1078.00,1120.00,1,'APPROUVE',1),
(1,'EXPENSE','Nourriture','Traiteur VIP',1500.00,1450.00,1,'APPROUVE',1),
(1,'EXPENSE','Animations','DJ & sono',975.00,975.00,0,'APPROUVE',1),
(1,'EXPENSE','Communication','Flyers & affiches',150.00,132.50,0,'APPROUVE',1),
(1,'EXPENSE','Logistique','Sécurité (2 agents)',400.00,400.00,1,'SOUMIS',1),
(1,'REVENUE','Billetterie','Vente billets (476 pax)',5900.00,5200.00,0,'APPROUVE',1),
(1,'REVENUE','Financements','Subvention BDE',1000.00,1000.00,0,'APPROUVE',1),
(2,'EXPENSE','Logistique','Domaine Peyreguilhot',2536.00,2536.00,1,'APPROUVE',1),
(2,'EXPENSE','Logistique','Transport (bus)',1078.00,1078.00,1,'APPROUVE',1),
(2,'EXPENSE','Logistique','Protection civile',815.00,815.00,1,'APPROUVE',1),
(2,'EXPENSE','Logistique','Essences et péages',151.88,151.88,1,'SOUMIS',1),
(2,'EXPENSE','Nourriture et boissons','Nourriture & petit-dej',760.85,760.85,1,'SOUMIS',1),
(2,'EXPENSE','Nourriture et boissons','Bière (8 fûts)',790.00,790.00,0,'APPROUVE',1),
(2,'EXPENSE','Animations','DJ',975.00,975.00,1,'APPROUVE',1),
(2,'EXPENSE','Animations','Gonflables',150.00,150.00,1,'REFUSE',1),
(2,'REVENUE','Billetterie','Cotisations participants',5900.00,5900.00,0,'APPROUVE',1),
(2,'REVENUE','Financements','FSDIE obtenu',1500.00,1500.00,0,'APPROUVE',1),
(2,'REVENUE','Financements','UF MIAGE',850.00,850.00,0,'APPROUVE',1),
(3,'EXPENSE','Logistique','Gîte de groupe',1200.00,1180.00,1,'APPROUVE',1),
(3,'EXPENSE','Logistique','Covoiturage & essence',220.00,235.00,1,'APPROUVE',1),
(3,'EXPENSE','Animations','Activité accrobranche',320.00,320.00,1,'SOUMIS',1),
(3,'EXPENSE','Nourriture','Courses alimentaires',410.00,398.00,1,'SOUMIS',1),
(3,'EXPENSE','Logistique','Matériel de soirée',80.00,65.00,0,'APPROUVE',1),
(3,'REVENUE','Billetterie','Cotisations (22 pax)',880.00,880.00,0,'APPROUVE',1),
(3,'REVENUE','Financements','FSDIE reçu',1200.00,1200.00,0,'APPROUVE',1),
(4,'EXPENSE','Logistique','Sono & micro',200.00,195.00,1,'APPROUVE',1),
(4,'EXPENSE','Nourriture','Snacks & boissons',150.00,162.00,0,'APPROUVE',1),
(4,'EXPENSE','Animations','Supports blind test',30.00,28.00,0,'APPROUVE',1),
(4,'EXPENSE','Communication','Décorations Saint-Valentin',60.00,55.00,0,'SOUMIS',1),
(4,'REVENUE','Billetterie','Entrées (15 × 5€)',75.00,75.00,0,'APPROUVE',1),
(5,'EXPENSE','Logistique','Réservation gymnase',80.00,80.00,1,'APPROUVE',1),
(5,'EXPENSE','Nourriture','Collations & eau',60.00,55.00,0,'APPROUVE',1),
(5,'EXPENSE','Animations','Trophées & médailles',45.00,48.00,0,'APPROUVE',1),
(5,'EXPENSE','Communication','Affiches tournoi',20.00,18.00,0,'SOUMIS',1),
(5,'REVENUE','Billetterie','Inscriptions (20 × 5€)',100.00,100.00,0,'APPROUVE',1),
(6,'EXPENSE','Logistique','Domaine privatisé',2800.00,NULL,1,'SOUMIS',1),
(6,'EXPENSE','Logistique','Transport (2 bus)',1200.00,NULL,1,'SOUMIS',1),
(6,'EXPENSE','Logistique','Protection civile',900.00,NULL,1,'SOUMIS',1),
(6,'EXPENSE','Nourriture et boissons','Repas & petit-dej',850.00,NULL,1,'SOUMIS',1),
(6,'EXPENSE','Animations','DJ & animations',1050.00,NULL,1,'SOUMIS',1),
(6,'EXPENSE','Communication','Goodies & tote-bags',200.00,NULL,0,'SOUMIS',1),
(6,'REVENUE','Billetterie','Cotisations (120 pax)',4800.00,NULL,0,'SOUMIS',1),
(6,'REVENUE','Financements','FSDIE sollicité',2000.00,NULL,0,'SOUMIS',1),
(6,'REVENUE','Financements','UF MIAGE (demandé)',900.00,NULL,0,'SOUMIS',1),
(7,'EXPENSE','Logistique','Location salle prestige',3200.00,1600.00,1,'SOUMIS',1),
(7,'EXPENSE','Logistique','Transport VIP',1100.00,NULL,1,'SOUMIS',1),
(7,'EXPENSE','Nourriture','Traiteur gastronomique',2000.00,NULL,1,'SOUMIS',1),
(7,'EXPENSE','Animations','DJ + light show',1200.00,NULL,0,'SOUMIS',1),
(7,'EXPENSE','Communication','Flyers & billets imprimés',180.00,NULL,0,'SOUMIS',1),
(7,'REVENUE','Billetterie','Ventes prévisionnelles',6000.00,NULL,0,'SOUMIS',1),
(7,'REVENUE','Financements','FSDIE (dossier en cours)',2000.00,NULL,0,'SOUMIS',1),
(8,'EXPENSE','Logistique','Hébergement (chalet)',2400.00,NULL,1,'SOUMIS',1),
(8,'EXPENSE','Logistique','Forfaits ski (40 pax)',3600.00,NULL,1,'SOUMIS',1),
(8,'EXPENSE','Logistique','Location de matériel',800.00,NULL,1,'SOUMIS',1),
(8,'EXPENSE','Logistique','Navette aller-retour',600.00,NULL,1,'SOUMIS',1),
(8,'EXPENSE','Nourriture','Repas sur place',960.00,NULL,0,'SOUMIS',1),
(8,'REVENUE','Billetterie','Cotisations (40 × 195€)',7800.00,NULL,0,'SOUMIS',1),
(8,'REVENUE','Financements','Aide FSDIE envisagée',2000.00,NULL,0,'SOUMIS',1);

-- =============================================================================
-- BUDGET ATTACHMENTS (justificatifs FSDIE)
-- =============================================================================
INSERT INTO budget_attachments (budget_line_id, file_name, file_path) VALUES
(1,'facture_salle_gala2024.pdf','uploads/budget/facture_salle_gala2024.pdf'),
(2,'facture_transport_gala2024.pdf','uploads/budget/facture_transport_gala2024.pdf'),
(3,'facture_traiteur_gala2024.pdf','uploads/budget/facture_traiteur_gala2024.pdf'),
(20,'facture_gite_wes2024.pdf','uploads/budget/facture_gite_wes2024.pdf'),
(21,'justif_covoiturage_wes2024.pdf','uploads/budget/justif_covoiturage_wes2024.pdf'),
(27,'facture_sono_valentin2025.pdf','uploads/budget/facture_sono_valentin2025.pdf'),
(32,'facture_gymnase_tournoi2025.pdf','uploads/budget/facture_gymnase_tournoi2025.pdf');

-- =============================================================================
-- MEMBER ATTACHMENTS (pièces jointes adhérents)
-- =============================================================================
INSERT INTO member_attachments (member_id, document_type, file_name, file_path) VALUES
(1,'CERTIFICATE','certificat_alice_martin.pdf','uploads/members/certificat_alice_martin.pdf'),
(1,'WAIVER','decharge_alice_martin.pdf','uploads/members/decharge_alice_martin.pdf'),
(2,'CERTIFICATE','certificat_baptiste_moreau.pdf','uploads/members/certificat_baptiste_moreau.pdf'),
(4,'CERTIFICATE','certificat_david_thomas.pdf','uploads/members/certificat_david_thomas.pdf'),
(4,'WAIVER','decharge_david_thomas.pdf','uploads/members/decharge_david_thomas.pdf'),
(5,'CERTIFICATE','certificat_emma_laurent.pdf','uploads/members/certificat_emma_laurent.pdf'),
(5,'WAIVER','decharge_emma_laurent.pdf','uploads/members/decharge_emma_laurent.pdf'),
(7,'CERTIFICATE','certificat_gaelle_simon.pdf','uploads/members/certificat_gaelle_simon.pdf'),
(7,'WAIVER','decharge_gaelle_simon.pdf','uploads/members/decharge_gaelle_simon.pdf'),
(9,'CERTIFICATE','certificat_ines_garcia.pdf','uploads/members/certificat_ines_garcia.pdf'),
(9,'WAIVER','decharge_ines_garcia.pdf','uploads/members/decharge_ines_garcia.pdf'),
(9,'PARENTAL_CONSENT','autorisation_ines_garcia.pdf','uploads/members/autorisation_ines_garcia.pdf'),
(12,'CERTIFICATE','certificat_lucie_petit.pdf','uploads/members/certificat_lucie_petit.pdf'),
(12,'WAIVER','decharge_lucie_petit.pdf','uploads/members/decharge_lucie_petit.pdf');
