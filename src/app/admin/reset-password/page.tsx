"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "saving" | "error" | "link-error">(
    "checking"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Real password-reset emails (browser-initiated resetPasswordForEmail) use
  // PKCE, landing here with `?code=`. Admin-generated test links (via the
  // service-role generateLink helper, no PKCE verifier available) instead
  // carry access/refresh tokens in the URL hash — handle both.
  useEffect(() => {
    const code = searchParams.get("code");
    const supabase = createBrowserSupabaseClient();

    (async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("link-error");
          setErrorMessage(error.message);
          return;
        }
        setStatus("ready");
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashError = hashParams.get("error_description");

      if (hashError) {
        setStatus("link-error");
        setErrorMessage(hashError.replace(/\+/g, " "));
        return;
      }
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setStatus("link-error");
          setErrorMessage(error.message);
          return;
        }
        setStatus("ready");
        return;
      }

      setStatus("link-error");
      setErrorMessage("This reset link is invalid. Request a new one from the login page.");
    })();
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus("error");
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords don't match.");
      return;
    }

    setStatus("saving");
    setErrorMessage("");

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-2xl font-bold">Set a new password</h1>

      {status === "link-error" ? (
        <p className="mt-6 text-sm text-red-600">{errorMessage}</p>
      ) : status === "checking" ? (
        <p className="mt-6 text-sm text-ink/60">Verifying your reset link…</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            required
            type="password"
            placeholder="New password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <input
            required
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
          />
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded-full bg-emerald py-2.5 font-semibold text-cream disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save password"}
          </button>
          {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
