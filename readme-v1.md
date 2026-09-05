# Trello Fullstack â€” V1 Learning & Setup Log

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
â”‚
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ frontend/
â”‚   â””â”€â”€ backend/
â”‚
â””â”€â”€ packages/
    â””â”€â”€ db/
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
       â†“
User exists? â”€â”€ Yes â†’ userId linked
       â”‚
       No
       â†“
userId = null
       â†“
User signs up
       â†“
Pending invitation linked using email
       â†“
User accepts
       â†“
Membership created
```

> apps/backend/

â”œâ”€â”€ index.ts
â”œâ”€â”€ routes/
â”œâ”€â”€ controllers/
â”œâ”€â”€ middlewares/
â””â”€â”€ types/
    â””â”€â”€ express.d.ts

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
- `PATCH /api/issues/:issueId/move` â€” move issue to a different section
- `POST /api/issues/:issueId/assignees` â€” assign a member to an issue
- `DELETE /api/issues/:issueId/assignees/:userId` â€” unassign

### Comments
- `POST /api/issues/:issueId/comments`
- `PUT /api/comments/:commentId`
- `DELETE /api/comments/:commentId`
- Only the comment author can edit or delete their own comment.

### Membership
- `GET /api/organizations/:organizationId/members`
- `DELETE /api/organizations/:organizationId/members/:membershipId` â€” admin only
- `DELETE /api/organizations/:organizationId/leave` â€” user leaves themselves
- Last admin is protected from being removed or leaving.

## Backend folder structure

```text
apps/backend/
â”‚
â”œâ”€â”€ app.ts
â”œâ”€â”€ index.ts
â”‚
â”œâ”€â”€ controllers/
â”‚   â”œâ”€â”€ auth.controller.ts
â”‚   â”œâ”€â”€ board.controller.ts
â”‚   â”œâ”€â”€ comment.controller.ts
â”‚   â”œâ”€â”€ invitation.controller.ts
â”‚   â”œâ”€â”€ issue.controller.ts
â”‚   â”œâ”€â”€ membership.controller.ts
â”‚   â”œâ”€â”€ organization.controller.ts
â”‚   â””â”€â”€ section.controller.ts
â”‚
â”œâ”€â”€ routes/
â”‚   â”œâ”€â”€ auth.routes.ts
â”‚   â”œâ”€â”€ board.routes.ts
â”‚   â”œâ”€â”€ comment.routes.ts
â”‚   â”œâ”€â”€ invitation.routes.ts
â”‚   â”œâ”€â”€ issue.routes.ts
â”‚   â”œâ”€â”€ membership.routes.ts
â”‚   â”œâ”€â”€ organization.routes.ts
â”‚   â””â”€â”€ section.routes.ts
â”‚
â”œâ”€â”€ middleware/
â”‚   â””â”€â”€ auth.middleware.ts
â”‚
â”œâ”€â”€ types/
â”‚   â””â”€â”€ express.d.ts
â”‚
â””â”€â”€ tests/
    â””â”€â”€ api.test.ts
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
âœ… Signup
âœ… Signin
âœ… Create Organization
âœ… Get Organizations
âœ… Create Board
âœ… Get Boards
âœ… Update Board
âœ… Create Section
âœ… Create Second Section
âœ… Get Sections
âœ… Update Section
âœ… Create Issue
âœ… Get Issues
âœ… Get Issue by ID
âœ… Update Issue
âœ… Move Issue to another Section
âœ… Create Comment
âœ… Update Comment
âœ… Delete Comment
âœ… Get Members
âœ… Signup second user (for invitation test)
âœ… Signin second user
âœ… Send Invitation (admin invites existing user)
âœ… Get My Invitations (as second user)
âœ… Accept Invitation (as second user)
âœ… Send Invitation to non-existing user
âœ… Delete Issue
âœ… Delete Section
âœ… Delete Board
âœ… Delete Organization

30 pass, 0 fail
```

## Key design decisions

- `order` fields use multiples of 1000 to allow items to be inserted between existing ones without renumbering.
- Invitation `userId` is `null` when the invited email is not yet registered. On signup, pending invitations are linked by email automatically.
- All protected routes require `Authorization: Bearer <token>`.
- Comments can only be edited/deleted by their author.
- The last admin of an organization cannot be removed or leave.
- Prisma transactions are used when multiple DB writes must succeed together (e.g. accept invitation â†’ create membership + update invitation status).
---

# DAY 3 / CHECKPOINT — WebSocket, Fullstack Frontend & Role Authorization

**Date:** 06 September 2026 02:32 IST

**Current stage:**

Fullstack MVP complete with Real-time WebSocket Multi-tab Presence, Clean Dark Monochromatic Frontend, Role-Based Access Control (Admin vs Member), and Compulsory Comment Audit Trail for Issue Movement.

---

## 1. What was built & accomplished

### A. WebSocket Server (`apps/websocket`)
- Built a standalone WebSocket server using `ws` on port `3002`.
- Architecture:
  - `ROOMS` in-memory map keyed by `boardId -> [{ username, socket }]`.
  - Supports multiple tabs per user (each tab creates an independent connection).
  - Handles `join`, `initial_state`, and `leave` events.
- **Multi-tab Presence Deduplication**:
  - If a user opens the same board in 2 or more tabs, the server only notifies other peers once.
  - Senders receive only unique peer usernames on `initial_state`.
  - The `leave` event is only broadcast when a user closes *all* active tabs for that board.

### B. Database & Schema Enhancements (`packages/db`)
- Added unique `username` field to the `User` model in `schema.prisma`.
- Synchronized schema with Neon PostgreSQL (`bun prisma db push`).
- Generated updated Prisma Client types (`bun prisma generate`).
- Created a comprehensive seed script (`seed.ts`):
  - 8 seeded user accounts (1 Admin: `@alice`, 7 Members: `@bob`, `@charlie`, `@dan`, `@emma`, `@frank`, `@grace`, `@henry`). Password for all: `password123`.
  - Created organization `Project Alpha`.
  - 4 complete boards: **Frontend Dev**, **Backend Dev**, **UI Design**, and **DevOps**.
  - Populated each board with **Todo**, **In Progress**, and **Done** sections, realistic issues, and initial activity comments.

### C. Backend API Improvements (`apps/backend`)
- **CORS Support**: Added `cors` middleware enabling requests from Vite frontend (`http://localhost:5173`).
- **Auth Updates**:
  - `POST /api/auth/signup`: Accepts `email`, `password`, and `username`.
  - `POST /api/auth/signin`: Returns JWT token, `username`, and `email`.
  - `GET /api/auth/me`: Returns the authenticated user profile.
- **Board Controller**:
  - `GET /api/boards/:boardId`: Returns board information along with the requesting user’s organization role (`ADMIN` or `MEMBER`).
  - `POST /api/organizations/:organizationId/boards`: Enforced strictly for `ADMIN` role only (returns `403` for members).
- **Section Controller**:
  - `POST /api/boards/:boardId/sections`: Only `ADMIN` can create sections.
  - `DELETE /api/sections/:sectionId`: Only `ADMIN` can delete sections.
- **Issue Controller & Move Issue Fix**:
  - **Fixed 32-bit Integer Overflow**: Moving issues previously attempted `order: Date.now()` which exceeded PostgreSQL's 32-bit signed integer limit (`2,147,483,647`), causing database error `P2020`. Fixed with safe calculated sequence ordering.
  - **Compulsory Comment on Move**: Moving an issue from one section to another strictly requires a non-empty comment. The endpoint automatically records this comment into the issue's activity history within a Prisma transaction: `[Moved to <Section>] <reason>`.
  - **Delete Issue**: Restricted to `ADMIN` role only.
  - **Add Issue**: Open to all organization members and admins.
- **Comment Duplicate Prevention**:
  - Added loading and disabled states (`posting...`) on the frontend to prevent rapid multi-clicks from generating duplicate comments.

### D. Frontend Implementation (`apps/frontend`)
- Scaffolded using Vite, React 19, TypeScript, and React Router v7.
- **Aesthetic Philosophy**: Strict minimalist black-and-white monospace design. No AI-cliché gradients or generic component libraries. Custom CSS custom properties (`#0a0a0a` background, `#111` surface, `#2a2a2a` borders, `#e8e8e8` text).
- **Components & Pages**:
  - `Navbar.tsx`: Sticky top header with clickable `trello` home link, hierarchical breadcrumbs (`organizations / Project Alpha / Frontend Dev`), user avatar with initials, `@username`, and `sign out` button.
  - `AuthPage.tsx`: Tabbed Sign In / Sign Up interface supporting username registration.
  - `OrgsPage.tsx`: List of organizations with user role badge (`admin` / `member`) and org creation.
  - `OrgPage.tsx`: Organization dashboard displaying boards, member directory, and member invitation form. The `+ board` button is only rendered for Admins.
  - `BoardPage.tsx`:
    - Full Kanban board with horizontal scrolling columns.
    - Top bar integrates real-time presence indicators: circular avatars showing 2-letter uppercase initials, with native hover tooltip showing full `@username`.
    - Deduplication: Self is shown once, and each unique online peer is shown once with total count.
    - Role-based permissions: Members do not see `+ section`, column delete buttons (`×`), or issue delete buttons.
    - **Issue Details Drawer**: Allows inline editing of title and description, section move dropdown with compulsory comment textarea, activity history, and comment posting with loading state.

---

## 2. Test Accounts for Inspection

All accounts share the password: `password123`

| Email | Username | Role | Permissions |
|---|---|---|---|
| `alice@dev.com` | `@alice` | **ADMIN** | Full permissions (add/delete boards, sections, and issues) |
| `bob@dev.com` | `@bob` | **MEMBER** | Add issues, move issues (compulsory comment), add comments |
| `charlie@dev.com` | `@charlie` | **MEMBER** | Team member |
| `dan@dev.com` | `@dan` | **MEMBER** | Team member |
| `emma@dev.com` | `@emma` | **MEMBER** | Team member |
| `frank@dev.com` | `@frank` | **MEMBER** | Team member |
| `grace@dev.com` | `@grace` | **MEMBER** | Team member |
| `henry@dev.com` | `@henry` | **MEMBER** | Team member |

---

## 3. Verification & Automated E2E Testing

All features were verified with automated integration and end-to-end browser tests using Playwright Core:
- ? Sign in and dynamic navigation bar with `@username`.
- ? Member Bob blocked from seeing `+ board`, `+ section`, column delete, and issue delete.
- ? Moving issue without a comment rejected with `400 Bad Request`.
- ? Moving issue with comment successfully updates section and logs activity with `[Moved to <Section>]`.
- ? Double-click protection verified on comment submissions.
- ? Multi-tab deduplication verified (Bob in 2 tabs shows 1 online; Charlie joining updates to 2 online).
