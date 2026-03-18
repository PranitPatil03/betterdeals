import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

const extractionSchema = z.object({
  productName: z.string(),
  currentPrice: z.number(),
  currencyCode: z.string().optional(),
  productImageUrl: z.string().optional(),
});

export interface ScrapedProductData {
  productName: string;
  currentPrice: number | string;
  currencyCode?: string;
  productImageUrl?: string;
}

function normalizeImageUrl(rawUrl?: string, pageUrl?: string): string | undefined {
  if (!rawUrl) {
    return undefined;
  }

  const trimmed = rawUrl.trim();

  if (!trimmed || trimmed.startsWith("data:")) {
    return undefined;
  }

  try {
    return new URL(trimmed, pageUrl).toString();
  } catch {
    return undefined;
  }
}

async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return undefined;
    }

    const html = await response.text();
    const ogImageMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
      );

    return normalizeImageUrl(ogImageMatch?.[1], url);
  } catch {
    return undefined;
  }
}

export async function scrapeProduct(url: string): Promise<ScrapedProductData> {
  try {
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["extract"],
      extract: {
        prompt:
          "Extract the product name as 'productName', current visible price as a number as 'currentPrice', currency code (USD, EUR, etc) as 'currencyCode', and the primary hero product image URL as 'productImageUrl'. Prefer the main product photo and avoid logos, icons, avatars, placeholder images, and tiny thumbnails.",
        schema: extractionSchema,
      },
    });

    if (!result || typeof result !== "object" || !("extract" in result)) {
      throw new Error("Invalid Firecrawl response");
    }

    // Firecrawl returns data in result.extract
    const extractedData = (result as { extract?: ScrapedProductData }).extract;

    if (!extractedData || !extractedData.productName) {
      throw new Error("No data extracted from URL");
    }

    const imageFromExtract = normalizeImageUrl(extractedData.productImageUrl, url);
    const imageFromOg = imageFromExtract ? undefined : await fetchOgImage(url);

    return {
      ...extractedData,
      productImageUrl: imageFromExtract ?? imageFromOg,
    };
  } catch (error) {
    console.error("Firecrawl scrape error:", error);
    throw new Error(
      `Failed to scrape product: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
