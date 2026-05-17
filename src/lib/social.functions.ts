// Social distribution adapters — all read tokens from process.env.
// Each adapter is a no-op stub when the corresponding secret is missing,
// so the UI keeps working before keys are added.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Platform =
  | "tiktok" | "instagram" | "facebook" | "threads" | "x"
  | "youtube" | "kwai" | "discord" | "telegram";

type PostInput = { text: string; media_url?: string };
type PostResult = { ok: true; external_id: string } | { ok: false; error: string };

async function postTelegram({ text }: PostInput): Promise<PostResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return { ok: false, error: "TELEGRAM_BOT_TOKEN/CHAT_ID ausentes" };
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
  });
  const json = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string };
  if (!json.ok) return { ok: false, error: json.description ?? `tg ${res.status}` };
  return { ok: true, external_id: String(json.result!.message_id) };
}

async function postTwitter({ text }: PostInput): Promise<PostResult> {
  const bearer = process.env.TWITTER_BEARER_TOKEN;
  if (!bearer) return { ok: false, error: "TWITTER_BEARER_TOKEN ausente" };
  // Bearer alone permits read-only — for write you need OAuth1 user context.
  // Stubbed result while user provides full creds.
  return { ok: false, error: "Twitter requer OAuth1 user-context; configure TWITTER_API_KEY/SECRET + ACCESS_TOKEN/SECRET" };
}

async function postFacebook({ text, media_url }: PostInput): Promise<PostResult> {
  const token = process.env.META_PAGE_ACCESS_TOKEN ?? process.env.META_PORTAL_HOGWARTS_TOKEN;
  const pageId = process.env.META_PAGE_ID;
  if (!token || !pageId) return { ok: false, error: "META_PAGE_ACCESS_TOKEN/PAGE_ID ausentes" };
  const endpoint = media_url
    ? `https://graph.facebook.com/v21.0/${pageId}/photos`
    : `https://graph.facebook.com/v21.0/${pageId}/feed`;
  const body = media_url
    ? { url: media_url, caption: text, access_token: token }
    : { message: text, access_token: token };
  const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!json.id) return { ok: false, error: json.error?.message ?? `fb ${res.status}` };
  return { ok: true, external_id: json.id };
}

async function postInstagram({ text, media_url }: PostInput): Promise<PostResult> {
  const token = process.env.META_PAGE_ACCESS_TOKEN ?? process.env.META_PORTAL_HOGWARTS_TOKEN;
  const igUserId = process.env.META_IG_USER_ID ?? process.env.META_PORTAL_HOGWARTS_IG_USER_ID;
  if (!token || !igUserId) return { ok: false, error: "META token / IG_USER_ID ausentes" };
  if (!media_url) return { ok: false, error: "Instagram exige media_url" };
  const c = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: media_url, caption: text, access_token: token }),
  });
  const cj = (await c.json()) as { id?: string; error?: { message?: string } };
  if (!cj.id) return { ok: false, error: cj.error?.message ?? "ig create container" };
  const p = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: cj.id, access_token: token }),
  });
  const pj = (await p.json()) as { id?: string; error?: { message?: string } };
  if (!pj.id) return { ok: false, error: pj.error?.message ?? "ig publish" };
  return { ok: true, external_id: pj.id };
}

async function postDiscord({ text }: PostInput): Promise<PostResult> {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return { ok: false, error: "DISCORD_WEBHOOK_URL ausente" };
  const res = await fetch(webhook, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text }),
  });
  if (!res.ok) return { ok: false, error: `discord ${res.status}` };
  return { ok: true, external_id: `discord-${Date.now()}` };
}

const ADAPTERS: Record<Platform, (input: PostInput) => Promise<PostResult>> = {
  telegram: postTelegram,
  x: postTwitter,
  facebook: postFacebook,
  instagram: postInstagram,
  threads: async () => ({ ok: false, error: "Threads API: pendente OAuth Meta" }),
  tiktok: async () => ({ ok: false, error: "TikTok: pendente OAuth Content Posting API" }),
  youtube: async () => ({ ok: false, error: "YouTube: pendente OAuth + upload resumable" }),
  kwai: async () => ({ ok: false, error: "Kwai: sem API pública oficial" }),
  discord: postDiscord,
};

const PostSchema = z.object({
  platform: z.enum(["tiktok","instagram","facebook","threads","x","youtube","kwai","discord","telegram"]),
  text: z.string().min(1).max(4000),
  media_url: z.string().url().optional(),
  asset_id: z.string().uuid().optional(),
  scheduled_for: z.string().datetime().optional(),
});

export const publishNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PostSchema.parse(input))
  .handler(async ({ data, context }) => {
    const adapter = ADAPTERS[data.platform];
    const result = await adapter({ text: data.text, media_url: data.media_url });
    if (data.asset_id) {
      await supabaseAdmin.from("scheduled_posts").insert({
        user_id: context.userId,
        asset_id: data.asset_id,
        account_id: data.asset_id,
        scheduled_for: new Date().toISOString(),
        status: result.ok ? "published" : "failed",
        published_at: result.ok ? new Date().toISOString() : null,
        platform_post_id: result.ok ? result.external_id : null,
        last_error: result.ok ? null : result.error,
      });
    }
    return result;
  });

export const schedulePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PostSchema.extend({ scheduled_for: z.string().datetime() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await supabaseAdmin.from("scheduled_posts").insert({
      user_id: context.userId,
      asset_id: data.asset_id ?? context.userId,
      account_id: context.userId,
      scheduled_for: data.scheduled_for,
      status: "pending",
    }).select("id").single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, id: row.id };
  });

export const listScheduled = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", context.userId)
      .order("scheduled_for", { ascending: false })
      .limit(50);
    return data ?? [];
  });

export const listPlatformStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const platforms: Platform[] = ["tiktok","instagram","facebook","threads","x","youtube","kwai","discord","telegram"];
    return platforms.map((p) => {
      let configured = false;
      switch (p) {
        case "telegram": configured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID); break;
        case "facebook":
        case "instagram":
        case "threads":
          configured = Boolean(process.env.META_PAGE_ACCESS_TOKEN ?? process.env.META_PORTAL_HOGWARTS_TOKEN);
          break;
        case "x": configured = Boolean(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET); break;
        case "discord": configured = Boolean(process.env.DISCORD_WEBHOOK_URL); break;
        case "tiktok": configured = Boolean(process.env.TIKTOK_CLIENT_KEY); break;
        case "youtube": configured = Boolean(process.env.YOUTUBE_CLIENT_ID); break;
        default: configured = false;
      }
      return { platform: p, configured };
    });
  });
