import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { myProviderUsage, myWebhookLogs } from "@/lib/observability.functions";

export const Route = createFileRoute("/_authenticated/app/logs")({ component: Page });

function Page() {
  const usageFn = useServerFn(myProviderUsage);
  const hooksFn = useServerFn(myWebhookLogs);
  const { data: usage } = useQuery({ queryKey: ["usage"], queryFn: () => usageFn() });
  const { data: hooks } = useQuery({ queryKey: ["hooks"], queryFn: () => hooksFn() });

  return (
    <>
      <PageHeader kicker="Observability" title="Webhooks & Logs" />
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard>
          <p className="text-sm font-semibold mb-3">Provider Usage (você)</p>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto text-xs">
            {(usage ?? []).map((u) => (
              <div key={u.id} className="flex justify-between border-b border-border/40 pb-1">
                <span>{u.provider_slug} · {u.capability_slug}</span>
                <span className={u.success ? "text-success" : "text-destructive"}>
                  {u.latency_ms ?? "?"}ms {u.success ? "✓" : "✕"}
                </span>
              </div>
            ))}
            {(usage ?? []).length === 0 && <p className="text-muted-foreground">Sem chamadas ainda.</p>}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-sm font-semibold mb-3">Webhooks (admin)</p>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto text-xs">
            {(hooks ?? []).map((h) => (
              <div key={h.id} className="flex justify-between border-b border-border/40 pb-1">
                <span>{h.source} · {h.event}</span>
                <span className={h.signature_ok === false ? "text-destructive" : "text-muted-foreground"}>
                  {new Date(h.created_at).toLocaleTimeString("pt-BR")}
                </span>
              </div>
            ))}
            {(hooks ?? []).length === 0 && <p className="text-muted-foreground">Sem webhooks recebidos.</p>}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
