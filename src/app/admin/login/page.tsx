"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "verifying">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Supabase's admin-generated links (no PKCE verifier available) land here
  // with tokens in the URL fragment instead of a `?code=` for /auth/callback
  // to exchange. Pick those up client-side and turn them into a session.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const hashError = params.get("error_description");

    (async () => {
      if (hashError) {
        setStatus("error");
        setErrorMessage(hashError.replace(/\+/g, " "));
        return;
      }
      if (accessToken && refreshToken) {
        setStatus("verifying");
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setStatus("error");
          setErrorMessage(error.message);
          return;
        }
        router.push("/admin");
        router.refresh();
      }
    })();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-2xl font-bold">WHOLESOME Admin</h1>
      <p className="mt-1 text-sm text-ink/60">Sign in with a magic link sent to your email.</p>

      {status === "verifying" ? (
        <p className="mt-6 text-sm text-ink/60">Signing you in…</p>
      ) : status === "sent" ? (
        <p className="mt-6 rounded-xl bg-emerald/10 p-4 text-sm text-emerald">
          Check your inbox for a sign-in link.
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
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-emerald py-2.5 font-semibold text-cream disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
          {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
        </form>
      )}
    </div>
  );
}
