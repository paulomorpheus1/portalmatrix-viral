import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login · Portal Matrix Viral" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Bem-vindo ao Matrix");

    void nav({ to: "/app" });
  };

  const onGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          "https://portalmatrix-viral.paulormorpheus21.workers.dev/app",
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 matrix-grid">
      <form
        onSubmit={onSubmit}
        className="glass rounded-xl p-8 w-full max-w-sm space-y-4"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold neon-text">Entrar</h1>

          <p className="text-xs text-muted-foreground mt-1">
            Acesse o Portal Matrix
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogle}
        >
          Continuar com Google
        </Button>

        <div className="relative text-center text-xs text-muted-foreground">
          <span className="bg-card px-2 relative z-10">ou</span>

          <div className="absolute inset-0 top-1/2 border-t border-border" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>

          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full neon-border"
          disabled={loading}
          style={{
            background: "var(--gradient-primary)",
          }}
        >
          {loading ? "Entrando…" : "Entrar"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Sem conta?{" "}
          <Link to="/signup" className="text-accent">
            Criar agora
          </Link>
        </p>
      </form>
    </div>
  );
}
