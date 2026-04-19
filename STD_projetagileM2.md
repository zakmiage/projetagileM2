# STD — Spécification Technique Détaillée
## Application de Gestion d'Événements pour Associations

> **Document rétroingénéré** à partir du code source du projet `projetagileM2`  
> Version : 1.0 — Dernière modification du dépôt : **03/04/2026 à 12h09**

---

## 1. Architecture générale

L'application suit une architecture **3-tiers découplée** :

```
┌─────────────────────┐     HTTP/REST     ┌──────────────────────┐     SQL     ┌──────────────┐
│  Frontend (Angular) │ ◄───────────────► │  Backend (Express.js)│ ◄─────────► │  MySQL 8.x   │
│  :4200              │                   │  :3000               │             │  gestion_assos│
└─────────────────────┘                   └──────────────────────┘             └──────────────┘
```

---

## 2. Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | Angular | 17+ (standalone components) |
| Styles | TailwindCSS | 3.x |
| Backend | Node.js + Express.js | LTS |
| Base de données | MySQL | 8.x |
| Authentification (backend) | JWT (`jsonwebtoken`) + `bcryptjs` |
| Export Excel | `exceljs` |
| Rendu serveur | Angular SSR (`@angular/ssr`) |
| ORM | Aucun — requêtes SQL brutes via `mysql2` |
| **Tests API & Backend (TR)** | `vitest` + `supertest` |
| **Tests Frontend (TUF)** | `vitest` + injecteurs `@angular/core` |
| **Tests E2E (TUT)**| `playwright` (Chromium, Webkit, Firefox) |

---

## 3. Base de données

### 3.1 Schéma relationnel

**Base : `gestion_assos`**

```
users ──────────────┐
                    │ created_by / updated_by
                    ▼
              budget_lines ◄────── budget_attachments
                    │
                    │ event_id
                    ▼
members ──── event_registrations ──► events
   │
   └──► member_attachments
```

### 3.2 Tables détaillées

#### `users`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(50) | NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| created_at | DATETIME | DEFAULT NOW() |

#### `members`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| t_shirt_size | VARCHAR(5) | NULL |
| allergies | TEXT | NULL |
| is_certificate_ok | BOOLEAN | DEFAULT FALSE |
| is_waiver_ok | BOOLEAN | DEFAULT FALSE |
| is_image_rights_ok | BOOLEAN | DEFAULT FALSE |
| created_at | DATETIME | DEFAULT NOW() |

#### `member_attachments`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| member_id | INT | FK → members(id) CASCADE |
| document_type | VARCHAR(50) | ex: CERTIFICATE, WAIVER, PARENTAL_CONSENT |
| file_name | VARCHAR(255) | NOT NULL |
| file_path | VARCHAR(255) | NOT NULL |
| uploaded_at | DATETIME | DEFAULT NOW() |

#### `events`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| start_date | DATETIME | NOT NULL |
| end_date | DATETIME | NOT NULL |
| capacity | INT | NOT NULL |
| created_at | DATETIME | DEFAULT NOW() |

#### `event_registrations`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| event_id | INT | FK → events(id) CASCADE |
| member_id | INT | FK → members(id) CASCADE |
| has_deposit | BOOLEAN | DEFAULT FALSE |
| registered_at | DATETIME | DEFAULT NOW() |
| — | — | UNIQUE(event_id, member_id) |

#### `budget_lines`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| event_id | INT | FK → events(id) CASCADE |
| type | ENUM('REVENUE','EXPENSE') | NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| label | VARCHAR(200) | NOT NULL |
| forecast_amount | DECIMAL(10,2) | DEFAULT 0.00 |
| actual_amount | DECIMAL(10,2) | NULL |
| is_fsdie_eligible | BOOLEAN | DEFAULT FALSE |
| created_by | INT | FK → users(id) |
| updated_by | INT | FK → users(id) NULL |
| created_at | DATETIME | DEFAULT NOW() |
| updated_at | DATETIME | ON UPDATE NOW() |

#### `budget_attachments`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| budget_line_id | INT | FK → budget_lines(id) CASCADE |
| file_name | VARCHAR(255) | NOT NULL |
| file_path | VARCHAR(255) | NOT NULL |
| uploaded_at | DATETIME | DEFAULT NOW() |

---

## 4. Backend — API REST

### 4.1 Point d'entrée

**Fichier :** `backend/server.js`

- Framework : **Express.js**
- Port : `3000` (configurable via `.env`)
- Middlewares globaux : `cors()`, `express.json()`
- Chargement `.env` : `dotenv` (cherche `backend/.env` puis `../.env`)

### 4.2 Endpoints

#### Authentification — `/api/auth`

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Crée un utilisateur (hash bcrypt, retourne 201) |
| POST | `/api/auth/login` | Vérifie credentials, retourne un JWT signé |

**JWT payload :** `{ id, email, role }` — expiré selon `JWT_EXPIRES_IN` (défaut : `1d`)

#### Événements — `/api/events`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/events` | Retourne tous les événements (ORDER BY start_date DESC) |
| GET | `/api/events/:id` | Retourne l'événement + ses inscriptions (JOIN members) |
| POST | `/api/events` | Crée un événement |
| POST | `/api/events/:id/participants` | Inscrit un membre (`{ memberId }`) |
| DELETE | `/api/events/:id/participants/:memberId` | Désinscrit un membre |

#### Budget — `/api/budget-lines`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/budget-lines?eventId=X` | Retourne les lignes de budget d'un événement |
| POST | `/api/budget-lines` | Crée une ligne de budget |
| PUT | `/api/budget-lines/:id` | Mise à jour partielle d'une ligne |
| DELETE | `/api/budget-lines/:id` | Supprime une ligne |

#### Membres — `/api/members`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/members` | Retourne tous les membres (ORDER BY id DESC) |
| GET | `/api/members/:id` | Retourne un membre par ID |
| POST | `/api/members` | Crée un membre |
| PUT | `/api/members/:id` | Mise à jour partielle d'un membre |
| DELETE | `/api/members/:id` | Supprime un membre |

#### Export — `/api/export`

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/export/budget` | Génère et télécharge un fichier `.xlsx` |

**Corps de la requête :**
```json
{
  "lines": [ ...BudgetLine[] ],
  "fsdieOnly": false
}
```

**Réponse :** Blob `.xlsx` avec headers :
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename=budget[_fsdie].xlsx`

#### Health Check

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Vérifie la connectivité BDD (`SELECT 1`) |

### 4.3 Format de réponse standard

```json
{
  "success": true,
  "data": { ... }
}
```

En cas d'erreur :
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

### 4.4 Architecture MVC Backend

```
backend/
├── server.js            ← Point d'entrée, montage des routes
├── config/
│   └── db.js            ← Pool de connexion mysql2
├── routes/
│   ├── auth.routes.js
│   ├── event.routes.js
│   ├── budget.routes.js
│   ├── member.routes.js
│   └── export.routes.js
├── controllers/         ← Couche HTTP (req/res)
│   ├── auth.controller.js
│   ├── event.controller.js
│   ├── budget.controller.js
│   ├── member.controller.js
│   └── export.controller.js
├── models/              ← Couche accès données (SQL)
│   ├── event.model.js
│   ├── budget.model.js
│   └── member.model.js
└── services/            ← Couche métier (opérations complexes)
    ├── event.service.js
    ├── budget.service.js
    └── member.service.js
```

---

## 5. Frontend — Angular

### 5.1 Architecture des modules

```
frontend/src/app/
├── app.routes.ts          ← Routing principal (lazy loading)
├── app.config.ts          ← Configuration globale (HttpClient, Router)
├── guards/
│   ├── auth.guard.ts      ← Bloque les routes si non authentifié
│   └── guest.guard.ts     ← Redirige si déjà connecté
├── layout/
│   └── layout.component   ← Shell avec navbar (wraps les pages)
├── models/               ← Interfaces TypeScript
│   ├── user.model.ts
│   ├── event.model.ts
│   ├── member.model.ts
│   └── budget.model.ts
├── services/             ← Couche HTTP RxJS
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── member.service.ts
│   └── budget.service.ts
└── pages/
    ├── login/             ← Page de connexion
    ├── events/            ← Liste + création d'événements
    ├── event-detail/      ← Détail avec onglets
    │   ├── budget-tab/    ← Budget & FSDIE
    │   └── participants-tab/
    ├── members/           ← Annuaire membres
    └── settings/          ← (Non implémenté)
```

### 5.2 Routing

| Route | Composant | Guard |
|-------|-----------|-------|
| `/login` | `LoginComponent` | `guestGuard` |
| `/events` | `EventsComponent` | `authGuard` |
| `/events/:id` | `EventDetailComponent` | `authGuard` |
| `/members` | `MembersComponent` | `authGuard` |
| `/settings` | `SettingsComponent` | `authGuard` |
| `**` | Redirect → `/events` | — |

Toutes les routes authentifiées sont encapsulées dans le `LayoutComponent`.

### 5.3 Modèles TypeScript

```typescript
interface Event {
  id: number; name: string; description?: string;
  start_date: string; end_date: string; capacity: number;
  created_at: string;
  registrations?: EventRegistration[];
  budget_lines?: BudgetLine[];
}

interface EventRegistration {
  id: number; event_id: number; member_id: number;
  has_deposit: boolean; registered_at: string;
  member?: Member;
}

interface Member {
  id: number; first_name: string; last_name: string; email: string;
  t_shirt_size?: string; allergies?: string;
  is_certificate_ok: boolean; is_waiver_ok: boolean;
  is_image_rights_ok: boolean; created_at: string;
  attachments?: MemberAttachment[];
}

interface BudgetLine {
  id: number; event_id: number;
  type: 'REVENUE' | 'EXPENSE';
  category: string; label: string;
  forecast_amount: number; actual_amount?: number;
  is_fsdie_eligible: boolean;
  created_by: number; updated_by?: number;
  created_at: string; updated_at: string;
  attachments?: BudgetAttachment[];
}
```

### 5.4 Services Angular

Tous les services utilisent `HttpClient` (inject pattern) et retournent des `Observable`.

| Service | URL de base | Méthodes exposées |
|---------|-------------|-------------------|
| `EventService` | `/api/events` | `getEvents()`, `getEvent(id)`, `createEvent()`, `addParticipant()`, `removeParticipant()` |
| `BudgetService` | `/api/budget-lines` | `getBudgetLines(eventId)`, `createBudgetLine()`, `updateBudgetLine()`, `deleteBudgetLine()`, `exportBudgetExcel()` |
| `MemberService` | `/api/members` | `getMembers()`, `updateMember()`, `createMember()` |
| `AuthService` | localStorage | `login()`, `logout()`, `isAuthenticated()`, `forgotPassword()` |

**Note :** `AuthService` n'appelle pas le backend. La validation est hardcodée :
```typescript
email === 'toto@mail.com' && password === 'toto'
```

### 5.5 Guards

**`authGuard`** : Vérifie `AuthService.isAuthenticated()`. Si faux → redirige `/login`  
**`guestGuard`** : Vérifie `AuthService.isAuthenticated()`. Si vrai → redirige `/events`

Le contrôle de session inclut une vérification de l'expiration via `sessionData.expiresAt`.

### 5.6 Composant BudgetTab

**Logique principale :**

| Méthode | Description |
|---------|-------------|
| `loadBudget()` | Appel API GET par eventId via setter `@Input` |
| `getExpenses()` | Filtre `lines` sur `type === 'EXPENSE'` |
| `getRevenues()` | Filtre `lines` sur `type === 'REVENUE'` |
| `getExpensesTotal()` | Somme selon `viewMode` (forecast ou actual) |
| `getRevenuesTotal()` | Somme selon `viewMode` |
| `getTotal()` | `revenues - expenses` |
| `save(line)` | PUT via `BudgetService.updateBudgetLine` (déclenché au `blur`) |
| `addLine(type)` | POST via `BudgetService.createBudgetLine` |
| `deleteLine(line)` | DELETE avec confirmation |
| `triggerUpload(line)` | Upload simulé via `input[type=file]` dynamique + ObjectURL |
| `export(fsdieOnly)` | POST `/api/export/budget` → téléchargement du Blob `.xlsx` |

### 5.7 Génération Excel (Backend)

Le contrôleur `export.controller.js` utilise `exceljs` :

- **Structure** : 6 colonnes (3 SORTIES + 3 ENTRÉES côte à côte)
- **Groupement** : Par catégorie avec sous-totaux et ligne TOTAL
- **Style** : 
  - SORTIES : rouge pastel `#FADCD9` / en-tête `#E06666`
  - ENTRÉES : vert pastel `#DFF0D8` / en-tête `#93C47D`
  - TOTAL : gris `#B7B7B7`
- **Mode FSDIE** : Filtre = Toutes les REVENUE + EXPENSE où `is_fsdie_eligible = true`

---

## 6. Variables d'environnement

**Fichier :** `backend/.env`

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<mot_de_passe_mysql>
DB_NAME=gestion_assos
JWT_SECRET=<clé_secrète>
JWT_EXPIRES_IN=1d
```

---

## 7. Dépendances

### Backend (`backend/package.json`)

| Package | Usage |
|---------|-------|
| `express` | Framework HTTP |
| `cors` | Middleware CORS |
| `dotenv` | Variables d'environnement |
| `mysql2` | Connexion MySQL (pool + prepared statements) |
| `bcryptjs` | Hashage des mots de passe |
| `jsonwebtoken` | Génération et vérification de JWT |
| `exceljs` | Génération de fichiers Excel `.xlsx` |
| `nodemon` (dev) | Hot-reload en développement |

### Frontend (`frontend/package.json`)

| Package | Usage |
|---------|-------|
| `@angular/core` | Framework Angular 17+ |
| `@angular/common/http` | `HttpClient` pour les appels API |
| `@angular/router` | Routing avec lazy loading |
| `tailwindcss` | Framework CSS utilitaire |
| `@angular/ssr` | Rendu côté serveur (SSR) |

---

## 8. Lancement de l'application

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev
# → http://localhost:3000

# Terminal 2 — Frontend  
cd frontend && npm install && ng serve
# → http://localhost:4200
```

**Initialisation BDD :**
```sql
source database/init.sql;         -- Crée le schéma
source database/seed-data.sql;    -- Données de test
```

---

## 9. Infrastructure et Exécution des Tests

Le projet sépare strictement l'environnement de production de l'environnement de test pour éviter tout effet de bord.

### 9.1 Base de données de Test (`gestion_assos_test`)
* Fichier `.env.test` dans `backend/` activant la cible de test.
* Lors de l'exécution de la commande `npm run test`, `server.js` redirige la configuration DB via l'interception de `NODE_ENV=test`.

### 9.2 Lancement des Suites
Tous les tests sont centralisés sous la logique Test Runner (TUF pour logique Frontend, TR pour Endpoints Backend, et TUT pour Playwright).
Pour plus d'informations opérationnelles, se référer au fichier global **`TESTING.md`**.

```bash
# 1. Tests d'Intégration API (Backend)
cd backend && npm run test

# 2. Tests Fonctions TypeScript (Frontend)
cd frontend && npx vitest run

# 3. Scénarios Navigateurs (E2E) (Dépend des serveurs Front & Back tournant)
cd e2e && npx playwright test
```

---

## 10. Points de fragilité techniques identifiés

| # | Point | Impact |
|---|-------|--------|
| T-01 | URL API hardcodée `http://localhost:3000` dans les services | Bloque le déploiement en production |
| T-02 | Authentification frontend en dur (pas de JWT) | Aucune sécurité réelle |
| T-03 | `created_by` hardcodé à `1` dans `BudgetTabComponent` | Erreur si user admin non créé |
| T-04 | Pièces jointes non persistées (ObjectURL) | Données perdues au rechargement |
| T-05 | Pas de middleware d'authentification sur les routes backend | API ouverte sans token |
| T-06 | Pas de pagination | Performance dégradée sur gros volumes |
| T-07 | `ChangeDetectorRef.detectChanges()` appelé manuellement | Zone.js ou signal à préférer |
