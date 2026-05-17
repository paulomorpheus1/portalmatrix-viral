import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Busca a sessão em tempo real direto na memória do cliente Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // Verifica se o usuário não está autenticado e se não há token de retorno na URL
    const temTokenNaUrl = location.href.includes("access_token") || window.location.hash.includes("access_token");

    if (!session && !temTokenNaUrl) {
      // Se não estiver logado e não for retorno do Google, joga direto para a tela de login
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}
