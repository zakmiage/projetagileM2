-- =============================================================================
-- migration_kanban.sql — Tableau Kanban intégré
-- Usage : source ./database/migration_kanban.sql
-- =============================================================================
USE gestion_assos;

CREATE TABLE IF NOT EXISTS kanban_columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  CONSTRAINT fk_kcol_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kanban_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  column_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  position INT NOT NULL DEFAULT 0,
  label VARCHAR(50),
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  CONSTRAINT fk_kcard_col FOREIGN KEY (column_id) REFERENCES kanban_columns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kanban_card_members (
  card_id INT NOT NULL,
  member_id INT NOT NULL,
  PRIMARY KEY (card_id, member_id),
  CONSTRAINT fk_kcm_card FOREIGN KEY (card_id) REFERENCES kanban_cards(id) ON DELETE CASCADE,
  CONSTRAINT fk_kcm_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
