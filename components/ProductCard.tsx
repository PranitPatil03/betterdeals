"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions";
import PriceChart from "./PriceChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Trash2,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import type { ProductRecord } from "@/lib/types";

interface ProductCardProps {
  product: ProductRecord;
  view?: "grid" | "list";
}

export default function ProductCard({ product, view = "grid" }: ProductCardProps) {
  const [showChart, setShowChart] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this product from tracking?")) return;
    setDeleting(true);
    await deleteProduct(product.id);
  };

  const domain = (() => {
    try { return new URL(product.url).hostname.replace("www.", ""); }
    catch { return ""; }
  })();

  /* ─── LIST VIEW ─── */
  if (view === "list") {
    return (
      <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="size-14 shrink-0 rounded-xl border object-cover"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <TrendingDown className="size-5 text-gray-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
          {domain && <p className="mt-0.5 text-xs text-gray-400">{domain}</p>}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-slate-900">
            {product.currency} {product.current_price}
          </p>
          <Badge variant="secondary" className="mt-1 gap-1 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 text-xs">
            <TrendingDown className="size-3" /> Tracking
          </Badge>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          <Button variant="outline" size="sm" asChild className="h-8 w-8 rounded-full p-0">
            <Link href={product.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="h-8 w-8 rounded-full p-0 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  /* ─── GRID VIEW ─── */
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {product.image_url ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {domain && (
            <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-black/55 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
              {domain}
            </span>
          )}
        </div>
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-slate-100">
          <TrendingDown className="size-6 text-slate-400" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {product.currency} {product.current_price}
          </span>
          <Badge variant="secondary" className="gap-1 rounded-full border border-emerald-100 bg-emerald-50 text-xs text-emerald-700">
            <TrendingDown className="size-3" /> Tracking
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="flex-1 gap-1 rounded-xl text-xs"
          >
            {showChart ? (
              <><ChevronUp className="size-3.5" /> Hide Chart</>
            ) : (
              <><ChevronDown className="size-3.5" /> Price History</>
            )}
          </Button>

          <Button variant="outline" size="sm" asChild className="h-8 w-8 rounded-full p-0">
            <Link href={product.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="h-8 w-8 rounded-full p-0 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        {showChart && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <PriceChart
              productId={product.id}
              currentPrice={Number(product.current_price)}
              currentCurrency={product.currency}
            />
          </div>
        )}
      </div>
    </div>
  );
}
