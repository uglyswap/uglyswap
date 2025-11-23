# Prompt SaaS

Un SaaS de generation de contenu IA avec templates configurables et panel admin complet.

## Fonctionnalites

- **Panel Admin complet**
  - Gestion des cles API (OpenRouter, Stripe)
  - Synchronisation des modeles IA depuis OpenRouter
  - Creation de templates avec variables dynamiques
  - Gestion des plans tarifaires

- **Interface Utilisateur**
  - Authentification (inscription/connexion)
  - Dashboard avec templates disponibles
  - Generation de contenu avec choix du modele IA
  - Historique des generations
  - Systeme de credits

- **Paiements**
  - Integration Stripe
  - Abonnements mensuels
  - Webhooks pour mise a jour automatique

## Stack Technique

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **IA**: OpenRouter API
- **Paiements**: Stripe

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/yourusername/prompt-saas.git
cd prompt-saas
npm install
```

### 2. Configuration Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Executer le script `supabase-schema.sql` dans l'editeur SQL
3. Copier les cles API

### 3. Variables d'environnement

Copier `.env.example` vers `.env.local` et remplir :

```bash
cp .env.example .env.local
```

### 4. Demarrer

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Configuration Initiale

1. Connectez-vous au panel admin (`/admin`)
2. Allez dans **Parametres** et ajoutez vos cles API
3. Synchronisez les modeles depuis OpenRouter
4. Activez les modeles souhaites
5. Creez votre premier template

## Licence

MIT
