// AI Router — calls a capability through the best available provider.
// Auto fallback chain, usage logging, governance hook.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import "./providers/adapters.server";
import { getProvider, providerIsConfigured } from "./providers/registry";

const InvokeSchema = z.object({
  capability: z.string().min(1).max(64),
  input: z.unknown(),
  provider: z.string().min(1).max(64).optional(),
});

export const invokeCapability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => InvokeSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { capability, input, provider: requestedProvider } = data;

    // Resolve capability config from DB
    const { data: capRow } = await supabaseAdmin
      .from("capabilities")
      .select("default_provider, fallback_chain")
      .eq("slug", capability)
      .maybeSingle();

    if (!capRow) {
      return { ok: false as const, error: `Unknown capability: ${capability}` };
    }

    const chain: string[] = [
      ...(requestedProvider ? [requestedProvider] : []),
      ...(capRow.default_provider ? [capRow.default_provider] : []),
      ...((capRow.fallback_chain ?? []) as string[]),
    ].filter((v, i, a) => a.indexOf(v) === i);

    let lastError = "no providers tried";
    for (const slug of chain) {
      const adapter = getProvider(slug);
      if (!adapter) { lastError = `adapter missing: ${slug}`; continue; }
      if (!providerIsConfigured(slug)) { lastError = `not configured: ${slug}`; continue; }
      const handler = adapter.capabilities[capability];
      if (!handler) { lastError = `capability not implemented by ${slug}`; continue; }

      const t0 = Date.now();
      try {
        const result = await handler(input, { userId, capabilitySlug: capability, providerSlug: slug });
        const latency = Date.now() - t0;
        await supabaseAdmin.from("provider_usage").insert({
          user_id: userId,
          provider_slug: slug,
          capability_slug: capability,
          tokens_in: result.tokens_in ?? 0,
          tokens_out: result.tokens_out ?? 0,
          cost_cents: result.cost_cents ?? 0,
          latency_ms: latency,
          success: true,
        });
        const serialized = JSON.parse(JSON.stringify(result.data)) as string | number | boolean | null | { [k: string]: unknown } | unknown[];
        return { ok: true as const, provider: slug, data: serialized as Record<string, string> };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        await supabaseAdmin.from("provider_usage").insert({
          user_id: userId,
          provider_slug: slug,
          capability_slug: capability,
          latency_ms: Date.now() - t0,
          success: false,
          error: msg.slice(0, 500),
        });
      }
    }
    return { ok: false as const, error: lastError };
  });

export const listConfiguredProviders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data } = await supabaseAdmin.from("providers").select("*").order("priority");
    return (data ?? []).map((p) => ({
      ...p,
      configured: p.secret_name ? Boolean(process.env[p.secret_name]) : true,
    }));
  });
