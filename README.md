# Dadnoos Frontend & Agent Backend

This repository now hosts both the Next.js frontend and the Node-based agent/backend APIs. The legacy FastAPI + RAG stack has been replaced with a single system-prompt LLM agent that runs entirely inside the Next.js App Router. No vector store, Qdrant, or Python services are required at runtime.

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- PostgreSQL database reachable via `DATABASE_URL`
- Redis instance for OTP, chat memory, and rate limiting
- OpenAI/AvalAI compatible API key for chat + audio endpoints

## Environment

Copy `.env.example` to `.env` and fill in the required values:

```
cp .env.example .env
```

Key variables:

- `DATABASE_URL`, `REDIS_URL`: infrastructure
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`: authentication
- `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL`: chat + TTS/STT models
- `TRANSCRIPTION_MODEL`, `TRANSCRIPTION_LANGUAGE`, `TTS_MODEL`, `TTS_DEFAULT_VOICE`: audio endpoints
- `UPLOADS_DIR`, `PUBLIC_BASE_URL`: where user uploads are stored and how files are served (default: `public/uploads` + `/uploads/*` route)
- `RATE_LIMIT_*`, `OTP_*`, `OTP_DEV_MODE`: throttling and OTP behaviour; enable `OTP_DEV_MODE=true` in development to receive the OTP code in the API response.
- `AUDIO_STUB_MODE`: when true, `/api/v1/audio/*` returns stubbed responses so you can run verification without calling the upstream provider.
- `BILLING_REQUIRE_SUBSCRIPTION`: set to `false` to bypass quota checks in dev (default `true`). Default plan metadata (`DEFAULT_PLAN_*`) controls the auto-seeded plan returned by `/api/billing/plans`.
- `NEXT_PUBLIC_API_BASE_URL`: optional override for the frontend HTTP client (leave empty for same-origin).

## Database & Prisma

1. Install dependencies and generate the Prisma client:

   ```bash
   npm install
   npx prisma generate
   ```

2. Apply the initial migration (creates users, chat sessions, messages, plans, subscriptions, etc.):

   ```bash
   npx prisma migrate deploy
   # or
   npx prisma migrate dev
   ```

On first boot the server auto-creates a default plan (configurable via `DEFAULT_PLAN_*`). Production deployments should still migrate any real plans as needed.

## Running the App

```
npm run dev
```

The command runs Next.js (frontend + APIs) on port 3052 by default. No Python/FASTAPI process is required.

## System Prompt

- Defaults still live under `prompts/system.md` + `prompts/registry.json`, but at runtime everything is loaded from the `PromptConfig` table (with the filesystem acting as fallback).
- Use `/admin/prompts` to view/edit the core prompt, router prompt, and every module overlay; changes apply immediately and you can reset any entry back to its default.
- The agent runner (`lib/agent/runner.ts`) injects the active prompt alongside history and attachment metadata, and each prompt may optionally pin a different LLM model (falling back to `LLM_MODEL` when empty).

## Testing & Verification

`npm run verify` (`scripts/verify.ts`) drives the entire flow:

1. Requests an OTP (expects `OTP_DEV_MODE=true` so the code is returned inline).
2. Verifies the OTP, subscribes to the default plan, and hits `/api/v1/auth/me`.
3. Exercises chat, history (list/get/patch/delete), billing, and audio STT/TTS endpoints.

Example:

```
OTP_DEV_MODE=true AUDIO_STUB_MODE=true npm run verify
```

Set `VERIFY_BASE_URL`, `VERIFY_PHONE`, or `VERIFY_SKIP_AUDIO=true` to customize. The script aborts if any endpoint returns a non-200 response.

## Editing uploads/system files

- User uploads are stored under `UPLOADS_DIR` and exposed via `/uploads/*` route handlers.
- Respect `MAX_UPLOAD_BYTES` when sending files; oversized uploads return HTTP 400.

## Architectural Notes

- Auth/OTP/JWT run via Redis + Prisma, mirroring the previous FastAPI behaviour (OTP dev mode ensures local testing is painless).
- Chat endpoints (`/api/v1/chat`, `/api/v1/chat/session`) validate payloads with Zod, persist messages/attachments in Postgres, enforce billing quotas, and call the system-prompt agent. Attachments (PDF/DOCX) are saved under `UPLOADS_DIR`, summarized via `pdf-parse`/`mammoth`, and their summaries are injected directly into the prompt—no embeddings or vector retrieval.
- History, billing, and audio endpoints retain the original request/response shapes so the existing frontend works unchanged. `/api/v1/chat/stream` currently returns 501 in favour of the JSON endpoint.
- Legacy `/api/v1/rag/*` routes now return HTTP 410 to signal deprecation.

## Deployment

- Build with `npm run build` and start with `npm run start`.
- Ensure the uploads directory exists in your deployment environment and is writable by the Node process.
- Provide the necessary environment variables (see above) in your hosting platform.
