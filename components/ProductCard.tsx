"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, TrendingDown } from "lucide-react";
import ProductModal from "./ProductModal";
import type { ProductRecord } from "@/lib/types";
import { getSourceBadge } from "@/lib/product-source";
import { formatCurrency } from "@/lib/currency";

function formatPrice(price: number, currency: string): string {
  return formatCurrency(price, currency, "en-US", {
    maximumFractionDigits: 2,
  });
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
        className="group text-left w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Product image */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-50">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <TrendingDown className="size-8 text-slate-300" />
            </div>
          )}
          {/* Source badge overlaid on image */}
          <span
            className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur-sm ${source.className}`}
          >
            {source.label}
          </span>
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-3 p-4">
          {/* Product name */}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
            {product.name}
          </h3>

          {/* Current price + alert price */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">Current Price</p>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {formatPrice(currentPrice, product.currency)}
              </p>
            </div>

            {alertPrice !== null && (
              <div className="text-right">
                <p className="text-[11px] text-slate-400 mb-0.5">Alert</p>
                <p className="text-sm font-semibold text-slate-600">
                  {formatPrice(alertPrice, product.currency)}
                </p>
              </div>
            )}
          </div>

          {/* Status pill */}
          {alertPrice !== null ? (
            isTargetMet ? (
              <Badge variant="secondary" className="w-fit gap-1.5 rounded-full bg-green-100 text-green-700 border border-green-200 px-3 py-1 text-xs">
                <CheckCircle2 className="size-3" />
                Target met! Check it out now
              </Badge>
            ) : (
              <Badge variant="secondary" className="w-fit gap-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 px-3 py-1 text-xs">
                <Target className="size-3" />
                {formatPrice(Math.abs(diff!), product.currency)} away from target
              </Badge>
            )
          ) : (
            <Badge variant="secondary" className="w-fit gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs">
              <TrendingDown className="size-3" />
              Tracking — no alert set
            </Badge>
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
