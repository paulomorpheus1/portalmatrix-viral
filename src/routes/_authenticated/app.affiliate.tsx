import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, GlassCard, Stat } from "@/components/matrix/primitives";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated/app/affiliate")({ component: Page });
function Page() {
  const { data } = useQuery({ queryKey: ["affiliate"], queryFn: async () => {
    const { data } = await supabase.from("affiliates").select("*").maybeSingle();
    return data;
  }});
  return (<><PageHeader kicker="Growth" title="Afiliados" />
    <div className="grid sm:grid-cols-3 gap-4">
      <Stat label="Código" value={data?.code ?? "—"} />
      <Stat label="Cliques" value={String(data?.clicks ?? 0)} />
      <Stat label="Saldo (BRL)" value={`R$ ${((data?.balance_cents ?? 0)/100).toFixed(2)}`} />
    </div>
    <GlassCard className="mt-4"><p className="text-sm text-muted-foreground">Payout via InfinitePay (Pix). Refer-to-earn e post-to-earn já mapeados no schema.</p></GlassCard>
  </>);
}
