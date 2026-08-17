# AI Knowledge Assistant — Frontend

A minimal Next.js demo frontend for **AI Knowledge Assistant**, a corporate RAG (Retrieval-Augmented
Generation) chat API built with **Java 21 / Spring Boot 4 / Spring AI (Ollama + pgvector)**.

The backend is the portfolio piece here — this frontend exists to make it demoable in a browser for
recruiters and reviewers. It talks to the backend exclusively over HTTPS and never touches Postgres or
Ollama directly.

> 🔗 Backend repository: *[https://github.com/rensilver/ai-knowledge-assistant](https://github.com/rensilver/ai-knowledge-assistant)*

## Features

- Email/password registration and login (JWT-based)
- Protected app shell with role-aware navigation
- Document management: upload PDFs, track ingestion status (`PROCESSING` → `COMPLETED`/`FAILED`), list, and
  delete (admin-only)
- **Chat** screen — standard RAG chat with real source citations
- **Agent** screen — tool-calling agent variant of chat (citations appear inline in the answer instead of a
  separate sources list)
- Landing page describing the project with a call-to-action into the demo

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (`button`, `input`, `card`, `dialog` only) |
| Forms | react-hook-form + zod |
| HTTP | Native `fetch`, wrapped in a small API client (no axios) |
| Deployment | Vercel |

No i18n, no dark mode, no E2E tests, and no state management library are in scope — this project favors
minimalism over polish.

## Getting started

### Prerequisites

- Node.js 20+
- A running instance of the [AI Knowledge Assistant backend](#) reachable over HTTPS

### Setup

```bash
git clone <this-repo-url>
cd ai-knowledge-assistant-frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and point it at your backend:

```
NEXT_PUBLIC_API_BASE_URL=https://your-api.fly.dev
```

No other environment variables are required — auth, roles, and business logic all come from the API
response payloads, not from build-time config.

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project structure

```
src/
├── app/
│   ├── (auth)/            # /login, /register
│   └── (app)/              # Protected routes: /chat, /agent, /documents
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── chat/                # Shared by Chat and Agent screens
│   ├── documents/
│   ├── auth/
│   └── layout/
├── lib/
│   ├── api/                 # fetch wrapper + endpoint calls
│   ├── auth/                 # AuthContext, token storage
│   ├── schemas/              # zod validation schemas
│   └── types/
└── middleware.ts
```

## Backend API contract (summary)

All authenticated requests send `Authorization: Bearer <token>`.

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/auth/register` | POST | Public | Always creates role `USER`; returns a token immediately |
| `/auth/login` | POST | Public | Same response shape as register |
| `/documents/upload` | POST | Bearer | multipart/form-data, PDF only, max 20 MB |
| `/documents` | GET | Bearer | Lists all documents, newest first |
| `/documents/{id}` | GET | Bearer | Poll to watch ingestion status |
| `/documents/{id}` | DELETE | Bearer + `ADMIN` | `403` for non-admins |
| `/chat` | POST | Bearer | RAG chat with populated `sources[]` |
| `/agent` | POST | Bearer | Tool-calling agent; `sources[]` is always empty, citations appear inline |

There is no refresh-token flow — on a `401`, the client logs the user out. There is also no conversation
history endpoint used by the UI; the backend persists history server-side, but the UI only tracks the
current session's messages in local state.

Full request/response shapes and error format live in [`CLAUDE.md`](./CLAUDE.md).

## Known backend behaviors the UI accounts for

- **Delete is admin-only.** Since a plain `USER` gets a `403`, the delete control is gated on
  `user.role === "ADMIN"` rather than shown unconditionally.
- **`PROCESSING` is a normal state**, not a race condition. Freshly uploaded documents can sit in
  `PROCESSING` for a while; the UI polls rather than expecting a single refetch to catch the transition.
- **`/agent` has higher, more variable latency**, and an empty `sources[]` on that endpoint is expected
  behavior, not an error.

## Security note

The auth token is stored via `localStorage` in this MVP, abstracted behind `lib/auth/token-storage.ts` so it
can later be swapped for an httpOnly cookie without touching the rest of the app. This tradeoff is accepted
for demo purposes and intentionally not "fixed" here.

## Scope

**In scope:** register/login, protected app shell, documents (upload/list/delete with status polling), chat
screen, agent screen (reusing chat components), landing page.

**Out of scope:** user profile editing, advanced pagination/search, persistent conversation history in the
UI, dark mode, i18n, E2E tests, refresh tokens, an admin panel for user/role management.

## Deployment

- **Frontend:** deployed on Vercel.
- **Backend:** hosted separately (e.g. Fly.io).
- CORS between the two origins is configured on the backend — this repo does not add a proxy route to work
  around CORS issues.

## License

*Add your license here.*
