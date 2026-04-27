-- =============================================================================
-- migration_shifts.sql — Créneaux de staffing (Shifts)
-- Usage : source ./database/migration_shifts.sql
-- =============================================================================
USE gestion_assos;

CREATE TABLE IF NOT EXISTS shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  capacity INT NOT NULL DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  CONSTRAINT fk_shift_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shift_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shift_id INT NOT NULL,
  member_id INT NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  UNIQUE KEY uq_shift_member (shift_id, member_id),
  CONSTRAINT fk_sreg_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
  CONSTRAINT fk_sreg_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
