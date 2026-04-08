<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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

If a friend keeps the project in a different XAMPP folder name, they must update that path so it matches their own `htdocs` folder exactly. For example, if they extracted the project as `event-management-system`, the API URL should point to `http://localhost/event-management-system/backend/api`.

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

>>>>>>> Backend
