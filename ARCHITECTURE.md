# Architecture Documentation

## Technology Choices

### Next.js 16 (App Router)
- Full-stack React framework with built-in API routes
- App Router provides file-based routing with layouts
- Server and client components for optimal rendering
- Built-in TypeScript support

### SQLite + Prisma ORM
- **SQLite**: Zero-configuration embedded database, perfect for local development and assessments
- **Prisma**: Type-safe database access with auto-generated client, migrations, and seeding
- Schema-first approach ensures database and TypeScript types stay in sync

### Tailwind CSS 4
- Utility-first CSS framework for rapid UI development
- No custom CSS files needed — all styling inline
- Responsive design built-in with breakpoint prefixes

## Data Design

### Schema

```
Board (1) ──────< (many) Task
```

**Board**
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| name | String | Required |
| description | String? | Optional |
| color | String? | Hex color for accent |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

**Task**
| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| boardId | String (FK) | References Board.id |
| title | String | Required |
| description | String? | Optional |
| status | String | "todo" / "in_progress" / "done" |
| priority | String | "low" / "medium" / "high" |
| dueDate | DateTime? | Optional |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

**Cascade Delete**: Deleting a board removes all its tasks automatically.

### Why String Enums Instead of Prisma Enums?
SQLite doesn't support native enums. Using string fields with application-level validation provides the same functionality with simpler migration paths.

## API Design

REST API with 8 endpoints across 4 route files:

### Boards
- `GET /api/boards` — Returns all boards with `_count.tasks` for dashboard display
- `POST /api/boards` — Creates board, validates name is non-empty
- `GET /api/boards/:id` — Returns board with all tasks included
- `DELETE /api/boards/:id` — Checks existence, then deletes (cascade)

### Tasks
- `GET /api/tasks?boardId=X` — Returns tasks filtered by board
- `POST /api/tasks` — Creates task, validates boardId exists, title non-empty, valid status/priority
- `PATCH /api/tasks/:id` — Partial update, only modifies provided fields
- `DELETE /api/tasks/:id` — Checks existence, then deletes

### Error Handling
All endpoints use try/catch with consistent error response format:
```json
{ "error": "Human-readable error message" }
```

Status codes: 200 (success), 201 (created), 400 (validation), 404 (not found), 500 (server error).

## Frontend Structure

### Page Architecture
- **Dashboard (`/`)**: Client component that fetches boards, manages create/delete state
- **Board Detail (`/board/[id]`)**: Client component with Kanban columns, task CRUD, filtering, sorting

### Component Hierarchy

```
Dashboard (page.tsx)
├── AnalyticsBanner        — aggregate stats across boards
├── BoardCard[]            — individual board display
├── CreateBoardModal       — form for new board
├── DeleteConfirmDialog    — shared confirmation modal
└── EmptyState             — no-boards placeholder

BoardDetail (board/[id]/page.tsx)
├── CreateTaskForm         — inline form to add tasks
├── TaskFilters            — status filter + sort controls
├── TaskColumn[] (x3)      — one per status
│   └── TaskCard[]         — individual task with actions
├── EditTaskModal          — full task edit form
└── DeleteConfirmDialog    — shared confirmation modal
```

### State Management
- Local state via `useState` — no external state library needed
- `useMemo` for derived data (filtering, sorting, grouping by status)
- `useCallback` for stable function references
- Optimistic updates for status changes

### Data Flow
1. Page mounts → fetch from API → set local state
2. User action → API call → update local state (or optimistic update + revert on error)
3. No page refreshes — all mutations update React state directly

## Production Improvements

If this were a production application, I would consider:

1. **Authentication**: User accounts with board-level permissions
2. **Drag & Drop**: Use `@dnd-kit` for Kanban drag-and-drop between columns
3. **Real-time Updates**: WebSocket or Server-Sent Events for multi-user collaboration
4. **Database**: PostgreSQL for production, with connection pooling
5. **Caching**: React Query / SWR for data fetching with stale-while-revalidate
6. **Testing**: Jest + React Testing Library for unit/integration tests, Playwright for E2E
7. **Error Boundaries**: Graceful error handling with fallback UI
8. **Accessibility**: Full keyboard navigation and screen reader support
9. **Search**: Full-text search across tasks with debounced input
10. **Labels/Tags**: Flexible categorization beyond status and priority
