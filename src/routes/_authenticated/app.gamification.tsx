import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Stat } from "@/components/matrix/primitives";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated/app/gamification")({ component: Page });
function Page() {
  const { data } = useQuery({ queryKey: ["gam"], queryFn: async () => (await supabase.from("gamification").select("*").maybeSingle()).data });
  return (<><PageHeader kicker="Engagement" title="Gamificação" />
    <div className="grid sm:grid-cols-3 gap-4">
      <Stat label="XP" value={String(data?.xp ?? 0)} />
      <Stat label="Nível" value={String(data?.level ?? 1)} />
      <Stat label="Streak" value={`${data?.streak_days ?? 0} dias`} />
    </div></>);
}
