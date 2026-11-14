# CampusFlow

Plateforme web pour étudiants : suivi de progression par chapitre, organisation des
révisions et partage de ressources.

## Choix des technologies

| Partie | Technologie | Pourquoi |
|---|---|---|
| Frontend | **Angular 22** | Framework structuré (composants standalone, routeur, formulaires réactifs, signaux), adapté à une application multi-pages. |
| Backend | **NestJS** | Architecture modulaire, TypeScript comme le frontend, validation et documentation Swagger intégrées. |
| Base de données | **PostgreSQL 17 + Prisma** | Base relationnelle fiable, schéma typé et migrations avec Prisma. |
| Authentification | **JWT + bcrypt** | Connexion sans session serveur, mots de passe hachés. |

Un seul langage (TypeScript) pour tout le projet, ce qui simplifie le développement.

## Fonctionnalités développées

- **Page d'accueil** publique (présentation de la plateforme)
- **Inscription** avec indicateur de force du mot de passe et confirmation
- **Connexion** avec jeton JWT et déconnexion automatique à l'expiration
- **Routes protégées** (garde d'authentification) et rôles `STUDENT` / `ADMIN` côté API
- **Tableau de bord** : progression globale, moyenne par matière, chapitres à réviser en priorité
- **Matières personnelles** : chaque étudiant crée ses propres matières et chapitres et indique son niveau (Pas vu → Maîtrisé). Un nouveau compte démarre vide.
- **Profil** : nom, filière, niveau, heures d'étude par semaine, disponibilité
- **API documentée** avec Swagger : `http://localhost:3000/api/docs`

Le schéma de la base prévoit aussi les ressources, groupes d'étude, planning et quiz IA,
qui seront développés dans une prochaine version.

## Structure

```
CampusFlow/
├── backend/    API NestJS + Prisma
└── frontend/   Application Angular
```

## Lancement du projet

### Prérequis
- Node.js (version LTS récente)
- PostgreSQL 17 (ou Docker avec `docker-compose.yml`)
- Angular CLI : `npm install -g @angular/cli`

### 1. Base de données

Dans `psql` (connecté en `postgres`) :

```sql
CREATE USER campusflow WITH PASSWORD 'campusflow';
CREATE DATABASE campusflow OWNER campusflow;
ALTER USER campusflow CREATEDB;
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # sous Windows : copy .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npx tsx prisma/seed.ts      # crée le compte administrateur
npm run start:dev
```

L'API tourne sur `http://localhost:3000/api` (Swagger : `/api/docs`, test : `/api/health`).

### 3. Frontend

Dans un second terminal :

```bash
cd frontend
npm install
ng serve
```

Ouvrir `http://localhost:4200`.

## Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@campus.tn` | `Admin12345` |
| Étudiant | à créer via la page d'inscription | |

## Variables d'environnement (`backend/.env`)

Voir `backend/.env.example` : `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`JWT_EXPIRES_IN_SECONDS`, `FRONTEND_URL`. Les variables `OLLAMA_*` sont prévues pour
l'assistant IA (à venir).

## Auteur

Projet réalisé dans le cadre du cours de développement web.