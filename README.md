# ruido platform

A Next.js 14 application delivering the creator → upload → library → play loop with authentication, Prisma/Postgres, S3-compatible storage, search, and analytics.

## Getting started

1. Install dependencies

```bash
npm install
```

2. Copy the environment template and fill in values

```bash
cp .env.example .env
```

Populate `.env` with your database connection, NextAuth secrets, and S3-compatible storage credentials.

3. Apply database schema and seed demo data

```bash
npx prisma migrate deploy
npx prisma db seed
```

4. Run the development server

```bash
npm run dev
```

Visit http://localhost:3000.

### Available scripts

- `npm run dev` – start Next.js in development mode.
- `npm run build` – create a production build.
- `npm run start` – run the production build.
- `npm run lint` – run ESLint.
- `npm run test` – execute Vitest unit tests.
- `npm run test:e2e` – run Playwright end-to-end tests.
- `npm run prisma:migrate` – deploy Prisma migrations.
- `npm run prisma:generate` – regenerate the Prisma Client.
- `npm run prisma:seed` – seed the database.

## Project structure

- `src/app` – Next.js app router pages and API routes.
- `src/components` – UI and interactive components.
- `src/lib` – utilities (Prisma client, auth, search helpers, storage, etc.).
- `prisma` – Prisma schema, migrations, and seeds.
- `tests` – Vitest unit tests and Playwright e2e specs.

## CI

GitHub Actions workflow `.github/workflows/ci.yml` checks formatting, runs linting, type checking, Prisma validation, unit tests, and a headless Next.js build.

## Demo data

The seed script provisions a demo creator profile with five futuristic tracks tagged for search. Use `demo@ruido.dev` to sign in via magic link.
