-- ============================================================
-- Insert dummy price history for testing the chart
-- ============================================================
-- Run this in Supabase SQL Editor after you have at least one
-- product tracked. It generates 30 days of realistic price
-- fluctuations for ALL your products.
--
-- Safe to re-run — it deletes old dummy data first.
-- ============================================================

-- Delete any previous dummy entries (they have checked_at in the past)
DELETE FROM price_history
WHERE checked_at < now() - interval '1 hour';

-- Insert 30 days of price history for each product
INSERT INTO price_history (product_id, price, currency, checked_at)
SELECT
  p.id,
  ROUND(
    (p.current_price * (0.85 + random() * 0.30))::numeric,
    2
  ),
  p.currency,
  now() - (n || ' days')::interval + (floor(random() * 12) || ' hours')::interval
FROM
  products p,
  generate_series(1, 30) AS n
ORDER BY
  p.id, n;
