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

If the project is in a different XAMPP folder name, he/she must update that path so it matches their own `htdocs` folder exactly. For example, if they extracted the project as `event-management-system`, the API URL should point to `http://localhost/event-management-system/backend/api`.

The frontend now also falls back to the current machine hostname instead of forcing `localhost`, which helps when someone opens the frontend with `127.0.0.1` or a LAN IP.

## Common Login Issue On Another Laptop

If login does nothing or always fails on one machine while it works on others, check these first:

1. Open the frontend and backend with the same host name style on that laptop. Example: use `localhost` for both, or use `127.0.0.1` for both.
2. Make sure `.env` points to the correct XAMPP project folder path for that laptop.
3. Confirm Apache and MySQL are both running in XAMPP before trying to log in.
4. If the frontend is opened from another device on the same network, add its exact origin to `ALLOWED_ORIGINS` in the Apache/PHP environment.

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
