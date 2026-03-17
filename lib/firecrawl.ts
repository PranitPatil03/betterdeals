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

export async function scrapeProduct(url: string): Promise<ScrapedProductData> {
  try {
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["extract"],
      extract: {
        prompt:
          "Extract the product name as 'productName', current price as a number as 'currentPrice', currency code (USD, EUR, etc) as 'currencyCode', and product image URL as 'productImageUrl' if available",
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

    return extractedData;
  } catch (error) {
    console.error("Firecrawl scrape error:", error);
    throw new Error(
      `Failed to scrape product: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
