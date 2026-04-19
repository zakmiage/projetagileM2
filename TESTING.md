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

- **Technologie** : `Vitest` (exécuteur de tests ultra-rapide) + `Supertest` (bibliothèque permettant de simuler requêtes HTTP sans ouvrir véritablement un port TCP réseau).
- **Emplacement** : `backend/test/`
- **Logique** :
  - **TUF (Authentification)** : S'assure que si on requête la route de login `/api/auth/login` avec de mauvais paramètres, une erreur de type HTTP 401 est rigoureusement renvoyée au client. 
  - **TR (Événements)** : Interroge la base de donnée `_test` via l'API pour voir si le compositing de l'ORM (ici `MySQL2`) parvient bien à envoyer la réponse JSON `200 OK` contenant de la donnée (`events`).

### Comment lancer ?
```bash
cd backend
npm run test
```

---

## 4. Tests Frontend (TUF)

La couche Angular est documentée prioritairement via des tests asynchrones sur ses services métiers (logique sans DOM).

- **Technologie** : `Vitest` (avec intégration `jsdom` pour supporter les objets globaux du navigateur comme le *localStorage*).
- **Emplacement** : Fichiers `.spec.ts` associés aux fichiers `.ts` (Ex: `frontend/src/app/services/auth.service.spec.ts`).
- **Logique** :
  - Le test injecte manuellement l'`AuthService`. 
  - On *Mock* (simule) le système de routeur (navigation).
  - L'objectif principal de la validation de la logique de connexion (fictive/prototype) consiste à analyser ce qui se passe quand le service valide `toto@mail.com` et comment le Local Storage réagit à une déconnexion.

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
  - Le scénario de test repère le formulaire via des sélecteurs CSS ou du texte (ex. l'input "email"), saisit le texte à vitesse grand V, et clique sur le boutton Valider.
  - Il attend ensuite via une promesse Javascript (`waitForURL`) que la page redirige de force l'utilisateur vers `/dashboard`. Si ça prend plus de 5000 millisecondes (indisponibilité ou échec du login), l'assertion saute, et l'exécuteur marque le script en erreur.

### Comment lancer ?

⚠️ **Pré-requis :** Le Frontend (port 4200) et le Backend (port 3000) **doivent** tourner de leur côté, simulant un usage de production.

```bash
cd e2e
npx playwright test
```

> **Astuce visuelle** : Ajoutez le drapeau `--ui` (`npx playwright test --ui`) pour ouvrir une interface de gestion de vos tests Playwright, vous permettant de suivre les clics en direct, de stopper le process et d'inspecter les requêtes en vol.
