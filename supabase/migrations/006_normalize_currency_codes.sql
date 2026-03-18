-- Normalize existing currency values to ISO-4217-like codes and enforce format.

update products
set currency = case
  when currency is null or btrim(currency) = '' then 'USD'
  when btrim(currency) = '₹' then 'INR'
  when btrim(currency) = '$' then 'USD'
  when btrim(currency) = '€' then 'EUR'
  when btrim(currency) = '£' then 'GBP'
  when btrim(currency) = '¥' then 'JPY'
  when upper(btrim(currency)) in ('RS', 'RUPEE', 'RUPEES') then 'INR'
  when upper(regexp_replace(currency, '[^A-Za-z]', '', 'g')) ~ '^[A-Z]{3}$'
    then upper(regexp_replace(currency, '[^A-Za-z]', '', 'g'))
  else 'USD'
end;

update price_history
set currency = case
  when currency is null or btrim(currency) = '' then 'USD'
  when btrim(currency) = '₹' then 'INR'
  when btrim(currency) = '$' then 'USD'
  when btrim(currency) = '€' then 'EUR'
  when btrim(currency) = '£' then 'GBP'
  when btrim(currency) = '¥' then 'JPY'
  when upper(btrim(currency)) in ('RS', 'RUPEE', 'RUPEES') then 'INR'
  when upper(regexp_replace(currency, '[^A-Za-z]', '', 'g')) ~ '^[A-Z]{3}$'
    then upper(regexp_replace(currency, '[^A-Za-z]', '', 'g'))
  else 'USD'
end;

alter table products
  drop constraint if exists products_currency_code_check;

alter table products
  add constraint products_currency_code_check
  check (currency ~ '^[A-Z]{3}$');

alter table price_history
  drop constraint if exists price_history_currency_code_check;

alter table price_history
  add constraint price_history_currency_code_check
  check (currency ~ '^[A-Z]{3}$');
