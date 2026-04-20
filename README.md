# Bharat - The Soul of India

A responsive cultural website that presents the beauty, heritage, and diversity of India through interactive sections and rich visual design.

## Live Demo

https://bharatculture.vercel.app/

## Overview

This project serves a static frontend from an Express server. The UI includes smooth scrolling navigation, themed typography, and animated visual elements.

## 🎯 Frontend Highlights

- Clean and modular HTML structure for easy readability  
- Responsive layout using CSS media queries  
- Smooth scrolling navigation for better user experience  
- Interactive UI elements powered by JavaScript  
- Visually appealing design inspired by Indian culture  

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express

## Project Structure

```text
FrontendBackendProject/
|- public/
|  |- index.html
|  |- style.css
|  |- script.js
|  |- favicon.png
|- scerver.js
|- package.json
|- package-lock.json
|- .gitignore
|- README.md
```

## Prerequisites

- Node.js 14+
- npm

## Setup and Run

1. Install dependencies:

```bash
npm install
```

2. Start in development mode (auto-reload with nodemon):

```bash
npm run dev
```

3. Open in browser:

```text
http://localhost:3000
```

## Available Script

- `npm run dev` - Runs `scerver.js` using nodemon.

## Server Behavior

- Serves static files from `public/`.
- Root route `/` returns `public/index.html`.
- Logs each request in the terminal.
- Returns `404 Page not found` for unknown routes.

## Key Files

- `public/index.html` - Main page markup.
- `public/style.css` - Complete styling and responsive rules.
- `public/script.js` - Frontend interactions and scroll behavior.
- `scerver.js` - Express server entry point.

## Deployment

The production site is deployed on Vercel:

https://bharatculture.vercel.app/

## Notes

- File name is currently `scerver.js` (spelled this way in the project).
- Port is set to `3000` in the current server code.

## License

ISC
