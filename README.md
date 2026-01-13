# Coding-Platform
A platform on which we can conduct quiz.

## Front End
React will be the front end for this project.

## Back End
PostgreSQL will be the database.

## Frontend (local dev)
This project uses React (create-react-app) and Tailwind CSS for the new SaaS-style UI.

Install dependencies and start the dev server:

```
cd coding-platform
npm install
npm start
```

Tailwind/PostCSS are configured via `postcss.config.js` and `tailwind.config.js`. The theme uses `dark` class toggling and persists the user's choice to `localStorage`.

To run both frontend and backend during development (two terminals):

Terminal 1 (server):
```
cd coding-platform/server
node server.js
```

Terminal 2 (frontend):
```
cd coding-platform
npm start
```

When developing, the CRA dev server proxies `/api` requests to the runner on port 4000 (see `proxy` in package.json).
