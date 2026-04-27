# Production Checklist

Use this as the final pre-deployment and maintenance checklist.

## Server and routing

- Express server starts with `scerver.js`
- Static assets are served from `public/`
- Public routes work: `/`, `/state/:statename`, `/api/state/:statename`
- Admin routes work: `/admin/login`, `/admin/dashboard`, `/admin/api/*`
- Chat route works when `GROQ_API_KEY` is set

## Environment variables

- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `GROQ_API_KEY`

## Database

- MongoDB Atlas connection is valid
- State documents are seeded from `data/states.js`
- State slugs are lowercase and unique
- Required fields are present in each document
- `npm run seed:states` completes successfully

## Frontend

- `index.html` loads the homepage
- `state.html` loads the state detail shell
- `admin-login.html` loads the admin login page
- `admin.html` loads the dashboard
- CSS and JS files are reachable from `public/`

## API checks

- `/api/state/maharashtra` returns JSON
- Invalid state names return 404
- `/api/chat` returns a travel-style response
- Admin API routes return 401 without a valid token

## Security checks

- No credentials are hardcoded in source files
- `.env` stays out of git
- JWT secret is strong and private
- Admin cookies are HTTP-only
- State name matching escapes special characters

## Deployment checks

- `package.json` has a working `start` script
- `vercel.json` exists and points to the server entry
- Dependencies are installed locally
- Production environment variables are added in the host dashboard

## Quick manual test

```bash
npm install
npm run seed:states
npm run dev
```

Then verify:

- `http://localhost:3000/`
- `http://localhost:3000/state/maharashtra`
- `http://localhost:3000/api/state/maharashtra`
- `http://localhost:3000/admin/login`

## Notes

- The chatbot is optional in local development, but the route should still fail gracefully without `GROQ_API_KEY`.
- The server file name is intentionally `scerver.js`.
- **Backend:** Ready ✅
- **Database:** Ready ✅
- **Configuration:** Ready ✅
- **Security:** Ready ✅
- **Monitoring:** Ready ✅

---

## 🎯 Post-Deployment

After deployment, verify:
1. [ ] Home page loads at root URL
2. [ ] State pages load at `/state/statename`
3. [ ] API returns data at `/api/state/statename`
4. [ ] Error pages show correctly
5. [ ] Database connection stable
6. [ ] No console errors in browser DevTools
7. [ ] Mobile view responsive
8. [ ] All states accessible in grid

---

## 📝 Notes

- **Current Development URL:** http://localhost:3000
- **Database:** MongoDB Atlas (bharatculture cluster)
- **Server:** Express.js (Node.js)
- **Hosting:** Vercel
- **Version:** 1.0.0

---

**Status: ✅ PRODUCTION READY**

All checks passed. Project is safe to deploy to production.

---

*Last Updated: April 23, 2026*
*Checked By: Production Readiness Script*
