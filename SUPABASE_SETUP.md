# Going live: wire LeadbasePro to Supabase (Phase 4 → 5)

The app runs on **mock data with a demo login** out of the box — no accounts
needed. This guide flips it to real auth + a real database. All the code is
already written and env-gated; you only create the project and paste 3 values.

**Time:** ~15 minutes. **Cost:** free tier.

---

## 1. Create the Supabase project (5 min)

1. Go to <https://supabase.com> → sign in → **New project**.
2. Name it `leadbasepro`, pick a region near you, set a database password (save it).
3. Wait for it to finish provisioning (~2 min).

## 2. Apply the database schema (2 min)

1. In the project, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and click **Run**.
3. You should see "Success". This creates all 7 tables, RLS policies, the
   auto-profile trigger, and enables realtime.

## 3. Grab your 3 keys (1 min)

In **Project Settings → API**, copy:

| Value | Where it goes |
|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon / public key** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role key** (keep secret!) | `SUPABASE_SERVICE_ROLE_KEY` |

Create `.env.local` in the repo root (copy `.env.local.example`) and fill those
three in. Also set:

```
NEXT_PUBLIC_DATA=supabase
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> The moment `NEXT_PUBLIC_SUPABASE_URL` + `..._ANON_KEY` are present, the login
> page, middleware auth gate, and OAuth callback all switch from mock to real —
> no code change.

## 4. Enable email + Google login (5 min)

**Email/password** — on by default. To skip the confirmation email while
testing: **Authentication → Providers → Email → turn off "Confirm email"**.

**Google OAuth:**
1. In Supabase: **Authentication → Providers → Google → Enable**. Copy the
   **Callback URL** it shows.
2. In [Google Cloud Console](https://console.cloud.google.com) → **APIs &
   Services → Credentials → Create OAuth client ID → Web application**.
3. Under **Authorized redirect URIs**, paste the Supabase callback URL from
   step 1. Create.
4. Copy the **Client ID** and **Client secret** back into Supabase's Google
   provider form. Save.
5. In Supabase **Authentication → URL Configuration**, add
   `http://localhost:3000/auth/callback` (and your production URL later) to
   **Redirect URLs**.

## 5. Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Sign up with an email or click **Continue with Google** — you'll land on
`/dashboard` as a real authenticated user, and a `profiles` row is created
automatically. Protected routes now redirect to `/login` when signed out.

---

## What's still mock after this

Phase 4 (auth) is now live, and the Phase 5 **schema** exists. The screens
still read the **mock DataSource** until Phase 5 wiring (P5-T2…T7) points them
at Supabase queries — that's the next build step. Sign-in, session, route
protection, and profile creation are fully real; the opportunity/portfolio data
is still seeded fixtures until then.

## Verifying RLS (optional, recommended)

In the SQL Editor, run as an anon user to confirm isolation:
```sql
-- Should return 0 rows without a valid auth.uid()
select * from public.portfolio;
```
Cross-user isolation is enforced by the `own <table>` policies in the migration.
