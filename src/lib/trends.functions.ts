// Trend Radar — fetch & persist trend signals via search providers.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import "./providers/adapters.server";
import "./providers/search.server";
import { getProvider, providerIsConfigured } from "./providers/registry";

const SocialPlatform = z.enum([
  "tiktok","instagram","facebook","threads","x","youtube","kwai","discord","telegram",
]);

export const captureTrends = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    query: z.string().min(1).max(200),
    platform: SocialPlatform.default("tiktok"),
    region: z.string().min(2).max(8).default("BR"),
  }).parse(d))
  .handler(async ({ data }) => {
    const chain = ["tavily", "exa"];
    for (const slug of chain) {
      const adapter = getProvider(slug);
      if (!adapter || !providerIsConfigured(slug)) continue;
      const handler = adapter.capabilities["search.trend"];
      if (!handler) continue;
      try {
        const result = await handler(
          { query: `${data.query} ${data.platform} trending ${data.region}`, max_results: 12 },
          { providerSlug: slug, capabilitySlug: "search.trend" },
        );
        const items = (result.data as { results?: Array<{ title: string; url: string; content?: string; text?: string; score?: number }> }).results ?? [];
        if (!items.length) continue;
        const rows = items.slice(0, 12).map((it, i) => ({
          keyword: it.title.slice(0, 180),
          platform: data.platform,
          region: data.region,
          score: it.score ?? Number((1 - i / 12).toFixed(3)),
          payload: { url: it.url, snippet: (it.content ?? it.text ?? "").slice(0, 800), provider: slug },
        }));
        await supabaseAdmin.from("trends").insert(rows);
        return { ok: true as const, provider: slug, count: rows.length };
      } catch (err) {
        continue;
      }
    }
    return { ok: false as const, error: "No search provider configured. Add TAVILY_API_KEY or EXA_API_KEY." };
  });

export const listTrends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("trends")
      .select("*")
      .order("captured_at", { ascending: false })
      .limit(50);
    return data ?? [];
  });
