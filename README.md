# Trello Fullstack — V1

A fullstack collaborative project management application built with a Bun-powered Turborepo monorepo, Express REST API, Prisma with Neon PostgreSQL, real-time WebSocket presence server, and a minimalist black-and-white React frontend.

> Detailed day-by-day learning logs and design decisions are maintained in [**`readme-v1.md`**](./readme-v1.md).

---

## ??? Architecture & Monorepo Structure

```text
trello-fullstack-v1/
+-- apps/
¦   +-- frontend/     # React 19 + TypeScript + Vite + React Router v7 (Port 5173)
¦   +-- backend/      # Express 5 REST API + JWT + Prisma (Port 3000)
¦   +-- websocket/    # Standalone WebSocket server for presence (Port 3002)
+-- packages/
    +-- db/           # Prisma client and PostgreSQL schema (Neon serverless)
    +-- ui/           # Shared UI stub components
    +-- eslint-config/# ESLint presets
    +-- typescript-config/ # Monorepo tsconfigs
```

---

## ? Features

- **Real-Time Presence**:
  - WebSocket-powered active member avatars with initials.
  - Multi-tab presence deduplication (opening multiple tabs as the same user shows only 1 avatar).
- **Role-Based Access Control**:
  - **Admin**: Create/delete boards, create/delete sections, delete issues, invite members.
  - **Member**: Create issues, post comments, move issues with compulsory comments.
- **Compulsory Move Comments**:
  - Moving an issue across sections strictly requires a comment explaining the move, providing an automatic audit trail.
- **Minimalist Aesthetic**:
  - Dark monochrome palette (`#0a0a0a`, `#111`, `#2a2a2a`) with monospace typography.
  - Zero bloated component libraries; responsive and fast.
- **Duplicate Prevention**:
  - Loading states on comment submissions to prevent accidental duplicate posts.

---

## ?? Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Database & Seed Data
```bash
# Push Prisma schema to Neon PostgreSQL
bun --filter db prisma db push

# Seed initial organization (Project Alpha), 4 boards, sections, and 8 users
bun run packages/db/seed.ts
```

### 3. Run Development Servers
```bash
# Terminal 1 — Backend API (port 3000)
cd apps/backend && bun --watch index.ts

# Terminal 2 — WebSocket Server (port 3002)
cd apps/websocket && bun --watch index.ts

# Terminal 3 — Frontend UI (port 5173)
cd apps/frontend && bun run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## ?? Seeded Test Accounts

**Password for all accounts:** `password123`

- **Admin:** `alice@dev.com` (`@alice`)
- **Members:** `bob@dev.com`, `charlie@dev.com`, `dan@dev.com`, `emma@dev.com`, `frank@dev.com`, `grace@dev.com`, `henry@dev.com`
