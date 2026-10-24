# PARQ WEST

PARQ WEST is a Next.js fashion commerce storefront and internal admin workspace for a boutique clothing, bag, and accessory brand. The application uses MongoDB Atlas for catalog, account, order, and audit data and Stripe Checkout for payment collection.

## Current implementation status

Implemented today:
- storefront home, shop, category, collection, product, search, and lookbook routes
- MongoDB-backed product catalog with published filtering and basic search
- customer registration and sign-in with password hashing and signed HTTP-only sessions
- authenticated customer account sections for orders, wishlist, addresses, preferences, and returns
- admin command-center navigation and authorization gates for catalog and operational areas
- Stripe checkout session creation and signed webhook processing
- reservation/release and payment settlement logic with MongoDB transactions
- inventory movements and audit log capture
- development-only demo seed that marks all generated products and campaign content as demo data
- database index bootstrap script and owner bootstrap script

Requires external configuration or business data:
- live MongoDB Atlas cluster and credentials
- Stripe production or test credentials and webhook setup
- real brand products, prices, SKUs, inventory, catalogs, photography, campaign copy, and shipping/return policies
- email, SMS, media, tax, and fulfillment integrations when those services are enabled

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- MongoDB Node driver
- Zod validation at API boundaries
- bcryptjs for password hashing
- jose for signed sessions
- Stripe Checkout and Stripe webhooks

## Architecture

- `src/app` contains storefront pages, account pages, admin pages, and API routes.
- `src/lib/auth.ts` contains auth/session helpers and role-based admin checks.
- `src/lib/db.ts` manages a shared MongoDB connection and the index bootstrap.
- `src/lib/domain.ts` defines schemas and shared domain types for products, checkout data, and return requests.
- `src/lib/catalog.ts` handles catalog querying and product lookup.
- `src/lib/commerce.ts` handles reservation, release, and payment settlement workflows.
- `scripts/seed.ts` creates demo catalog and homepage content, but it is explicitly blocked in production unless the script is run with the appropriate override.
- `scripts/bootstrap-owner.ts` creates the one initial owner user if environment variables are supplied.

## Storefront

The storefront includes:
- homepage sections with CMS-backed content when MongoDB is configured
- product listing pages and search
- per-category and collection pages
- product detail pages
- bag/cart logic and quote API
- local checkout session creation to Stripe
- order confirmation redirect page

The public storefront is intentionally tolerant of missing Atlas configuration. When MongoDB is unavailable, it presents an explicit catalog-unavailable state instead of crashing.

## Customer account

Customer-only account pages are available behind authenticated routes. Current account capabilities include:
- registration and login
- order visibility
- wishlist persistence
- addresses management
- notification preferences
- return-request submission with order ownership and quantity validation

Customer account data is scoped server-side to the signed-in user. Hidden navigation is not the authorization boundary; the database queries enforce ownership.

## Command Center

The admin area uses role-based authorization in `requireAdmin()`. The current command-center surface is intentionally limited to the routes and features implemented in the codebase. Some admin workspaces are navigation-entry points only and require real operational implementation or external configuration to become fully functional.

## MongoDB Atlas and indexes

Required for real app data and admin flows.

Core index bootstrap is handled by `ensureIndexes()` in `src/lib/db.ts` and includes indexes for:
- users.email
- products.slug
- products variant SKUs
- order numbers and per-user order history
- Stripe session IDs
- webhook event IDs
- homepage section ordering and scheduling
- inventory movement history
- customer events
- audit logs

The index setup is safe to run repeatedly because it uses MongoDB `createIndex` calls against the existing schema.

## Stripe flow

The app creates Stripe Checkout sessions from server-validated order data. The authoritative payment state is the Stripe webhook, not the browser redirect. The webhook route verifies the Stripe signature and processes these events:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`

Payment settlement updates order status, decrements inventory, and records inventory movement and customer event records inside MongoDB transactions. Duplicate event IDs are guarded by a unique webhook event index.

## Inventory and reservations

Reservation logic is implemented in `src/lib/commerce.ts`:
- checkout reservation blocks availability during the checkout hold period
- expired or failed checkout releases reserved stock back to available inventory
- paid orders convert reserved stock into sold inventory
- inventory adjustments and payment settlement both write inventory movement records

The app uses integer USD cents for money and keeps reserved quantities within the on-hand inventory bounds.

## Return workflow

Customer return requests are validated server-side before they are stored. The return route verifies:
- the order exists
- the order belongs to the signed-in customer
- the requested SKU appears on the order
- the return quantity does not exceed the purchased quantity
- the request payload is valid

The workflow is intentionally conservative and does not mark inventory as restocked at request time.

## Demo data safety

The included seed script intentionally creates fictional, clearly demarcated demo catalog products and homepage content. These entries are not meant to represent real PARQ WEST business data. The seed script explicitly blocks production usage unless a production override is supplied and prints a warning that the generated products, prices, and campaign imagery are fiction.

## Environment variables

Required for startup and real operations:
- `MONGODB_URI`
- `AUTH_SECRET` (minimum 32 characters)
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CRON_SECRET`

Bootstrap-only variables:
- `BOOTSTRAP_OWNER_EMAIL`
- `BOOTSTRAP_OWNER_PASSWORD`

Optional provider integrations:
- `MEDIA_PROVIDER`, `MEDIA_CLOUD_NAME`, `MEDIA_API_KEY`, `MEDIA_API_SECRET`
- `EMAIL_PROVIDER`, `EMAIL_API_KEY`
- `SMS_PROVIDER`, `SMS_API_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and provide the necessary values.
3. Start MongoDB Atlas or a compatible cluster and configure network access.
4. Run `npm run db:indexes`.
5. Run `npm run seed` for the demo storefront.
6. Run `npm run bootstrap:owner` with a temporary owner email and password if you need the first admin account.
7. Run `npm run dev` and open the local app.

## Production readiness status

This codebase is not production-ready for live sales yet. It contains the core commerce and admin scaffolding, but live launch still requires:
- a production MongoDB Atlas database configured for real inventory and orders
- a production Stripe configuration and webhook registration
- validated shipping, tax, refund, and return policy settings
- real products, photography, inventory, and content
- verified Vercel deployment variables and cron setup
- final acceptance testing against the real customer and admin flows

## Testing

The project runs:
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

The current codebase passes those release gates after the security hardening updates.


