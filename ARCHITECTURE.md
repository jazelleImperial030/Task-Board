# Architecture Documentation

## 1. Why Did I Choose These Technologies?

### Why Next.js 16 with App Router?
I chose Next.js because it's a full-stack React framework . I get both frontend and backend (API routes) in one project without needing a separate server. I used the **App Router** instead of Pages Router because it's the recommended approach for new Next.js projects. It supports file-based routing, layouts, and server/client component separation out of the box.

### Why Supabase (PostgreSQL)?
I initially started with **SQLite + Prisma** for simplicity, but migrated to **Supabase** because:
- It provides a cloud-hosted PostgreSQL database
- The Supabase JS client connects via **HTTPS** — no TCP port issues or connection pooling needed
- Good for production

### Why Tailwind CSS 4?
Tailwind lets me style components directly in JSX without switching between files. It's fast for building UIs, has built-in responsive design utilities, and keeps the styling consistent. No custom CSS files needed , everything is inline with utility classes.

### Why @hello-pangea/dnd?
I needed drag-and-drop for the Kanban board (dragging tasks between To Do, In Progress, Done columns). @hello-pangea/dnd is a maintained fork of react-beautiful-dnd that works with React 19.

### Why Recharts?
I needed a simple chart for the priority breakdown on the dashboard. Recharts is lightweight and works well with React no complex configuration needed.

## 2. How Did I Structure the Data?

### Database Tables

```
Board (1) ──────< (many) Task
```

I have two tables: **Board** and **Task**. A board has many tasks, and each task belongs to one board.

**Board** stores: id, name, description (optional), color (hex for visual accent), timestamps.

**Task** stores: id, boardId (foreign key), title, description, status (todo/in_progress/done), priority (low/medium/high), order (position in column), dueDate, timestamps.

### Why this design?
- **Simple relationship**: One board → many tasks. This is the most natural way to model a Kanban board.
- **Status as a string**: PostgreSQL supports enums, but I used string fields with application-level validation. This makes it easier to add new statuses later without database migrations.
- **Order field**: Needed for drag-and-drop. When a user drags a task to a new position, I update the `order` value for all affected tasks in that column.
- **Color on Board**: Each board has an optional color so users can visually distinguish boards in the sidebar.

### What happens when you delete a board?
All tasks belonging to that board are **deleted first**, then the board is deleted. This is handled in the API route — I explicitly delete tasks with `DELETE FROM Task WHERE boardId = X` before deleting the board. This prevents orphaned tasks in the database.

## 3. How Did I Design the API?

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | List all boards with their tasks and task counts |
| POST | `/api/boards` | Create a new board (validates name is non-empty) |
| GET | `/api/boards/:id` | Get one board with all its tasks |
| PATCH | `/api/boards/:id` | Update board name or description |
| DELETE | `/api/boards/:id` | Delete board and all its tasks |
| GET | `/api/tasks?boardId=X` | Get tasks for a specific board |
| POST | `/api/tasks` | Create a task (validates boardId exists, title non-empty, valid status/priority) |
| PATCH | `/api/tasks/:id` | Update any task fields (partial update) |
| DELETE | `/api/tasks/:id` | Delete a single task |
| PATCH | `/api/tasks/reorder` | Bulk update task order and status (for drag-and-drop) |

### Why this structure?
- **RESTful design**: Standard HTTP methods (GET, POST, PATCH, DELETE) for predictable behavior.
- **Boards and tasks are separate resources**: This keeps the API clean. Tasks are always accessed through a boardId filter rather than nested under boards.
- **Partial updates with PATCH**: Only the fields you send get updated. This is more efficient than PUT which would require sending the entire object.
- **Dedicated reorder endpoint**: Drag-and-drop needs to update multiple tasks at once (new order values and possibly new status). A single bulk endpoint is more efficient than making 10+ individual PATCH calls.
- **Consistent error format**: Every error returns `{ "error": "message" }` with appropriate status codes (400, 404, 500).

## 4. How Did I Organize the Frontend?

### Routing
- **`/`** — Dashboard page. Shows the sidebar with all boards, analytics cards, and when a board is selected, shows the Kanban view inline.
- **`/board/[id]`** — Standalone board detail page. Same Kanban view but as a full page (accessible via direct URL).

The dashboard uses **client-side navigation** — clicking a board in the sidebar updates state without a page reload. The `/board/[id]` route exists for direct linking and sharing.

### State Management
All state is managed with React's built-in `useState` — no external state library (Redux, Zustand, etc.) was needed because:
- The data is simple (boards and tasks)
- There's no deeply nested state sharing
- `useMemo` handles derived data (filtered/sorted tasks, grouped by status)
- `useCallback` keeps function references stable for performance

### Component Structure

```
src/
├── app/
│   ├── page.tsx                # Dashboard — main entry point
│   ├── board/[id]/page.tsx     # Standalone board detail
│   └── api/                    # All API routes
├── components/
│   ├── AnalyticsBanner.tsx     # Stats banner (board count, task count)
│   ├── BoardCard.tsx           # Board card in sidebar
│   ├── CreateBoardModal.tsx    # Modal form for new board
│   ├── CreateTaskForm.tsx      # "Add Task" button
│   ├── DeleteConfirmDialog.tsx # Reusable confirmation modal
│   ├── EditTaskModal.tsx       # Create/edit task modal
│   ├── EmptyState.tsx          # Shown when no boards exist
│   ├── PriorityChart.tsx       # Bar chart for priority breakdown
│   ├── TaskCard.tsx            # Individual task in Kanban column
│   ├── TaskColumn.tsx          # One Kanban column (droppable zone)
│   └── TaskFilters.tsx         # Sort controls
├── lib/
│   └── supabase.ts             # Supabase client instance
└── types/
    └── index.ts                # All TypeScript types and constants
```

### How components are organized:
- **Page components** (`page.tsx`) handle data fetching, state, and layout
- **UI components** (`components/`) are presentational — they receive props and render UI
- **DeleteConfirmDialog** is reusable — used for both board and task deletion
- **EditTaskModal** handles both create and edit modes via a `mode` prop

### How data flows:
1. Page mounts → fetches data from API → stores in state
2. User interacts → optimistic state update → API call in background
3. If API fails → revert state (re-fetch from server)
4. Silent polling every 5 seconds keeps data in sync across browser tabs

## 5. What Would I Change?

### What I would improve with more time:
- **Authentication**: Add user accounts so boards are private. Currently anyone with the URL can see and modify data.
- **WebSocket real-time**: Replace 5-second polling with Supabase Realtime subscriptions for instant updates instead of a delay.
- **Search**: A global search bar to find tasks across all boards by title or description.
- **Labels/Tags**: Custom tags for tasks beyond just status and priority.
- **E2E testing**: Playwright tests for critical user flows (create board, create task, drag-and-drop, delete).

### What problems exist in the code:
- **Polling is not efficient**: Every 5 seconds the app fetches ALL boards with ALL tasks, even if nothing changed. A better approach would be WebSocket subscriptions that only push changes.
- **No authentication**: The Supabase anon key is exposed in the client. RLS policies allow all operations — in production, you'd need proper auth.
- **No pagination**: If a board has hundreds of tasks, they all load at once. Should add pagination or virtual scrolling.
- **Export is client-side**: The JSON/CSV export runs in the browser. For large datasets, this should be a server-side API endpoint.

### What would be different in a real production app:
- **Authentication & authorization**: User accounts, team workspaces, role-based access control
- **Server-side rendering**: Use Next.js server components for the initial page load, hydrate on client
- **Database**: Connection pooling via Supabase's pooler, database indexes on frequently queried columns
- **Caching**: React Query or SWR for data fetching with stale-while-revalidate instead of manual polling
- **Error boundaries**: Graceful error UI instead of silent failures
- **Monitoring**: Error tracking (Sentry), analytics, and performance monitoring
- **CI/CD**: Automated tests running on every PR before merge
