# Koacha

Application de coaching personnel IA. Définis tes objectifs, tiens un journal quotidien et reçois un feedback personnalisé de Claude.

## Stack

- **Next.js 14** (App Router)
- **Netlify** (déploiement)
- **Neon PostgreSQL** (via `DATABASE_URL` ; connexion TCP avec `pg` pour éviter les échecs `fetch` du driver HTTP sur Netlify)
- **Drizzle ORM**
- **Better Auth** (email / mot de passe)
- **Anthropic** (Claude) pour le coaching
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** (graphiques)

## Démarrage en local

1. Cloner et installer les dépendances :

   ```bash
   cd documents/koacha
   npm install
   ```

2. Créer un fichier `.env` à la racine (voir `.env.example`) :

   - `DATABASE_URL` : chaîne de connexion PostgreSQL (ex. Neon)
   - `BETTER_AUTH_SECRET` : secret d’au moins 32 caractères
   - `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` : ex. `http://localhost:3000`
   - `ANTHROPIC_API_KEY` : clé API Anthropic

3. Appliquer les migrations Drizzle :

   ```bash
   npm run db:generate   # génère les migrations (si besoin)
   npm run db:migrate    # applique les migrations
   ```

4. Lancer le serveur :

   ```bash
   npm run dev
   ```

Ouvre [http://localhost:3000](http://localhost:3000).

## Déploiement Netlify

- Connecte le repo à Netlify.
- Netlify injecte automatiquement `DATABASE_URL` si Netlify DB (Neon) est activé.
- Utilise de préférence la chaîne **pooled** Neon (hôte `…-pooler…`) pour les fonctions serverless ; vérifie que `DATABASE_URL` est bien définie pour l’environnement **Production** (et les preview si besoin).
- Configure dans Netlify : `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (URL publique du site, ex. `https://ton-site.netlify.app`), `NEXT_PUBLIC_APP_URL`, `ANTHROPIC_API_KEY`.
- Build : `npm run build`, publish : `.next` (géré par le plugin Next.js).

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build production
- `npm run start` — serveur production
- `npm run db:generate` — génère les migrations Drizzle
- `npm run db:migrate` — applique les migrations
- `npm run db:studio` — Drizzle Studio (exploration BDD)
