# Better Deals — Product Price Tracker

Track product prices from Amazon, Flipkart, Walmart, Zara, eBay, Best Buy & more. Get email alerts when prices drop.

**Live:** [betterdeals.vercel.app](https://betterdeals.vercel.app)

## Features

- Track prices from any e-commerce site (Amazon, Flipkart, Walmart, Zara, eBay, Best Buy, etc.)
- Interactive price history charts with 1M / 3M / 6M / All range filters
- Set a target price and get notified when it's reached
- Buy-now / wait / good-time recommendation based on price trends
- Hourly automated price checks via Supabase pg_cron
- Email alerts on price drops and target hits (Resend)
- Google OAuth + email/password authentication (Supabase Auth)
- Free plan (3 products) and Pro plan (unlimited) with Stripe billing
- Safe currency normalization (₹, $, € → ISO codes)
- Responsive dashboard with product grid and detail modal

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | App Router, Server Actions, Turbopack |
| **Supabase** | Postgres, Auth, RLS, pg_cron + pg_net |
| **Firecrawl** | AI-powered web scraping and data extraction |
| **Stripe** | Checkout, webhooks, billing portal |
| **Resend** | Transactional price-drop emails |
| **Recharts** | Price history area charts |
| **shadcn/ui** | UI components |
| **Tailwind CSS v4** | Styling |

## Setup

### 1. Install

```bash
git clone https://github.com/PranitPatil03/betterdeals.git
cd betterdeals
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

FIRECRAWL_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

CRON_SECRET=          # openssl rand -hex 32
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run these migrations in **SQL Editor** (in order):
   - `supabase/migrations/003_subscriptions_and_billing.sql`
   - `supabase/migrations/004_price_tracker_schema.sql`
   - `supabase/migrations/005_add_alert_price.sql`
   - `supabase/migrations/006_normalize_currency_codes.sql`
   - `supabase/migrations/007_setup_cron_job.sql` (fill in your URL + CRON_SECRET first)
3. Enable **Google** and **Email** providers under Authentication → Providers

### 4. Stripe

1. Create a product + price in [Stripe Dashboard](https://dashboard.stripe.com)
2. Set `STRIPE_PRO_PRICE_ID` to the price ID
3. Add webhook endpoint: `https://<your-domain>/api/stripe/webhook`
4. Subscribe to: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### 5. Run

```bash
npm run dev
```

## Cron Job (Hourly Price Checks)

Uses **Supabase pg_cron + pg_net** (free on all plans including free tier).

After deploying, run in Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'check-product-prices',
  '0 * * * *',
  $$
    SELECT net.http_get(
      url := 'https://betterdeals.vercel.app/api/cron/check-prices',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_CRON_SECRET',
        'Content-Type', 'application/json'
      )
    );
  $$
);
```

Verify it's running:

```sql
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## Project Structure

```
price-tracker/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── actions.ts                      # Server actions (CRUD, alerts)
│   ├── dashboard/page.tsx              # Dashboard (SSR)
│   ├── auth/callback/route.ts          # OAuth callback
│   └── api/
│       ├── cron/check-prices/route.ts  # Hourly price check endpoint
│       └── stripe/                     # Checkout, portal, webhook
├── components/
│   ├── ProductCard.tsx                 # Grid card with price + alert status
│   ├── ProductModal.tsx                # Detail modal with alert setter
│   ├── PriceChart.tsx                  # Recharts price history
│   ├── AddProductForm.tsx              # URL input form
│   ├── DashboardView.tsx              # Product grid + empty state
│   ├── DashboardHeader.tsx            # Header with billing + profile
│   ├── AuthModal.tsx                  # Sign in/up modal
│   └── BillingCard.tsx                # Plan management
├── lib/
│   ├── firecrawl.ts                   # Firecrawl scraping
│   ├── currency.ts                    # Safe currency normalization
│   ├── email.ts                       # Resend email templates
│   ├── billing.ts                     # Plan snapshot
│   ├── stripe.ts                      # Stripe client
│   ├── product-source.ts             # Source badge (Amazon, eBay, etc.)
│   ├── plans.ts                       # Free/Pro limits
│   └── types.ts                       # TypeScript types
├── utils/supabase/                    # Supabase client helpers
├── supabase/migrations/               # SQL migrations (003–007)
├── proxy.ts                           # Next.js 16 proxy (session refresh)
└── vercel.json                        # Vercel cron fallback
```

## Deploy

1. Push to GitHub and connect to [Vercel](https://vercel.com)
2. Add all env vars in Vercel → Settings → Environment Variables
3. Run SQL migrations in Supabase SQL Editor
4. Add Stripe webhook URL pointing to your Vercel domain

### Add More Product Data

Update the Firecrawl prompt in `lib/firecrawl.js` to extract additional fields:

```javascript
prompt: "Extract product name, price, currency, image URL, brand, rating, and availability";
``
