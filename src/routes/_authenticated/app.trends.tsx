import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureTrends, listTrends } from "@/lib/trends.functions";

export const Route = createFileRoute("/_authenticated/app/trends")({ component: Page });

function Page() {
  const capture = useServerFn(captureTrends);
  const list = useServerFn(listTrends);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: trends, refetch } = useQuery({ queryKey: ["trends"], queryFn: () => list() });

  const run = async () => {
    if (!q.trim()) return;
    setBusy(true);
    const r = await capture({ data: { query: q, platform: "tiktok", region: "BR" } });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(`+${r.count} sinais via ${r.provider}`);
    void refetch();
  };

  return (
    <>
      <PageHeader kicker="Intelligence" title="Trend Radar" />
      <GlassCard className="mb-4">
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="nicho / tópico (ex: finanças pessoais)" />
          <Button onClick={() => void run()} disabled={busy || !q.trim()}>Capturar</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Requer <code>TAVILY_API_KEY</code> ou <code>EXA_API_KEY</code>.</p>
      </GlassCard>
      <div className="grid sm:grid-cols-2 gap-3">
        {(trends ?? []).map((t) => (
          <GlassCard key={t.id}>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.platform} · {t.region} · score {Number(t.score).toFixed(2)}</p>
            <p className="font-semibold mt-1 line-clamp-2">{t.keyword}</p>
            {(t.payload as { url?: string })?.url && (
              <a href={(t.payload as { url: string }).url} target="_blank" rel="noreferrer" className="text-xs text-primary mt-2 inline-block">fonte ↗</a>
            )}
          </GlassCard>
        ))}
        {(trends ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sem trends capturados ainda.</p>}
      </div>
    </>
  );
}
