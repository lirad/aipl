# AGENTS.md — AI Agent Instructions for AIPL

## About This Project
AIPL is an educational app for teaching AI product development lifecycle.
The codebase is structured for readability and learning.

## File Map

| Directory | Responsibility | Key Files |
|-----------|---------------|-----------|
| src/components/chat/ | Chat interface | ChatPanel, ChatMessage, ChatInput, TypingIndicator |
| src/components/phases/ | Phase navigation | PhaseNavigation, PhaseOnboarding |
| src/components/workspace/ | Deliverable editor | WorkspaceView |
| src/components/admin/ | Analytics dashboard | AdminDashboard, MetricsOverview, GuardrailsPanel, UsersPanel, MonitoringPanel |
| src/hooks/ | State management | useChat, useDeliverables, useLocalStorage |
| src/services/ | External integrations | gemini.ts, analytics.ts |
| src/data/ | Curriculum content | phases.ts, prompts.ts, tools.ts, constants.ts |
| src/types/ | Type definitions | index.ts |
| server/ | Express API (cloud) | routes/, middleware/, services/ |

## Guidelines for Agents
- Keep files under 250 lines
- Use TypeScript strict mode — no `any` types
- Follow existing component patterns (props interfaces, named exports)
- Educational comments only where the "why" isn't obvious
- English for all code and documentation
- Run `npx tsc --noEmit` before committing
- Run `npm run build` to verify Vite builds

## Protected Content — Do NOT Modify Without Explicit Instruction
- Phase definitions in `src/data/phases.ts` (the AIPL curriculum)
- System prompts in `src/services/gemini.ts` (the AI behavior)
- Tool lists in `src/data/tools.ts` (curated resources)
- The 6-phase AIPL framework structure

## Dual-Mode Architecture
The app works in two modes:
1. **Local:** React + Gemini only, localStorage, analytics are no-ops
2. **Cloud:** Full stack with Express + Redis + analytics dashboard

Do not break this pattern. Analytics must gracefully no-op when VITE_API_URL is absent.
