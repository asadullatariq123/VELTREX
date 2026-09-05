# VELTREX Backend — Step 1 Foundation

This directory contains the foundational Node.js, Express, TypeScript, and Prisma setup for the VELTREX Geospatial Landslide Intelligence Platform backend.

## Environment Variables

Configured via `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/veltrex?schema=public"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=veltrex_super_secret_jwt_key_sih2026_production
```

## Available Scripts

- `npm run dev`: Runs the development server with live reload.
- `npm run build`: Compiles TypeScript to `dist/`.
- `npm run start`: Runs compiled production build from `dist/server.js`.
- `npm run prisma:generate`: Generates Prisma Client.
- `npm run prisma:migrate`: Pushes database schema to PostgreSQL.
- `npm run prisma:studio`: Launches Prisma Studio GUI.

## Core Endpoints

- `GET /api/v1`: Root info API.
- `GET /api/v1/health`: Health status & PostgreSQL connection check.
