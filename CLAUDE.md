# CLAUDE.md

Guidance for Claude Code when working in this repository.

## 1. What this project is

A **minimal Next.js demo frontend** for "AI Knowledge Assistant" — a corporate RAG chat API written in
Java 21 / Spring Boot 4 / Spring AI (Ollama + pgvector), already built and deployed separately. The backend
is the portfolio piece; this frontend exists only to make it demoable in a browser for recruiters/reviewers.

**Guiding principle: minimalism over polish.** When in doubt, build the smaller, simpler version. Do not add
abstraction, config, or UI states that the MVP scope below doesn't call for.

- Frontend deploy target: **Vercel**
- Backend: hosted separately (e.g. Fly.io), consumed only over HTTPS via `NEXT_PUBLIC_API_BASE_URL`
- This repo never talks to Postgres or Ollama directly — only to the Spring Boot API

## 2. Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS** for styling — no separate design-system package
- **shadcn/ui**, only for what's needed: `button`, `input`, `card`, `dialog`
- **react-hook-form** + **zod** for form validation
- Native `fetch`, wrapped in one small API client — **no axios**, keep dependencies minimal
- Auth token storage: abstracted behind `lib/auth/token-storage.ts`. MVP uses `localStorage`; the module
  exists specifically so this can later become an httpOnly cookie without touching the rest of the app.
  Document this security tradeoff in the README, don't try to "fix" it in the MVP.
- No i18n, no dark mode, no E2E tests, no state management library — none of these are in scope

## 3. Repository structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout, AuthProvider
│   ├── page.tsx                   # Landing page: project description + link to login
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (app)/                     # Protected routes — auth check lives in this layout
│       ├── layout.tsx             # Redirects to /login if no session
│       ├── chat/page.tsx          # Calls /chat
│       ├── agent/page.tsx         # Calls /agent — reuses chat components
│       └── documents/page.tsx     # Upload + list + delete
│
├── components/
│   ├── ui/                        # shadcn/ui generated components only
│   ├── chat/
│   │   ├── ChatWindow.tsx         # Shared by /chat and /agent — see §7
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   ├── documents/
│   │   ├── DocumentUploadForm.tsx
│   │   ├── DocumentList.tsx
│   │   └── DocumentListItem.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── ProtectedRoute.tsx     # Or inlined into (app)/layout.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts              # fetch wrapper: base URL, JWT header injection, 401 handling
│   │   ├── auth.ts                # login(), register()
│   │   ├── chat.ts                # askChat()
│   │   ├── agent.ts               # askAgent()
│   │   └── documents.ts           # uploadDocument(), listDocuments(), getDocument(), deleteDocument()
│   ├── auth/
│   │   ├── AuthContext.tsx        # token, user (incl. role), login(), logout()
│   │   └── token-storage.ts
│   ├── schemas/                   # zod: loginSchema, registerSchema, uploadSchema
│   └── types/
│       ├── auth.ts
│       ├── chat.ts
│       ├── agent.ts
│       └── document.ts
│
└── middleware.ts                  # Optional: redirect unauthenticated (app)/* requests to /login

.env.local.example                 # NEXT_PUBLIC_API_BASE_URL=https://your-api.fly.dev
```

## 4. Backend API contract

Base URL comes from `NEXT_PUBLIC_API_BASE_URL`. Every authenticated call sends
`Authorization: Bearer <token>`.

### 4.1 Auth

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/auth/register` | POST | Public | Always creates role `USER`. Returns a token immediately — no second login call needed. |
| `/auth/login` | POST | Public | Same response shape as register. |

Request body (both, register also needs `name`):
```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "correct-horse-battery" }
```

Response (both):
```json
{
  "token": "eyJhbGciOi...",
  "expiresIn": 86400000,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "USER"
}
```

- Wrong login credentials → `401`, message `"Invalid email or password"`.
- **`role` is returned at login/register — store it in `AuthContext`.** The UI can use it directly (see §6.1),
  no extra `/users` call needed.
- There is **no refresh token**. On expiry, the client just logs the user out — acceptable for a portfolio
  project, do not build refresh logic.

### 4.2 Documents

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/documents/upload` | POST | Bearer | multipart/form-data, field name `file`, PDF only, max 20 MB |
| `/documents` | GET | Bearer | Lists all documents, newest first, regardless of uploader |
| `/documents/{id}` | GET | Bearer | Poll this to watch ingestion finish |
| `/documents/{id}` | DELETE | **Bearer + ADMIN role** | `403` if caller isn't ADMIN |

Upload always returns `201` with `status: "PROCESSING"` — parsing/chunking/embedding happens asynchronously
on the backend, never inline with the upload response. There is no webhook: **the UI must poll**
`GET /documents/{id}` (or refetch the list) until `status` becomes `COMPLETED` or `FAILED`.

Document shape:
```json
{
  "id": "3f2a9c1e-...",
  "filename": "some-policy.pdf",
  "contentType": "application/pdf",
  "sizeBytes": 184320,
  "status": "PROCESSING",
  "uploadedBy": "ada@example.com",
  "createdAt": "2026-08-10T14:02:11Z"
}
```

Error cases to handle in the upload form: non-PDF → `400`; file over 20 MB → `413`.

### 4.3 Chat vs Agent

Both endpoints share the exact same request/response shape, which is why one `ChatWindow` component can
serve both screens (see §7):

Request:
```json
{ "message": "What does the security policy say about VPN access?", "conversationId": null }
```

Response:
```json
{
  "answer": "According to 'Security Policy.pdf' (page 4), ...",
  "conversationId": "9b6e1d2a-...",
  "sources": [{ "filename": "Security Policy.pdf", "page": 4 }]
}
```

- Omit `conversationId` (or send `null`) to start a new conversation; **echo back the `conversationId` from
  the response** on subsequent messages to keep the same thread (last 20 messages of memory server-side).
- `/chat` — `sources[]` is populated with real citations. Predictable latency (one retrieval pass).
- `/agent` — `sources[]` is **always empty**; citations appear inline in the `answer` text instead, including
  an explicit note when an answer came from Wikipedia rather than the document base. Expect higher and more
  variable latency (the model may call tools 0..n times). The UI should not treat an empty `sources[]` on
  `/agent` as an error or render "no sources" — that's the normal shape for this endpoint.
- There is **no conversation history endpoint used by the UI** — the backend persists history, but the UI
  only needs to track the current session's messages in local component state.

### 4.4 Errors

Every endpoint uses one error shape (`GlobalExceptionHandler`):
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/auth/register",
  "details": ["password: Password must be at least 8 characters"]
}
```
`details[]` is only populated on validation errors — surface it under the relevant form fields when present,
otherwise fall back to `message`.

## 5. Auth & session flow

1. Register or login → backend returns a JWT + user info (incl. `role`) → store both in `AuthContext`,
   persist the token via `token-storage.ts`.
2. `client.ts` injects `Authorization: Bearer <token>` on every authenticated call automatically — don't add
   this header manually in individual `lib/api/*.ts` functions.
3. `(app)/layout.tsx` checks `AuthContext` for a token; redirect to `/login` if absent.
4. On any `401` response, `client.ts` calls `logout()` and redirects to `/login`. This is centralized in the
   client wrapper, not repeated in each call site.

## 6. Known backend behaviors the UI must account for

### 6.1 Delete is ADMIN-only
`DELETE /documents/{id}` requires role `ADMIN`; a plain `USER` gets `403`. Registration always creates
`USER`, so **most demo accounts cannot delete documents**. Since `role` is already available from
`AuthContext` (§4.1), gate the delete button/action on `user.role === "ADMIN"` rather than showing it
unconditionally and surfacing a raw 403. There is no admin UI in scope (§8) — this is purely about not
showing a control that will predictably fail.

### 6.2 `PROCESSING` is not a race condition, it's a normal state
A freshly uploaded document can sit in `PROCESSING` for a while. The document list/detail UI needs an
explicit visual state for it (and for `FAILED`), not just a binary "done/not done" — and should poll rather
than expect a single refetch to catch the transition.

### 6.3 `/agent` latency and empty sources are expected
Don't reuse a fixed short timeout tuned for `/chat` on the `/agent` screen, and don't render an empty
`sources[]` as an error state there — see §4.3.

## 7. Scope — build this, not that

**In scope (MVP):**
- Register / login pages
- Protected app shell with a nav
- Documents screen: upload (with PROCESSING/COMPLETED/FAILED state + polling), list, delete (ADMIN-gated)
- Chat screen (`/chat`)
- Agent screen (`/agent`) — **reuse the Chat screen's components**, varying only the endpoint called and a
  badge reading "RAG" vs "Agent (tool-calling)". Don't fork `ChatWindow` into two components.
- Landing page with a project description and a call-to-action into login/demo
- README documenting this as a demo frontend, linking the backend repo, and noting the `localStorage` token
  tradeoff

**Explicitly out of scope — do not build:**
- User profile editing
- Advanced pagination or search on the document list
- Persistent conversation history in the UI (backend has it; UI only needs the current session)
- Dark mode, i18n, E2E tests
- Refresh tokens
- An admin panel for `/users` or role management (§4.1's `role` field is only read, never edited, in this UI)
- Skeleton loading screens — a spinner + short message is enough for every loading/error state

## 8. CORS note (not this repo's problem)
Frontend (Vercel) and backend (Fly.io) are different origins. CORS must be configured **on the backend** to
allow the Vercel domain. If a request fails locally with a CORS error, that's a backend `SecurityConfig`
change, not something to work around in this repo (e.g. do not add a Next.js API proxy route to dodge it
unless explicitly asked).

## 9. Suggested build order

1. Scaffold: Next.js + TS + Tailwind + shadcn/ui, folder structure above
2. `lib/api/client.ts` + `lib/types/*` — API contracts, no UI yet
3. Full auth flow: register, login, `AuthContext`, route protection
4. Documents screen (upload, list, delete)
5. Chat screen
6. Agent screen (reusing Chat components)
7. Landing page
8. README + `.env.local.example` + Vercel deploy

## 10. Environment variables

```
NEXT_PUBLIC_API_BASE_URL=https://your-api.fly.dev
```

No other environment variables are needed on the frontend — auth, roles, and all business logic come from
the API response payloads, not from build-time config.
