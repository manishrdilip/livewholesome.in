"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "error" | "resent">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("verifying");
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    const res = await fetch("/api/account/complete-signup", { method: "POST" });
    if (!res.ok) {
      setStatus("error");
      setErrorMessage("Verified, but we couldn't finish setting up your account. Try logging in.");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  async function handleResend() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.resend({ type: "signup", email });
    setStatus("resent");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-2xl font-bold">Verify your email</h1>
      <p className="mt-1 text-sm text-ink/60">
        Check <strong>{email}</strong> for our confirmation email — click the link in it and
        you&apos;re in. If it shows a code instead, enter it below.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          required
          inputMode="numeric"
          placeholder="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="input text-center text-lg tracking-[0.3em]"
        />
        <button
          type="submit"
          disabled={status === "verifying" || code.length < 6}
          className="w-full rounded-full bg-emerald py-2.5 font-semibold text-cream disabled:opacity-50"
        >
          {status === "verifying" ? "Verifying…" : "Verify"}
        </button>
        {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
        {status === "resent" && <p className="text-sm text-emerald">New code sent.</p>}
      </form>

      <button
        type="button"
        onClick={handleResend}
        className="mt-4 text-center text-sm text-emerald hover:underline"
      >
        Resend code
      </button>
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
