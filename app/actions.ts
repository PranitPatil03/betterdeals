"use server";

import { createClient } from "@/utils/supabase/server";
import { scrapeProduct } from "@/lib/firecrawl";
import { getBillingSnapshotForUser } from "@/lib/billing";
import { FREE_PLAN_PRODUCT_LIMIT } from "@/lib/plans";
import type { PriceHistoryRecord, ProductRecord } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeCurrencyCode } from "@/lib/currency";

type AddProductResult = {
  success?: boolean;
  error?: string;
  message?: string;
  product?: ProductRecord;
  upgradeRequired?: boolean;
};

export async function addProduct(formData: FormData): Promise<AddProductResult> {
  const rawUrl = formData.get("url");
  const url = typeof rawUrl === "string" ? rawUrl.trim() : "";

  if (!url) {
    return { error: "URL is required" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    const { data: existingProduct, error: existingError } = await supabase
      .from("products")
      .select("id, current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .maybeSingle<{ id: string; current_price: number }>();

    if (existingError) {
      throw existingError;
    }

    const { count: productCount, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      throw countError;
    }

    const billing = await getBillingSnapshotForUser(user.id);

    if (
      !existingProduct &&
      billing.tier === "free" &&
      (productCount ?? 0) >= FREE_PLAN_PRODUCT_LIMIT
    ) {
      return {
        error: `Tracking limit reached (${FREE_PLAN_PRODUCT_LIMIT} products). Manage billing to continue tracking.`,
        upgradeRequired: true,
      };
    }

    // Scrape product data with Firecrawl
    const productData = await scrapeProduct(url);

    if (!productData.productName || !productData.currentPrice) {
      console.log(productData, "productData");
      return { error: "Could not extract product information from this URL" };
    }

    const newPrice = Number(productData.currentPrice);
    const currency = normalizeCurrencyCode(productData.currencyCode, "USD");

    const isUpdate = !!existingProduct;

    // Upsert product (insert or update based on user_id + url)
    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name: productData.productName,
          current_price: newPrice,
          currency: currency,
          image_url: productData.productImageUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,url", // Unique constraint on user_id + url
          ignoreDuplicates: false, // Always update if exists
        }
      )
      .select()
      .single<ProductRecord>();

    if (error) throw error;

    // Add to price history if it's a new product OR price changed
    const shouldAddHistory =
      !isUpdate || Number(existingProduct.current_price) !== newPrice;

    if (shouldAddHistory) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: currency,
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {
      success: true,
      product,
      message: isUpdate
        ? "Product updated with latest price!"
        : "Product added successfully!",
    };
  } catch (error) {
    console.error("Add product error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to add product",
    };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Delete failed" };
  }
}

export async function getProducts(): Promise<ProductRecord[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<ProductRecord[]>();

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

export async function getPriceHistory(
  productId: string,
): Promise<PriceHistoryRecord[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true })
      .returns<PriceHistoryRecord[]>();

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get price history error:", error);
    return [];
  }
}

export async function setAlertPrice(
  productId: string,
  price: number,
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!Number.isFinite(price) || price <= 0) {
      return { error: "Alert price must be a positive number" };
    }

    const normalizedPrice = Number(price.toFixed(2));

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Validate alert price is lower than the current product price
    const { data: productData, error: fetchError } = await supabase
      .from("products")
      .select("current_price")
      .eq("id", productId)
      .eq("user_id", user.id)
      .single<{ current_price: number }>();

    if (fetchError || !productData) {
      return { error: "Product not found" };
    }

    if (normalizedPrice >= Number(productData.current_price)) {
      return { error: "Alert price must be lower than the current price" };
    }

    const { error } = await supabase
      .from("products")
      .update({ alert_price: normalizedPrice, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save alert" };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/");
}
