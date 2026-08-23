# Trello Fullstack — V1 Learning & Setup Log

> Personal revision/documentation file.
>
> This document records what I have done, what I learned, why I did it,
> commands used, errors encountered, and the project state at each checkpoint.

---

# Project

**Project:** Trello Fullstack

**Version:** v1

**Architecture:** Monorepo

**Main technologies currently being learned:**

- Bun
- Turborepo
- Prisma
- PostgreSQL
- Neon
- TypeScript
- Bun Workspaces

---

# V1 Checkpoint
 
**Date:** 23 August 2026 16.03

**Current stage:**

Monorepo + Database + Prisma + Backend package setup.

At this point:

- Bun is working
- Turborepo project exists
- `packages/db` exists
- Prisma is configured
- Neon PostgreSQL is connected
- User model is created
- Database migration is done
- Prisma Client is generated
- Backend package exists
- Backend can import the local `db` package
- Prisma Client successfully loads from the backend

---

# 1. Understanding the Monorepo

Before starting Prisma, I learned what a monorepo actually means.

A monorepo means:

> Multiple applications/packages are maintained inside one Git repository.

Example:

```text
trello-fullstack-v1/
│
├── apps/
│   ├── frontend/
│   └── backend/
│
└── packages/
    └── db/