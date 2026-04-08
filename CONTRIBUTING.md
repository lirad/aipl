# Contributing to AIPL

Thank you for your interest in contributing! This project is an educational tool for teaching AI product development.

## Quick Setup

```bash
git clone https://github.com/liradiego/aipl.git
cd aipl
npm install
cp .env.example .env
# Add your VITE_GEMINI_API_KEY
npm run dev
```

## Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run checks: `npx tsc --noEmit && npm run build`
5. Commit with a clear message
6. Open a Pull Request

## Code Style

- **Language:** English for code, comments, and commits
- **TypeScript:** Strict mode — no `any` types
- **Components:** Keep under 250 lines, one responsibility per file
- **Naming:** Descriptive names, PascalCase for components, camelCase for functions
- **Comments:** Only where the "why" isn't obvious from the code

## Adding a New Phase

1. Add the phase type to `src/types/index.ts` (Phase union)
2. Add deliverables in `src/data/phases.ts`
3. Add prompts in `src/data/prompts.ts`
4. Add tools in `src/data/tools.ts`
5. Update `PHASES` array in `src/data/constants.ts`

## Adding a New Tool to a Phase

Edit `src/data/tools.ts` and add to the appropriate phase in `PHASE_LITERATURE`.

## Reporting Issues

Open an issue on GitHub with:
- What you expected
- What happened
- Steps to reproduce
- Your environment (OS, Node version, browser)
