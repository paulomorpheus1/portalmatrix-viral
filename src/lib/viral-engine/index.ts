import { runJarvisTask } from "../jarvis/adapter";

export async function generateViralContent(input: {
  topic: string;
  platform?: "tiktok" | "instagram" | "youtube" | "kwai" | "x";
}) {
  // 1. PEDIR ESTRATÉGIA AO JARVIS
  const jarvis = await runJarvisTask({
    prompt: `
Crie um conteúdo viral sobre: ${input.topic}

Inclua:
- hook forte (primeiros 3 segundos)
- roteiro curto
- CTA de engajamento
- estilo adaptado para ${input.platform || "multi-platform"}
    `,
    module: "viral_engine",
  });

  const strategy = jarvis.intelligence.strategy_hint;

  // 2. ESTRUTURAR OUTPUT
  return {
    topic: input.topic,
    platform: input.platform || "multi",

    script: strategy || jarvis.raw.jarvis_context?.memory?.[0]?.content,

    hooks: {
      primary: "HOOK gerado pelo Jarvis",
    },

    cta: "Gerado pelo sistema Jarvis",

    distribution: {
      tiktok: true,
      instagram: true,
      youtube: true,
      kwai: true,
      x: true,
    },

    raw: jarvis,
  };
}
