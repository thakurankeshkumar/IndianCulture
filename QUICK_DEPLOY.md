# Quick Deploy

Use this when you only need the minimum steps to publish the app.

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
vercel env add GROQ_API_KEY
vercel --prod
```

## Required environment variables

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
GROQ_API_KEY=your_groq_api_key
```

## Check after deploy

- Home: `/`
- State page: `/state/maharashtra`
- State API: `/api/state/maharashtra`
- Chat API: `/api/chat`
- Admin login: `/admin/login`

## Local test before deploy

```bash
npm install
npm run seed:states
npm start
```

## Common issues

- If a state does not load, make sure the slug is lowercase.
- If the chatbot fails, set `GROQ_API_KEY`.
- If admin login fails, verify `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`.
- If MongoDB fails, verify `MONGO_URI` in Vercel.
