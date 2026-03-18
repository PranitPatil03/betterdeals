export type PlanTier = "free" | "pro";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "paused"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | null;

export interface SubscriptionRecord {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BillingSnapshot {
  tier: PlanTier;
  status: SubscriptionStatus;
  subscription: SubscriptionRecord | null;
}

export interface ProductRecord {
  id: string;
  user_id: string;
  url: string;
  name: string;
  current_price: number | string;
  currency: string;
  image_url: string | null;
  alert_price: number | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PriceHistoryRecord {
  id: string;
  product_id: string;
  price: number | string;
  currency: string;
  checked_at: string;
}
