import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard } from "@/components/matrix/primitives";
export const Route = createFileRoute("/_authenticated/app/trends")({ component: () => (
  <><PageHeader kicker="Intelligence" title="Trend Radar" />
  <GlassCard><p className="text-sm text-muted-foreground">Tabela <code>trends</code> pronta. Tavily/Exa ficam ativos ao adicionar <code>TAVILY_API_KEY</code> / <code>EXA_API_KEY</code>.</p></GlassCard></>
) });
