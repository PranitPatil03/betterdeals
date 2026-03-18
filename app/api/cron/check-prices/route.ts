import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropAlert } from "@/lib/email";
import type { ProductRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase env vars are missing" },
        { status: 500 },
      );
    }

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .returns<ProductRecord[]>();

    if (productsError) throw productsError;
    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products to check",
        results: {
          total: 0,
          updated: 0,
          failed: 0,
          priceChanges: 0,
          alertsSent: 0,
          targetHits: 0,
        },
      });
    }

    console.log(`Found ${products.length} products to check`);

    const results = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      alertsSent: 0,
      targetHits: 0,
    };

    for (const product of products) {
      try {
        const productData = await scrapeProduct(product.url);

        if (
          productData.currentPrice === undefined ||
          productData.currentPrice === null
        ) {
          results.failed++;
          continue;
        }

        const newPrice = Number(productData.currentPrice);
        const oldPrice = Number(product.current_price);
        const parsedAlertPrice =
          product.alert_price === null ? null : Number(product.alert_price);
        const alertPrice =
          parsedAlertPrice !== null && Number.isFinite(parsedAlertPrice)
            ? parsedAlertPrice
            : null;

        const updatedProduct = {
          ...product,
          current_price: newPrice,
          currency: productData.currencyCode || product.currency,
          name: productData.productName || product.name,
          image_url: productData.productImageUrl || product.image_url,
        };

        const { error: updateError } = await supabase
          .from("products")
          .update({
            current_price: updatedProduct.current_price,
            currency: updatedProduct.currency,
            name: updatedProduct.name,
            image_url: updatedProduct.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (updateError) {
          throw updateError;
        }

        if (oldPrice !== newPrice) {
          const { error: historyError } = await supabase.from("price_history").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          if (historyError) {
            throw historyError;
          }

          results.priceChanges++;

          const isTargetHitNow =
            alertPrice !== null && oldPrice > alertPrice && newPrice <= alertPrice;

          if (isTargetHitNow) {
            results.targetHits++;
          }

          if (newPrice < oldPrice) {
            const {
              data: { user },
            } = await supabase.auth.admin.getUserById(product.user_id);

            if (user?.email) {
              const emailResult = await sendPriceDropAlert(
                user.email,
                updatedProduct,
                oldPrice,
                newPrice,
                {
                  isTargetHit: isTargetHitNow,
                  alertPrice,
                },
              );

              if (emailResult.success) {
                results.alertsSent++;
              }
            }
          }
        }

        results.updated++;
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Price check endpoint is working. Use POST to trigger.",
  });
}
