# DrugFlow — Auth & RBAC

Secure authentication and role-based access for the medicine inventory app (Next.js App Router, NextAuth, Prisma, bcrypt).

**Important:** Run all commands below from the **`durgflow`** directory (where this README and `package.json` live). If you're in the parent `DrugFlow` folder, run `cd durgflow` first.

## Setup

1. **Install dependencies** (from `durgflow` folder)
   ```bash
   cd durgflow
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env` in `durgflow`
   - Set `DATABASE_URL` (e.g. `file:./dev.db` for SQLite)
   - Set `NEXTAUTH_SECRET` to a random string (e.g. `openssl rand -base64 32`)

3. **Database** (from `durgflow` folder)
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   On first run, the app also creates a default admin when you start the server. Default admin: **administrator@localhost** / **password123** (change after first login).

4. **Run** (from `durgflow` folder)
   ```bash
   npm run dev
   ```
   The default admin user is created when the server starts if it does not already exist.

## Roles & Routes

| Route         | Allowed roles        |
|---------------|----------------------|
| `/admin/*`    | ADMIN only           |
| `/inventory/*`| ADMIN, STOREKEEPER   |
| `/reports/*`  | All                  |
| `/dashboard`  | All authenticated    |

Unauthenticated users are redirected to `/login`. No public registration; only an ADMIN can create users from **Admin → Create user**.

## Security

- Passwords hashed with bcrypt; never returned in API or session
- JWT session strategy; role stored in token and session
- Middleware checks JWT and role before allowing access
- Server actions use `getServerSession()` and never trust client-provided role
- Role escalation is prevented (only server-side role is used)

## Files

- `prisma/schema.prisma` — User model, Role enum
- `lib/auth.ts` — NextAuth config (Credentials, JWT, callbacks)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth API route
- `middleware.ts` — Route protection and role checks
- `lib/rbac.ts` — Path → role mapping
- `app/login/page.tsx` — Login page
- `app/admin/users/new/` — Admin create-user page
- `app/admin/users/actions.ts` — Example protected server action (create user)
