import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard, Stat } from "@/components/matrix/primitives";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated/app/billing")({ component: Page });
function Page() {
  const { data: wallet } = useQuery({ queryKey: ["wallet"], queryFn: async () => (await supabase.from("credits_wallet").select("*").maybeSingle()).data });
  return (<><PageHeader kicker="InfinitePay" title="Billing & Pix" />
    <div className="grid sm:grid-cols-3 gap-4 mb-4">
      <Stat label="Saldo créditos" value={String(wallet?.balance ?? 0)} />
      <Stat label="Ganhos totais" value={String(wallet?.lifetime_earned ?? 0)} />
      <Stat label="Consumo" value={String(wallet?.lifetime_spent ?? 0)} />
    </div>
    <GlassCard><p className="text-sm text-muted-foreground">Arquitetura InfinitePay pronta: Pix flow, subscriptions, webhooks, retry e payout. Conecte <code>INFINITEPAY_API_KEY</code> para ativar.</p></GlassCard>
  </>);
}
