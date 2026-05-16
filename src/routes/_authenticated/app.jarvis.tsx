import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard } from "@/components/matrix/primitives";

export const Route = createFileRoute("/_authenticated/app/jarvis")({ component: () => (
  <><PageHeader kicker="AI Core" title="Jarvis" />
  <GlassCard><p className="text-sm text-muted-foreground">Chat streaming Jarvis chega na próxima ativação. Capability registry + AI Router já operacionais — use Content Factory para invocar.</p></GlassCard></>
) });
