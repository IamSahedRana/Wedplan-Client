<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WedPlan Client — Next.js App Router, JavaScript, Tailwind, shadcn/ui, Better Auth

## Working rules
- NEVER read, write or print .env / .env.local. Maintain only .env.example (names only). .gitignore excludes .env*.
- Before using Better Auth / Next.js / Stripe-related APIs, check docs for the installed version; don't rely on memory. (Next 16 renamed middleware→proxy; check `npm ls next`.)
- Do only the task given. Run `npm run build` only at the end of a phase task that says so.
- Commit in small feature-based commits (1-3 per task): `git add -A && git commit -m "<type>: <specific message>"`. Never push unless told.
- Reply max 3 lines. No explanations, no code dumps.
- shadcn components via `npx shadcn@latest add`. Icons lucide-react. Toasts via sonner. Never alert().
- Reusable components in src/components. API helper src/lib/api.js attaches the Bearer JWT.

## Design (foodpanda-inspired, wedding theme)
Primary #D70F64 · hover #B80C55 · tint #FDE7F0 · text #2E2E2E · secondary #6B6B6B · muted #9B9B9B · bg #FFFFFF · alt bg #F7F7F7 · border #E4E4E4
Success #2E9E5B (tint #E6F6EC) · Warning #F5A623 (tint #FFF4DF) · Error #E21B1B (tint #FDE8E8) · Premium badge gold #C9A227 (badge only).
Poppins font. Cards radius 16px, buttons pill (rounded-full), inputs radius 12px, shadow 0 4px 16px rgba(0,0,0,.06), card hover lift 2px. Map to shadcn variables (--primary #D70F64). Container max-w 1200px, section py-20.
Status chips: Pending amber, Accepted/Approved/Active green, Rejected red, Cancelled grey, Premium gold. Price format ৳ via Intl.
Every data view needs skeleton loading, empty state, error state. Fully responsive (tables → cards on mobile; mobile drawer nav).

## Layout
Navbar sticky: logo "WedPlan". Logged out: Home, Browse Services, Sign In (outline pill), Sign Up (pink pill). Logged in: Home, Browse Services, avatar dropdown (name+image, Dashboard, Profile Settings, Logout). Updates instantly on auth change.
Footer: logo+description, links, contact info, social links, copyright.
Dashboard: sidebar + top bar, role-based nav.
 Vendor: Overview, My Services, Add Service, Booking Requests, Subscription, Profile Settings
 Customer: Overview, My Bookings, Profile Settings
 Admin: Overview, Manage Users, Manage Services, Transactions
Wrong-role URL → 403 "Access denied" page. Unauthenticated → /signin?redirect=<path>. Blocked users → blocked message.
Private routes: /services/[id], /dashboard/*, /payment/*, /onboarding.

## Auth
Better Auth: MongoDB adapter, user modelName "users", additionalFields role, isBlocked, onboarded, businessName, phone, address, bio, subscriptionPlan, subscriptionExpiresAt (input allowed only for role, businessName). Email+password and Google. jwt plugin.
- Hook forces signup role to vendor|customer, else customer. Admin never via signup (seed script only).
- Password: min 6, one upper, one lower.
- Blocked users: session.create.before hook throws; guard also checks isBlocked.
- Google signup → role=customer, onboarded=false → /onboarding (choose role). Role settable only while onboarded=false, then immutable.
- JWT: cache in memory, refresh ~1 min before expiry; on API 401 refetch once and retry, then sign out.
- Proxy checks only session cookie (getSessionCookie). Real role checks in layouts and on server.
- Post-login redirect by role: admin→/dashboard/admin, vendor→/dashboard/vendor, customer→/dashboard/customer.

## Animations
framer-motion: fade-up on home sections, staggered cards. Subtle only.

## Env names
MONGODB_URI, DB_NAME, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, IMGBB_API_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
