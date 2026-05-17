import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { publishNow, schedulePost, listScheduled, listPlatformStatus } from "@/lib/social.functions";

export const Route = createFileRoute("/_authenticated/app/social")({ component: Page });

function Page() {
  const publish = useServerFn(publishNow);
  const schedule = useServerFn(schedulePost);
  const listSched = useServerFn(listScheduled);
  const listStatus = useServerFn(listPlatformStatus);

  const { data: status } = useQuery({ queryKey: ["plat-status"], queryFn: () => listStatus() });
  const { data: scheduled, refetch } = useQuery({ queryKey: ["scheduled"], queryFn: () => listSched() });

  const [platform, setPlatform] = useState<string>("telegram");
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text) return;
    setBusy(true);
    const payload = { platform: platform as never, text, media_url: mediaUrl || undefined };
    const r = (when
      ? await schedule({ data: { ...payload, scheduled_for: new Date(when).toISOString() } })
      : await publish({ data: payload })) as { ok: boolean; error?: string };
    setBusy(false);
    if (!r.ok) toast.error(r.error ?? "Falha");
    else { toast.success(when ? "Agendado" : "Publicado"); setText(""); setMediaUrl(""); setWhen(""); void refetch(); }
  };

  return (
    <>
      <PageHeader kicker="Distribution" title="Social Distribution Engine" />

      <GlassCard className="mb-4">
        <p className="text-sm font-semibold mb-2">Status das plataformas</p>
        <div className="flex flex-wrap gap-2">
          {(status ?? []).map((s) => (
            <Badge key={s.platform} variant={s.configured ? "default" : "outline"} className="capitalize">
              {s.platform} {s.configured ? "·" : "·"} {s.configured ? "ativo" : "pendente"}
            </Badge>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mb-4">
        <p className="text-sm font-semibold mb-3">Publicar / Agendar</p>
        <div className="grid sm:grid-cols-3 gap-2 mb-2">
          <select className="bg-background border border-border rounded-md px-3 py-2 text-sm"
            value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {(status ?? []).map((s) => <option key={s.platform} value={s.platform}>{s.platform}</option>)}
          </select>
          <Input placeholder="media url (opcional)" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
          <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <Textarea rows={4} placeholder="Conteúdo da postagem" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mt-3 flex gap-2">
          <Button onClick={() => void send()} disabled={busy || !text}>{when ? "Agendar" : "Publicar agora"}</Button>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-sm font-semibold mb-2">Agenda recente</p>
        {(scheduled ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nada agendado.</p>}
        <div className="space-y-2">
          {(scheduled ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-border/50 pb-2 text-sm">
              <div>
                <p className="font-medium">{new Date(p.scheduled_for).toLocaleString("pt-BR")}</p>
                {p.last_error && <p className="text-xs text-destructive">{p.last_error}</p>}
              </div>
              <Badge variant="outline">{p.status}</Badge>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}
