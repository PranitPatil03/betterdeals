"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Trash2,
  TrendingDown,
  Target,
  CheckCircle2,
  Bell,
  X,
} from "lucide-react";
import PriceChart from "./PriceChart";
import { deleteProduct, setAlertPrice } from "@/app/actions";
import { useState } from "react";
import type { ProductRecord } from "@/lib/types";
import { getSourceBadge } from "@/lib/product-source";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

function formatPrice(price: number, currency: string): string {
  return formatCurrency(price, currency, "en-US", { maximumFractionDigits: 2 });
}

interface Props {
  product: ProductRecord;
  open: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, open, onClose }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [localAlertPrice, setLocalAlertPrice] = useState<number | null>(
    product.alert_price ? Number(product.alert_price) : null,
  );
  const [alertInput, setAlertInput] = useState(
    product.alert_price ? String(product.alert_price) : "",
  );
  const [savingAlert, setSavingAlert] = useState(false);

  const hostname = (() => {
    try { return new URL(product.url).hostname; }
    catch { return ""; }
  })();

  const source = getSourceBadge(hostname);
  const currentPrice = Number(product.current_price);
  const diff = localAlertPrice !== null ? currentPrice - localAlertPrice : null;
  const isTargetMet = diff !== null && diff <= 0;

  const handleDelete = async () => {
    if (!confirm("Remove this product from tracking?")) return;
    setDeleting(true);
    await deleteProduct(product.id);
    onClose();
  };

  const handleSaveAlert = async () => {
    const parsed = Number(alertInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid target price.");
      return;
    }
    setSavingAlert(true);
    const res = await setAlertPrice(product.id, parsed);
    setSavingAlert(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      setLocalAlertPrice(parsed);
      toast.success("Price alert saved!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-2xl p-0 overflow-hidden rounded-2xl gap-0 max-h-[90vh] overflow-y-auto">
        {/* Custom close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900"
        >
          <X className="size-4" />
        </button>

        {/* ── Top section: image (left) + details (right) ── */}
        <div className="flex flex-col sm:flex-row">

          {/* Product image — fixed 260px wide, 280px tall */}
          <div className="sm:w-[260px] shrink-0 bg-slate-50 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-[280px] w-full object-contain p-5"
              />
            ) : (
              <div className="flex h-[280px] w-full items-center justify-center">
                <TrendingDown className="size-10 text-slate-300" />
              </div>
            )}
          </div>

          {/* Details panel */}
          <div className="flex flex-1 flex-col gap-3 p-5 min-w-0">

            {/* 1. Alert diff banner — shown only when alert is set */}
            {localAlertPrice !== null && (
              <div
                className={`rounded-xl px-4 py-3 ${isTargetMet
                    ? "bg-green-50 border border-green-200"
                    : "bg-amber-50 border border-amber-200"
                  }`}
              >
                {isTargetMet ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Target price reached!</p>
                      <p className="text-xs text-green-600">
                        At or below your alert of {formatPrice(localAlertPrice, product.currency)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        {formatPrice(Math.abs(diff!), product.currency)} away from target
                      </p>
                      <p className="text-xs text-amber-600">
                        Alert set at {formatPrice(localAlertPrice, product.currency)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Alert price setter / updater */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Bell className="size-3.5" />
                {localAlertPrice ? "Update alert price" : "Set price alert"}
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={alertInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAlertInput(e.target.value)
                  }
                  placeholder="Target price…"
                  className="h-9 text-sm"
                  inputMode="decimal"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveAlert}
                  disabled={savingAlert}
                  className="h-9 shrink-0 px-4"
                >
                  {savingAlert ? "Saving…" : localAlertPrice ? "Update" : "Set alert"}
                </Button>
              </div>
            </div>

            {/* 3. Source badge + product name */}
            <div>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${source.className}`}
              >
                {source.label}
              </span>
              <h2 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-slate-900">
                {product.name}
              </h2>
            </div>

            {/* 4. Current price */}
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              {formatPrice(currentPrice, product.currency)}
            </p>

            {/* 5. View on [Source] + Delete */}
            <div className="mt-auto flex items-center gap-2 pt-1">
              <Button
                variant="default"
                asChild
                className="flex-1 gap-1.5 rounded-xl h-9"
                size="sm"
              >
                <a href={product.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  View on {source.label}
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 w-9 shrink-0 rounded-xl p-0 text-red-500 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Price history chart ── */}
        <div className="border-t border-slate-100 p-4">
          <PriceChart
            productId={product.id}
            currentPrice={currentPrice}
            currentCurrency={product.currency}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
