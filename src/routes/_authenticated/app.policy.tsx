import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard } from "@/components/matrix/primitives";
export const Route = createFileRoute("/_authenticated/app/policy")({ component: () => (
  <><PageHeader kicker="Compliance" title="Policy Intelligence" />
  <GlassCard><p className="text-sm text-muted-foreground">Engine de policy database pronta (tabela <code>policies</code>). Ativação dos crawlers acompanha Trend Radar.</p></GlassCard></>
) });
