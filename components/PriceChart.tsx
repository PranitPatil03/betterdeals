"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getPriceHistory, setAlertPrice } from "@/app/actions";
import { ArrowDownRight, ArrowUpRight, Clock3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type RangeKey = "1M" | "3M" | "6M" | "ALL";

const RANGE_WINDOW_DAYS: Record<RangeKey, number> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  ALL: 36500,
};

interface ChartPoint {
  date: string;
  ts: number;
  price: number;
  currency: string;
}

function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function formatCompact(value: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function PriceChart({
  productId,
  currentPrice,
  currentCurrency,
  initialAlertPrice,
}: {
  productId: string;
  currentPrice?: number;
  currentCurrency?: string;
  initialAlertPrice?: number | null;
}) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("3M");
  const [alertTarget, setAlertTarget] = useState(
    initialAlertPrice ? String(initialAlertPrice) : "",
  );
  const [savingAlert, setSavingAlert] = useState(false);

  useEffect(() => {
    async function loadData() {
      const history = await getPriceHistory(productId);

      const chartData = history.map((item) => ({
        date: new Date(item.checked_at).toLocaleDateString(),
        ts: new Date(item.checked_at).getTime(),
        price: Number(item.price),
        currency: item.currency || "USD",
      }));

      setData(chartData);
      if (!initialAlertPrice && chartData.length > 0) {
        setAlertTarget(String(Math.round(chartData[chartData.length - 1].price)));
      }
      setLoading(false);
    }

    loadData();
  }, [productId, initialAlertPrice]);
  const filteredData = useMemo(() => {
    if (range === "ALL" || data.length === 0) return data;

    const latestTimestamp = data[data.length - 1]?.ts ?? 0;
    const cutoffTs = latestTimestamp - RANGE_WINDOW_DAYS[range] * 24 * 60 * 60 * 1000;
    const recent = data.filter((point) => point.ts >= cutoffTs);
    return recent.length > 1 ? recent : data;
  }, [data, range]);

  const prices = useMemo(() => filteredData.map((point) => point.price), [filteredData]);
  const currency =
    currentCurrency || filteredData[filteredData.length - 1]?.currency || "USD";

  const highest = prices.length ? Math.max(...prices) : 0;
  const lowest = prices.length ? Math.min(...prices) : 0;
  const average = prices.length
    ? prices.reduce((sum, price) => sum + price, 0) / prices.length
    : 0;
  const latest = currentPrice ?? filteredData[filteredData.length - 1]?.price ?? 0;

  const deltaVsAverage = average > 0 ? ((average - latest) / average) * 100 : 0;

  const recommendation =
    latest <= average * 0.96 ? "Buy Now" : latest <= average * 1.04 ? "Good time" : "Wait";

  const handleSaveAlert = async () => {
    const parsed = Number(alertTarget);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid target price.");
      return;
    }
    setSavingAlert(true);
    const res = await setAlertPrice(productId, parsed);
    setSavingAlert(false);
    if (res.error) toast.error(res.error);
    else toast.success("Price alert saved!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 w-full">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading chart...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 w-full rounded-xl border border-gray-200 bg-gray-50/70">
        No price history yet. Check back after the first daily update!
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-800">Price history</h4>

        <div className="inline-flex items-center rounded-full bg-white p-1 shadow-sm">
          {(["1M", "3M", "6M", "ALL"] as RangeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${range === key
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {deltaVsAverage >= 0 ? (
            <ArrowDownRight className="size-4 text-green-600" />
          ) : (
            <ArrowUpRight className="size-4 text-red-600" />
          )}
          <span>
            {Math.abs(deltaVsAverage).toFixed(2)}% {deltaVsAverage >= 0 ? "lower" : "higher"} than average
          </span>
        </div>
        <span className="text-xs text-gray-400">Price intelligence</span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis
              tick={{ fontSize: 11 }}
              width={70}
              tickFormatter={(value: number) => formatCompact(value, currency)}
              stroke="#9ca3af"
            />
            <Tooltip
              formatter={(value: number) => [formatPrice(value, currency), "Price"]}
              labelStyle={{ color: "#374151" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#16a34a"
              strokeWidth={2}
              fill="url(#priceFill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[11px] text-gray-400">Highest price</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatPrice(highest, currency)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[11px] text-gray-400">Average price</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatPrice(average, currency)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[11px] text-gray-400">Lowest price</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatPrice(lowest, currency)}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
          <p className="text-[11px] text-blue-600">Current price</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatPrice(latest, currency)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock3 className="size-4" />
          Should you buy now?
        </div>
        <p className="mt-2 text-lg font-semibold text-gray-900">{recommendation}</p>
        <p className="text-xs text-gray-500">
          {recommendation === "Buy Now"
            ? "Current price is at a favorable level compared to recent trends."
            : recommendation === "Good time"
              ? "Price is near average. You can buy now or wait for a better drop."
              : "Price is above recent average. Waiting could get you a better deal."}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
        <p className="text-sm font-medium text-gray-800">Set price drop alert</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            type="number"
            value={alertTarget}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setAlertTarget(event.target.value)
            }
            inputMode="decimal"
            className="h-10"
          />
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveAlert}
            disabled={savingAlert}
            className="h-10 sm:min-w-36"
          >
            {savingAlert ? "Saving..." : "Set price alert"}
          </Button>
        </div>
      </div>
    </div>
  );
}
