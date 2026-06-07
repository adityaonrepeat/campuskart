# CampusKart — Architecture

> For the full detailed version (data flows, rate limits, debugging lessons) see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## System diagram

```
                    ┌──────────────────────────────────────────┐
   Browser ───────▶ │  Next.js 16 app (Vercel, serverless)     │
   (React 19)       │  • App Router RSC pages                  │
        │           │  • Route Handlers (reads → React Query)  │──▶ Neon Postgres (Prisma)
        │           │  • Server Actions (mutations)            │──▶ UploadThing (image storage)
        │           │  • Better Auth (email/password)          │──▶ Sightengine (image moderation)
        │           └──────────────────────────────────────────┘   Upstash Redis (rate limits)
        │ WebSocket (cookie auth)
        ▼
   ┌──────────────────────────────────────┐
   │  Socket.IO server (Render, stateful) │──▶ Neon Postgres (own Prisma client)
   │  • in-memory presence maps           │──▶ validates session via Next.js /api/auth/get-session
   │  • real-time messages + typing       │──▶ Upstash Redis (message rate limit)
   └──────────────────────────────────────┘
```

Two deploy targets because Vercel is serverless and cannot hold long-lived WebSocket connections.

---

## Data-access rules (strict)

| Operation | Where |
|-----------|-------|
| Reads (lists, details, pagination) | `src/app/api/**` Route Handlers, called by React Query v5 |
| Mutations (create, update, delete) | `src/actions/**` Server Actions, return `ApiResponse<T>` |
| Real-time (messages, typing, presence) | Socket.IO events only — never HTTP |

---

## Security invariants

**College scoping** — `collegeId` is always taken from `session.user.collegeId`, never from the client payload. It is denormalized onto `Listing`, `Store`, and `Conversation` for query performance. Detail handlers return 404 on college mismatch.

**Socket sender trust** — `senderId` is never accepted from the socket client payload. The socket server sets `socket.data.userId` during handshake validation and uses that exclusively.

**Image moderation** — Sightengine check runs synchronously inside the create/update Server Action, before any DB write. A flagged image deletes the UploadThing file and returns `IMAGE_FLAGGED`. A provider error returns `MODERATION_UNAVAILABLE` (fail closed — listing not created, files kept for retry).

**Sold listing guard** — `POST /api/conversations` returns `409 LISTING_NOT_ACTIVE` if the listing is not `ACTIVE`. Contacting a seller about a sold item is blocked.

---

## Database models

```
User            — auth fields + username + collegeId + role (USER/MODERATOR/ADMIN)
College         — id, name, city, state
Session         — Better Auth managed
Account         — Better Auth managed
Verification    — Better Auth managed

Listing         — title, price, images[], category, condition, status (ACTIVE/SOLD/ARCHIVED),
                  listingType (FIXED_PRICE/NEGOTIABLE), sellerId, collegeId, storeId?
Conversation    — listingId?, storeId?, collegeId, lastMessageAt
ConversationParticipant — conversationId, userId, lastReadAt?, hiddenAt?
Message         — conversationId, senderId, content, createdAt

Store           — name, description, category, images[], phone?, whatsapp?, location?,
                  mapUrl?, hours?, quickReplies[], tags[], isVerified, status (PENDING/ACTIVE/ARCHIVED),
                  ownerId (unique — one store per user), collegeId
StoreReview     — storeId, userId (unique per store), rating (1–5), body?
ModerationLog   — moderatorId, listingId, listingTitle, sellerName, collegeId, reason?
```

---

## Auth and roles

Better Auth handles sessions (email + password + username plugin). Custom fields: `collegeId`, `role`.

| Role | Access |
|------|--------|
| `USER` | all app features |
| `MODERATOR` | + admin panel scoped to their college (remove listings, verify/archive stores) |
| `ADMIN` | + admin panel across all colleges, moderation log, permanent store deletion |

`proxy.ts` (the `proxy` function, renamed from `middleware.ts` for Next.js 16) gates `(app)` routes by session cookie presence. Full session validation happens inside handlers/actions. The socket server re-validates the handshake cookie over HTTP against `/api/auth/get-session`.

---

## Image pipeline

```
1. Client compresses (browser-image-compression)
2. UploadThing presigned upload — bytes never touch our server
3. Server Action:
   checkImagesAreSafe(urls)
     → Sightengine check.json (GET by image URL, up to 3 retries with 8s timeout)
     → throws / provider error  →  MODERATION_UNAVAILABLE (keep files, allow retry)
     → score ≥ threshold        →  delete files via utapi + return IMAGE_FLAGGED
     → safe                     →  db.listing.create / db.listing.update
```

---

## Stores flow

Students register one store per account (enforced at DB level with `ownerId @unique`). New stores start as `PENDING` and are invisible to other students. A MODERATOR or ADMIN verifies them (flips to `ACTIVE`) via the admin panel at `/admin/stores`. Archived stores are hidden; admins can permanently delete them.

Store listings (`Listing.storeId` set) are excluded from the main browse feed. `Conversation.storeId` links a chat thread to a store for store-based contact flows.

---

## Real-time / presence

- **In-memory only** — `Map<collegeId, Set<userId>>` + per-user socket count on the socket server. No `isOnline` DB column.
- `lastSeen` written to DB on the user's final disconnect (fire-and-forget).
- Messages persist + bump `conversation.lastMessageAt` atomically, then broadcast to the `conversation:<id>` room (sender included; client dedupes against optimistic copy).
- **Delete-for-me** — `hideConversation` sets `participant.hiddenAt`. `GET /api/conversations` filters hidden rows in JS: keeps a row only if `hiddenAt == null` or `lastMessageAt > hiddenAt` — so a hidden chat resurfaces automatically when the other person sends a new message.

---

## State management

| State type | Tool |
|-----------|------|
| Server data (listings, stores, messages) | React Query v5 — cursor-infinite where paginated |
| Real-time ephemeral (socket ref, online users, typing) | Zustand — minimal, no business data |
| Forms + validation | React Hook Form + Zod v4 |

---

## Rate limiting (Upstash Redis, sliding window)

| Limiter | Window | Keyed by | Where enforced |
|---------|--------|----------|----------------|
| sign-in | 10 / 15 min | IP | `proxy.ts` |
| sign-up | 5 / 15 min | IP | `proxy.ts` |
| listing create | 5 / 1 h | userId | `createListing` action |
| socket messages | see `rate-limiter.ts` | userId | `client:send_message` handler |

The socket message limiter **fails open** — if Redis is unavailable, messages are allowed through rather than blocking all chat.

---

## Deployment

| App | Platform | Notes |
|-----|----------|-------|
| Next.js app | Vercel | root of repo |
| Socket server | Render | point at `socket-server/` subdir; `PORT` injected by Render |

Set `NEXT_PUBLIC_SOCKET_URL` to the Render service URL and `BETTER_AUTH_URL` to the Vercel URL on both platforms. Socket server CORS is locked to `BETTER_AUTH_URL`.

> The socket server has its own `.env` file at `socket-server/.env`. It does **not** inherit the root `.env.local`. Both files must contain `DATABASE_URL`, `BETTER_AUTH_SECRET`, and the Upstash vars.
