"use client";

import { useState } from "react";
import { addProduct } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AddProductFormProps {
  user: User | null;
  isLimitReached: boolean;
}

export default function AddProductForm({
  user,
  isLimitReached,
}: AddProductFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (isLimitReached) {
      toast.error("Tracking limit reached. Manage billing to continue tracking.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("url", url);

    const result = await addProduct(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Product tracked successfully!");
      setUrl("");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="url"
          value={url}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setUrl(event.target.value)
          }
          placeholder="Paste product URL (Amazon, Walmart, etc.)"
          className="h-12 text-base"
          required
          disabled={loading}
        />

        <Button
          type="submit"
          disabled={loading}
          variant="default"
          className="h-10 sm:h-12 px-8 bg-linear-to-b from-sky-300 to-blue-500 text-white shadow-[0_4px_14px_rgba(56,189,248,0.45)] transition-all hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(56,189,248,0.55)]"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Track Price"
          )}
        </Button>
      </div>
    </form>
  );
}
