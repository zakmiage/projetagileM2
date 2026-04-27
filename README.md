# Application de Gestion d'Événements Associatifs — KUBIK

> **Stack** : Angular 17 • Node.js/Express • MySQL 8 · **Version docs** : 1.5 — 27/04/2026

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Prérequis](#2-prérequis)
3. [Installation rapide (5 min)](#3-installation-rapide)
4. [Données de test complètes](#4-données-de-test-complètes)
5. [Identifiants](#5-identifiants)
6. [Lancer l'application](#6-lancer-lapplication)
7. [Fonctionnalités disponibles](#7-fonctionnalités-disponibles)
8. [Tests automatisés](#8-tests-automatisés)
9. [Structure du projet](#9-structure-du-projet)
10. [Problèmes fréquents](#10-problèmes-fréquents)

---

## 1. Présentation

Plateforme web de gestion interne pour association étudiante (BDE KEDGE Bordeaux — KUBIK).

| Fonctionnalité | Description |
|---|---|
| **Événements** | CRUD complet, liste paginée avec filtres |
| **Budget** | Lignes prévisionnelles/réelles, statuts FSDIE, pièces jointes PDF |
| **Planning (shifts)** | Grille 24h avec drag & drop, drawer de gestion |
| **Kanban** | Tableau de tâches par événement, drag & drop CDK |
| **Membres** | Annuaire, inscriptions aux événements |
| **Export** | Excel budget, Dossier FSDIE PDF complet (avec PJ mergées) |
| **Dashboard** | Analytics, graphiques de répartition |

---

## 2. Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| Node.js | LTS (20+) | `node -v` |
| npm | 9+ | `npm -v` |
| Angular CLI | 17+ | `ng version` |
| MySQL Server | 8.x | `mysql --version` |
| Python | 3.10+ | `python --version` |
| Git | tout | `git --version` |

```bash
# Installer Angular CLI si absent
npm install -g @angular/cli
```

---

## 3. Installation rapide

### Étape 1 — Cloner le projet

```bash
git clone https://github.com/zakmiage/projetagileM2.git
cd projetagileM2
```

### Étape 2 — Initialiser la base de données

```bash
# Connexion MySQL (adapter le mot de passe)
mysql -u root -p
```

Une fois connecté :
```sql
source /chemin/absolu/vers/projetagileM2/database/init.sql;
```

> Adapter `/chemin/absolu/vers/` à votre machine.  
> Sous Windows : `source C:/Users/Zac/git hub/projetagileM2/database/init.sql;`

### Étape 3 — Configurer le backend

Créer le fichier `backend/.env` :

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=VOTRE_MOT_DE_PASSE
DB_NAME=gestion_assos
```

> ⚠️ Le fichier doit s'appeler **exactement** `.env` (pas `.env.txt`)

### Étape 4 — Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend (dans un autre terminal)
cd frontend
npm install
```

### Étape 5 — Charger les données de test

Voir section [§4 Données de test](#4-données-de-test-complètes) ci-dessous.

---

## 4. Données de test complètes

> 🤖 **Cette section est destinée à être lue et exécutée par une IA ou un développeur voulant reproduire l'environnement complet.**

Le projet dispose d'un **script tout-en-un** qui injecte l'intégralité des données de test réalistes en une seule commande.

### Ce que le script injecte

| Donnée | Quantité | Détail |
|---|---|---|
| Utilisateurs | 4 | admin, bureau, tresorier (ADMIN/MEMBER), toto (ADMIN) |
| Membres | 47 | Membres KEDGE fictifs avec statuts cotisation variés |
| Événements | 5 | Gala KUBIK, WEI, WES, Saint-Valentin, Tournoi sportif |
| Inscriptions | ~180 | Réparties sur les 5 événements avec dates réalistes |
| Lignes de budget | ~30 | EXPENSE + REVENUE, certaines éligibles FSDIE |
| Kanban | 5 × 3 colonnes + ~15 cartes | Un tableau par événement |
| Shifts (planning) | 68 créneaux | Répartis sur 5 événements, certains nocturnes |
| Pièces jointes PDF | 11 | Vraies factures HTML→PDF via Python (xhtml2pdf) |

### Option A — Script Node.js tout-en-un (recommandé)

```bash
cd backend
node scripts/setup-test-data.js
```

Ce script :
1. Remet la base à zéro (truncate dans l'ordre des FK)
2. Insère les seeds SQL dans le bon ordre
3. Génère les lignes de budget via seed-prod.js
4. Applique les migrations Kanban & Shifts si besoin

### Option B — Scripts SQL manuels (ordre obligatoire)

```bash
mysql -u root -p gestion_assos < database/seed-data.sql
mysql -u root -p gestion_assos < database/seed-members.sql
mysql -u root -p gestion_assos < database/seed-participants.sql
mysql -u root -p gestion_assos < database/seed-budget.sql
mysql -u root -p gestion_assos < database/seed-kanban.sql
mysql -u root -p gestion_assos < database/seed-shifts.sql
```

### Option C — Générer les pièces jointes PDF réalistes (Python)

Les PJ sont de vraies factures HTML converties en PDF.

**Prérequis Python :**
```bash
python -m pip install xhtml2pdf pymysql
```

**Génération :**
```bash
cd backend
python scripts/generate-fake-pj.py
```

Ce script :
- Supprime les anciennes PJ liées aux événements 1-4
- Génère 11 factures HTML (AudioPro, Domaine des Pins, Gascogne Traiteur, etc.)
- Convertit chaque facture en PDF via `xhtml2pdf`
- Enregistre les fichiers dans `backend/uploads/`
- Insère les références en BDD (`budget_attachments`)

### Vérification

```sql
USE gestion_assos;
SELECT COUNT(*) FROM events;          -- 5
SELECT COUNT(*) FROM members;         -- ~47
SELECT COUNT(*) FROM budget_lines;    -- ~30
SELECT COUNT(*) FROM budget_attachments; -- ~11
SELECT COUNT(*) FROM shifts;          -- ~68
SELECT COUNT(*) FROM kanban_cards;    -- ~15
```

---

## 5. Identifiants

### Connexion à l'application Angular (`http://localhost:4200`)

| Email | Mot de passe | Rôle | Accès |
|---|---|---|---|
| `toto@mail.com` | `toto` | **ADMIN** | Tout : budget, exports, validation FSDIE |

> Le compte `toto` est le compte de test principal. Il a accès à toutes les fonctionnalités y compris les exports PDF/Excel et la validation FSDIE.

### Comptes API backend (`http://localhost:3000`)

Pour tester l'API REST directement (Postman, Insomnia) :

| Email | Mot de passe | Rôle BDD |
|---|---|---|
| `admin@kubik.fr` | `admin123` | ADMIN |
| `bureau@kubik.fr` | `admin123` | ADMIN |
| `tresorier@kubik.fr` | `admin123` | MEMBER |

```bash
# Exemple login API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kubik.fr","password":"admin123"}'
```

---

## 6. Lancer l'application

### Terminal 1 — Backend

```bash
cd backend
npm install      # première fois seulement
npm run dev      # nodemon (rechargement auto)
# OU
node server.js   # si nodemon non installé
```

✅ Message attendu : `Serveur backend lancé sur http://localhost:3000`

### Terminal 2 — Frontend

```bash
cd frontend
npm install      # première fois seulement
ng serve
```

✅ Application disponible sur `http://localhost:4200`

### Vérification rapide

```bash
# Test backend
curl http://localhost:3000/api/hello
# Attendu : {"success":true,"message":"Hello World depuis MySQL"}

# Test données
curl http://localhost:3000/api/events
# Attendu : tableau JSON avec 5 événements
```

---

## 7. Fonctionnalités disponibles

### 7.1 Budget & exports (compte toto)

Les boutons d'export apparaissent en haut de l'onglet **Budget** de chaque événement :

| Bouton | Format | Contenu |
|---|---|---|
| **Excel** | `.xlsx` | Budget complet (2 colonnes DÉPENSES/RECETTES, groupé par catégorie) |
| **Dossier FSDIE** | `.pdf` | Couverture + budget complet + tableau FSDIE + table annexes + PJ réelles mergées |

**Règles FSDIE automatiques :**
- Seules les lignes `is_fsdie_eligible = true` de type `EXPENSE` apparaissent dans le dossier
- La subvention FSDIE attendue (= total éligible) est **automatiquement portée en recette** dans le budget
- Les lignes `REFUSE` sont affichées barrées et exclues du total demandé
- Chaque PJ est mergée dans le PDF avec sa page séparatrice `ANNEXE A1 — [Libellé]`

### 7.2 Planning shifts (grille 24h)

- Onglet **Planning** de chaque événement
- Grille horaire de 00h à 23h59 (gestion des soirées et nettoyages nocturnes)
- Clic sur un créneau → drawer latéral : inscrits, validation, suppression
- Chevauchements de créneaux gérés visuellement

### 7.3 Kanban

- Onglet **Kanban** de chaque événement
- Drag & drop sur la carte entière (Angular CDK)
- Persistance immédiate en BDD

---

## 8. Tests automatisés

Voir **[TESTING.md](TESTING.md)** pour le détail complet.

```bash
# Tests backend (42 tests — API + intégration)
cd backend
npm test

# Tests frontend
cd frontend
npm test

# Tests E2E Playwright
cd e2e
npx playwright test
```

---

## 9. Structure du projet

```
projetagileM2/
├── README.md                    ← Ce fichier
├── SFD_projetagileM2.md         ← Spécification Fonctionnelle Détaillée
├── STD_projetagileM2.md         ← Spécification Technique Détaillée
├── TESTING.md                   ← Stratégie et exécution des tests
│
├── database/
│   ├── init.sql                 ← Schéma complet (CREATE TABLE)
│   ├── seed-data.sql            ← Users + events de base
│   ├── seed-members.sql         ← 47 membres fictifs
│   ├── seed-participants.sql    ← ~180 inscriptions
│   ├── seed-budget.sql          ← Lignes budget EXPENSE + REVENUE
│   ├── seed-kanban.sql          ← Colonnes + cartes Kanban
│   ├── seed-shifts.sql          ← 68 créneaux de planning
│   ├── migration_kanban.sql     ← Migration tables kanban_*
│   ├── migration_shifts.sql     ← Migration table shifts
│   └── migration_validation_status.sql
│
├── backend/
│   ├── .env                     ← À créer (voir §3)
│   ├── server.js                ← Point d'entrée Express
│   ├── controllers/
│   │   ├── export.controller.js ← PDF FSDIE + Excel
│   │   └── ...
│   ├── routes/
│   ├── uploads/                 ← PJ PDF générées (gitignored)
│   ├── scripts/
│   │   ├── setup-test-data.js   ← Script tout-en-un données de test
│   │   ├── generate-fake-pj.py  ← Générateur factures HTML→PDF (Python)
│   │   ├── seed-prod.js         ← Seed budget basé sur vrais events
│   │   ├── generate-budget.js   ← Génération lignes budget
│   │   └── apply-prod-migrations.js
│   └── test/
│       ├── auth.test.js
│       ├── events.test.js
│       ├── budget.test.js
│       ├── shift-planning.test.js
│       └── ...
│
├── frontend/
│   └── src/app/
│       ├── pages/
│       │   ├── event-detail/
│       │   │   ├── budget-tab/  ← Budget + exports
│       │   │   ├── shifts-tab/  ← Planning grille 24h
│       │   │   └── kanban-tab/  ← Tableau Kanban
│       │   ├── events/
│       │   ├── dashboard/
│       │   └── members/
│       └── services/
│
└── e2e/                         ← Tests Playwright E2E
```

---

## 10. Problèmes fréquents

### `Cannot find module 'dotenv'`
→ Se placer dans `backend/` avant de lancer les scripts Node :
```bash
cd backend && node scripts/setup-test-data.js
```

### `python -m pip` non reconnu
→ Utiliser `python3 -m pip` ou vérifier l'installation Python (3.10+).

### `ng` n'est pas reconnu
```bash
npm install -g @angular/cli
```

### Erreur MySQL : accès refusé
→ Vérifier `DB_PASSWORD` dans `backend/.env`.

### Les boutons Export ne s'affichent pas
→ Se connecter avec `toto@mail.com / toto` (rôle ADMIN requis).  
→ Se déconnecter/reconnecter si une ancienne session est en cache.

### Le PDF FSDIE génère une erreur 400
→ Vérifier que l'événement a des lignes budget avec `is_fsdie_eligible = true`.  
→ Lancer `node scripts/setup-test-data.js` pour reinjecter les données.

### Les PJ n'apparaissent pas dans le PDF FSDIE
→ Lancer le générateur Python :
```bash
cd backend
python scripts/generate-fake-pj.py
```

---

## Liens utiles

| Ressource | URL |
|---|---|
| Application | http://localhost:4200 |
| API backend | http://localhost:3000 |
| Health check | http://localhost:3000/api/hello |
| Événements API | http://localhost:3000/api/events |
| Export FSDIE event 1 | http://localhost:3000/api/export/events/1/fsdie |
| Export Excel event 1 | POST http://localhost:3000/api/export/budget |

---

> 📄 **Docs complémentaires** : [SFD](SFD_projetagileM2.md) · [STD](STD_projetagileM2.md) · [TESTING](TESTING.md)
