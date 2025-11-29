import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropAlert } from "@/lib/email";

export async function POST(request) {
  try {
    // Verify the request is from our cron job
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all products from all users with user email
    const { data: products, error: productsError } = await supabase.from(
      "products"
    ).select(`
        *,
        user:user_id (
          email
        )
      `);

    if (productsError) throw productsError;

    console.log(`Checking prices for ${products.length} products...`);

    const results = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      alertsSent: 0,
    };

    // Process each product
    for (const product of products) {
      try {
        // Scrape latest price with Firecrawl
        const productData = await scrapeProduct(product.url);

        if (!productData.currentPrice) {
          console.error(`Failed to get price for product: ${product.name}`);
          results.failed++;
          continue;
        }

        const newPrice = parseFloat(productData.currentPrice);
        const oldPrice = parseFloat(product.current_price);

        // Update product with new price
        await supabase
          .from("products")
          .update({
            current_price: newPrice,
            currency: productData.currencyCode || product.currency,
            name: productData.productName || product.name,
            image_url: productData.productImageUrl || product.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        // Add to price history only if price changed
        if (oldPrice !== newPrice) {
          await supabase.from("price_history").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          results.priceChanges++;

          // Send email alert if price dropped
          if (newPrice < oldPrice && product.user?.email) {
            const emailResult = await sendPriceDropAlert(
              product.user.email,
              product,
              oldPrice,
              newPrice
            );

            if (emailResult.success) {
              results.alertsSent++;
              console.log(
                `Alert sent to ${product.user.email} for ${product.name}`
              );
            }
          }

          console.log(
            `Price changed for ${product.name}: ${oldPrice} → ${newPrice}`
          );
        }

        results.updated++;
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        results.failed++;
      }
    }

    console.log("Price check completed:", results);

    return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Allow GET for manual testing
export async function GET(request) {
  return NextResponse.json({
    message: "Price check endpoint is working. Use POST to trigger.",
  });
}
