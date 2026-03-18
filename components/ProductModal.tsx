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
export default function ProductModal({ product, open, onClose }: { product: ProductRecord; open: boolean; onClose: () => void }) {
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
      <DialogContent showCloseButton={false} className="max-w-3xl p-0 overflow-hidden rounded-2xl gap-0 max-h-[90vh] flex flex-col">
        {/* Custom close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900"
        >
          <X className="size-4" />
        </button>

        {/* Horizontal layout: left = image/details, right = chart/prices */}
        <div className="flex flex-1 flex-row min-h-[340px]">
          {/* Left: image + details */}
          <div className="w-[260px] shrink-0 flex flex-col items-center justify-start bg-white border-r border-slate-100 p-0">
            <div className="w-full flex items-center justify-center" style={{ height: 220 }}>
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-h-[180px] max-w-[90%] object-contain p-4"
                  style={{ background: "none", width: "180px", height: "180px" }}
                />
              ) : (
                <div className="flex h-[180px] w-full items-center justify-center">
                  <TrendingDown className="size-10 text-slate-300" />
                </div>
              )}
            </div>
            {/* Source badge + name */}
            <div className="w-full px-4 pt-4">
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${source.className}`}>{source.label}</span>
              <h2 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-slate-900">{product.name}</h2>
            </div>
            {/* Price */}
            <div className="w-full px-4 pt-2 pb-1">
              <p className="text-2xl font-bold tracking-tight text-slate-900">{formatCurrency(currentPrice, product.currency, "en-US", { maximumFractionDigits: 2 })}</p>
            </div>
            {/* Alert diff banner */}
            {localAlertPrice !== null && (
              <div className={`mx-4 my-2 rounded-xl px-4 py-3 ${isTargetMet ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                {isTargetMet ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Target price reached!</p>
                      <p className="text-xs text-green-600">At or below your alert of {formatCurrency(localAlertPrice, product.currency, "en-US", { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">{formatCurrency(Math.abs(diff!), product.currency, "en-US", { maximumFractionDigits: 2 })} away from target</p>
                      <p className="text-xs text-amber-600">Alert set at {formatCurrency(localAlertPrice, product.currency, "en-US", { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* View/Delete buttons */}
            <div className="flex items-center gap-2 px-4 pt-1 pb-2">
              <Button variant="default" asChild className="flex-1 gap-1.5 rounded-xl h-9" size="sm">
                <a href={product.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  View on {source.label}
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="h-9 w-9 shrink-0 rounded-xl p-0 text-red-500 hover:bg-red-50 border-red-200">
                <Trash2 className="size-4" />
              </Button>
            </div>
            {/* Alert price setter */}
            <div className="mt-auto w-full px-4 pb-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Bell className="size-3.5" />
                  {localAlertPrice ? "Update alert price" : "Set price alert"}
                </p>
                <div className="flex gap-2">
                  <Input type="number" value={alertInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlertInput(e.target.value)} placeholder="Target price…" className="h-9 text-sm" inputMode="decimal" />
                  <Button variant="default" size="sm" onClick={handleSaveAlert} disabled={savingAlert} className="h-9 shrink-0 px-4">{savingAlert ? "Saving…" : localAlertPrice ? "Update" : "Set alert"}</Button>
                </div>
              </div>
            </div>
          </div>
          {/* Right: chart/prices */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="flex-1 flex flex-col p-5 pb-0 min-h-0">
              <div className="flex-1 min-h-0">
                <PriceChart productId={product.id} currentPrice={currentPrice} currentCurrency={product.currency} />
              </div>
            </div>
            {/* Should you buy — always at bottom */}
            <div className="border-t border-slate-100 p-4 bg-white">
              <div className="text-center text-base font-semibold text-slate-900">Should you buy?</div>
              <div className="mt-1 text-center text-sm text-slate-600">This price is {diff !== null && diff <= 0 ? "at or below" : "above"} your target. {diff !== null && diff <= 0 ? "Great time to buy!" : "Consider waiting for a better deal."}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
