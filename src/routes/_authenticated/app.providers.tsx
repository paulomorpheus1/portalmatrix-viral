import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { Badge } from "@/components/ui/badge";
import { listConfiguredProviders } from "@/lib/ai-router.functions";

export const Route = createFileRoute("/_authenticated/app/providers")({ component: Page });

function Page() {
  const fetchFn = useServerFn(listConfiguredProviders);
  const { data, isLoading } = useQuery({ queryKey: ["providers"], queryFn: () => fetchFn() });
  return (
    <>
      <PageHeader kicker="Capability Layer" title="Providers" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-muted-foreground">Carregando…</p>}
        {data?.map((p) => (
          <GlassCard key={p.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.kind} · {p.slug}</p>
              </div>
              <Badge variant={p.configured ? "default" : "outline"}>{p.configured ? "ativo" : "pendente"}</Badge>
            </div>
            {p.secret_name && <p className="mt-3 text-xs text-muted-foreground">Secret: <code>{p.secret_name}</code></p>}
          </GlassCard>
        ))}
      </div>
    </>
  );
}
