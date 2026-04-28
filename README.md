# Bharat - The Soul of India

## Project Overview

Bharat is a full-stack cultural travel web application about India. The project presents information about Indian states and union territories, including their capital, region, languages, culture, cuisine, economy, history, festivals, travel tips, and famous places.

The main purpose of this project is to combine a static frontend with a working Node.js and Express backend. The backend stores state information in MongoDB, provides API routes for the frontend, protects an admin dashboard with JWT authentication, and also includes an AI travel chatbot using the Groq API.

This project is useful for students, travelers, and anyone who wants to explore India state by state in a simple and interactive way.

## Live Demo

https://bharatculture.vercel.app/

## Main Objectives

- Build a complete frontend and backend web project.
- Store Indian state and union territory data in MongoDB.
- Fetch state data dynamically through Express API routes.
- Provide an admin dashboard to update state content.
- Secure the admin area using login credentials and JWT cookies.
- Add a chatbot that answers India travel and culture related questions.
- Deploy the project using Vercel.

## Features

- Home page with sections for Indian history, culture, architecture, festivals, cuisine, and states.
- Search option for finding states by name or capital.
- Dynamic state detail pages using URLs like `/state/bihar`.
- MongoDB based database with 36 records, covering 28 states and 8 union territories.
- REST API endpoint to fetch state details.
- Admin login page with username and password authentication.
- Protected admin dashboard for editing state records.
- JSON based structured fields for must-visit places and festivals.
- Groq powered chatbot named Tour Guide for travel advice.
- Responsive frontend using HTML, CSS, and vanilla JavaScript.

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- dotenv
- Groq SDK

### Deployment

- Vercel
- MongoDB Atlas

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
│   ├── admin-login.html
│   ├── admin-login.js
│   ├── admin.html
│   ├── admin.css
│   ├── admin.js
│   └── favicon.png
├── scripts/
│   └── seedStates.js
├── scerver.js
├── package.json
├── vercel.json
└── README.md
```

## Important Files

| File | Purpose |
| --- | --- |
| `scerver.js` | Main Express server file. It handles routes, APIs, authentication, chatbot requests, and starts the server. |
| `lib/db.js` | Connects the backend to MongoDB using Mongoose. |
| `models/State.js` | Defines the MongoDB schema for state and union territory records. |
| `data/states.js` | Contains the seed data for all 36 state and union territory records. |
| `scripts/seedStates.js` | Inserts or updates state data in MongoDB. |
| `public/index.html` | Main public homepage. |
| `public/script.js` | Handles homepage animations, search, state navigation, and chatbot UI. |
| `public/state.html` | State detail page template. |
| `public/state.js` | Fetches state data from the backend and renders it dynamically. |
| `public/admin-login.html` | Admin login page. |
| `public/admin.js` | Handles admin dashboard data loading, editing, saving, and logout. |
| `vercel.json` | Configuration file for Vercel deployment. |

## Backend Explanation

The backend is built with Express.js. It serves static frontend files from the `public` folder and also provides JSON API routes for dynamic data.

The server performs these main tasks:

- Serves the homepage and state pages.
- Connects to MongoDB whenever state data is needed.
- Reads state details from the `State` collection.
- Provides admin authentication using JWT.
- Allows the admin to view and update state records.
- Sends chatbot messages to the Groq API and returns the response.

The backend entry file is named `scerver.js`.

## Database Design

The project uses MongoDB with Mongoose. The main collection stores state and union territory records.

The schema is defined in `models/State.js`.

Each state record contains:

- `name`
- `slug`
- `capital`
- `region`
- `languages`
- `famousFor`
- `overview`
- `geography`
- `history`
- `bestTimeToVisit`
- `idealTripDuration`
- `cultureHighlights`
- `cuisineHighlights`
- `economyHighlights`
- `travelTips`
- `mustVisit`
- `majorFestivals`

The `mustVisit` field stores an array of places with name and description. The `majorFestivals` field stores an array of festivals with name, month, and note.

## API Routes

### Public Routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/` | Serves the homepage. |
| `GET` | `/state/:statename` | Serves the state detail page. |
| `GET` | `/api/state/:statename` | Returns one state or union territory record as JSON. |
| `POST` | `/api/chat` | Sends a user message to the AI travel chatbot. |

### Admin Routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/admin` | Redirects the user to login or dashboard. |
| `GET` | `/admin/login` | Serves the admin login page. |
| `POST` | `/admin/login` | Checks admin credentials and creates a JWT cookie. |
| `POST` | `/admin/logout` | Clears the admin login cookie. |
| `GET` | `/admin/dashboard` | Serves the protected admin dashboard. |
| `GET` | `/admin/api/me` | Checks whether the current admin session is valid. |
| `GET` | `/admin/api/states` | Returns the list of all states for the dashboard. |
| `GET` | `/admin/api/state/:stateId` | Returns one state record for editing. |
| `PUT` | `/admin/api/state/:stateId` | Updates one state record in MongoDB. |

## Authentication Flow

The admin authentication system works like this:

1. The admin opens `/admin/login`.
2. The login form sends username and password to `POST /admin/login`.
3. The backend compares the submitted details with environment variables.
4. If the credentials are correct, the backend signs a JWT token.
5. The JWT is stored in an HttpOnly cookie named `bharat_admin_token`.
6. Protected admin API routes use the `ensureAdmin` middleware.
7. If the token is missing or invalid, the backend returns `401` or redirects to login.

This makes the admin dashboard private and prevents normal users from editing database content.

## Chatbot Flow

The chatbot is available on the public website. It works through the `/api/chat` endpoint.

1. The user types a message in the chat widget.
2. The frontend sends the message and chat history to the Express backend.
3. The backend uses the Groq SDK and the `llama-3.1-8b-instant` model.
4. The chatbot is instructed to act as an Indian culture and travel guide.
5. The response is returned to the frontend and displayed in the chat window.

The chatbot is designed to answer questions about Indian states, culture, heritage, travel planning, packing lists, and practical travel advice.

## How The State Page Works

When a user opens a state page such as:

```text
/state/bihar
```

the following process happens:

1. Express serves `public/state.html`.
2. `public/state.js` reads the state slug from the URL.
3. The frontend calls `/api/state/bihar`.
4. The backend connects to MongoDB.
5. The backend searches by slug or state name.
6. The matching record is returned as JSON.
7. JavaScript renders the page content dynamically.

This shows how frontend and backend communicate through an API.

## Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
```

Explanation:

- `MONGO_URI` connects the application to MongoDB.
- `JWT_SECRET` is used to sign and verify admin login tokens.
- `ADMIN_USERNAME` is the admin login username.
- `ADMIN_PASSWORD` is the admin login password.
- `GROQ_API_KEY` is required for the chatbot.
- `NODE_ENV` controls environment specific behavior.

## Installation And Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create a `.env` file and add the required variables shown above.

### 3. Seed the database

```bash
npm run seed:states
```

This command reads data from `data/states.js` and inserts or updates it in MongoDB.

### 4. Start the project

For development:

```bash
npm run dev
```

For normal start:

```bash
npm start
```

Open the project in the browser:

```text
http://localhost:3000
```

## Available NPM Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Runs the server with nodemon for development. |
| `npm start` | Runs the server using Node.js. |
| `npm run seed:states` | Seeds or updates MongoDB with state data. |

## Deployment

The project is configured for Vercel deployment using `vercel.json`.

Deployment steps:

1. Push the project to GitHub.
2. Import the GitHub repository into Vercel.
3. Add all required environment variables in Vercel.
4. Deploy the project.
5. Test the homepage, state API, admin login, and chatbot.

## Learning Outcomes

This project demonstrates the following backend concepts:

- Creating a Node.js server with Express.
- Serving static files from a backend server.
- Creating REST API endpoints.
- Connecting Express to MongoDB.
- Designing a Mongoose schema.
- Seeding database records.
- Fetching data dynamically from the frontend.
- Protecting routes with middleware.
- Using JWT for authentication.
- Reading configuration from environment variables.
- Integrating an external AI API.
- Preparing a project for deployment.

## Conclusion

Bharat - The Soul of India is a complete frontend and backend project that shows how a cultural information website can be built using Express, MongoDB, and JavaScript. The frontend provides the user interface, while the backend manages routing, database access, authentication, admin editing, and chatbot communication.

The project is suitable as a backend development submission because it includes database operations, API design, protected routes, environment configuration, and deployment setup.

## License

ISC
