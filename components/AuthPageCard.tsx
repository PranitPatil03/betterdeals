"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/logo.png";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuthPageCardProps {
  mode: "sign-in" | "sign-up";
}

export default function AuthPageCard({ mode }: AuthPageCardProps) {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "sign-up";

  const title = useMemo(
    () => (isSignUp ? "Create an Account" : "Login to your account"),
    [isSignUp],
  );

  const subtitle = useMemo(
    () =>
      isSignUp
        ? "Start tracking products and get instant drop alerts."
        : "Welcome back! Sign in to continue tracking your products.",
    [isSignUp],
  );

  const handleGoogle = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      setLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created. Please confirm your email.");
      router.push("/sign-in");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#f8fafc] px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-8 py-10">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3">
          <Image src={Logo} alt="better deals logo" width={38} height={38} className="rounded-md" />
          <span className="text-2xl font-medium tracking-tight text-gray-900">better deals</span>
        </Link>
        <h1 className="mt-3 text-center text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1.5 text-center text-sm text-gray-500">{subtitle}</p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email address"
              className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus-visible:border-blue-400 focus-visible:ring-blue-400/20"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                className="h-11 rounded-lg border-gray-200 bg-gray-50 pr-10 text-sm placeholder:text-gray-400 focus-visible:border-blue-400 focus-visible:ring-blue-400/20"
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="h-11 w-full rounded-lg border border-blue-500 bg-linear-to-b from-sky-300 to-blue-500 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Please wait...
              </>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Or authorize with
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full gap-2.5 rounded-lg border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
          onClick={handleGoogle}
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        <p className="mt-7 text-center text-sm text-gray-500">
          {isSignUp
            ? "Already have an account?"
            : "Don\u2019t have an account?"}{" "}
          <Link
            href={isSignUp ? "/sign-in" : "/sign-up"}
            className="font-semibold text-blue-600 hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}
