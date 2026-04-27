# Stratégie et Exécution des Tests

Ce document décrit en détail l'organisation des tests (TUF, TR, TUT) pour l'application de gestion d'événements associatifs `projetagileM2`.
L'objectif de cette suite est d'assurer que les fondements backend, la logique frontend et les scénarios bout-en-bout (E2E) fonctionnement correctement avant chaque déploiement.

---

## Sommaire
1. [Vocabulaire et Périmètre](#1-vocabulaire-et-périmètre)
2. [Base de données de test](#2-base-de-données-de-test)
3. [Tests Backend (TUF / TR)](#3-tests-backend-tuf--tr)
4. [Tests Frontend (TUF)](#4-tests-frontend-tuf)
5. [Tests Utilisateurs / End-to-End (TUT)](#5-tests-utilisateurs--end-to-end-tut)

---

## 1. Vocabulaire et Périmètre

| Acronyme | Nom Complet | Périmètre et Outils |
|:---:|---|---|
| **TUF** | Tests Unitaires Fonctionnels | Validation du comportement interne des fonctions, classes et services en isolation. <br/>*(Outils : Vitest)* |
| **TR** | Tests de Routage / Intégration | Contrôle du fonctionnement des API REST avec une vraie base de données derrière pour valider l'intégrité globale. <br/>*(Outils : Vitest, Supertest)* |
| **TUT** | Tests Utilisateurs Techniques (E2E) | Exécution d'un scénario de A à Z via un navigateur web automatisé sans modification du code applicatif. <br/>*(Outils : Playwright)* |

---

## 2. Base de données de test

Pour ne pas corrompre les données réelles lors de l'exécution des tests d'intégration backend, le projet repose sur une base de données MySQL isolée : **`gestion_assos_test`**.

### Fonctionnement :
1. Le fichier `backend/.env.test` force la variable globale `DB_NAME=gestion_assos_test`.
2. Le backend (`server.js`) a été conditionné : lors du lancement de `vitest`, la constante système `NODE_ENV` passe à `test`. Le serveur charge ainsi les variables de l'environnement de test au lieu des variables de production, et redirige ses connexions SQL.

---

## 3. Tests Backend (TUF / TR)

Les tests backend se concentrent sur la structure de l'API.

- **Technologie** : `Vitest` + `Supertest`
- **Emplacement** : `backend/test/`
- **Logique** :
  - **TUF (Authentification)** : S'assure que si on requête `/api/auth/login` avec de mauvais paramètres, une erreur HTTP 401 est renvoyée.
  - **TR (Événements)** : Interroge la base `_test` via l'API pour valider le retour JSON `200 OK` avec données.

### Fichiers de test backend

| Fichier | Feature | Scénarios couverts |
|---------|---------|-------------------|
| `api.test.js` | Auth + Events | Login invalide (401), liste événements (200) |
| `budget.test.js` | Budget Lines | CRUD complet, création FSDIE, mise à jour `actual_amount` |
| `budget-status.model.test.js` | Validation FSDIE | Changement de statut `SOUMIS → APPROUVE → REFUSE` |
| `budget-status.route.test.js` | Route PATCH status | Validation HTTP du PATCH `/budget-lines/:id/status` |
| `event-delete.route.test.js` | Suppression événement | Cascade budget + inscriptions |
| `member-delete.model.test.js` | Suppression membre | Modèle + intégrité BDD |
| `member-delete.route.test.js` | Route DELETE membre | HTTP 200 + vérification suppression |
| **`shift.test.js`** *(nouveau)* | **Shifts** | Création, inscription, anti-conflit horaire, capacité max, désinscription, suppression |
| **`kanban.test.js`** *(nouveau)* | **Kanban** | CRUD colonnes + cartes, déplacement de carte |
| **`export.test.js`** *(nouveau)* | **Export PDF** | Concat PJ (200/404), FSDIE PDF (200/400), événement inexistant (404), Excel (200) |

### Comment lancer ?
```bash
cd backend
npm run test
```

---

## 4. Tests Frontend (TUF)

La couche Angular est documentée prioritairement via des tests asynchrones sur ses services métiers (logique sans DOM).

- **Technologie** : `Vitest` (avec intégration `jsdom`)
- **Emplacement** : Fichiers `.spec.ts` associés aux fichiers `.ts`
- **Logique** :
  - Le test injecte manuellement l'`AuthService`.
  - On *Mock* (simule) le système de routeur (navigation).
  - Validation de la logique de connexion et du Local Storage lors de la déconnexion.

### Comment lancer ?
```bash
cd frontend
npx vitest run
```
*(Vous n'avez pas besoin d'avoir `ng serve` qui tourne).*

---

## 5. Tests Utilisateurs / End-to-End (TUT)

C'est la couche la plus exhaustive de la stratégie de tests. Elle reproduit le parcours d'un visiteur qui clique et navigue.

- **Technologie** : `Microsoft Playwright`
- **Emplacement** : Répertoire `/e2e` à la racine principale du dossier `projetagileM2`.
- **Logique** :
  - Playwright se lance et interroge automatiquement le front (`http://localhost:4200`).
  - Le scénario repère le formulaire via des sélecteurs CSS ou du texte, saisit les données et clique.
  - Il attend via `waitForURL` que la page redirige. Timeout à 5000ms → assertion en erreur.

### Scénarios E2E recommandés pour les nouvelles features

| Scénario | Steps |
|----------|-------|
| **Shifts — Créer + Inscrire** | Login → event detail → onglet "Créneaux" → créer shift → inscrire membre → vérifier barre remplissage |
| **Shifts — Anti-conflit** | Login → inscrire même membre sur 2 shifts chevauchants → vérifier toast erreur |
| **Kanban — D&D** | Login → event detail → onglet "Kanban" → créer colonne → créer carte → drag vers autre colonne → vérifier persistance |
| **Export PDF FSDIE** | Login → event detail → Budget → "Générer dossier FSDIE" → vérifier téléchargement |
| **Budget — Optimistic UI** | Modifier un montant → vérifier mise à jour immédiate → vérifier recalcul Subvention FSDIE sans F5 |
| **Budget — Persistance R14** | Modifier forecast → F5 → vérifier que forecast ET Subvention FSDIE affichent la bonne valeur (indépendante de actual) |
| **Budget — Polling** | Ouvrir 2 onglets sur le même event → modifier budget dans onglet 1 → vérifier mise à jour dans onglet 2 en moins de 5s |


### Comment lancer ?

⚠️ **Pré-requis :** Le Frontend (port 4200) et le Backend (port 3000) **doivent** tourner en parallèle.

```bash
cd e2e
npx playwright test
```

> **Astuce visuelle** : Ajoutez le drapeau `--ui` (`npx playwright test --ui`) pour ouvrir une interface de gestion de vos tests Playwright, vous permettant de suivre les clics en direct, de stopper le process et d'inspecter les requêtes en vol.
