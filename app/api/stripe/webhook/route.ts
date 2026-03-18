import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendUpgradeConfirmation } from "@/lib/email";
import type { SubscriptionRecord, SubscriptionStatus } from "@/lib/types";

export const runtime = "nodejs";

function toIsoDate(unixTimestamp: number | null | undefined): string | null {
  if (!unixTimestamp) {
    return null;
  }

  return new Date(unixTimestamp * 1000).toISOString();
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  return status as SubscriptionStatus;
}

async function resolveUserIdByStripeIds(
  stripeSubscriptionId: string | null,
  stripeCustomerId: string | null,
): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return null;
  }

  if (stripeSubscriptionId) {
    const { data: bySubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .maybeSingle<{ user_id: string }>();

    if (bySubscription?.user_id) {
      return bySubscription.user_id;
    }
  }

  if (stripeCustomerId) {
    const { data: byCustomer } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .maybeSingle<{ user_id: string }>();

    if (byCustomer?.user_id) {
      return byCustomer.user_id;
    }
  }

  return null;
}

async function upsertSubscriptionFromStripe(
  userId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for webhook sync");
  }

  const firstItem = subscription.items.data[0];

  const payload: SubscriptionRecord = {
    user_id: userId,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null,
    stripe_subscription_id: subscription.id,
    stripe_price_id: firstItem?.price?.id ?? null,
    status: mapStripeStatus(subscription.status),
    current_period_end: toIsoDate(firstItem?.current_period_end),
    updated_at: new Date().toISOString(),
  };

  await supabaseAdmin.from("subscriptions").upsert(payload, {
    onConflict: "user_id",
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is required for webhooks" },
      { status: 500 },
    );
  }

  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing stripe signature or webhook secret" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Webhook signature verification failed: ${error.message}`
            : "Webhook signature verification failed",
      },
      { status: 400 },
    );
  }

  try {
    console.log("[stripe-webhook] Event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;

      console.log("[stripe-webhook] checkout.session.completed — subscriptionId:", subscriptionId, "customerId:", customerId);

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId =
          session.client_reference_id ||
          session.metadata?.user_id ||
          subscription.metadata?.user_id ||
          (await resolveUserIdByStripeIds(subscription.id, customerId));

        console.log("[stripe-webhook] Resolved userId:", userId);

        if (userId) {
          await upsertSubscriptionFromStripe(userId, subscription);

          // Send upgrade confirmation email
          const supabaseAdmin = getSupabaseAdmin();
          if (supabaseAdmin) {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
            const email = userData?.user?.email;
            console.log("[stripe-webhook] Sending upgrade email to:", email);
            if (email) {
              const emailResult = await sendUpgradeConfirmation(email, { planName: "Pro" });
              console.log("[stripe-webhook] Email result:", emailResult);
            }
          }
        }
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id ?? null;

      const userId =
        subscription.metadata?.user_id ||
        (await resolveUserIdByStripeIds(subscription.id, customerId));

      if (userId) {
        await upsertSubscriptionFromStripe(userId, subscription);

        // Send upgrade email on new subscription creation as well
        if (event.type === "customer.subscription.created" && subscription.status === "active") {
          const supabaseAdmin = getSupabaseAdmin();
          if (supabaseAdmin) {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
            const email = userData?.user?.email;
            if (email) {
              console.log("[stripe-webhook] Sending upgrade email (sub.created) to:", email);
              await sendUpgradeConfirmation(email, { planName: "Pro" });
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
