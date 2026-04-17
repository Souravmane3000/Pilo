<div align="center">

# Pilo

### AI-powered CRM automation. Natural language in, real CRM actions out.


</div>

---

## Overview

Pilo is a full-stack CRM automation platform that translates natural language instructions into structured CRM operations via a webhook-driven automation pipeline.

A user types a command → Pilo parses intent → triggers the correct Make.com workflow → persists the result to Supabase → streams execution logs back to the UI in real time.

The system runs in two modes: **Demo** (simulated execution, no auth) and **Live** (real workflows, Supabase-backed, auth required).

---

## Architecture

```
Client (Next.js App Router)
        │
        ├─► POST /api/run-agent
        │       ├── Parses intent from natural language input
        │       ├── Generates unique run_id
        │       └── POSTs structured payload to Make.com webhook
        │
        ├─► Make.com
        │       ├── Receives webhook payload
        │       ├── Routes via Router module to correct action handler
        │       │     Send_Email · Update_Email · Create_Leads
        │       │     Get_Leads · Create_New_Row · Delete_Leads · Fallback
        │       └── Writes step logs to Supabase agent_logs
        │
        └─► GET /api/agent/feed?run_id=&mode=
                ├── live  → polls agent_logs filtered by run_id
                └── demo  → returns deterministic simulated steps
```

### Data Model (Supabase / Postgres)

```sql
leads          -- CRM records, scoped by user_id
agent_logs     -- Execution steps: id, run_id, step, type, action, message, created_at
workflow_runs  -- Run metadata and status
activity_log   -- Audit trail of user-initiated actions
```

Row Level Security is enforced on all tables. All queries are scoped to `auth.uid()`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14, App Router, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Animation | Framer Motion |
| API | Next.js Route Handlers |
| Database | Supabase (Postgres + Auth + RLS) |
| Automation | Make.com (Webhook + Router) |
| Email | Resend |
| Deployment | Vercel |

---

## API

### `POST /api/run-agent`

Parses a natural language goal, generates a `run_id`, and dispatches to the Make.com webhook.

**Request**
```json
{
  "goal": "Send a welcome email to John at john@example.com"
}
```

**Response**
```json
{
  "run_id": "run_a1b2c3d4"
}
```

**Errors**

| Status | Reason |
|---|---|
| `400` | Missing or empty `goal` |
| `401` | Unauthenticated request in live mode |
| `502` | Make.com webhook unreachable |

---

### `GET /api/agent/feed`

Returns execution steps for a given run. Poll this endpoint after calling `/api/run-agent`.

**Query params**

| Param | Required | Values |
|---|---|---|
| `run_id` | ✅ | `run_*` string returned by `/api/run-agent` |
| `mode` | ✅ | `live` \| `demo` |

**Response**
```json
{
  "steps": [
    { "step": 1, "type": "thinking", "message": "Parsing intent...", "created_at": "..." },
    { "step": 2, "type": "action",   "message": "Triggering Send_Email", "created_at": "..." },
    { "step": 3, "type": "success",  "message": "Email sent to john@example.com", "created_at": "..." }
  ]
}
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Supabase project (with schema applied)
- Make.com scenario configured and active

### Setup

```bash
git clone https://github.com/your-username/pilo.git
cd pilo/web
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Make.com
MAKE_WEBHOOK_URL=
```

```bash
npm run dev
# → http://localhost:3000
```

### Database

Apply the schema to your Supabase project via the CLI:

```bash
supabase db push
```

Or run the SQL files in `/supabase/migrations` manually from the Supabase dashboard.

---

## Deployment

Pilo is deployed on Vercel. Any push to `main` triggers a production deployment.

```bash
# Manual deploy via Vercel CLI
vercel --prod
```

**Vercel config:**
- Root directory: `web`
- Build command: `npm run build`
- Output: `.next`

Set all environment variables from `.env.local` in your Vercel project settings before deploying.

---

## Modes

| | Demo | Live |
|---|---|---|
| Authentication | Not required | Supabase Auth (email/password) |
| Execution | Simulated steps | Real Make.com workflows |
| Data persistence | None | Supabase Postgres |

---

## Known Limitations

- Intent parsing is rule-based. LLM-based parsing is not yet integrated.
- No retry or dead-letter handling for failed Make.com webhook calls.
- Feed polling is interval-based. WebSocket / SSE not implemented.
- No pagination on lead queries — performs full table scans on large datasets.
- Single-tenant only. No workspace or multi-org support.

---

## Roadmap

- [ ] Replace rule-based parser with GPT-4o function calling
- [ ] Server-Sent Events for real-time feed (replace polling)
- [ ] Webhook retry queue with exponential backoff
- [ ] Paginated lead table with server-side filtering
- [ ] Multi-tenant workspace support
- [ ] Workflow builder UI

---

## License

MIT © Sourav Mane

