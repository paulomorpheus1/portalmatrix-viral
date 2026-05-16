// Concrete provider adapters. Add new providers here by registering them.
// All adapters expect process.env access (server-only).
import { registerProvider, type CapabilityHandler } from "./registry";

type ChatInput = {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
};

async function openAICompatibleChat(baseUrl: string, apiKey: string, defaultModel: string): Promise<CapabilityHandler> {
  return async (input, ctx) => {
    const body = input as ChatInput;
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model ?? defaultModel,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 1024,
      }),
      signal: ctx.signal,
    });
    if (!res.ok) throw new Error(`${ctx.providerSlug} ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      data: { content: json.choices?.[0]?.message?.content ?? "" },
      tokens_in: json.usage?.prompt_tokens,
      tokens_out: json.usage?.completion_tokens,
      raw: json,
    };
  };
}

// --- Lovable AI Gateway (always available)
registerProvider({
  slug: "lovable-ai",
  name: "Lovable AI Gateway",
  kind: "llm",
  requiredSecrets: ["LOVABLE_API_KEY"],
  capabilities: {
    "text.generate": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://ai.gateway.lovable.dev/v1",
        process.env.LOVABLE_API_KEY!,
        "google/gemini-3-flash-preview",
      );
      return handler(input, ctx);
    },
    "text.chat": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://ai.gateway.lovable.dev/v1",
        process.env.LOVABLE_API_KEY!,
        "google/gemini-3-flash-preview",
      );
      return handler(input, ctx);
    },
    "text.hook": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://ai.gateway.lovable.dev/v1",
        process.env.LOVABLE_API_KEY!,
        "google/gemini-3-flash-preview",
      );
      return handler(input, ctx);
    },
    "text.script": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://ai.gateway.lovable.dev/v1",
        process.env.LOVABLE_API_KEY!,
        "openai/gpt-5-mini",
      );
      return handler(input, ctx);
    },
    "text.cta": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://ai.gateway.lovable.dev/v1",
        process.env.LOVABLE_API_KEY!,
        "google/gemini-3-flash-preview",
      );
      return handler(input, ctx);
    },
  },
});

// --- Groq
registerProvider({
  slug: "groq",
  name: "Groq",
  kind: "llm",
  requiredSecrets: ["GROQ_API_KEY"],
  capabilities: {
    "text.generate": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://api.groq.com/openai/v1",
        process.env.GROQ_API_KEY!,
        "llama-3.3-70b-versatile",
      );
      return handler(input, ctx);
    },
    "text.chat": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://api.groq.com/openai/v1",
        process.env.GROQ_API_KEY!,
        "llama-3.3-70b-versatile",
      );
      return handler(input, ctx);
    },
    "text.hook": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://api.groq.com/openai/v1",
        process.env.GROQ_API_KEY!,
        "llama-3.3-70b-versatile",
      );
      return handler(input, ctx);
    },
    "text.cta": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://api.groq.com/openai/v1",
        process.env.GROQ_API_KEY!,
        "llama-3.3-70b-versatile",
      );
      return handler(input, ctx);
    },
  },
});

// --- OpenRouter
registerProvider({
  slug: "openrouter",
  name: "OpenRouter",
  kind: "llm",
  requiredSecrets: ["OPENROUTER_API_KEY"],
  capabilities: {
    "text.generate": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://openrouter.ai/api/v1",
        process.env.OPENROUTER_API_KEY!,
        "meta-llama/llama-3.3-70b-instruct",
      );
      return handler(input, ctx);
    },
    "text.script": async (input, ctx) => {
      const handler = await openAICompatibleChat(
        "https://openrouter.ai/api/v1",
        process.env.OPENROUTER_API_KEY!,
        "anthropic/claude-3.5-sonnet",
      );
      return handler(input, ctx);
    },
  },
});

// --- Pollinations (no key required, image)
registerProvider({
  slug: "pollinations",
  name: "Pollinations",
  kind: "image",
  requiredSecrets: [],
  capabilities: {
    "image.generate": async (input) => {
      const { prompt, width = 1024, height = 1024, seed } = input as {
        prompt: string; width?: number; height?: number; seed?: number;
      };
      const u = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
      u.searchParams.set("width", String(width));
      u.searchParams.set("height", String(height));
      u.searchParams.set("nologo", "true");
      if (seed) u.searchParams.set("seed", String(seed));
      return { data: { url: u.toString() } };
    },
    "image.thumbnail": async (input) => {
      const { prompt } = input as { prompt: string };
      const u = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", high contrast youtube thumbnail, bold, vivid")}`);
      u.searchParams.set("width", "1280");
      u.searchParams.set("height", "720");
      u.searchParams.set("nologo", "true");
      return { data: { url: u.toString() } };
    },
  },
});

// --- HuggingFace (placeholder for future text-generation-inference calls)
registerProvider({
  slug: "huggingface",
  name: "HuggingFace",
  kind: "llm",
  requiredSecrets: ["HUGGINGFACE_API_KEY"],
  capabilities: {
    "text.generate": async (input, ctx) => {
      const { messages, model = "meta-llama/Llama-3.3-70B-Instruct" } = input as ChatInput;
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messages, model, max_tokens: 1024 }),
        signal: ctx.signal,
      });
      if (!res.ok) throw new Error(`hf ${res.status}: ${await res.text()}`);
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return { data: { content: json.choices?.[0]?.message?.content ?? "" }, raw: json };
    },
  },
});

// Stubs for activation-ready providers (OpenAI, Anthropic, Gemini direct).
// These follow the OpenAI-compatible shape; activate by adding their secret.
for (const [slug, base, secret, model] of [
  ["openai", "https://api.openai.com/v1", "OPENAI_API_KEY", "gpt-4o-mini"],
  ["anthropic", "https://api.anthropic.com/v1", "ANTHROPIC_API_KEY", "claude-3-5-haiku-20241022"],
] as const) {
  registerProvider({
    slug,
    name: slug,
    kind: "llm",
    requiredSecrets: [secret],
    capabilities: {
      "text.generate": async (input, ctx) => {
        const handler = await openAICompatibleChat(base, process.env[secret]!, model);
        return handler(input, ctx);
      },
    },
  });
}
