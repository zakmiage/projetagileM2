-- =============================================================================
-- seed-participants.sql  — Jeu de données réaliste pour event_participants
-- Usage : exécuter après seed-data.sql (ou indépendamment pour rafraîchir)
-- =============================================================================
USE gestion_assos;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE event_participants;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- EVENT 1 : Gala KUBIK 2024 (cap 500) — 32 inscrits  (↑ passé, bien fréquenté)
-- =============================================================================
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(1,'Alice','Martin','alice.martin@etu.univ.fr',1,1),
(1,'Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,0),
(1,'David','Thomas','david.thomas@etu.univ.fr',1,1),
(1,'Emma','Laurent','emma.laurent@etu.univ.fr',1,1),
(1,'Florian','Robert','florian.robert@etu.univ.fr',0,1),
(1,'Hugo','Michel','hugo.michel@etu.univ.fr',0,0),
-- Adhérents
(1,'Gaëlle','Simon','gaelle.simon@etu.univ.fr',1,1),
(1,'Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
(1,'Julien','Martinez','julien.martinez@etu.univ.fr',1,1),
(1,'Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
(1,'Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
(1,'Camille','Bernard','camille.bernard@etu.univ.fr',0,0),
-- Externes
(1,'Thomas','Leblanc','thomas.leblanc@gmail.com',1,1),
(1,'Mathilde','Durand','mathilde.durand@gmail.com',1,1),
(1,'Arthur','Faure','arthur.faure@yahoo.fr',0,0),
(1,'Léa','Garnier','lea.garnier@outlook.com',1,1),
(1,'Antoine','Roux','antoine.roux@gmail.com',1,1),
(1,'Pierre','Girard','pierre.girard@hotmail.fr',1,1),
(1,'Sophie','Bonnet','sophie.bonnet@gmail.com',1,1),
(1,'Nicolas','Perrin','nicolas.perrin@icloud.com',1,1),
(1,'Clément','Marchand','clement.marchand@gmail.com',1,1),
(1,'Noémie','Renard','noemie.renard@gmail.com',0,1),
(1,'Romain','Brun','romain.brun@hotmail.fr',1,1),
(1,'Laura','Charpentier','laura.charpentier@gmail.com',1,1),
(1,'Alexis','Fontaine','alexis.fontaine@gmail.com',1,1),
(1,'Camille','Aubert','camille.aubert@yahoo.fr',0,0),
(1,'Jade','Vidal','jade.vidal@gmail.com',1,1),
(1,'Louis','Denis','louis.denis@outlook.com',1,1),
(1,'Sarah','Lambert','sarah.lambert@gmail.com',0,0),
(1,'Tristan','Leroy','tristan.leroy@gmail.com',1,1),
(1,'Pauline','Gauthier','pauline.gauthier@gmail.com',1,1),
(1,'Yann','Chevalier','yann.chevalier@laposte.net',1,1);

-- =============================================================================
-- EVENT 2 : WEI 2024 (cap 150) — 48 inscrits  (↑ passé, forte participation)
-- =============================================================================
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(2,'Alice','Martin','alice.martin@etu.univ.fr',1,1),
(2,'Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,0),
(2,'Camille','Bernard','camille.bernard@etu.univ.fr',0,1),
(2,'Emma','Laurent','emma.laurent@etu.univ.fr',1,0),
(2,'Gaëlle','Simon','gaelle.simon@etu.univ.fr',1,1),
(2,'Julien','Martinez','julien.martinez@etu.univ.fr',1,0),
(2,'Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
(2,'Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
(2,'Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
-- Externes
(2,'Clément','Marchand','clement.marchand@gmail.com',1,1),
(2,'Noémie','Renard','noemie.renard@gmail.com',0,0),
(2,'Romain','Brun','romain.brun@hotmail.fr',1,1),
(2,'Thomas','Leblanc','thomas.leblanc@gmail.com',1,1),
(2,'Mathilde','Durand','m.durand@gmail.com',1,1),
(2,'Pierre','Girard','p.girard@hotmail.fr',0,0),
(2,'Sophie','Bonnet','s.bonnet@gmail.com',1,1),
(2,'Nicolas','Perrin','n.perrin@icloud.com',0,1),
(2,'Laura','Charpentier','laura.charpentier@gmail.com',1,1),
(2,'Alexis','Fontaine','alexis.fontaine@gmail.com',1,1),
(2,'Jade','Vidal','jade.vidal@gmail.com',0,0),
(2,'Louis','Denis','louis.denis@outlook.com',1,1),
(2,'Tristan','Leroy','tristan.leroy@gmail.com',1,1),
(2,'Pauline','Gauthier','pauline.gauthier@gmail.com',1,1),
(2,'Yann','Chevalier','yann.chevalier@laposte.net',0,0),
(2,'Sarah','Lambert','sarah.lambert@gmail.com',1,1),
(2,'Ethan','Roux','ethan.roux@gmail.com',1,0),
(2,'Yasmine','Chaoui','yasmine.chaoui@gmail.com',0,0),
(2,'Anthony','Barbier','anthony.barbier@gmail.com',1,1),
(2,'Manon','Richard','manon.richard@gmail.com',1,1),
(2,'Théo','Vigneron','theo.vigneron@etu.univ.fr',1,1),
(2,'Clara','Rossignol','clara.rossignol@etu.univ.fr',1,0),
(2,'François','Lacroix','francois.lacroix@gmail.com',0,0),
(2,'Amandine','Picard','amandine.picard@gmail.com',1,1),
(2,'Cédric','Colin','cedric.colin@gmail.com',1,1),
(2,'Delphine','Boyer','delphine.boyer@yahoo.fr',0,1),
(2,'Elisa','Blanc','elisa.blanc@gmail.com',1,1),
(2,'Guillaume','Nicolas','guillaume.nicolas@gmail.com',1,1),
(2,'Hélène','Roy','helene.roy@gmail.com',1,1),
(2,'Ilona','Bertrand','ilona.bertrand@gmail.com',0,0),
(2,'Jordan','Lemaire','jordan.lemaire@hotmail.fr',1,1),
(2,'Karl','Rousseau','karl.rousseau@gmail.com',1,0),
(2,'Léo','Guerin','leo.guerin@gmail.com',1,1),
(2,'Maëlys','David','maelys.david@etu.univ.fr',0,0),
(2,'Nabil','Lefebvre','nabil.lefebvre@gmail.com',1,1),
(2,'Océane','Blanchard','oceane.blanchard@gmail.com',1,1),
(2,'Paul','Renaud','paul.renaud@icloud.com',1,1),
(2,'Quentin','Simon','quentin.simon2@gmail.com',0,0),
(2,'Rachel','Dupuis','rachel.dupuis@gmail.com',1,1);

-- =============================================================================
-- EVENT 3 : WES 2024 (cap 80) — 22 inscrits
-- =============================================================================
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(3,'Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,1),
(3,'David','Thomas','david.thomas@etu.univ.fr',1,1),
(3,'Gaëlle','Simon','gaelle.simon@etu.univ.fr',1,1),
(3,'Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
(3,'Alice','Martin','alice.martin@etu.univ.fr',1,1),
(3,'Emma','Laurent','emma.laurent@etu.univ.fr',1,1),
(3,'Florian','Robert','florian.robert@etu.univ.fr',0,0),
(3,'Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
-- Externes
(3,'Paul','Bernard','paul.bernard@gmail.com',1,1),
(3,'Chloé','Vincent','chloe.vincent@gmail.com',0,0),
(3,'Sonia','Girard','sonia.girard@gmail.com',1,1),
(3,'Marc','Lambert','marc.lambert@gmail.com',1,0),
(3,'Julie','Perrault','julie.perrault@gmail.com',0,0),
(3,'Nicolas','Fabre','nicolas.fabre@hotmail.fr',1,1),
(3,'Anaïs','Lefebvre','anais.lefebvre@gmail.com',1,1),
(3,'Valentin','Berger','valentin.berger@gmail.com',0,1),
(3,'Théa','Bouchard','thea.bouchard@gmail.com',1,1),
(3,'Simon','Arnaud','simon.arnaud@etu.univ.fr',1,1),
(3,'Juliette','Paquet','juliette.paquet@gmail.com',1,1),
(3,'Maxime','Hebert','maxime.hebert@yahoo.fr',0,0),
(3,'Agathe','Denis','agathe.denis@gmail.com',1,1),
(3,'Bastien','Lebrun','bastien.lebrun@gmail.com',1,1);

-- =============================================================================
-- EVENT 4 : Soirée Saint-Valentin 2025 (cap 100) — 28 inscrits
-- =============================================================================
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(4,'Camille','Bernard','camille.bernard@etu.univ.fr',1,1),
(4,'Florian','Robert','florian.robert@etu.univ.fr',0,0),
(4,'Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
(4,'Alice','Martin','alice.martin@etu.univ.fr',1,1),
(4,'Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
(4,'Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
(4,'Hugo','Michel','hugo.michel@etu.univ.fr',0,0),
-- Externes
(4,'Sophie','Morel','sophie.morel@gmail.com',1,1),
(4,'Nicolas','Petit','nicolas.petit@icloud.com',1,1),
(4,'Élodie','Renard','elodie.renard@gmail.com',1,1),
(4,'Raphaël','Chevalier','raphael.chevalier@gmail.com',0,1),
(4,'Amélie','Fontaine','amelie.fontaine@gmail.com',1,1),
(4,'Julien','Dupré','julien.dupre@gmail.com',1,1),
(4,'Marion','Girard','marion.girard@hotmail.fr',0,0),
(4,'Lucas','Perrot','lucas.perrot@gmail.com',1,1),
(4,'Gabrielle','Thomas','gabrielle.thomas@gmail.com',1,1),
(4,'Romain','Klein','romain.klein@gmail.com',1,0),
(4,'Laura','Martin','laura.martin2@gmail.com',0,0),
(4,'Antoine','Blanc','antoine.blanc@gmail.com',1,1),
(4,'Chloé','Bourgeois','chloe.bourgeois@gmail.com',1,1),
(4,'Victor','Charrier','victor.charrier@gmail.com',1,1),
(4,'Fanny','Prevost','fanny.prevost@gmail.com',0,1),
(4,'Theo','Rolland','theo.rolland@etu.univ.fr',1,1),
(4,'Emma','Berthier','emma.berthier@gmail.com',1,1),
(4,'Simon','Garnier','simon.garnier@gmail.com',0,0),
(4,'Juliette','Masson','juliette.masson@yahoo.fr',1,1),
(4,'Hugo','Colin','hugo.colin@gmail.com',1,1),
(4,'Léa','Aubert','lea.aubert2@gmail.com',1,0);

-- =============================================================================
-- EVENT 5 : Tournoi sportif 2025 (cap 30) — 24 inscrits  (presque plein !)
-- =============================================================================
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(5,'Alice','Martin','alice.martin@etu.univ.fr',1,1),
(5,'Emma','Laurent','emma.laurent@etu.univ.fr',1,1),
(5,'Hugo','Michel','hugo.michel@etu.univ.fr',1,1),
(5,'Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
(5,'Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
(5,'David','Thomas','david.thomas@etu.univ.fr',1,1),
(5,'Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,0),
-- Externes
(5,'Alexis','Fontaine','alexis.fontaine@gmail.com',1,1),
(5,'Camille','Aubert','camille.aubert@yahoo.fr',0,0),
(5,'Romain','Brun','romain.brun@hotmail.fr',1,1),
(5,'Thomas','Gauthier','thomas.gauthier@gmail.com',1,1),
(5,'Claire','Rousseau','claire.rousseau@gmail.com',1,1),
(5,'Benoît','Lambert','benoit.lambert@gmail.com',0,1),
(5,'Ambre','Joly','ambre.joly@gmail.com',1,1),
(5,'Maxime','Perrin','maxime.perrin@gmail.com',1,1),
(5,'Océane','Vidal','oceane.vidal@gmail.com',1,1),
(5,'Nathan','Boyer','nathan.boyer@gmail.com',1,1),
(5,'Elisa','Guerin','elisa.guerin@gmail.com',1,1),
(5,'Cyril','Leclerc','cyril.leclerc@gmail.com',0,0),
(5,'Mila','Pierre','mila.pierre@gmail.com',1,1),
(5,'Julien','Faure','julien.faure@gmail.com',1,1),
(5,'Lou','Barbier','lou.barbier@etu.univ.fr',1,1),
(5,'Sacha','Roy','sacha.roy@gmail.com',0,1),
(5,'Zoé','Renaud','zoe.renaud@gmail.com',1,1);

-- =============================================================================
-- EVENT 6 : WEI 2026 (cap 120) — 28 inscrits  (↑ futur, inscriptions ouvertes)
-- =============================================================================
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(6,'Alice','Martin','alice.martin@etu.univ.fr',1,1),
(6,'Baptiste','Moreau','baptiste.moreau@etu.univ.fr',0,0),
(6,'Camille','Bernard','camille.bernard@etu.univ.fr',0,0),
(6,'David','Thomas','david.thomas@etu.univ.fr',1,1),
(6,'Emma','Laurent','emma.laurent@etu.univ.fr',1,1),
(6,'Florian','Robert','florian.robert@etu.univ.fr',0,0),
(6,'Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
(6,'Julien','Martinez','julien.martinez@etu.univ.fr',0,0),
(6,'Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
(6,'Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,0),
-- Externes (inscriptions en cours, plusieurs décharges manquantes)
(6,'Yasmine','Chaoui','yasmine.chaoui@gmail.com',0,0),
(6,'Ethan','Roux','ethan.roux@gmail.com',1,0),
(6,'Élodie','Bernard','elodie.bernard@gmail.com',0,0),
(6,'Nathan','Garnier','nathan.garnier@gmail.com',1,0),
(6,'Clara','Morin','clara.morin@gmail.com',0,0),
(6,'Antoine','Dupont','antoine.dupont2@gmail.com',1,1),
(6,'Lisa','Pons','lisa.pons@gmail.com',0,0),
(6,'Théo','Hamelin','theo.hamelin@etu.univ.fr',1,0),
(6,'Manon','Gilles','manon.gilles@gmail.com',0,0),
(6,'Hugo','Denis','hugo.denis@gmail.com',1,1),
(6,'Chloé','Renaud','chloe.renaud@gmail.com',0,0),
(6,'Jules','Meyer','jules.meyer@gmail.com',1,0),
(6,'Inès','Colliard','ines.colliard@etu.univ.fr',0,0),
(6,'Tristan','Fabre','tristan.fabre@gmail.com',1,1),
(6,'Ambre','Picard','ambre.picard@gmail.com',0,0),
(6,'Romain','Pichon','romain.pichon@gmail.com',1,0),
(6,'Lena','Barrault','lena.barrault@gmail.com',0,0),
(6,'Mathis','Renard','mathis.renard@gmail.com',1,0);

-- =============================================================================
-- EVENT 7 : Gala KUBIK 2026 (cap 15) — 14 inscrits  (↑ futur, PRESQUE PLEIN)
-- =============================================================================
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(7,'Alice','Martin','alice.martin@etu.univ.fr',1,1),
(7,'Baptiste','Moreau','baptiste.moreau@etu.univ.fr',1,1),
(7,'Camille','Bernard','camille.bernard@etu.univ.fr',0,0),
(7,'David','Thomas','david.thomas@etu.univ.fr',1,1),
(7,'Emma','Laurent','emma.laurent@etu.univ.fr',0,0),
(7,'Florian','Robert','florian.robert@etu.univ.fr',1,1),
(7,'Gaëlle','Simon','gaelle.simon@etu.univ.fr',0,0),
(7,'Hugo','Michel','hugo.michel@etu.univ.fr',0,0),
(7,'Inès','Garcia','ines.garcia@etu.univ.fr',1,1),
(7,'Julien','Martinez','julien.martinez@etu.univ.fr',1,1),
(7,'Kevin','Dupuis','kevin.dupuis@etu.univ.fr',1,1),
(7,'Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
(7,'Jade','Bonnet','jade.bonnet@gmail.com',1,1),
(7,'Louis','Girard','louis.girard@outlook.com',0,0);

-- =============================================================================
-- EVENT 8 : Week-end ski 2027 (cap 40) — 12 inscrits  (↑ futur, inscriptions tôt)
-- =============================================================================
INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit) VALUES
(8,'David','Thomas','david.thomas@etu.univ.fr',1,1),
(8,'Inès','Garcia','ines.garcia@etu.univ.fr',1,0),
(8,'Alice','Martin','alice.martin@etu.univ.fr',1,1),
(8,'Lucie','Petit','lucie.petit@etu.univ.fr',1,1),
(8,'Florian','Robert','florian.robert@etu.univ.fr',0,0),
-- Externes enthousiastes
(8,'Maxime','Perrin','maxime.perrin@gmail.com',1,1),
(8,'Chloé','Fontaine','chloe.fontaine@gmail.com',1,0),
(8,'Quentin','Morel','quentin.morel@gmail.com',0,0),
(8,'Pauline','Vidal','pauline.vidal@outlook.com',1,1),
(8,'Simon','Chevalier','simon.chevalier@gmail.com',1,1),
(8,'Océane','Gauthier','oceane.gauthier@gmail.com',0,0),
(8,'Victor','Rousseau','victor.rousseau@protonmail.com',1,0);
