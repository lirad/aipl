# AIPL Educational Repository — Design Spec

**Date:** 2026-04-08
**Status:** Approved
**Author:** Lira + Claude

## Context

AIPL (AI Product Lifecycle) is an interactive learning tool built for Escola Tera's AI Product Management course. It guides students through 6 phases of building AI products using a Gemini-powered chatbot. Students loved the app and requested access to the source code to study how it works.

The current codebase is functional but monolithic (App.tsx: 1128 lines, AdminDashboard.tsx: 893 lines), has hardcoded credentials, no documentation, and is not structured for learning or collaboration.

## Goal

Transform the AIPL project into a well-structured, secure, and educational repository that:

1. Tera students can clone, study, and run locally in under 3 minutes
2. Serves as a portfolio piece demonstrating AI product development
3. Offers two deployment paths: local (zero dependencies) and cloud (Railway)

## Target Audience

- **Primary:** Escola Tera students studying AI product management
- **Secondary:** Portfolio visitors and the broader dev community

## Language

Everything in English — code, comments, documentation, commits.

---

## Architecture

### File Structure

```
AIPL/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx          # Chat container with message list + input
│   │   │   ├── ChatMessage.tsx        # Single message bubble (user/model)
│   │   │   ├── ChatInput.tsx          # Input field + send button
│   │   │   └── TypingIndicator.tsx    # Loading animation
│   │   ├── phases/
│   │   │   ├── PhaseNavigation.tsx    # Sidebar with 6 phases
│   │   │   ├── PhaseCard.tsx          # Individual phase item
│   │   │   └── PhaseOnboarding.tsx    # Welcome card per phase
│   │   ├── deliverables/
│   │   │   ├── DeliverablePanel.tsx   # List of deliverables for current phase
│   │   │   ├── DeliverableCard.tsx    # Expandable card with status
│   │   │   └── DeliverableEditor.tsx  # Content editing area
│   │   ├── workspace/
│   │   │   └── WorkspaceView.tsx      # All deliverables overview
│   │   ├── document/
│   │   │   └── DocumentExport.tsx     # HTML export (existing, cleaned up)
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx     # Main dashboard (slim orchestrator)
│   │   │   ├── MetricsOverview.tsx    # KPIs and charts
│   │   │   ├── GuardrailsPanel.tsx    # Guardrail event logs
│   │   │   ├── UsersPanel.tsx         # Active users list
│   │   │   └── MonitoringPanel.tsx    # Latency & feedback
│   │   └── ui/
│   │       ├── ErrorBoundary.tsx      # Global error catching
│   │       └── Layout.tsx            # App shell (header, sidebar, content)
│   ├── hooks/
│   │   ├── useChat.ts                # Chat state & message handling
│   │   ├── usePhases.ts             # Phase navigation & progress
│   │   ├── useDeliverables.ts       # Deliverable CRUD & status
│   │   └── useLocalStorage.ts       # Typed localStorage persistence
│   ├── services/
│   │   ├── gemini.ts                # Gemini API integration
│   │   ├── analytics.ts            # Event tracking client (no-op in local mode)
│   │   └── storage.ts              # localStorage abstraction
│   ├── data/
│   │   ├── phases.ts               # PHASE_DETAILS — the AIPL framework content
│   │   ├── tools.ts                # Curated AI tools per phase
│   │   └── prompts.ts              # System prompts & context engineering
│   ├── types/
│   │   └── index.ts                # All TypeScript definitions
│   ├── App.tsx                     # Slim orchestrator (~150-200 lines)
│   ├── main.tsx                    # Entry point with ErrorBoundary
│   └── index.css                   # Tailwind base
├── server/
│   ├── index.ts                    # Express app setup
│   ├── routes/
│   │   ├── session.ts              # Session endpoints
│   │   ├── tracking.ts             # Event tracking endpoints
│   │   └── admin.ts                # Admin dashboard endpoints (ADMIN_KEY protected)
│   ├── middleware/
│   │   ├── validation.ts           # Input validation with zod schemas
│   │   └── rateLimit.ts            # Rate limiting (100 req/min on tracking)
│   └── services/
│       └── redis.ts                # Redis connection & helpers (fail-fast if no URL)
├── .env.example                    # All env vars documented
├── .gitignore
├── AGENTS.md                       # AI agent instructions for this repo
├── CLAUDE.md                       # Claude Code project context
├── CONTRIBUTING.md                 # How to contribute
├── LICENSE                         # MIT
├── README.md                       # Full educational README
├── package.json
├── tsconfig.json                   # Strict mode enabled
├── vite.config.ts
└── nixpacks.toml                   # Railway deploy config
```

### Design Principles

- **Each folder = one concept** students understand immediately
- **`data/`** separates AIPL framework content from code — students can modify phases without touching UI
- **`hooks/`** encapsulates state logic — students see React hooks in practice
- **`services/`** isolates external integrations — Gemini, analytics, storage
- **`server/`** mirrors the same organization (routes, middleware, services)
- **`App.tsx`** drops from 1128 to ~150-200 lines — just composes modules
- **Any file under 250 lines** — no monoliths

---

## Security

### API Key Handling
- Each student creates their own Gemini API key via Google AI Studio (free)
- Key goes in `.env` as `VITE_GEMINI_API_KEY`
- Exposed via Vite's `import.meta.env` convention
- README includes step-by-step guide to obtain a key
- No hardcoded keys anywhere in source code

### Redis Credentials
- Removed hardcoded fallback URL from `server/index.ts`
- Server fails fast with clear error if `REDIS_URL` is missing
- Only needed in cloud mode

### Admin Dashboard Protection
- Protected by `ADMIN_KEY` environment variable
- `GET /api/admin/*` requires `?key=<ADMIN_KEY>` query param
- Simple and appropriate for educational context

### CORS
- **Intentionally open** (`cors()` with no restrictions)
- Documented as a deliberate design decision in both code comments and README
- Rationale: educational project, avoids student frustration, not a production concern

### Input Validation
- `zod` schemas on all API request bodies
- Whitelist phase names against known PHASE_DETAILS
- UUID format validation for session IDs
- Type and range validation for numeric values

### Rate Limiting
- `express-rate-limit` on `/api/track/*` endpoints (100 req/min)
- Prevents accidental abuse without blocking normal usage

---

## Dual Deploy Mode

### Local Mode (Zero Dependencies)

```bash
git clone <repo>
cd AIPL
npm install
cp .env.example .env   # paste your Gemini API key
npm run dev             # open localhost:3000
```

- No Redis, no Express server needed
- Chat history and deliverables persist in `localStorage`
- Analytics calls are no-ops (no backend to hit)
- `storage.ts` service abstracts localStorage with typed getters/setters

### Cloud Mode (Railway)

- One-click deploy via **Deploy on Railway** button in README
- Railway Template provisions: Node.js service + Redis plugin
- Environment variables:
  - `VITE_GEMINI_API_KEY` — student's own key
  - `REDIS_URL` — auto-injected by Railway Redis plugin
  - `ADMIN_KEY` — student picks their own
  - `APP_URL` — auto from Railway domain
- Full analytics, admin dashboard, session tracking active

### Auto-Detection

```typescript
// services/analytics.ts
const API_AVAILABLE = Boolean(import.meta.env.VITE_API_URL);

export function trackMessage(phase: string, role: string) {
  if (!API_AVAILABLE) return; // Local mode: silent no-op
  post('/api/track/message', { phase, role });
}
```

No config flags needed — if `VITE_API_URL` exists, cloud features activate. Otherwise everything works locally.

---

## Documentation

### README.md
- Project title, description, badges
- What is AIPL? (6-phase framework explanation with visual diagram)
- Architecture overview (component diagram)
- Quick Start — Local (5 steps)
- Deploy to Cloud — Railway (button + guide)
- Tech Stack table
- Project Structure (annotated tree)
- How the AI Integration Works (the most educational section: context engineering, JSON schema, phase-aware prompting)
- Key Design Decisions (CORS, localStorage, own API key, observability)
- Contributing link
- License (MIT)

### CLAUDE.md
- Project purpose and context
- Tech stack summary
- How to run and test
- Code conventions (English, strict TS, component structure)
- Key architectural decisions

### AGENTS.md
- How AI agents should approach this repo
- File map with responsibilities
- What NOT to change (phase content, framework structure)
- Testing expectations

### CONTRIBUTING.md
- Fork, branch, PR workflow
- Code style guide
- How to add a new phase or tool
- Issue templates

---

## Code Quality

### TypeScript
- `strict: true` in `tsconfig.json`
- All `any` types replaced with proper interfaces
- Strict null checks enabled

### Error Handling
- `ErrorBoundary` component wraps the app in `main.tsx`
- Friendly fallback UI instead of blank screen on crashes

### Constants
- Magic numbers extracted to named constants:
  - `HEARTBEAT_INTERVAL_MS`
  - `API_TIMEOUT_MS`
  - `MAX_MESSAGES_CONTEXT`
  - `REDIS_MAX_RETRIES`
  - `SESSION_TTL_SECONDS`

### Comments
- Educational comments on key patterns (context engineering, JSON schema, hooks)
- No obvious/redundant comments — only where the "why" matters
- English throughout

---

## Out of Scope

- Unit/integration tests (follow-up task)
- Changing AIPL framework content (phases, deliverables, tools)
- User authentication beyond simple admin key
- CI/CD pipeline
- Internationalization
- Moving Gemini calls to backend (stays client-side for simplicity)

---

## Success Criteria

1. Student clones, runs `npm install && npm run dev`, has app working in under 3 minutes
2. Code is readable — any file under 250 lines, clear naming, educational comments on key patterns
3. Zero hardcoded secrets in source code
4. Railway deploy works with one-click template button
5. README tells the full story of the project and architecture
