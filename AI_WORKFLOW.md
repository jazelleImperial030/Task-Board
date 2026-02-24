# AI Workflow

## Tool Used
I used **Claude Code** (Claude Opus 4.6) — Anthropic's CLI-based AI coding assistant and Cursor as an IDE. I ran it directly in my terminal and gave it prompts to generate code, debug issues, and handle deployment. I have also used Supabase MCP to design the schema and seed data.

## Example Prompts

### Prompt 1:
> "Create Next.js App Router API endpoints for /api/boards with: GET all boards, POST create board, GET /api/boards/[id] to get board + all tasks, DELETE /api/boards/[id]. Return proper status codes and JSON responses. Add try/catch and input validation."

- **Why I wrote it this way**: I was specific about the routes, HTTP methods, and what each should return. Ive also defined error handling and validation
- **Did the AI give a good answer?** Yes — it generated all 4 endpoints with proper 200/201/400/404/500 status codes, try/catch blocks, and input validation (e.g., checking board name is non-empty). I used the code as-is.

### Prompt 2:
> "Instructions: Verify the app implements all required features first before considering optional features. Optional features should be implemented one at a time, not all. Ensure the routes and pages are correctly structured and match the specifications. Requirements: Analytics: Dashboard section showing: Total number of tasks across all boards, Number of tasks per status, Percentage of completed tasks. Real-Time Updates: Changes in one browser window appear automatically in another (via WebSockets or polling). Export Data: Button to download all board data as JSON or CSV. Pages and Routes: Homepage / Dashboard: / → Shows all boards. Board Detail: /board/[id] → Shows tasks for one board. API Routes: /api/boards → CRUD operations for boards, /api/tasks → CRUD operations for tasks."

- **Why I wrote it this way**: I have defined the UI/UX requirements. I was technical and detailed about how the system should work. I have ensured AI would understand my needs and i always make sure i make my prompt as detailed as possible as to not waste context. 
- **Did the AI give a good answer?** It audited the codebase and identified exactly 3 missing features (completion percentage on dashboard, real-time updates, export). It implemented them one at a time without breaking existing functionality.



## My Process

### What I used AI for:
- **Scaffolding**: Project setup, database schema, seed data, API routes
- **Database migration**: Migrating from SQLite/Prisma to Supabase (PostgreSQL)
- **Feature implementation**: Analytics dashboard, real-time polling, export (JSON/CSV), drag-and-drop
- **Deployment**: Setting up Supabase MCP connection
- **Debugging**: Fixing connection errors, environment variable issues, polling UI flicker

### What I coded manually:
- Reviewed and approved all AI-generated code 
- Configured Supabase project and environment variables
- Set up Vercel deployment and environment variables in the dashboard
- Tested all features in the browser

### Where AI-generated code did not work:
1. **Prisma + Vercel**: The initial SQLite + Prisma setup didn't work on Vercel because SQLite is file-based and serverless platforms don't support it. Had to migrate to Supabase.
2. **Database connection**: Direct PostgreSQL connection (port 5432) was blocked by my network. Had to switch from Prisma to Supabase JS client which uses HTTPS instead.
3. **Polling caused UI flicker**: The real-time polling (every 5 seconds) was showing unecessary ui updates. Fixed by adding a `silent` parameter to skip the loading state during background polls.
4. **Export scope**: AI initially made the export buttons download ALL boards. I requested it to be per-board instead, and the AI corrected it.

### How I fixed problems:
- For the SQLite issue: Switched to Supabase as a cloud database alternative and rewrote all API routes
- For the connection issue: AI replaced Prisma with Supabase JS client (HTTPS-based, no port needed)
- For the polling flicker: AI added a `silent` flag to fetch functions so background polls don't trigger loading states


## Time Management

### What I built first:
1. Project setup, database schema, and seed data
2. API routes (CRUD for boards and tasks)
3. Dashboard page with board listing
4. Board detail page with Kanban columns and drag-and-drop
5. Analytics (task counts, priority chart, completion percentage)
6. Database migration to Supabase for deployment
7. Real-time updates and export feature
8. Documentation

### What I skipped:
- WebSocket-based real-time (used polling instead — simpler and works everywhere)
- User authentication
- Full-text search across tasks
- Labels/tags system

### If I had more time, what would I add:
- **Authentication**: User accounts so boards are private
- **WebSocket real-time**: Replace polling with Supabase Realtime for instant updates
- **Search**: Search bar to find tasks across all boards
- **Labels/Tags**: Custom tags for better task categorization
- **E2E tests**: Playwright tests for critical flows
