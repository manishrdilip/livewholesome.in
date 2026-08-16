"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { loginSchema } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "error" | "sending-reset" | "reset-sent"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setStatus("error");
      setErrorMessage(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  async function handleForgotPassword() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setStatus("error");
      setErrorMessage('Enter your email above first, then click "Forgot password".');
      return;
    }
    setStatus("sending-reset");
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    // Routed through /auth/callback so the code exchange happens once,
    // server-side — same pattern as the admin login's reset flow.
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("reset-sent");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-ink/60">Access your saved addresses and order history.</p>

      {status === "reset-sent" ? (
        <p className="mt-6 rounded-xl bg-emerald/10 p-4 text-sm text-emerald">
          Check <strong>{email.trim().toLowerCase()}</strong> for a password reset link. Double
          check the spelling of that address — if it&apos;s wrong, the email won&apos;t arrive and
          nothing will tell you it failed.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-emerald py-2.5 font-semibold text-cream disabled:opacity-50"
          >
            {status === "sending" ? "Logging in…" : "Log in"}
          </button>
          {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={status === "sending-reset"}
            className="w-full text-center text-sm text-emerald hover:underline"
          >
            {status === "sending-reset" ? "Sending…" : "Forgot password?"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink/60">
        New here?{" "}
        <Link href="/signup" className="text-emerald hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
