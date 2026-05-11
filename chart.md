# Dashboard charts: how it works

This note explains the **admin dashboard** that shows user counts, todo completion breakdown (pie chart), and tasks per user (bar chart), using **Chart.js** via **react-chartjs-2**.

---

## 1. Who can see the dashboard?

The numbers are **workspace-wide** (every user and every todo in the database), so the feature is **admin-only**, consistent with RBAC elsewhere in the app:

- **Backend:** the `/dashboard` router uses the same stack as user management: `authMiddleware` then `requireAdmin` (`backend/src/routes/dashboard.route.js`). Only JWTs whose payload includes `"role": "admin"` can call these routes.
- **Frontend:** the `/dashboard` route is wrapped in `<ProtectedRoute adminOnly>` (`frontend/src/App.jsx`). Non-admins are redirected away. The **Dashboard** link in the top bar is shown only when `isAdmin` is true (`frontend/src/components/AppLayout.jsx`).

---

## 2. Backend: aggregating stats with Prisma

**Endpoint:** `GET /dashboard/summary`  
**Response shape (JSON):**

```json
{
  "userCount": 12,
  "todosCompleted": 30,
  "todosIncomplete": 18,
  "tasksPerUser": [
    { "userId": 1, "name": "Ada", "email": "ada@example.com", "taskCount": 5 },
    { "userId": 2, "name": "bob@example.com", "email": "bob@example.com", "taskCount": 0 }
  ]
}
```

**Implementation files:**

| File | Role |
|------|------|
| `backend/src/services/dashboard.service.js` | Runs Prisma queries and merges results. |
| `backend/src/controllers/dashboard.controller.js` | Sends JSON or 500 on failure. |
| `backend/src/routes/dashboard.route.js` | Registers `GET /summary` behind auth + admin. |
| `backend/src/server.js` | Mounts the router at `/dashboard`. |

**Queries (conceptually):**

1. **`userCount`** — `prisma.user.count()`.
2. **Completed / not completed todos** — two `prisma.todo.count()` calls with `where: { is_completed: true }` and `false`.
3. **Tasks per user** — `prisma.todo.groupBy({ by: ["userId"], _count: { id: true } })` to get counts per owner, then **all users** are loaded and merged so the bar chart includes users with **zero** tasks (useful for teaching “left join” style reporting).

This keeps chart-friendly data out of the browser’s hands until the server has checked the admin’s JWT.

---

## 3. Frontend: Chart.js + react-chartjs-2

**Dependencies** (already in `frontend/package.json`):

- `chart.js` — the chart engine.
- `react-chartjs-2` — React components (`<Pie />`, `<Bar />`) that wrap Chart.js.

**Main file:** `frontend/src/pages/Dashboard.jsx`

### 3.1 Registering Chart.js building blocks

Chart.js 4 is modular: you **register** only the pieces you need. The dashboard registers:

- **Pie:** `ArcElement`, `Tooltip`, `Legend`
- **Bar:** `CategoryScale`, `LinearScale`, `BarElement`, `Title` (title used sparingly in options)

Without `register(...)`, charts can fail silently or throw at runtime.

### 3.2 Fetching data

On mount, the page calls:

```text
GET {VITE_API_URL or http://localhost:8000}/dashboard/summary
```

through the shared **`api`** client (`frontend/src/api/client.js`), which attaches `Authorization: Bearer <token>`. That matches how other authenticated routes work.

### 3.3 Building chart datasets

- **Pie** — `labels: ["Completed", "Not completed"]`, one dataset with `data: [todosCompleted, todosIncomplete]` and distinct `backgroundColor` values. Options tweak the legend and tooltip (e.g. show counts and percentages).
- **Bar** — `labels` come from each user’s display `name` (falling back to `email` in the API), and the single dataset’s `data` is the `taskCount` array. The Y axis starts at zero and uses a step size suited to whole tasks.

### 3.4 Layout

**Material UI** wraps the charts in `Paper` grids and shows summary **stat cards** at the top (user count, total todos, completion rate) so students see both raw numbers and graphics.

---

## 4. End-to-end data flow (for teaching)

1. Admin logs in → JWT stored → `api` sends `Bearer` on each request.
2. Admin opens **Dashboard** → React requests `GET /dashboard/summary`.
3. Express runs `authMiddleware` → `requireAdmin` → controller → service → Prisma.
4. JSON returns aggregates; React builds `pieChartData` / `barChartData` and passes them to `<Pie />` and `<Bar />`.

---

## 5. Files to point students to

| Area | Path |
|------|------|
| Admin dashboard UI | `frontend/src/pages/Dashboard.jsx` |
| Dashboard route + guard | `frontend/src/App.jsx` |
| Nav link (admin) | `frontend/src/components/AppLayout.jsx` |
| API + token | `frontend/src/api/client.js` |
| Stats logic (DB) | `backend/src/services/dashboard.service.js` |
| HTTP entry | `backend/src/routes/dashboard.route.js`, `backend/src/server.js` |
| RBAC reuse | `backend/src/middleware/auth.js` |

This is the full path from **authorization** → **aggregation** → **Chart.js** in React.
