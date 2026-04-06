# Zorvyn Finance Dashboard

Full-stack finance management application with React frontend and Node.js backend, featuring role-based access control and comprehensive financial record management.

## Features
- **User Management**: Create, update, delete users with role-based permissions (viewer, analyst, admin)
- **Financial Records**: Track income and expenses with categories, amounts, dates, and notes
- **Dashboard**: Overview cards, category breakdowns, and recent transactions
- **Authentication**: Token-based auth with role-based access control
- **Data Persistence**: JSON file storage
- **Responsive UI**: Modern React interface with clean styling

## Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: React, Vite
- **Styling**: CSS
- **Data Storage**: JSON file

## Setup & Running

### Prerequisites
- Node.js (v14+)
- npm

### Installation
1. Clone/download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode (Recommended for development)
1. Start the backend in one terminal:
   ```bash
   npm run dev
   ```
   Backend runs at `http://localhost:4000`

2. Start the frontend in another terminal:
   ```bash
   npm run dev:frontend
   ```
   Frontend runs at `http://localhost:5173`

#### Production Mode
Build and run the full application:
```bash
npm run build:start
```
Application available at `http://localhost:4000`

## Demo Accounts
- **Admin**: admin@example.com / admin123
- **Analyst**: analyst@example.com / analytic123
- **Viewer**: viewer@example.com / view123

## API Documentation

### Authentication
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user info (requires auth)

### Users (Admin only for create/update/delete)
- `GET /users` - List all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Records
- `GET /records` - List records (with optional filters)
- `POST /records` - Create record (admin only)
- `GET /records/:id` - Get single record
- `PUT /records/:id` - Update record (admin only)
- `DELETE /records/:id` - Delete record (admin only)

### Summary
- `GET /summary/overview` - Financial overview
- `GET /summary/categories` - Category totals
- `GET /summary/trends` - Monthly/weekly trends
- `GET /summary/recent` - Recent transactions

## Development
- Backend tests: `npm test`
- Frontend dev server: `npm run dev:frontend`
- Backend dev server: `npm run dev`

### Summary endpoints (all roles)
- GET `/summary/overview`
- GET `/summary/categories`
- GET `/summary/trends?interval=weekly|monthly`
- GET `/summary/recent?limit=N`

## Deploy to Vercel
1. Install Vercel CLI if needed:
   - `npm install -g vercel`
2. In project root run:
   - `vercel login`
   - `vercel` (accept prompts, choose scope and project name)
3. For local test emulation:
   - `vercel dev`

Notes:
- `vercel.json` routes all paths to `app.js`.
- `api/index.js` exports Express app for serverless handler compatibility.

## Vite usage (optional frontend)
1. Install Vite:
   - `npm install --save-dev vite`
2. Add package script:
   - `"dev": "vite"`
3. Start frontend app:
   - `npm run dev`
4. API calls should point to `/api` proxy to backend (via `vite.config.js`).

## Assumptions and tradeoffs
- Minimal dependencies for clarity.
- Simple token store in JSON file (not secure for prod).
- Passwords stored plaintext (for assessment only).
- No pagination beyond summary limit.
- Role model matches requirements.

