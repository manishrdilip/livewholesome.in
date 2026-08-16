"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Without this, PKCE code-exchange (e.g. password reset) relies on a
        // legacy fallback cookie that isn't reliably written under cookie-based
        // storage, causing "PKCE code verifier not found" on the callback page.
        // This makes the flow id round-trip through the redirect URL instead.
        experimental: { appendPkceFlowIdToRedirects: true },
      },
    }
  );
}
