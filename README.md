# AI Knowledge Assistant — Frontend

A demo frontend for [AI Knowledge Assistant](https://github.com/rensilver/ai-knowledge-assistant), a
corporate RAG chat API built with Java 21, Spring Boot 4, Spring AI (Ollama + pgvector). The backend is
the actual portfolio piece; this app exists only to make it demoable in a browser.

## What it does

- Register / login (JWT-based auth)
- Upload PDFs and watch them get indexed (`PROCESSING` → `COMPLETED` / `FAILED`)
- Chat against your documents with real citations (`/chat`)
- Ask a tool-calling agent that can reach beyond your documents (`/agent`)
- Admin-gated document deletion

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- react-hook-form + zod
- Native `fetch`, wrapped in a small API client (no axios)

## Getting started

The backend must be running separately — see
[ai-knowledge-assistant](https://github.com/rensilver/ai-knowledge-assistant).

```bash
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your backend
npm install
npm run dev
```

## Security note: token storage

The JWT is stored in `localStorage`, abstracted behind `lib/auth/token-storage.ts`. That's a deliberate
tradeoff for a demo: `localStorage` is readable by any script on the page (an XSS risk), where an httpOnly
cookie would not be. The storage module exists specifically so this can move to a cookie-based approach
later without touching the rest of the app — it's not "fixed" here because that's out of scope for a
portfolio demo, not because the risk isn't real.

## Deployment

Not deployed yet. Target is Vercel (frontend) talking to Fly.io (backend) over HTTPS via
`NEXT_PUBLIC_API_BASE_URL`. CORS must be configured on the backend to allow the Vercel origin.
