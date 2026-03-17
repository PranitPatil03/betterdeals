import { createClient } from "@/utils/supabase/server";
import {
  ArrowRight,
  Bell,
  ChartNoAxesCombined,
  Check,
  Shield,
} from "lucide-react";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { FREE_PLAN_PRODUCT_LIMIT } from "@/lib/plans";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const features = [
    {
      icon: ChartNoAxesCombined,
      title: "Live Price Intelligence",
      description:
        "Track live pricing trends with historical timelines and instant product snapshots.",
    },
    {
      icon: Shield,
      title: "Reliable Monitoring",
      description:
        "Consistent checks across top e-commerce stores using resilient scraping pipelines.",
    },
    {
      icon: Bell,
      title: "Email Alert Automation",
      description:
        "Receive automatic drop alerts so you never miss the best purchase window.",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For smart shoppers getting started",
      features: [
        `Track up to ${FREE_PLAN_PRODUCT_LIMIT} products`,
        "Price history charts",
        "Email price-drop alerts",
        "Google + email/password login",
      ],
      cta: user ? "Open Dashboard" : "Get Started",
      href: user ? "/dashboard" : "/sign-up",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$9",
      description: "For power users and deal hunters",
      features: [
        "Unlimited tracked products",
        "Priority checks and alerts",
        "Stripe billing portal",
        "Best for daily monitoring",
      ],
      cta: user ? "Upgrade to Pro" : "Start Pro",
      href: user ? "/dashboard" : "/sign-up",
      highlight: true,
    },
    {
      name: "Business",
      price: "Custom",
      description: "For teams and large buying workflows",
      features: [
        "Shared team workspaces",
        "Bulk product imports",
        "Advanced reporting",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      href: "mailto:support@betterdeals.app",
      highlight: false,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc]">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 0% 80%, rgba(253,200,180,0.30) 0%, transparent 60%), radial-gradient(ellipse 80% 100% at 100% 80%, rgba(186,210,255,0.42) 0%, transparent 60%), linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%)",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-gray-950/5 bg-[#f8fafc]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-2xl font-semibold tracking-tight text-gray-900">
            better deals
          </span>

          <AuthButton user={user} />
        </div>
      </header>

      <section className="relative px-6 pb-16 pt-20 md:pt-28">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-light tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Price tracking that
            <br className="hidden sm:block" />
            works while you sleep
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-gray-500 md:text-lg">
            Monitor products from major stores, collect trend history, and get
            instant email alerts when prices drop.
          </p>

          <div className="relative mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={user ? "/dashboard" : "/sign-up"}
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-gradient-to-b from-sky-300 to-blue-500 px-8 text-sm font-medium text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
            >
              {user ? "Open Dashboard" : "Get Started Free"}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-sm border bg-white px-3 py-1.5 shadow-sm">
              Free plan: {FREE_PLAN_PRODUCT_LIMIT} products
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm border bg-white px-3 py-1.5 shadow-sm">
              Email alerts enabled
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm border bg-white px-3 py-1.5 shadow-sm">
              Secure Supabase auth
            </span>
          </div>
        </div>
      </section>

      <section id="features" className="relative px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-normal tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
              Built for serious price tracking
            </h2>
            <p className="mt-4 text-base text-gray-500">
              A clean workflow from product URL to actionable pricing alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-sm border border-gray-950/[.06] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-sm border border-blue-200 bg-blue-50 p-2.5">
                  <Icon className="size-5 text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative px-6 py-20 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-normal tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-base text-gray-500">
              Choose the plan that matches your tracking volume.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-sm border bg-white transition-shadow ${plan.highlight ? "p-7 shadow-xl md:-my-2 md:py-8" : "p-8 shadow-sm"}`}
              >
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-3">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-sm text-gray-400">/month</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-gray-500">{plan.description}</p>

                <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-8 flex h-12 items-center justify-center rounded-sm text-sm font-medium transition-all ${plan.highlight ? "bg-gradient-to-b from-sky-300 to-blue-500 text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Ready to catch every drop?
          </h2>
          <p className="mt-4 text-base text-gray-500 md:text-lg">
            Start with Free, scale to Pro when your tracking list grows.
          </p>
          <Link
            href={user ? "/dashboard" : "/sign-up"}
            className="mt-10 inline-flex h-12 items-center rounded-lg bg-gradient-to-b from-sky-300 to-blue-500 px-8 text-sm font-medium text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
          >
            {user ? "Go to Dashboard" : "Try for Free"}
          </Link>
        </div>
      </section>
    </main>
  );
}
