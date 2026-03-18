"use client";

import { Plus, TrendingDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { ProductRecord } from "@/lib/types";

interface Props {
  products: ProductRecord[];
}

export default function DashboardView({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border-2 border-dashed border-slate-200 bg-white px-8 py-16 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
          <Plus className="size-7 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-slate-900">
          Add your first product
        </h3>
        <p className="mt-2 max-w-sm mx-auto text-sm text-slate-500">
          Paste a product URL above to start monitoring price drops and get email
          alerts when your target price is hit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-slate-400">
          {["Amazon", "eBay", "Walmart", "Flipkart", "Zara", "Best Buy"].map((site) => (
            <span
              key={site}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1"
            >
              {site}
            </span>
          ))}
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            + more
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <TrendingDown className="size-4 text-emerald-600" />
        <p className="text-sm font-medium text-slate-600">
          {products.length} product{products.length !== 1 ? "s" : ""} tracked
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
