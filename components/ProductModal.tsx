"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Trash2,
  TrendingDown,
  Target,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import PriceChart from "./PriceChart";
import { deleteProduct } from "@/app/actions";
import { useState } from "react";
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
  open: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, open, onClose }: Props) {
  const [deleting, setDeleting] = useState(false);

  const hostname = (() => {
    try { return new URL(product.url).hostname; }
    catch { return ""; }
  })();

  const source = getSourceBadge(hostname);
  const currentPrice = Number(product.current_price);
  const alertPrice = product.alert_price ? Number(product.alert_price) : null;
  const diff = alertPrice !== null ? currentPrice - alertPrice : null;
  const isTargetMet = diff !== null && diff <= 0;

  const handleDelete = async () => {
    if (!confirm("Remove this product from tracking?")) return;
    setDeleting(true);
    await deleteProduct(product.id);
    onClose();
  };

  const trackedSince = product.created_at
    ? new Date(product.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 rounded-2xl">
        {/* ── Top section: image + details ── */}
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="sm:w-2/5 shrink-0">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-64 sm:h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-64 sm:h-full w-full items-center justify-center bg-slate-100">
                <TrendingDown className="size-10 text-slate-300" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col gap-4 p-6">
            {/* Source badge + name */}
            <div>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${source.className}`}
              >
                {source.label}
              </span>
              <h2 className="mt-2 text-xl font-bold leading-snug text-slate-900">
                {product.name}
              </h2>
              {trackedSince && (
                <p className="mt-1 text-xs text-slate-400">Tracked since {trackedSince}</p>
              )}
            </div>

            {/* Price box */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Item Price</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(currentPrice, product.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="font-semibold text-slate-700">—</span>
              </div>
              <div className="h-px bg-emerald-200" />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-emerald-700">Total All-In Price</span>
                <span className="font-bold text-emerald-700">
                  {formatPrice(currentPrice, product.currency)}
                </span>
              </div>
            </div>

            {/* Alert status */}
            {alertPrice !== null && (
              <div>
                {isTargetMet ? (
                  <Badge variant="secondary" className="gap-1.5 rounded-full bg-green-100 text-green-700 border border-green-200 px-3 py-1 text-sm">
                    <CheckCircle2 className="size-3.5" />
                    Target met! Check it out now
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 px-3 py-1 text-sm">
                    <Target className="size-3.5" />
                    {formatPrice(diff!, product.currency)} away from target (
                    {formatPrice(alertPrice, product.currency)})
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto flex items-center gap-2 pt-2">
              <Button variant="default" asChild className="flex-1 gap-1.5 rounded-xl" size="sm">
                <Link href={product.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  View on {source.label}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 w-9 rounded-xl p-0 text-red-500 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Price chart section ── */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-5">
          <PriceChart
            productId={product.id}
            currentPrice={currentPrice}
            currentCurrency={product.currency}
            initialAlertPrice={alertPrice}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
