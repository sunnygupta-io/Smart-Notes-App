# Smart Notes App

A full-stack note-taking application inspired by Google Keep and Notion. Users can create, edit, archive, tag, search, and share notes. Shared notes trigger real-time notifications. Admins can manage users and view platform stats.

<br />
<div align="center">
  <img src="./assets/Dashboard.png" alt="Smart Notes Dashboard" width="800" />
</div>
<br />

---

## Table of Contents

- [Application Showcase](#application-showcase)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [API Workflows](#api-workflows)
- [Authentication](#authentication)
- [Sharing & Notifications](#sharing--notifications)
- [Admin Panel](#admin-panel)
- [Testing](#testing)
- [Future Work](#future-work)

---

## Application Showcase

#### Login
<div align="center">
  <img src="./assets/Login.png" alt="Login" width="800" />
</div>
<br />

#### Register
<div align="center">
  <img src="./assets/Register.png" alt="Register" width="800" />
</div>
<br />

#### NoteEditor
<div align="center">
  <img src="./assets/NoteEditor.png" alt="NoteEditor" width="800" />
</div>
<br />

#### Tags
<div align="center">
  <img src="./assets/Tag.png" alt="Tag" width="800" />
</div>
<br />

#### Share
<div align="center">
  <img src="./assets/Share.png" alt="Share" width="800" />
</div>
<br />

#### ShareWithMe
<div align="center">
  <img src="./assets/ShareWithMe.png" alt="ShareWithMe" width="800" />
</div>
<br />

#### Notifications
<div align="center">
  <img src="./assets/Notifications.png" alt="Notifications" width="800" />
</div>
<br />

#### AdminPanel
<div align="center">
  <img src="./assets/AdminPanel.png" alt="AdminPanel" width="800" />
</div>
<br />

#### AdminNotesView
<div align="center">
  <img src="./assets/AdminNotesView.png" alt="AdminNotesView" width="800" />
</div>
<br />

#### NoteEditor
<div align="center">
  <img src="./assets/NoteEditor.png" alt="NoteEditor" width="800" />
</div>
<br />

---

## Features

### Users
- Register and login with email + password
- Login with Google OAuth
- Secure Authentication: JWTs are stored exclusively in `HttpOnly` cookies to prevent XSS attacks.
- Optimized Refresh Flow: Axios interceptor queue prevents race conditions by pausing concurrent failed requests and grouping them into a single token refresh call.
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
│   └── requirements.txt
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
    │   ├── hooks/
    │   │   └── useAuth.ts              # helper hook
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
    │   ├── index.css                   # Css file
    │   └── main.tsx                    # Entry point
    ├── .env
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts

```
---


## Getting Started

### 1. Prerequisites

- Python
- Node.js
- PostgreSQL



### 2. Backend setup

```bash
cd smart-notes-backend
```

#### Create and activate virtual environment
```bash
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows
```
#### Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Database setup

```bash
# Create the database in PostgreSQL
CREATE DATABASE smartnotes;

# Run migrations
alembic upgrade head
```

### 4. Start the backend

```bash
uvicorn app.main:app --reload
```

- Backend runs at: `http://localhost:8000`
- API docs at: `http://localhost:8000/docs`

### 5. Frontend setup

```bash
cd smart-notes-frontend

# Install dependencies
npm install

```

### 6. Start the frontend

```bash
npm run dev
```

- Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### backend/.env

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/smartnotes

SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS = 7

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
REDIRECT_URI = "http://localhost:8000/api/users/google/callback"
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


### Frontend Pages & Access Levels

| Route | Page Component | Access Level |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/auth/google/callback` | Google OAuth handler | Public |
| `/dashboard` | Notes grid + search + filters | Protected (Auth Required) |
| `/notes/new` | Create note | Protected (Auth Required) |
| `/notes/:id` | Edit note + tags + share | Protected (Auth Required) |
| `/shared` | Notes shared with me | Protected (Auth Required) |
| `/notifications` | Notification list | Protected (Auth Required) |
| `/admin` | Admin panel | Admin Only |

---

## API Workflows

### 1. Secure User Login workflow (POST `/api/users/login`)

#### Authentication Architecture

- JWT tokens are stored in HttpOnly cookies to prevent XSS attacks (not in localStorage)
- FastAPI backend sets tokens directly in response cookies
- Frontend (Zustand) fetches the user profile and manages global auth state
- Secure, production-ready login flow without exposing tokens to JavaScript

#### Backend API Logic (FastAPI)

```text
ENDPOINT POST /api/users/login:
   
    RECEIVE payload: {email, password}

    FIND user IN database WHERE user.email == payload.email

    IF user NOT FOUND OR verify_bcrypt(payload.password, user.password_hash) IS FALSE:
         THROW 401 Unauthorized ("Incorrect email or password)
    
    IF user.is_active IS FALSE:
         THROW 403 Forbidden ("Account deactivated")

    SET access_token = CREATE_JWT(payload={user_id}, expiry=15_minutes)
    SET plain_refresh_token = GENERATE_SECURE_RANDOM_STRING()

    UPDATE user SET refresh_token = hash_bcrypt(plain_refresh_token)

    ATTACH_COOKIE(name="access_token", value=access_token, HttpOnly=True, SameSite="Lax")
    ATTACH_COOKIE(name="refresh_token", value=plain_refresh_token, HttpOnly=True, SameSite="Lax")

    RETURN 200 OK ("User login Successfully")
```

#### Frontend logic (React + Zustand)

```text
COMPONENT LoginUI:
   ON formSubmit(email, password)
      SET isLoading = TRUE

      TRY: 
          AWAIT api.post('users/login', {email, password})

          AWAIT authStore.login()

          SET globalState.user = Fetched_User_Profile
          REDIRECT TO "/dashboard"
      
      CATCH API_ERROR:
          DISPLAY error.message

      FINALLY: 
          SET isLoading = FALSE     
```

### 2. Axios Interceptor & Concurrent Token Refresh Queue

#### Token Refresh Flow (Axios Interceptor)

- When the access token expires, multiple API calls may fail with `401 Unauthorized`
- Instead of sending multiple refresh requests, only one refresh call is made
- Other failed requests are paused in a queue
- After successful refresh, all queued requests are retried automatically
- Prevents race conditions and unexpected logouts

#### Interceptor Pseudo-code Flow

```text
SET isRefreshing = FALSE
SET requestQueue = []  

ON API ERROR RESPONSE (error):
    SET originalRequest = error.config
    
    IF error.status == 401 AND originalRequest._retry IS FALSE AND endpoint IS NOT auth:
        SET originalRequest._retry = TRUE
        
        IF isRefreshing IS TRUE:
            RETURN NEW PROMISE:
                ADD callback TO requestQueue
                
                WHEN callback is triggered (err):
                    IF err EXISTS -> REJECT promise
                    ELSE -> RETRY originalRequest AND RESOLVE
                    
        IF isRefreshing IS FALSE:
            SET isRefreshing = TRUE
            
            TRY:
                AWAIT api.post("/users/refresh", withCredentials=TRUE)
                
                SET isRefreshing = FALSE
                FOR EACH callback IN requestQueue:
                    TRIGGER callback(null)
                CLEAR requestQueue
                
                RETURN RETRY originalRequest
                
            CATCH refreshError:
                SET isRefreshing = FALSE
                
                FOR EACH callback IN requestQueue:
                    TRIGGER callback(refreshError)
                CLEAR requestQueue
                
                TRIGGER globalAuthStore.logout()
                REDIRECT TO "/login"
                
                RETURN REJECT refreshError
                
    RETURN REJECT error
```

### 3. Search Notes workflow (GET `/api/notes/search`)

- Backend builds SQL queries dynamically based on URL parameters
- Filtering is done directly in the database (not in memory)
- Improves performance and scalability
- Query is executed only during the pagination step
- Ensures efficient and optimized data fetching

#### Backend API Logic Flow (FastAPI + SQLAlchemy)

```text
ENDPOINT GET /api/notes/search:
    REQUIRE AuthToken -> Extract current_user
    
    QUERY = SELECT * FROM notes WHERE owner_id == current_user.id
    
    IF keyword EXISTS:
        APPEND TO QUERY: WHERE (title CONTAINS keyword) OR (content CONTAINS keyword)
        
    IF tag_id EXISTS:
        APPEND TO QUERY: WHERE (note.tags INCLUDES tag_id)
        
    IF is_archived EXISTS:
        APPEND TO QUERY: WHERE (note.is_archived == is_archived)
        
    IF date_from EXISTS:
        APPEND TO QUERY: WHERE (note.created_at >= date_from)
        
    IF date_to EXISTS:
        APPEND TO QUERY: WHERE (note.created_at <= date_to)
        
    SET total_matches = EXECUTE COUNT(QUERY)
    
    SET offset = (page - 1) * page_size
    
    APPEND TO QUERY:
        ORDER BY created_at DESCENDING
        SKIP offset
        TAKE page_size
        
    SET final_notes = EXECUTE(QUERY)
    IF total_matches > 0:
        SET calculated_total_pages = INTEGER_DIVIDE((total_matches + page_size - 1), page_size)
    ELSE:
        SET calculated_total_pages = 0
    
    RETURN 200 OK:
        {
            "total": total_matches,
            "page": current_page,
            "page_size": page_size,
            "total_pages": calculated_total_pages,
            "items": final_notes
        }
```

### 4. Update Note workflow (PUT `/api/notes/{id}`)

#### Authorization & Safe Updates
- Checks if the user is owner or has edit access
- Only allows update if user has permission
- Supports updating only the fields that are provided
- Sends a notification after update
- If notification fails, the note is still saved
- Prevents errors in notification from affecting main functionality

#### Backend API Logic Flow (FastAPI)

```text
ENDPOINT PUT /api/notes/{id}:
    REQUIRE AuthToken -> Extract current_user
    
    FETCH note FROM database WHERE id == note_id
    IF note NOT FOUND -> THROW 404 Not Found
    
    SET is_owner = (note.owner_id == current_user.id)
    SET has_edit_rights = EVALUATE (current_user IN note.shares AND permission == "edit")
    
    IF NOT is_owner AND NOT has_edit_rights:
        THROW 403 Forbidden
        
    IF payload.title EXISTS:
        SET note.title = payload.title
        
    IF payload.content EXISTS:
        SET note.content = payload.content
        
    IF payload.tag_ids EXISTS:
        FETCH valid_tags FROM database WHERE id IN payload.tag_ids
        SET note.tags = valid_tags
        
    COMMIT database transaction
    
    TRY:
        EXECUTE notify_shared_users(note, current_user)
    CATCH notification_error:
        LOG notification_error
        
    RETURN 200 OK (note)
```

### 5. Create Note workflow (POST `/api/notes/`)

#### Data Ownership & Tag Handling

- Gets owner_id securely from the JWT token
- Ensures users can only access their own data
- Handles tags using a many-to-many relationship
- Validates tag IDs before linking
- Ignores invalid tags and logs a warning
- Saves the note successfully without breaking the flow

#### Backend API Logic Flow (FastAPI)

```text
ENDPOINT POST /api/notes/:
    REQUIRE AuthToken -> Extract current_user
    RECEIVE payload: { title, content, tag_ids }
    
    SET new_note = INITIALIZE Note:
        title = payload.title
        content = payload.content
        owner_id = current_user.id
        is_archived = FALSE
        
    IF payload.tag_ids IS NOT EMPTY:
        FETCH valid_tags FROM database WHERE id IN payload.tag_ids
        
        IF COUNT(valid_tags) != COUNT(payload.tag_ids):
            SET missing_tags = payload.tag_ids MINUS valid_tags.ids
            LOG WARNING "Tag IDs not found: " + missing_tags
            
        SET new_note.tags = valid_tags
        
    SAVE new_note TO database
    COMMIT database transaction
    REFRESH new_note state
    
    RETURN 201 Created (new_note)
  
```

### 6. List All Users  (GET `/api/admin/users`)

#### Admin Access & Efficient Data Fetching

- Only admin users can access this endpoint (RBAC check)
- Permission is verified before any database operation
- Uses dynamic query building for filtering and pagination
- Handles large data efficiently
- Ensures fast and secure loading of admin dashboard

#### Backend API Logic Flow (FastAPI + SQLAlchemy)

```text
ENDPOINT GET /api/admin/users:
    REQUIRE AuthToken -> Extract current_user
    VERIFY current_user.role == "admin" ELSE THROW 401 Unauthorized
    
    QUERY = SELECT * FROM users
    
    IF is_active EXISTS:
        APPEND TO QUERY: WHERE is_active == is_active
        
    IF role EXISTS:
        IF role NOT IN ["user", "admin"]:
            THROW 400 Bad Request
        APPEND TO QUERY: WHERE role == role
        
    SET total_matches = EXECUTE COUNT(QUERY)
    
    SET offset = (page - 1) * page_size
    
    APPEND TO QUERY:
        ORDER BY created_at DESCENDING
        SKIP offset
        TAKE page_size
        
    SET final_users = EXECUTE(QUERY)
    
    IF total_matches > 0:
        SET calculated_total_pages = INTEGER_DIVIDE((total_matches + page_size - 1), page_size)
    ELSE:
        SET calculated_total_pages = 0
        
    RETURN 200 OK:
        {
            "total": total_matches,
            "page": current_page,
            "page_size": page_size,
            "total_pages": calculated_total_pages,
            "items": final_users
        }

```

### 7. Platform Stats workflow (GET `/api/admin/stats`)

#### Admin Dashboard Stats

- Acts as a central place to get platform statistics
- Runs fast `COUNT` queries on multiple tables (users, notes, tags, etc.)
- Does not return full data, only aggregated numbers
- Combines all counts into a structured JSON response
- Gives a quick overview of system usage and health

#### Backend API Logic Flow (FastAPI + SQLAlchemy)

```text
ENDPOINT GET /api/admin/stats:
    REQUIRE AuthToken -> Extract current_user
    VERIFY current_user.role == "admin" ELSE THROW 401 Unauthorized
    
    COUNT total_users FROM users
    COUNT active_users FROM users WHERE is_active IS TRUE
    COUNT inactive_users FROM users WHERE is_active IS FALSE
    
    COUNT total_notes FROM notes
    COUNT archived_notes FROM notes WHERE is_archived IS TRUE
    SET active_notes = (total_notes - archived_notes)
    
    COUNT total_tags FROM tags
    COUNT total_shares FROM shared_notes
    
    COUNT unread_notifs FROM notifications WHERE is_read IS FALSE
    
    RETURN 200 OK:
        {
            "users": { "total", "active", "inactive" },
            "notes": { "total", "archived", "active" },
            "tags": total_tags,
            "active_shares": total_shares,
            "unread_notifications": unread_notifs
        }
```

### 8. Refresh Token workflow (POST `/api/users/refresh`)

#### Refresh Token Rotation

- Generates a new access token when the old one expires
- Also creates a new refresh token each time
- Old refresh token is invalidated (no longer usable)
- Prevents session hijacking if a token is stolen
- Ensures better security for user sessions

#### Backend API Logic Flow (FastAPI)

```text
ENDPOINT POST /api/users/refresh:
    EXTRACT refresh_token FROM Request Cookies
    IF refresh_token IS MISSING -> THROW 401 Unauthorized
    
    FETCH all active users with non-null refresh tokens
    
    FOR EACH user IN active_users:
        IF verify_bcrypt(refresh_token, user.hashed_refresh_token) IS TRUE:
            SET matched_user = user
            BREAK LOOP
            
    IF matched_user IS NULL:
        THROW 401 Unauthorized ("Invalid or expired refresh token")
        
    SET new_access_token = CREATE_JWT(user_id=matched_user.id)
    SET new_plain_refresh_token = GENERATE_SECURE_RANDOM_STRING()
    
    UPDATE matched_user SET refresh_token = hash_bcrypt(new_plain_refresh_token)
    SAVE database
    
    ATTACH_COOKIE(name="access_token", value=new_access_token, HttpOnly=True)
    ATTACH_COOKIE(name="refresh_token", value=new_plain_refresh_token, HttpOnly=True)
    
    RETURN 200 OK ("Tokens refreshed")
```

### 9. Google OAuth2 Authentication workflow (GET `/google/login` & `/google/callback`)

#### Google OAuth Login Flow

- Uses Google to handle user login (no passwords stored in our system)
- User is redirected to Google for authentication
- After success, backend handles the callback
- Automatically registers new users or logs in existing ones
- Creates a session using secure HttpOnly cookies
- Connects Google account with internal user system

#### Google Authentication Logic Flow

```text
STEP 1: USER INITIATION (GET /google/login)
    CONSTRUCT Google Authorization URL with:
        - Client ID & Redirect URI
        - Scopes: "openid", "email", "profile"
        - Response Type: "code"
    URL_ENCODE parameters for safety
    REDIRECT user to Google's Consent Screen

STEP 2: GOOGLE HANDSHAKE (User provides consent)
    GOOGLE REDIRECTS user back to /google/callback?code=AUTH_CODE

STEP 3: TOKEN EXCHANGE (Server-to-Server)
    EXTRACT AUTH_CODE from URL
    REQUEST token from Google (POST settings.GOOGLE_TOKEN_URL)
    IF Exchange Fails -> THROW 400 Bad Request
    RECEIVE access_token from Google

STEP 4: IDENTITY RETRIEVAL
    REQUEST user profile from Google using the access_token
    IF Retrieval Fails -> THROW 400 Bad Request
    EXTRACT email and verified_status
    IF email NOT verified -> THROW 400 Bad Request

STEP 5: JIT PROVISIONING & SESSION MAPPING
    SEARCH database for User by email
    
    IF User NOT FOUND:
        CREATE new User (email, role="user", active=TRUE)
        SAVE to database
        LOG "New user via Google OAuth"
    
    ELSE (User EXISTS):
        IF user.is_active IS FALSE -> THROW 403 Forbidden
        LOG "Existing user login"

STEP 6: SESSION FINALIZATION
    GENERATE internal JWT access_token and refresh_token
    SET HttpOnly Cookies with internal tokens
    REDIRECT user to Frontend Dashboard
```
### 10. Add Tag to Note workflow (POST `/api/notes/{id}/tags/{id}`)

#### Notes & Tags

- Checks ownership before linking
- Avoids duplicate relations
- Returns success if already linked
- Keeps data clean and efficient

#### Backend API Logic Flow (FastAPI)
```text
ENDPOINT POST /api/notes/{note_id}/tags/{tag_id}:
    REQUIRE AuthToken -> Extract current_user
    
    FETCH note FROM database WHERE id == note_id
    IF note NOT FOUND -> THROW 404 Not Found
    
    VERIFY (note.owner_id == current_user.id) 
    ELSE -> THROW 403 Forbidden
    
    FETCH tag FROM database WHERE id == tag_id AND owner_id == current_user.id
    IF tag NOT FOUND -> THROW 404 Not Found
    
    IF tag IS ALREADY IN note.tags:
        LOG "Tag already associated"
        RETURN 200 OK (note)
        
    APPEND tag TO note.tags
    COMMIT database transaction
    REFRESH note state
    
    LOG "Tag successfully linked to note"
    RETURN 200 OK (note)
```

### 11. Note Sharing workflow (POST `/api/share/{note_id}`)

#### Note Sharing

- Prevents sharing with self or admins
- Uses upsert (create or update share)
- Updates permissions if already shared
- Sends notification after sharing
- Notification failure won’t break the process

#### Backend API Logic Flow (FastAPI)

```text
ENDPOINT POST /api/share/{note_id}:
    REQUIRE AuthToken -> Extract current_user
    RECEIVE payload: { shared_with_email, permission }
    
    FETCH note FROM database WHERE id == note_id
    IF note NOT FOUND -> THROW 404 Not Found
    
    VERIFY (note.owner_id == current_user.id) 
    ELSE -> THROW 403 Forbidden
    
    FETCH target_user FROM database WHERE email == payload.shared_with_email
    IF target_user NOT FOUND -> THROW 404 Not Found
    
    IF target_user.id == current_user.id:
        THROW 400 Bad Request
        
    IF target_user.role == "admin":
        THROW 403 Forbidden
        
    FETCH existing_share FROM shared_notes WHERE note_id == note_id AND shared_with == target_user.id
    
    IF existing_share EXISTS:
        SET existing_share.permission = payload.permission
        COMMIT database transaction
        SET share_record = existing_share
    ELSE:
        CREATE new_share (note_id, target_user.id, payload.permission)
        SAVE new_share TO database
        COMMIT database transaction
        SET share_record = new_share
        
    TRY:
        EXECUTE notify_note_shared(note, target_user, current_user, permission)
    CATCH notification_error:
        LOG notification_error
        
    RETURN 201 Created (share_record)
  ```
### 12. Update Share Permissions Workflow (PATCH `/api/share/{note_id}/users/{user_id}`)

  #### Update Share Permissions

- Only the note owner can change access rights
- Uses PATCH for small, targeted updates
- Updates only the required permission field
- No need to send full data again

#### Backend API Logic Flow (FastAPI)

```text
ENDPOINT PATCH /api/share/{note_id}/users/{user_id}:
    REQUIRE AuthToken -> Extract current_user
    RECEIVE payload: { permission }
    
    FETCH note FROM database WHERE id == note_id
    IF note NOT FOUND -> THROW 404 Not Found
    
    VERIFY (note.owner_id == current_user.id) 
    ELSE -> THROW 403 Forbidden
    
    FETCH share_record FROM shared_notes 
        WHERE note_id == note_id AND shared_with_user_id == user_id
        
    IF share_record NOT FOUND:
        THROW 404 Not Found
        
    SET share_record.permission = payload.permission
    
    COMMIT database transaction
    REFRESH share_record state
    
    RETURN 200 OK (share_record)
```
### 13. Notification Broadcaster workflow
#### Notifications
- Decides who gets notified
- Avoids duplicate notifications
- Saves all notifications together
- Faster than saving one by one

#### Business Logic Flow

```text
FUNCTION notify_shared_users(note, edited_by):
    SET users_to_notify = EMPTY SET
    
    IF note.owner_id IS NOT edited_by.id:
        ADD note.owner_id TO users_to_notify
        
    FETCH shared_entries FROM shared_notes WHERE note_id == note.id
    
    FOR EACH share IN shared_entries:
        IF share.shared_with_user_id IS NOT edited_by.id:
            ADD share.shared_with_user_id TO users_to_notify
            
    IF users_to_notify IS EMPTY:
        RETURN
        
    SET notification_message = "Note '{note.title}' was edited by {edited_by.email}"
    SET new_notifications = EMPTY LIST
    
    FOR EACH user_id IN users_to_notify:
        CREATE Notification(user_id, notification_message, is_read=FALSE)
        APPEND TO new_notifications
        
    BULK SAVE new_notifications TO database
    COMMIT database transaction
```
### 14. Share Alert Trigger workflow
#### Notification Helper

- Used in sharing flow  
- Creates and saves notification  
- Keeps code clean and reusable  

#### Business Logic Flow

```text
FUNCTION notify_shared_users(note, edited_by):
    SET users_to_notify = EMPTY SET
    
    IF note.owner_id IS NOT edited_by.id:
        ADD note.owner_id TO users_to_notify
        
    FETCH shared_entries FROM shared_notes WHERE note_id == note.id
    
    FOR EACH share IN shared_entries:
        IF share.shared_with_user_id IS NOT edited_by.id:
            ADD share.shared_with_user_id TO users_to_notify
            
    IF users_to_notify IS EMPTY:
        RETURN
        
    SET notification_message = "Note '{note.title}' was edited by {edited_by.email}"
    SET new_notifications = EMPTY LIST
    
    FOR EACH user_id IN users_to_notify:
        CREATE Notification(user_id, notification_message, is_read=FALSE)
        APPEND TO new_notifications
        
    BULK SAVE new_notifications TO database
    COMMIT database transaction
```

---

## Authentication

### HttpOnly Cookie System

For enhanced security against Cross-Site Scripting (XSS) attacks, this application does not store tokens in `localStorage` or memory. Instead, it relies on a secure, backend-driven cookie system:

- **Access token**: Short-lived JWT (15 minutes). Sent automatically by the browser via `HttpOnly` cookies on every API request.
- **Refresh token**: Long-lived random string. Stored hashed in the database and sent as an `HttpOnly` cookie.

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
| `view` | True | False | False | False |
| `edit` | True | True | False | False |
| Owner | True | True | True | True |

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

---

## Testing
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
| Change Password | Allow a user or admin to change password(Not implemented in UI)|
| Rich text editor | Replace the plain textarea with TipTap or Quill |
| WebSocket notifications | Replace polling with real-time notifications |
| Rate limiting | Add slowapi to prevent brute-force on auth endpoints |
| Redis token blocklist | Instantly invalidate access tokens on logout |

---
