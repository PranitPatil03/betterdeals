import { createClient } from "@/utils/supabase/server";
import { getProducts } from "@/app/actions";
import { getBillingSnapshotForUser } from "@/lib/billing";
import { FREE_PLAN_PRODUCT_LIMIT } from "@/lib/plans";
import AddProductForm from "@/components/AddProductForm";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardView from "@/components/DashboardView";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const [products, billing] = await Promise.all([
    getProducts(),
    getBillingSnapshotForUser(user.id),
  ]);

  const isLimitReached =
    billing.tier === "free" && products.length >= FREE_PLAN_PRODUCT_LIMIT;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <DashboardHeader user={user} tier={billing.tier} />

      <div className="mx-auto max-w-screen-xl px-6 py-8">
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

        {/* Products — grid/list with empty state */}
        <DashboardView products={products} />
      </div>
    </main>
  );
}
