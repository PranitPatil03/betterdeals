import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendPriceDropAlert, sendUpgradeConfirmation } from "@/lib/email";
import type { ProductRecord } from "@/lib/types";

/**
 * GET /api/test-email
 *
 * Sends a test price-drop alert email using your first tracked product.
 * Only works in development or when CRON_SECRET matches.
 *
 * Usage:
 *   curl http://localhost:3000/api/test-email
 *   curl https://betterdeals.vercel.app/api/test-email?secret=YOUR_CRON_SECRET
 */
export async function GET(request: Request) {
  // In production, require secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized. Add ?secret=YOUR_CRON_SECRET" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Not logged in — sign in first" }, { status: 401 });
  }
  // Test upgrade email: /api/test-email?type=upgrade
  const type = searchParams.get("type");
  if (type === "upgrade") {
    const result = await sendUpgradeConfirmation(user.email, { planName: "Pro" });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: `Upgrade confirmation email sent to ${user.email}`,
    });
  }
  // Get first product
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .limit(1)
    .returns<ProductRecord[]>();

  if (!products || products.length === 0) {
    return NextResponse.json({ error: "No products found — add one first" }, { status: 404 });
  }

  const product = products[0];
  const currentPrice = Number(product.current_price);

  // Look up the real previous price from price_history
  const { data: history } = await supabase
    .from("price_history")
    .select("price")
    .eq("product_id", product.id)
    .order("checked_at", { ascending: false })
    .limit(2)
    .returns<{ price: number }[]>();

  // Use the second-most-recent price as the old price, or fall back to current
  const oldPrice =
    history && history.length >= 2
      ? Number(history[1].price)
      : currentPrice;

  if (oldPrice <= currentPrice) {
    return NextResponse.json({
      success: false,
      message:
        "No real price drop to report — current price is not lower than the previous price. This test only sends emails when there is a genuine recorded drop.",
      product: product.name,
      currentPrice,
      oldPrice,
    });
  }

  const alertPrice = product.alert_price ? Number(product.alert_price) : null;

  // Match cron logic: if alert_price is set, only send when price is at or below it
  if (alertPrice !== null && currentPrice > alertPrice) {
    return NextResponse.json({
      success: false,
      message:
        "Price dropped but has not reached your alert price yet. Email will only be sent when the price drops to or below your target.",
      product: product.name,
      currentPrice,
      oldPrice,
      alertPrice,
    });
  }

  const isTargetHit = alertPrice !== null && currentPrice <= alertPrice;

  const result = await sendPriceDropAlert(
    user.email,
    product,
    oldPrice,
    currentPrice,
    {
      isTargetHit,
      alertPrice,
    },
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Test email sent to ${user.email} with real price data`,
    product: product.name,
    oldPrice,
    currentPrice,
    isTargetHit,
  });
}
