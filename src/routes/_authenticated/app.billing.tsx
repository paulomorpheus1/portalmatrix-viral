import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, GlassCard, Stat } from "@/components/matrix/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { createPixCharge, listMyPayments } from "@/lib/infinitepay.functions";

export const Route = createFileRoute("/_authenticated/app/billing")({ component: Page });

const PACKS = [
  { label: "Starter · 500 créditos", cents: 500 },
  { label: "Growth · 5.000 créditos", cents: 5000 },
  { label: "Scale · 25.000 créditos", cents: 25000 },
];

function Page() {
  const createPix = useServerFn(createPixCharge);
  const listPays = useServerFn(listMyPayments);
  const [amount, setAmount] = useState("500");
  const [busy, setBusy] = useState(false);

  const { data: wallet } = useQuery({ queryKey: ["wallet"], queryFn: async () => (await supabase.from("credits_wallet").select("*").maybeSingle()).data });
  const { data: payments, refetch } = useQuery({ queryKey: ["payments"], queryFn: () => listPays() });

  const charge = async (cents: number) => {
    setBusy(true);
    const r = await createPix({ data: { kind: "credit_topup", amount_cents: cents, description: "Top-up créditos" } });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    if (r.awaiting_api_key) toast.warning("Pagamento criado em modo pending. Adicione INFINITEPAY_API_KEY para gerar Pix real.");
    else toast.success("Pix gerado.");
    void refetch();
  };

  return (
    <>
      <PageHeader kicker="InfinitePay" title="Billing & Pix" />
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Saldo créditos" value={String(wallet?.balance ?? 0)} />
        <Stat label="Ganhos totais" value={String(wallet?.lifetime_earned ?? 0)} />
        <Stat label="Consumo" value={String(wallet?.lifetime_spent ?? 0)} />
      </div>

      <GlassCard className="mb-4">
        <p className="text-sm font-semibold mb-3">Top-up via Pix</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {PACKS.map((p) => (
            <Button key={p.cents} variant="outline" onClick={() => void charge(p.cents)} disabled={busy}>{p.label}</Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="valor em centavos" />
          <Button onClick={() => void charge(Math.max(100, Number(amount) || 0))} disabled={busy}>Gerar Pix custom</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Webhook: <code>/api/public/infinitepay-webhook</code></p>
      </GlassCard>

      <GlassCard>
        <p className="text-sm font-semibold mb-2">Pagamentos recentes</p>
        {(payments ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nenhum pagamento ainda.</p>}
        <div className="space-y-2">
          {(payments ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-border/50 pb-2 text-sm">
              <div>
                <p className="font-medium">R$ {(p.amount_cents / 100).toFixed(2)} · {p.kind}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                p.status === "succeeded" ? "bg-success/20 text-success" :
                p.status === "failed" ? "bg-destructive/20 text-destructive" :
                "bg-muted text-muted-foreground"
              }`}>{p.status}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}
