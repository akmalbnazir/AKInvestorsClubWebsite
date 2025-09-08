# Vercel Deployment (Supabase + Prisma + Next.js App Router)

This repo is cleaned and configured for Vercel.

## What I changed
- Removed heavy/dev-only folders: `.git/`, `node_modules/`, `.next/`, `prisma/dev.db`
- Replaced **bcrypt** (native) with **bcryptjs** (pure JS) to prevent native build issues on Vercel
- Fixed `src/lib/db.ts` Prisma client to a safe, production-ready pattern
- Aligned scripts:
  - `"build": "prisma db push && next build"`
  - `"seed": "node prisma/seed.js"`
  - keep `"postinstall": "prisma generate"`
- Added `.env.example` with all required keys
- Kept `middleware.ts` and App Router structure as-is

## One-time setup
1) **Create a new GitHub repo** and push this cleaned project (DO NOT commit `.env`):
   ```bash
   git init
   git remote add origin <your-repo-url>
   git add .
   git commit -m "vercel-ready clean build"
   git push -u origin main
   ```

2) **Supabase on Vercel**
   - In Vercel → *Add Integration* → **Supabase**
   - Link your Supabase project to this Vercel project
   - Vercel will inject `DATABASE_URL` automatically (use the pooled connection)

   *(Optional but recommended)* In Supabase → Database → Connection pooling:
   - Use the pooled URL (port **6543**) and set `sslmode=require`. Prisma works well with pgBouncer in transaction mode.

3) **Environment Variables**
   In Vercel Project → Settings → Environment Variables, add:
   - `ALLOWED_DOMAIN` (e.g., `@student.cms.k12.nc.us`)
   - `ALPHA_VANTAGE_KEY` (or leave as `demo`)
   - `ADMIN1_EMAIL`, `ADMIN1_PASSWORD`
   - `ADMIN2_EMAIL`, `ADMIN2_PASSWORD`
   - `ADMIN3_EMAIL`, `ADMIN3_PASSWORD`
   - `SESSION_TTL_DAYS` (e.g., `7`)

4) **Deploy**
   - Vercel automatically runs:
     - `npm install` (which runs `prisma generate`)
     - `npm run build` → `prisma db push && next build`
   - First deploy creates tables. If you want seed admins:
     - Run from a local machine **or** a one-off Vercel `pnpm exec` via a buildless job:
       ```bash
       npm run seed
       ```

## Notes
- **Do not** commit `.env`. Use `.env.local` locally and Vercel Env Vars in production.
- API routes & Prisma run in the default Node.js runtime. No Edge runtime is being used.
- If you need proper migrations later: run `npx prisma migrate dev` locally and commit the `prisma/migrations/` folder. Then change the build script to `prisma migrate deploy && next build`.

## Troubleshooting
- **“Build timed out / native module failed”** → ensure we’re on `bcryptjs` (done) and Node 18/20 (Vercel default).
- **Prisma connection errors** → check that your `DATABASE_URL` is the **pooled** URL (port 6543) with `sslmode=require`.
- **Stale schema** → re-run deploy or run `npm run db:push` locally.

