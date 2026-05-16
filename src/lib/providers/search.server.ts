// Search providers (Tavily, Exa) — power trend & policy intel.
import { registerProvider } from "./registry";

registerProvider({
  slug: "tavily",
  name: "Tavily",
  kind: "search",
  requiredSecrets: ["TAVILY_API_KEY"],
  capabilities: {
    "search.trend": async (input) => {
      const { query, max_results = 10 } = input as { query: string; max_results?: number };
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query, max_results, search_depth: "advanced", topic: "general",
        }),
      });
      if (!res.ok) throw new Error(`tavily ${res.status}: ${await res.text()}`);
      const json = await res.json() as { results?: Array<{ title: string; url: string; content: string; score?: number }> };
      return { data: { results: json.results ?? [] } };
    },
    "search.policy": async (input) => {
      const { query, max_results = 8 } = input as { query: string; max_results?: number };
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `${query} community guidelines policy enforcement`,
          max_results, search_depth: "advanced",
        }),
      });
      if (!res.ok) throw new Error(`tavily ${res.status}: ${await res.text()}`);
      return { data: { results: (await res.json()).results ?? [] } };
    },
  },
});

registerProvider({
  slug: "exa",
  name: "Exa",
  kind: "search",
  requiredSecrets: ["EXA_API_KEY"],
  capabilities: {
    "search.trend": async (input) => {
      const { query, max_results = 10 } = input as { query: string; max_results?: number };
      const res = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.EXA_API_KEY! },
        body: JSON.stringify({ query, numResults: max_results, useAutoprompt: true }),
      });
      if (!res.ok) throw new Error(`exa ${res.status}: ${await res.text()}`);
      const json = await res.json() as { results?: Array<{ title: string; url: string; text?: string }> };
      return { data: { results: json.results ?? [] } };
    },
    "search.policy": async (input) => {
      const { query } = input as { query: string };
      const res = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.EXA_API_KEY! },
        body: JSON.stringify({ query: `${query} platform policy`, numResults: 8 }),
      });
      if (!res.ok) throw new Error(`exa ${res.status}: ${await res.text()}`);
      return { data: { results: (await res.json()).results ?? [] } };
    },
  },
});
