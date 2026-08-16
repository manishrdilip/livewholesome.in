"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "signing-in" | "error" | "sending-reset" | "reset-sent"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("signing-in");
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function handleForgotPassword() {
    if (!email) {
      setStatus("error");
      setErrorMessage("Enter your email above first, then click \"Forgot password\".");
      return;
    }
    setStatus("sending-reset");
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
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
      <h1 className="font-serif text-2xl font-bold">WHOLESOME Admin</h1>
      <p className="mt-1 text-sm text-ink/60">Sign in with your admin email and password.</p>

      {status === "reset-sent" ? (
        <p className="mt-6 rounded-xl bg-emerald/10 p-4 text-sm text-emerald">
          Check your inbox for a password reset link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            required
            type="email"
            placeholder="you@example.com"
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
            disabled={status === "signing-in"}
            className="w-full rounded-full bg-emerald py-2.5 font-semibold text-cream disabled:opacity-50"
          >
            {status === "signing-in" ? "Signing in…" : "Sign in"}
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
    </div>
  );
}
