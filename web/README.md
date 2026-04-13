# Pilo — AI CRM Automation Agent

## Project Overview

Pilo is a **Next.js** app that turns natural-language goals into CRM actions. You describe what you want (list leads, add a contact, update an email, remove a lead, send a message), and the backend routes that intent through an automation pipeline while **Supabase** stores leads and **step-by-step `agent_logs`** keyed by `run_id`. The UI surfaces a live execution feed so operators can see what the agent did, when it did it, and whether it succeeded.

We ship it for **Vercel** so the API and frontend scale together with minimal ops overhead.

---

## Features

- **Natural-language CRM workflows** — goals are resolved into concrete operations (list/fetch leads, create leads, update contact email, delete leads, send email).
- **API-first backend** — server routes own orchestration and data access; the client stays thin.
- **Supabase integration** — persistent storage for leads and structured execution logging.
- **`agent_logs` + `run_id`** — every run gets a stable id; the feed API returns ordered steps (`step`, `type`, `message`) for that run.
- **Demo vs live execution** — feed can be driven by mock steps or real rows from Supabase.
- **Dashboard-oriented UX** — goal input, execution feed, and lead visibility in one place.

---

## Tech Stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Runtime      | Node.js (Next.js server / API routes)       |
| Framework    | Next.js (App Router), React, TypeScript     |
| Styling      | Tailwind CSS                                |
| Database     | Supabase (Postgres)                         |
| Orchestration| Make.com (webhook — CRM side effects)       |
| Hosting      | Vercel                                      |

---

## Project Architecture (high-level)

```text
Browser (dashboard)
    │
    ├─► POST /api/run-agent          ──► Make.com webhook (payload: run_id, action, input)
    │                                        └──► writes agent_logs / CRM side effects (your scenario)
    │
    └─► GET /api/agent/feed          ──► Supabase `agent_logs` (by run_id)
              ?run_id=…&mode=live|demo

Supabase
  • leads, agent_logs (and related workflow metadata as you evolve the schema)

Client data access (e.g. listing leads) uses the public Supabase URL + anon key where appropriate;
server routes that must bypass RLS use the service role key (e.g. feed in live mode).
```

The **authoritative automation contract** for external tools should stay aligned with your Make scenario and any shared types (e.g. action names and payload shape).

---

## API Routes

### `POST /api/run-agent`

- **Body:** `{ "goal": "<user natural language>" }`
- **Behavior:** Generates a `run_id` (`run_<timestamp>`), infers the CRM **action** from the goal text, normalizes **input** (name, email, company, etc.) when applicable, and **POSTs JSON** to `MAKE_WEBHOOK_URL`.
- **Response:** `{ "run_id": "run_…" }` on success; `500` with an error payload on failure.

Use this to **start** a run; poll or stream the feed separately using the returned `run_id`.

### `GET /api/agent/feed`

- **Query:** `run_id` (required), optional `mode`
  - `mode=demo` — returns a fixed sequence of demo steps (no database read).
  - `mode=live` or omitted (live path) — reads from Supabase table **`agent_logs`** filtered by `run_id`, ordered by `step`.
- **Response:** JSON array of `{ step, type, message }` objects (shape aligned with the UI feed).

---

## Environment Variables

Create **`web/.env.local`** (never commit secrets). Example skeleton:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Automation
MAKE_WEBHOOK_URL=https://hook.…

# Optional / reserved for integrations (set when wired in code or external services)
OPENAI_API_KEY=
RESEND_API_KEY=
```

- **Public URL + anon key** — safe for browser-side Supabase reads that respect your RLS policies.
- **Service role** — server-only; used where the API must read/write without end-user JWT (e.g. `agent_logs` in live feed). **Protect this key** on Vercel and locally.

---

## Local Development

**Prerequisites:** Node.js 20+ (recommended), npm, a Supabase project, and a Make webhook URL if testing end-to-end automation.

```bash
cd web
npm install
# create .env.local and add variables (see Environment Variables)

npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the dashboard to submit goals and verify `run_id` + feed behavior against demo mode first, then live Supabase.

**Scripts**

| Command        | Purpose              |
| -------------- | -------------------- |
| `npm run dev`  | Next.js dev server   |
| `npm run build`| Production build     |
| `npm run start`| Production server    |
| `npm run lint` | ESLint               |

---

## Deployment (Vercel)

1. Push the `web` app (or monorepo root with **Root Directory** set to `web` in Vercel).
2. In **Project → Settings → Environment Variables**, add the same keys as `.env.local` for Production (and Preview if you use it).
3. Redeploy after changing secrets.

Confirm Supabase **RLS** and policies match how you use anon vs service role in production. Restrict CORS and webhook URLs to known origins in Make where possible.

---

## Current Limitations

- **No authentication yet** — there is no login/session layer; requests are not tied to verified users, and multi-tenant isolation is not enforced at the app edge.
- **Intent parsing is heuristic** — goals are mapped with keyword-style rules in `run-agent`; complex phrasing may mis-route until you add a stronger NLU or LLM planner.
- **Orchestration depends on Make** — CRM mutations and log writes must stay in sync with the webhook scenario and table schemas.

---

## Next Steps

1. **Auth** — Supabase Auth (or similar) with JWT on the client; pass `user_id` through runs and enforce RLS on `leads`, `agent_logs`, and workflow tables.
2. **User isolation** — scope every query and webhook payload by `user_id` / org; remove mock user assumptions in the UI layer.
3. **Hardening** — rate limits on `POST /api/run-agent`, structured logging, and validation schemas (e.g. Zod) on API bodies and webhook payloads.

---

Built to ship fast, observe every run, and grow into a multi-user CRM automation product.
