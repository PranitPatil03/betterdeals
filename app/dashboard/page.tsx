import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { getProducts } from "@/app/actions";
import { getBillingSnapshotForUser } from "@/lib/billing";
import { FREE_PLAN_PRODUCT_LIMIT } from "@/lib/plans";
import AddProductForm from "@/components/AddProductForm";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardView from "@/components/DashboardView";
import { redirect } from "next/navigation";

function CardsSkeleton() {
  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[290px] rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col"
          >
            <div className="h-[160px] w-full animate-pulse bg-slate-100" />
            <div className="flex flex-col gap-3 p-4 flex-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function ProductsSection({ userId }: { userId: string }) {
  const [products, billing] = await Promise.all([
    getProducts(),
    getBillingSnapshotForUser(userId),
  ]);

  return <DashboardView products={products} />;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const [billing, productCount] = await Promise.all([
    getBillingSnapshotForUser(user.id),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then((res: { count: number | null }) => res.count ?? 0),
  ]);

  const isLimitReached =
    billing.tier === "free" && productCount >= FREE_PLAN_PRODUCT_LIMIT;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <DashboardHeader user={user} tier={billing.tier} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page heading + input together */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Tracking better deals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add products to monitor, view price history, and get instant drop alerts.
          </p>
          <div className="mt-5">
            <AddProductForm user={user} isLimitReached={isLimitReached} />
          </div>
        </div>

        {/* Products — skeleton while loading, then real cards */}
        <Suspense fallback={<CardsSkeleton />}>
          <ProductsSection userId={user.id} />
        </Suspense>
      </div>
    </main>
  );
}
