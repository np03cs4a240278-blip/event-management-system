# Event Management System

This is a beginner-friendly event management project with a React frontend and a PHP backend API.

## What The Project Does

- Users can sign up, log in, browse events, and book events.
- Admin users can create, edit, delete, and review events and bookings.
- Authentication state is stored in the frontend context so protected pages stay private.

## Main Folders

- `src/` contains the React frontend.
- `src/pages/` contains page-level screens.
- `src/components/` contains reusable UI parts like the sidebar and navbar.
- `src/context/AuthContext.js` manages logged-in user data.
- `src/services/api.js` stores the Axios API connection.
- `backend/` contains the PHP API files.
- `database/` contains database-related files.

## Run The Project

1. Install packages with `npm install`
2. Start the frontend with `npm start`
3. Open `http://localhost:3000`

## Environment Variable

Copy `.env.example` and set:

```env
REACT_APP_API_BASE_URL=http://localhost/event-management-system-main/backend/api
```

## Build For Production

Run:

```bash
npm run build
```

The production files will be created in the `build/` folder.

## Storage Tip

The `node_modules/` and `build/` folders are generated automatically. If you need to reduce project size before sharing or submitting, you can delete them and recreate them later with:

```bash
npm install
npm run build
```

