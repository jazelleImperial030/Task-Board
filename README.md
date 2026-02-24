# Task Board System

A Kanban-style task management application built with Next.js and Supabase.

## Requirements

- Node.js 18 or higher
- npm
- Supabase account (free tier works)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jazelleImperial030/Task-Board.git
   cd Task-Board
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a project at [supabase.com](https://supabase.com)
   - Go to your project dashboard and find your **Project URL** and **Anon Key**

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

5. Run the application:
   ```bash
   npm run dev
   ```

6. Open in browser: [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables
4. Deploy

## Tech Stack

- **Next.js 16** with App Router — full-stack React framework
- **React 19** — UI library
- **TypeScript** — type safety
- **Supabase** — cloud PostgreSQL database
- **Tailwind CSS 4** — utility-first styling
- **@hello-pangea/dnd** — drag-and-drop for Kanban columns
- **Recharts** — priority breakdown chart

## Features

- Board management (create, edit, delete with custom colors)
- Task management (create, edit, delete with status, priority, due date)
- Kanban drag-and-drop (reorder tasks between To Do, In Progress, Done)
- Analytics dashboard (task counts, completion percentage, priority chart)
- Real-time updates (polling every 5 seconds across browser tabs)
- Export data (download board data as JSON or CSV)
- Responsive design (mobile-friendly with tabbed Kanban view)
