"use client";

import {
  Dialog,
  DialogClose,
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
  // Alert is only meaningful when alert_price < current_price (user wants a lower price)
  const alertIsValid = localAlertPrice !== null && localAlertPrice < currentPrice;
  const diff = localAlertPrice !== null ? currentPrice - localAlertPrice : null;
  const isTargetMet = localAlertPrice !== null && currentPrice <= localAlertPrice && alertIsValid;

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
    if (parsed >= currentPrice) {
      toast.error("Alert price must be lower than the current price.");
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
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-[960px] p-0 overflow-hidden rounded-3xl gap-0 max-h-[92vh] flex flex-col border-0 shadow-2xl"
      >
        {/* Scrollable wrapper */}
        <div className="flex-1 overflow-y-auto">
          {/* Horizontal layout: left = image/details, right = chart/prices */}
          <div className="flex min-h-0 flex-col md:flex-row">
            {/* Left: image + details */}
            <div className="md:w-[380px] shrink-0 flex flex-col items-center justify-start bg-white p-0">
              <div className="relative w-full flex items-center justify-center pt-4" style={{ minHeight: 220 }}>
                {/* Close button overlaid on image area */}
                <div className="absolute right-3 top-3 z-10">
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
                    >
                      <X className="size-3.5" />
                      Close
                    </button>
                  </DialogClose>
                </div>
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-h-[200px] max-w-[85%] object-contain transition-transform duration-500 hover:scale-[1.05]"
                  />
                ) : (
                  <div className="flex h-[180px] w-full items-center justify-center">
                    <TrendingDown className="size-10 text-slate-300" />
                  </div>
                )}
              </div>
              {/* Source badge + name */}
              <div className="w-full px-5 pt-4">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${source.className}`}>{source.label}</span>
                <h2 className="mt-1.5 line-clamp-2 text-xl font-bold leading-snug text-slate-900">{product.name}</h2>
              </div>
              {/* Price */}
              <div className="w-full px-5 pt-2 pb-1">
                <p className="text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(currentPrice, product.currency, "en-US", { maximumFractionDigits: 2 })}</p>
              </div>
              {/* Alert diff banner — left aligned */}
              {localAlertPrice !== null && alertIsValid && (
                <div className={`w-full px-5 py-2`}>
                  <div className={`rounded-xl px-3 py-2.5 ${isTargetMet ? "bg-green-50" : "bg-amber-50"}`}>
                    {isTargetMet ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-green-800">Target price reached!</p>
                          <p className="text-xs text-green-600">At or below your alert of {formatCurrency(localAlertPrice, product.currency, "en-US", { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Target className="size-4 text-amber-600 shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-amber-800">{formatCurrency(Math.abs(diff!), product.currency, "en-US", { maximumFractionDigits: 2 })} away from target</p>
                          <p className="text-xs text-amber-600">Alert set at {formatCurrency(localAlertPrice, product.currency, "en-US", { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* View/Delete buttons */}
              <div className="flex w-full items-center gap-2 px-5 pt-2 pb-2">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-500 bg-linear-to-b from-sky-300 to-blue-500 px-4 text-sm font-medium text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
                >
                  <ExternalLink className="size-3.5" />
                  View on {source.label}
                </a>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {/* Alert price setter — below with border */}
              <div className="w-full px-5 pb-8 pt-2">
                <div className="rounded-xl border bg-white p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Bell className="size-3.5" />
                    {localAlertPrice ? "Update alert price" : "Set price alert"}
                  </p>
                  <div className="flex gap-2">
                    <Input type="number" value={alertInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlertInput(e.target.value)} placeholder="Target price..." className="h-9 text-sm bg-white" inputMode="decimal" />
                    <button
                      type="button"
                      onClick={handleSaveAlert}
                      disabled={savingAlert}
                      className="h-9 shrink-0 px-5 rounded-xl border border-blue-500 bg-linear-to-b from-sky-300 to-blue-500 text-sm font-medium text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)] disabled:opacity-50"
                    >
                      {savingAlert ? "Saving..." : localAlertPrice ? "Update" : "Set alert"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: chart/prices */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 md:border-l md:border-slate-100">
              <div className="flex-1 flex flex-col p-5 pb-0 min-h-0">
                <div className="flex-1 min-h-0">
                  <PriceChart productId={product.id} currentPrice={currentPrice} currentCurrency={product.currency} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
