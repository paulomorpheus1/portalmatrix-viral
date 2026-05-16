import { queryJarvis } from "./client";

export async function runJarvisTask(input: {
  prompt: string;
  module?: string;
  type?: "content" | "image" | "video" | "strategy";
}) {
  const response = await queryJarvis({
    query: input.prompt,
    module: input.module || "saas",
    source: "viral-saas",
  });

  const context = response?.jarvis_context;

  if (!context) {
    throw new Error("No context returned from Jarvis");
  }

  return {
    raw: response,
    memory: context.memory,
    state: context.state,
    module: context.module,

    // 🔥 isso aqui vira base para IA do SaaS
    intelligence: {
      query: context.user_query,
      strategy_hint: context.memory?.[0]?.content || null,
      system_state: context.state,
    },
  };
}
