import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { invokeCapability } from "@/lib/ai-router.functions";

export const Route = createFileRoute("/_authenticated/app/content")({ component: Page });

function Page() {
  const invoke = useServerFn(invokeCapability);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (capability: string) => {
    setLoading(true); setOutput("");
    const r = await invoke({ data: { capability, input: { messages: [{ role: "user", content: prompt }] } } });
    setLoading(false);
    if (!r.ok) return toast.error(r.error);
    const content = (r.data as { content?: string })?.content ?? JSON.stringify(r.data);
    setOutput(content);
  };

  return (
    <>
      <PageHeader kicker="Content Factory" title="Geração de conteúdo viral" />
      <GlassCard>
        <Textarea rows={5} placeholder="Descreva o tema ou nicho…" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => run("text.hook")} disabled={loading || !prompt}>Gerar Hook</Button>
          <Button onClick={() => run("text.script")} disabled={loading || !prompt} variant="outline">Gerar Roteiro</Button>
          <Button onClick={() => run("text.cta")} disabled={loading || !prompt} variant="outline">Gerar CTA</Button>
          <Button onClick={() => run("text.generate")} disabled={loading || !prompt} variant="outline">Texto livre</Button>
        </div>
        {output && <pre className="mt-4 p-4 rounded-md bg-muted text-sm whitespace-pre-wrap">{output}</pre>}
      </GlassCard>
    </>
  );
}
