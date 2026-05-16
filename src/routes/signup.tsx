import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta · Portal Matrix Viral" }] }),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name }, emailRedirectTo: window.location.origin + "/app" },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Entrando no Matrix…");
    void nav({ to: "/app" });
  };

  const onGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (r.error) toast.error(r.error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 matrix-grid">
      <form onSubmit={onSubmit} className="glass rounded-xl p-8 w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold neon-text">Criar conta</h1>
          <p className="text-xs text-muted-foreground mt-1">Ative seu Portal Matrix Viral</p>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={onGoogle}>Continuar com Google</Button>
        <div className="relative text-center text-xs text-muted-foreground"><span className="bg-card px-2 relative z-10">ou</span><div className="absolute inset-0 top-1/2 border-t border-border" /></div>
        <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full neon-border" disabled={loading} style={{ background: "var(--gradient-primary)" }}>{loading ? "Criando…" : "Criar conta"}</Button>
        <p className="text-xs text-center text-muted-foreground">Já tem conta? <Link to="/login" className="text-accent">Entrar</Link></p>
      </form>
    </div>
  );
}
