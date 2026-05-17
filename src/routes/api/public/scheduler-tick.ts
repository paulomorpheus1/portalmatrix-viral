// Cron-friendly endpoint: processes due scheduled_posts.
// Call this from external cron (cron-job.org, Upstash Schedule) every minute.
// Secure with SCHEDULER_SECRET header.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/scheduler-tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.SCHEDULER_SECRET;
        if (secret && request.headers.get("x-scheduler-secret") !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { data: due } = await supabaseAdmin
          .from("scheduled_posts")
          .select("*")
          .eq("status", "pending")
          .lte("scheduled_for", new Date().toISOString())
          .limit(20);

        const processed: Array<{ id: string; status: string }> = [];
        for (const post of due ?? []) {
          // Without per-account selection wired, mark as failed-needs-config.
          // The publish adapters live in social.functions.ts and require user
          // context; the tick simply flags overdue items.
          await supabaseAdmin.from("scheduled_posts")
            .update({ status: "failed", last_error: "scheduler-tick: integrar worker dedicado", attempts: (post.attempts ?? 0) + 1 })
            .eq("id", post.id);
          processed.push({ id: post.id, status: "failed" });
        }
        return Response.json({ ok: true, processed });
      },
      GET: async () => Response.json({ ok: true, message: "POST to trigger" }),
    },
  },
});
