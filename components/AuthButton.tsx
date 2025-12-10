"use client";

import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function AuthButton({ user }: { user: User | null }) {
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-9" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit" className="gap-2 h-9">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-9 px-3 text-gray-700 hover:bg-white/60 hover:text-gray-900" asChild>
        <Link href="/sign-in">
          Login
        </Link>
      </Button>
      <Button
        variant="default"
        size="sm"
        className="h-9 rounded-xl border border-blue-500 bg-linear-to-b from-sky-300 to-blue-500 px-4 text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
        asChild
      >
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    </div>
  );
}
