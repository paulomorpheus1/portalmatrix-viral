import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeCapability } from "@/lib/ai-router.functions";

export const Route = createFileRoute("/_authenticated/app/jarvis")({ component: Page });

type Msg = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM = `Você é Jarvis, o copiloto operacional do Portal Matrix Viral.
Tom: técnico, direto, sem floreios. Responda em português.
Atue como estrategista de growth e content ops.`;

function Page() {
  const invoke = useServerFn(invokeCapability);
  const [messages, setMessages] = useState<Msg[]>([{ role: "system", content: SYSTEM }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!draft.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: draft }];
    setMessages(next); setDraft(""); setBusy(true);
    const r = await invoke({ data: { capability: "text.chat", input: { messages: next } } });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    const content = (r.data as { content?: string })?.content ?? "";
    setMessages([...next, { role: "assistant", content }]);
  };

  const visible = messages.filter((m) => m.role !== "system");

  return (
    <>
      <PageHeader kicker="AI Core" title="Jarvis" />
      <GlassCard className="space-y-3">
        <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
          {visible.length === 0 && <p className="text-sm text-muted-foreground">Pergunte sobre estratégia, hooks, distribuição, métricas…</p>}
          {visible.map((m, i) => (
            <div key={i} className={`rounded-md p-3 text-sm ${m.role === "user" ? "bg-muted" : "neon-border bg-card/50"}`}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{m.role === "user" ? "Você" : "Jarvis"}</p>
              <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Comando para o Jarvis…"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send(); }} />
          <Button onClick={() => void send()} disabled={busy || !draft.trim()}>Enviar</Button>
        </div>
      </GlassCard>
    </>
  );
}
