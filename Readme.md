# Smart Notes App

A full-stack note-taking application inspired by Google Keep and Notion. Users can create, edit, archive, tag, search, and share notes. Shared notes trigger real-time notifications. Admins can manage users and view platform stats.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Authentication](#authentication)
- [Sharing & Notifications](#sharing--notifications)
- [Admin Panel](#admin-panel)
- [Future Work](#future-work)

---

## Features

### Users
- Register and login with email + password
- Login with Google OAuth
- **Secure Authentication:** JWTs are stored exclusively in `HttpOnly` cookies to prevent XSS attacks.
- **Optimized Refresh Flow:** Axios interceptor queue prevents race conditions by pausing concurrent failed requests and grouping them into a single token refresh call.
- Change password
- Logout (invalidates refresh token server-side and clears cookies)

### Notes
- Create, edit, delete notes
- Archive and unarchive notes
- Add and remove tags
- Search notes by title or content
- Filter by tag, archived status, date range
- Paginated results

### Sharing
- Share any note with another user by email
- Set permission: `view` (read-only) or `edit` (can modify content)
- Update permissions at any time
- Revoke access
- Shared users can leave a note themselves

### Notifications
- Automatic notification when a shared note is edited
- Notification when a note is shared with you
- Mark as read / mark all as read
- Delete / clear all
- Unread badge count in the navbar

### Admin
- View all users with filters (role, active status)
- View any user's notes
- Deactivate / reactivate users
- Permanently delete users (cascades all their data)
- Platform stats (users, notes, tags, shares, unread notifications)
- Only one admin exists — assigned automatically to the first registered user

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11+ | Language |
| FastAPI | Web framework |
| PostgreSQL | Database |
| SQLAlchemy 2.0 | ORM |
| Alembic | Database migrations |
| Passlib (bcrypt) | Password hashing |
| python-jose | JWT tokens |
| httpx | Google OAuth HTTP calls |
| Pydantic v2 | Request/response validation |
| Uvicorn | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Build tool |
| Zustand | Global state management |
| Tailwind CSS v4 | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |

---

## Project Structure

```text
smart-notes/
│
├── smart-notes-backend/
│   ├── app/                            # Main application package
│   │   ├── __init__.py
│   │   │
│   │   ├── core/                       # Core configurations
│   │   │   ├── __init__.py
│   │   │   └── config.py                 # Settings from .env   
│   │   │
│   │   ├── db/                         # Database setup
│   │   │   ├── __init__.py
│   │   │   └── database.py             # Engine & session
│   │   │
│   │   ├── models/                     # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   └── models.py
│   │   │
│   │   ├── schemas/                    # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── routes/                     # API routes
│   │   │   ├── __init__.py
│   │   │   ├── users.py                # Auth endpoints
│   │   │   ├── notes.py                # Notes CRUD + search
│   │   │   ├── tags.py                 # Tag management
│   │   │   ├── share.py                # Note sharing
│   │   │   ├── notifications.py        # Notifications
│   │   │   └── admin.py                # Admin endpoints
│   │   │
│   │   ├── services/                   # Business logic layer
│   │   │   ├── __init__.py
│   │   │   └── notification_service.py
│   │   │
│   │   ├── utils/                      # Helper functions
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   └── helper.py               # JWT, password hashing, dependencies
│   │   │
│   │   └── main.py                     # FastAPI entry point
│   │
│   ├── alembic/                        # Database migrations
│   │   ├── versions/
│   │   │   ├── xxxx_create_all_tables.py
│   │   │   └── xxxx_add_refresh_token_to_users.py
│   │   └── env.py
│   │
│   ├── tests/                          # Database migrations
│   │   ├── conftest.py
│   │   ├── test_admin.py
│   │   ├── test_notes.py
│   │   ├── test_notifications.py
│   │   ├── test_share.py
│   │   ├── test_tags.py
│   │   └── test_users.py
│   │
│   ├── .env                            # Environment variables
│   ├── alembic.ini
│   ├── requirements.txt
│   └── README.md (optional backend-specific)
│
└── smart-notes-frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.ts               # Axios instance + interceptors
    │   │   ├── auth.ts
    │   │   ├── notes.ts
    │   │   ├── tags.ts
    │   │   ├── share.ts
    │   │   ├── notifications.ts
    │   │   └── admin.ts
    │   ├── components/
    │   │   ├── Navbar.tsx              # Top nav with unread badge
    │   │   ├── StatCard.tsx            # stat card component in admin panel     
    │   │   ├── UserRow.tsx             # show users in row 
    │   │   ├── NoteCard.tsx            # Note details
    │   │   ├── NotificationRow.tsx     # Notifications row 
    │   │   ├── SharedNoteCard.tsx      # Shared note card 
    │   │   ├── PublicRoute.tsx         # Does not allow logged in user to go to login page without logout
    │   │   └── ProtectedRoute.tsx      # Auth + admin guard
    │   ├── store/
    │   │   └── useAuthStore.ts         # Zustand global auth state
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── GoogleCallback.tsx      # OAuth redirect handler
    │   │   ├── Dashboard.tsx           # Notes grid + filters
    │   │   ├── NoteEditor.tsx          # Create/edit + tags + share
    │   │   ├── SharedNotes.tsx         # Notes shared with me
    │   │   ├── Notifications.tsx       # Notification list
    │   │   └── AdminPanel.tsx          # Admin dashboard
    │   ├── types/
    │   │   └── index.ts                # TypeScript interfaces
    │   ├── App.tsx                     # Routes
    │   └── main.tsx                    # Entry point
    ├── .env
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+



### 2. Backend setup

```bash
cd smart-notes-backend

# Create and activate virtual environment
python -m venv venv
# source venv/bin/activate        # Mac/Linux
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt


### 3. Database setup

```bash
# Create the database in PostgreSQL
psql -U postgres
CREATE DATABASE smartnotes;
\q

# Run migrations
alembic upgrade head
```

### 4. Start the backend

```bash
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 5. Frontend setup

```bash
cd smart-notes-frontend

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
```

### 6. Start the frontend

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### backend/.env

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/smartnotes

# JWT secret key — use a long random string in production
SECRET_KEY=your-super-secret-key-change-this-in-production

# JWT algorithm
ALGORITHM=HS256

# Access token expiry in minutes (15 recommended)
ACCESS_TOKEN_EXPIRE_MINUTES=15

# Google OAuth credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Database Setup

### Tables

| Table | Description |
|---|---|
| `users` | User accounts with roles and active status |
| `notes` | Notes owned by users |
| `tags` | Global tags (shared across all users) |
| `note_tags` | Many-to-many bridge: notes ↔ tags |
| `shared_notes` | Tracks which notes are shared with which users |
| `notifications` | In-app notifications per user |

### Migrations

```bash
# Apply all migrations
alembic upgrade head

# Create a new migration after changing models.py
alembic revision --autogenerate -m "description"

# Roll back one migration
alembic downgrade -1

# Roll back all migrations
alembic downgrade base

# Check current migration
alembic current

# View migration history
alembic history
```

### Promote a user to admin manually

The first registered user is automatically assigned the admin role. To manually promote a user:

```sql
UPDATE users SET role = 'admin' WHERE email = 'yourname@example.com';
```

---

## API Reference

### Auth — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, sets `HttpOnly` access and refresh cookies |
| POST | `/logout` | Yes | Logout, clears refresh token in DB and clears cookies |
| POST | `/refresh` | No | Reads refresh cookie, sets new `HttpOnly` cookie pair |
| GET | `/me` | Yes | Get current user profile |
| PUT | `/me/password` | Yes | Change password |
| GET | `/google/login` | No | Redirect to Google login |
| GET | `/google/callback` | No | Google OAuth callback, sets cookies and redirects |

### Notes — `/api/notes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Create note |
| GET | `/` | Yes | List my notes (paginated) |
| GET | `/search` | Yes | Search + filter notes |
| GET | `/{id}` | Yes | Get one note |
| PUT | `/{id}` | Yes | Update note (owner or edit-permission) |
| DELETE | `/{id}` | Yes | Delete note (owner only) |
| PATCH | `/{id}/archive` | Yes | Toggle archive (owner only) |

### Tags — `/api/tags`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Create tag |
| GET | `/` | Yes | List all tags |
| GET | `/{id}` | Yes | Get tag |
| DELETE | `/{id}` | Yes | Delete tag |
| POST | `/notes/{note_id}/tags/{tag_id}` | Yes | Add tag to note |
| DELETE | `/notes/{note_id}/tags/{tag_id}` | Yes | Remove tag from note |
| GET | `/{tag_id}/notes` | Yes | Get notes by tag |

### Share — `/api/share`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/{note_id}` | Yes | Share note with user by email |
| GET | `/{note_id}/users` | Yes | List users note is shared with |
| GET | `/me/notes` | Yes | Notes shared with me |
| PATCH | `/{note_id}/users/{user_id}` | Yes | Update share permission |
| DELETE | `/{note_id}/users/{user_id}` | Yes | Revoke share |

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List notifications (paginated) |
| GET | `/unread-count` | Yes | Get unread count |
| PATCH | `/{id}/read` | Yes | Mark as read |
| PATCH | `/read-all` | Yes | Mark all as read |
| DELETE | `/{id}` | Yes | Delete notification |
| DELETE | `/clear-all` | Yes | Clear all notifications |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users |
| GET | `/users/{id}` | Admin | Get user detail |
| GET | `/users/{id}/notes` | Admin | View user's notes |
| PATCH | `/users/{id}/deactivate` | Admin | Deactivate user |
| PATCH | `/users/{id}/reactivate` | Admin | Reactivate user |
| DELETE | `/users/{id}` | Admin | Delete user permanently |
| GET | `/stats` | Admin | Platform statistics |

---

## Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/auth/google/callback` | Google OAuth handler | Public |
| `/dashboard` | Notes grid + search + filters | Protected |
| `/notes/new` | Create note | Protected |
| `/notes/:id` | Edit note + tags + share | Protected |
| `/shared` | Notes shared with me | Protected |
| `/notifications` | Notification list | Protected |
| `/admin` | Admin panel | Admin only |

---

## Authentication

### HttpOnly Cookie System

For enhanced security against Cross-Site Scripting (XSS) attacks, this application does not store tokens in `localStorage` or memory. Instead, it relies on a secure, backend-driven cookie system:

**Access token** — Short-lived JWT (15 minutes). Sent automatically by the browser via `HttpOnly` cookies on every API request.
**Refresh token** — Long-lived random string. Stored hashed in the database and sent as an `HttpOnly` cookie.

*Note: The frontend Axios client uses `withCredentials: true` to ensure cookies are automatically attached to all cross-origin requests.*

### Refresh Token Rotation & Concurrency Queue

Every time a refresh token is used, it is replaced with a new one. This means a stolen refresh token can only be used once. 

To handle complex UI states where multiple components might make simultaneous API calls when a token expires, the frontend utilizes an **Axios Interceptor Queue**. 

**How the optimized flow works:**

1. Multiple concurrent requests fire (e.g., fetching notes, fetching notifications) while the `access_token` is expired.
2. All requests fail with a `401 Unauthorized`.
3. The Axios interceptor catches the first 401 and flags `isRefreshing = true`. 
4. The interceptor pauses all subsequent 401 requests, placing them into a **promise queue**.
5. A single `POST /api/users/refresh` request is made.
6. The backend validates the refresh cookie and attaches newly minted `HttpOnly` cookies to the response.
7. The interceptor resolves the queue, automatically retrying all the originally failed requests with the new cookies seamlessly.

If the refresh token is also expired or invalid, the queue rejects all requests, clears the session state, and redirects the user to the login screen.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project
3. Go to APIs & Services → OAuth Consent Screen → External
4. Go to Credentials → Create OAuth Client ID → Web application
5. Add authorized redirect URI: `http://localhost:8000/api/users/google/callback`
6. Copy Client ID and Client Secret to `backend/.env`

---

## Sharing & Notifications

### Share Permissions

| Permission | Can read | Can edit title/content/tags | Can archive | Can delete |
|---|---|---|---|---|
| `view` | ✅ | ❌ | ❌ | ❌ |
| `edit` | ✅ | ✅ | ❌ | ❌ |
| Owner | ✅ | ✅ | ✅ | ✅ |

### Notification Triggers

| Action | Who gets notified |
|---|---|
| Shared note edited | Note owner + all other shared users (except the editor) |
| Note shared with user | The user who was given access |

---

## Admin Panel

### Rules

- Only **one admin** exists at any time
- The **first registered user** is automatically assigned admin role
- Admin role cannot be changed via API — requires direct database update
- Admin cannot deactivate, delete, or modify other admin accounts
- Admin cannot deactivate or delete their own account
- Deleting a user permanently removes all their notes, notifications, and share records (cascade)

### Platform Stats

The `/api/admin/stats` endpoint returns a snapshot of the entire platform:

```json
{
  "users": { "total": 10, "active": 8, "inactive": 2 },
  "notes": { "total": 45, "archived": 5, "active": 40 },
  "tags": 12,
  "active_shares": 7,
  "unread_notifications": 3
}
```

---

## 🧪 Testing
The backend includes a comprehensive automated test suite powered by Pytest. These tests ensure that the API logic, authentication flow, and database constraints remain stable as the codebase grows.

### Test Coverage
- Authentication: Registration, login, token refresh rotation, and protected route access.
- Notes CRUD: Full lifecycle of a note (Create, Read, Update, Delete) with strict ownership checks.
- Tags: Creation of global tags and association logic with notes.
- Permissions: Verification of the sharing system (e.g., ensuring a user with view permission cannot perform an edit action).
- Admin Security: Validating that admin-only endpoints reject non-admin users.

### Running Tests
To run the test suite, ensure your virtual environment is active and use the following commands:

```json
cd smart-notes-backend
```

### Run all tests
```json
pytest
```

### Run tests with detailed output (verbose)
```json
pytest -v
```

### Test Configuration
- The tests are designed to be isolated and repeatable:
- Isolated Database: Uses a separate test database initialized via conftest.py to prevent data loss in development.
- Async Testing: Utilizes httpx for testing FastAPI's endpoints efficiently.
- Clean Slate: Database tables are managed securely during test execution to ensure consistency across test runs.

---

## Future Work

These features were intentionally left out to keep the project simple but can be added later without breaking any existing code:

| Feature | Description |
|---|---|
| Background tasks | Move notification creation off the request thread using FastAPI `BackgroundTasks` |
| Email notifications | Send email on share/edit using SendGrid or Resend |
| WebSocket notifications | Replace polling with real-time notifications |
| Rich text editor | Replace the plain textarea with TipTap or Quill |
| Change Password | Allow a user or admin to change password |
| Note colors | Add a `color` column and let users color-code notes |
| File attachments | Add S3 or Cloudflare R2 file uploads |
| Rate limiting | Add slowapi to prevent brute-force on auth endpoints |
| Redis token blocklist | Instantly invalidate access tokens on logout |
| Drag to reorder | Let users reorder notes on the dashboard |

---
