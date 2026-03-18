"use client";

import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import type { PlanTier } from "@/lib/types";

interface Props {
  user: User;
  tier: PlanTier;
}

export default function DashboardHeader({ user, tier }: Props) {
  const [upgrading, setUpgrading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handlePlanAction = async () => {
    setUpgrading(true);
    const endpoint = tier === "pro" ? "/api/stripe/portal" : "/api/stripe/checkout";
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
      } else {
        toast.error(json.error ?? "Unable to open billing");
        setUpgrading(false);
      }
    } catch {
      toast.error("Request failed");
      setUpgrading(false);
    }
  };

  // Google avatar URL from user metadata, or generate initials via DiceBear
  const avatarUrl: string =
    (user.user_metadata?.avatar_url as string | undefined) ??
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
      user.user_metadata?.full_name as string ?? user.email ?? "U"
    )}&backgroundColor=bfdbfe&textColor=1d4ed8`;

  const displayName: string =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    (user.email?.split("@")[0] ?? "User");

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f8fafc]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="better deals" width={32} height={32} className="rounded-sm" />
          <span className="text-xl font-semibold tracking-tight text-gray-900">better deals</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={tier === "pro" ? "outline" : "default"}
            size="sm"
            className={
              tier === "pro"
                ? "h-9 border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
                : "h-9 bg-linear-to-b from-sky-300 to-blue-500 text-white shadow-[0_4px_14px_rgba(56,189,248,0.40)] transition-all hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
            }
            onClick={handlePlanAction}
            disabled={upgrading}
          >
            {upgrading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Redirecting…
              </>
            ) : tier === "pro" ? (
              "Billing"
            ) : (
              "Upgrade to Pro"
            )}
          </Button>

          {/* Profile button + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center rounded-full p-0.5 transition-colors hover:bg-gray-200/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-8 rounded-full border border-gray-200 bg-blue-50 object-cover"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-sm border border-gray-200 bg-white py-2 shadow-lg">
                {/* User info */}
                <div className="border-b border-gray-100 px-4 pb-2">
                  <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>

                {/* Sign out */}
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="size-3.5" />
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
