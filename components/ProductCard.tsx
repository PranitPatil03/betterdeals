"use client";

import { useState } from "react";
import { Bell, BellOff, TrendingDown } from "lucide-react";
import ProductModal from "./ProductModal";
import type { ProductRecord } from "@/lib/types";
import { getSourceBadge } from "@/lib/product-source";
import { formatCurrency } from "@/lib/currency";

function formatPrice(price: number, currency: string): string {
  return formatCurrency(price, currency, "en-US", { maximumFractionDigits: 2 });
}

interface Props {
  product: ProductRecord;
}

export default function ProductCard({ product }: Props) {
  const [open, setOpen] = useState(false);

  const hostname = (() => {
    try { return new URL(product.url).hostname; }
    catch { return ""; }
  })();

  const source = getSourceBadge(hostname);
  const currentPrice = Number(product.current_price);
  const alertPrice = product.alert_price ? Number(product.alert_price) : null;
  const diff = alertPrice !== null ? currentPrice - alertPrice : null;
  const isTargetMet = diff !== null && diff <= 0;

  return (
    <>
      {/* Card — clicking anywhere opens the modal */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group text-left w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Product image — fixed height, consistent across all cards */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-50">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <TrendingDown className="size-8 text-slate-300" />
            </div>
          )}
          {/* Source badge */}
          <span
            className={`absolute left-2.5 top-2.5 rounded-full border px-2 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur-sm ${source.className}`}
          >
            {source.label}
          </span>
        </div>

        {/* Card info */}
        <div className="px-4 pb-4 pt-3 space-y-2">
          {/* Product name — single line, truncated */}
          <p className="truncate text-sm font-semibold text-slate-900">
            {product.name}
          </p>

          {/* Current price */}
          <p className="text-lg font-bold tracking-tight text-slate-900">
            {formatPrice(currentPrice, product.currency)}
          </p>

          {/* Alert row */}
          {alertPrice !== null ? (
            <div
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${isTargetMet
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
                }`}
            >
              <Bell className="size-3 shrink-0" />
              {isTargetMet
                ? "Target met!"
                : `${formatPrice(Math.abs(diff!), product.currency)} away`}
              <span className="ml-auto text-[10px] opacity-60">
                Alert: {formatPrice(alertPrice, product.currency)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-400">
              <BellOff className="size-3 shrink-0" />
              Tap to set price alert
            </div>
          )}
        </div>
      </button>

      {/* Detail modal */}
      <ProductModal
        product={product}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
