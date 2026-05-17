import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Radar, Share2, ShieldCheck, Zap, Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Matrix Viral — Infraestrutura autônoma de crescimento" },
      { name: "description", content: "Crie, distribua e cresça em escala com IA, gamificação, afiliados e InfinitePay. Modular, capability-based, provider-agnostic." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Bot, title: "Jarvis Core", desc: "AI Router multi-provider com fallback, governance e explainability." },
  { icon: Sparkles, title: "Content Factory", desc: "Hooks, scripts, thumbs, reels, VSL — geração end-to-end." },
  { icon: Radar, title: "Trend Radar", desc: "Tavily + Exa para detectar tendências antes da curva." },
  { icon: Share2, title: "Distribution Engine", desc: "TikTok, IG, YT, X, Threads, Kwai — OAuth + scheduler." },
  { icon: ShieldCheck, title: "Policy Intelligence", desc: "Compliance adaptativo por plataforma, em tempo real." },
  { icon: Zap, title: "Affiliate + Gamificação", desc: "Post-to-earn, refer-to-earn, payout via InfinitePay." },
];

function Landing() {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Erro na autenticação:", error.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 matrix-grid opacity-30" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-radial)" }} />
      <header className="relative z-10 mx-auto max-w-7xl flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md neon-border" style={{ background: "var(--gradient-primary)" }} />
          <span className="font-bold tracking-tight">PORTAL MATRIX</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
          <Button size="sm" className="neon-border" onClick={handleGoogleLogin}>
            Entrar no Matrix
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24">
        <section className="text-center max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Viral OS · Capability-based · Provider-agnostic</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold tracking-tight">
            <span className="neon-text">Portal Matrix</span> <br />
            <span>Viral</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Infraestrutura autônoma de criação, distribuição e crescimento. Boots free,
            escala premium ativando capabilities. InfinitePay integrado.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" className="neon-border" style={{ background: "var(--gradient-primary)" }} onClick={handleGoogleLogin}>
              Ativar Matrix
            </Button>
            <Link to="/app"><Button size="lg" variant="outline">Acessar Command Center</Button></Link>
          </div>
        </section>

        <section className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-xl p-6">
              <f.icon className="size-6 text-accent" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
