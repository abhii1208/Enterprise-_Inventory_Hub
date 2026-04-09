<<<<<<< HEAD
# Inventory Hub

Inventory Hub is a secure internal inventory search application with admin-managed users, Excel-based inventory imports, audit visibility, and a polished enterprise UI.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT in HTTP-only cookie
- Excel import: `xlsx`

## Project Structure

```text
.
|-- client
|   |-- src
|   |   |-- api
|   |   |-- app
|   |   |-- components
|   |   |-- features
|   |   |-- lib
|   |   |-- pages
|   |   `-- routes
|-- server
|   |-- prisma
|   |-- src
|   |   |-- config
|   |   |-- controllers
|   |   |-- middleware
|   |   |-- routes
|   |   |-- services
|   |   |-- types
|   |   `-- utils
|   |-- temp
|   `-- uploads
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env files:

   ```bash
   copy server\.env.example server\.env
   copy client\.env.example client\.env
   ```

3. Create a PostgreSQL database and update `server/.env`.

4. Generate Prisma client and run migrations:

   ```bash
   npm run prisma:generate --workspace server
   npm run prisma:migrate --workspace server
   ```

5. Optional seed step:

   ```bash
   npm run seed
   ```

   This does not create a default admin. The app is designed so the first admin registers one time from the login screen when the system is empty.

6. Start the apps:

   ```bash
   npm run dev:server
   npm run dev:client
   ```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:4000`.

## First Admin Registration

On a fresh database, the login page automatically switches to one-time admin registration mode.

1. Open the app.
2. Register the first admin.
3. Sign in with that admin account.
4. Create all later users from the admin panel.

## Key Features

- Admin and user role-based authentication
- One-time bootstrap registration for the first admin only
- Admin user lifecycle management
- Secure Excel upload with preview and replace-master import flow
- Inventory SKU search with premium result cards and image fallback
- Dashboard metrics, import history, and audit logs
- Rate-limited login and consistent API error handling

## Import Expectations

Accepted columns:

- `Sku Code`
- `Item Name`
- `Shelf`
- `Type`
- `Qty`
- `Size`
- `Color`
- `Image`

The importer trims values, ignores blank rows, validates image URLs, reports row-level errors, and replaces the active master inventory in a transaction when committed.
=======
# Enterprise-_Inventory_Hub
>>>>>>> 6dda819099f4bbc292b270b9f08aa0e7e357b056
