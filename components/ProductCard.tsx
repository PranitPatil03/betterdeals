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
      {/* Card — fixed square, click opens modal */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group text-left w-[260px] h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col"
      >
        {/* Product image — fixed square top half */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center bg-slate-50">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-[110px] max-w-[90%] object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]"
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

        {/* Card info — bottom half */}
        <div className="flex flex-col justify-between px-4 py-3 gap-2 min-h-[90px]">
          {/* Product name — single line, truncated */}
          <p className="truncate text-sm font-semibold text-slate-900">
            {product.name}
          </p>

          {/* Price row with alert toggle */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {formatPrice(currentPrice, product.currency)}
            </span>
            {/* Alert toggle button */}
            <button
              type="button"
              aria-label={alertPrice !== null ? "Disable alert" : "Enable alert"}
              className={`ml-2 rounded-full border-2 ${alertPrice !== null ? (isTargetMet ? "border-green-500 bg-green-50" : "border-amber-400 bg-amber-50") : "border-slate-200 bg-slate-50"} p-1 transition-colors`}
              tabIndex={-1}
              onClick={e => { e.stopPropagation(); setOpen(true); }}
            >
              {alertPrice !== null ? <Bell className="size-4 text-green-600" /> : <BellOff className="size-4 text-slate-400" />}
            </button>
          </div>
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
