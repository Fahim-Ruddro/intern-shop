# Intern Shop

A full-stack e-commerce storefront and role-protected admin dashboard built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase** (PostgreSQL, Auth, Row-Level Security, Storage), and **Stripe Checkout + Webhooks**.

**Live Demo:** [https://intern-shop.vercel.app](https://intern-shop.vercel.app)

---

## Table of Contents

- [Project Summary & Architecture](#project-summary--architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Database Migrations & Seed Data](#database-migrations--seed-data)
- [Running Tests](#running-tests)
- [Accessibility & Lighthouse Audit (Milestone 4)](#accessibility--lighthouse-audit-milestone-4)

---

## Project Summary & Architecture

Intern Shop supports the complete customer shopping lifecycle alongside a secure back-office management portal:

1. **Storefront & Search (`/`, `/search`, `/categories/[slug]`, `/products/[slug]`):**
   - Server-rendered product catalog with 30 seeded items across 6 categories.
   - URL-driven search and filtering (`q`, `category`, `minPrice`, `maxPrice`, `inStock`, `sort`, and `page`) powered by debounced client inputs and PostgreSQL queries.
   - Dynamic product detail pages with live stock badges, related products, and stock-clamped cart controls.
2. **Dual-Mode Cart & Login Merge (`/cart`, `context/CartContext.tsx`, `lib/cart.ts`):**
   - Unauthenticated visitors manage a persistent cart in `localStorage`.
   - Upon login, `CartProvider` automatically merges guest cart items into PostgreSQL `cart_items`, clamping combined quantities to live product inventory.
3. **Server-Verified Checkout & Idempotent Stripe Webhooks (`/checkout`, `/api/webhooks/stripe`):**
   - `createCheckoutSession` validates delivery addresses via Zod, recalculates all line-item prices and fixed delivery charges strictly on the server (never trusting client-submitted prices), verifies stock availability, and creates a Stripe Hosted Checkout Session with `user_id` and `address_id` metadata.
   - `/api/webhooks/stripe` verifies the cryptographic `Stripe-Signature` header and invokes an atomic PostgreSQL RPC (`handle_stripe_checkout_completed`) to insert `orders` and `order_items`, decrement product stock, and clear `cart_items` idempotently.
4. **Authentication, RLS & Admin Protection (`/account`, `/admin`, `proxy.ts`):**
   - `@supabase/ssr` manages HTTP-only session cookies across middleware (`proxy.ts`), Server Components, and Server Actions.
   - Database Row-Level Security (RLS) isolates customer `cart_items`, `addresses`, and `orders` per authenticated user (`auth.uid() = user_id`).
   - Admin routes (`/admin/**`) enforce role checks at three layers: edge middleware (`proxy.ts`), server layout (`app/admin/layout.tsx`), and PostgreSQL RLS policies for product CRUD, Supabase Storage image uploads (`product-images`), and order fulfillment status updates.

---

## Tech Stack

- **Framework:** Next.js 16.4 (App Router, React 19, Server Components, Server Actions)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Backend & Database:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`) — PostgreSQL, Auth, Row-Level Security, Storage
- **Payments:** Stripe (`stripe` SDK — Checkout Sessions & signed Webhooks)
- **Validation:** Zod v4
- **Testing:** Vitest (unit tests) & Playwright (end-to-end browser tests)
- **Deployment:** Vercel

---

## Project Structure

```text
intern-shop/
├── app/
│   ├── account/              # Customer profile & order history (/account, /account/orders/[id])
│   ├── admin/                # Role-protected product CRUD & order management (/admin/**)
│   ├── api/webhooks/stripe/  # Cryptographically verified Stripe webhook handler
│   ├── auth/                 # Auth Server Actions & OAuth/recovery callback route
│   ├── cart/                 # Cart page & DB cart Server Actions
│   ├── categories/[slug]/    # Category listing pages
│   ├── checkout/             # Address form, Stripe session creation, /success & /cancel pages
│   ├── products/[slug]/      # Dynamic product detail page with metadata, loading & error boundaries
│   ├── search/               # Full-text search, multi-faceted filters & pagination
│   ├── login/, signup/, forgot-password/, reset-password/
│   └── layout.tsx, page.tsx
├── components/
│   ├── admin/                # ProductForm, DeleteProductButton, OrderStatusForm
│   └── Header.tsx, SearchInput.tsx, SearchFilters.tsx, AccountMenu.tsx,
│       AddToCartButton.tsx, AuthForms.tsx, CartBadge.tsx, CheckoutForm.tsx
├── context/
│   └── CartContext.tsx       # Client cart state, localStorage sync & login DB merge
├── lib/
│   ├── auth/admin.ts         # Admin role verification helper
│   ├── data/                 # Typed Supabase queries & generated database.types.ts
│   ├── supabase/             # Browser, server, middleware & service-role clients
│   ├── validations/          # Zod schemas (auth, checkout, product & image validation)
│   ├── cart.ts               # Pure cartReducer & integer-cents math helpers
│   └── stripe.ts             # Server-side Stripe client initialization
├── supabase/
│   └── migrations/           # SQL schema, RLS policies, storage bucket, RPCs & seed data
├── tests/
│   ├── unit/                 # Vitest suites (cart.test.ts, validations.test.ts)
│   └── e2e/                  # Playwright E2E checkout suite (checkout.spec.ts)
└── proxy.ts                  # Next.js middleware for Supabase session refresh & route guards


## Accessibility & Lighthouse Audit (Milestone 4)

### Accessibility & Quality Improvements

- **Input Labels & ARIA Semantics:** Added explicit `<label>` and `aria-label` attributes across every form and filter input (including header search, min/max price range fields, and cart quantity controls), plus `aria-expanded` and `role="menu"` semantics on the account dropdown.
- **Full Keyboard-Only Flow:** Added a focusable `"Skip to main content"` link in `app/layout.tsx`, visible focus rings (`focus-visible:ring-2`), and `Escape`-key dismissal with focus restoration on dropdown menus.
- **Image Alt Text & Optimization:** Verified descriptive `alt` text on all product images, replaced raw `<img>` tags on `/cart` with `next/image`, added `priority` loading to above-the-fold hero product images, and configured `images.unoptimized` in `next.config.ts` to eliminate HTTP `400` console errors on missing seed assets.
- **WCAG AA Contrast & SEO Metadata:** Updated dark-mode text utilities (`text-blue-600 dark:text-blue-400` and `text-gray-600 dark:text-gray-400`) to meet WCAG AA 4.5:1 contrast ratios and added fallback meta descriptions on dynamic product pages.

### Lighthouse Audit Results (`https://intern-shop.vercel.app` — Before → After)

| Page | Performance | Accessibility | Best Practices | SEO |
| :--- | :---: | :---: | :---: | :---: |
| Home (`/`) | 66 → 67 | 95 → 96 | 96 → 100 | 100 → 100 |
| Search (`/search`) | 69 → 63 | 96 → 100 | 96 → 100 | 100 → 100 |
| Product (`/products/zip-up-tech-hoodie`) | 65 → 64 | 96 → 100 | 96 → 100 | 91 → 91 |

### Key Audit Wins

- **Best Practices:** Improved from **96 → 100** across all three routes after eliminating `/_next/image` `400` console errors.
- **Accessibility:** Reached **100** on Search and Product pages (and **96** on Home) after fixing dark-mode color contrast ratios, adding input `aria-label` attributes, and implementing keyboard skip links.
- **SEO:** Maintained **100** on Home and Search routes.