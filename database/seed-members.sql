USE gestion_assos;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE members;
SET FOREIGN_KEY_CHECKS = 1;

-- Insertion des 2 membres mockés 
INSERT INTO members (id, first_name, last_name, email, t_shirt_size, allergies, is_certificate_ok, is_waiver_ok, is_image_rights_ok) VALUES 
(1, 'Jean', 'Dupont', 'jean.dupont@etu.univ.fr', 'L', 'Arachides', 1, 0, 1),
(2, 'Marie', 'Curie', 'marie.curie@etu.univ.fr', 'M', '', 1, 1, 1);
