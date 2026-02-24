# AI Workflow Documentation

## Tool Used

**Claude Code** (Claude Opus 4.6) — Anthropic's CLI-based AI coding assistant.

## Process

### 1. Planning Phase
- Reviewed the PRD document for requirements
- Created a detailed implementation plan with 6 phases
- Identified the tech stack: Next.js 14+ (App Router), React, TypeScript, SQLite, Prisma, Tailwind CSS
- Planned file structure and API design upfront

### 2. Implementation Phase

**Phase 1 — Project Setup & Database (scaffolding, Prisma schema, seed data)**
- Scaffolded Next.js with `create-next-app`
- Configured Prisma with SQLite, wrote Board and Task models
- Created seed data with 2 sample boards and 9 tasks
- Set up Prisma singleton for connection pooling

**Phase 2 — API Routes (8 REST endpoints)**
- Built CRUD endpoints for boards and tasks
- Added input validation, proper HTTP status codes, and error handling
- Used Prisma's cascade delete for board-task relationships

**Phase 3 — Dashboard Page**
- Built board listing with card grid layout
- Created modal for board creation with color picker
- Added delete confirmation dialog (reusable component)
- Implemented empty state for no boards

**Phase 4 — Board Detail Page (Kanban view)**
- Built three-column Kanban layout (To Do, In Progress, Done)
- Inline task creation form with priority selection
- Edit task modal with all fields
- Status change dropdown on each task card
- Client-side filtering by status and sorting by multiple fields
- Optimistic UI updates for status changes

**Phase 5 — Analytics**
- Dashboard banner with board count and total tasks
- Board detail with per-status counts, progress bar, completion percentage

**Phase 6 — Documentation**
- README with setup instructions and API reference
- This AI workflow document
- Architecture documentation

### 3. Verification
- Ran `next build` to verify zero compilation errors
- Confirmed all routes render correctly
- Tested database seeding

## Example Prompts Used

1. "Implement the following plan: [full implementation plan]"
2. Planning phase included database schema design, API endpoint specification, and component hierarchy

## Time Management

| Phase | Estimated | Description |
|-------|-----------|-------------|
| Phase 1 | 20 min | Project setup, Prisma, seed |
| Phase 2 | 25 min | 8 API endpoints |
| Phase 3 | 20 min | Dashboard + components |
| Phase 4 | 30 min | Board detail + Kanban |
| Phase 5 | 10 min | Analytics banner |
| Phase 6 | 15 min | Documentation |

## Key Decisions Made by AI

1. **Prisma 6 over Prisma 7**: Chose Prisma 6 for stability and simpler ESM/CJS compatibility with tsx
2. **Client-side filtering/sorting**: Used `useMemo` for filtering and sorting instead of additional API calls — faster UX for moderate task counts
3. **Optimistic updates**: Status changes reflect immediately in UI before API confirmation
4. **Reusable components**: `DeleteConfirmDialog` shared between board and task deletion
