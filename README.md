# CollabUS

Create and share a unified workspace with friends to manage and assign tasks seamlessly. Full CRUD, due dates, priorities, task categorization, image attachments, and Supabase-backed realtime collaboration — wrapped in a warm, card-based UI.

**Live:** https://collabus-nine-nu.vercel.app/

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Supabase (Postgres, Auth, Realtime, Storage)
- Framer Motion (drawer/list animations)
- Web Push notifications (service worker)

## Features

- **Boards / workspaces** — create boards, switch between them from the sidebar, delete with confirmation.
- **Invite by code or link** — each board has a shareable invite code; `?join=CODE` links open the join modal pre-filled.
- **Realtime sync** — tasks, boards, and membership update live across collaborators via Supabase Realtime.
- **Task cards** — priority, assignees (with hover tooltip), due-date badges color-coded by urgency (Overdue → Today → Upcoming → No date), image attachments with lightbox.
- **Slide-over task editor** — add/edit form in a right-side drawer, including priority picker and member assignment.
- **Activity log** — per-board feed of who created / updated / completed / deleted what.
- **Push notifications** — opt-in browser push for board activity and @mentions.
- **Smart grouping** — the "All Tasks" view groups chronologically with a color-shifting timeline rail; completed tasks auto-delete 7 days after completion (surfaced in the UI).

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
```

### Environment

Create a `.env` file with your Supabase project credentials:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Structure

```
src/
  components/
    Auth.jsx            # email/password + Google OAuth login, password reset
    Sidebar.jsx         # board switcher, view filters with counts, invite panel
    Topbar.jsx          # search, mobile menu toggle, new-task button
    TaskList.jsx        # urgency grouping, timeline rail, empty states
    TaskCard.jsx        # single task card (assignees, priority, lightbox)
    TaskDrawer.jsx      # add/edit slide-over form
    CreateBoardModal.jsx / JoinBoardModal.jsx
    ActivityLogPanel.jsx
    ConfirmDialog.jsx / EmptyState.jsx
  hook/
    useBoardMembers.js / useRealtimeTasks.js / useTodos.js
  lib/
    useTasks.js         # CRUD, realtime subscriptions, 7-day cleanup, counts
    date.js             # urgency buckets + deadline formatting
    supabaseClient.js
  services/workspace.js
  utils/
    pushService.js      # push registration + mention detection
    deviceHelper.js
  App.jsx               # board state, realtime board sync, modals
  MainApp.jsx
  index.css             # design tokens (@theme), fonts
public/
  sw.js                 # push service worker
  Documentation.html    # static docs page
```
