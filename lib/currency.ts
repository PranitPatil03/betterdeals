const SYMBOL_TO_CURRENCY: Record<string, string> = {
  "₹": "INR",
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₩": "KRW",
  "₽": "RUB",
};

const ALIAS_TO_CURRENCY: Record<string, string> = {
  INR: "INR",
  RS: "INR",
  RUPEE: "INR",
  RUPEES: "INR",
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  JPY: "JPY",
  KRW: "KRW",
  RUB: "RUB",
  AUD: "AUD",
  CAD: "CAD",
  CHF: "CHF",
  SGD: "SGD",
  AED: "AED",
};

const supportCache = new Map<string, boolean>();

function isSupportedCurrency(code: string): boolean {
  const cached = supportCache.get(code);
  if (cached !== undefined) {
    return cached;
  }

  let supported = false;
  try {
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(1);
    supported = true;
  } catch {
    supported = false;
  }

  supportCache.set(code, supported);
  return supported;
}

export function normalizeCurrencyCode(
  input: string | null | undefined,
  fallback = "USD",
): string {
  if (!input) {
    return fallback;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return fallback;
  }

  if (SYMBOL_TO_CURRENCY[trimmed]) {
    return SYMBOL_TO_CURRENCY[trimmed];
  }

  const upper = trimmed.toUpperCase();

  if (ALIAS_TO_CURRENCY[upper]) {
    return ALIAS_TO_CURRENCY[upper];
  }

  for (const [symbol, code] of Object.entries(SYMBOL_TO_CURRENCY)) {
    if (trimmed.includes(symbol)) {
      return code;
    }
  }

  const lettersOnly = upper.replace(/[^A-Z]/g, "");
  if (lettersOnly.length === 3 && isSupportedCurrency(lettersOnly)) {
    return lettersOnly;
  }

  return fallback;
}

export function formatCurrency(
  value: number,
  currencyInput: string | null | undefined,
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): string {
  const currency = normalizeCurrencyCode(currencyInput, "USD");

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...options,
    }).format(value);
  } catch {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      ...options,
    }).format(value);
  }
}
