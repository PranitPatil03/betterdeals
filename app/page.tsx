import { createClient } from "@/utils/supabase/server";
import { ArrowRight, Check } from "lucide-react";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { FREE_PLAN_PRODUCT_LIMIT } from "@/lib/plans";
import Image from "next/image";
import { redirect } from "next/navigation";
import Logo from "./logo.png";

const features = [
  {
    image: "/images/Monitoring.png",
    title: "Continuous Monitoring",
    description:
      "Track products from major stores with dependable checks that keep your watchlist current.",
    notes: ["Amazon and marketplace pages", "Scheduled checks that keep running", "Built for daily tracking"],
    accent: "sky",
  },
  {
    image: "/images/price.png",
    title: "Price Intelligence",
    description:
      "Turn raw price updates into readable trend history so you can spot the right time to buy.",
    notes: ["Historical timelines", "Instant price snapshots", "Quick trend reading"],
    accent: "blue",
  },
  {
    image: "/images/alert.png",
    title: "Instant Alerts",
    description:
      "Email alerts reach you the moment prices drop, so you catch deals without watching all day.",
    notes: ["Fast drop notifications", "Inbox-ready summaries", "Useful the moment it matters"],
    accent: "indigo",
  },
] as const;

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "For shoppers tracking a smaller watchlist with essential alerts.",
    cta: "Get Started for Free",
    href: "/sign-up",
    highlight: false,
    features: [
      `Track up to ${FREE_PLAN_PRODUCT_LIMIT} products`,
      "Price history charts",
      "Email price-drop alerts",
      "Google + email/password login",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious deal hunters who want unlimited monitoring and priority checks.",
    cta: "Upgrade to Pro",
    href: "/sign-up",
    highlight: true,
    features: [
      "Unlimited tracked products",
      "Priority checks and alerts",
      "Stripe billing portal",
      "Best for daily monitoring",
    ],
  },
] as const;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[50vw] w-[50vw] rounded-full bg-blue-300/30 blur-[100px]" />
        <div className="absolute right-[-10%] top-[18%] h-[38vw] w-[38vw] rounded-full bg-orange-200/40 blur-[100px]" />
        <div className="absolute bottom-[-14%] left-[20%] h-[60vw] w-[60vw] rounded-full bg-rose-100/40 blur-[110px]" />
      </div>

      <header className="absolute top-0 z-50 w-full px-6">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src={Logo} alt="better deals logo" width={38} height={38} className="rounded-md" />
            <span className="text-2xl font-medium tracking-tight text-gray-900">better deals</span>
          </Link>

          <AuthButton user={user} />
        </div>
      </header>

      <section className="relative px-6 pb-16 pt-32 md:pt-40 lg:pt-48">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h1 className="max-w-4xl text-4xl font-light leading-[1.08] tracking-tight text-gray-900 md:text-5xl lg:text-7xl">
            Price tracking that
            <br />
            works while you{" "}
            <span className="bg-linear-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              sleep
            </span>
          </h1>

          <div className="mt-6 max-w-2xl text-center text-lg leading-relaxed text-gray-500 md:text-xl">
            <p className="text-balance w-full">
              Monitor products from major stores, collect trend history, and get instant email alerts when prices drop.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-blue-500 bg-linear-to-b from-sky-300 to-blue-500 px-8 text-base font-medium text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>

            <p className="text-sm text-gray-400">
              Free for up to {FREE_PLAN_PRODUCT_LIMIT} tracked products. Upgrade when your watchlist grows.
            </p>
          </div>
        </div>

      </section>

      <section id="features" className="relative px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-light tracking-tight text-gray-900 md:text-5xl">
              Built for focused, reliable tracking
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Everything from product URL to alert delivery is designed to stay simple, fast, and readable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white/70 p-7 backdrop-blur-sm shadow-accent-foreground border border-gray-100 transition-shadow"
              >
                <Image src={feature.image} alt={feature.title} width={34} height={34} className="size-8 object-contain" />
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-3 min-h-16 text-sm leading-relaxed text-gray-500">{feature.description}</p>

                <ul className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                  {feature.notes.map((note) => (
                    <li key={note} className="flex items-start gap-3">
                      <span
                        className={`mt-2 size-1.5 rounded-full ${feature.accent === "sky" ? "bg-sky-400" : feature.accent === "blue" ? "bg-blue-500" : "bg-indigo-500"}`}
                      />
                      <span className="text-sm leading-6 text-gray-600">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden px-6 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[20%] h-[30vw] w-[30vw] rounded-full bg-indigo-200/20 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-rose-100/30 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-light tracking-tight text-gray-900 md:text-5xl">
              Simple, transparent{" "}
              <span className="bg-linear-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                pricing
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
              Choose the plan that matches your tracking volume. Upgrade anytime for deeper alerts and faster checks.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl p-8 md:p-10 ${plan.highlight ? "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]" : "origin-center bg-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.04)] backdrop-blur-sm md:origin-right md:scale-95"}`}
              >
                {plan.highlight && (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100 opacity-60 blur-[50px]" />
                )}

                <div className="relative z-10 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                </div>

                <p className="relative z-10 mb-8 flex items-baseline gap-1">
                  <span className="text-6xl font-light tracking-tight text-gray-900">{plan.price}</span>
                  <span className="text-base font-medium text-gray-400">{plan.period}</span>
                </p>

                <Link
                  href={plan.href}
                  className={`relative z-10 flex h-12 w-full items-center justify-center rounded-xl text-base font-medium transition-all duration-200 ${plan.highlight ? "border border-blue-500 bg-linear-to-b from-sky-300 to-blue-500 text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]" : "border border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-50 hover:shadow"}`}
                >
                  {plan.cta}
                </Link>

                <div className="relative z-10 mt-10 grow">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
                    {plan.highlight ? "Everything in free, plus:" : "Included features:"}
                  </p>

                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-4">
                        <div className={`mt-1 rounded-full p-0.5 ${plan.highlight ? "bg-blue-100 text-blue-600" : "bg-sky-100 text-sky-600"}`}>
                          <Check className="size-3" strokeWidth={3} />
                        </div>
                        <span className={`text-sm ${plan.highlight ? "font-medium text-gray-900" : "text-gray-600"}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 pb-24 pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Ready to catch every drop?
          </h2>
          <p className="mt-4 text-base text-gray-500 md:text-lg">
            Start with Free, scale to Pro when your tracking list grows.
          </p>
          <Link
            href="/sign-up"
            className="mt-10 inline-flex h-12 items-center rounded-xl border border-blue-500 bg-linear-to-b from-sky-300 to-blue-500 px-8 text-sm font-medium text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
          >
            Try for Free
          </Link>
        </div>
      </section>
    </main>
  );
}
