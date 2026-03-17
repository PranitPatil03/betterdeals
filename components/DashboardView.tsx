"use client";

import { useState } from "react";
import { LayoutGrid, List, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import type { ProductRecord } from "@/lib/types";

interface Props {
  products: ProductRecord[];
}

export default function DashboardView({ products }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");

  if (products.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center py-24 text-center">
        <PackageSearch className="size-14 text-gray-200 mb-5" strokeWidth={1.5} />
        <h3 className="text-xl font-semibold text-gray-900">No products tracked yet</h3>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Paste a product URL in the field above to start monitoring price drops
          and receive instant email alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {products.length} product{products.length !== 1 ? "s" : ""} tracked
        </p>

        <div className="flex items-center gap-0.5 rounded-sm border border-gray-200 bg-white p-0.5 shadow-sm">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2.5"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="size-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2.5"
            onClick={() => setView("list")}
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} view="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} view="list" />
          ))}
        </div>
      )}
    </div>
  );
}
