import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard } from "@/components/matrix/primitives";
const PLATFORMS = ["tiktok","instagram","facebook","threads","x","youtube","kwai","discord","telegram"];
export const Route = createFileRoute("/_authenticated/app/social")({ component: () => (
  <><PageHeader kicker="Distribution" title="Social Distribution Engine" />
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {PLATFORMS.map((p) => <GlassCard key={p}><p className="font-semibold capitalize">{p}</p><p className="text-xs text-muted-foreground mt-1">OAuth-ready · scheduler-ready</p></GlassCard>)}
  </div></>
) });
