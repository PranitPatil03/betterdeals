"use client";

import { useState } from "react";
import { Bell, BellOff, TrendingDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
        className="group text-left w-[260px] h-[260px] overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col"
      >
        {/* Product image — fixed square top half */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-[145px] max-w-[92%] object-contain p-2 transition-transform duration-500 group-hover:scale-[1.1]"
              style={{ background: "none", width: "145px", height: "145px" }}
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

          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {formatPrice(currentPrice, product.currency)}
            </span>
            {/* Alert toggle using Switch/Label */}
            <div className="flex items-center space-x-2">
              <Switch id={`alert-switch-${product.id}`} checked={alertPrice !== null} onCheckedChange={() => setOpen(true)} />
              <Label htmlFor={`alert-switch-${product.id}`}>Alert</Label>
            </div>
          </div>
          {/* Alert text below price */}
          {alertPrice !== null && (
            <div className="mt-1 text-xs font-medium text-slate-700">
              {isTargetMet ? (
                <span className="text-green-700">Target reached. Great time to buy.</span>
              ) : (
                <span>Alert set at {formatPrice(alertPrice, product.currency)}</span>
              )}
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
