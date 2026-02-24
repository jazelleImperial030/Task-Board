# Task Board System

A Kanban-style task management application built with Next.js, SQLite, and Prisma.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite via Prisma ORM 6
- **API**: Next.js REST API Routes

## Features

- **Board Management**: Create, view, and delete boards with custom colors
- **Task Management**: Full CRUD for tasks with title, description, status, priority, and due date
- **Kanban View**: Three-column layout (To Do, In Progress, Done) with inline status changes
- **Filtering & Sorting**: Filter tasks by status; sort by date, priority, title, or due date
- **Analytics Dashboard**: Task counts, completion percentage, and progress bar
- **Persistent Storage**: SQLite database — data survives restarts

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migration and seed
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Re-seed the Database

```bash
npx prisma db seed
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | List all boards with task counts |
| POST | `/api/boards` | Create a new board |
| GET | `/api/boards/:id` | Get board with all tasks |
| DELETE | `/api/boards/:id` | Delete board (cascades to tasks) |
| GET | `/api/tasks?boardId=X` | Get tasks for a board |
| POST | `/api/tasks` | Create a new task |
| PATCH | `/api/tasks/:id` | Update task fields |
| DELETE | `/api/tasks/:id` | Delete a task |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Dashboard (board list)
│   ├── globals.css           # Global styles
│   ├── board/[id]/page.tsx   # Board detail (Kanban view)
│   └── api/                  # REST API routes
│       ├── boards/
│       │   ├── route.ts      # GET all, POST
│       │   └── [id]/route.ts # GET one, DELETE
│       └── tasks/
│           ├── route.ts      # GET by board, POST
│           └── [id]/route.ts # PATCH, DELETE
├── components/
│   ├── AnalyticsBanner.tsx   # Dashboard stats
│   ├── BoardCard.tsx         # Board card component
│   ├── CreateBoardModal.tsx  # New board form
│   ├── CreateTaskForm.tsx    # Inline task creation
│   ├── DeleteConfirmDialog.tsx # Reusable delete confirmation
│   ├── EditTaskModal.tsx     # Task edit form
│   ├── EmptyState.tsx        # Empty state placeholder
│   ├── TaskCard.tsx          # Task card with actions
│   ├── TaskColumn.tsx        # Kanban column
│   └── TaskFilters.tsx       # Filter and sort controls
├── lib/prisma.ts             # Prisma client singleton
└── types/index.ts            # Shared TypeScript types
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Seed data
```
