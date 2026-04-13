@AGENTS.md

# Project Workflow Rules

## Worktree Rules
- ALL work happens in worktrees — use `isolation: worktree` for Agent tool
- NEVER run `git checkout -b` or `git branch` — worktrees create their own branches
- Worktree names MUST be descriptive: `feat/widget-preview`, `fix/hydration-mismatch`
- NEVER auto-commit in worktrees — wait for user to say "commit"
- NEVER work directly on main — main is read-only except for merges

## Worktree → Branch Workflow
- After work is done in a worktree: commit changes, then remove the worktree
- This frees the branch so the user can `git checkout <branch>` in the main repo for testing
- NEVER delete the branch — only remove the worktree to release the lock
- NEVER auto-merge a branch into main — wait for the user to explicitly say "merge"
- When user says "merge": merge the branch to main, then delete the branch

## Worktree Tracking
- On session start: run `git worktree list` and report all pending worktrees
- On session end or when asked: report branches pending merge (check `git branch` too, not just worktrees)

## Branch Rebasing
- Before merging ANY branch to main: check if the branch base matches main HEAD
- If branch is behind main: `git rebase main <branch>` BEFORE merging
- This keeps a clean linear history and avoids unnecessary merge commits
- Command: `git log --oneline main..<branch> && git merge-base main <branch>` — if merge-base != main HEAD, rebase first

## Documentation Rules
- Before starting a feature: create `docs/features/NN-feature-name/` with `prd.md` + `trd.md`
- During development: log decisions, bugs, iterations to `session-log.md`
- After merge: update `status.md`, `docs/CHANGELOG.md`, `docs/05-implementation.md`
- Daily session summary: `docs/sessions/YYYY-MM-DD.md` (links to features, commit list)
- All docs are written for a PUBLIC audience (build-in-public marketing campaign)
- Be specific: include file paths, component names, bundle sizes, architecture decisions

## docs/ Structure
```
docs/
├── CHANGELOG.md              ← Updated after each merge
├── 05-implementation.md      ← Current architecture
├── roadmap.md                ← Public feature roadmap
├── features/
│   └── NN-feature-name/
│       ├── prd.md            ← What + why
│       ├── trd.md            ← How (technical)
│       ├── session-log.md    ← Decisions, bugs, iterations
│       └── status.md         ← Complete/Pending/In Progress + branch
└── sessions/
    └── YYYY-MM-DD.md         ← Daily summary + commit list
```

## Monorepo Structure
```
apps/dashboard    — Next.js dashboard (React 19)
apps/preview      — Standalone preview app (Vite + Preact)
packages/db       — Database schema + client (Drizzle + Turso)
packages/types    — Shared TypeScript types (WidgetLayout, WidgetConfig, BaseContribution)
packages/ui       — Shared shadcn/ui components (radix-ui)
packages/widget   — Embeddable widget (Preact + Shadow DOM)
packages/tsconfig — Shared TypeScript configs
```

## Key Commands
```
pnpm dev           — Dashboard dev server (:3000)
pnpm build         — Build all packages (turbo)
pnpm build:widget  — Build widget + copy to dashboard/public
pnpm preview       — Preview app dev server (:4173)
pnpm db:push       — Push schema to local DB
pnpm ui:add <name> — Add shadcn component to packages/ui (instant, no download)
```

## Cloudflare Deployment Compatibility
Target platform is Cloudflare Workers + Pages. Every new feature MUST be compatible.
- NEVER `import { ... } from 'crypto'` — use `crypto.randomUUID()` or `crypto.getRandomValues()` (global WebCrypto)
- NEVER use Node.js-only modules: `fs`, `path`, `child_process`, `net`, `dns`, `stream`
- NEVER create global mutable singletons in API routes (Workers are stateless per-request)
- NEVER use local file paths in production code (`file:./local.db` is dev-only)
- ALWAYS check new dependencies support edge runtimes before adding
- ALWAYS use HTTP-based database connections for production
- See `docs/deployment.md` for full checklist and architecture

## UI Component Rules
- NEVER manually create shadcn components — always use `pnpm ui:add <component>`
- After running `pnpm ui:add`, fix imports: replace `@/lib/utils` → `../lib/utils` in generated files
- Components use `radix-ui` (unified package), NOT `@base-ui/react`
- Export new components from `packages/ui/src/index.ts` if they need barrel export
- Dashboard imports: `import { X } from '@github-embed-ui/ui/components/x'`
