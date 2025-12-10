import type { SubscriptionStatus } from "@/lib/types";

export const FREE_PLAN_PRODUCT_LIMIT = 3;

const PAID_STATUSES: SubscriptionStatus[] = ["active", "trialing"];

export function isPaidStatus(status: SubscriptionStatus): boolean {
  return status ? PAID_STATUSES.includes(status) : false;
}

export function getPlanLabel(status: SubscriptionStatus): "Free" | "Pro" {
  return isPaidStatus(status) ? "Pro" : "Free";
}
