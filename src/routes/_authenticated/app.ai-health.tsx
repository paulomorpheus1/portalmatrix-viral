import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated/app/ai-health")({ component: Page });
function Page() {
  const { data } = useQuery({ queryKey: ["usage"], queryFn: async () => (await supabase.from("provider_usage").select("*").order("created_at",{ascending:false}).limit(20)).data });
  return (<><PageHeader kicker="Telemetry" title="AI Health" />
    <GlassCard><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th>Provider</th><th>Capability</th><th>Latência</th><th>OK</th></tr></thead>
    <tbody>{(data ?? []).map((r) => <tr key={r.id} className="border-t border-border"><td>{r.provider_slug}</td><td>{r.capability_slug}</td><td>{r.latency_ms}ms</td><td>{r.success ? "✅" : "❌"}</td></tr>)}
    {(!data || data.length === 0) && <tr><td colSpan={4} className="text-muted-foreground py-4">Sem chamadas ainda.</td></tr>}</tbody></table></GlassCard></>);
}
