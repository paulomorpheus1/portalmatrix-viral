import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginRouteComponent,
});

function LoginRouteComponent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    // Escuta ativa para capturar o token do Google e injetar na rota privada
    const verificarSessaoInicial = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || window.location.hash.includes("access_token")) {
        navigate({ to: "/app" });
      }
    };

    verificarSessaoInicial();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || session) {
        navigate({ to: "/app" });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/login",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Erro OAuth Google:", error.message);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) throw error;
      navigate({ to: "/app" });
    } catch (error: any) {
      alert("Erro na autenticação: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 matrix-grid opacity-30" />
      <div className="glass rounded-xl p-8 max-w-md w-full relative z-10 neon-border border border-muted" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
        <h2 className="text-2xl font-bold text-center mb-6 neon-text">PORTAL MATRIX</h2>
        <p className="text-xs text-center text-muted-foreground mb-6">Autenticação do Ecossistema Operacional</p>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full mb-6 py-5 font-medium transition-all hover:bg-muted text-foreground border-muted" 
          onClick={handleGoogleLogin}
        >
          Continuar com Google
        </Button>

        <div className="relative mb-6 text-center text-xs uppercase text-muted-foreground">
          <span className="bg-background px-2 relative z-10">ou credenciais</span>
          <div className="absolute w-full h-[1px] bg-muted top-1/2 left-0 z-0" />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1 text-muted-foreground">E-mail Corporativo</label>
            <input 
              type="email" 
              className="w-full bg-background/50 border border-muted rounded p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1 text-muted-foreground">Senha de Acesso</label>
            <input 
              type="password" 
              className="w-full bg-background/50 border border-muted rounded p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full py-5 neon-border font-medium" disabled={carregando}>
            {carregando ? "Sincronizando..." : "Conectar Infraestrutura"}
          </Button>
        </form>

        <p className="text-xs text-center mt-6 text-muted-foreground">
          Novo no ecossistema? <Link to="/signup" className="text-accent underline hover:text-accent/80">Criar credenciais</Link>
        </p>
      </div>
    </div>
  );
}
