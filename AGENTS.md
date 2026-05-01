# AGENTS.md — projetagileM2 (Gestion d'événements FSDIE)

> Lire en début de session. Confirmer les règles actives avant de coder.

---

## Stack & Architecture

| Couche | Tech | Port | Dossier |
|---|---|---|---|
| Frontend | Angular (dernière LTS) | 4200 | `frontend/` |
| Backend | Node.js + Express | 3000 | `backend/` |
| Base de données | MySQL | 3306 | `database/` |
| Tests backend | Vitest | — | `backend/test/` + `backend/tests/` |
| Tests E2E | Playwright | — | `e2e/` |

**Branche de travail :** `zac` (ne pas travailler sur `main` directement)

---

## Règles absolues

1. **NEVER committer sur `main` directement** — toujours branche `zac` → PR
2. **Tests avant commit** — `npm test` dans `backend/` doit passer
3. **NEVER exposer `.env`** — fichier secret, jamais commité
4. **Plan d'abord** pour toute feature Angular multi-composants — les dépendances entre modules sont fréquentes
5. **Commit atomique** après chaque feature validée + tests verts

---

## Lancer le projet

### Terminal 1 — Backend
```bash
cd backend
npm install
npm run dev        # nodemon
# ou : node server.js
```
Vérification : `http://localhost:3000/api/hello` → JSON `{success:true}`

### Terminal 2 — Frontend
```bash
cd frontend
npm install
ng serve
```
Vérification : `http://localhost:4200`

### Base de données (une seule fois)
```sql
-- Dans MySQL CLI ou Workbench :
source database/init.sql;
source database/seed-data.sql;
```

---

## Identifiants de test

| Surface | Email | Mot de passe |
|---|---|---|
| Frontend (factice) | `toto@mail.com` | `toto` |
| API directe | `admin@kubik.fr` | `admin123` |

---

## Tests

```bash
# Backend — tests unitaires (Vitest)
cd backend && npm test

# Tests avec contrôleurs espions (pattern établi)
# Voir TESTING.md pour la stratégie complète TUF/TR/TUT

# E2E — Playwright
cd e2e && npx playwright test
```

**Pattern de test backend établi :**
- TR (tests de route) : controller spies via `vi.spyOn`
- TUF (tests unitaires fonctions) : fonctions isolées sans DB
- Voir `backend/tests/` pour les exemples existants

---

## Structure backend

```
backend/
  server.js          ← point d'entrée Express
  routes/            ← routes API
  controllers/       ← logique métier
  models/            ← accès MySQL
  services/          ← services partagés
  config/            ← config DB
  tests/ + test/     ← Vitest
  vitest.config.js
```

---

## Documentation existante

- `README.md` — setup complet de l'environnement
- `SFD_projetagileM2.md` — spécifications fonctionnelles
- `STD_projetagileM2.md` — spécifications techniques
- `TESTING.md` — stratégie de tests

**Toujours mettre à jour `SFD_projetagileM2.md`** après implémentation d'une feature significative.

---

## Trigger-Action patterns

```
WHEN tu ajoutes une route backend → DO ajouter le test TR correspondant
WHEN tu modifies un composant Angular → DO vérifier les imports dans le module parent
WHEN tu touches la config DB → DO vérifier que .env.test existe pour les tests
WHEN tâche multi-fichiers → DO plan d'abord, attendre validation
WHEN tu termines une feature → DO npm test doit être vert avant commit
```
