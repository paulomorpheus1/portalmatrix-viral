// Provider Capability Registry — single source of truth for AI routing.
// New providers register themselves here; the AI Router uses capability +
// fallback chain to pick a healthy provider at call time.

export type CapabilityKind = "llm" | "image" | "video" | "audio" | "search" | "social" | "payment" | "storage";

export interface ProviderAdapter {
  slug: string;
  name: string;
  kind: CapabilityKind;
  /** Names of env secrets required for this provider to be "active". */
  requiredSecrets: string[];
  /** Hit a cheap endpoint to check availability. Returns true if healthy. */
  healthcheck?: () => Promise<boolean>;
  /** Capabilities this adapter implements with concrete callable handlers. */
  capabilities: Partial<Record<string, CapabilityHandler>>;
}

export type CapabilityHandler = (input: unknown, ctx: ProviderCallContext) => Promise<CapabilityResult>;

export interface ProviderCallContext {
  userId?: string;
  capabilitySlug: string;
  providerSlug: string;
  signal?: AbortSignal;
}

export interface CapabilityResult {
  data: unknown;
  tokens_in?: number;
  tokens_out?: number;
  cost_cents?: number;
  raw?: unknown;
}

const adapters = new Map<string, ProviderAdapter>();

export function registerProvider(adapter: ProviderAdapter) {
  adapters.set(adapter.slug, adapter);
}

export function getProvider(slug: string): ProviderAdapter | undefined {
  return adapters.get(slug);
}

export function listProviders(): ProviderAdapter[] {
  return Array.from(adapters.values());
}

export function providerIsConfigured(slug: string): boolean {
  const a = adapters.get(slug);
  if (!a) return false;
  return a.requiredSecrets.every((s) => Boolean(process.env[s]));
}
