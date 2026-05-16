import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard } from "@/components/matrix/primitives";
export const Route = createFileRoute("/_authenticated/app/logs")({ component: () => (
  <><PageHeader kicker="Observability" title="Webhooks & Logs" />
  <GlassCard><p className="text-sm text-muted-foreground">Tabelas <code>webhook_logs</code> e <code>audit_logs</code> ativas (admin only). UI de visualização chega na próxima iteração.</p></GlassCard></>
) });
