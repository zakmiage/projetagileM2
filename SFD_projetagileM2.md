# SFD — Spécification Fonctionnelle Détaillée
## Application de Gestion d'Événements pour Associations

> **Document rétroingénéré** à partir du code source du projet `projetagileM2`  
> Version : 1.0 — Dernière modification du dépôt : **03/04/2026 à 12h09**

---

## 1. Présentation générale

### 1.1 Objectif de l'application

L'application est une plateforme web de gestion interne pour association étudiante (type BDE/club). Elle permet à des administrateurs connectés de :

- Créer et consulter des **événements**
- Gérer les **inscriptions** de membres à ces événements
- Suivre le **budget prévisionnel et réel** de chaque événement
- Exporter les données financières au format **Excel**, notamment pour les dossiers de subvention **FSDIE**
- Gérer un **annuaire des membres** avec leurs informations administratives

### 1.2 Acteurs

| Acteur | Description |
|--------|-------------|
| **Administrateur connecté** | Utilisateur authentifié pouvant accéder à toutes les fonctionnalités |
| **Visiteur non connecté** | Redirigé automatiquement vers la page de connexion |

> ⚠️ **Note prototype** : L'authentification est simulée côté frontend avec des identifiants en dur (`toto@mail.com` / `toto`). Le backend JWT est implémenté mais non relié au frontend dans l'état actuel.

---

## 2. Module Authentification

### 2.1 Connexion

- L'utilisateur accède à `/login`
- Il saisit son **email** et son **mot de passe**
- En cas de succès, une **session est stockée dans le localStorage** (durée : 1 jour)
- Il est redirigé vers la page des événements (`/events`)
- En cas d'échec, un message d'erreur est affiché

### 2.2 Déconnexion

- L'utilisateur peut se déconnecter depuis le menu de navigation
- La session est supprimée du localStorage
- Il est redirigé vers `/login`

### 2.3 Protection des routes

- Toutes les pages (sauf `/login`) sont protégées par un **guard d'authentification**
- Si la session est expirée ou absente, l'utilisateur est redirigé vers `/login`
- Si l'utilisateur est déjà connecté et tente d'accéder à `/login`, il est redirigé vers `/events`

### 2.4 Mot de passe oublié

- Un formulaire de mot de passe oublié est présent (simulé, sans envoi réel d'email)

---

## 3. Module Événements

### 3.1 Liste des événements

- La page `/events` affiche la liste de tous les événements existants
- Chaque carte affiche : **nom**, **date de début**, **capacité maximale**, **description**
- Un champ de **recherche textuelle** filtre les événements par nom ou description (filtrage en temps réel, côté client)

### 3.2 Création d'un événement

- Un bouton "Nouvel événement" ouvre une **modale de création**
- Champs obligatoires : **Nom**, **Date de début**
- Champs optionnels : **Description**, **Date de fin**, **Capacité** (défaut : 50)
- Après création, l'événement apparaît immédiatement dans la liste

### 3.3 Détail d'un événement

- Cliquer sur un événement navigue vers `/events/:id`
- La page affiche le nom, la date et la capacité de l'événement
- Elle contient deux **onglets** : **Budget & FSDIE** et **Participants**

---

## 4. Module Budget & FSDIE

> Accessible via l'onglet "Budget & FSDIE" de la page détail d'un événement.

### 4.1 Tableau de bord financier

- Affiche deux colonnes : **Dépenses** (gauche, en rouge) et **Revenus** (droite, en vert)
- Chaque ligne de budget affiche : **Catégorie**, **Libellé**, **Montant**
- Le total de chaque colonne est calculé automatiquement
- Un **bilan global** en bas de page indique le solde (Revenus – Dépenses), coloré en vert (bénéfice) ou rouge (déficit)

### 4.2 Modes d'affichage

- Basculer entre vue **Prévisionnelle** et vue **Réelle** via un sélecteur
- En mode prévisionnel : affichage et édition du champ `forecast_amount`
- En mode réel : affichage et édition du champ `actual_amount`

### 4.3 Gestion des lignes de budget

| Action | Description |
|--------|-------------|
| **Ajouter** | Bouton "Ajouter une dépense" / "Ajouter un revenu" → crée une ligne vide en BDD |
| **Modifier** | Les champs Catégorie, Libellé et Montant sont éditables inline. La sauvegarde se déclenche à la perte du focus (`blur`) |
| **Supprimer** | Bouton corbeille avec confirmation → suppression en BDD |
| **Éligibilité FSDIE** | Checkbox par ligne de dépense. Si coché, la ligne sera incluse dans l'export FSDIE |

### 4.4 Pièces jointes (justificatifs)

- Chaque ligne de budget peut avoir des **pièces jointes** (factures, reçus)
- Un bouton "Joindre une facture" / "Joindre un reçu" ouvre le sélecteur de fichier natif
- Les fichiers sont affichés sous forme de badges cliquables (ouverture dans un nouvel onglet)
- ⚠️ **Note** : L'upload est simulé (ObjectURL local), les fichiers ne sont pas persistés en base

### 4.5 Export Excel

| Bouton | Comportement |
|--------|-------------|
| **Export Global** | Exporte toutes les lignes (dépenses + revenus) |
| **Export FSDIE** | Exporte uniquement les revenus + les dépenses marquées "Éligible FSDIE" |

- Le fichier généré est un `.xlsx` formaté avec couleurs, sous-totaux par catégorie et ligne TOTAL
- Colonnes : Catégorie | Libellé | Montant (dépenses à gauche, revenus à droite)

---

## 5. Module Participants

> Accessible via l'onglet "Participants" de la page détail d'un événement.

### 5.1 Liste des inscrits

- Affiche la liste des membres inscrits à l'événement
- Informations affichées : Prénom/Nom, Email, Taille de T-shirt, Allergies, Statuts documentaires (certificat, décharge, droit à l'image), Date d'inscription, Acompte versé

### 5.2 Inscription d'un membre

- Un champ de recherche permet de chercher un membre dans l'annuaire
- La recherche filtre par prénom, nom ou email (en temps réel, max 5 résultats)
- Les membres déjà inscrits à l'événement sont exclus des résultats
- Sélectionner un membre puis cliquer "Inscrire" l'ajoute à l'événement

### 5.3 Désinscription

- Un bouton de suppression avec confirmation permet de désinscrire un membre

---

## 6. Module Membres (Annuaire)

> Page `/members`

### 6.1 Liste des membres

- Affiche tous les membres de l'association sous forme de cartes
- Champ de **recherche** par prénom, nom ou email

### 6.2 Fiche membre

- Cliquer sur un membre ouvre un **panneau latéral** (ou modal) de détail/édition
- Informations affichées et modifiables : Prénom, Nom, Email, Taille de T-shirt, Allergies, Statuts administratifs (3 cases à cocher)

### 6.3 Création d'un membre

- Bouton "Ajouter un membre" ouvre le même panneau avec les champs vides

### 6.4 Gestion des allergies

- Les allergies sont saisies comme une liste dynamique d'inputs (ajout/suppression individuel)
- Elles sont stockées en BDD sous forme d'une chaîne séparée par des virgules

### 6.5 Pièces jointes membres (GED)

- Chaque membre peut avoir des documents joints (certificat médical, décharge, consentement parental)
- Le type de document est demandé via une invite
- ⚠️ **Note** : Upload simulé, non persisté en BDD

---

## 7. Navigation et layout

- L'application dispose d'un **menu de navigation latéral** (sidebar) accessible depuis toutes les pages authentifiées
- Liens de navigation : **Événements**, **Membres**, **Paramètres**
- Un bouton de **déconnexion** est présent dans la sidebar

---

## 8. Règles de gestion

| # | Règle |
|---|-------|
| RG-01 | Un membre ne peut être inscrit qu'une seule fois à un même événement |
| RG-02 | Une ligne de budget est obligatoirement liée à un événement |
| RG-03 | Le type d'une ligne de budget est soit `REVENUE` soit `EXPENSE` |
| RG-04 | Les lignes REVENUE sont toujours incluses dans l'export FSDIE |
| RG-05 | Les dépenses ne sont incluses dans l'export FSDIE que si `is_fsdie_eligible = true` |
| RG-06 | La session utilisateur expire après 24h |
| RG-07 | La recherche de membres dans les participants exclut les déjà inscrits |
| RG-08 | La suppression d'un événement entraîne la suppression en cascade de ses inscriptions et lignes de budget |

---

## 9. Limites et points non implémentés (état du prototype)

| Fonctionnalité | État |
|----------------|------|
| Authentification JWT complète (frontend ↔ backend) | ❌ Non connectée |
| Upload réel de pièces jointes en BDD | ❌ Simulé (ObjectURL) |
| Import de budget depuis CSV/Excel | ❌ Bouton présent mais non fonctionnel |
| Modification / suppression d'un événement | ❌ Non implémenté |
| Suppression d'un membre | ❌ Non implémenté |
| Page Paramètres (`/settings`) | ⚠️ Route déclarée mais contenu non visible |
| Gestion de rôles (admin vs membre) | ❌ Non implémentée |
| Pagination | ❌ Absente |

---

## 10. Stratégie de Qualité et Tests Automatisés (TUF / TUT)

Pour certifier la robustesse des fonctionnalités (notamment la gestion du Budget FSDIE et du Tableau de Bord), l'application est couverte par une suite de tests fonctionnels :

### 10.1 Scénarios Utilisateurs End-to-End (TUT)
Un automate navigue "réellement" sur l'interface pour simuler un administrateur. Le parcours validé systématiquement inclut :
1. La connexion réussie à la plateforme
2. La navigation vers la liste des événements et l'affichage des détails
3. La création asynchrone d'une ligne de dépense FSDIE complète ("Logistique Playwright")

### 10.2 Validation des Algorithmes Métiers (TUF / TR)
Les règles de gestion internes sont validées sur une base de test isolée :
- **Authentification** : Refus strict d'accès (Code HTTP 401) si les bons identifiants ne sont pas fournis à l'API.
- **Statistiques** : Validation mathématique de l'algorithme du Dashboard Component garantissant la sélection du « prochain événement à venir » parmi tous les événements (filtrage des événements du passé).
