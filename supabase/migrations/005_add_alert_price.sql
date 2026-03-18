-- Add alert_price column to products table for per-product price alert targets.
alter table products
  add column if not exists alert_price numeric(10,2) default null;
