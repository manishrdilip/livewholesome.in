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
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
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

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-ink/60">Access your saved addresses and order history.</p>

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
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        New here?{" "}
        <Link href="/signup" className="text-emerald hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
