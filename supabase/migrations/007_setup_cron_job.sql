-- ============================================================
-- Enable pg_cron and pg_net extensions (both free on Supabase)
-- ============================================================
-- pg_cron  → schedules recurring jobs inside Postgres
-- pg_net   → makes HTTP requests from inside Postgres
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- Schedule: check prices every 1 hour
-- ============================================================
-- IMPORTANT: Before running this, replace the two placeholders:
--   1. YOUR_VERCEL_URL   → your deployed domain (e.g. betterdeals.vercel.app)
--   2. YOUR_CRON_SECRET  → the CRON_SECRET env var value from Vercel
--
-- To change frequency, edit the cron expression:
--   '0 * * * *'   = every hour (at minute 0)
--   '*/30 * * * *' = every 30 minutes
--   '0 */2 * * *' = every 2 hours
--   '0 8 * * *'   = once daily at 8 AM UTC
-- ============================================================

-- First, remove any existing job with the same name (safe to re-run)
SELECT cron.unschedule('check-product-prices')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'check-product-prices'
);

-- Schedule the hourly price check
SELECT cron.schedule(
  'check-product-prices',        -- job name
  '0 * * * *',                   -- every hour at minute 0
  $$
    SELECT net.http_get(
      url := 'https://betterdeals.vercel.app/api/cron/check-prices',
      headers := jsonb_build_object(
        'Authorization', 'Bearer 319154e0bc0b059ec0ebbeb947f6b75a67819b5958cc33a77cb7e3eff33ee40d',
        'Content-Type', 'application/json'
      )
    );
  $$
);
