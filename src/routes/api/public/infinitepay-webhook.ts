// InfinitePay webhook receiver. Signature verification is enforced when
// INFINITEPAY_WEBHOOK_SECRET is set. The handler is idempotent on external_id.
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/infinitepay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const signature = request.headers.get("x-infinitepay-signature") ?? request.headers.get("x-signature");
        const secret = process.env.INFINITEPAY_WEBHOOK_SECRET;

        let signatureOk: boolean | null = null;
        if (secret) {
          const expected = createHmac("sha256", secret).update(body).digest("hex");
          try {
            signatureOk = !!signature && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
          } catch { signatureOk = false; }
          if (!signatureOk) {
            await supabaseAdmin.from("webhook_logs").insert({
              source: "infinitepay", event: "invalid_signature", payload: {}, signature_ok: false,
            });
            return new Response("Invalid signature", { status: 401 });
          }
        }

        let payload: Record<string, unknown> = {};
        try { payload = JSON.parse(body); } catch { /* keep empty */ }
        const event = (payload.event ?? payload.type ?? "unknown") as string;
        const externalId = (payload.id ?? (payload.data as { id?: string })?.id ?? null) as string | null;
        const statusRaw = String((payload.status ?? (payload.data as { status?: string })?.status ?? "pending")).toLowerCase();
        const status =
          statusRaw === "paid" || statusRaw === "succeeded" ? "succeeded"
          : statusRaw === "failed" || statusRaw === "canceled" ? "failed"
          : statusRaw === "refunded" ? "refunded"
          : "pending";

        if (externalId) {
          const { data: pay } = await supabaseAdmin
            .from("payments").select("*").eq("external_id", externalId).maybeSingle();
          if (pay) {
            await supabaseAdmin.from("payments")
              .update({ status, payload: { ...((pay.payload as object) ?? {}), last_event: event } })
              .eq("id", pay.id);
            if (status === "succeeded" && pay.user_id && pay.kind === "credit_topup") {
              const credits = Math.floor(pay.amount_cents / 10); // R$0,10 = 1 crédito
              const { data: wallet } = await supabaseAdmin.from("credits_wallet")
                .select("*").eq("user_id", pay.user_id).maybeSingle();
              if (wallet) {
                await supabaseAdmin.from("credits_wallet").update({
                  balance: wallet.balance + credits,
                  lifetime_earned: wallet.lifetime_earned + credits,
                }).eq("user_id", pay.user_id);
              }
              await supabaseAdmin.from("credit_transactions").insert({
                user_id: pay.user_id, amount: credits, reason: "infinitepay_topup",
                ref_kind: "payment", ref_id: pay.id,
              });
            }
          }
        }

        await supabaseAdmin.from("webhook_logs").insert({
          source: "infinitepay", event, payload: payload as object,
          signature_ok: signatureOk, processed_at: new Date().toISOString(),
        });

        return new Response(JSON.stringify({ ok: true }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
