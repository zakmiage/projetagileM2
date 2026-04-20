-- =============================================================================
-- migration_validation_status.sql
-- À exécuter UNE SEULE FOIS sur une base déjà initialisée (init.sql déjà joué)
-- =============================================================================
USE gestion_assos;

ALTER TABLE budget_lines
  ADD COLUMN IF NOT EXISTS validation_status ENUM('SOUMIS', 'APPROUVE', 'REFUSE') NOT NULL DEFAULT 'SOUMIS'
  AFTER is_fsdie_eligible;
