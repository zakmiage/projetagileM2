CREATE DATABASE IF NOT EXISTS gestion_assos;
USE gestion_assos;

CREATE TABLE IF NOT EXISTS hello_world (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(255) NOT NULL
);

INSERT INTO hello_world (message)
VALUES ('Hello World depuis MySQL');