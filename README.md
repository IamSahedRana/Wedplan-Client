# WedPlan Client

Next.js 16 (App Router) frontend for the WedPlan wedding services marketplace.

**Client repository:** `https://github.com/IamSahedRana/Wedplan-Client`
**Server repository:** `https://github.com/IamSahedRana/Wedplan-Server`

## Features

- Email/password and Google sign-in with role-based dashboards (customer, vendor, admin)
- Browse services with search, category filter, USD price filters, sorting and pagination
- Vendor dashboard with service management, bookings and one-time lifetime Pro checkout
- Pro vendors get unlimited active services, a featured badge in search and priority support UI
- Admin dashboard for users, services and transactions

## Tech stack

Next.js 16, React 19, JavaScript, Tailwind CSS 4, shadcn/ui, Radix UI, Framer Motion, Better Auth, Zod, Recharts, Sonner, Lucide icons.
Hosting: Vercel. API: `https://<railway-domain>/api` from the Wedplan-Server repository.

## Installation

```bash
npm install
cp .env.example .env.local   # fill in your own values; never commit .env files
npm run dev                  # http://localhost:3000
```

Production commands: `npm run build` then `npm start`.

## Environment variables (names only)

```text
MONGODB_URI
DB_NAME
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
IMGBB_API_KEY
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_NAME
```

- `NEXT_PUBLIC_API_URL` must include the `/api` suffix in production, e.g. `https://<railway-domain>/api`.
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must be the exact client origin (no trailing slash). The API uses `CLIENT_URL` with the same value to fetch JWKS and verify JWTs.
- `BETTER_AUTH_SECRET` must match the secret used when sessions were created. Changing it invalidates existing JWT keys.
- `ADMIN_*` values are used only by `npm run seed:admin`.

## Local development

Start the API from `Wedplan-Server` first (`npm run dev`, port 5000), then this client. `NEXT_PUBLIC_API_URL` may be left empty locally if the API is on `http://localhost:5000/api` through the dev proxy; otherwise set it explicitly.

## Deployment on Vercel

1. Import `Wedplan-Client` into Vercel; framework preset Next.js, root directory `/`.
2. Set every variable above **before the first build**. `NEXT_PUBLIC_*` values are compiled into the client bundle, so redeploy after changing any of them.
3. Use these production values:
   - `BETTER_AUTH_URL` = `https://<your-vercel-app>.vercel.app`
   - `NEXT_PUBLIC_APP_URL` = same origin
   - `NEXT_PUBLIC_API_URL` = `https://<your-railway-app>/api`
   - `MONGODB_URI` / `DB_NAME` = same database as the API
4. Add the Vercel origin to Google OAuth authorized origins and redirect URIs if Google sign-in is enabled.
5. Create the first admin by running `npm run seed:admin` locally with the `ADMIN_*` values pointing at the production database.
6. Stripe webhook belongs to the server, not the client: `https://<your-railway-app>/api/payments/webhook`.

## Troubleshooting

- No dashboard data or repeated sign-outs: API is unreachable, `NEXT_PUBLIC_API_URL` is stale/localhost, or the server's `CLIENT_URL` does not match this origin (JWKS 401).
- "Failed to fetch" in Chrome devtools: browser extensions such as Similarweb patch `window.fetch`; disable them for localhost or test in incognito.
- Prices show a huge amount: stored prices are legacy numeric values; the UI formats them as USD without conversion.
