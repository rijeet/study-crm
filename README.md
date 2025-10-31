StudyCRM — Study Abroad CRM (Next.js + MongoDB)

Tech stack
- Next.js App Router, TypeScript, Tailwind v4
- MongoDB Atlas via Mongoose
- Auth: JWT access + rotating refresh (httpOnly cookie)
- Validation: Zod; SWR for data fetching

Getting started
1) Install deps: `npm install`
2) Create `.env.local` with:
```
MONGODB_URI="<your mongodb uri>"
JWT_ACCESS_SECRET="<random>"
JWT_REFRESH_SECRET="<random>"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="30d"
NEXT_PUBLIC_APP_NAME="StudyCRM"
```
3) Seed: `npm run seed`
4) Dev: `npm run dev`

Auth flow
- POST /api/v1/auth/login → returns accessToken; sets httpOnly refresh cookie
- POST /api/v1/auth/refresh → rotates refresh token, returns new accessToken
- POST /api/v1/auth/logout → invalidates refresh token

RBAC
- Role-based and per-user permission overrides. Protected endpoints require permissions like `locations:manage`, `leads:create`, `users:manage`.

API highlights
- Locations: Countries/States/Cities CRUD
- Academics: Programs/Language Tests CRUD
- Universities & Branches CRUD
- Users CRUD
- Leads CRUD, assignment, duplicate detection; bulk import via CSV
- Dashboard metrics

Security
- CSRF double-submit cookie for state-changing APIs
- CORS restricted via middleware to allowed origin
- Rate limiting on auth endpoints
- Audit logs for sensitive actions (e.g., lead assignment)

Testing
- Jest + RTL starter; `npm test`

Deployment
- Vercel or Node server. Configure env vars in hosting. Ensure HTTPS; set allowed origin in middleware.
