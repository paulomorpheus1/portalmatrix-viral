import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/policy")({ component: Page });

function Page() {
  const { data } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => (await supabase.from("policies").select("*").order("updated_at", { ascending: false })).data ?? [],
  });
  return (
    <>
      <PageHeader kicker="Compliance" title="Policy Intelligence" />
      <div className="grid sm:grid-cols-2 gap-3">
        {(data ?? []).map((p) => (
          <GlassCard key={p.id}>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.platform} · {p.severity}</p>
            <p className="font-semibold mt-1">{p.title}</p>
            <p className="text-xs text-muted-foreground mt-1">key: <code>{p.rule_key}</code></p>
          </GlassCard>
        ))}
        {(data ?? []).length === 0 && (
          <GlassCard><p className="text-sm text-muted-foreground">Sem políticas indexadas. Trend Radar + Tavily/Exa popula automaticamente via <code>search.policy</code>.</p></GlassCard>
        )}
      </div>
    </>
  );
}
