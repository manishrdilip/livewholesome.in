"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "resending" | "resent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleResend() {
    setStatus("resending");
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("resent");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-2xl font-bold">Check your email</h1>
      <p className="mt-1 text-sm text-ink/60">
        We sent a confirmation link to <strong>{email}</strong>. Click it to finish setting up
        your account.
      </p>

      <button
        type="button"
        onClick={handleResend}
        disabled={status === "resending"}
        className="mt-6 w-full rounded-full bg-emerald py-2.5 font-semibold text-cream disabled:opacity-50"
      >
        {status === "resending" ? "Resending…" : "Resend email"}
      </button>
      {status === "resent" && (
        <p className="mt-2 text-sm text-emerald">New email sent — check your inbox.</p>
      )}
      {status === "error" && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
