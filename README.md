# Bharat - The Soul of India

Bharat is a cultural travel web app that presents Indian states and union territories through a dark editorial homepage, dynamic state pages, an admin dashboard, and a Groq-powered travel chatbot.

## Overview

The project is built with a simple but complete stack:

- A static frontend for the public website
- An Express server for page routing and JSON APIs
- MongoDB for state and union territory content
- JWT cookie authentication for the admin area
- Groq SDK for the travel assistant chat endpoint

The public pages are fast and static, while the state detail page and chatbot load live data from the server.

## Live Demo

https://bharatculture.vercel.app/

## Main Features

- Editorial home page with a cultural layout and strong visual hierarchy
- Searchable grid of Indian states and union territories
- Dynamic state page for every location at `/state/:statename`
- Public API for state content at `/api/state/:statename`
- Travel chatbot at `/api/chat`
- Admin dashboard for updating state content
- MongoDB-backed data model with seeded state records
- Production-friendly request logging and 404 handling

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JSON Web Token
- Groq SDK

## Project Structure

```text
FrontendBackendProject/
├── data/
│   └── states.js
├── lib/
│   └── db.js
├── models/
│   └── State.js
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── state.html
│   ├── state.css
│   ├── state.js
│   ├── admin.html
│   ├── admin.css
│   ├── admin.js
│   ├── admin-login.html
│   ├── admin-login.js
│   └── favicon.png
├── scripts/
│   └── seedStates.js
├── scerver.js
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
```

## Pages and Routes

### Public pages

- `GET /` serves the homepage
- `GET /state/:statename` serves the state page shell
- `GET /api/state/:statename` returns the state data as JSON

### Admin pages

- `GET /admin` redirects to the dashboard or login page
- `GET /admin/login` serves the admin login screen
- `GET /admin/dashboard` serves the admin dashboard for logged-in users
- `GET /admin/api/me` returns the authenticated admin session
- `GET /admin/api/states` lists all state records for the dashboard
- `GET /admin/api/state/:stateId` loads one record into the editor
- `PUT /admin/api/state/:stateId` updates a state record

### Chat endpoint

- `POST /api/chat` sends a user message to the Groq model and returns a travel-focused reply

## Environment Variables

Create a `.env` file in the project root with the values below:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
```

Notes:

- `MONGO_URI` is required for the state API and admin editor.
- `JWT_SECRET` is required for admin login cookies.
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` are used by the admin login form.
- `GROQ_API_KEY` is required only for the chatbot endpoint.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Seed the database

```bash
npm run seed:states
```

This loads the state and union territory data from `data/states.js` into MongoDB.

### 3. Start the app locally

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Open the site at:

```text
http://localhost:3000
```

## Available Scripts

- `npm run dev` runs `scerver.js` with nodemon
- `npm start` runs `scerver.js` with Node
- `npm run seed:states` seeds or updates state data in MongoDB

## Chatbot Behavior

The chatbot is designed as a travel assistant for Indian destinations. It gives short, useful answers about culture, heritage, travel planning, packing, best time to visit, and practical advice.

If a user asks for an unrelated topic, the assistant should politely refuse and stay in the role of a tour guide.

## Data Model

The main Mongoose model is `models/State.js`. Each record stores fields such as:

- name and slug
- capital and region
- languages and famous facts
- overview, geography, and history
- best time to visit and trip duration
- culture, cuisine, economy, and travel tips
- must-visit places and major festivals

## Deployment

The project is already set up for Vercel using `vercel.json` and the `start` script in `package.json`.

### Deploy steps

1. Set the production environment variables in Vercel.
2. Push the project to GitHub.
3. Import the repository into Vercel.
4. Deploy the project.
5. Verify the home page, one state page, the state API, and the chatbot.

## Troubleshooting

- If the chatbot fails, check that `GROQ_API_KEY` is set.
- If admin login fails, verify `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `JWT_SECRET`.
- If state data is missing, run `npm run seed:states` again.
- If MongoDB fails to connect, verify `MONGO_URI` and network access in Atlas.

## Notes

- The server file is intentionally named `scerver.js` in this project.
- The project keeps public assets in `public/` and server logic in the root.
- The app uses a cookie-based JWT admin session, not a database session store.

## License

ISC
