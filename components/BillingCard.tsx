"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PlanTier, SubscriptionStatus } from "@/lib/types";

interface BillingCardProps {
  tier: PlanTier;
  status: SubscriptionStatus;
  trackedProducts: number;
  freePlanLimit: number;
}

export default function BillingCard({
  tier,
  status,
  trackedProducts,
  freePlanLimit,
}: BillingCardProps) {
  const [loadingAction, setLoadingAction] = useState<"checkout" | "portal" | null>(
    null,
  );

  const handleCheckout = async () => {
    try {
      setLoadingAction("checkout");
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        toast.error(payload.error || "Unable to start checkout");
        return;
      }

      window.location.href = payload.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePortal = async () => {
    try {
      setLoadingAction("portal");
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        toast.error(payload.error || "Unable to open billing portal");
        return;
      }

      window.location.href = payload.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Billing portal failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const isPro = tier === "pro";
  const canManageBilling = !!status && status !== "canceled";

  return (
    <div className="rounded-sm border border-gray-950/[.08] bg-white p-4 text-left shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Your Plan</h3>
        <Badge variant={isPro ? "default" : "secondary"} className="text-xs">
          {isPro ? "Pro" : "Free"}
        </Badge>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {isPro
          ? "Unlimited tracking, email alerts, and billing management are active."
          : `You can track up to ${freePlanLimit} products on Free and still receive price-drop email alerts.`}
      </p>

      <div className="text-xs text-gray-500 mb-4">
        Tracked products: {trackedProducts}
        {!isPro && ` / ${freePlanLimit}`}
        {status ? ` • Status: ${status}` : ""}
      </div>

      <div className="flex flex-wrap gap-2">
        {!isPro && (
          <Button
            variant="default"
            size="default"
            className="bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)]"
            onClick={handleCheckout}
            disabled={loadingAction !== null}
          >
            {loadingAction === "checkout" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening Checkout...
              </>
            ) : (
              "Upgrade to Pro"
            )}
          </Button>
        )}

        {canManageBilling && (
          <Button
            variant="outline"
            size="default"
            className="border-gray-300"
            onClick={handlePortal}
            disabled={loadingAction !== null}
          >
            {loadingAction === "portal" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening Billing...
              </>
            ) : (
              "Manage Billing"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
