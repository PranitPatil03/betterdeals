import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AuthPageCard from "@/components/AuthPageCard";

export default async function SignInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <AuthPageCard mode="sign-in" />;
}
