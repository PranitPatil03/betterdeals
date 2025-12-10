import { isPaidStatus } from "@/lib/plans";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { BillingSnapshot, SubscriptionRecord } from "@/lib/types";

export async function getBillingSnapshotForUser(
  userId: string,
): Promise<BillingSnapshot> {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return {
      tier: "free",
      status: null,
      subscription: null,
    };
  }

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<SubscriptionRecord>();

  if (error) {
    if ((error as { code?: string }).code === "42P01") {
      return {
        tier: "free",
        status: null,
        subscription: null,
      };
    }

    throw error;
  }

  const status = data?.status ?? null;

  return {
    tier: isPaidStatus(status) ? "pro" : "free",
    status,
    subscription: data ?? null,
  };
}
