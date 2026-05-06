
This document summarizes what this project implements so you can walk students through **role-based access control (RBAC)**, the **User** domain, and the **Todo** domain, and how they connect in the API and React app.

---

## 1. RBAC (role-based access control)

### What problem RBAC solves

Not every authenticated user should call every endpoint. **Authentication** answers “who are you?” (identity). **Authorization** answers “what are you allowed to do?” **RBAC** is a simple authorization model: users are assigned a **role** (here: `admin` or `user`), and the server allows or denies actions based on that role.

### Roles in this project

| Role    | Typical use |
|---------|-------------|
| `admin` | Can manage **users** (list, create, update, delete, search). |
| `user`  | Can use **todos** for their own account only. |

Roles are stored on the `User` model in the database (`role`, default `"user"`). The **first** account can be created as `admin` via a one-time bootstrap flow (see Users below).

### How the server enforces RBAC

1. **JWT (JSON Web Token)**  
   After login (or bootstrap), the server issues a signed token. The token payload carries at least:
   - `sub` — the user’s numeric **id** (we attach it as `req.userId` in middleware).
   - `role` — `"admin"` or `"user"` (we attach it as `req.userRole`).

2. **`authMiddleware`** (`backend/src/middleware/auth.js`)  
   - Expects header: `Authorization: Bearer <token>`.  
   - Verifies the signature and expiry.  
   - Sets `req.userId` and `req.userRole` for downstream handlers.  
   - If the token is missing or invalid → **401 Unauthorized**.

3. **`requireAdmin`** (same file)  
   - Runs **after** `authMiddleware`.  
   - If `req.userRole !== "admin"` → **403 Forbidden** (authenticated, but not allowed).  
   - Students should distinguish **401** (not logged in / bad token) from **403** (logged in, wrong role).

### Route layout (mental model)

```text
/users/setup-status          → public
/users/bootstrap-first-admin → public (only when no users exist)
/users/login                 → public

(authentication required + admin role)
/users/get-users, /users/save, … → authMiddleware → requireAdmin

(authentication required, any logged-in user)
/todos/*                     → authMiddleware only
```

So: **todos** need **any** valid JWT tied to a user; **user management** needs **admin**.

### Frontend alignment

- **`AuthContext`** (`frontend/src/context/AuthContext.jsx`) stores `user` and `token` (and syncs to `localStorage`).
- **`api` client** (`frontend/src/api/client.js`) adds `Authorization: Bearer …` to requests.
- **`ProtectedRoute`** (`frontend/src/components/ProtectedRoute.jsx`) redirects to `/login` if there is no session; with `adminOnly`, it redirects non-admins away from `/users`.
- **`AppLayout`** shows the **Users** nav link only when `user.role === "admin"`.

---

## 2. Users (identity, passwords, and admin APIs)

### Data model

Defined in **`backend/prisma/schema.prisma`**:

- `User`: `id`, optional `name`, unique `email`, `password` (stored **hashed**, never returned to clients in listings), `role`, timestamps.
- One user has many `Todo` records (`todos` / `userId` relation).

### Passwords

- **`bcrypt`** hashes passwords on create/update (`backend/src/services/user.service.js`).  
- Plain passwords are **never** stored.  
- Responses use a small helper to strip `password` before sending JSON (`dontReturnPassword` in the user controller).

### Public user endpoints

| Method & path | Purpose |
|---------------|---------|
| `GET /users/setup-status` | Returns `{ needsBootstrap: true }` if there are zero users so the UI can show “create first admin.” |
| `POST /users/bootstrap-first-admin` | Creates the **first** user as **`admin`** if the table is empty; returns `token` + `user` (same shape as login) so the client can start sending authenticated requests immediately. |
| `POST /users/login` | Body: `{ email, password }`. Validates credentials; returns `token` + `user` (no password). |

### Admin-only user endpoints

All of these run after **`authMiddleware`** and **`requireAdmin`** on the router (`backend/src/routes/user.route.js`):

- `GET /users/get-users` — list users  
- `GET /users/search?task=…` — search by name (backend implementation)  
- `POST /users/save` — create user  
- `PUT /users/edit/:id` — update user (password optional; only hashed if a new password is provided)  
- `GET /users/view/:id` — fetch one user  
- `DELETE /users/delete/:id` — delete user  

### Frontend pages

- **`Login.jsx`** — loads setup status; either first-time admin form or normal sign-in; uses **`AuthContext`**.  
- **`UserManagement.jsx`** — admin CRUD UI; calls the `/users/...` endpoints above.

---

## 3. Todos (ownership and per-user data)

### Data model

`Todo` belongs to **one** `User` via required **`userId`** (foreign key). That means every task row is **owned** by a user.

### Why todos are scoped to the logged-in user

The todo **service** (`backend/src/services/todo.service.js`) filters and checks **`userId`**:

- **List / search** only returns todos where `userId` matches the authenticated user.  
- **Create** sets `userId` from the server (from JWT), not blindly from the request body (students should understand **never trusting** client-supplied ownership ids without checks).  
- **Get / update / delete** verify the todo belongs to that user (otherwise “not found” or error).

Controllers pass **`req.userId`** from `authMiddleware` into the service (`backend/src/controllers/todo.controller.js`).

### Todo routes

All mounted under **`/todos`** with **`authMiddleware`** applied to the whole router (`backend/src/routes/todo.route.js`):

- `GET /todos/get-todos`  
- `GET /todos/search?task=…`  
- `POST /todos/save`  
- `GET /todos/:id`  
- `PUT /todos/:id`  
- `DELETE /todos/:id`  

### Frontend

- **`Todo.jsx`** uses the shared **`api`** client so every calls carries the JWT.  
- Students can trace: **login** → **token** → **axios interceptor** → **todos filtered by** `userId` **on the server**.

---

## 4. Suggested teaching order

1. **RBAC** — roles, JWT payload, `authMiddleware` vs `requireAdmin`, HTTP 401 vs 403.  
2. **User** — Prisma `User` model, hashing, public vs admin routes, bootstrap + login story.  
3. **Todo** — Prisma relation `Todo` → `User`, **`userId` ownership**, and why all todo queries are filtered by `req.userId`.  
4. **Frontend** — `AuthContext`, protected routes, admin-only navigation, and how the same token unlocks todos for any user but only unlocks user management for admins.

---

## 5. Configuration reminder

- **`DATABASE_URL`** — required for Prisma/MySQL.  
- **`JWT_SECRET`** — set a strong secret in production (see `backend/src/middleware/auth.js`); the default string is only for local development.

This matches the code under `backend/src` (Express + Prisma) and `frontend/src` (React + MUI + React Router).

