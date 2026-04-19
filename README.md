# Application de gestion d'événements pour associations

## Description

Ce projet est une application web permettant de gérer les événements d’associations : budget, organisation, suivi, etc.

Technologies utilisées :

* *Frontend* : Angular
* *Backend* : Node.js / Express
* *Base de données* : MySQL

L’objectif de cette première étape est de vérifier que les 3 briques communiquent correctement :

* Angular appelle une API
* Node.js répond à cette API
* Node.js lit une donnée dans MySQL
* Angular affiche cette donnée

---

## Structure attendue du projet

À la racine du projet, vous devez avoir cette structure :

text
projetagileM2/
├── README.md
├── .gitignore
├── frontend/
├── backend/
└── database/


### Détail des dossiers

* frontend/ : application Angular
* backend/ : API Node.js / Express
* database/ : scripts SQL, par exemple init.sql

---

## Prérequis

Avant de commencer, installer :

* Git
* Node.js (version LTS)
* npm
* Angular CLI
* MySQL Server
* éventuellement MySQL Workbench

---

## Vérification des outils

Ouvrir un terminal et taper :

bash
git --version
node -v
npm -v
ng version


Pour MySQL, vérifier que vous pouvez vous connecter :

bash
mysql -u root -p


Si une commande n’est pas reconnue, cela signifie que l’outil n’est pas installé ou pas ajouté au PATH.

---

## 1. Cloner le projet

Dans un terminal, se placer dans le dossier où vous voulez récupérer le projet, puis exécuter :

bash
git clone https://github.com/zakmiage/projetagileM2.git
cd projetagileM2


---

## 2. Initialiser la base de données

### Emplacement des fichiers SQL

Dans le dossier `database/`, vous trouverez deux fichiers cruciaux :
1. `init.sql` : Crée la structure (les tables) vierge.
2. `seed-data.sql` : Ajoute l'ensemble des données de test (Événements, Membres, Budget, Participants) pour que vous puissiez tester directement sur une base remplie !

### Exécuter les scripts SQL

#### Option A — avec MySQL en ligne de commande

Ouvrir un terminal et taper :

```bash
mysql -u root -p
```

Puis, une fois connecté à MySQL :

```sql
source C:/chemin/vers/projetagileM2/database/init.sql;
source C:/chemin/vers/projetagileM2/database/seed-data.sql;
```

*(Remplacez `C:/chemin/vers/` par votre vrai chemin absolu)*

#### Option B — avec MySQL Workbench

1. Ouvrir MySQL Workbench.
2. Ouvrir le fichier `database/init.sql` puis cliquer sur l'éclair jaune (Execute).
3. Ouvrir le fichier `database/seed-data.sql` puis cliquer sur l'éclair jaune (Execute).

### Vérification

Dans MySQL :

```sql
USE gestion_assos;
SELECT * FROM events;
```

Vous devez voir apparaître deux événements : le 'Gala' et le 'WEI'.

---

## 3. Installer et lancer le backend

### Se placer dans le dossier backend

Depuis la racine du projet :

bash
cd backend


### Installer les dépendances

bash
npm install


### Créer le fichier .env

Le fichier .env doit être créé *dans le dossier backend/*, donc ici :

text
projetagileM2/backend/.env


### Comment créer ce fichier

Dans VS Code :

* ouvrir le dossier backend
* créer un nouveau fichier nommé exactement :

text
.env


Attention :

* le nom doit être *.env*
* pas .env.txt

### Contenu du fichier .env

env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=VOTRE_MOT_DE_PASSE
DB_NAME=gestion_assos


Remplacer VOTRE_MOT_DE_PASSE par le mot de passe choisi pour MySQL.

### Lancer le backend

Toujours dans le dossier backend/ :

bash
npm run dev


Si nodemon ne fonctionne pas :

bash
node server.js


### Résultat attendu

Le terminal doit afficher un message du type :

text
Serveur backend lancé sur http://localhost:3000


### Test direct du backend

Ouvrir dans un navigateur :

text
http://localhost:3000/api/hello


Vous devez obtenir une réponse JSON, par exemple :

json
{"success":true,"message":"Hello World depuis MySQL"}


---

## 4. Installer et lancer le frontend

### Ouvrir un nouveau terminal

Ne pas fermer le terminal du backend.
Ouvrir un *deuxième terminal*.

### Se placer dans le dossier frontend

Depuis la racine du projet :

bash
cd frontend


### Installer les dépendances

bash
npm install


### Lancer Angular

bash
ng serve


### Résultat attendu

Angular démarre sur :

text
http://localhost:4200


Ouvrir cette adresse dans un navigateur.

Le message affiché doit être :

text
Hello World depuis MySQL


---

## 5. Connexion à l'application

> 💡 **Note importante** : Ce projet est un prototype académique. Certaines fonctionnalités comme l'authentification côté frontend sont volontairement simplifiées pour le moment.

### Identifiants Frontend (Vue Utilisateur)
L'interface Angular utilise un système de connexion factice pour faciliter les tests. Pour vous connecter sur `http://localhost:4200` :
* **Email :** `toto@mail.com`
* **Mot de passe :** `toto`

### Identifiants Backend (Test de l'API)
Si vous souhaitez tester directement l'API REST (`http://localhost:3000/api/auth/login`) via Postman ou Swagger, de vrais comptes admins sont initialisés en base :
* `admin@kubik.fr` | MdP : `admin123`
* `bureau@kubik.fr` | MdP : `admin123`
* `tresorier@kubik.fr` | MdP : `admin123`

---

## Résumé des terminaux à ouvrir

### Terminal 1 : backend

Depuis la racine du projet :

bash
cd backend
npm install
npm run dev


ou :

bash
cd backend
npm install
node server.js


### Terminal 2 : frontend

Depuis la racine du projet :

bash
cd frontend
npm install
ng serve


### MySQL

Le script SQL est à exécuter une seule fois, soit :

* dans MySQL en ligne de commande
* soit dans MySQL Workbench

---

## Arborescence minimale attendue

text
projetagileM2/
├── README.md
├── .gitignore
├── frontend/
│   ├── package.json
│   └── src/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── .env
└── database/
    └── init.sql


---

## Problèmes fréquents

### git n’est pas reconnu

Git n’est pas installé ou pas ajouté au PATH.

### npm n’est pas reconnu

Node.js n’est pas installé ou pas ajouté au PATH.

### ng n’est pas reconnu

Angular CLI n’est pas installé. Exécuter :

bash
npm install -g @angular/cli


### Erreur MySQL : accès refusé

Vérifier dans backend/.env :

env
DB_USER=root
DB_PASSWORD=...


Si DB_PASSWORD est vide alors que MySQL a un mot de passe, la connexion échouera.

### Angular reste sur “Chargement...”

Vérifier :

* que le backend est lancé
* que http://localhost:3000/api/hello fonctionne
* que MySQL est bien initialisé

### Le fichier .env ne fonctionne pas

Vérifier que le fichier est bien ici :

text
backend/.env


et qu’il ne s’appelle pas .env.txt

---

## État actuel du projet

Cette première version valide :

* l’installation de l’environnement
* la communication Angular ↔ Node.js
* la communication Node.js ↔ MySQL
* le fonctionnement global de l’architecture

---
