import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = () => {
  return <Signup />;
};

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const verificarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || window.location.hash.includes("access_token")) {
        navigate({ to: "/app" });
      }
    };

    verificarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || session) {
        navigate({ to: "/app" });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/signup",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Erro OAuth Google no cadastro:", error.message);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
      });
      if (error) throw error;
      alert("Cadastro realizado! Verifique seu e-mail para confirmação.");
      navigate({ to: "/login" });
    } catch (error: any) {
      alert("Erro no cadastro: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 matrix-grid opacity-30" />
      <div className="glass rounded-xl p-8 max-w-md w-full relative z-10 neon-border">
        <h2 className="text-2xl font-bold text-center mb-6 neon-text">Criar Conta</h2>
        <p className="text-xs text-center text-muted-foreground mb-4">Cadastre-se no Portal Matrix</p>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full mb-6" 
          onClick={handleGoogleSignup}
        >
          Cadastrar com Google
        </Button>

        <div className="relative mb-6 text-center text-xs uppercase text-muted-foreground">
          <span className="bg-background px-2">ou</span>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="text-sm block mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-background/50 border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full bg-background/50 border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full neon-border" disabled={carregando}>
            {carregando ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>

        <p className="text-xs text-center mt-6 text-muted-foreground">
          Já tem uma conta? <Link to="/login" className="text-accent underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
