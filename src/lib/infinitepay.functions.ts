// InfinitePay — Pix creation server function.
// Adapter is intentionally permissive: when INFINITEPAY_API_KEY is missing,
// we still create a "pending" payment row so the UI flow works end-to-end.
// Replace the fetch block with InfinitePay's official Pix endpoint once the
// API contract is shared by the user (only the request payload changes).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  kind: z.enum(["one_off", "credit_topup", "subscription"]).default("credit_topup"),
  amount_cents: z.number().int().min(100).max(10_000_000),
  description: z.string().max(140).optional(),
});

export const createPixCharge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Schema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const apiKey = process.env.INFINITEPAY_API_KEY;
    let pix_qr_code: string | null = null;
    let pix_copy_paste: string | null = null;
    let external_id: string | null = null;
    let payload: Record<string, unknown> = { description: data.description ?? "" };

    if (apiKey) {
      try {
        const res = await fetch("https://api.infinitepay.io/v1/charges", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "pix",
            amount: data.amount_cents,
            currency: "BRL",
            description: data.description ?? "Portal Matrix",
            metadata: { user_id: userId, kind: data.kind },
          }),
        });
        const j = await res.json().catch(() => ({}));
        payload = { ...payload, infinitepay_response: j, http_status: res.status };
        if (res.ok) {
          external_id = (j.id as string) ?? null;
          pix_qr_code = (j.pix?.qr_code_image ?? j.qr_code_image ?? null) as string | null;
          pix_copy_paste = (j.pix?.qr_code ?? j.qr_code ?? null) as string | null;
        }
      } catch (err) {
        payload = { ...payload, error: err instanceof Error ? err.message : String(err) };
      }
    }

    const { data: row, error } = await supabaseAdmin.from("payments").insert({
      user_id: userId,
      kind: data.kind,
      amount_cents: data.amount_cents,
      currency: "BRL",
      provider: "infinitepay",
      status: "pending",
      external_id,
      pix_qr_code,
      pix_copy_paste,
      payload,
    }).select().single();

    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, payment: row, awaiting_api_key: !apiKey };
  });

export const listMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("payments").select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(20);
    return data ?? [];
  });
