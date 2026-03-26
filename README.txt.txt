# Application de gestion d'événements pour associations

Ce projet est une application web permettant de gérer les événements d’associations :
budget, organisation, suivi, etc.

## Objectif de cette première étape

Mettre en place l’environnement technique du projet et vérifier la communication entre :

- Angular (frontend)
- Node.js / Express (backend)
- MySQL (base de données)

Le test réalisé consiste à afficher un message provenant de MySQL dans l’interface Angular via une API Node.js.

---

## Structure du projet

```text
gestion-evenements-assos/
├── frontend/        # Angular
├── backend/         # Node.js + Express
├── database/        # scripts SQL
Prérequis

Avant de commencer, installer :

Git
Node.js (version LTS recommandée)
npm
Angular CLI
MySQL Server
éventuellement MySQL Workbench
Installation des outils
1. Vérifier Node.js et npm
node -v
npm -v
2. Installer Angular CLI
npm install -g @angular/cli

Vérifier :

ng version
3. Vérifier MySQL

Lancer MySQL puis vérifier que vous pouvez vous connecter avec votre compte local.

Cloner le projet
git clone <url-du-repo>
cd gestion-evenements-assos
Initialiser la base de données

Créer la base et les tables en exécutant le script :

source database/init.sql;

Ce script crée :

la base gestion_assos
la table hello_world
une ligne de test
Configuration du backend

Aller dans le dossier backend :

cd backend
npm install

Créer un fichier .env :

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gestion_assos

Adapter DB_USER et DB_PASSWORD selon votre configuration MySQL.

Lancer le backend :

npm run dev

Le serveur doit démarrer sur :

http://localhost:3000
Configuration du frontend

Dans un autre terminal :

cd frontend
npm install
ng serve

L’application Angular démarre sur :

http://localhost:4200
Test attendu

Quand tout fonctionne :

Angular appelle l’API GET /api/hello
Node.js récupère le message dans MySQL
Angular affiche le message à l’écran

Message attendu :

Hello World depuis MySQL
Commandes utiles
Backend
cd backend
npm install
npm run dev
Frontend
cd frontend
npm install
ng serve
Problèmes fréquents
Port déjà utilisé
Angular : vérifier le port 4200
Node.js : vérifier le port 3000
Erreur de connexion MySQL
vérifier que MySQL est lancé
vérifier le login/mot de passe dans .env
vérifier que la base gestion_assos existe