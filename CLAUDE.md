# AIPL — Claude Code Context

## Project
AIPL (AI Product Lifecycle) is an educational web app that guides students through 6 phases of building AI products. Built for Escola Tera's AI Product Management course.

## Tech Stack
- Frontend: React 19 + TypeScript (strict) + Vite 6 + Tailwind CSS 4
- AI: Google Gemini API (client-side, student's own key via VITE_GEMINI_API_KEY)
- Backend (cloud mode only): Express + Redis (ioredis)
- Deployment: Railway (optional)

## How to Run
```bash
npm install
cp .env.example .env  # add your VITE_GEMINI_API_KEY
npm run dev            # local mode, no backend needed
```

For cloud mode with analytics: `npm run dev:all` (needs REDIS_URL)

## Code Conventions
- Language: English (code, comments, commits, docs)
- TypeScript: strict mode enabled
- Components: focused, under 250 lines each
- State: custom hooks in src/hooks/
- Data: AIPL framework content in src/data/ (phases, prompts, tools)
- Services: external integrations in src/services/

## Architecture
- src/components/ — UI organized by feature (chat/, phases/, deliverables/, admin/)
- src/hooks/ — React hooks for state management
- src/services/ — Gemini API, analytics, storage
- src/data/ — AIPL framework content (the curriculum)
- src/types/ — TypeScript definitions
- server/ — Express API (cloud mode only, with zod validation)

## Key Decisions
- CORS is intentionally open (educational project, documented)
- Gemini API key is client-side (each student uses their own)
- localStorage for persistence in local mode
- Analytics are no-ops when VITE_API_URL is not set
- Admin endpoints protected by ADMIN_KEY env var

## What NOT to Do
- Don't change AIPL phase content without explicit instruction
- Don't add unnecessary abstractions
- Don't commit .env files or hardcode API keys
- Don't break the dual-mode (local/cloud) architecture
