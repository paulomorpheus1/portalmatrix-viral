import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, Stat, GlassCard } from "@/components/matrix/primitives";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <PageHeader kicker="Matrix Command Center" title="Visão geral" />
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Conteúdos" value="0" delta="bootstrap" />
        <Stat label="Posts agendados" value="0" />
        <Stat label="Créditos" value="100" delta="+100 bônus" />
        <Stat label="Score viral médio" value="—" />
      </section>
      <section className="mt-8 grid lg:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="font-semibold">Próximos passos</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Conecte contas sociais em Distribution</li>
            <li>Ative providers premium em Providers (Groq, OpenRouter já prontos via secrets)</li>
            <li>Configure InfinitePay em Billing &amp; Pix</li>
            <li>Comece a gerar em Content Factory</li>
          </ul>
        </GlassCard>
        <GlassCard>
          <h3 className="font-semibold">Status do sistema</h3>
          <ul className="mt-3 space-y-1 text-sm">
            <li>✅ Lovable AI Gateway ativo</li>
            <li>✅ Auth (Email + Google)</li>
            <li>✅ Database + RLS</li>
            <li>⚙️ Providers premium: aguardando secrets</li>
            <li>⚙️ Social OAuth: aguardando ativação por plataforma</li>
            <li>⚙️ InfinitePay: aguardando chaves</li>
          </ul>
        </GlassCard>
      </section>
    </>
  );
}
