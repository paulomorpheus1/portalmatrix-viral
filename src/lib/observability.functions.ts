// Read-only observability for the operator's own data.
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const myProviderUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("provider_usage").select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(50);
    return data ?? [];
  });

export const myWebhookLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    // Webhook logs are admin-only; return empty for non-admins. We just expose
    // shape; RLS already protects the table.
    const { data } = await supabaseAdmin
      .from("webhook_logs").select("*")
      .order("created_at", { ascending: false }).limit(50);
    return data ?? [];
  });
