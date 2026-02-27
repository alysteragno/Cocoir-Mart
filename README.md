# Coconut Coir Shop — Next.js + Supabase Starter

A starter **Next.js (App Router) + Tailwind CSS + Supabase** project scaffolded for an educational e‑commerce website with **buyer** and **seller** sides.

> Footer on all pages includes: _“For educational purposes only, and no copyright infringement is intended.”_  
> Your **group name & logo** are displayed in the header.

## Features
- Next.js App Router (TypeScript)
- Tailwind CSS styling
- Supabase integration (Auth, Database, Storage)
- Buyer pages: Home, Products, Product Detail, Cart, Checkout, Orders, Profile
- Seller pages: Dashboard, Storefront, Inventory CRUD, Sales & Inventory Reports (basic)
- API routes for products & orders (starter)
- Global layout with header (logo + group name) and required footer disclaimer

## Prerequisites
- Node.js 18+ and npm (or pnpm/yarn)
- A Supabase project (free) — https://supabase.com/

## Setup
1. **Clone/Extract** this folder: `coco-coir-shop`
2. Copy environment example and fill values:
   ```bash
   cp .env.example .env.local
   ```
   Get your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase project settings.
   > For server-side admin operations (optional), set `SUPABASE_SERVICE_ROLE_KEY` and **never** expose it to the client.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Initialize DB schema** in Supabase:
   - Open Supabase SQL editor and paste the contents of `./supabase/schema.sql` (and optionally `./supabase/seed.sql`).
5. **Run dev server**:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000

## Project Structure
```
coco-coir-shop/
  app/
    api/              # server endpoints
    (buyer pages)
    seller/           # seller portal
    layout.tsx        # header/footer
    globals.css       # Tailwind base styles
  components/         # UI blocks
  lib/                # Supabase client & utilities
  public/             # static assets (logo, images)
  supabase/           # SQL schema & seeds
  tailwind.config.ts
  next.config.mjs
  package.json
```

## Notes
- This scaffold focuses on structure and basic flows; expand validations, access control, and reporting per your course rubric.
- Protecting `/seller/*`: see `middleware.ts` and comments in seller pages for role checks. In production, add server-side checks and RLS policies.

## Required Branding & Disclaimer
- Update **`components/Header.tsx`** with your actual **group name** and replace `public/logo.png`.
- The footer already includes the required disclaimer across all pages.

## License
Educational starter. Use at your own risk.
