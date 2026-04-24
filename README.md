# Bharat - The Soul of India

A cultural web platform showcasing India with a rich editorial homepage and dynamic state detail pages powered by MongoDB.

## Live Demo

https://bharatculture.vercel.app/

## Overview

This project combines:

- A visually rich frontend in plain HTML/CSS/JavaScript
- An Express server for static pages and API routes
- A MongoDB-backed state data API

The homepage is served from static files, while each state page loads data dynamically from `/api/state/:statename`.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express
- MongoDB Atlas
- Mongoose

## Features

- Responsive single-page cultural homepage
- Searchable state tiles on homepage
- Dynamic route per state: `/state/:statename`
- API endpoint for state data: `/api/state/:statename`
- Seed script to populate state/UT data into MongoDB
- Request logging and 404 fallback handling

## Project Structure

```text
FrontendBackendProject/
|- data/
|  |- states.js
|- lib/
|  |- db.js
|- models/
|  |- State.js
|- public/
|  |- index.html
|  |- style.css
|  |- script.js
|  |- state.html
|  |- state.css
|  |- state.js
|- scripts/
|  |- seedStates.js
|- scerver.js
|- package.json
|- vercel.json
|- README.md
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection string

## Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

Notes:

- `MONGO_URI` is required for API/state data and seeding.
- `PORT` is optional (defaults to `3000`).

## Installation

```bash
npm install
```

## Seed Database

Before using dynamic state pages, seed the collection:

```bash
npm run seed:states
```

This upserts state documents from `data/states.js` into MongoDB.

## Run Locally

Development mode (nodemon):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Runs `scerver.js` with nodemon
- `npm start` - Runs `scerver.js` with Node
- `npm run seed:states` - Seeds/upserts state data in MongoDB

## API Endpoints

- `GET /` - Serves homepage (`public/index.html`)
- `GET /state/:statename` - Serves state details page shell (`public/state.html`)
- `GET /api/state/:statename` - Returns state JSON by slug/name

Example:

```text
/api/state/maharashtra
/state/maharashtra
```

## Server Behavior

- Serves static assets from `public/`
- Logs every incoming request
- Connects to MongoDB on API access
- Returns `404 Page Not found` for unknown routes

## Deployment

Configured for Vercel using `vercel.json` with `scerver.js` as the serverless entry.

Basic deployment flow:

1. Set `MONGO_URI` in Vercel project environment variables.
2. Deploy from repository.
3. Verify:
	- `/`
	- `/state/maharashtra`
	- `/api/state/maharashtra`

## Notes

- The server file name is intentionally `scerver.js` in this project.
- Data model is defined in `models/State.js`.

## License

ISC
