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
- Express
- JWT / bcrypt

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
```



# DAY 2

> Schema / Database

    - comments new table
    - pending req new table
    - add status tp membership table
    
> Backend
    POST /signin
    POST /signup
    POST /organization
    GET /boards
    POST /board
    DELETE /board
    DELETE /organization
    POST /invite {email: "harkirat@gmail.com", orgId: 1} -- email
    POST /accept {orgId: 1}
    PUT POST /section
    POST /issue
    GET /sections
    GET /issues
    GET /issue/:issueId
    DELETE /issue/:issueId
    DELETE /section
    DELETE /membership -- {userId: 1, orgId: 2}
    PUT /board
    PUT /issue
    POST DELETE PUT /comment
    PUT /issue/move
    GET /organizations   
    

## Schema / Database

- Added `Comments` table.
- Added `OrganizationJoinRequest` table.
- Added `Role` enum: `ADMIN`, `MEMBER`.
- Added invitation `RequestStatus`: `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`.
- Added organization membership relationships.
- Added indexes and unique constraints.
- Added `onDelete: Cascade` where required.

## Backend

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- JWT authentication middleware.
- Added `req.userId` using Express Request type augmentation.

### Organizations
- `POST /api/organizations`
- `GET /api/organizations`
- `DELETE /api/organizations/:organizationId`
- Organization creator automatically becomes `ADMIN`.
- Only organization admins can delete organizations.

### Invitations
- `POST /api/organizations/:organizationId/invitations`
- `GET /api/invitations`
- `PATCH /api/invitations/:requestId`

Invitation flow:

```text
Admin invites user
       ↓
User exists? ── Yes → userId linked
       │
       No
       ↓
userId = null
       ↓
User signs up
       ↓
Pending invitation linked using email
       ↓
User accepts
       ↓
Membership created
```

> apps/backend/

├── index.ts
├── routes/
├── controllers/
├── middlewares/
└── types/
    └── express.d.ts

---

# DAY 3

**Date:** 30 August 2026

**Current stage:**

Full backend V1 complete. All APIs implemented and tested with automated integration tests.

## What was implemented

### Boards
- `POST /api/organizations/:organizationId/boards`
- `GET /api/organizations/:organizationId/boards`
- `PUT /api/organizations/:organizationId/boards/:boardId`
- `DELETE /api/organizations/:organizationId/boards/:boardId`
- Membership check: only org members can create/read/update/delete boards.

### Sections
- `POST /api/boards/:boardId/sections`
- `GET /api/boards/:boardId/sections`
- `PUT /api/sections/:sectionId`
- `DELETE /api/sections/:sectionId`
- Sections auto-assign `order` using increments of 1000 (easy reorder).

### Issues
- `POST /api/boards/:boardId/sections/:sectionId/issues`
- `GET /api/boards/:boardId/issues`
- `GET /api/issues/:issueId`
- `PUT /api/issues/:issueId`
- `DELETE /api/issues/:issueId`
- `PATCH /api/issues/:issueId/move` — move issue to a different section
- `POST /api/issues/:issueId/assignees` — assign a member to an issue
- `DELETE /api/issues/:issueId/assignees/:userId` — unassign

### Comments
- `POST /api/issues/:issueId/comments`
- `PUT /api/comments/:commentId`
- `DELETE /api/comments/:commentId`
- Only the comment author can edit or delete their own comment.

### Membership
- `GET /api/organizations/:organizationId/members`
- `DELETE /api/organizations/:organizationId/members/:membershipId` — admin only
- `DELETE /api/organizations/:organizationId/leave` — user leaves themselves
- Last admin is protected from being removed or leaving.

## Backend folder structure

```text
apps/backend/
│
├── app.ts
├── index.ts
│
├── controllers/
│   ├── auth.controller.ts
│   ├── board.controller.ts
│   ├── comment.controller.ts
│   ├── invitation.controller.ts
│   ├── issue.controller.ts
│   ├── membership.controller.ts
│   ├── organization.controller.ts
│   └── section.controller.ts
│
├── routes/
│   ├── auth.routes.ts
│   ├── board.routes.ts
│   ├── comment.routes.ts
│   ├── invitation.routes.ts
│   ├── issue.routes.ts
│   ├── membership.routes.ts
│   ├── organization.routes.ts
│   └── section.routes.ts
│
├── middleware/
│   └── auth.middleware.ts
│
├── types/
│   └── express.d.ts
│
└── tests/
    └── api.test.ts
```

## Integration Tests

All APIs are tested automatically using `bun test`.

The test file starts its own Express server on a random port so no external server is needed.

Run with:

```bash
bun test
```

Test results (30 tests, 0 failures):

```
✅ Signup
✅ Signin
✅ Create Organization
✅ Get Organizations
✅ Create Board
✅ Get Boards
✅ Update Board
✅ Create Section
✅ Create Second Section
✅ Get Sections
✅ Update Section
✅ Create Issue
✅ Get Issues
✅ Get Issue by ID
✅ Update Issue
✅ Move Issue to another Section
✅ Create Comment
✅ Update Comment
✅ Delete Comment
✅ Get Members
✅ Signup second user (for invitation test)
✅ Signin second user
✅ Send Invitation (admin invites existing user)
✅ Get My Invitations (as second user)
✅ Accept Invitation (as second user)
✅ Send Invitation to non-existing user
✅ Delete Issue
✅ Delete Section
✅ Delete Board
✅ Delete Organization

30 pass, 0 fail
```

## Key design decisions

- `order` fields use multiples of 1000 to allow items to be inserted between existing ones without renumbering.
- Invitation `userId` is `null` when the invited email is not yet registered. On signup, pending invitations are linked by email automatically.
- All protected routes require `Authorization: Bearer <token>`.
- Comments can only be edited/deleted by their author.
- The last admin of an organization cannot be removed or leave.
- Prisma transactions are used when multiple DB writes must succeed together (e.g. accept invitation → create membership + update invitation status).